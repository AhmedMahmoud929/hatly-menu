import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db-connect"
import Category from "@/models/Category"
import { getUserFromToken } from "@/lib/auth-utils"

export async function GET() {
  try {
    await dbConnect()

    const categories = await Category.find({}).sort({ createdAt: -1 })

    return NextResponse.json(categories)
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
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

    const { name, image } = await request.json()

    // Validate input
    if (!name || !image) {
      return NextResponse.json({ error: "Name and image are required" }, { status: 400 })
    }

    // Create new category
    const category = await Category.create({
      name,
      image,
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error: any) {
    console.error("Error creating category:", error)

    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json({ error: "A category with this name already exists" }, { status: 409 })
    }

    return NextResponse.json({ error: "Failed to create category" }, { status: 500 })
  }
}

