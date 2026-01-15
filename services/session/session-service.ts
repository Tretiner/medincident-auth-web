"server only";

import { env } from "@/config/env";
import {
  deleteSessionCookies,
  getAccessCookie,
  getRefreshCookie,
  setAccessCookie,
  setRefreshCookie,
} from "./session-cookie-service";
import { verifyJwt } from "../../lib/jwt-helper";
import { createSessionWithRefreshMock } from "../server-http-client";
import { JwtUser } from "@/domain/auth/types";

export async function createSession(
  userId: string,
  accessToken: string,
  accessExpiresAt: Date,
  refreshToken: string,
  refreshExpiresAt: Date
) {
  console.log("Create session: a:" + accessToken + ":" + accessExpiresAt + " r:" + refreshToken);

  await setAccessCookie({
    token: accessToken,
    expiresAt: accessExpiresAt,
  });

  await setRefreshCookie({
    token: refreshToken,
    expiresAt: refreshExpiresAt,
  });

  return { accessToken, refreshToken };
}

export async function deleteSession() {
  await deleteSessionCookies();
}

export async function verifyAccessToken(token: string) {
  try {
    const payload = await verifyJwt<JwtUser>(token, env.SESSION_SECRET);

    if (payload && payload.uid && payload.sid) {
      return payload;
    } else {
      return null;
    }
  } catch {
    return null;
  }
}

export async function getUserFromSession() {
  "server only";
  // A. Пробуем Access Token
  const accessToken = await getAccessCookie();
  if (accessToken) {
    const payload = await verifyAccessToken(accessToken);
    if (payload?.uid) return payload.uid;
  }

  // B. Если Access нет или он протух, пробуем Refresh Token
  const refreshToken = await getRefreshCookie();
  if (refreshToken) {
    // Пытаемся обновить токены
    const newSession = await rotateTokens(refreshToken);
    if (newSession) {
      // Декодируем новый access токен, чтобы вернуть ID
      const payload = await verifyAccessToken(newSession.accessToken);
      return payload?.uid ?? null;
    }
  }

  return null;
}
export async function requireUserFromSession(){
  return await getUserFromSession()!
}

export async function rotateTokens(oldRefreshToken: string) {
  const refreshToken = getRefreshCookie()

  if (!refreshToken) {
    await deleteSession();
    return null;
  }

  const sessionData = await createSessionWithRefreshMock(oldRefreshToken);

  if (!sessionData.success) {
    return null;
  }

  const result = sessionData.data;

  return {
    accessToken: result.AccessToken,
    refreshToken: result.RefreshToken,
    accessExpiresAt: result.AccessExpiresAt,
    refreshExpiresAt: result.RefreshExpiresAt,
  };
}
