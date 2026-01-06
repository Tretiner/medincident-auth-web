import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { db } from '@/lib/mock-db';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { provider } = await req.json();
  if (provider !== 'telegram' && provider !== 'max') {
      return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
  }

  const updatedUser = db.user.toggleLink(provider);
  return NextResponse.json(updatedUser);
}