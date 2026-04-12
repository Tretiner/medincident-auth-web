import { TelegramUser } from "@/domain/auth/types";
import { LinkedAccountsStatus, PersonalInfo, User, UserSession } from "@/domain/profile/types";
import { getMockAvatarUrl } from "./mock-avatar";

export const MockTgUser: TelegramUser = {
  id: 773421,
  firstName: "Алексей",
  lastName: "Смирнов",
  userName: "alex_smirnov",
  photoUrl: getMockAvatarUrl("USR-7734-21"),
  authDate: Math.floor(Date.now() / 1000),
  hash: "mock_dev_hash",
};

// Исходные данные (как в БД)
export let MockFullUser: User = {
  info: {
    id: "USR-7734-21",
    firstName: "Алексей",
    lastName: "Смирнов",
    middleName: "Викторович",
    email: "alex.smirnov@medsafety.ru",
    isEmailVerified: true,
    position: "Ведущий хирург",
    avatarUrl: getMockAvatarUrl("USR-7734-21"),
  },
  linkedAccounts: {
    telegram: true,
    max: false,
  },
};

let SESSIONS: UserSession[] = [
  {
    id: "sess_1",
    deviceName: "Chrome (Windows 11)",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    ip: "192.168.1.1",
    lastActive: new Date(),
    isCurrent: true,
  },
  {
    id: "sess_2",
    deviceName: "Safari (iPhone 14 Pro)",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    ip: "10.0.0.5",
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24),
    isCurrent: false,
  },
  {
    id: "sess_3",
    deviceName: "Firefox (MacOS)",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    ip: "172.16.0.1",
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    isCurrent: false,
  },
];

import { CheckConsentResponse } from "@/domain/consent/schema";

export const SCOPE_DESCRIPTIONS: Record<string, string> = {
  profile: "Доступ к вашему имени, фамилии и аватару",
  email: "Доступ к вашему адресу электронной почты",
  offline_access: "Возможность обновлять данные без вашего участия",
  phone: "Доступ к номеру телефона",
};

export const MockOAuthApps: Record<string, Pick<CheckConsentResponse, 'name' | 'hostname' | 'photoUrl'>> = {
  "client_123": {
    name: "Health Keeper",
    hostname: "health-keeper.app",
    photoUrl: "https://api.dicebear.com/9.x/initials/svg?seed=HK&backgroundColor=0ea5e9",
  },
  "client_456": {
    name: "Smart Fitness",
    hostname: "smart-fitness.io",
    photoUrl: "https://api.dicebear.com/9.x/initials/svg?seed=SF&backgroundColor=8b5cf6",
  },
  "client_bad": {
    name: "Malicious App",
    hostname: "steal-data.com",
    photoUrl: "", // Нет логотипа
  }
};

// Методы для работы с БД
export const db = {
  user: {
    get: () => ({ ...MockFullUser }), // Возвращаем копию
    update: (data: Partial<User>) => {
      MockFullUser = { ...MockFullUser, ...data };
      return MockFullUser;
    },
    updateInfo: (data: Partial<PersonalInfo>) => {
      MockFullUser.info = { ...MockFullUser.info, ...data };
      return MockFullUser.info;
    },
    updateLinkedAccounts: (data: Partial<LinkedAccountsStatus>) => {
      MockFullUser.linkedAccounts = { ...MockFullUser.linkedAccounts, ...data };
      return MockFullUser.info;
    },
    toggleLink: (provider: "telegram" | "max") => {
      MockFullUser.linkedAccounts[provider] = !MockFullUser.linkedAccounts[provider];
      return MockFullUser;
    },
  },
  sessions: {
    getAll: () => [...SESSIONS],
    revoke: (id: string) => {
      SESSIONS = SESSIONS.filter((s) => s.id !== id);
      return SESSIONS;
    },
    revokeOthers: () => {
      SESSIONS = SESSIONS.filter((s) => s.isCurrent);
      return SESSIONS;
    },
  },
};
