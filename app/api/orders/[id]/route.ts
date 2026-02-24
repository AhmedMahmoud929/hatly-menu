import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db-connect";
import Order from "@/models/Order";
import { getUserFromToken } from "@/lib/auth-utils";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;
    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;
    const { products, customerName, tableNumber, totalPrice, status } =
      await request.json();

    if ((!products || !products.length) && !status) {
      return NextResponse.json(
        { error: "At least products or status must be provided" },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (products && products.length) {
      updateData.products = products;
    }
    if (customerName !== undefined) {
      updateData.customerName = customerName;
    }
    if (tableNumber !== undefined) {
      updateData.tableNumber = tableNumber;
    }
    if (totalPrice !== undefined) {
      updateData.totalPrice = totalPrice;
    }
    if (status) {
      updateData.status = status;
    }

    const order = await Order.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;
    const order = await Order.findByIdAndDelete(id);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting order:", error);
    return NextResponse.json(
      { error: "Failed to delete order" },
      { status: 500 }
    );
  }
}
