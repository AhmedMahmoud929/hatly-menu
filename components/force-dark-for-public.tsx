"use client";

import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect } from "react";

/**
 * Forces dark theme on the public site (non-dashboard). Dashboard keeps light/dark toggle.
 */
export function ForceDarkForPublic() {
  const pathname = usePathname();
  const { setTheme, resolvedTheme } = useTheme();
  const isDashboard = pathname?.includes("/dashboard") ?? false;

  useEffect(() => {
    if (isDashboard) return;
    if (resolvedTheme !== "dark") setTheme("dark");
  }, [isDashboard, resolvedTheme, setTheme]);

  return null;
}
