'use server';

import { User, UserSession } from "@/domain/profile/types";

// --- MOCK DATA ---

let MOCK_USER: User = {
  id: "USR-7734-21",
  firstName: "Алексей",
  lastName: "Смирнов",
  middleName: "Викторович",
  email: "alex.smirnov@ilizarov.ru",
  phone: "+7 (999) 123-45-67",
  position: "Ведущий хирург",
  avatarUrl: "https://i.pravatar.cc/150?u=USR-7734-21",
  linkedAccounts: {
    telegram: true, // Привязан
    max: false,     // Не привязан
  }
};

let MOCK_SESSIONS: UserSession[] = [
  {
    id: "sess_1",
    deviceName: "Chrome (Windows 11)",
    ip: "192.168.1.1",
    lastActive: new Date(), // Прямо сейчас
    isCurrent: true
  },
  {
    id: "sess_2",
    deviceName: "Safari (iPhone 14 Pro)",
    ip: "10.0.0.5",
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24), // Вчера
    isCurrent: false
  },
  {
    id: "sess_3",
    deviceName: "Firefox (MacOS)",
    ip: "172.16.0.1",
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 дней назад
    isCurrent: false
  }
];

// --- ACTIONS ---

// 1. Получение профиля (используется в SSR page.tsx)
export async function getUserProfile(): Promise<User> {
  await new Promise((resolve) => setTimeout(resolve, 500)); // Network delay
  return MOCK_USER;
}

// 2. Получение сессий (используется в табе Security)
export async function getUserSessions(): Promise<UserSession[]> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return MOCK_SESSIONS;
}

// 3. Обновление профиля (используется в форме "Мои данные")
export async function updateUserProfile(formData: Partial<User>): Promise<User> {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  // Merge updates
  MOCK_USER = { ...MOCK_USER, ...formData };
  
  // В реальном Next.js здесь был бы revalidatePath('/profile')
  return MOCK_USER;
}

// 4. Отзыв сессии (используется в табе Security)
export async function revokeSession(sessionId: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 800));
  MOCK_SESSIONS = MOCK_SESSIONS.filter(s => s.id !== sessionId);
}

// Toggle привязки соцсети
export async function toggleAccountLink(provider: 'telegram' | 'max'): Promise<void> {
    await new Promise(r => setTimeout(r, 800));
    // В реальности: запрос к API
    console.log(`Toggled ${provider}`);
    // MOCK update
    MOCK_USER.linkedAccounts[provider] = !MOCK_USER.linkedAccounts[provider];
}

// Удалить все сессии кроме текущей
export async function revokeAllOtherSessions(): Promise<void> {
    await new Promise(r => setTimeout(r, 1000));
    // Оставляем только текущую
    MOCK_SESSIONS = MOCK_SESSIONS.filter(s => s.isCurrent);
}