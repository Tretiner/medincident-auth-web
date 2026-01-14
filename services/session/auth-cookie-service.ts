"server only";

import { cookies } from "next/headers";
import { env } from "@/config/env";

const ACCESS_TOKEN_COOKIE = "auth_access";
const REFRESH_TOKEN_COOKIE = "auth_refresh";

interface AuthCookieOptions {
  token: string;
  expiresAt: Date;
}

export async function setAccessCookie({ token, expiresAt }: AuthCookieOptions) {
  const cookieStore = await cookies();

  cookieStore.set(ACCESS_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: env.isProd,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function setRefreshCookie({
  token,
  expiresAt,
}: AuthCookieOptions) {
  const cookieStore = await cookies();

  cookieStore.set(REFRESH_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: env.isProd,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function getAccessCookie() {
  const cookieStore = await cookies();

  return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
}

export async function getRefreshCookie() {
  const cookieStore = await cookies();

  return cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
}

export async function deleteSessionCookies() {
  const cookieStore = await cookies();

  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  cookieStore.delete(REFRESH_TOKEN_COOKIE);
}
