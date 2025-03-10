import { Suspense, useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { MenuHeader } from "@/components/home/menu-header";
import { CategoryNav } from "@/components/home/category-nav";
import { MenuSection } from "@/components/home/menu-section";
import { CompleteOrderButton } from "@/components/home/complete-order-button";
import { Skeleton } from "@/components/ui/skeleton";
import { HotDrinksDummyData, menuItems } from "@/constants";
import { IProduct } from "@/types";
import { headers } from "next/headers";
import { formatCategoryId } from "@/lib/utils";

export default async function HomePage() {
  let products: { title: string; items: IProduct[] }[] = [];

  try {
    const host = (await headers()).get("host");
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
    console.log(
      "Fetching...",
      `${protocol}://${host}/api/products?section-format=true`
    );
    const res = await fetch(
      `${protocol}://${host}/api/products?section-format=true`
    );

    if (!res.ok) throw new Error("Failed to fetch products");
    products = await res.json();
    console.log(products);
  } catch (error) {
    console.error("Error loading products:", error);
  }

  return (
    <div className="flex min-h-screen flex-col dark:bg-black">
      <MenuHeader />

      <main className="flex-1">
        <div className="dark:bg-black px-4 py-8 text-center">
          <div className="relative w-24 h-24 mx-auto">
            <Image
              src="/hatly_black_logo.png"
              alt="Triple Coffee & Juicery"
              fill
              className="object-contain"
              priority
            />
          </div>

          <h1 className="sr-only">Hatly menu</h1>
        </div>

        <CategoryNav categories={products?.map((prod) => prod.title) || []} />

        <div className="container mx-auto px-4 py-8">
          <Suspense fallback={<CategorySkeleton />}>
            {products?.map((ele, ix) => (
              <MenuSection
                key={ix}
                id={formatCategoryId(ele.title)}
                title={ele.title}
                items={ele.items}
              />
            ))}
          </Suspense>
        </div>
      </main>

      <CompleteOrderButton />
    </div>
  );
}

function CategorySkeleton() {
  return (
    <div className="space-y-10">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="h-8 w-40" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {[...Array(3)].map((_, j) => (
              <Skeleton key={j} className="h-48 rounded-xl" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
