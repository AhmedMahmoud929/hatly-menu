import { getCookie } from "cookies-next";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // request.cookies.clear()
  // request.cookies.delete("token")
  console.log(getCookie("token"));
  const isAuthenticated = !!request.cookies.get("token")?.value;

  // Get the pathname of the request
  const pathname = request.nextUrl.pathname;

  // Public paths that don't require authentication
  const publicPaths = ["/login", "/register"];
  const isPublicPath = publicPaths.includes(pathname);

  console.log("Trying access to", pathname, "isAuthenticated", isAuthenticated);

  // If the path is public and the user is authenticated, redirect to dashboard
  if (isPublicPath && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If the path is not public and the user is not authenticated, redirect to login
  if (!isPublicPath && !isAuthenticated && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Otherwise, continue with the request
  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: ["/", "/dashboard/:path*", "/login", "/register"],
};
