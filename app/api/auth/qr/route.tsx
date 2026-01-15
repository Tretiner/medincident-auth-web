import { QrData } from "@/domain/auth/types";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const token = crypto.randomUUID();
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=Auth_${token}&bgcolor=ffffff&color=000000&margin=0`;

    const data: QrData = {
      url: `/медведь-гол-гоооол.gif`,
      expiresInSeconds: 60,
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
