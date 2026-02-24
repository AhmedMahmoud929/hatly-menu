import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db-connect";
import Product from "@/models/Product";
import { getUserFromToken } from "@/lib/auth-utils";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
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
    const {
      name,
      category,
      description,
      rating,
      price,
      is_available,
      extras,
      sizes,
      image,
    } = await request.json();

    // Validate input
    if (!name || !category || !description || !image) {
      return NextResponse.json(
        { error: "Name, category, description, and image are required" },
        { status: 400 }
      );
    }

    // Validate sizes
    if (!sizes || !Array.isArray(sizes) || sizes.length === 0) {
      return NextResponse.json(
        { error: "At least one size with name and price is required" },
        { status: 400 }
      );
    }

    // Validate that each size has a name and price
    const validSizes = sizes.every(
      (size) =>
        size &&
        typeof size === "object" &&
        "name" in size &&
        typeof size.name === "string" &&
        size.name.trim() !== "" &&
        "price" in size &&
        typeof size.price === "number" &&
        size.price > 0
    );

    if (!validSizes) {
      return NextResponse.json(
        {
          error: "Each size must have a valid name and price greater than zero",
        },
        { status: 400 }
      );
    }

    // Validate extras if provided
    if (extras && Array.isArray(extras) && extras.length > 0) {
      const validExtras = extras.every(
        (extra) =>
          extra &&
          typeof extra === "object" &&
          "name" in extra &&
          typeof extra.name === "string" &&
          extra.name.trim() !== "" &&
          "price" in extra &&
          typeof extra.price === "number" &&
          extra.price > 0
      );

      if (!validExtras) {
        return NextResponse.json(
          {
            error:
              "Each extra must have a valid name and price greater than zero",
          },
          { status: 400 }
        );
      }
    }

    const product = await Product.findByIdAndUpdate(
      id,
      {
        name,
        category,
        description,
        rating: rating !== undefined ? rating : 5,
        // Use the price of the first size as the base price if not explicitly provided
        price: price !== undefined ? price : sizes[0]?.price || 0,
        is_available: is_available !== undefined ? is_available : true,
        extras: extras || [],
        sizes,
        image,
      },
      { new: true, runValidators: true }
    );

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
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
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
