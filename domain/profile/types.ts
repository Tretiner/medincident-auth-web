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

export interface PersonalInfo {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  phone: string;
  position: string;
  avatarUrl?: string;
}

export interface LinkedAccountsStatus {
  telegram: boolean;
  max: boolean;
}

export interface UserSession {
  id: string;
  deviceName: string;
  ip: string;
  lastActive: Date;
  isCurrent: boolean;
}

export interface SecurityState {
  linkedAccounts: LinkedAccountsStatus;
  sessions: UserSession[];
}

export interface SecurityData {
  sessions: UserSession[];
}