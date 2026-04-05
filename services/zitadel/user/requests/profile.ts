"server only";

import { z } from "zod";
import { handleZitadelRequest } from "../../api/client-helper";
import { zitadelUserApi } from "../client";
import { Result } from "@/domain/error";

// ==========================================
// СХЕМЫ ОТВЕТОВ
// ==========================================

export const ZitadelMeResponseSchema = z.object({
  user: z.object({
    id: z.string().optional(),
    preferredLoginName: z.string().optional(),
    human: z.object({
      profile: z.object({
        givenName: z.string().optional(),
        familyName: z.string().optional(),
        nickName: z.string().optional(),
        displayName: z.string().optional(),
        preferredLanguage: z.string().optional(),
        gender: z.string().optional(),
        avatarUrl: z.string().optional(),
      }).catchall(z.any()).optional(),
      email: z.object({
        email: z.string().optional(),
        isVerified: z.boolean().optional(),
      }).catchall(z.any()).optional(),
      phone: z.object({
        phone: z.string().optional(),
        isVerified: z.boolean().optional(),
      }).catchall(z.any()).optional(),
    }).catchall(z.any()).optional(),
  }).catchall(z.any()).optional(),
}).catchall(z.any());

const ZitadelUpdateResponseSchema = z.object({
  details: z.any().optional(),
}).catchall(z.any());

// ==========================================
// API МЕТОДЫ (user session token)
// ==========================================

// GET /v2/users/{userId} — профиль пользователя
export async function getMe(userId: string): Promise<Result<z.infer<typeof ZitadelMeResponseSchema>>> {
  return handleZitadelRequest(
    () => zitadelUserApi.get(`/v2/users/${userId}`),
    ZitadelMeResponseSchema
  );
}

// PUT /v2/users/{userId} — обновление профиля пользователя (UpdateUser, заменяет deprecated UpdateHumanUser)
export async function updateMyProfile(userId: string, profile: {
  givenName: string;
  familyName: string;
  nickName?: string;
  displayName?: string;
  preferredLanguage?: string;
  gender?: number;
}): Promise<Result<z.infer<typeof ZitadelUpdateResponseSchema>>> {
  return handleZitadelRequest(
    () => zitadelUserApi.put(`/v2/users/${userId}`, { profile }),
    ZitadelUpdateResponseSchema
  );
}

// POST /v2/users/{userId}/avatar — загрузка аватарки
export async function uploadMyAvatar(file: File | Blob): Promise<Result<z.infer<typeof ZitadelUpdateResponseSchema>>> {
  const formData = new FormData();
  formData.append("file", file);

  return handleZitadelRequest(
    () => zitadelUserApi.post("/assets/v1/users/me/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
    ZitadelUpdateResponseSchema
  );
}
