"use server";

import { revalidatePath } from "next/cache";
import { unauthorized } from "next/navigation";
import { db } from "@/lib/mock-db";
import { getUserFromSession } from "@/services/session/session-service";
import { 
  personalInfoSchema, 
  PersonalInfoFormData 
} from "@/domain/profile/schema";
import { 
  PersonalInfo, 
  LinkedAccountsStatus, 
  UserSession 
} from "@/domain/profile/types";
import { Result } from "@/domain/error";

export async function getPersonalInfo(): Promise<PersonalInfo> {
  const session = await getUserFromSession();
  if (!session) unauthorized();
  
  const user = db.user.get();
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    middleName: user.middleName,
    email: user.email,
    phone: user.phone,
    position: user.position,
    avatarUrl: user.avatarUrl
  };
}

export async function getLinkedAccounts(): Promise<LinkedAccountsStatus> {
  const session = await getUserFromSession();
  if (!session) unauthorized();
  
  const user = db.user.get();
  return user.linkedAccounts;
}

export async function getUserSessions(): Promise<UserSession[]> {
  const session = await getUserFromSession();
  if (!session) unauthorized();
  
  const sessions = db.sessions.getAll();
  
  return sessions.map(s => ({
    ...s,
    lastActive: new Date(s.lastActive)
  }));
}

export async function updatePersonalInfo(data: PersonalInfoFormData): Promise<Result<PersonalInfo>> {
  const session = await getUserFromSession();
  if (!session) unauthorized();

  const parse = personalInfoSchema.safeParse(data);
  
  if (!parse.success) {
    const errorMessage = parse.error.issues.map((e) => e.message).join(", ");
    return { 
      success: false, 
      error: { type: "VALIDATION_ERROR", message: errorMessage } 
    };
  }

  try {
    const updated = db.user.update(parse.data);
    
    revalidatePath('/profile/details');
    
    return { success: true, data: updated };
  } catch (e) {
    console.error("Update Error:", e);
    return { 
      success: false, 
      error: { type: "API_ERROR", message: "Не удалось сохранить данные профиля" } 
    };
  }
}

export async function toggleAccountLink(provider: "telegram" | "max"): Promise<Result<void>> {
  const session = await getUserFromSession();
  if (!session) unauthorized();

  try {
    db.user.toggleLink(provider);
    revalidatePath('/profile/security');
    return { success: true, data: undefined };
  } catch (e) {
    return { 
      success: false, 
      error: { type: "API_ERROR", message: "Ошибка при изменении привязки" } 
    };
  }
}

export async function revokeSession(sessionId: string): Promise<Result<void>> {
  const session = await getUserFromSession();
  if (!session) unauthorized();

  try {
    db.sessions.revoke(sessionId);
    revalidatePath('/profile/security');
    return { success: true, data: undefined };
  } catch (e) {
    return { 
      success: false, 
      error: { type: "API_ERROR", message: "Не удалось завершить сессию" } 
    };
  }
}

export async function revokeAllOtherSessions(): Promise<Result<void>> {
  const session = await getUserFromSession();
  if (!session) unauthorized();

  try {
    db.sessions.revokeOthers();
    revalidatePath('/profile/security');
    return { success: true, data: undefined };
  } catch (e) {
    return { 
      success: false, 
      error: { type: "API_ERROR", message: "Ошибка сервера" } 
    };
  }
}