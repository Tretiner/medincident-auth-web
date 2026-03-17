"server only";

import { z } from "zod";
import { Result } from "@/domain/error";
import { env } from "@/config/env";
import { handleFetch } from "@/lib/fetch-helper";

// --- Schemas & Types ---

export const ZitadelIdpOptionsSchema = z.object({
  isLinkingAllowed: z.boolean(),
  isCreationAllowed: z.boolean(),
});

export const ZitadelIdpSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  options: ZitadelIdpOptionsSchema.optional(),
});

export const ZitadelDetailsSchema = z.object({
  totalResult: z.string(),
  timestamp: z.string(),
});

export const ZitadelGetIdpsResponseSchema = z.object({
  details: ZitadelDetailsSchema,
  identityProviders: z.array(ZitadelIdpSchema).optional(),
});

export type ZitadelGetIdpsResponse = z.infer<typeof ZitadelGetIdpsResponseSchema>;
export type ZitadelIdp = z.infer<typeof ZitadelIdpSchema>;

// --- Constants ---

const Method = {
  Get: "GET",
  Post: "POST",
};

const Headers = {
  Accept: {
    Json: { "Accept": "application/json" },
  },
  Content: {
    Json: { "Content-Type": "application/json" },
  },
};

const BASE_URL = env.ZITADEL_API_URL;
const TOKEN = env.ZITADEL_API_TOKEN;



// --- API Client Methods ---

/**
 * Fetches the list of active Identity Providers (IDPs) from ZITADEL.
 */
export async function getZitadelIdps(): Promise<Result<ZitadelGetIdpsResponse>> {
  const url = `${BASE_URL}/v2/settings/login/idps`;
  console.log(`\nGET ${url}`);
  return handleFetch(
    () =>
      fetch(url, {
        method: Method.Get,
        headers: {
          ...Headers.Content.Json,
          "Authorization": `Bearer ${TOKEN}`,
        },
        cache: "no-store",
      }),
    ZitadelGetIdpsResponseSchema,
  );
}




// Тип для тела запроса (Request Body)
export interface ZitadelStartIdpIntentRequest {
  idpId: string;
  urls: {
    successUrl: string;
    failureUrl: string;
  };
}

// Схема для поля details в ответе Intent (она немного отличается от списка IDP)
export const ZitadelIntentDetailsSchema = z.object({
  sequence: z.string().optional(),
  changeDate: z.string().optional(),
  resourceOwner: z.string().optional(),
});

// Схема успешного ответа от ZITADEL
export const ZitadelStartIdpIntentResponseSchema = z.object({
  details: ZitadelIntentDetailsSchema.optional(),
  authUrl: z.string(), // Самое важное поле — ссылка для редиректа
});

export type ZitadelStartIdpIntentResponse = z.infer<typeof ZitadelStartIdpIntentResponseSchema>;


/**
 * Инициирует процесс входа через внешнего Identity Provider (IDP).
 * Возвращает `authUrl`, на который нужно сделать редирект пользователя.
 */
export async function startIdpIntent(
  body: ZitadelStartIdpIntentRequest
): Promise<Result<ZitadelStartIdpIntentResponse>> {
  const url = `${BASE_URL}/v2/idp_intents`;

  console.log(`\nPOST ${url}\nBODY: ${JSON.stringify(body)}`);

  return handleFetch(
    () =>
      fetch(url, {
        method: Method.Post,
        headers: {
          ...Headers.Content.Json,
          "Authorization": `Bearer ${TOKEN}`,
        },
        body: JSON.stringify(body),
        cache: "no-store",
      }),
    ZitadelStartIdpIntentResponseSchema,
  );
}


// --- Схемы для Retrieve IDP Intent ---

export const ZitadelIdpInformationSchema = z.object({
  idpId: z.string().optional(),
  userId: z.string().optional(),
  userName: z.string().optional(),
  rawInformation: z.any().optional(),
}).catchall(z.any());

export const ZitadelRetrieveIdpIntentResponseSchema = z.object({
  details: ZitadelIntentDetailsSchema.optional(),
  idpInformation: ZitadelIdpInformationSchema.optional(),
});

export type ZitadelRetrieveIdpIntentResponse = z.infer<typeof ZitadelRetrieveIdpIntentResponseSchema>;


// --- API Метод ---

/**
 * Отправляет token и id интента обратно в ZITADEL, 
 * чтобы получить данные пользователя от внешнего провайдера.
 */
export async function retrieveIdpIntent(
  intentId: string,
  intentToken: string
): Promise<Result<ZitadelRetrieveIdpIntentResponse>> {
  const url = `${BASE_URL}/v2/idp_intents/${intentId}`;

  console.log(`\nPOST ${url}\nBODY: { "idpIntentToken": "***" }`);

  return handleFetch(
    () =>
      fetch(url, {
        method: Method.Post, // Обратите внимание: это POST запрос!
        headers: {
          ...Headers.Content.Json,
          "Authorization": `Bearer ${TOKEN}`,
        },
        body: JSON.stringify({ idpIntentToken: intentToken }),
        cache: "no-store",
      }),
    ZitadelRetrieveIdpIntentResponseSchema,
  );
}



// --- Схемы и Типы для Регистрации и Сессий ---

export const ZitadelCreateHumanUserResponseSchema = z.object({
  userId: z.string(),
  details: z.any().optional(),
}).catchall(z.any());

export const ZitadelCreateSessionResponseSchema = z.object({
  sessionId: z.string(),
  sessionToken: z.string(), // Самое важное! Это токен авторизации для куки
}).catchall(z.any());

// --- Новые API Методы ---

/**
 * Шаг Регистрации: Создает нового пользователя в ZITADEL и сразу линкует его с IDP
 */
export async function createHumanUser(
  body: any // Передаем модифицированный объект addHumanUser
): Promise<Result<z.infer<typeof ZitadelCreateHumanUserResponseSchema>>> {
  const url = `${BASE_URL}/v2/users/human`;

  return handleFetch(
    () =>
      fetch(url, {
        method: Method.Post,
        headers: {
          ...Headers.Accept.Json,
          ...Headers.Content.Json,
          "Authorization": `Bearer ${TOKEN}`,
        },
        body: JSON.stringify(body),
        cache: "no-store",
      }),
    ZitadelCreateHumanUserResponseSchema,
  );
}


// --- Схемы для Логина и Привязки (Link) ---

// Схема ответа при успешной привязке соцсети к существующему юзеру
export const ZitadelAddIdpLinkResponseSchema = z.object({
  details: z.any().optional(),
}).catchall(z.any());

// --- API Методы ---

/**
 * ЗАПРОС ПРИВЯЗКИ (Add social login to existing user)
 * Привязывает внешний аккаунт (например, Telegram) к уже существующему пользователю в ZITADEL.
 * * @param systemUserId ID пользователя в базе ZITADEL (например, 218385419895570689)
 * @param idpLink Объект с данными провайдера (idpId, userId в провайдере, userName)
 */
export async function addIdpLinkToUser(
  systemUserId: string,
  idpLink: {
    idpId: string;
    userId: string;
    userName: string;
  }
): Promise<Result<z.infer<typeof ZitadelAddIdpLinkResponseSchema>>> {
  const url = `${BASE_URL}/v2/users/${systemUserId}/links`;

  console.log(`\nPOST ${url}\nBODY: ${JSON.stringify({ idpLink })}`);

  return handleFetch(
    () =>
      fetch(url, {
        method: Method.Post,
        headers: {
          ...Headers.Content.Json,
          "Authorization": `Bearer ${TOKEN}`,
        },
        body: JSON.stringify({ idpLink }),
        cache: "no-store",
      }),
    ZitadelAddIdpLinkResponseSchema,
  );
}

/**
 * ЗАПРОС ЛОГИНА (Login)
 * Создает сессию для пользователя, используя его ID и токены интента.
 * Используется, когда пользователь УЖЕ привязан к этому IDP (в URL вернулся userId).
 */
export async function createSession(
  userId: string,
  idpIntentId: string,
  idpIntentToken: string
): Promise<Result<z.infer<typeof ZitadelCreateSessionResponseSchema>>> {
  const url = `${BASE_URL}/v2/sessions`;

  const body = {
    checks: {
      user: { userId },
      idpIntent: { idpIntentId, idpIntentToken }
    }
  };

  console.log(`\nPOST ${url}\nBODY: ${JSON.stringify(body)}`);

  return handleFetch(
    () =>
      fetch(url, {
        method: Method.Post,
        headers: {
          ...Headers.Content.Json,
          "Authorization": `Bearer ${TOKEN}`,
        },
        body: JSON.stringify(body),
        cache: "no-store",
      }),
    ZitadelCreateSessionResponseSchema,
  );
}