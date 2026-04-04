import { JWTPayload } from "jose";

export interface TelegramUser {
  id: number;
  firstName: string;
  lastName?: string;
  userName?: string;
  photoUrl?: string;
  authDate: number;
  hash: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresInSeconds: number;
}

export interface JwtUser extends JWTPayload {
  sid: string;
  uid: string;
}

export interface QrData {
  url?: string;
  token?: string;
  expiresInSeconds: number;
}

export type QrStatus = "pending" | "confirmed" | "expired";