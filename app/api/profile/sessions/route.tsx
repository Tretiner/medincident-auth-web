import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mock-db";
import { requireUserFromSession } from "@/services/session/session-service";

export async function GET() {
  const session = await requireUserFromSession();

  const sessions = db.sessions.getAll();
  return NextResponse.json(sessions);
}

export async function DELETE(req: NextRequest) {
  const session = await requireUserFromSession();

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const type = searchParams.get("type");

  try {
    if (type === "others") {
      db.sessions.revokeOthers();
    } else if (id) {
      db.sessions.revoke(id);
    } else {
      return NextResponse.json({ error: "Missing arguments" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.log("Internal Server Error", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
