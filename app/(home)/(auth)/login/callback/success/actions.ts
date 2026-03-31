// app/actions/auth.ts
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Импортируем ваши методы для работы с пользователями и сессиями
import { createHumanUser, createSession, addIdpLinkToUser, completeAuthRequest, deleteSession, searchUserSessions } from "@/services/zitadel/api";
import { addSessionToCookie, getAllSessions, removeSessionFromCookie } from "@/services/zitadel/cookies";
import { env } from "@/shared/config/env";

export async function completeAuthFlow(sessionId: string, sessionToken: string, requestId: string): Promise<string> {
  const result = await completeAuthRequest(requestId, sessionId, sessionToken);

  if (!result.success) {
    console.error("Ошибка завершения Auth Request в ZITADEL:", result.error);
    throw new Error("Не удалось завершить OIDC-запрос. Возможно, requestId устарел.");
  }

  // ZITADEL возвращает { "redirectUri": "..." } для OIDC или { "url": "..." } для SAML
  const redirectUrl = result.data.redirectUri || result.data.url;

  if (!redirectUrl) {
    throw new Error("ZITADEL не вернул redirectUri");
  }

  return redirectUrl;
}
/**
 * Универсальная функция финализации авторизации
 * Теперь принимает полный объект data, возвращаемый API Zitadel.
 */
export async function finishAuth(sessionResData: any, requestId?: string) {
  // 1. Извлекаем детальную информацию о сессии из ответа ZITADEL
  // (В ответе createSession обычно есть поля sessionId, sessionToken и объект session)
  const sessionDetails = sessionResData.session || {};
  const userFactors = sessionDetails.factors?.user || {};

  // Формируем объект согласно новому интерфейсу Cookie
  const newSessionCookie = {
    id: sessionResData.sessionId,
    token: sessionResData.sessionToken,
    creationTs: new Date(sessionDetails.creationDate || Date.now()).getTime().toString(),
    expirationTs: new Date(sessionDetails.expirationDate || Date.now() + 86400000).getTime().toString(),
    changeTs: new Date(sessionDetails.changeDate || Date.now()).getTime().toString(),
    loginName: userFactors.loginName || "unknown",
    organization: userFactors.organizationId || "",
    requestId: requestId,
  };

  // Сохраняем сессию через твой новый менеджер (с авто-очисткой старых)
  await addSessionToCookie({
    session: newSessionCookie,
    cleanup: true,
  });

  const cookieStore = await cookies();

  // 2. РАЗВИЛКА ЛОГИНА
  if (requestId) {
    console.log("OIDC/SAML ROUTE:")
    const redirectUrl = await completeAuthFlow(sessionResData.sessionId, sessionResData.sessionToken, requestId);
    redirect(redirectUrl);
  } else {
    console.log("PROFILE ROUTE:")
    // Записываем ID выбранной сессии в отдельную куку "текущего пользователя"
    cookieStore.set("zitadel_current_session", sessionResData.sessionId, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
    });
    redirect("/profile");
  }
}
// ==========================================
// ЭКШЕНЫ ДЛЯ КЛИЕНТСКОГО КОМПОНЕНТА
// ==========================================

export async function handleLoginAction(userId: string, intentId: string, intentToken: string, requestId?: string) {
  // --- НАЧАЛО БОРЬБЫ С ДУБЛИКАТАМИ ---
  const knownSessions = await getAllSessions(true);
  
  const userSessionsRes = await searchUserSessions(userId);
  if (userSessionsRes.success && userSessionsRes.data.sessions) {
    const activeSessions = userSessionsRes.data.sessions;
    
    // Ищем, есть ли среди активных сессий юзера те, что лежат у нас в браузере
    for (const activeSess of activeSessions) {
      const localSess = knownSessions.find(ks => ks.id === activeSess.id);
      if (localSess) {
        // Нашли старую сессию этого юзера в этом же браузере! Удаляем ее.
        await deleteSession(localSess.id, localSess.token);
        await removeSessionFromCookie(localSess.id);
      }
    }
  }
  // --- КОНЕЦ БОРЬБЫ С ДУБЛИКАТАМИ ---

  const sessionRes = await createSession(userId, intentId, intentToken);
  console.log("Ответ от createSession:", JSON.stringify(sessionRes));

  if (!sessionRes.success || !sessionRes.data?.sessionToken || !sessionRes.data?.sessionId) {
    throw new Error("Ошибка при создании сессии. Ответ ZITADEL: " + JSON.stringify(sessionRes));
  }

  await finishAuth(sessionRes.data, requestId);
}

export async function handleLinkAction(targetUserId: string, intentId: string, intentToken: string, idpInformation: any, requestId?: string) {
  const idpLink = {
    idpId: idpInformation.idpId,
    userId: idpInformation.userId,
    userName: idpInformation.userName,
  };

  const linkRes = await addIdpLinkToUser(targetUserId, idpLink);
  console.log("Ответ от addIdpLinkToUser:", JSON.stringify(linkRes));

  if (!linkRes.success) {
    throw new Error("Ошибка при привязке аккаунта: " + JSON.stringify(linkRes.error));
  }

  const sessionRes = await createSession(targetUserId, intentId, intentToken);
  console.log("Ответ от createSession:", JSON.stringify(sessionRes));

  if (!sessionRes.success || !sessionRes.data?.sessionToken || !sessionRes.data?.sessionId) {
    throw new Error("Аккаунт привязан, но не удалось создать сессию");
  }

  await finishAuth(sessionRes.data, requestId);
}

export async function selectAccountAction(sessionId: string, sessionToken: string, requestId?: string) {
  try {
    return await completeAuthFlow(sessionId, sessionToken, requestId ?? "");
  } catch (error: any) {
    // Если сессия протухла в момент клика, возвращаем ошибку, 
    // чтобы UI мог обработать её и предложить войти заново
    return { success: false, error: error.message };
  }
}