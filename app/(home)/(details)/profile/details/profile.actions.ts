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

    if (data.email) {
      await updateHumanEmail(userId, data.email);
    }

    if (data.middleName !== undefined) {
      await updateUserMiddleName(userId, data.middleName);
    }

    return { success: true, data: await getProfileDataAction() };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function uploadAvatarAction(formData: FormData) {
  await requireValidSession();
  const file = formData.get("avatar") as File | null;
  if (!file) {
    return { success: false, error: "Файл не выбран" };
  }

  try {
    const result = await uploadMyAvatar(file);

    if (!result.success) {
      return { success: false, error: "Ошибка загрузки аватара" };
    }

    revalidatePath("/profile");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
