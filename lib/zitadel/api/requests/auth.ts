"server only";

import { z } from "zod";
import { Result } from "@/domain/error";
import { handleFetch } from "@/lib/fetch-helper";
import { BASE_URL, TOKEN, Method, Headers } from "../config";

export const ZitadelCompleteAuthRequestResponseSchema = z.object({
  redirectUri: z.string().optional(),
  url: z.string().optional()
}).catchall(z.any());

export async function completeAuthRequest(
  requestId: string,
  sessionId: string,
  sessionToken: string
): Promise<Result<z.infer<typeof ZitadelCompleteAuthRequestResponseSchema>>> {
  const isOidc = requestId.startsWith("oidc_");
  const isSaml = requestId.startsWith("saml_");
  
  if (!isOidc && !isSaml) {
    throw new Error("Неизвестный тип requestId. Ожидается префикс oidc_ или saml_");
  }
  
  const endpoint = isOidc ? `/v2/oidc/auth_requests/${requestId}` : `/v2/saml/auth_requests/${requestId}`;
  const url = `${BASE_URL}${endpoint}`;
  console.log(url);

  return handleFetch(
    () => fetch(url, {
      method: Method.Post,
      headers: { ...Headers.Content.Json, "Authorization": `Bearer ${TOKEN}` },
      body: JSON.stringify({ session: { sessionId, sessionToken } }),
      cache: "no-store",
    }),
    ZitadelCompleteAuthRequestResponseSchema
  );
}