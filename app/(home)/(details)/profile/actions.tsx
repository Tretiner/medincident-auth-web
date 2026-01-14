"use server";

import { User, UserSession } from "@/domain/profile/types";
import { cookies } from "next/headers";
import { env } from "@/config/env";
import { revalidatePath } from "next/cache";
import { profileSchema as ProfileSchema } from "@/domain/profile/schema";
import { Result } from "@/domain/error";
import { unauthorized } from "next/navigation";
import { db } from "@/lib/mock-db";
import { getUserFromSession } from "@/services/session/session-service";

// Хелпер для запросов к API с пробросом кук
async function fetchApi<T>(
  path: string,
  options: RequestInit = {}
): Promise<Result<T>> {
  const cookieStore = await cookies();
  const headers = {
    "Content-Type": "application/json",
    Cookie: cookieStore.toString(),
    ...options.headers,
  };

  const res = await fetch(`${env.NEXT_PUBLIC_APP_URL}/api/profile/${path}`, {
    ...options,
    headers,
    cache: "no-store",
  });

  if (!res.ok) {
    if (res.status === 401) {
      return {
        success: false,
        error: { type: "API_ERROR", message: `Unauthorized` },
      };
    }
    return {
      success: false,
      error: { type: "API_ERROR", message: `API Error: ${res.statusText}` },
    };
  }

  return { success: true, data: await res.json() };
}

// --- ACTIONS ---
// 1. Получение профиля
export async function getUserProfile(): Promise<User> {
  const session = await getUserFromSession();

  if (!session) unauthorized();

  const user = db.user.get();

  return user;
}

// 2. Получение сессий
export async function getUserSessions(): Promise<UserSession[]> {
  const session = await getUserFromSession();

  if (!session) {
    unauthorized();
  }

  const sessions = db.sessions.getAll();

  return sessions.map((s) => ({
    ...s,
    lastActive: new Date(s.lastActive),
  }));
}

// 4. Отзыв сессии
export async function revokeSession(sessionId: string): Promise<void> {
  await fetchApi(`sessions?id=${sessionId}`, {
    method: "DELETE",
  });
  revalidatePath("/profile/security");
}

// 5. Toggle привязки соцсети
export async function toggleAccountLink(
  provider: "telegram" | "max"
): Promise<void> {
  await fetchApi("me/links", {
    method: "POST",
    body: JSON.stringify({ provider }),
  });
  revalidatePath("/profile/security");
}

// 6. Удалить все сессии кроме текущей
export async function revokeAllOtherSessions(): Promise<void> {
  await fetchApi("sessions?type=others", {
    method: "DELETE",
  });
  revalidatePath("/profile/security");
}
