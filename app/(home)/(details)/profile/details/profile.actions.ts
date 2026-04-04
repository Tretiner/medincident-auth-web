"use server";

import { requireValidSession } from "@/services/zitadel/session";
import { PersonalInfo } from "@/domain/profile/types";
import { ProfileFormData } from "./profile.hooks";

import { getUserById, updateHumanProfile, updateHumanEmail, updateUserMetadata, searchUserMetadata, updateUserMiddleName, getUserMiddleName } from "@/services/zitadel/api";
import { updateHumanAvatar } from "@/services/zitadel/api";
import { revalidatePath } from "next/cache";

export async function getProfileDataAction() {
  const { userId } = await requireValidSession();
  
  const [userResult, middleName] = await Promise.all([
    getUserById(userId),
    getUserMiddleName(userId)
  ]);
  
  if (!userResult.success) {
    throw new Error("Не удалось получить данные пользователя");
  }

  console.log("USER: ", JSON.stringify(userResult))

  const human = userResult.data.user?.human;

  return {
    id: userId,
    firstName: human?.profile?.givenName || "",
    lastName: human?.profile?.familyName || "",
    middleName: middleName, // Передаем найденное отчество
    email: human?.email?.email || "",
    isEmailVerified: human?.email?.isVerified || false,
    position: "Врач скорой помощи", // TODO: получать из реального источника
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
      await updateUserMiddleName(userId, data.middleName);
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