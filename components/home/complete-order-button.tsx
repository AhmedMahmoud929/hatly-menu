"use client";

import { useState, useEffect } from "react";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOrder } from "@/contexts/order-context";
import Image from "next/image";
import { useRouter } from "next/navigation";

export function CompleteOrderButton() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { totalOrderPrice } = useOrder();
  const router = useRouter();
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 transform bg-background/20 border-t border-[#fd6c00 ]/40 px-4 py-6 backdrop-blur transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="container mx-auto px-4">
        <Button
          className="w-full bg-orange-600 hover:bg-orange-700 text-white"
          size="lg"
          onClick={() => totalOrderPrice && router.push("/checkout")}
        >
          <ShoppingBag className="h-7 w-7" />
          Complete Order (
          <Image
            src="/ksa-currency.svg"
            className="brightness-0 invert -mx-1"
            alt="coin"
            width={16}
            height={16}
          />
          {totalOrderPrice} )
        </Button>
      </div>
    </div>
  );
}
