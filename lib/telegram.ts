import crypto from 'crypto';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

export function verifyTelegramAuth(data: TelegramUser): boolean {
  const { hash, ...userData } = data;
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) throw new Error('TELEGRAM_BOT_TOKEN is not set');

  // 1. Создаем строку для проверки (data-check-string)
  // Ключи должны быть отсортированы по алфавиту
  const dataCheckString = Object.keys(userData)
    .sort()
    // @ts-expect-error any
    .map((key) => `${key}=${userData[key]}`)
    .join('\n');

  // 2. Создаем секретный ключ (SHA256 от токена бота)
  const secretKey = crypto.createHash('sha256').update(token).digest();

  // 3. Вычисляем HMAC-SHA256
  const hmac = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  // 4. Сравниваем хеши
  return hmac === hash;
}