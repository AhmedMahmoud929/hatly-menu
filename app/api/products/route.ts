import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db-connect"
import Product from "@/models/Product"
import { getUserFromToken } from "@/lib/auth-utils"

export async function GET() {
  try {
    await dbConnect()

    const products = await Product.find({}).sort({ createdAt: -1 })

    return NextResponse.json(products)
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
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

    const { name, category, description, rating, price, is_available, total_order, extras, image } =
      await request.json()

    // Validate input
    if (!name || !category || !description || !price) {
      return NextResponse.json({ error: "Name, category, description, and price are required" }, { status: 400 })
    }

    // Create new product
    const product = await Product.create({
      name,
      category,
      description,
      rating: rating || 0,
      price,
      is_available: is_available !== undefined ? is_available : true,
      total_order: total_order || 0,
      extras: extras || "",
      image: image || "/placeholder.svg?height=80&width=80",
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}

