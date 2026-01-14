"server only";

import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { rotateTokens, verifyAccessToken } from "@/services/session/session-service";
import { env } from "@/config/env";

// Пути, требующие обязательной авторизации
const SECURE_PATHS = ["/profile", "/api/profile"];

// Пути, доступные всем
const PUBLIC_PATHS = [
  "/_next",
  "/static",
  "/api/auth",
  "/api/callback",
  "/login",
  "/favicon.ico",
  "/sitemap.xml",
  "/robots.txt"
];

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  console.info(`PROXY: Incoming request: ${pathname}`);

  // 1. Пропускаем публичные пути
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    console.info(`PROXY: Public path`);
    return NextResponse.next();
  }

  const accessToken = request.cookies.get("auth_access")?.value;
  const refreshToken = request.cookies.get("auth_refresh")?.value;

  console.log(`tokens: a:${accessToken} r:${refreshToken}`)

  // 2. Попытка верификации Access Token
  if (accessToken) {
    const isVerified = await verifyAccessToken(accessToken);
    if (isVerified) {
      console.info(`PROXY: ✅ Access Token verified. User authenticated.`);
      return NextResponse.next();
    }
  }

  console.info(`PROXY: ⚠️ Access Token missing or invalid. Checking Refresh Token...`);

  // 3. Логика ротации (Раскомментировано)
  if (refreshToken) {
    console.info(`PROXY: 🔄 Attempting to rotate tokens using Refresh Token.`);
    
    try {
      const newSession = await rotateTokens(refreshToken);

      if (newSession) {
        console.info(`PROXY: ✨ Rotation SUCCESS. Updating session cookies.`);
        
        const response = NextResponse.next();

        // Access Token
        response.cookies.set("auth_access", newSession.accessToken, {
          path: "/",
          httpOnly: true,
          secure: env.isProd,
          sameSite: "lax",
          expires: newSession.accessExpiresAt, 
        });

        // Refresh Token (Rotation)
        response.cookies.set("auth_refresh", newSession.refreshToken, {
          path: "/",
          httpOnly: true,
          secure: env.isProd,
          sameSite: "lax",
          expires: newSession.refreshExpiresAt, 
        });

        return response;
      } else {
        console.info(`PROXY: ❌ Rotation returned no session (invalid refresh token).`);
      }
    } catch (error) {
      console.error("PROXY: 💥 ROTATION FAILED (Error)", error);
      // Если ротация упала, продолжаем выполнение, чтобы сработал редирект или 401
    }
  } else {
    console.info(`PROXY: 🤷‍♂️ No Refresh Token found.`);
  }

  // 4. Если это API запрос — возвращаем 401 вместо редиректа
  if (pathname.startsWith("/api")) {
    console.info(`PROXY: ⛔ Unauthorized API request to ${pathname}. Returning 401.`);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 5. Редирект на логин, если доступа нет и путь защищен
  if (SECURE_PATHS.some((path) => pathname.startsWith(path))) {
    console.info(`PROXY: 🔒 Access denied to secure path: ${pathname}. Redirecting to /login.`);
    
    const loginUrl = new URL("/login", request.url);
    if (pathname !== "/") {
      loginUrl.searchParams.set("from", pathname + search);
    }
    return NextResponse.redirect(loginUrl);
  }

  // По умолчанию пропускаем остальные запросы
  console.info(`PROXY: 🏳️ Path is not explicitly secure. Allowing access.`);
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/auth/qr).*)",
  ],
};