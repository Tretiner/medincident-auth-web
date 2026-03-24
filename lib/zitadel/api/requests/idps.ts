"server only";

import { z } from "zod";
import { Result } from "@/domain/error";
import { handleFetch } from "@/lib/fetch-helper";
import { BASE_URL, TOKEN, Method, Headers } from "../config";
import { ZitadelIntentDetailsSchema } from "../shared";

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

export interface ZitadelStartIdpIntentRequest {
  idpId: string;
  urls: {
    successUrl: string;
    failureUrl: string;
  };
}

export const ZitadelStartIdpIntentResponseSchema = z.object({
  details: ZitadelIntentDetailsSchema.optional(),
  authUrl: z.string(),
});

export type ZitadelStartIdpIntentResponse = z.infer<typeof ZitadelStartIdpIntentResponseSchema>;

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

export async function getActiveIdps(): Promise<Result<ZitadelGetIdpsResponse>> {
  const url = `${BASE_URL}/v2/settings/login/idps`;
  return handleFetch(
    () => fetch(url, {
      method: Method.Get,
      headers: { ...Headers.Accept.Json, ...Headers.Content.Json, "Authorization": `Bearer ${TOKEN}` },
      cache: "no-store",
    }),
    ZitadelGetIdpsResponseSchema,
  );
}

export async function startIdpIntent(body: ZitadelStartIdpIntentRequest): Promise<Result<ZitadelStartIdpIntentResponse>> {
  const url = `${BASE_URL}/v2/idp_intents`;
  return handleFetch(
    () => fetch(url, {
      method: Method.Post,
      headers: { ...Headers.Content.Json, "Authorization": `Bearer ${TOKEN}` },
      body: JSON.stringify(body),
      cache: "no-store",
    }),
    ZitadelStartIdpIntentResponseSchema,
  );
}

export async function retrieveIdpIntent(intentId: string, intentToken: string): Promise<Result<ZitadelRetrieveIdpIntentResponse>> {
  const url = `${BASE_URL}/v2/idp_intents/${intentId}`;
  return handleFetch(
    () => fetch(url, {
      method: Method.Post,
      headers: { ...Headers.Content.Json, "Authorization": `Bearer ${TOKEN}` },
      body: JSON.stringify({ idpIntentToken: intentToken }),
      cache: "no-store",
    }),
    ZitadelRetrieveIdpIntentResponseSchema,
  );
}