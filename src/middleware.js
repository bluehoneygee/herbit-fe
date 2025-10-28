import { NextResponse } from "next/server";

const AUTH_ROUTES = new Set([
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
]);

const PROTECTED_PATTERNS = [/^\/[^/]+\/(aktivitas|rewards)(\/.*)?$/];

export function middleware(req) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("access_token")?.value;

  const isProtected = PROTECTED_PATTERNS.some((regex) => regex.test(pathname));
  const isAuthRoute = AUTH_ROUTES.has(pathname);

  if (!token && isProtected) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (token && isAuthRoute) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/:username/(aktivitas|rewards)/:path*",
  ],
};
