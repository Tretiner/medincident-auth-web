import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mock-db";
import { requireUserFromSession } from "@/services/session/session-service";
import { personalInfoSchema } from "@/domain/profile/schema";

export async function GET() {
  await requireUserFromSession();
  await new Promise(resolve => setTimeout(resolve, 600));

  const user = db.user.get();
  return NextResponse.json(user.info);
}

export async function PATCH(req: NextRequest) {
  await requireUserFromSession();
  const body = await req.json();

  const parse = personalInfoSchema.safeParse(body);
  if (!parse.success) {
      return NextResponse.json(
          { error: parse.error.issues[0].message }, 
          { status: 400 }
      );
  }

  const updatedUser = db.user.updateInfo(parse.data);
  return NextResponse.json(updatedUser);
}