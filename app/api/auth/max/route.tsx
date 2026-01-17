import { NextResponse } from "next/server";
import { delay } from "@/lib/utils";

export async function POST() {
  await delay(1000);
  
  return NextResponse.json({ success: true });
}