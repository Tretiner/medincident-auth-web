"use server";

import { redirect } from "next/navigation";
import { createSessionWithPassword } from "@/services/zitadel/api";
import { finishAuth } from "../callback/success/actions";

export interface EmailLoginState {
  errors?: { email?: string; password?: string; form?: string };
  values?: { email?: string };
}

export async function loginWithEmailAction(
  requestId: string | undefined,
  prevState: EmailLoginState,
  formData: FormData
): Promise<EmailLoginState> {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;

  const errors: EmailLoginState["errors"] = {};

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Введите корректный email";
  }
  if (!password || password.length < 1) {
    errors.password = "Введите пароль";
  }

  if (Object.keys(errors).length > 0) {
    return { errors, values: { email } };
  }

  const sessionRes = await createSessionWithPassword(email, password);

  if (!sessionRes.success || !sessionRes.data?.sessionId || !sessionRes.data?.sessionToken) {
    const errCode = (sessionRes as any).error?.code;
    const message =
      errCode === 4 || errCode === 5
        ? "Неверный email или пароль"
        : "Ошибка входа. Проверьте данные и попробуйте снова.";
    return { errors: { form: message }, values: { email } };
  }

  await finishAuth(sessionRes.data, requestId, email);
  // finishAuth вызывает redirect() — до этой строки не доходим
  return { errors: {}, values: { email } };
}
