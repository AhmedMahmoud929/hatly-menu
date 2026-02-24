"use client";

import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  ClipboardList,
  Package,
  Tag,
  Users,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export type Stats = {
  totalOrders: number;
  ordersToday: number;
  totalRevenue: number;
  revenueChangePercent: number;
  categoriesCount: number;
  productsCount: number;
  ordersByStatus: {
    pending: number;
    "in-progress": number;
    completed: number;
    cancelled: number;
  };
  ordersLast7Days: { date: string; count: number; revenue: number }[];
  recentOrders: {
    _id: string;
    customerName: string;
    tableNumber: number;
    totalPrice: number;
    status: string;
    createdAt: string;
    itemCount: number;
  }[];
};

const chartConfig = {
  count: {
    label: "Orders",
    color: "hsl(var(--chart-1))",
  },
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-2))",
  },
  date: {
    label: "Date",
  },
};

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function DashboardOverview() {
  const t = useTranslations("Dashboard");
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/stats", { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch stats");
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-destructive">
          {error ?? "Failed to load dashboard stats"}
        </p>
      </div>
    );
  }

  const chartData = stats.ordersLast7Days.map((d) => ({
    date: formatShortDate(d.date),
    count: d.count,
    revenue: Math.round(d.revenue * 100) / 100,
    fullDate: d.date,
  }));

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">{t("overview")}</h1>
        <p className="text-muted-foreground">{t("welcomeBack")}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {t("ordersStat")}
            </CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              {stats.ordersToday} {t("ordersTodayLabel")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("revenue")}</CardTitle>
            <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              {stats.revenueChangePercent >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600" />
              )}
              {stats.revenueChangePercent >= 0 ? "+" : ""}
              {stats.revenueChangePercent}% {t("fromLastMonth")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {t("categoriesStat")}
            </CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.categoriesCount}</div>
            <p className="text-xs text-muted-foreground">
              {t("categoriesStat")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {t("productsStat")}
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.productsCount}</div>
            <p className="text-xs text-muted-foreground">
              {t("productsStat")}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-1 md:col-span-4">
          <CardHeader>
            <CardTitle>{t("ordersLast7Days")}</CardTitle>
            <CardDescription>{t("revenueLast7Days")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[280px] w-full">
              <BarChart data={chartData} margin={{ left: 12, right: 12 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  yAxisId="left"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(v) => String(v)}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(v) => `$${v}`}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      labelFormatter={(_, payload) =>
                        payload?.[0]?.payload?.fullDate
                          ? formatShortDate(payload[0].payload.fullDate)
                          : ""
                      }
                      formatter={(value, name) => [
                        name === "revenue" ? `$${Number(value).toFixed(2)}` : value,
                        name === "revenue" ? chartConfig.revenue.label : chartConfig.count.label,
                      ]}
                    />
                  }
                />
                <Bar
                  yAxisId="left"
                  dataKey="count"
                  fill="var(--color-count)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  yAxisId="right"
                  dataKey="revenue"
                  fill="var(--color-revenue)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-3">
          <CardHeader>
            <CardTitle>{t("ordersStat")} by status</CardTitle>
            <CardDescription>Current snapshot</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { key: "pending", label: "Pending", color: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400" },
                { key: "in-progress", label: "In progress", color: "bg-blue-500/15 text-blue-600 dark:text-blue-400" },
                { key: "completed", label: "Completed", color: "bg-green-500/15 text-green-600 dark:text-green-400" },
                { key: "cancelled", label: "Cancelled", color: "bg-red-500/15 text-red-600 dark:text-red-400" },
              ].map(({ key, label, color }) => (
                <div
                  key={key}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${color}`}>
                    {label}
                  </span>
                  <span className="font-mono font-semibold">
                    {stats.ordersByStatus[key as keyof typeof stats.ordersByStatus] ?? 0}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-1 md:col-span-4">
          <CardHeader>
            <CardTitle>{t("recentOrders")}</CardTitle>
            <CardDescription>
              {stats.ordersToday} {t("ordersTodayLabel")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t("noRecentOrders")}
                </p>
              ) : (
                stats.recentOrders.map((order) => (
                  <div
                    key={String(order._id)}
                    className="flex items-center gap-4"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                      <ClipboardList className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        #{String(order._id).slice(-6).toUpperCase()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {order.customerName} • Table {order.tableNumber} •{" "}
                        {order.itemCount} items • $
                        {order.totalPrice.toFixed(2)}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/orders?highlight=${order._id}`}>
                        {t("view")}
                      </Link>
                    </Button>
                  </div>
                ))
              )}
            </div>
            <div className="mt-4 flex justify-center">
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/orders">
                  {t("viewAllOrders")}
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-3">
          <CardHeader>
            <CardTitle>{t("quickActions")}</CardTitle>
            <CardDescription>{t("manageEfficiently")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/dashboard/orders">
                <ClipboardList className="mr-2 h-4 w-4" />
                {t("viewOrders")}
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/dashboard/categories">
                <Tag className="mr-2 h-4 w-4" />
                {t("manageCategories")}
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/dashboard/products">
                <Package className="mr-2 h-4 w-4" />
                {t("manageProducts")}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DollarSignIcon({ className }: { className?: string }) {
  return (
    <span className={`font-mono text-lg font-bold ${className}`}>$</span>
  );
}
