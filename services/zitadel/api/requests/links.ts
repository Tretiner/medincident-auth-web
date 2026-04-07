"server only";

import { z } from "zod";
import { Result } from "@/domain/error";
import { handleZitadelRequest } from "../client-helper";
import { zitadelUserApi } from "../../user/client";
import { ZitadelDetailsSchema, ZitadelGenericUpdateResponseSchema } from "./shared";

// --- Схемы ---

export const ZitadelAddIdpLinkResponseSchema = z.object({
  details: z.any().optional(),
}).catchall(z.any());

export const ZitadelSearchLinksResponseSchema = z.object({
  details: ZitadelDetailsSchema.optional(),
  result: z.array(z.any()).optional()
}).catchall(z.any());

// --- Запросы ---

export async function addIdpLinkToUser(
  systemUserId: string,
  idpLink: { idpId: string; userId: string; userName: string; }
): Promise<Result<z.infer<typeof ZitadelAddIdpLinkResponseSchema>>> {
  return handleZitadelRequest(
    () => zitadelUserApi.post(`/v2/users/${systemUserId}/links`, { idpLink }),
    ZitadelAddIdpLinkResponseSchema
  );
}

export async function searchUserLinks(
  userId: string
): Promise<Result<z.infer<typeof ZitadelSearchLinksResponseSchema>>> {
  return handleZitadelRequest(
    // Отправляем пустой объект {}, так как API ожидает POST-запрос с телом
    () => zitadelUserApi.post(`/v2/users/${userId}/links/_search`, {}),
    ZitadelSearchLinksResponseSchema
  );
}

export async function deleteUserLink(
  userId: string,
  idpId: string,
  linkedUserId: string
): Promise<Result<z.infer<typeof ZitadelGenericUpdateResponseSchema>>> {
  return handleZitadelRequest(
    () => zitadelUserApi.delete(`/v2/users/${userId}/links/${idpId}/${linkedUserId}`),
    ZitadelGenericUpdateResponseSchema
  );
}
