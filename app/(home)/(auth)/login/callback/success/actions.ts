// app/actions/auth.ts
"use server";

import { env } from "@/config/env";
import { createHumanUser, createSession, addIdpLinkToUser } from "@/lib/zitadel/zitadel-api"; // Укажите правильный путь
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

async function finishAuth(sessionToken: string) {
  (await cookies()).set("zitadel_session", sessionToken, {
    httpOnly: true,
    secure: env.isProd,
    path: "/",
    sameSite: "lax",
  });
  redirect("/ui/console"); // Укажите ваш путь после успешного входа
}

export async function handleLoginAction(userId: string, intentId: string, intentToken: string) {
  const sessionRes = await createSession(userId, intentId, intentToken);
  console.log("Ответ от createSession:", JSON.stringify(sessionRes));
  if (!sessionRes.success || !sessionRes.data?.sessionToken) {
    throw new Error("Ошибка при создании сессии");
  }
  await finishAuth(sessionRes.data.sessionToken);
}

export async function handleRegisterAction(intentId: string, intentToken: string, payload: any) {
  const userRes = await createHumanUser(payload);
  console.log("Ответ от createHumanUser:", JSON.stringify(userRes));
  
  // Выводим детальную ошибку от API в консоль сервера, если что-то еще пойдет не так
  if (!userRes.success || !userRes.data?.userId) {
    console.error("ZITADEL API Error:", userRes.error);
    throw new Error(JSON.stringify(userRes.error) || "Ошибка при регистрации пользователя");
  }

  // Создаем сессию для нового пользователя
  const sessionRes = await createSession(userRes.data.userId, intentId, intentToken);
  console.log("Ответ от createSession:", JSON.stringify(sessionRes));
  if (!sessionRes.success || !sessionRes.data?.sessionToken) {
    throw new Error("Пользователь создан, но не удалось создать сессию");
  }

  await finishAuth(sessionRes.data.sessionToken);
}

export async function handleLinkAction(targetUserId: string, intentId: string, intentToken: string, idpInformation: any) {
  const idpLink = {
    idpId: idpInformation.idpId,
    userId: idpInformation.userId,
    userName: idpInformation.userName || "Unknown User",
  };

  const linkRes = await addIdpLinkToUser(targetUserId, idpLink);
  console.log("Ответ от addIdpLinkToUser:", JSON.stringify(linkRes));
  if (!linkRes.success) {
    throw new Error("Ошибка при привязке аккаунта");
  }

  // Создаем сессию для существующего пользователя
  const sessionRes = await createSession(targetUserId, intentId, intentToken);
  console.log("Ответ от createSession:", JSON.stringify(sessionRes));
  if (!sessionRes.success || !sessionRes.data?.sessionToken) {
    throw new Error("Аккаунт привязан, но не удалось создать сессию");
  }

  await finishAuth(sessionRes.data.sessionToken);
}