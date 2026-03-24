"use server";

import { redirect } from "next/navigation";
import { env } from "@/config/env";
import { deleteSession, getActiveIdps, startIdpIntent } from "@/lib/zitadel/api";
import { getCurrentSessionId } from "@/lib/zitadel/zitadel-current-session";
import { getAllSessions, getSessionCookieById, removeSessionFromCookie } from "@/lib/zitadel/zitadel-cookies";
import { cookies } from "next/headers";

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

export async function logoutAction() {
  const currentSessionId = await getCurrentSessionId();
  const knownSessions = await getAllSessions();
  
  // Находим токен текущей сессии
  const currentSession = knownSessions.find(s => s.id === currentSessionId);

  if (currentSessionId && currentSession?.token) {
    try {
      // 1. Удаляем сессию на сервере ZITADEL (передаем sessionToken!)
      await deleteSession(currentSessionId, currentSession.token);
    } catch (e) {
      console.error("Ошибка при удалении сессии в ZITADEL:", e);
    }
  }

  const cookieStore = await cookies();
  
  // 2. Удаляем ID текущей сессии
  cookieStore.delete("zitadel_current_session");
  
  // 3. Удаляем саму сессию из массива известных сессий в куках
  if (currentSessionId) {
    await removeSessionFromCookie(currentSessionId);
  }

  // 4. Редирект на логин
  redirect("/login");
}