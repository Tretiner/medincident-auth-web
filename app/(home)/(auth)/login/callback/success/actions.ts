// app/actions/auth.ts
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Импортируем ваши методы для работы с пользователями и сессиями
import { createHumanUser, createSession, addIdpLinkToUser } from "@/lib/zitadel/zitadel-api";
import { addSessionToCookie } from "@/lib/zitadel/zitadel-cookies";

// Подтягиваем переменные окружения (используйте ваш способ из env)
const BASE_URL = process.env.ZITADEL_API_URL || process.env.NEXT_PUBLIC_AUTH_URL;
const TOKEN = process.env.ZITADEL_API_TOKEN;

/**
 * Имплементация завершения OIDC / SAML флоу.
 * Делает POST запрос в ZITADEL, привязывая сессию к requestId, и получает ссылку для редиректа.
 */
async function completeAuthFlow(sessionId: string, sessionToken: string, requestId: string): Promise<string> {
  let endpoint = "";

  // Определяем, какой это запрос: OIDC или SAML
  if (requestId.startsWith("oidc_")) {
    endpoint = `/v2/oidc/auth_requests/${requestId}`;
  } else if (requestId.startsWith("saml_")) {
    endpoint = `/v2/saml/auth_requests/${requestId}`;
  } else {
    throw new Error("Неизвестный тип requestId. Ожидается префикс oidc_ или saml_");
  }

  const url = `${BASE_URL}${endpoint}`;
  console.log(`\nPOST ${url} \nBODY: { session: { sessionId, sessionToken } }`);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({
      session: {
        sessionId: sessionId,
        sessionToken: sessionToken,
      },
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error("Ошибка завершения Auth Request в ZITADEL:", errorData);
    throw new Error("Не удалось завершить OIDC-запрос. Возможно, requestId устарел.");
  }

  const data = await response.json();

  // ZITADEL возвращает { "redirectUri": "..." } для OIDC
  // Для SAML может возвращаться samlData.url, поэтому берем то, что есть
  const redirectUrl = data.redirectUri || data.url;

  if (!redirectUrl) {
    throw new Error("ZITADEL не вернул redirectUri");
  }

  return redirectUrl;
}

/**
 * Универсальная функция финализации авторизации
 * Теперь принимает полный объект data, возвращаемый API Zitadel.
 */
async function finishAuth(sessionResData: any, requestId?: string) {
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
    const redirectUrl = await completeAuthFlow(sessionResData.sessionId, sessionResData.sessionToken, requestId);
    redirect(redirectUrl);
  } else {
    // Записываем ID выбранной сессии в отдельную куку "текущего пользователя"
    cookieStore.set("zitadel_current_session", sessionResData.sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
    });
    redirect("/profile/details");
  }
}
// ==========================================
// ЭКШЕНЫ ДЛЯ КЛИЕНТСКОГО КОМПОНЕНТА
// ==========================================

export async function handleLoginAction(userId: string, intentId: string, intentToken: string, requestId?: string) {
  const sessionRes = await createSession(userId, intentId, intentToken);
  console.log("Ответ от createSession:", JSON.stringify(sessionRes));

  if (!sessionRes.success || !sessionRes.data?.sessionToken || !sessionRes.data?.sessionId) {
    throw new Error("Ошибка при создании сессии. Ответ ZITADEL: " + JSON.stringify(sessionRes.error));
  }

  await finishAuth(sessionRes.data, requestId);
}

export async function handleRegisterAction(intentId: string, intentToken: string, payload: any, requestId?: string) {
  const userRes = await createHumanUser(payload);
  console.log("Ответ от createHumanUser:", JSON.stringify(userRes));

  if (!userRes.success || !userRes.data?.userId) {
    throw new Error("Ошибка при регистрации: " + JSON.stringify(userRes.error));
  }

  const sessionRes = await createSession(userRes.data.userId, intentId, intentToken);
  console.log("Ответ от createSession:", JSON.stringify(sessionRes));

  if (!sessionRes.success || !sessionRes.data?.sessionToken || !sessionRes.data?.sessionId) {
    throw new Error("Пользователь создан, но не удалось создать сессию");
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