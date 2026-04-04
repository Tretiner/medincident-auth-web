"server only";

// user_code → запись о device authorization
// user_code — то, что Device A видит и что закодировано в QR
//
// Используем globalThis чтобы Map пережил горячую перезагрузку модулей (HMR)
// и не терял записи при изменении файлов в dev-режиме.

interface QrEntry {
  deviceCode: string;
  status: "pending" | "confirmed";
  accessToken?: string;
  idToken?: string;
  requestId?: string; // OIDC requestId если QR показывался на /login?requestId=...
  expiresAt: number;
}

const g = globalThis as typeof globalThis & { __qrStore?: Map<string, QrEntry> };
if (!g.__qrStore) g.__qrStore = new Map();
const store = g.__qrStore;

function cleanExpired() {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.expiresAt < now) {
      store.delete(key);
    }
  }
}

export function storeQrEntry(
  userCode: string,
  deviceCode: string,
  expiresInSeconds: number,
  requestId?: string
): void {
  cleanExpired();
  store.set(userCode, {
    deviceCode,
    status: "pending",
    requestId,
    expiresAt: Date.now() + expiresInSeconds * 1000,
  });
}

export function getQrEntry(userCode: string): QrEntry | null {
  cleanExpired();
  const entry = store.get(userCode);
  if (!entry || entry.expiresAt < Date.now()) {
    store.delete(userCode);
    return null;
  }
  return entry;
}

export function confirmQrEntry(
  userCode: string,
  accessToken: string,
  idToken: string
): boolean {
  const entry = store.get(userCode);
  if (!entry || entry.status !== "pending" || entry.expiresAt < Date.now()) {
    return false;
  }
  store.set(userCode, { ...entry, status: "confirmed", accessToken, idToken });
  return true;
}
