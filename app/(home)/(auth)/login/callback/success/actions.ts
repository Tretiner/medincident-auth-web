// app/actions/auth.ts
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Импортируем ваши методы для работы с пользователями и сессиями
import { createHumanUser, createSession, addIdpLinkToUser } from "@/lib/zitadel/zitadel-api"; 

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
 */
async function finishAuth(sessionId: string, sessionToken: string, requestId?: string) {
  console.log("Завершаем авторизацию. Session ID:", sessionId, "Request ID:", requestId);

  if (requestId) {
    // === СЦЕНАРИЙ 1: SSO / OIDC FLOW (Вход для других приложений/Консоли) ===
    // Получаем финальную ссылку от ZITADEL
    const redirectUrl = await completeAuthFlow(sessionId, sessionToken, requestId);
    
    // Перенаправляем пользователя (ZITADEL сам поставит нужные глобальные SSO-куки)
    redirect(redirectUrl);
  } else {
    // === СЦЕНАРИЙ 2: ПРЯМОЙ ВХОД (Локальная сессия) ===
    // Если пользователь зашел по прямой ссылке /login (без requestId от других приложений)
    (await cookies()).set("zitadel_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 дней
    });

    redirect("/dashboard");
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

  await finishAuth(sessionRes.data.sessionId, sessionRes.data.sessionToken, requestId);
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

  await finishAuth(sessionRes.data.sessionId, sessionRes.data.sessionToken, requestId);
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

  await finishAuth(sessionRes.data.sessionId, sessionRes.data.sessionToken, requestId);
}