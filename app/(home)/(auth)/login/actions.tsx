"use server";

import { redirect } from "next/navigation";
import { env } from "@/config/env";
import { TelegramUser } from "@/domain/auth/types";
import {
  createSession,
  deleteSession,
} from "@/services/session/session-service";
import {
  loginWithTelegram,
  loginWithTelegramMock,
} from "@/services/server-http-client";
import { delay } from "@/lib/utils";

export async function telegramLoginAction(user: TelegramUser) {
  try {
    let apiResult;
    if (env.isDev) {
      apiResult = await loginWithTelegramMock();
    } else {
      apiResult = await loginWithTelegram(user);
    }

    if (!apiResult.success) {
      console.error(
        `Login Failed: [${apiResult.error.type}] ${apiResult.error.message}`
      );

      let uiMessage = "Ошибка авторизации";
      if (apiResult.error.type === "NETWORK_ERROR")
        uiMessage = "Проблемы с сетью";
      if (apiResult.error.code === 401)
        uiMessage = "Пользователь не найден или данные устарели";

      return { success: false, error: uiMessage };
    }

    const result = apiResult.data;

    await createSession(
      result.UserID,
      result.AccessToken,
      result.AccessExpiresAt,
      result.RefreshToken,
      result.RefreshExpiresAt
    );

    return { success: true };
  } catch (error) {
    console.error("Server Action Error:", error);
    return { success: false, error: "Внутренняя ошибка сервера" };
  }
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}

export async function login(provider: string): Promise<boolean> {
  await delay(1000);
  return true;
}
