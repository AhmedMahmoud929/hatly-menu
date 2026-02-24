import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db-connect";
import Product, { IProduct } from "@/models/Product";
import "@/models/Category"; // register model so Product.populate("category") works
import { getUserFromToken } from "@/lib/auth-utils";
import { Locale } from "@/i18n/routing";
import { ILocaleContent } from "@/models";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const acceptLanguage = req.headers.get("Accept-Language") ?? "";
    const preferredLocale = acceptLanguage.split(",")[0]?.split("-")[0]?.toLowerCase();
    const locale: Locale =
      preferredLocale === "ar" || preferredLocale === "en" ? preferredLocale : "en";

    const sectionParam = searchParams.get("section-format");
    const isSectionFormat = ["true", "True", "1"].includes(sectionParam ?? "");

    const products = await Product.find({})
      .populate("category", "name")
      .sort({ createdAt: -1 })
      .lean();

    const formattedProducts = products.map((prod: Record<string, unknown>) => {
      const nameObj = prod.name as ILocaleContent | undefined;
      const descObj = prod.description as ILocaleContent | undefined;
      const cat = prod.category as { name?: ILocaleContent } | null | undefined;
      const categoryName =
        cat?.name?.[locale] ?? cat?.name?.en ?? cat?.name?.ar ?? "uncategorized";
      return {
        ...prod,
        name: nameObj?.[locale] ?? nameObj?.en ?? nameObj?.ar ?? "",
        description: descObj?.[locale] ?? descObj?.en ?? descObj?.ar ?? "",
        category: categoryName,
      };
    });

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
    const message =
      error instanceof Error ? error.message : "Failed to fetch products";
    return NextResponse.json(
      {
        error: "Failed to fetch products",
        ...(process.env.NODE_ENV === "development" && { detail: message }),
      },
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
