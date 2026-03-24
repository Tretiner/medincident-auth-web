"use server";

import { requireValidSession } from "@/lib/zitadel/session";
import { PersonalInfo } from "@/domain/profile/types";
import { ProfileFormData } from "./profile.hooks";

import { getUserById, updateHumanProfile, updateHumanEmail, updateUserMetadata, searchUserMetadata } from "@/lib/zitadel/api";
import { updateHumanAvatar } from "@/lib/zitadel/api";
import { revalidatePath } from "next/cache";

export async function getProfileDataAction() {
  const { userId } = await requireValidSession();
  
  const [userResult, metadataResult] = await Promise.all([
    getUserById(userId),
    searchUserMetadata(userId, {
      query: { offset: 0, limit: 1, asc: true },
      queries: [
        {
          keyQuery: {
            key: "middleName",
            method: "TEXT_FILTER_METHOD_EQUALS"
          }
        }
      ]
    })
  ]);
  
  if (!userResult.success) {
    throw new Error("Не удалось получить данные пользователя");
  }

  // --- ДОСТАЕМ И ДЕКОДИРУЕМ ОТЧЕСТВО ---
  let middleName = "";
  if (metadataResult.success && metadataResult.data.result) {
    // Находим нужный элемент (хотя фильтр должен был вернуть только его)
    const encodedKey = Buffer.from("middleName").toString("base64");
    const mnMeta = metadataResult.data.result.find(m => m.key === encodedKey);
    
    if (mnMeta?.value) {
      // ZITADEL возвращает value в Base64, декодируем обратно в UTF-8
      middleName = Buffer.from(mnMeta.value, "base64").toString("utf-8");
    }
  }

  const human = userResult.data.user?.human;
  const isEmailVerified = human?.email?.isEmailVerified || false;

  return {
    id: userId,
    firstName: human?.profile?.givenName || "",
    lastName: human?.profile?.familyName || "",
    middleName: middleName, // Передаем найденное отчество
    email: human?.email?.email || "",
    isEmailVerified, 
    avatarUrl: human?.profile?.avatarUrl || "",
  };
}

// PATCH
export async function updateProfileDataAction(data: ProfileFormData) {
  const { userId } = await requireValidSession();
  try {
    // 1. Обновляем базовый профиль
    await updateHumanProfile(userId, data.firstName, data.lastName);

    // 2. Обновляем Email
    if (data.email) {
      await updateHumanEmail(userId, data.email);
    }

    // 3. Обновляем кастомные поля в Metadata (Отчество)
    if (data.middleName !== undefined) {
      await updateUserMetadata(userId, 'middleName', data.middleName);
    }

    return { success: true, data: await getProfileDataAction() };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function uploadAvatarAction(formData: FormData) {
  const { userId } = await requireValidSession();
  
  const file = formData.get("avatar") as File | null;
  if (!file) {
    return { success: false, error: "Файл не выбран" };
  }

  try {
    const result = await updateHumanAvatar(userId, file);
    
    if (!result.success) {
      return { success: false, error: "Ошибка загрузки аватара" };
    }

    // Сбрасываем кэш страницы профиля, чтобы данные обновились при перезагрузке
    revalidatePath("/profile"); 
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}