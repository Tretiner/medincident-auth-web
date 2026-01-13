'use server';

import { User, UserSession } from "@/domain/profile/types";
import { cookies } from "next/headers";
import { env } from "@/config/env";
import { revalidatePath } from "next/cache";
import { profileSchema as ProfileSchema } from "@/domain/profile/schema";

// Хелпер для запросов к API с пробросом кук
async function fetchApi<T>(path: string, options: RequestInit = {}): Promise<T> {
  const cookieStore = await cookies();
  const headers = {
    'Content-Type': 'application/json',
    'Cookie': cookieStore.toString(),
    ...options.headers,
  };

  const res = await fetch(`${env.NEXT_PUBLIC_APP_URL}/api/profile/${path}`, {
    ...options,
    headers,
    cache: 'no-store'
  });

  if (!res.ok) {
    if (res.status === 401) {
       throw new Error("Unauthorized");
    }
    throw new Error(`API Error: ${res.statusText}`);
  }

  return res.json();
}

// --- ACTIONS ---

// 1. Получение профиля
export async function getUserProfile(): Promise<User> {
  return await fetchApi<User>('me');
}

// 2. Получение сессий
export async function getUserSessions(): Promise<UserSession[]> {
  // Приведение дат из строк (JSON) обратно в Date
  const sessions = await fetchApi<UserSession[]>('sessions');
  return sessions.map(s => ({
    ...s,
    lastActive: new Date(s.lastActive)
  }));
}

// 4. Отзыв сессии
export async function revokeSession(sessionId: string): Promise<void> {
  await fetchApi(`sessions?id=${sessionId}`, {
    method: 'DELETE'
  });
  revalidatePath('/profile/security');
}

// 5. Toggle привязки соцсети
export async function toggleAccountLink(provider: 'telegram' | 'max'): Promise<void> {
    await fetchApi('me/links', {
      method: 'POST',
      body: JSON.stringify({ provider })
    });
    revalidatePath('/profile/security');
}

// 6. Удалить все сессии кроме текущей
export async function revokeAllOtherSessions(): Promise<void> {
    await fetchApi('sessions?type=others', {
      method: 'DELETE'
    });
    revalidatePath('/profile/security');
}