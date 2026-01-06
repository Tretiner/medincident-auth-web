import { User, UserSession } from "@/domain/profile/types";
import { env } from "@/env";

// Исходные данные (как в БД)
let USER: User = {
  id: "USR-7734-21",
  firstName: "Алексей",
  lastName: "Смирнов",
  middleName: "Викторович",
  email: "alex.smirnov@medsafety.ru",
  phone: "+7 (999) 123-45-67",
  position: "Ведущий хирург",
  avatarUrl: `/api/res/avatar/150?u=USR-7734-21`,
  linkedAccounts: {
    telegram: true,
    max: false,
  }
};

let SESSIONS: UserSession[] = [
  {
    id: "sess_1",
    deviceName: "Chrome (Windows 11)",
    ip: "192.168.1.1",
    lastActive: new Date(),
    isCurrent: true
  },
  {
    id: "sess_2",
    deviceName: "Safari (iPhone 14 Pro)",
    ip: "10.0.0.5",
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24),
    isCurrent: false
  },
  {
    id: "sess_3",
    deviceName: "Firefox (MacOS)",
    ip: "172.16.0.1",
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    isCurrent: false
  }
];

// Методы для работы с БД
export const db = {
  user: {
    get: () => ({ ...USER }), // Возвращаем копию
    update: (data: Partial<User>) => {
      USER = { ...USER, ...data };
      return USER;
    },
    toggleLink: (provider: 'telegram' | 'max') => {
      USER.linkedAccounts[provider] = !USER.linkedAccounts[provider];
      return USER;
    }
  },
  sessions: {
    getAll: () => [...SESSIONS],
    revoke: (id: string) => {
      SESSIONS = SESSIONS.filter(s => s.id !== id);
      return SESSIONS;
    },
    revokeOthers: () => {
      SESSIONS = SESSIONS.filter(s => s.isCurrent);
      return SESSIONS;
    }
  }
};