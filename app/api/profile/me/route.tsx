import { NextRequest, NextResponse } from "next/server";
import { db } from "@/shared/lib/mock-db";
import { auth } from "@/services/zitadel/user/auth";
import { personalInfoSchema } from "@/domain/profile/schema";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await new Promise(resolve => setTimeout(resolve, 600));

  const user = db.user.get();
  return NextResponse.json(user.info);
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
