"server only";

import { z } from "zod";
import { Result } from "@/domain/error";
import { handleZitadelRequest } from "../client-helper";
import { zitadelApi } from "../client";
import { ZitadelGenericUpdateResponseSchema } from "./shared";

// --- Схемы ---

export const ZitadelRegisterTotpResponseSchema = z.object({
  details: z.any().optional(),
  uri: z.string(),
  secret: z.string(),
}).catchall(z.any());

// Тип метода аутентификации — строковый enum Zitadel
// Пример значений: AUTHENTICATION_METHOD_TYPE_PASSWORD, AUTHENTICATION_METHOD_TYPE_TOTP,
// AUTHENTICATION_METHOD_TYPE_U2F, AUTHENTICATION_METHOD_TYPE_PASSKEY, _IDP, _OTP_SMS, _OTP_EMAIL
export const ZitadelAuthMethodTypesResponseSchema = z.object({
  details: z.any().optional(),
  authMethodTypes: z.array(z.string()).optional(),
}).catchall(z.any());

// --- Запросы ---

// Регистрация TOTP — возвращает otpauth:// URI (для QR) и секрет текстом
export async function registerTotp(
  userId: string
): Promise<Result<z.infer<typeof ZitadelRegisterTotpResponseSchema>>> {
  return handleZitadelRequest(
    () => zitadelApi.post(`/v2/users/${userId}/totp`, {}),
    ZitadelRegisterTotpResponseSchema
  );
}

// Подтверждение регистрации TOTP — вводится первый 6-значный код
export async function verifyTotpRegistration(
  userId: string,
  code: string
): Promise<Result<z.infer<typeof ZitadelGenericUpdateResponseSchema>>> {
  return handleZitadelRequest(
    () => zitadelApi.post(`/v2/users/${userId}/totp/verify`, { code }),
    ZitadelGenericUpdateResponseSchema
  );
}

// Удаление TOTP у пользователя
export async function removeTotp(
  userId: string
): Promise<Result<z.infer<typeof ZitadelGenericUpdateResponseSchema>>> {
  return handleZitadelRequest(
    () => zitadelApi.delete(`/v2/users/${userId}/totp`),
    ZitadelGenericUpdateResponseSchema
  );
}

// Список активных методов аутентификации пользователя
export async function listAuthMethods(
  userId: string
): Promise<Result<z.infer<typeof ZitadelAuthMethodTypesResponseSchema>>> {
  return handleZitadelRequest(
    () => zitadelApi.get(`/v2/users/${userId}/authentication_methods`),
    ZitadelAuthMethodTypesResponseSchema
  );
}

export function hasTotpMethod(methods: string[] | undefined): boolean {
  if (!methods) return false;
  return methods.some((m) => m === "AUTHENTICATION_METHOD_TYPE_TOTP" || m === "TOTP");
}
