"use client";

export interface AccessTokenData {
  token: string;
  expiresInMillis: number;
}

interface StoredToken {
  token: string;
  expiresAt: number; // millis
}

const STORAGE_KEY = "cookie-clicker";

export function setAccessToken(data: AccessTokenData): void {
  if (typeof window === "undefined") return;

  const payload: StoredToken = {
    token: data.token,
    expiresAt: Date.now() + data.expiresInMillis,
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (e) {
    console.error("Failed to save access token", e);
  }
}

export function removeAccessToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const payload: StoredToken = JSON.parse(raw);

    if (Date.now() > payload.expiresAt) {
      removeAccessToken();
      return null;
    }

    return payload.token;
  } catch {
    removeAccessToken();
    return null;
  }
}

export function hasAccessToken(): boolean {
  return !!getAccessToken();
}

export function getAccessTokenWithExpiration(): AccessTokenData | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const payload: StoredToken = JSON.parse(raw);

    if (Date.now() > payload.expiresAt) {
      removeAccessToken();
      return null;
    }

    return {
      token: payload.token,
      expiresInMillis: (Date.now() - payload.expiresAt) / 1000,
    };
  } catch {
    removeAccessToken();
    return null;
  }
}
