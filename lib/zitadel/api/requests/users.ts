"server only";

import { z } from "zod";
import { Result } from "@/domain/error";
import { handleFetch } from "@/lib/fetch-helper";
import { BASE_URL, TOKEN, Method, Headers } from "../config";
import { PaginationRequest, TextFilterMethod, ZitadelGenericUpdateResponseSchema } from "../shared";

export const ZitadelCreateHumanUserResponseSchema = z.object({
  userId: z.string(),
  details: z.any().optional(),
}).catchall(z.any());

export const ZitadelGetUserResponseSchema = z.object({
  user: z.object({
    id: z.string().optional(),
    human: z.any().optional(),
    preferredLoginName: z.string().optional()
  }).catchall(z.any()).optional()
}).catchall(z.any());

export async function createHumanUser(body: any): Promise<Result<z.infer<typeof ZitadelCreateHumanUserResponseSchema>>> {
  const url = `${BASE_URL}/v2/users/human`;
  return handleFetch(
    () => fetch(url, {
      method: Method.Post,
      headers: { ...Headers.Accept.Json, ...Headers.Content.Json, "Authorization": `Bearer ${TOKEN}` },
      body: JSON.stringify(body),
      cache: "no-store",
    }),
    ZitadelCreateHumanUserResponseSchema,
  );
}

export async function getUserById(userId: string): Promise<Result<z.infer<typeof ZitadelGetUserResponseSchema>>> {
  const url = `${BASE_URL}/v2/users/${userId}`;
  return handleFetch(
    () => fetch(url, {
      method: Method.Get,
      headers: { ...Headers.Accept.Json, "Authorization": `Bearer ${TOKEN}` },
      cache: "no-store",
    }),
    ZitadelGetUserResponseSchema
  );
}

export async function updateHumanProfile(
  userId: string,
  givenName: string,
  familyName: string,
  nickName?: string,
  displayName?: string,
  preferredLanguage?: string,
  gender?: number
): Promise<Result<z.infer<typeof ZitadelGenericUpdateResponseSchema>>> {
  const url = `${BASE_URL}/v2/users/human/${userId}`;
  return handleFetch(
    () => fetch(url, {
      method: "PUT",
      headers: { 
        ...Headers.Content.Json, 
        "Authorization": `Bearer ${TOKEN}` 
      },
      body: JSON.stringify({
        profile: { givenName, familyName, nickName, displayName, preferredLanguage, gender }
      }),
    }),
    ZitadelGenericUpdateResponseSchema
  );
}

export async function updateHumanEmail(
  userId: string,
  email: string,
  isVerified: boolean = false
): Promise<Result<z.infer<typeof ZitadelGenericUpdateResponseSchema>>> {
  const url = `${BASE_URL}/v2/users/${userId}/email`;
  return handleFetch(
    () => fetch(url, {
      method: "POST",
      headers: { ...Headers.Content.Json, "Authorization": `Bearer ${TOKEN}` },
      body: JSON.stringify({ isVerified, email }),
    }),
    ZitadelGenericUpdateResponseSchema
  );
}

export async function updateHumanAvatar(
  userId: string,
  file: File | Blob
): Promise<Result<z.infer<typeof ZitadelGenericUpdateResponseSchema>>> {
  const url = `${BASE_URL}/v2/users/${userId}/human/profile/avatar`;
  const formData = new FormData();
  formData.append("file", file);

  return handleFetch(
    () => fetch(url, {
      method: "POST",
      headers: { "Authorization": `Bearer ${TOKEN}` },
      body: formData,
    }),
    ZitadelGenericUpdateResponseSchema
  );
}

export async function updateUserMetadata(userId: string, key: string, value: string): Promise<Result<z.infer<typeof ZitadelGenericUpdateResponseSchema>>> {
  const url = `${BASE_URL}/v2/users/${userId}/metadata`;
  return handleFetch(
    () => fetch(url, {
      method: Method.Post,
      headers: { ...Headers.Content.Json, "Authorization": `Bearer ${TOKEN}` },
      body: JSON.stringify( 
        [{
          key: value
        }]
       ),
    }),
    ZitadelGenericUpdateResponseSchema
  );
}

export interface MetadataKeyFilter { 
  key?: string; 
  method?: TextFilterMethod;
}

export interface MetadataSearchFilter { 
  keyQuery?: MetadataKeyFilter; // В REST API ZITADEL это обычно называется keyQuery 
}

export interface ZitadelSearchMetadataRequest {
  query?: PaginationRequest | null;
  queries?: MetadataSearchFilter[];
}

// --- Схемы Zod для ответа ---

export const ZitadelMetadataSchema = z.object({
  key: z.string().optional(),
  value: z.string().optional(), // Значение приходит в Base64
}).catchall(z.any());

export const ZitadelSearchMetadataResponseSchema = z.object({
  details: z.any().optional(),
  result: z.array(ZitadelMetadataSchema).optional(),
}).catchall(z.any());

// --- Функция API ---

/**
 * Ищет метаданные пользователя по фильтрам.
 */
export async function searchUserMetadata(
  userId: string, 
  body: ZitadelSearchMetadataRequest
): Promise<Result<z.infer<typeof ZitadelSearchMetadataResponseSchema>>> {
  const url = `${BASE_URL}/v2/users/${userId}/metadata/search`;
  
  return handleFetch(
    () => fetch(url, {
      method: Method.Post,
      headers: { ...Headers.Accept.Json, ...Headers.Content.Json, "Authorization": `Bearer ${TOKEN}` },
      body: JSON.stringify(body),
      cache: "no-store",
    }),
    ZitadelSearchMetadataResponseSchema
  );
}