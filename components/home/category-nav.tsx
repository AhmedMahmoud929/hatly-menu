"use client";

import { useRef, useEffect, useState } from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { menuItems } from "@/constants";
import { formatCategoryId } from "@/lib/utils";
import { useLocale } from "next-intl";
import { Locale } from "@/i18n/routing";

export function CategoryNav({ categories }: { categories: string[] }) {
  const [isSticky, setIsSticky] = useState(false);
  const [activeCategory, setActiveCategory] = useState("hot-drinks");
  const categoryRef = useRef<HTMLDivElement>(null);
  const initialTopRef = useRef<number | null>(null);
  const locale = useLocale() as Locale;

  useEffect(() => {
    const categoryElement = categoryRef.current;
    if (!categoryElement) return;

    // Store the initial top position of the category nav
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!initialTopRef.current && entry.boundingClientRect) {
          initialTopRef.current = entry.boundingClientRect.top + window.scrollY;
        }
      },
      { threshold: 1.0 }
    );

    observer.observe(categoryElement);

    // Cleanup
    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (initialTopRef.current && window.scrollY >= initialTopRef.current) {
        if (!isSticky) setIsSticky(true);
      } else {
        if (isSticky) setIsSticky(false);
      }

      // Update active category based on scroll position
      const sections = categories.map((cat) =>
        document.getElementById(formatCategoryId(cat))
      );
      const scrollPosition = window.scrollY + 150; // Offset for header

      sections.forEach((section, index) => {
        if (!section) return;

        const sectionTop = section.offsetTop;
        const sectionBottom = sectionTop + section.offsetHeight;

        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
          setActiveCategory(formatCategoryId(categories[index]));
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isSticky, menuItems]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 120; // Adjust based on header + category nav height
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });

      setActiveCategory(id);
    }
  };

  return (
    <div
      ref={categoryRef}
      dir={locale === "en" ? "ltr" : "rtl"}
      className={`w-full border-y dark:bg-[#151515] transition-all duration-300 ${
        isSticky ? "sticky top-16 z-40 shadow-md" : ""
      }`}
    >
      <ScrollArea
        dir={locale === "en" ? "ltr" : "rtl"}
        className="w-full sm:container whitespace-nowrap"
      >
        <div className="flex w-max space-x-2 p-3">
          {categories.map((category) => (
            <button
              key={formatCategoryId(category)}
              onClick={() => scrollToSection(formatCategoryId(category))}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                activeCategory === formatCategoryId(category)
                  ? "dark:bg-white text-primary-foreground"
                  : "dark:bg-[#2c2c2c] hover:bg-muted/80"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
