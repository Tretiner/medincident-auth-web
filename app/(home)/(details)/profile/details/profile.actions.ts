"use server";

import { requireValidSession } from "@/lib/zitadel/session";
import { PersonalInfo } from "@/domain/profile/types";
import { ProfileFormData } from "./profile.hooks";
import { fetchZitadel } from "@/lib/zitadel/zitadel-api";

const ZITADEL_API_URL = process.env.ZITADEL_API_URL || process.env.NEXT_PUBLIC_AUTH_URL;
const ZITADEL_TOKEN = process.env.ZITADEL_API_TOKEN;

// GET: Получить данные текущего пользователя
export async function getProfileDataAction(): Promise<PersonalInfo> {
  const { userId } = await requireValidSession();

  // 1. Получаем основного юзера (v2)
  const userData = await fetchZitadel(`/v2/users/${userId}`);

  console.log(JSON.stringify(userData))
  
  // Достаем объект human из ответа, согласно твоей схеме
  const human = userData.user?.human;

  return {
    id: userId,
    firstName: human?.profile?.givenName || "",
    lastName: human?.profile?.familyName || "",
    middleName: "", 
    email: human?.email?.email || "", // Изменили на .email согласно твоей схеме
    avatarUrl: human?.profile?.avatarUrl || "",
    position: "",     
  };
}

// PATCH: Обновить данные пользователя
export async function updateProfileDataAction(data: ProfileFormData) {
  const { userId } = await requireValidSession();

  try {
    // 1. Обновляем базовый профиль (имя, фамилия)
    await fetchZitadel(`/v2/users/${userId}/human/profile`, {
      method: "PUT",
      body: JSON.stringify({
        givenName: data.firstName,
        familyName: data.lastName,
      }),
    });

    // 2. Обновляем Email
    if (data.email) {
      // Примечание: В PUT запросе ZITADEL может по-прежнему ожидать emailAddress.
      // Если будет выдавать ошибку 400, поменяй ключ email на emailAddress.
      await fetchZitadel(`/v2/users/${userId}/human/email`, {
        method: "PUT",
        body: JSON.stringify({
          email: data.email, 
          sendCode: false, 
        }),
      });
    }

    // 3. Обновляем кастомные поля в Metadata (Отчество)
    if (data.middleName !== undefined) {
      await fetchZitadel(`/v2/users/${userId}/metadata/${btoa('middleName')}`, {
        method: "POST", 
        body: JSON.stringify({
          value: Buffer.from(data.middleName).toString('base64')
        })
      });
    }

    // Возвращаем обновленные данные, чтобы обновить кэш на клиенте
    return { success: true, data: await getProfileDataAction() };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}