import { JWTPayload } from "jose";

export interface ExternalAuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresInSeconds: number;
}

export interface TokenPayload {
  id: string;
  userId: string;
  exp: number;
  type: 'access' | 'refresh';
}

export interface RedisSessionData {
  userId: string;
  fingerprint: string;
  createdAt: number;
  lastActive: number;
}

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

export interface JwtUser extends JWTPayload {
  sid: string;
  uid: string;
}