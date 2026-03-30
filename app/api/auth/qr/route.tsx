// app/api/auth/qr/route.ts
import { QrData } from "@/domain/auth/types";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Данные, которые зашиваем в QR (твой легендарный медведь)
    const targetUrl = `https://tenor.com/view/медведь-гол-гоооол-медведь-гол-gif-5260236862107841003`;

    const data: QrData = {
      url: targetUrl,
      expiresInSeconds: 60,
    };

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Ошибка" }, { status: 500 });
  }
}