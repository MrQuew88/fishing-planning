import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Don't protect login page and login API
  if (pathname === "/login" || pathname.startsWith("/api/login")) {
    return NextResponse.next();
  }

  const auth = req.cookies.get("killykeen_auth");

  if (!auth) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
