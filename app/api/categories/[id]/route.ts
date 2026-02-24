import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db-connect"
import Category from "@/models/Category"
import { getUserFromToken } from "@/lib/auth-utils"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect()
    const { id } = await params
    const category = await Category.findById(id)

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error("Error fetching category:", error)
    return NextResponse.json({ error: "Failed to fetch category" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromToken()
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    await dbConnect()
    const { id } = await params
    const { name, image } = await request.json()

    if (!name || !image) {
      return NextResponse.json({ error: "Name and image are required" }, { status: 400 })
    }

    const category = await Category.findByIdAndUpdate(id, { name, image }, { new: true, runValidators: true })

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    return NextResponse.json(category)
  } catch (error: unknown) {
    console.error("Error updating category:", error)
    if (typeof error === "object" && error !== null && "code" in error && (error as { code: number }).code === 11000) {
      return NextResponse.json({ error: "A category with this name already exists" }, { status: 409 })
    }

    return NextResponse.json({ error: "Failed to update category" }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromToken()
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    await dbConnect()
    const { id } = await params
    const category = await Category.findByIdAndDelete(id)

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Category deleted successfully" })
  } catch (error) {
    console.error("Error deleting category:", error)
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 })
  }
}

