import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_PAGES = ["/login", "/register"];
const PROTECTED_PREFIX = ["/dashboard", "/vote", "/biometric", "/results"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect page ko skip karo — infinite loop se bachao
  if (pathname === "/dashboard/redirect") {
    return NextResponse.next();
  }

  const token = request.cookies.get("access_token")?.value;

  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p));
  const isProtected = PROTECTED_PREFIX.some((p) => pathname.startsWith(p));

  // Logged in + auth page → dashboard redirect
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard/redirect", request.url));
  }

  // Not logged in + protected page → login
  if (!token && isProtected) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/register",
    "/dashboard/:path*",
    "/vote/:path*",
    "/biometric/:path*",
    "/results/:path*",
  ],
};
