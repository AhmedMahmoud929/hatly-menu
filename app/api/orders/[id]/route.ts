import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db-connect";
import Order from "@/models/Order";
import { getUserFromToken } from "@/lib/auth-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const order = await Order.findById(params.id);

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
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const user = await getUserFromToken();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await dbConnect();

    const { products, name, table_number, total, status } =
      await request.json();

    // Validate input
    if ((!products || !products.length) && !status) {
      return NextResponse.json(
        { error: "At least products or status must be provided" },
        { status: 400 }
      );
    }

    // Update order
    const updateData: any = {};

    if (products && products.length) {
      updateData.products = products;
    }

    if (name) {
      updateData.name = name;
    }

    if (table_number) {
      updateData.table_number = table_number;
    }

    if (total !== undefined) {
      updateData.total = total;
    }

    if (status) {
      updateData.status = status;
    }

    const order = await Order.findByIdAndUpdate(params.id, updateData, {
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
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const user = await getUserFromToken();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await dbConnect();

    const order = await Order.findByIdAndDelete(params.id);

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
