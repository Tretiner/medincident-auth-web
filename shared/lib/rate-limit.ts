"server only";

// Простой per-key rate-limiter на in-memory sliding window.
// Для single-node хватает; при горизонтальном масштабировании — заменить на Redis.

interface Bucket {
  hits: number[];
  expiresAt: number;
}

const g = globalThis as typeof globalThis & { __rateLimitStore?: Map<string, Bucket> };
if (!g.__rateLimitStore) g.__rateLimitStore = new Map();
const store = g.__rateLimitStore;

function cleanExpired() {
  const now = Date.now();
  for (const [key, bucket] of store.entries()) {
    if (bucket.expiresAt < now) store.delete(key);
  }
}

interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfterMs: number;
}

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  if (Math.random() < 0.01) cleanExpired();

  const bucket = store.get(key) ?? { hits: [], expiresAt: now + windowMs };
  bucket.hits = bucket.hits.filter((t) => now - t < windowMs);

  if (bucket.hits.length >= limit) {
    const oldest = bucket.hits[0] ?? now;
    return { ok: false, remaining: 0, retryAfterMs: windowMs - (now - oldest) };
  }

  bucket.hits.push(now);
  bucket.expiresAt = now + windowMs;
  store.set(key, bucket);

  return { ok: true, remaining: limit - bucket.hits.length, retryAfterMs: 0 };
}

export function clientKeyFromRequest(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const real = req.headers.get("x-real-ip")?.trim();
  return fwd || real || "unknown";
}
