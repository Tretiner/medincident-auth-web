"use server";

import { createHumanUser, createSession } from "@/lib/zitadel/api";
import { finishAuth } from "../callback/success/actions";
import { getAllSessions, removeSessionFromCookie } from "@/lib/zitadel/zitadel-cookies";
import { deleteSession, searchUserSessions } from "@/lib/zitadel/api";

// --- ТИПЫ ИЗ СГЕНЕРИРОВАННОГО PROTO (nice-grpc) ---
interface PersonName {
  givenName: string;
  familyName: string;
  middleName?: string | undefined;
}

// Защищенные данные, которые придут из Server Component (без участия DOM)
export interface SecureRegisterPayload {
  intentId: string;
  intentToken: string;
  requestId?: string;
  idpInformation: any;
}

// --- MOCK gRPC КЛИЕНТА ---
async function validatePersonNameGrpcMock(name: PersonName): Promise<Record<string, string> | null> {
  const errors: Record<string, string> = {};
  await new Promise((resolve) => setTimeout(resolve, 600));

  if (!name.givenName || name.givenName.length < 2) {
    errors.givenName = "Имя должно содержать минимум 2 символа";
  }
  if (!name.familyName || name.familyName.length < 2) {
    errors.familyName = "Фамилия должна содержать минимум 2 символа";
  }
  if (name.middleName && name.middleName.length < 2) {
    errors.middleName = "Отчество слишком короткое";
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

// --- SERVER ACTION ---
export async function registerUserSubmit(
  securePayload: SecureRegisterPayload, // 1-й аргумент: зашифрованные сервером данные
  prevState: any,                       // 2-й аргумент: стейт от useActionState
  formData: FormData                    // 3-й аргумент: данные самой формы
) {
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

  const grpcNameErrors = await validatePersonNameGrpcMock({
    givenName,
    familyName,
    middleName: middleName || undefined,
  });

  if (grpcNameErrors) {
    Object.assign(errors, grpcNameErrors);
  }

  if (Object.keys(errors).length > 0) {
    // Возвращаем values обратно на клиент
    return { success: false, errors, values };
  }

  try {
    const rawInformation = securePayload.idpInformation?.rawInformation || {};
    
    const requestBody = rawInformation.User ? rawInformation.User : {
      username: rawInformation.preferred_username || email,
      profile: {
        givenName,
        familyName,
        displayName: middleName ? `${givenName} ${middleName} ${familyName}` : `${givenName} ${familyName}`,
        preferredLanguage: rawInformation.preferredLanguage === "und" ? "ru" : (rawInformation.preferredLanguage || "ru"),
      },
      email: { email, isVerified: true },
      idpLinks: [
        {
          idpId: securePayload.idpInformation.idpId,
          userId: securePayload.idpInformation.userId,
          userName: securePayload.idpInformation.userName,
        }
      ]
    };

    // Используем токены, которые безопасно прокинулись через closure
    await handleRegisterAction(
      securePayload.intentId, 
      securePayload.intentToken, 
      requestBody, 
      securePayload.requestId
    );
    
    return { success: true, errors: {}, values };
  } catch (error: any) {
    return { success: false, errors: { form: error.message || "Ошибка регистрации в ZITADEL" }, values };
  }
}

export async function handleRegisterAction(intentId: string, intentToken: string, payload: any, requestId?: string) {
  const userRes = await createHumanUser(payload);
  console.log("Ответ от createHumanUser:", JSON.stringify(userRes));

  if (!userRes.success || !userRes.data?.userId) {
    throw new Error("Ошибка при регистрации: " + JSON.stringify(userRes.error));
  }

  const sessionRes = await createSession(userRes.data.userId, intentId, intentToken);
  console.log("Ответ от createSession:", JSON.stringify(sessionRes));

  if (!sessionRes.success || !sessionRes.data?.sessionToken || !sessionRes.data?.sessionId) {
    throw new Error("Пользователь создан, но не удалось создать сессию");
  }

  await finishAuth(sessionRes.data, requestId);
}