import type React from "react";
import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { NextIntlClientProvider } from "next-intl";
import { OrderProvider } from "@/contexts/order-context";
import { Locale } from "@/i18n/routing";
import { getMessages } from "next-intl/server";
import "./globals.css";

const rubik = Rubik({ subsets: ["arabic", "latin"] });

export const metadata: Metadata = {
  title: "Hatly Menu",
  description: "Manage your restaurant menu and orders",
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: Locale }>;
}>) {
  const { locale } = await params;
  const messages = await getMessages();
  return (
    <html
      lang={locale}
      dir={locale === "en" ? "ltr" : "rtl"}
      suppressHydrationWarning
    >
      <body className={rubik.className}>
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <OrderProvider>
              <ThemeProvider
                attribute="class"
                forcedTheme="dark"
                enableSystem
                disableTransitionOnChange
              >
                {children}
                <Toaster />
              </ThemeProvider>
            </OrderProvider>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
