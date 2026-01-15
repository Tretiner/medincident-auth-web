"use server";

import { PersonalInfo } from "@/domain/profile/types";
import { personalInfoSchema } from "@/domain/profile/schema";
import { getUserFromSession } from "@/services/session/session-service";
import { unauthorized } from "next/navigation";
import { db } from "@/lib/mock-db";
import { Result } from "@/domain/error";

export async function updateUserProfile(
  formData: Partial<PersonalInfo>
): Promise<Result<PersonalInfo>> {
  const session = await getUserFromSession();

  if (!session) unauthorized();

  const result = personalInfoSchema.safeParse(formData);

  if (!result.success) {
    const errorMessage = result.error.issues.map((e) => e.message).join(", ");
    return {
      success: false,
      error: {
        type: "VALIDATION_ERROR",
        message: errorMessage,
      },
    };
  }

  try {
    const updatedUser = db.user.updateInfo(result.data);
    return { success: true, data: updatedUser };
  } catch (error) {
    console.error("DB Update Error:", error);
    return {
      success: false,
      error: {
        type: "API_ERROR",
        message: "Не удалось сохранить данные профиля",
      },
    };
  }
}