import Redis from "ioredis";
import { env } from "@/config/env";

const globalForRedis = global as unknown as { redis: Redis | undefined };

export const redis =
  globalForRedis.redis ||
  new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });

if (env.isDev) {
  globalForRedis.redis = redis;
}