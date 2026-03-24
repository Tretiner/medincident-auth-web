"server only";

import { z } from "zod";
import { Result } from "@/domain/error";
import { handleFetch } from "@/lib/fetch-helper";
import { BASE_URL, TOKEN, Method, Headers } from "../config";
import { ZitadelGenericUpdateResponseSchema } from "../shared";

export const ZitadelSessionUserFactorSchema = z.object({
  verifiedAt: z.string().optional(),
  id: z.string().optional(),
  loginName: z.string().optional(),
  displayName: z.string().optional(),
  organizationId: z.string().optional(),
}).catchall(z.any());

export const ZitadelSessionFactorsSchema = z.object({
  user: ZitadelSessionUserFactorSchema.optional(),
  password: z.any().optional(),
}).catchall(z.any());

export const ZitadelSessionSchema = z.object({
  id: z.string(),
  creationDate: z.string().optional(),
  changeDate: z.string().optional(),
  factors: ZitadelSessionFactorsSchema.optional(),
}).catchall(z.any());

export const ZitadelSearchSessionsResponseSchema = z.object({
  details: z.any().optional(),
  sessions: z.array(ZitadelSessionSchema).optional(),
}).catchall(z.any());

export const ZitadelSessionResponseSchema = z.object({
  sessionId: z.string().optional(),
  sessionToken: z.string().optional(),
  details: z.any().optional(),
}).catchall(z.any());

export const ZitadelCreateSessionResponseSchema = z.object({
  sessionId: z.string(),
  sessionToken: z.string(),
}).catchall(z.any());

export async function searchSessions(sessionIds: string[]): Promise<Result<z.infer<typeof ZitadelSearchSessionsResponseSchema>>> {
  const url = `${BASE_URL}/v2/sessions/search`;
  if (!sessionIds || sessionIds.length === 0) {
    return { success: true, data: { sessions: [] } };
  }
  const body = { query: { offset: "0", limit: 100, asc: true }, queries: [{ idsQuery: { ids: sessionIds } }] };

  return handleFetch(
    () => fetch(url, {
      method: Method.Post,
      headers: { ...Headers.Accept.Json, ...Headers.Content.Json, "Authorization": `Bearer ${TOKEN}` },
      body: JSON.stringify(body),
      cache: "no-store",
    }),
    ZitadelSearchSessionsResponseSchema,
  );
}

export async function searchUserSessions(userId: string): Promise<Result<z.infer<typeof ZitadelSearchSessionsResponseSchema>>> {
  const url = `${BASE_URL}/v2/sessions/search`;
  return handleFetch(
    () => fetch(url, {
      method: Method.Post,
      headers: { ...Headers.Accept.Json, ...Headers.Content.Json, "Authorization": `Bearer ${TOKEN}` },
      body: JSON.stringify({ queries: [{ userIdQuery: { id: userId } }] }),
      cache: "no-store",
    }),
    ZitadelSearchSessionsResponseSchema
  );
}

export async function createSession(
  userId: string,
  idpIntentId: string,
  idpIntentToken: string
): Promise<Result<z.infer<typeof ZitadelCreateSessionResponseSchema>>> {
  const url = `${BASE_URL}/v2/sessions`;
  const body = { checks: { user: { userId }, idpIntent: { idpIntentId, idpIntentToken } } };

  return handleFetch(
    () => fetch(url, {
      method: Method.Post,
      headers: { ...Headers.Content.Json, "Authorization": `Bearer ${TOKEN}` },
      body: JSON.stringify(body),
      cache: "no-store",
    }),
    ZitadelCreateSessionResponseSchema,
  );
}

export async function updateSession(sessionId: string, sessionToken: string, checks: any): Promise<Result<z.infer<typeof ZitadelSessionResponseSchema>>> {
  const url = `${BASE_URL}/v2/sessions/${sessionId}`;
  return handleFetch(
    () => fetch(url, {
      method: "PATCH",
      headers: { ...Headers.Content.Json, "Authorization": `Bearer ${TOKEN}` },
      body: JSON.stringify({ sessionToken, checks }),
      cache: "no-store",
    }),
    ZitadelSessionResponseSchema
  );
}

export async function deleteSession(sessionId: string, sessionToken: string): Promise<Result<z.infer<typeof ZitadelGenericUpdateResponseSchema>>> {
  const url = `${BASE_URL}/v2/sessions/${sessionId}`;
  return handleFetch(
    () => fetch(url, {
      method: "DELETE",
      headers: { ...Headers.Content.Json, "Authorization": `Bearer ${TOKEN}` },
      body: JSON.stringify({ sessionToken }),
    }),
    ZitadelGenericUpdateResponseSchema
  );
}