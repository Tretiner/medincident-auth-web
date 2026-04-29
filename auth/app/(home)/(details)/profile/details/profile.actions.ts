"use server";

import { requireValidSession } from "@/services/zitadel/session";
import { ProfileFormData } from "./profile.hooks";

import { updateHumanEmail, updateUserMiddleName, getUserMiddleName } from "@/services/zitadel/api";
import { getMe, updateMyProfile, uploadMyAvatar } from "@/services/zitadel/user/requests/profile";
import { revalidatePath } from "next/cache";

export async function getProfileDataAction() {
  const { userId } = await requireValidSession();

  const [userResult, middleName] = await Promise.all([
    getMe(userId),
    getUserMiddleName(userId),
  ]);

  if (!userResult.success) {
    throw new Error("Не удалось получить данные пользователя");
  }

  const human = userResult.data.user?.human;

  return {
    id: userId,
    firstName: human?.profile?.givenName || "",
    lastName: human?.profile?.familyName || "",
    middleName: middleName,
    email: human?.email?.email || "",
    isEmailVerified: human?.email?.isVerified || false,
    position: "Врач скорой помощи",
    avatarUrl: human?.profile?.avatarUrl || "",
  };
}

// PATCH
export async function updateProfileDataAction(data: ProfileFormData) {
  const { userId } = await requireValidSession();
  try {
    await updateMyProfile(userId, { givenName: data.firstName, familyName: data.lastName });

    // Обновляем email только если он реально изменился (case-insensitive, чтобы не триггерить на UPPER/lower)
    if (data.email && data.email.trim().length > 0) {
      const currentData = await getMe(userId);
      const currentEmail = currentData.success ? currentData.data?.user?.human?.email?.email : undefined;
      if (data.email.toLowerCase() !== currentEmail?.toLowerCase()) {
        await updateHumanEmail(userId, data.email.trim());
      }
    }

    if (data.middleName !== undefined) {
      await updateUserMiddleName(userId, data.middleName);
    }

    return { success: true, data: await getProfileDataAction() };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

const MAX_AVATAR_SIZE = 512 * 1024; // 512 КБ — лимит Zitadel

export async function uploadAvatarAction(formData: FormData) {
  await requireValidSession();
  const file = formData.get("avatar") as File | null;
  if (!file) {
    return { success: false, error: "Файл не выбран" };
  }

  if (file.size > MAX_AVATAR_SIZE) {
    return { success: false, error: "Максимальный размер аватара — 512 КБ" };
  }

  const result = await uploadMyAvatar(file);

  if (!result.success) {
    const code = result.error.code;
    if (code === 413) {
      return { success: false, error: "Файл слишком большой. Максимум — 512 КБ" };
    }
    if (code === 400) {
      return { success: false, error: "Неподдерживаемый формат. Используйте PNG, JPEG или WebP" };
    }
    return { success: false, error: result.error.message || "Ошибка загрузки аватара" };
  }

  revalidatePath("/profile");
  return { success: true };
}
