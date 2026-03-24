"use server";

import { cookies } from "next/headers";
import { UserSession, LinkedAccountsStatus } from "@/domain/profile/types";
import { requireValidSession } from "@/lib/zitadel/session";
import { fetchZitadel, getActiveIdps as getActiveIdps, startIdpIntent } from "@/lib/zitadel/zitadel-api";
import { env } from "@/config/env";
import { redirect } from "next/navigation";
import UAParser from "ua-parser-js";
import { parseUserAgent } from "@/lib/utils/user-agent";

// GET: Получить все активные сессии пользователя
export async function getSessionsAction(): Promise<UserSession[]> {
  // 1. Проверяем валидность текущей куки и достаем userId и ID текущей сессии
  const { userId, currentSessionId } = await requireValidSession();

  // 2. Ищем все сессии, принадлежащие этому пользователю
  const response = await fetchZitadel(`/v2/sessions/search`, {
    method: "POST",
    body: JSON.stringify({
      queries: [
        {
          userIdQuery: {
            id: userId,
          },
        },
      ],
    }),
  });

  const rawSessions = response.sessions || [];

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

// ==========================================
// ACTIONS ДЛЯ СЕССИЙ
// ==========================================

export async function revokeSessionAction(targetSessionId: string) {
  await fetchZitadel(`/v2/sessions/${targetSessionId}`, {
    method: "DELETE",
    body: JSON.stringify(
      {
        token: env.ZITADEL_API_TOKEN
      }
    )
  }
  );
  return { success: true };
}

export async function revokeAllOthersAction() {
  const { userId, currentSessionId } = await requireValidSession();

  const data = await fetchZitadel(`/v2/sessions/search`, {
    method: "POST",
    body: JSON.stringify({ queries: [{ userIdQuery: { id: userId } }] })
  });

  const sessionsToDelete = data.sessions.filter((s: any) => s.id !== currentSessionId);

  await Promise.all(
    sessionsToDelete.map((s: any) =>
      fetchZitadel(`/v2/sessions/${s.id}`, { method: "DELETE" })
    )
  );

  return { success: true };
}

// ==========================================
// ACTIONS ДЛЯ ПРИВЯЗОК (IDP LINKS)
// ==========================================
export async function getLinkedAccountsAction() {
  const { userId } = await requireValidSession();

  // 1. Получаем список всех активных IDP
  const activeIdspResp = await getActiveIdps();
  console.log("CUSTOM-UI active idps: " + JSON.stringify(activeIdspResp))

  if (!activeIdspResp.success || !activeIdspResp.data?.identityProviders) {
    return [];
  }

  const activeIdps = activeIdspResp.data.identityProviders;

  // 2. Получаем текущие привязки пользователя
  const data = await fetchZitadel(`/v2/users/${userId}/links/_search`, {
    method: "POST",
    body: JSON.stringify({})
  });

  console.log("CUSTOM-UI linked idps: " + JSON.stringify(data))

  const linkedIdps = data.result || [];

  // 3. Динамически собираем ответ: маппим активные провайдеры со статусом привязки
  return activeIdps.map((idp: any) => {
    return {
      id: idp.id,
      name: idp.name,
      isConnected: linkedIdps.some((link: any) => link.idpId === idp.id),
    };
  });
}

export async function toggleLinkedAccountAction(idpId: string, isCurrentlyConnected: boolean) {
  const { userId } = await requireValidSession();

  if (isCurrentlyConnected) {
    const data = await fetchZitadel(`/v2/users/${userId}/links/_search`, {
      method: "POST",
      body: JSON.stringify({})
    });

    const existingLink = (data.result || []).find((link: any) => link.idpId === idpId);

    if (existingLink) {
      const linkedUserId = existingLink.linkedUserId || existingLink.externalUserId;
      await fetchZitadel(`/v2/users/${userId}/links/${idpId}/${linkedUserId}`, {
        method: "DELETE"
      });
    }

    return { success: true, action: "unlinked" };

  } else {
    linkProvider(idpId)
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