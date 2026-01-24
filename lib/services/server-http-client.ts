"server only"

import { JwtUser, TelegramUser } from "@/domain/auth/types";
import { Result } from "@/domain/error";
import { env } from "@/config/env";
import { MockFullUser } from "@/lib/mock-db";
import { randomInt } from "crypto";
import { SignJWT } from "jose/jwt/sign";
import { handleFetch } from "@/lib/fetch-helper";
import { LoginByTelegramWidgetResponse, LoginByTelegramWidgetResponseSchema } from "@/domain/external-api";

const BASE_URL = env.NEXT_PUBLIC_AUTH_URL;

export async function loginWithTelegram(
  user: TelegramUser
): Promise<Result<LoginByTelegramWidgetResponse>> {
  console.log("json: " + JSON.stringify(user))
  return handleFetch(
    () =>
      fetch(`${BASE_URL}/telegram/widget`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user).toString(),
        cache: 'no-store'
      }),
    LoginByTelegramWidgetResponseSchema
  );
}


// MOCK CALLS

const key = new TextEncoder().encode(env.SESSION_SECRET);

export async function loginWithTelegramMock(): Promise<Result<LoginByTelegramWidgetResponse>> {
  return await mockSession();
}

export async function createSessionWithRefreshMock(
  refreshToken: string,
): Promise<Result<LoginByTelegramWidgetResponse>> {
  return await mockSession();
}

async function mockSession(): Promise<Result<LoginByTelegramWidgetResponse>> {
  const jwtUser: JwtUser = {
    sid: Math.floor(Math.random() * 100000).toString(),
    uid: MockFullUser.info.id
  };

  const token = await new SignJWT(jwtUser)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(key);

  return {
    success: true,
    data: {
      accessToken: {
        token: token,
        expiresIn: 7 * 24 * 60 * 60,
      },
      profile: {
        id: jwtUser.uid,
        firstName: "Ivan",
        lastName: "Ivanov",
        photoUrl: null, 
      }
    }
  };
}