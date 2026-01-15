import { TelegramUser } from "@/domain/auth/types";
import { LinkedAccountsStatus, PersonalInfo, User, UserSession } from "@/domain/profile/types";

export const MockTgUser: TelegramUser = {
  id: 773421,
  first_name: "Алексей",
  last_name: "Смирнов",
  username: "alex_smirnov",
  photo_url: "https://i.pravatar.cc/150?u=USR-7734-21",
  auth_date: Math.floor(Date.now() / 1000),
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
    phone: "+7 (999) 123-45-67",
    position: "Ведущий хирург",
    avatarUrl: `/api/res/avatar/150?u=USR-7734-21`,
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
    ip: "192.168.1.1",
    lastActive: new Date(),
    isCurrent: true,
  },
  {
    id: "sess_2",
    deviceName: "Safari (iPhone 14 Pro)",
    ip: "10.0.0.5",
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24),
    isCurrent: false,
  },
  {
    id: "sess_3",
    deviceName: "Firefox (MacOS)",
    ip: "172.16.0.1",
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    isCurrent: false,
  },
];

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
