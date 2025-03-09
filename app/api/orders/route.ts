import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db-connect"
import Order from "@/models/Order"
import { getUserFromToken } from "@/lib/auth-utils"

export async function GET() {
  try {
    await dbConnect()

    const orders = await Order.find({}).sort({ createdAt: -1 })

    return NextResponse.json(orders)
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = getUserFromToken(request)

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    await dbConnect()

    const { products, name, table_number, total, status } = await request.json()

    // Validate input
    if (!products || !products.length || !name || !table_number || total === undefined) {
      return NextResponse.json({ error: "Products, name, table number, and total are required" }, { status: 400 })
    }

    // Create new order
    const order = await Order.create({
      products,
      name,
      table_number,
      total,
      status: status || "pending",
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}

