import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_ROUTES = ["/login", "/verify-otp", "/first-login-setup", "/reset-password"];
const PROTECTED_PREFIXES = ["/dashboard"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  const isProtectedRoute = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (isProtectedRoute && !refreshToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const hasAuthParams =
    request.nextUrl.searchParams.has("google_success") ||
    request.nextUrl.searchParams.has("auth_data");

  if (
    isAuthRoute &&
    refreshToken &&
    !pathname.startsWith("/first-login-setup") &&
    !hasAuthParams
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login",
    "/verify-otp",
    "/first-login-setup",
    "/reset-password",
  ],
};
