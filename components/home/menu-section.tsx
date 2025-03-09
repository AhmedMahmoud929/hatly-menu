"use client";

import Image from "next/image";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { MenuItem } from "@/types";
import MenuItemCard from "./menu-item-card";

interface MenuSectionProps {
  id: string;
  title: string;
  items: MenuItem[];
}

export function MenuSection({ id, title, items }: MenuSectionProps) {
  return (
    <section id={id} className="py-6">
      <h2 className="overflow-hidden py-6 relative mb-8 sm:mb-10 text-center text-2xl md:text-4xl uppercase tracking-widest">
        <span className="relative z-10 font-semibold">{title}</span>
        <span className="absolute whitespace-nowrap w-full opacity-20 font-bold -top-1 left-1/2 -translate-x-1/2 text-center text-5xl uppercase tracking-widest text-[#fd6c00]">
          {title}
        </span>
      </h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
        {items.map((item) => (
          <MenuItemCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}

// Example usage
export default function MenuDemo() {
  const menuItems: MenuItem[] = [
    {
      id: 1,
      name: "Qamruddin",
      description:
        "The concentrated apricot taste, refreshing, tells your thirst with every sip!",
      price: 12,
      image: "/placeholder.svg?height=200&width=200",
      rating: 5,
      isNew: true,
      isSignature: true,
      currency: "﷼",
    },
    {
      id: 2,
      name: "Orange Juice",
      description: "Freshly squeezed oranges with a hint of sweetness",
      price: 10,
      image: "/placeholder.svg?height=200&width=200",
      rating: 4,
      currency: "﷼",
    },
    {
      id: 3,
      name: "Mango Smoothie",
      description: "Tropical mango blended with yogurt and honey",
      price: 15,
      image: "/placeholder.svg?height=200&width=200",
      rating: 5,
      isSignature: true,
      currency: "﷼",
    },
  ];

  return (
    <div className="container mx-auto p-4 bg-[#121212] min-h-screen text-amber-50">
      <MenuSection
        id="beverages"
        title="Refreshing Beverages"
        items={menuItems}
      />
    </div>
  );
}
