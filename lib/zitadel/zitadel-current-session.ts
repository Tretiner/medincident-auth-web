"use server";

import { cookies } from "next/headers";

const CURRENT_SESSION_COOKIE_NAME = "zitadel_current_session";

/**
 * Возвращает ID текущей активной сессии пользователя.
 */
export async function getCurrentSessionId(): Promise<string | undefined> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(CURRENT_SESSION_COOKIE_NAME);
  return sessionCookie?.value;
}

/**
 * Устанавливает ID текущей сессии (вызывается при успешном логине или смене аккаунта).
 */
export async function setCurrentSessionId(sessionId: string): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set({
    name: CURRENT_SESSION_COOKIE_NAME,
    value: sessionId,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
  });
}

/**
 * Удаляет ID текущей сессии (вызывается при выходе из системы или если сессия умерла).
 */
export async function clearCurrentSessionId(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(CURRENT_SESSION_COOKIE_NAME);
}