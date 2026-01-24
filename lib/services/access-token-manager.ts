"use client";

interface AccessTokenData {
  token: string;
  expiresIn: number; // seconds
}

interface StoredToken {
  token: string;
  expiresAtMillis: number; // millis
}

class AccessTokenManager {
  private static instance: AccessTokenManager;
  private readonly STORAGE_KEY = "apboba";

  private constructor() {}

  public static getInstance(): AccessTokenManager {
    if (!AccessTokenManager.instance) {
      AccessTokenManager.instance = new AccessTokenManager();
    }
    return AccessTokenManager.instance;
  }

  public setToken(data: AccessTokenData): void {
    if (typeof window === "undefined") return;
    
    const payload: StoredToken = {
      token: data.token,
      expiresAtMillis: Date.now() + data.expiresIn * 1000,
    };

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.error("Failed to save access token", e);
    }
  }

  public getToken(): string | null {
    if (typeof window === "undefined") return null;

    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (!raw) return null;

    try {
      const payload: StoredToken = JSON.parse(raw);
      
      if (Date.now() > payload.expiresAtMillis) {
        this.removeToken();
        return null;
      }

      return payload.token;
    } catch {
      this.removeToken();
      return null;
    }
  }

  public removeToken(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(this.STORAGE_KEY);
  }

  public hasToken(): boolean {
    return !!this.getToken();
  }
}

export const tokenManager = AccessTokenManager.getInstance();