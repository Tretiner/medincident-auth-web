import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/mock-db';
import { requireUserFromSession } from '@/lib/services/legacy-session-service';

export async function GET() {
  await requireUserFromSession();
  
  // Имитация задержки
  await new Promise(resolve => setTimeout(resolve, 500));

  const user = db.user.get();
  return NextResponse.json(user.linkedAccounts);
}

export async function POST(req: NextRequest) {
  await requireUserFromSession();
  try {
      const body = await req.json();
      const { provider } = body;

      if (provider !== 'telegram' && provider !== 'max') {
          return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
      }

      await new Promise(resolve => setTimeout(resolve, 500));
      db.user.toggleLink(provider);
      return NextResponse.json({ success: true });
  } catch (e) {
      return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }
}