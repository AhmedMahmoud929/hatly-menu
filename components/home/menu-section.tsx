"use client";

import Image from "next/image";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { IProduct, MenuItem } from "@/types";
import MenuItemCard from "./menu-item-card";

interface MenuSectionProps {
  id: string;
  title: string;
  items: IProduct[];
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
          <MenuItemCard key={item._id} item={item} />
        ))}
      </div>
    </section>
  );
}
