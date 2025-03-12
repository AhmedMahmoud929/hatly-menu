import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const intlMiddleware = createMiddleware(routing);

export function middleware(request: NextRequest) {
  // Apply internationalization middleware first
  const intlResponse = intlMiddleware(request);
  if (intlResponse) return intlResponse;

  const isAuthenticated = !!request.cookies.get("token")?.value;
  const pathname = request.nextUrl.pathname;
  const publicPaths = ["/login", "/register"];
  const isPublicPath = publicPaths.includes(pathname);

  if (isPublicPath && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!isPublicPath && !isAuthenticated && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/(en|ar)/:path*", "/dashboard/:path*", "/login", "/register"],
};
