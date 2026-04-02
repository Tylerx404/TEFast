import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { authConfig } from "@/lib/config";

const protectedPrefixes = [
  "/me",
  "/my-courses",
  "/learn",
  "/results",
  "/teacher",
];

function isProtectedPath(pathname: string) {
  if (pathname.startsWith("/exams/") && pathname.endsWith("/take")) {
    return true;
  }

  return protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function middleware(request: NextRequest) {
  if (!isProtectedPath(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(authConfig.accessTokenCookie)?.value;

  if (token) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("redirectTo", request.nextUrl.pathname + request.nextUrl.search);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/me/:path*",
    "/my-courses/:path*",
    "/learn/:path*",
    "/results/:path*",
    "/teacher/:path*",
    "/exams/:path*",
  ],
};
