import { confirmQrEntry, getQrEntry } from "@/services/zitadel/qr-store";
import { env } from "@/shared/config/env";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const userCode = req.nextUrl.searchParams.get("token");

  if (!userCode) {
    return NextResponse.json({ status: "expired" }, { status: 400 });
  }

  const entry = getQrEntry(userCode);
  if (!entry) {
    return NextResponse.json({ status: "expired" });
  }

  // Уже подтверждён ранее — возвращаем сразу
  if (entry.status === "confirmed") {
    return NextResponse.json({ status: "confirmed" });
  }

  // Поллим ZITADEL: ждём пока Device B подтвердит
  const tokenRes = await fetch(`${env.ZITADEL_API_URL}/oauth/v2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.APP_CLIENT_ID,
      grant_type: "urn:ietf:params:oauth:grant-type:device_code",
      device_code: entry.deviceCode,
    }),
    cache: "no-store",
  });

  const body = await tokenRes.json();

  if (tokenRes.ok && body.access_token && body.id_token) {
    // Device B подтвердил — сохраняем токены в стор
    confirmQrEntry(userCode, body.access_token, body.id_token);
    return NextResponse.json({ status: "confirmed" });
  }

  // authorization_pending — ждём следующего полла
  if (body.error === "authorization_pending" || body.error === "slow_down") {
    return NextResponse.json({ status: "pending" });
  }

  // access_denied, expired_token, etc.
  return NextResponse.json({ status: "expired" });
}
