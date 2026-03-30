import { NextResponse } from "next/server";
import { delay } from "@/shared/lib/utils";

export async function POST() {
  await delay(1000);
  
  return NextResponse.json({ success: true });
}