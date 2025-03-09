"use client";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { LanguageSelector } from "./language-selector";
import { ThemeToggle } from "../theme-toggle";

export function MenuHeader() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 border-b bg-[#151515] backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-lg font-bold">
          Menu
        </Link>

        <div className="flex items-center gap-2">
          {/* <LanguageSelector /> */}
          <ThemeToggle variant="outline" className="h-10 w-10" />
          <Button variant="outline" size="icon" className="relative">
            <ShoppingBag className="h-5 w-5" />
            <span className="sr-only">Shopping cart</span>
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              0
            </span>
          </Button>
        </div>
      </div>
    </header>
  );
}
