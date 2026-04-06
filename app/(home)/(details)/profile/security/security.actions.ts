"use server";

import { cookies } from "next/headers";
import { UserSession, LinkedAccountsStatus } from "@/domain/profile/types";
import { requireValidSession } from "@/services/zitadel/session";
import { deleteSession, deleteUserLink, getActiveIdps as getActiveIdps, searchUserLinks, searchUserSessions, startIdpIntent, changeUserPassword } from "@/services/zitadel/api";
import { env } from "@/shared/config/env";
import { redirect } from "next/navigation";
import { parseUserAgent } from "@/shared/lib/user-agent";
import { getAllSessions } from "@/services/zitadel/cookies";

// GET: Получить все активные сессии пользователя
export async function getSessionsAction(): Promise<UserSession[]> {
  const { userId, currentSessionId } = await requireValidSession();

  const response = await searchUserSessions(userId);
  if (!response.success) return [];

  const rawSessions = response.data.sessions || [];

  // 3. Форматируем данные под интерфейс твоего компонента SessionsList
  const formattedSessions: UserSession[] = rawSessions.map((sess: any) => {
    const ua = sess.userAgent || {};

    // Получаем сырую строку
    const rawDescription = ua.header?.["user-agent"]?.values?.join(" ") || ua.description || "";

    // Прогоняем через наш кастомный парсер
    const prettyDeviceName = parseUserAgent(rawDescription);

    return {
      id: sess.id,
      deviceName: prettyDeviceName,
      ip: ua.ip || "IP скрыт",
      userAgent: rawDescription || "Неизвестно",
      lastActive: sess.changeDate || sess.creationDate,
      isCurrent: sess.id === currentSessionId,
    };
  });

  // 4. Сортируем: текущая сессия на самом верху, остальные по убыванию даты активности
  return formattedSessions.sort((a, b) => {
    if (a.isCurrent) return -1;
    if (b.isCurrent) return 1;
    return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime();
  });
}

// REVOKE SESSION (Отзыв конкретной сессии)
export async function revokeSessionAction(targetSessionId: string) {
  // Пытаемся найти токен этой сессии в локальном браузере
  const knownSessions = await getAllSessions();
  const localSession = knownSessions.find(s => s.id === targetSessionId);
  const token = localSession ? localSession.token : ""; // Передаем токен, если он есть

  await deleteSession(targetSessionId, token);
  return { success: true };
}

// REVOKE ALL OTHERS (Отзыв всех остальных сессий)
export async function revokeAllOthersAction() {
  const { userId, currentSessionId } = await requireValidSession();
  const response = await searchUserSessions(userId);
  const knownSessions = await getAllSessions();
  
  if (!response.success) return { success: false };
  
  const sessionsToDelete = (response.data.sessions || []).filter((s: any) => s.id !== currentSessionId);

  await Promise.all(
    sessionsToDelete.map((s: any) => {
      // Ищем токен в локальных куках (вдруг у нас открыто 2 аккаунта в одном браузере)
      const localToken = knownSessions.find(ls => ls.id === s.id)?.token || "";
      return deleteSession(s.id, localToken);
    })
  );
  
  return { success: true };
}

// GET LINKED ACCOUNTS
export async function getLinkedAccountsAction() {
  const { userId } = await requireValidSession();

  const activeIdspResp = await getActiveIdps();
  if (!activeIdspResp.success || !activeIdspResp.data?.identityProviders) return [];
  const activeIdps = activeIdspResp.data.identityProviders;

  const linksResp = await searchUserLinks(userId);
  const linkedIdps = linksResp.success ? (linksResp.data.result || []) : [];

  return activeIdps.map((idp: any) => ({
    id: idp.id,
    name: idp.name,
    isConnected: linkedIdps.some((link: any) => link.idpId === idp.id),
  }));
}

// TOGGLE LINK
export async function toggleLinkedAccountAction(idpId: string, isCurrentlyConnected: boolean) {
  const { userId } = await requireValidSession();

  if (isCurrentlyConnected) {
    const linksResp = await searchUserLinks(userId);
    if (!linksResp.success) return { success: false, error: "Не удалось получить привязки" };

    const existingLink = (linksResp.data.result || []).find((link: any) => link.idpId === idpId);
    if (existingLink) {
      const linkedUserId = existingLink.linkedUserId || existingLink.externalUserId;
      await deleteUserLink(userId, idpId, linkedUserId);
    }
    return { success: true, action: "unlinked" };
  } else {
    return linkProvider(idpId);
  }
}

export async function linkProvider(idpId: string) {
  const response = await startIdpIntent({
    idpId,
    urls: {
      successUrl: `${env.APP_URL}/profile/security?link=success`,
      failureUrl: `${env.APP_URL}/profile/security?link=failed`,
    },
  });

  if (!response.success || !response.data?.authUrl) {
    throw new Error("Не удалось запустить авторизацию");
  }

  redirect(response.data.authUrl);
}

// CHANGE PASSWORD (Смена пароля)
export async function changePasswordAction(currentPassword: string, newPassword: string) {
  const { userId } = await requireValidSession();

  const result = await changeUserPassword(userId, currentPassword, newPassword);

  if (!result.success) {
    const message = result.error?.type === "ZITADEL_ERROR" || result.error?.type === "API_ERROR"
      ? "Неверный текущий пароль или новый пароль не соответствует требованиям"
      : "Не удалось сменить пароль";
    return { success: false, error: message };
  }

  return { success: true };
}