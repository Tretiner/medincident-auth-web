"use server";

import { redirect } from "next/navigation";
import { env } from "@/shared/config/env";
import { deleteSession, getActiveIdps, startIdpIntent, createSessionByUserId, getSession, completeAuthRequest, searchUserSessions } from "@/services/zitadel/api";
import { addSessionToCookie, getAllSessions, removeSessionFromCookie } from "@/services/zitadel/cookies";
import { getQrEntry } from "@/services/zitadel/qr-store";
import { getUserIdFromNextAuth } from "@/services/zitadel/session";
import { decodeJwt } from "jose";
import { signOut } from "@/services/zitadel/user/auth";

export async function fetchProvidersAction() {
  const response = await getActiveIdps();
  console.log("Полученные провайдеры:", JSON.stringify(response));
  
  if (!response.success) {
    console.error("Ошибка при получении провайдеров:", response.error);
    return [];
  }
  
  return response.data.identityProviders || [];
}

export async function loginWithProviderAction(idpId: string, requestId?: string) {
  const baseUrl = env.APP_URL;

  const successUrl = requestId 
    ? `${baseUrl}/login/callback/success?requestId=${requestId}` 
    : `${baseUrl}/login/callback/success`;

  const response = await startIdpIntent({
    idpId,
    urls: {
      successUrl: successUrl,
      failureUrl: `${baseUrl}/login/callback/failure`,
    },
  });

  if (!response.success || !response.data?.authUrl) {
    throw new Error("Не удалось запустить авторизацию");
  }

  redirect(response.data.authUrl);
}

export async function applyQrSessionAction(token: string) {
  // token = user_code
  const entry = getQrEntry(token);

  if (!entry || entry.status !== "confirmed" || !entry.idToken) {
    throw new Error("QR токен недействителен или истёк");
  }

  // Извлекаем userId из id_token JWT (sub = userId в ZITADEL)
  const claims = decodeJwt(entry.idToken);
  const userId = claims.sub;
  if (!userId) {
    throw new Error("Не удалось извлечь userId из токена");
  }

  // Создаём сессию для Device A через машинный юзер
  const sessionRes = await createSessionByUserId(userId);
  if (!sessionRes.success || !sessionRes.data?.sessionId || !sessionRes.data?.sessionToken) {
    throw new Error("Не удалось создать сессию");
  }

  const { sessionId, sessionToken } = sessionRes.data;

  // Получаем полные данные сессии (loginName, organizationId и т.д.)
  const sessionDataRes = await getSession(sessionId);
  const session = sessionDataRes.success ? sessionDataRes.data?.session : undefined;
  const userFactors = session?.factors?.user || {};

  await addSessionToCookie({
    session: {
      id: sessionId,
      token: sessionToken,
      creationTs: new Date(session?.creationDate || Date.now()).getTime().toString(),
      expirationTs: new Date(session?.expirationDate || Date.now() + 86400000).getTime().toString(),
      changeTs: new Date(session?.changeDate || Date.now()).getTime().toString(),
      loginName: userFactors.loginName || "unknown",
      organization: userFactors.organizationId || "",
    },
    cleanup: true,
  });

  console.log("[auth:applyQrSession] Сессия создана для userId=%s, sessionId=%s", userId, sessionId);

  // Если QR показывался в контексте OIDC флоу — завершаем auth request
  const requestId = entry.requestId;
  if (requestId) {
    const authRes = await completeAuthRequest(requestId, sessionId, sessionToken);
    if (authRes.success) {
      const redirectUrl = authRes.data.callbackUrl || authRes.data.url;
      if (redirectUrl) redirect(redirectUrl);
    }
  }

  redirect("/profile");
}

export async function logoutAction() {
  console.log("[auth:logout] Начинаем выход...");

  const knownSessions = await getAllSessions();

  // 1. Определяем сессию для выхода через NextAuth → userId → searchUserSessions
  const userId = await getUserIdFromNextAuth();
  let targetSession = null as (typeof knownSessions)[number] | null;

  if (userId) {
    const res = await searchUserSessions(userId);
    const zitadelIds = new Set(
      (res.success ? res.data?.sessions || [] : []).map((s: any) => s.id)
    );
    targetSession = knownSessions.find(s => zitadelIds.has(s.id)) ?? null;
  }

  // Fallback: если userId не найден (accessToken недоступен), удаляем все сессии из куки
  if (!targetSession && knownSessions.length > 0) {
    console.log("[auth:logout] Fallback: userId не найден, удаляем все %d сессий из куки", knownSessions.length);
    for (const s of knownSessions) {
      try {
        await deleteSession(s.id, s.token);
        console.log("[auth:logout] Сессия удалена в Zitadel: sessionId=%s", s.id);
      } catch (e) {
        console.error("[auth:logout] Ошибка при удалении сессии %s:", s.id, e);
      }
      await removeSessionFromCookie(s.id);
    }
  } else if (targetSession) {
    // 2. Удаляем конкретную сессию в Zitadel
    try {
      await deleteSession(targetSession.id, targetSession.token);
      console.log("[auth:logout] Сессия удалена в Zitadel: sessionId=%s", targetSession.id);
    } catch (e) {
      console.error("[auth:logout] Ошибка при удалении сессии в Zitadel:", e);
    }
    // 3. Удаляем сессию из куки
    await removeSessionFromCookie(targetSession.id);
  } else {
    console.log("[auth:logout] Нет сессий для удаления");
  }

  // 4. Завершаем NextAuth сессию и редиректим на логин
  await signOut({ redirectTo: "/login" });
}