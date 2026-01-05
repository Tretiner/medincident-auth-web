import { NextRequest, NextResponse } from 'next/server';
import { verifyTelegramAuth } from '@/lib/telegram';
import { createSession } from '@/lib/session';
import { env } from '@/env';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    // 1. Собираем данные
    const data = {
      id: Number(searchParams.get('id')),
      first_name: searchParams.get('first_name') || '',
      last_name: searchParams.get('last_name') || undefined,
      username: searchParams.get('username') || undefined,
      photo_url: searchParams.get('photo_url') || undefined,
      auth_date: Number(searchParams.get('auth_date')),
      hash: searchParams.get('hash') || '',
    };

    // --- ЛОГИКА MOCK (DEV MODE) ---
    const isDev = env.NODE_ENV === 'development';
    const isMockHash = data.hash === 'mock_dev_hash';

    if (!isDev || !isMockHash) {
        if (!verifyTelegramAuth(data)) {
          return NextResponse.json({ error: 'Invalid hash' }, { status: 401 });
        }

        const now = Math.floor(Date.now() / 1000);
        if (now - data.auth_date > 3600) {
           return NextResponse.json({ error: 'Expired' }, { status: 401 });
        }
    }

    await createSession(data.id.toString(), 'user');

    return NextResponse.redirect(new URL('/profile', request.url));

  } catch (error) {
    console.error('Auth Error:', error);
    return NextResponse.redirect(new URL('/login?error=auth_failed', request.url));
  }
}