export interface User {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  phone: string;
  position: string;
  avatarUrl?: string;
  linkedAccounts: {
    telegram: boolean;
    max: boolean;
  };
}

export interface UserSession {
  id: string;
  deviceName: string; // "Chrome on Windows", "iPhone 13"
  ip: string;
  lastActive: Date;
  isCurrent: boolean;
}

export interface ProfileData {
  user: User;
}

export interface SecurityData {
  sessions: UserSession[];
}