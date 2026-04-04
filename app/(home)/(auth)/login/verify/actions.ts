"use server";

import { verifyUserEmail, createSession, createSessionWithPassword } from "@/services/zitadel/api";
import { getRegFlowCookie, deleteRegFlowCookie } from "../_lib/reg-flow";
import { getCurrentSessionId } from "@/services/zitadel/current-session";
import { getSessionCookieById } from "@/services/zitadel/cookies";
import { zitadelApi } from "@/services/zitadel/api/client";
import { finishAuth } from "../callback/success/actions";

export interface VerifyState {
  errors?: { code?: string; form?: string };
}

export async function verifyEmailAction(
  prevState: VerifyState,
  formData: FormData
): Promise<VerifyState> {
  const code = (formData.get("code") as string)?.trim();

  if (!code) {
    return { errors: { code: "Введите код подтверждения" } };
  }

  const flow = await getRegFlowCookie();

  // Получаем userId: из куки или из текущей сессии
  let userId: string;
  if (flow?.userId) {
    userId = flow.userId;
  } else {
    const sessionId = await getCurrentSessionId();
    if (!sessionId) return { errors: { form: "Сессия устарела. Войдите заново." } };

    let sessionData: any;
    try {
      const res = await zitadelApi.get(`/v2/sessions/${sessionId}`);
      sessionData = res.data?.session;
    } catch {
      return { errors: { form: "Сессия устарела. Войдите заново." } };
    }

    const uid: string | undefined = sessionData?.factors?.user?.id;
    if (!uid) return { errors: { form: "Сессия устарела. Войдите заново." } };
    userId = uid;
  }

  // Верифицируем email
  const verifyRes = await verifyUserEmail(userId, code);
  if (!verifyRes.success) {
    return { errors: { code: "Неверный или просроченный код. Запросите новый." } };
  }

  // Получаем данные сессии для finishAuth
  let sessionData: { sessionId: string; sessionToken: string };
  let requestId: string | undefined;
  let loginName: string | undefined;

  if (flow) {
    if (flow.source === "login" && flow.sessionId && flow.sessionToken) {
      sessionData = { sessionId: flow.sessionId, sessionToken: flow.sessionToken };
    } else if (flow.source === "idp" && flow.intentId && flow.intentToken) {
      const sessionRes = await createSession(flow.userId!, flow.intentId, flow.intentToken);
      if (!sessionRes.success || !sessionRes.data?.sessionId || !sessionRes.data?.sessionToken) {
        return { errors: { form: "Не удалось создать сессию: " + JSON.stringify((sessionRes as any).error) } };
      }
      sessionData = sessionRes.data;
    } else if (flow.source === "email" && flow.password) {
      const sessionRes = await createSessionWithPassword(flow.loginName!, flow.password);
      if (!sessionRes.success || !sessionRes.data?.sessionId || !sessionRes.data?.sessionToken) {
        return { errors: { form: "Не удалось создать сессию: " + JSON.stringify((sessionRes as any).error) } };
      }
      sessionData = sessionRes.data;
    } else {
      return { errors: { form: "Недостаточно данных для создания сессии." } };
    }
    requestId = flow.requestId;
    loginName = flow.loginName;
    await deleteRegFlowCookie();
  } else {
    // Путь из профиля — сессия уже активна, берём из куки
    const sessionId = await getCurrentSessionId();
    if (!sessionId) return { errors: { form: "Сессия устарела. Войдите заново." } };

    const sessionCookie = await getSessionCookieById({ sessionId });
    if (!sessionCookie?.token) return { errors: { form: "Сессия устарела. Войдите заново." } };

    sessionData = { sessionId, sessionToken: sessionCookie.token };
    loginName = sessionCookie.loginName;
  }

  await finishAuth(sessionData, requestId, loginName);
  return { errors: {} };
}
