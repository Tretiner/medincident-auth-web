'server only';

import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { env } from '../env';

// 1. Определение типов данных в сессии
export type SessionPayload = {
  userId: string;
  role: string;
  expiresAt: Date;
};

// 2. Секретный ключ (обязательно добавьте в .env)
const secretKey = process.env.SESSION_SECRET;
const key = new TextEncoder().encode(secretKey);

// 3. Шифрование (Создание токена)
export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d') // Токен живет 7 дней
    .sign(key);
}

// 4. Расшифровка (Чтение токена)
export async function decrypt(session: string | undefined = '') {
  try {
    const { payload } = await jwtVerify(session, key, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error) {
    // Если токен подделан или истек — возвращаем null
    return null;
  }
}

export async function createSession(userId: string, role: string = 'user') {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  
  const session = await encrypt({ userId, role, expiresAt });
  
  const cookieStore = await cookies();
  cookieStore.set('session', session, {
    httpOnly: true,
    secure: env.NODE_ENV == "production",
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  });
}

export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  
  const payload = await decrypt(session);

  if (!session || !payload) {
    return null;
  }

  return { isAuth: true, userId: payload.userId as string, role: payload.role as string };
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}

export async function verifySession() {
  const session = await getSession();
  
  if (!session?.isAuth) {
    redirect('/login');
  }

  return session;
}