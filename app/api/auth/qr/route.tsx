// app/api/auth/qr/route.ts
import { QrData } from "@/domain/auth/types";
import { env } from "@/shared/config/env";
import { storeQrEntry } from "@/services/zitadel/qr-store";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // Сохраняем requestId если QR показывается в контексте OIDC авторизации
    const requestId = req.nextUrl.searchParams.get("requestId") || undefined;

    const res = await fetch(
      `${env.ZITADEL_API_URL}/oauth/v2/device_authorization`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: env.APP_CLIENT_ID,
          scope: "openid profile email",
        }),
        cache: "no-store",
      }
    );

    if (!res.ok) {
      console.error("device_authorization error:", await res.text());
      return NextResponse.json({ error: "Ошибка" }, { status: 500 });
    }

    const zitadelData = await res.json();
    const { device_code, user_code, expires_in } = zitadelData;

    storeQrEntry(user_code, device_code, expires_in ?? 300, requestId);

    const url = `${env.APP_URL}/login/qr-confirm?user_code=${user_code}`;

    const data: QrData = {
      url,
      token: user_code,
      expiresInSeconds: expires_in ?? 300,
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error("QR route error:", error);
    return NextResponse.json({ error: "Ошибка" }, { status: 500 });
  }
}
