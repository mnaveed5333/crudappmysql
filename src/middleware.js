import { NextResponse } from "next/server";

export function middleware(request) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  const needsAuth =
    pathname.startsWith("/dashboard") ||
    (pathname.startsWith("/admin") && pathname !== "/admin/login");

  if (needsAuth && !token) {
    const loginPath = pathname.startsWith("/admin") ? "/admin/login" : "/login";
    return NextResponse.redirect(new URL(loginPath, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};