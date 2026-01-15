import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mock-db";
import { requireUserFromSession } from "@/services/session/session-service";

export async function GET() {
  const session = await requireUserFromSession();

  const user = db.user.get();
  return NextResponse.json(user);
}

export async function PATCH(req: NextRequest) {
  const session = await requireUserFromSession();

  const body = await req.json();
  const updatedUser = db.user.update(body);

  return NextResponse.json(updatedUser);
}
