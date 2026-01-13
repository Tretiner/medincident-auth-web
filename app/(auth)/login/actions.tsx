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
import { randomInt } from "crypto";

export interface QrResponse {
  url?: string;
  token?: string;
  expiresInSeconds: number; // время в секундах
}

export async function fetchQrCode(): Promise<QrResponse> {
  try {
    const token = crypto.randomUUID();
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=Auth_${token}&bgcolor=ffffff&color=000000&margin=0`;
    
    await delay(2000);

    return {
      url: `/медведь-гол-гоооол.gif`,
      expiresInSeconds: randomInt(1, 5),
    };

  } catch (error) {
    console.error("QR Fetch Error:", error);
    return {
      url: `/медведь-гол-гоооол.gif`,
      expiresInSeconds: 5 
    };
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
  await deleteSession();
  redirect("/login");
}

export async function login(provider: string): Promise<boolean> {
  await delay(1000);
  return true;
}
