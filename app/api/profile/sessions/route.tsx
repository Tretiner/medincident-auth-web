import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mock-db";
import { requireUserFromSession } from "@/lib/services/legacy-session-service";

export async function GET() {
  await requireUserFromSession();
  await new Promise(resolve => setTimeout(resolve, 800)); 
  
  const sessions = db.sessions.getAll();
  return NextResponse.json(sessions);
}

export async function DELETE(req: NextRequest) {
  await requireUserFromSession();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const type = searchParams.get("type");

  try {
    if (type === "revoke_all") {
      db.sessions.revokeOthers();
    } else if (id) {
      db.sessions.revoke(id);
    } else {
      return NextResponse.json({ error: "Missing arguments" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API Error", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}