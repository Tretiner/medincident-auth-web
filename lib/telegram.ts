import { TelegramUser } from '@/domain/auth/types';
import crypto from 'crypto';
import { env } from 'process';

export function verifyTelegramAuth(data: TelegramUser): boolean {
  if (env.isDev){
    return true;
  }

  const { hash, ...userData } = data;
  const token = env.TELEGRAM_BOT_TOKEN!;

  // Формирование строки проверки
  const dataCheckString = Object.keys(userData)
    .sort()
    // @ts-expect-error any
    .map((key) => `${key}=${userData[key]}`)
    .join('\n');

  const secretKey = crypto.createHash('sha256').update(token).digest();

  const hmac = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  return hmac === hash;
}