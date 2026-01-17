import { NextResponse } from "next/server";
import { deleteSession } from "@/services/session/session-service";

export async function POST() {
  await deleteSession();
  return NextResponse.json({ success: true });
}