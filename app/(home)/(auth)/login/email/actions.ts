"use server";

import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { createSessionWithPassword, searchUserByEmail, resendEmailVerification, listAuthMethods, hasTotpMethod } from "@/services/zitadel/api";
import { setRegFlowCookie, setTotpPendingCookie } from "../_lib/reg-flow";
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
  } else if (password.length < 8) {
    errors.password = "Пароль должен содержать не менее 8 символов";
  } else if (password.length > 70) {
    errors.password = "Пароль должен быть не более 70 символов";
  } else if (!/[A-ZА-ЯЁ]/.test(password)) {
    errors.password = "Пароль должен содержать заглавную букву";
  } else if (!/[a-zа-яё]/.test(password)) {
    errors.password = "Пароль должен содержать строчную букву";
  } else if (!/\d/.test(password)) {
    errors.password = "Пароль должен содержать цифру";
  } else if (!/[^a-zA-Zа-яА-ЯёЁ0-9\s]/.test(password)) {
    errors.password = "Пароль должен содержать символ или знак пунктуации";
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

  const { sessionId, sessionToken } = sessionRes.data;

  try {
    // Проверяем, подтверждён ли email пользователя
    const userSearch = await searchUserByEmail(email);
    const user = userSearch.success ? userSearch.data?.result?.[0] : undefined;
    const isVerified = user?.human?.email?.isVerified ?? true;

    if (!isVerified && user?.userId) {
      // Email не подтверждён — отправляем код и показываем экран верификации
      await resendEmailVerification(user.userId);
      await setRegFlowCookie({
        givenName: user.human?.profile?.givenName ?? "",
        familyName: user.human?.profile?.familyName ?? "",
        email,
        source: "login",
        requestId,
        userId: user.userId,
        loginName: email,
        sessionId,
        sessionToken,
      });
      const params = new URLSearchParams();
      if (requestId) params.set("requestId", requestId);
      redirect(`/login/verify?${params}`);
    }

    // Если у юзера включён TOTP — запрашиваем код перед завершением входа
    if (user?.userId) {
      const methods = await listAuthMethods(user.userId);
      if (methods.success && hasTotpMethod(methods.data.authMethodTypes)) {
        await setTotpPendingCookie({
          sessionId,
          sessionToken,
          userId: user.userId,
          loginName: email,
          requestId,
        });
        const params = new URLSearchParams();
        if (requestId) params.set("requestId", requestId);
        redirect(`/login/totp?${params}`);
      }
    }
  } catch (error) {
    if (isRedirectError(error)) throw error;
    // Если проверка не удалась — продолжаем без неё (не блокируем вход)
  }

  await finishAuth(sessionRes.data, requestId, email);
  // finishAuth вызывает redirect() — до этой строки не доходим
  return { errors: {}, values: { email } };
}
