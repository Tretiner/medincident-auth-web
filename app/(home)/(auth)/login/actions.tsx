"use server";

import { redirect } from "next/navigation";
import { env } from "@/shared/config/env";
import { deleteSession, getActiveIdps, startIdpIntent, createSessionByUserId, getSession, completeAuthRequest } from "@/services/zitadel/api";
import { getCurrentSessionId, setCurrentSessionId } from "@/services/zitadel/current-session";
import { addSessionToCookie, getAllSessions, removeSessionFromCookie } from "@/services/zitadel/cookies";
import { getQrEntry } from "@/services/zitadel/qr-store";
import { decodeJwt } from "jose";
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

  await setCurrentSessionId(sessionId);

  // Если QR показывался в контексте OIDC флоу — завершаем auth request
  const requestId = entry.requestId;
  if (requestId) {
    const authRes = await completeAuthRequest(requestId, sessionId, sessionToken);
    if (authRes.success) {
      const redirectUrl = authRes.data.redirectUri || authRes.data.url;
      if (redirectUrl) redirect(redirectUrl);
    }
  }

  redirect("/profile");
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