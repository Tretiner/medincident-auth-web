import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/mock-db';
import { requireUserFromSession } from '@/services/session/session-service';

export async function POST(req: NextRequest) {
  const session = await requireUserFromSession();

  try {
      const body = await req.json();
      const { provider } = body;

      if (provider !== 'telegram' && provider !== 'max') {
          return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
      }

      const updatedUser = db.user.toggleLink(provider);
      return NextResponse.json(updatedUser);
  } catch (e) {
      return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }
}