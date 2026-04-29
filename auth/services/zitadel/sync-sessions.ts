"use server";

import { getAllSessions, removeSessionFromCookie, SessionCookie } from "./cookies";
import { searchSessions } from "./api";

export type SyncedSession = {
  cookie: SessionCookie;
  zitadel: any; // данные сессии из Zitadel (factors, userAgent, etc.)
};

/**
 * Получает живые сессии, сверяя куки с Zitadel.
 * Удаляет из cookies сессии, которых больше нет в Zitadel.
 * Возвращает живые сессии вместе с данными из Zitadel.
 */
export async function syncSessionCookies(): Promise<SyncedSession[]> {
  const knownSessions = await getAllSessions(true);

  if (knownSessions.length === 0) {
    return [];
  }

  const response = await searchSessions(knownSessions.map((s) => s.id));
  const zitadelSessions: any[] = response.success ? response.data?.sessions || [] : [];

  const activeIds = new Set(zitadelSessions.map((s: any) => s.id));

  // Удаляем мёртвые сессии из cookies, чтобы они не накапливались
  const deadSessions = knownSessions.filter((s) => !activeIds.has(s.id));
  for (const dead of deadSessions) {
    console.log("[sync-sessions] Удалена мёртвая сессия из cookies: id=%s, loginName=%s", dead.id, dead.loginName);
    await removeSessionFromCookie(dead.id);
  }

  return knownSessions
    .filter((s) => activeIds.has(s.id))
    .map((cookie) => ({
      cookie,
      zitadel: zitadelSessions.find((z: any) => z.id === cookie.id),
    }));
}

export async function cleanupDeadSessionCookies(): Promise<void> {
  const knownSessions = await getAllSessions(true);

  if (knownSessions.length === 0) return;

  const response = await searchSessions(knownSessions.map((s) => s.id));
  const activeIds = new Set(
    response.success ? (response.data?.sessions || []).map((s: any) => s.id) : []
  );

  for (const dead of knownSessions.filter((s) => !activeIds.has(s.id))) {
    await removeSessionFromCookie(dead.id);
  }
}
