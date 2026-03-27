"use server";

import { createHumanUser, createSession, updateUserMiddleName } from "@/lib/zitadel/api";
import { finishAuth } from "../callback/success/actions";
import { userService } from "@/lib/grpc/api/client"; // Ваш клиент nice-grpc
import { ClientError } from "nice-grpc";

// --- ТИПЫ ИЗ СГЕНЕРИРОВАННОГО PROTO (nice-grpc) ---
interface PersonName {
  givenName: string;
  familyName: string;
  middleName?: string | undefined;
}

// Утилита для перевода машинных кодов ошибок в человеческий текст
function getErrorMessage(code: string): string {
  switch (code) {
    case "REQUIRED": return "Обязательное поле";
    case "TOO_SHORT": return "Слишком короткое значение";
    case "TOO_LONG": return "Слишком длинное значение";
    case "CONTAINS_DIGITS": return "Слишком длинное значение";
    case "MIXED_SCRIPTS": return "Слишком разные буквы";
    case "SPECIAL_CHARACTERS": return "Слишком недопсустимые символы";
    case "INVALID_FORMAT": return "Недопустимые символы";
    default: return "Произошла ошибка: " + code;
  }
}

export async function validatePersonNameGrpc(name: PersonName): Promise<Record<string, string> | null> {
  try {
    // 1. Делаем настоящий запрос к микросервису
    // Обратите внимание: метод называется validateFullName, а внутри объект personName (согласно вашему proto)
    const response = await userService.validateFullName({
      personName: {
        givenName: name.givenName,
        familyName: name.familyName,
        middleName: name.middleName || undefined,
      }
    });

    if (response.valid) {
      return null;
    }

    const formErrors: Record<string, string> = {};
    for (const violation of response.violations) {
      formErrors[violation.field] = getErrorMessage(violation.code);
    }

    return formErrors;

  } catch (error: unknown) {
    if (error instanceof ClientError) {
      console.error(`[gRPC] Ошибка сервера ${error.code}:`, error.details);
      return { form: "Сервис проверки данных временно недоступен. Попробуйте позже." };
    }

    console.error("Системная ошибка при вызове gRPC:", error);
    return { form: "Произошла внутренняя ошибка при проверке данных" };
  }
}

export interface SecureRegisterPayload {
  intentId: string;
  intentToken: string;
  requestId?: string;
  idpInformation: any;
}

// --- SERVER ACTION ---
export async function registerUserSubmit(
  securePayload: SecureRegisterPayload,
  prevState: any,
  formData: FormData
) {
  const { intentId, intentToken, requestId, idpInformation } = securePayload;

  const givenName = formData.get("givenName") as string;
  const familyName = formData.get("familyName") as string;
  const middleName = formData.get("middleName") as string;
  const email = formData.get("email") as string;

  // Сохраняем введенные значения, чтобы вернуть их в UI и они не стерлись
  const values = { givenName, familyName, middleName, email };
  const errors: Record<string, string> = {};

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Введите корректный email адрес";
  }

  // ВЫЗОВ gRPC ВАЛИДАЦИИ
  const grpcNameErrors = await validatePersonNameGrpc({
    givenName,
    familyName,
    middleName: middleName || undefined,
  });

  if (grpcNameErrors) {
    Object.assign(errors, grpcNameErrors);
  }

  // Если собрали хоть какие-то ошибки (email или gRPC), возвращаем стейт ошибки
  if (Object.keys(errors).length > 0) {
    return { success: false, errors, values };
  }

  try {
    const rawInformation = idpInformation?.rawInformation || {};

    const requestBody = rawInformation.User ? rawInformation.User : {
      username: rawInformation.preferred_username || email,
      profile: {
        givenName,
        familyName,
        displayName: `${givenName} ${familyName}`,
        preferredLanguage: rawInformation.preferredLanguage === "und" ? "ru" : (rawInformation.preferredLanguage || "ru"),
      },
      email: { email, isVerified: false },
      idpLinks: [
        {
          idpId: idpInformation.idpId,
          userId: idpInformation.userId,
          userName: idpInformation.userName,
        }
      ]
    };

    const userRes = await createHumanUser(requestBody);
    console.log("Ответ от createHumanUser:", JSON.stringify(userRes));

    if (!userRes.success) {
      throw new Error("Ошибка при регистрации: " + JSON.stringify(userRes.error));
    }

    if (!userRes.data?.userId) {
      throw new Error("Ошибка при регистрации: Не получен ID пользователя");
    }

    if (middleName) {
      await updateUserMiddleName(userRes.data.userId, middleName);
    }

    const sessionRes = await createSession(userRes.data.userId, intentId, intentToken);
    console.log("Ответ от createSession:", JSON.stringify(sessionRes));

    if (!sessionRes.success || !sessionRes.data?.sessionToken || !sessionRes.data?.sessionId) {
      throw new Error("Пользователь создан, но не удалось создать сессию");
    }

    // Редирект происходит внутри этой функции
    await finishAuth(sessionRes.data, requestId);

    return { success: true, errors: {}, values };
  } catch (error: any) {
    return { success: false, errors: { form: error.message || "Ошибка регистрации в ZITADEL" }, values };
  }
}