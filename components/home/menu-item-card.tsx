import type { IProduct, MenuItem } from "@/types";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { cn, getLocaleContent } from "@/lib/utils";
import { ProductBottomSheet } from "./product-bottom-sheet";
import { useState } from "react";
import { useLocale } from "next-intl";
import { Locale } from "@/i18n/routing";

export default function MenuItemCard({ item }: { item: IProduct }) {
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const locale = useLocale() as Locale;
  return (
    <>
      <ProductBottomSheet
        item={item}
        open={isBottomSheetOpen}
        onClose={() => setIsBottomSheetOpen(false)}
      />
      <div
        className="group overflow-hidden rounded-xl border border-amber-900/20 bg-gradient-to-br from-amber-950 to-[#151515] shadow-sm transition-shadow hover:shadow-md"
        onClick={() => setIsBottomSheetOpen(true)}
      >
        {/* Card content with responsive layout */}
        <div className="relative p-3 sm:p-4">
          {/* Price tag - responsive positioning */}
          <div className="absolute top-0 right-0 z-10 bg-red-600 px-3 sm:px-8 py-1 text-sm sm:text-base font-bold text-white flex items-center">
            <Image
              src={"/ksa-currency.svg"}
              alt="ksa-currency"
              width={16}
              height={16}
              className="brightness-0 invert mr-1"
            />
            <span>{item.price}</span>
          </div>

          {/* Responsive flex container - stacks on mobile */}
          <div className="flex flex-col sm:flex-row items-start gap-3 pt-6 sm:pt-0">
            {/* Image container - full width on mobile, fixed size on larger screens */}
            <div className="relative h-40 sm:h-28 w-full sm:w-28 shrink-0 overflow-hidden rounded-lg mb-3 sm:mb-0">
              <Image
                src={item.image || "/placeholder.svg"}
                alt={item.name}
                fill
                className="object-cover"
              />
            </div>

            {/* Content area */}
            <div className="flex-1 w-full">
              <div className="mb-1">
                <h3 className="font-bold text-lg sm:text-xl text-amber-50">
                  {item.name}
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-amber-200/80 line-clamp-3">
                {item.description}
              </p>

              {/* Badges and ratings - responsive layout */}
              <div className="flex flex-row items-center justify-between gap-2 mt-3 sm:mt-4">
                <div className="flex flex-wrap items-center gap-2">
                  {true && (
                    <Badge
                      variant="outline"
                      className="bg-amber-900/30 text-amber-200 border-amber-700 rounded-full text-xs px-2"
                    >
                      SIGNATURE
                    </Badge>
                  )}

                  {true && (
                    <Badge className="bg-red-700 text-white border-0 rounded-full text-xs px-2">
                      new
                    </Badge>
                  )}
                </div>

                {item.rating && (
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-3 w-3 sm:h-4 sm:w-4",
                          i < (item.rating || 0)
                            ? "fill-amber-400 text-amber-400"
                            : "fill-gray-700 text-gray-700"
                        )}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
