"use client";
import Link from "next/link";
import { Languages, ShoppingBag } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { LanguageSelector } from "./language-selector";
import { ThemeToggle } from "../theme-toggle";
import { useOrder } from "@/contexts/order-context";
import { useLocale } from "next-intl";
import { Locale } from "@/i18n/routing";
import { getLocaleContent } from "@/lib/utils";

export function MenuHeader() {
  const { theme, setTheme } = useTheme();
  const { order } = useOrder();
  const locale = useLocale() as Locale;
  const anotherLocale = locale === "en" ? "ar" : "en";

  return (
    <header className="sticky top-0 z-50 border-b bg-[#151515] backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-lg font-bold">
          {getLocaleContent(locale, "Hatly Menu", "قائمة هاتلي")}
        </Link>

        <div className="flex items-center gap-2">
          {/* <LanguageSelector /> */}
          <Link href={`/${anotherLocale}`}>
            <Button variant="outline" className="relative">
              {/* <Languages className="h-5 w-5" /> */}
              <span>{locale === "ar" ? "English" : "عربي"} </span>
              <span className="sr-only">
                Change language to {anotherLocale}
              </span>
            </Button>
          </Link>
          <ThemeToggle variant="outline" className="h-10 w-10" />
          <Link href={"/checkout"}>
            <Button variant="outline" size="icon" className="relative">
              <ShoppingBag className="h-5 w-5" />
              <span className="sr-only">Shopping cart</span>
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                {order?.items.length || 0}
              </span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
