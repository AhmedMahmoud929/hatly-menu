import { type NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/db-connect";
import Order from "@/models/Order";
import { getUserFromToken } from "@/lib/auth-utils";

export async function GET() {
  try {
    // Check authentication
    const user = await getUserFromToken();

    if (!user)
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    await dbConnect();

    const orders = await Order.find({}).sort({ createdAt: -1 });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

/** Normalize dashboard form products (product_name, amount, price) to Order schema shape */
function normalizeProducts(
  raw: unknown
): { _id: mongoose.Types.ObjectId; name: string; quantity: number; size: string; pricePerItem: number; extras?: string[] }[] {
  if (!Array.isArray(raw) || raw.length === 0) return [];
  return raw.map((item: unknown) => {
    const row = item as Record<string, unknown>;
    const name = (row.product_name ?? row.name) as string;
    const quantity = Number(row.amount ?? row.quantity ?? 1);
    const total = Number(row.price);
    const pricePerItem = Number(row.pricePerItem ?? (quantity > 0 ? total / quantity : 0));
    return {
      _id: new mongoose.Types.ObjectId(),
      name: String(name ?? ""),
      quantity,
      size: String(row.size ?? "default"),
      pricePerItem,
      extras: Array.isArray(row.extras) ? (row.extras as string[]) : undefined,
    };
  });
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { customerName, tableNumber, totalPrice, products: rawProducts } = body;
    const products = normalizeProducts(rawProducts ?? body.products);

    if (
      !products.length ||
      !customerName ||
      !tableNumber ||
      totalPrice === undefined
    ) {
      return NextResponse.json(
        { error: "Products, customerName, tableNumber, and totalPrice are required" },
        { status: 400 }
      );
    }

    const order = await Order.create({
      products,
      customerName,
      tableNumber,
      totalPrice,
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
