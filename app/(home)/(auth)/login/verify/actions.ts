"use server";

import { verifyUserEmail, createSession, createSessionWithPassword } from "@/services/zitadel/api";
import { getRegFlowCookie, deleteRegFlowCookie } from "../_lib/reg-flow";
import { finishAuth } from "../callback/success/actions";

export interface VerifyState {
  errors?: { code?: string; form?: string };
}

export async function verifyEmailAction(
  prevState: VerifyState,
  formData: FormData
): Promise<VerifyState> {
  const code = (formData.get("code") as string)?.trim();

  if (!code ) {
    return { errors: { code: "Введите код подтверждения" } };
  }

  const flow = await getRegFlowCookie();
  if (!flow?.userId) {
    return { errors: { form: "Сессия устарела. Начните регистрацию заново." } };
  }

  // Верифицируем email
  const verifyRes = await verifyUserEmail(flow.userId, code);
  if (!verifyRes.success) {
    return { errors: { code: "Неверный или просроченный код. Запросите новый." } };
  }

  // Создаём сессию в зависимости от пути
  let sessionRes;

  if (flow.source === "idp" && flow.intentId && flow.intentToken) {
    // IDP путь — сессия через IDP intent
    sessionRes = await createSession(flow.userId, flow.intentId, flow.intentToken);
  } else if (flow.source === "email" && flow.password) {
    // Email путь — сессия через loginName + пароль
    sessionRes = await createSessionWithPassword(flow.loginName!, flow.password);
  } else {
    return { errors: { form: "Недостаточно данных для создания сессии." } };
  }

  if (!sessionRes.success || !sessionRes.data?.sessionId || !sessionRes.data?.sessionToken) {
    return { errors: { form: "Не удалось создать сессию: " + JSON.stringify((sessionRes as any).error) } };
  }

  await deleteRegFlowCookie();

  await finishAuth(sessionRes.data, flow.requestId, flow.loginName);
  return { errors: {} };
}
