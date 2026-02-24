"use client";

import type React from "react";

import { useState } from "react";
import { Link, usePathname } from "@/i18n/routing";
import {
  BarChart3,
  ClipboardList,
  LogOut,
  Package,
  Settings,
  Tag,
  Utensils,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/use-auth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, logout, loading } = useAuth();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const t = useTranslations("Dashboard");

  const routes = [
    { href: "/dashboard", labelKey: "overview" as const, icon: BarChart3 },
    { href: "/dashboard/orders", labelKey: "orders" as const, icon: ClipboardList },
    { href: "/dashboard/categories", labelKey: "categories" as const, icon: Tag },
    { href: "/dashboard/products", labelKey: "products" as const, icon: Package },
    { href: "/dashboard/settings", labelKey: "settings" as const, icon: Settings },
  ].map((r) => ({
    ...r,
    label: t(r.labelKey),
    active:
      r.href === "/dashboard"
        ? pathname === "/dashboard"
        : pathname?.startsWith(r.href),
  }));

  // Get user initials for avatar fallback
  const getInitials = () => {
    if (!user?.name) return "U";
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Mobile Navigation */}
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 lg:hidden">
        <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden">
              <Utensils className="h-5 w-5" />
              <span className="sr-only">{t("toggleMenu")}</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <div className="flex flex-col space-y-6">
              <div className="flex items-center gap-2 px-2">
                <Utensils className="h-6 w-6" />
                <span className="text-lg font-semibold">{t("appName")}</span>
              </div>
              <nav className="grid gap-2 px-2">
                {routes.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    onClick={() => setIsMobileNavOpen(false)}
                    className={`
                      flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                        route.active
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                  >
                    <route.icon className="h-4 w-4" />
                    {route.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-auto px-2">
<Button
                variant="ghost"
                className="w-full justify-start text-muted-foreground"
                onClick={() => logout()}
              >
                <LogOut className="mr-2 h-4 w-4" />
                {t("signOut")}
              </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <div className="flex w-full items-center justify-between">
          <span className="text-lg font-semibold">{t("appName")}</span>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Avatar>
              <AvatarImage src="/placeholder-user.jpg" alt="User" />
              <AvatarFallback>{getInitials()}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <aside className="hidden w-64 flex-col border-r bg-muted/40 lg:flex">
          <div className="flex h-16 items-center gap-2 border-b px-6">
            <Utensils className="h-6 w-6" />
            <span className="text-lg font-semibold">{t("appName")}</span>
          </div>
          <nav className="flex flex-col gap-2 p-4">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={`
                  flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                    route.active
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
              >
                <route.icon className="h-4 w-4" />
                {route.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto border-t p-4">
            <div className="flex items-center gap-3 rounded-lg px-3 py-2">
              <Avatar className="h-9 w-9">
                <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                <AvatarFallback>{getInitials()}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium line-clamp-1">
                  {user.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {user.role}
                </span>
              </div>
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                className="ml-auto"
                onClick={() => logout()}
              >
                <LogOut className="h-4 w-4" />
                <span className="sr-only">{t("logOut")}</span>
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
