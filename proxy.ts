import { auth } from "@/services/zitadel/user/auth";
import { NextResponse } from "next/server";
import { cleanupDeadSessionCookies } from "./services/zitadel/sync-sessions";

export default auth(async (req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  console.log("[middleware] path=%s, isLoggedIn=%s", pathname, isLoggedIn);

  const shouldCleanSession = pathname === "/" || pathname.startsWith("/login");
  if (shouldCleanSession) {
    try {
      await cleanupDeadSessionCookies();
    } catch (e) {
      console.error("[middleware] Ошибка cleanupDeadSessionCookies:", e);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|favicon.ico|api/auth).*)",
  ],
};
