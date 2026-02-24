import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const intlMiddleware = createMiddleware(routing);

/** Path without locale prefix (e.g. /en/login -> /login) for auth checks */
function pathWithoutLocale(pathname: string, locales: readonly string[]): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length > 0 && locales.includes(segments[0])) {
    return "/" + segments.slice(1).join("/");
  }
  return pathname;
}

const publicPaths = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const intlResponse = intlMiddleware(request);
  if (intlResponse) return intlResponse;

  const pathname = request.nextUrl.pathname;
  const path = pathWithoutLocale(pathname, routing.locales);
  const isAuthenticated = !!request.cookies.get("token")?.value;
  const isPublicPath = publicPaths.some((p) => path === p || path.startsWith(p + "/"));
  const isDashboardPath = path.startsWith("/dashboard");

  if (isPublicPath && isAuthenticated) {
    const locale = pathname.split("/")[1] ?? routing.defaultLocale;
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
  }

  if (!isAuthenticated && isDashboardPath) {
    const locale = pathname.split("/")[1] ?? routing.defaultLocale;
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/(en|ar)/:path*", "/dashboard/:path*", "/login", "/register"],
};
