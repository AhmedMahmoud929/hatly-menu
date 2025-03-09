import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db-connect"
import Product from "@/models/Product"
import { getUserFromToken } from "@/lib/auth-utils"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    const product = await Product.findById(params.id)

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check authentication
    const user = getUserFromToken(request)

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    await dbConnect()

    const { name, category, description, rating, price, is_available, total_order, extras, image } =
      await request.json()

    // Validate input
    if (!name || !category || !description || !price) {
      return NextResponse.json({ error: "Name, category, description, and price are required" }, { status: 400 })
    }

    // Update product
    const product = await Product.findByIdAndUpdate(
      params.id,
      {
        name,
        category,
        description,
        rating,
        price,
        is_available,
        total_order,
        extras,
        image,
      },
      { new: true, runValidators: true },
    )

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check authentication
    const user = getUserFromToken(request)

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    await dbConnect()

    const product = await Product.findByIdAndDelete(params.id)

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Product deleted successfully" })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}

