"server only";

import { JwtUser, TelegramUser } from "@/domain/auth/types";
import { Result } from "@/domain/error";
import { env } from "@/config/env";
import { MockFullUser, MockOAuthApps, SCOPE_DESCRIPTIONS } from "@/lib/mock-db";
import { randomInt } from "crypto";
import { SignJWT } from "jose/jwt/sign";
import { authorizedFetch, handleFetch } from "@/lib/fetch-helper";
import {
  RefreshTokenResponse,
  RefreshTokenResponseSchema,
  EmptyBody,
  LoginByTelegramWidgetResponse,
  LoginByTelegramWidgetResponseSchema,
} from "@/domain/external-api";
import {
  CheckConsentRequest,
  CheckConsentResponse,
  checkConsentResponseSchema,
} from "@/domain/consent/schema";
import { delay } from "../utils";
import { getAccessToken } from "./access-token-manager";

const Method = {
  Get: "GET",
  Post: "POST",
}

const Headers = {
  Content: {
    Json: {"Content-Type": "application/json",}
  }
}

const BASE_URL = env.NEXT_PUBLIC_AUTH_URL;

export async function loginWithTelegram(
  body: TelegramUser,
): Promise<Result<LoginByTelegramWidgetResponse>> {
  console.log(
    `\nPOST ${BASE_URL}/telegram/widget:\nBODY: ${JSON.stringify(body).toString()}`
  );
  return handleFetch(
    () =>
      fetch(`${BASE_URL}/telegram/widget`, {
        method: Method.Post,
        headers: Headers.Content.Json,
        body: JSON.stringify(body),
        cache: "no-store",
      }),
    LoginByTelegramWidgetResponseSchema,
  );
}

export async function fetchConsent(
  body: CheckConsentRequest
): Promise<Result<CheckConsentResponse>> {
  console.log(
    `\n(SECURE) POST ${BASE_URL}/oauth/consent/check\nTOKEN: ${getAccessToken()}\nBODY: ${JSON.stringify(body).toString()}\n`
  );
  return authorizedFetch(
    `${BASE_URL}/oauth/consent/check`,
    {
      method: Method.Post,
      headers: Headers.Content.Json,
      body: JSON.stringify(body),
      credentials: 'include',
      cache: "no-store",
    },
    checkConsentResponseSchema,
  );
}

export async function refreshToken(): Promise<Result<RefreshTokenResponse>> {
  console.log(`\nPOST ${BASE_URL}/oauth/token/refresh:\n`);
  return handleFetch(
    () =>
      fetch(`${BASE_URL}/oauth/token/refresh`, {
        method: Method.Post,
        credentials: 'include',
        cache: "no-store",
      }),
    RefreshTokenResponseSchema,
  );
}

export async function logout(): Promise<Result<void>> {
  console.log(
    `\nPOST ${BASE_URL}/oauth/logout\n`
  );

  return authorizedFetch(
    `${BASE_URL}/oauth/logout`,
    {
      method: Method.Post,
      credentials: 'include',
      cache: "no-store",
    },
    EmptyBody,
  );
  
}

// MOCK CALLS

const key = new TextEncoder().encode(env.SESSION_SECRET);

export async function loginWithTelegramMock(): Promise<
  Result<LoginByTelegramWidgetResponse>
> {
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
    uid: MockFullUser.info.id,
  };

  const token = await new SignJWT(jwtUser)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
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
      },
    },
  };
}

export async function fetchConsentMock(
  clientId: string,
  scopes: string[],
  redirectUri: string,
): Promise<Result<CheckConsentResponse>> {
  await delay(800);

  const app = MockOAuthApps[clientId];

  if (!app) {
    return {
      success: true,
      data: {
        valid: false,
        name: "Unknown App",
        hostname: "unknown",
        scopes: [],
      },
    };
  }

  // Формируем список запрашиваемых прав с описаниями
  const mappedScopes = scopes.map((s) => ({
    name: s,
    description: SCOPE_DESCRIPTIONS[s] || null,
  }));

  return {
    success: true,
    data: {
      valid: true,
      name: app.name,
      hostname: app.hostname,
      photoUrl: app.photoUrl,
      scopes: mappedScopes,
    },
  };
}
