"server only";

import { z } from "zod";
import { Result } from "@/domain/error";
import { handleFetch } from "@/lib/fetch-helper";
import { BASE_URL, TOKEN, Method, Headers } from "../config";
import { ZitadelIntentDetailsSchema, ZitadelGenericUpdateResponseSchema } from "../shared";

export const ZitadelAddIdpLinkResponseSchema = z.object({
  details: z.any().optional(),
}).catchall(z.any());

export const ZitadelSearchLinksResponseSchema = z.object({
  details: ZitadelIntentDetailsSchema.optional(),
  result: z.array(z.any()).optional()
}).catchall(z.any());

export async function addIdpLinkToUser(
  systemUserId: string,
  idpLink: { idpId: string; userId: string; userName: string; }
): Promise<Result<z.infer<typeof ZitadelAddIdpLinkResponseSchema>>> {
  const url = `${BASE_URL}/v2/users/${systemUserId}/links`;
  console.log(url);
  return handleFetch(
    () => fetch(url, {
      method: Method.Post,
      headers: { ...Headers.Content.Json, "Authorization": `Bearer ${TOKEN}` },
      body: JSON.stringify({ idpLink }),
      cache: "no-store",
    }),
    ZitadelAddIdpLinkResponseSchema,
  );
}

export async function searchUserLinks(userId: string): Promise<Result<z.infer<typeof ZitadelSearchLinksResponseSchema>>> {
  const url = `${BASE_URL}/v2/users/${userId}/links/_search`;
  console.log(url);
  return handleFetch(
    () => fetch(url, {
      method: Method.Post,
      headers: { ...Headers.Content.Json, "Authorization": `Bearer ${TOKEN}` },
      body: JSON.stringify({})
    }),
    ZitadelSearchLinksResponseSchema
  );
}

export async function deleteUserLink(
  userId: string, 
  idpId: string, 
  linkedUserId: string
): Promise<Result<z.infer<typeof ZitadelGenericUpdateResponseSchema>>> {
  const url = `${BASE_URL}/v2/users/${userId}/links/${idpId}/${linkedUserId}`;
  console.log(url);
  return handleFetch(
    () => fetch(url, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${TOKEN}` }
    }),
    ZitadelGenericUpdateResponseSchema
  );
}