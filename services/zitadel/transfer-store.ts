"server only";

// Хранилище токенов для переноса сессии с одного устройства на другое
// Desktop (залогинен) → создаёт токен → Phone сканирует QR → получает сессию
//
// Используем globalThis чтобы Map пережил горячую перезагрузку модулей (HMR).

interface TransferEntry {
  userId: string;
  expiresAt: number;
  used: boolean;
}

const g = globalThis as typeof globalThis & { __transferStore?: Map<string, TransferEntry> };
if (!g.__transferStore) g.__transferStore = new Map();
const store = g.__transferStore;

function cleanExpired() {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.expiresAt < now) {
      store.delete(key);
    }
  }
}

export function createTransferToken(
  userId: string,
  expiresInSeconds = 300
): string {
  cleanExpired();
  const token = crypto.randomUUID();
  store.set(token, {
    userId,
    expiresAt: Date.now() + expiresInSeconds * 1000,
    used: false,
  });
  return token;
}

export function getTransferEntry(token: string): TransferEntry | null {
  cleanExpired();
  const entry = store.get(token);
  if (!entry || entry.expiresAt < Date.now() || entry.used) {
    store.delete(token);
    return null;
  }
  return entry;
}

export function consumeTransferToken(token: string): string | null {
  const entry = getTransferEntry(token);
  if (!entry) return null;
  store.set(token, { ...entry, used: true });
  return entry.userId;
}
