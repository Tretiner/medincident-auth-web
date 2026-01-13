"use server";

import { User } from "@/domain/profile/types";
import { profileSchema as ProfileSchema } from "@/domain/profile/schema";
import { getUserFromSession } from "@/services/session/session-service";
import { unauthorized } from "next/navigation";
import { db } from "@/lib/mock-db";

export async function updateUserProfile(
  formData: Partial<User>
): Promise<User> {
  const session = await getUserFromSession();

  if (!session) unauthorized();

  const result = ProfileSchema.safeParse(formData);

  if (!result.success) {
    const errorMessage = result.error.issues.map((e) => e.message).join(", ");
    console.error("Server Validation Error:", errorMessage);
    throw new Error(`Ошибка валидации: ${errorMessage}`);
  }

  const updatedUser = db.user.update(result.data);

  return updatedUser;
}
