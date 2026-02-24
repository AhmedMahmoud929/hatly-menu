import { NextResponse } from "next/server";
import dbConnect from "@/lib/db-connect";
import Order from "@/models/Order";
import Category from "@/models/Category";
import Product from "@/models/Product";
import { getUserFromToken } from "@/lib/auth-utils";

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}

export async function GET() {
  try {
    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await dbConnect();

    const now = new Date();
    const todayStart = startOfDay(now);
    const sevenDaysAgo = new Date(todayStart);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
      totalOrders,
      ordersToday,
      totalRevenueResult,
      revenueThisMonthResult,
      revenueLastMonthResult,
      categoriesCount,
      productsCount,
      ordersByStatusResult,
      ordersLast7DaysResult,
      recentOrders,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: todayStart } }),
      Order.aggregate<{ total: number }>([
        { $group: { _id: null, total: { $sum: "$totalPrice" } } },
      ]).then((r) => r[0]?.total ?? 0),
      Order.aggregate<{ total: number }>([
        { $match: { createdAt: { $gte: thisMonthStart } } },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } },
      ]).then((r) => r[0]?.total ?? 0),
      Order.aggregate<{ total: number }>([
        { $match: { createdAt: { $gte: lastMonthStart, $lt: thisMonthStart } } },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } },
      ]).then((r) => r[0]?.total ?? 0),
      Category.countDocuments(),
      Product.countDocuments(),
      Order.aggregate<{ _id: string; count: number }>([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Order.aggregate<{ date: string; count: number; revenue: number }>([
        { $match: { createdAt: { $gte: sevenDaysAgo } } },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            count: { $sum: 1 },
            revenue: { $sum: "$totalPrice" },
          },
        },
        { $sort: { _id: 1 } },
        {
          $project: {
            date: "$_id",
            count: 1,
            revenue: 1,
            _id: 0,
          },
        },
      ]),
      Order.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .lean()
        .select("_id customerName tableNumber totalPrice status createdAt products"),
    ]);

    const totalRevenue =
      typeof totalRevenueResult === "number"
        ? totalRevenueResult
        : (totalRevenueResult as unknown as { total?: number })?.total ?? 0;
    const revenueThisMonth =
      typeof revenueThisMonthResult === "number"
        ? revenueThisMonthResult
        : (revenueThisMonthResult as unknown as { total?: number })?.total ?? 0;
    const revenueLastMonth =
      typeof revenueLastMonthResult === "number"
        ? revenueLastMonthResult
        : (revenueLastMonthResult as unknown as { total?: number })?.total ?? 0;

    const revenueChangePercent =
      revenueLastMonth > 0
        ? Math.round(
            ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100
          )
        : revenueThisMonth > 0
          ? 100
          : 0;

    const ordersByStatus = (ordersByStatusResult || []).reduce(
      (acc, { _id, count }) => {
        acc[_id] = count;
        return acc;
      },
      {} as Record<string, number>
    );

    const last7DaysMap = new Map(
      (ordersLast7DaysResult || []).map((r) => [r.date, { count: r.count, revenue: r.revenue }])
    );
    const ordersLast7Days: { date: string; count: number; revenue: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(todayStart);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const row = last7DaysMap.get(dateStr) ?? { count: 0, revenue: 0 };
      ordersLast7Days.push({
        date: dateStr,
        count: row.count,
        revenue: row.revenue,
      });
    }

    return NextResponse.json({
      totalOrders,
      ordersToday,
      totalRevenue,
      revenueThisMonth,
      revenueLastMonth,
      revenueChangePercent,
      categoriesCount,
      productsCount,
      ordersByStatus: {
        pending: ordersByStatus.pending ?? 0,
        "in-progress": ordersByStatus["in-progress"] ?? 0,
        completed: ordersByStatus.completed ?? 0,
        cancelled: ordersByStatus.cancelled ?? 0,
      },
      ordersLast7Days,
      recentOrders: recentOrders.map((o) => {
        const doc = o as {
          _id: unknown;
          customerName: string;
          tableNumber: number;
          totalPrice: number;
          status: string;
          createdAt: Date;
          products: { quantity?: number }[];
        };
        return {
          _id: String(doc._id),
          customerName: doc.customerName,
          tableNumber: doc.tableNumber,
          totalPrice: doc.totalPrice,
          status: doc.status,
          createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : String(doc.createdAt),
          itemCount: (doc.products ?? []).reduce((sum, p) => sum + (p.quantity ?? 0), 0),
        };
      }),
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
