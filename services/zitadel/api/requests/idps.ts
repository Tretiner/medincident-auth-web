"server only";

import { z } from "zod";
import { Result } from "@/domain/error";
import { handleZitadelRequest } from "../client-helper";
import { zitadelApi } from "../client";
import { ZitadelDetailsSchema } from "./shared";

export type ZitadelGetIdpsResponse = z.infer<typeof ZitadelGetIdpsResponseSchema>;
export type ZitadelIdp = z.infer<typeof ZitadelIdpSchema>;

export const ZitadelIdpOptionsSchema = z.object({
  isLinkingAllowed: z.boolean(),
  isCreationAllowed: z.boolean(),
});

// --- Схемы Ответов ---
export const ZitadelIdpSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  options: ZitadelIdpOptionsSchema.optional(),
});

export const ZitadelGetIdpsResponseSchema = z.object({
  details: ZitadelDetailsSchema,
  identityProviders: z.array(ZitadelIdpSchema).optional(),
}).catchall(z.any());

export const ZitadelStartIdpIntentResponseSchema = z.object({
  details: ZitadelDetailsSchema.optional(),
  authUrl: z.string(),
}).catchall(z.any());

export const ZitadelRetrieveIdpIntentResponseSchema = z.object({
  details: ZitadelDetailsSchema.optional(),
  idpInformation: z.any().optional(),
}).catchall(z.any());

// --- Модели Тела Запросов ---
export interface ZitadelStartIdpIntentBody {
  idpId: string;
  urls: { successUrl: string; failureUrl: string };
}

export interface ZitadelRetrieveIdpIntentBody {
  idpIntentToken: string;
}

// --- Методы ---
export async function getActiveIdps(): Promise<Result<z.infer<typeof ZitadelGetIdpsResponseSchema>>> {
  return handleZitadelRequest(
    () => zitadelApi.get("/v2/settings/login/idps"),
    ZitadelGetIdpsResponseSchema
  );
}

export async function startIdpIntent(
  body: ZitadelStartIdpIntentBody
): Promise<Result<z.infer<typeof ZitadelStartIdpIntentResponseSchema>>> {
  return handleZitadelRequest(
    () => zitadelApi.post("/v2/idp_intents", body),
    ZitadelStartIdpIntentResponseSchema
  );
}

export async function retrieveIdpIntent(
  intentId: string,
  body: ZitadelRetrieveIdpIntentBody
): Promise<Result<z.infer<typeof ZitadelRetrieveIdpIntentResponseSchema>>> {
  return handleZitadelRequest(
    () => zitadelApi.post(`/v2/idp_intents/${intentId}`, body),
    ZitadelRetrieveIdpIntentResponseSchema
  );
}
