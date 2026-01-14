import { QrData } from "@/domain/auth/types";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data: QrData = {
      url: `/медведь-гол-гоооол.gif`, 
      expiresInSeconds: 60
    };

    return NextResponse.json(data);

  } catch (error) {
    console.error("QR API Error:", error);
    
    return NextResponse.json(
      { error: "Не удалось сгенерировать QR код" }, 
      { status: 500 }
    );
  }
}