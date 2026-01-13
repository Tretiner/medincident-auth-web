import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mock-db";
import { getAccessCookie } from "@/app/services/session/auth-cookie-service";
import { getUserFromSession, verifyAccessToken } from "@/app/services/session/session-service";

export async function GET() {
  const session = await getUserFromSession();

  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = db.user.get();
  return NextResponse.json(user);
}

export async function PATCH(req: NextRequest) {
  const session = await getUserFromSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const updatedUser = db.user.update(body);

  return NextResponse.json(updatedUser);
}
