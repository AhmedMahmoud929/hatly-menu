"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

export function ThemeToggle({
  variant = "ghost",
  className = "h-8 w-8",
}: {
  variant?: "outline" | "ghost";
  className?: string;
}) {
  const { setTheme } = useTheme();
  const [dark, setDark] = useState(false);

  return (
    <Button
      onClick={() => setDark(!dark)}
      variant={variant}
      size="icon"
      className={className}
    >
      {dark ? (
        <Sun className="h-[1.2rem] w-[1.2rem] text-white" />
      ) : (
        <Moon className="h-[1.2rem] w-[1.2rem] text-white" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
