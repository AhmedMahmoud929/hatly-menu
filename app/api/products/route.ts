import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db-connect";
import Product, { IProduct } from "@/models/Product";
import { getUserFromToken } from "@/lib/auth-utils";
import { Locale } from "@/i18n/routing";
import { ILocaleContent } from "@/models";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    // Access query parameters
    const { searchParams } = new URL(req.url);
    const acceptLanguage = req.headers.get("Accept-Language") as string;
    const locale: Locale = ["en", "ar"].includes(acceptLanguage)
      ? (acceptLanguage as Locale)
      : "en";

    const isSectionFormat = ["true", "True", "1"].includes(
      searchParams.get("section-format")!
    );

    // Fetch products with populated category (only _id and name)
    const products: (IProduct & {
      category: { name: ILocaleContent };
    })[] = await Product.find({})
      .populate("category", "name")
      .sort({ createdAt: -1 });

    // Format each product for the correct locale
    const formattedProducts = products.map((prod) => ({
      ...prod.toJSON(),
      name: prod.name[locale],
      description: prod.description[locale],
      category: prod.category.name[locale],
    }));

    // If section format is requested, group products by category name
    const finalProducts = !isSectionFormat
      ? formattedProducts
      : Object.entries(
          formattedProducts.reduce((acc: Record<string, any[]>, product) => {
            // Use lower case for consistency; fallback to "uncategorized"
            const category = product.category.toLowerCase() || "uncategorized";
            if (!acc[category]) acc[category] = [];
            acc[category].push(product);
            return acc;
          }, {})
        ).map(([title, items]) => ({ title, items }));

    return NextResponse.json(finalProducts);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getUserFromToken();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await dbConnect();

    const {
      name,
      category,
      description,
      rating,
      price,
      is_available,
      total_order,
      extras,
      sizes,
      image,
    } = await request.json();

    // Validate input
    if (!name || !category || !description) {
      return NextResponse.json(
        { error: "Name, category, and description are required" },
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
        size.price >= 0
    );

    if (!validSizes) {
      return NextResponse.json(
        { error: "Each size must have a valid name and price" },
        { status: 400 }
      );
    }

    // Validate extras if provided
    if (extras && Array.isArray(extras)) {
      const validExtras = extras.every(
        (extra) =>
          extra &&
          typeof extra === "object" &&
          "name" in extra &&
          typeof extra.name === "string" &&
          extra.name.trim() !== "" &&
          "price" in extra &&
          typeof extra.price === "number" &&
          extra.price >= 0
      );

      if (!validExtras) {
        return NextResponse.json(
          { error: "Each extra must have a valid name and price" },
          { status: 400 }
        );
      }
    }

    // Create new product
    const newProduct = {
      name,
      category,
      description,
      rating: rating || 0,
      price: price !== undefined ? price : sizes[0]?.price || 0,
      is_available: is_available !== undefined ? is_available : true,
      extras: extras,
      sizes: sizes,
      image: image,
    };
    console.log(newProduct);
    const product = await Product.create(newProduct);

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
