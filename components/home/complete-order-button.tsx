"use client";

import { useState, useEffect } from "react";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CompleteOrderButton() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

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
        >
          <ShoppingBag className="h-7 w-7" />
          Complete Order (0 QR)
        </Button>
      </div>
    </div>
  );
}
