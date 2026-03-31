"use server";

import { redirect } from "next/navigation";
import { createHumanUser, updateUserMiddleName } from "@/services/zitadel/api";
import { userService } from "@/services/grpc/client";
import { ClientError } from "nice-grpc";
import {
  getIdpIntentCookie,
  deleteIdpIntentCookie,
  setRegFlowCookie,
} from "../_lib/reg-flow";
import type { RegisterFormState } from "./_components/register-view";

// ==========================================
// ВАЛИДАЦИЯ ИМЕНИ (gRPC)
// ==========================================

function mapGrpcCode(code: string): string {
  const map: Record<string, string> = {
    REQUIRED: "Обязательное поле",
    TOO_SHORT: "Слишком короткое значение",
    TOO_LONG: "Слишком длинное значение",
    CONTAINS_DIGITS: "Недопустимые цифры",
    MIXED_SCRIPTS: "Смешение разных алфавитов",
    SPECIAL_CHARACTERS: "Недопустимые спецсимволы",
    INVALID_FORMAT: "Недопустимые символы",
  };
  return map[code] ?? "Ошибка: " + code;
}

export async function validatePersonNameGrpc(
  givenName: string,
  familyName: string,
  middleName?: string
): Promise<Record<string, string> | null> {
  try {
    const response = await userService.validateFullName({
      personName: { givenName, familyName, middleName: middleName || undefined },
    });

    if (response.valid) return null;

    const fieldMap: Record<string, string> = {
      given_name: "givenName",
      family_name: "familyName",
      middle_name: "middleName",
    };
    return Object.fromEntries(
      response.violations.map((v: any) => [fieldMap[v.field] ?? v.field, mapGrpcCode(v.code)])
    );
  } catch (error) {
    if (error instanceof ClientError) {
      return { form: "Сервис проверки данных временно недоступен" };
    }
    return { form: "Внутренняя ошибка при проверке данных" };
  }
}

function extractFormFields(formData: FormData) {
  return {
    givenName: (formData.get("givenName") as string)?.trim() ?? "",
    familyName: (formData.get("familyName") as string)?.trim() ?? "",
    middleName: (formData.get("middleName") as string)?.trim() ?? "",
    email: (formData.get("email") as string)?.trim() ?? "",
    password: (formData.get("password") as string) ?? "",
    confirm: (formData.get("confirm") as string) ?? "",
  };
}

// ==========================================
// ПАРСИНГ ОШИБОК ZITADEL
// ==========================================

const ZITADEL_FIELD_MAP: Record<string, string> = {
  GivenName: "givenName",
  FamilyName: "familyName",
  DisplayName: "givenName",
  NickName: "givenName",
  Email: "email",
  Username: "email",
};

function parseZitadelError(rawMessage: string): Record<string, string> | null {
  // Извлекаем JSON из строки вида "Ошибка при создании пользователя: {...}"
  let zitadelMsg = rawMessage;
  let details: any[] = [];
  const jsonStart = rawMessage.indexOf("{");
  if (jsonStart !== -1) {
    try {
      const parsed = JSON.parse(rawMessage.slice(jsonStart));
      zitadelMsg = parsed.message ?? rawMessage;
      details = parsed.details ?? [];
    } catch {
      // оставляем исходную строку
    }
  }

  // Ошибки политики пароля — id начинается с "COMMA-"
  const isPasswordError = details.some((d: any) => typeof d.id === "string" && d.id.startsWith("COMMA-"));
  if (isPasswordError) {
    // Убираем суффикс вида " (COMMA-co3Xw)" из сообщения
    return { password: zitadelMsg.replace(/\s*\([A-Z0-9-]+\)\s*$/, "").trim() };
  }

  // Ошибки профиля: "SetHumanProfile.GivenName: reason" или "AddHumanUser.Username: reason"
  const match = zitadelMsg.match(/\bSet\w+\.(\w+):\s*(.+?)(?:\s*\||$)/i)
    ?? zitadelMsg.match(/\bAdd\w+\.(\w+):\s*(.+?)(?:\s*\||$)/i);

  if (!match) return null;

  const [, fieldRaw, reason] = match;
  const field = ZITADEL_FIELD_MAP[fieldRaw] ?? "form";

  const humanReason = reason.includes("length must be between")
    ? "Поле не может быть пустым или слишком длинным"
    : reason.includes("invalid format") || reason.includes("value does not match")
    ? "Недопустимый формат"
    : reason.trim();

  return { [field]: humanReason };
}

// ==========================================
// IDP ПУТЬ: создаём пользователя, сохраняем userId → /verify
// ==========================================

export async function continueRegisterIdp(
  requestId: string | undefined,
  _prevState: RegisterFormState,
  formData: FormData
): Promise<RegisterFormState> {
  const { givenName, familyName, middleName, email } = extractFormFields(formData);
  const values = { givenName, familyName, middleName, email };
  const errors: Record<string, string> = {};

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Введите корректный email адрес";
  }

  const grpcErrors = await validatePersonNameGrpc(givenName, familyName, middleName || undefined);
  if (grpcErrors) Object.assign(errors, grpcErrors);
  if (Object.keys(errors).length > 0) return { success: false, errors, values };

  const intent = await getIdpIntentCookie();
  if (!intent) return { success: false, errors: { form: "Сессия устарела. Войдите снова." }, values };

  try {
    const rawInfo = intent.idpInformation?.rawInformation ?? {};
    const requestBody = {
      username: rawInfo.preferred_username ?? email,
      profile: {
        givenName,
        familyName,
        displayName: `${givenName} ${familyName}`,
        preferredLanguage:
          rawInfo.preferredLanguage === "und" ? "ru" : (rawInfo.preferredLanguage ?? "ru"),
      },
      email: { email, isVerified: false },
      idpLinks: [
        {
          idpId: intent.idpInformation?.idpId,
          userId: intent.idpInformation?.userId,
          userName: intent.idpInformation?.userName,
        },
      ],
    };

    const userRes = await createHumanUser(requestBody);
    if (!userRes.success || !userRes.data?.userId) {
      const errMsg = !userRes.success ? JSON.stringify((userRes as any).error) : "userId отсутствует";
      throw new Error("Ошибка при создании пользователя: " + errMsg);
    }

    const userId = userRes.data.userId;

    if (middleName) await updateUserMiddleName(userId, middleName);

    // Сохраняем flow для шага /verify (IDP путь — без пароля)
    await setRegFlowCookie({
      givenName, familyName, middleName, email,
      source: "idp",
      requestId,
      userId,
      loginName: email,
      intentId: intent.intentId,
      intentToken: intent.intentToken,
    });

    await deleteIdpIntentCookie();

    const params = new URLSearchParams({ requestId: requestId ?? "" });
    redirect(`/login/verify?${params}`);
  } catch (error: any) {
    if (error?.message === "NEXT_REDIRECT") throw error;
    const zitadelFields = parseZitadelError(error.message ?? "");
    const errorFields = zitadelFields ?? { form: error.message ?? "Ошибка регистрации" };
    return { success: false, errors: errorFields, values };
  }
}

// ==========================================
// EMAIL ПУТЬ: создаём пользователя с паролем → /verify
// ==========================================

export async function continueRegisterEmail(
  requestId: string | undefined,
  _prevState: RegisterFormState,
  formData: FormData
): Promise<RegisterFormState> {
  const { givenName, familyName, middleName, email, password, confirm } = extractFormFields(formData);
  const values = { givenName, familyName, middleName, email };
  const errors: Record<string, string> = {};

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Введите корректный email адрес";
  }
  if (!password || password.length < 8) {
    errors.password = "Пароль должен содержать не менее 8 символов";
  }
  if (password !== confirm) {
    errors.confirm = "Пароли не совпадают";
  }

  if (Object.keys(errors).length > 0) return { success: false, errors, values };

  try {
    const userRes = await createHumanUser({
      username: email,
      profile: {
        givenName,
        familyName,
        displayName: `${givenName} ${familyName}`,
        preferredLanguage: "ru",
      },
      email: { email, isVerified: false },
      password: { password, changeRequired: false },
    });

    if (!userRes.success || !userRes.data?.userId) {
      const errMsg = !userRes.success ? JSON.stringify((userRes as any).error) : "userId отсутствует";
      throw new Error("Ошибка при создании пользователя: " + errMsg);
    }

    const userId = userRes.data.userId;

    if (middleName) await updateUserMiddleName(userId, middleName);

    await setRegFlowCookie({
      givenName, familyName, middleName, email,
      source: "email",
      requestId,
      userId,
      loginName: email,
      password,
    });

    const params = new URLSearchParams();
    if (requestId) params.set("requestId", requestId);
    redirect(`/login/verify?${params}`);
  } catch (error: any) {
    if (error?.message === "NEXT_REDIRECT") throw error;
    const zitadelFields = parseZitadelError(error.message ?? "");
    const errorFields = zitadelFields ?? { form: error.message ?? "Ошибка регистрации" };
    return { success: false, errors: errorFields, values };
  }
}
