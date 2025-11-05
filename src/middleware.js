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
    // Allow the request through so client-side fetches can handle auth state.
    return NextResponse.next();
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
