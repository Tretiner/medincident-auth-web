import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const SECURE_PATHS = ["/profile", "/api/profile"];
const AUTH_PATHS = ["/", "/login"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isLoggedIn = !!token;

  const isSecurePath = SECURE_PATHS.some((path) => pathname.startsWith(path));
  
  // if (isSecurePath && !isLoggedIn) {
  //   const loginUrl = new URL("/", req.nextUrl);
  //   loginUrl.searchParams.set("redirect", pathname); 
  //   return NextResponse.redirect(loginUrl);
  // }

  const isAuthPath = AUTH_PATHS.includes(pathname);
  if (isAuthPath && isLoggedIn) {
    return NextResponse.redirect(new URL("/profile", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/auth).*)",
  ],
};