import { JWTPayload } from "jose";

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

export interface ExternalAuthResponse {
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
  expiresInSeconds: number;
}