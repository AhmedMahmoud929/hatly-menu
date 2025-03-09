import { Suspense } from "react";
import Image from "next/image";
import { MenuHeader } from "@/components/home/menu-header";
import { CategoryNav } from "@/components/home/category-nav";
import { MenuSection } from "@/components/home/menu-section";
import { CompleteOrderButton } from "@/components/home/complete-order-button";
import { Skeleton } from "@/components/ui/skeleton";
import { HotDrinksDummyData, menuItems } from "@/constants";

export default function HomePage() {
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

          <h1 className="sr-only">Triple Coffee & Juicery</h1>
        </div>

        <CategoryNav />

        <div className="container mx-auto px-4 py-8">
          <Suspense fallback={<CategorySkeleton />}>
            {menuItems.map((ele, ix) => (
              <MenuSection
                id={ele.name.toLowerCase().replace(/\s/g, "-")}
                title={ele.name}
                items={HotDrinksDummyData}
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

const hotDrinks = [
  {
    id: "1",
    name: "Turkish Coffee",
    description: "Rich and authentic Turkish coffee with cardamom",
    price: 12,
    image:
      "https://storage.6lb.menu/Menus/Triple_coffee/Items/182917/ItemBigImage_v1.jpg",
    category: "Hot Drinks",
    tags: ["Signature", "Popular"],
    rating: 5,
  },
  {
    id: "1a",
    name: "Espresso",
    description: "Strong Italian coffee served in a small cup",
    price: 10,
    image:
      "https://storage.6lb.menu/Menus/Triple_coffee/Items/182922/ItemBigImage_v1.jpg",
    category: "Hot Drinks",
    tags: ["Classic"],
    rating: 4,
  },
  {
    id: "1b",
    name: "Cappuccino",
    description: "Espresso with steamed milk and foam",
    price: 14,
    image: "/placeholder.svg?height=400&width=400",
    category: "Hot Drinks",
    tags: ["Bestseller"],
    rating: 5,
  },
];

const coldDrinks = [
  {
    id: "2",
    name: "Iced Latte",
    description: "Smooth espresso with cold milk and ice",
    price: 15,
    image: "/placeholder.svg?height=400&width=400",
    category: "Cold Drinks",
    tags: ["Refreshing"],
    rating: 4,
  },
  {
    id: "2a",
    name: "Fruit Smoothie",
    description: "Blend of fresh seasonal fruits with yogurt",
    price: 18,
    image: "/placeholder.svg?height=400&width=400",
    category: "Cold Drinks",
    tags: ["Healthy", "New"],
    rating: 5,
  },
  {
    id: "2b",
    name: "Iced Mocha",
    description: "Espresso with chocolate, milk and ice",
    price: 16,
    image: "/placeholder.svg?height=400&width=400",
    category: "Cold Drinks",
    tags: ["Popular"],
    rating: 4,
  },
];

const sandwiches = [
  {
    id: "3",
    name: "Club Sandwich",
    description:
      "Triple-decker sandwich with chicken, bacon, and fresh vegetables",
    price: 25,
    image: "/placeholder.svg?height=400&width=400",
    category: "Sandwiches",
    tags: ["Bestseller"],
    rating: 5,
  },
  {
    id: "3a",
    name: "Avocado Toast",
    description:
      "Sourdough bread with smashed avocado, cherry tomatoes and feta",
    price: 22,
    image: "/placeholder.svg?height=400&width=400",
    category: "Sandwiches",
    tags: ["Vegetarian", "Healthy"],
    rating: 4,
  },
  {
    id: "3b",
    name: "Halloumi Wrap",
    description: "Grilled halloumi cheese with fresh vegetables in a wrap",
    price: 20,
    image: "/placeholder.svg?height=400&width=400",
    category: "Sandwiches",
    tags: ["Vegetarian"],
    rating: 4,
  },
];
