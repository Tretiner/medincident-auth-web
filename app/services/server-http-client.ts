import { ServiceAuthResponse, ServiceAuthResponseSchema } from "@/domain/auth/dto";
import { JwtUser, TelegramUser } from "@/domain/auth/types";
import { Result } from "@/domain/error";
import { env } from "@/env";
import { MockFullUser } from "@/lib/mock-db";
import { randomInt } from "crypto";
import { SignJWT } from "jose/jwt/sign";
import { use } from "react";
import z from "zod";

const BASE_URL = env.NEXT_PUBLIC_EXTERNAL_API;

async function handleFetch<T>(
  request: () => Promise<Response>,
  schema: z.Schema<T>
): Promise<Result<T>> {
  try {
    const response = await request();

    // 1. Обработка HTTP ошибок (4xx, 5xx)
    if (!response.ok) {
      let errorMessage = "Ошибка сервера";
      try {
        const errorBody = await response.text();
        errorMessage = errorBody || response.statusText;
      } catch {
        /* игнорируем, если тело не читается */
      }

      return {
        success: false,
        error: {
          type: "API_ERROR",
          code: response.status,
          message: errorMessage,
        },
      };
    }

    // 2. Парсинг успешного ответа
    const rawData = await response.json();
    const parseResult = schema.safeParse(rawData);

    if (!parseResult.success) {
      console.error("Zod Validation Failed:", parseResult.error);
      return {
        success: false,
        error: {
          type: "VALIDATION_ERROR",
          message: "Некорректный ответ от сервера авторизации",
        },
      };
    }

    return { success: true, data: parseResult.data };

  } catch (err) {
    console.error("Network Error:", err);
    return {
      success: false,
      error: {
        type: "NETWORK_ERROR",
        message: "Не удалось выполнить запрос. Проверьте соединение.",
      },
    };
  }
}

export async function loginWithTelegram(
  user: TelegramUser
): Promise<Result<ServiceAuthResponse>> {
  return handleFetch(
    () =>
      fetch(`${BASE_URL}/auth.loginWithTelegram`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
        cache: 'no-store'
      }),
    ServiceAuthResponseSchema
  );
}



const key = new TextEncoder().encode(env.SESSION_SECRET);

export async function loginWithTelegramMock(): Promise<Result<ServiceAuthResponse>> {
  return await mockSession();
}

export async function createSessionWithRefreshMock(
  refreshToken: string,
): Promise<Result<ServiceAuthResponse>> {
  return await mockSession();
}

async function mockSession(): Promise<Result<ServiceAuthResponse>> {
  const jwtUser: JwtUser = {
    sid: randomInt(100000).toString(),
    uid: MockFullUser.id
  }

  return { success: true, data: { 
    UserID: jwtUser.uid,
    AccessToken: await new SignJWT(jwtUser)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d') // Токен живет 7 дней
        .sign(key),
    AccessExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
    RefreshToken: "refresh:" + jwtUser.uid,
    RefreshExpiresAt: new Date(Date.now() + 5 * 60 * 60 * 1000),
   }}
}