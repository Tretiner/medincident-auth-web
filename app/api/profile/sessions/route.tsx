import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/mock-db';
import { getUserFromSession } from '@/app/services/session/session-service';

export async function GET() {
  const session = await getUserFromSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const sessions = db.sessions.getAll();
  return NextResponse.json(sessions);
}

export async function DELETE(req: NextRequest) {
  const session = await getUserFromSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const type = searchParams.get('type'); // 'single' | 'others'

  if (type === 'others') {
    db.sessions.revokeOthers();
  } else if (id) {
    db.sessions.revoke(id);
  }

  return NextResponse.json({ success: true });
}