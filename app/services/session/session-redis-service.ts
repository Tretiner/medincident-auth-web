import { redis } from "@/lib/redis";

const REDIS_PREFIX = "auth:refresh:";

export class SessionRedisService {
  static async saveRefreshToken(refreshToken: string, userId: string, expiresAt: Date) {
    // Вычисляем TTL в секундах
    const expiresTime = new Date(expiresAt).getTime();
    const nowTime = Date.now();
    
    // 2. Считаем TTL в секундах: (Время истечения - Сейчас) / 1000
    const ttlSeconds = Math.ceil((expiresTime - nowTime) / 1000);
    
    if (ttlSeconds === 0) return;

    await redis.set(
      `${REDIS_PREFIX}${refreshToken}`,
      userId,
      "EX",
      ttlSeconds
    );
  }

  /**
   * Проверяет существование токена и возвращает userId
   */
  static async getUserIdByRefreshToken(refreshToken: string): Promise<string | null> {
    return await redis.get(`${REDIS_PREFIX}${refreshToken}`);
  }

  /**
   * Удаляет токен (при логауте или ротации)
   */
  static async deleteRefreshToken(refreshToken: string) {
    await redis.del(`${REDIS_PREFIX}${refreshToken}`);
  }
}