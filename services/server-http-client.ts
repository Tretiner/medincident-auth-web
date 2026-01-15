"server only"

import { JwtUser, TelegramUser } from "@/domain/auth/types";
import { Result } from "@/domain/error";
import { env } from "@/config/env";
import { MockFullUser } from "@/lib/mock-db";
import { randomInt } from "crypto";
import { SignJWT } from "jose/jwt/sign";
import { handleFetch } from "@/lib/fetch-helper";
import { ServiceAuthResponse, ServiceAuthResponseSchema } from "@/domain/external-api";

const BASE_URL = env.NEXT_PUBLIC_EXTERNAL_API;

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


// MOCK CALLS

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
    uid: MockFullUser.info.id
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