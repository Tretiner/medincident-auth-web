"use server";

import { redirect } from "next/navigation";
import { env } from "@/env";
import { TelegramUser } from "@/domain/auth/types";
import {
  createSession,
  deleteSession,
} from "@/app/services/session/session-service";
import {
  loginWithTelegram,
  loginWithTelegramMock,
} from "@/app/services/server-http-client";
import { delay } from "@/lib/utils";

export async function fetchQrCode(): Promise<string> {
  try {
    const response = await fetch(`${env.NEXT_PUBLIC_APP_URL}/api/auth`, {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch QR code");
    }

    const data = await response.json();
    return `/медведь-гол-гоооол.gif`;
    // return data.url;
  } catch (error) {
    console.error("QR Fetch Error:", error);
    return `/медведь-гол-гоооол.gif`;
  }
}

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
  deleteSession();
  redirect("/login");
}

export async function login(provider: string): Promise<boolean> {
  await delay(1000);
  return true;
}
