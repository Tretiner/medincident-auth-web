import { NextResponse } from "next/server";
import { getOptionalSession } from "@/services/zitadel/session";
import { createTransferToken } from "@/services/zitadel/transfer-store";
import { env } from "@/shared/config/env";

export const dynamic = "force-dynamic";

const EXPIRES_SECONDS = 300;

export async function GET() {
  const session = await getOptionalSession();
  if (!session) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const token = createTransferToken(session.userId, EXPIRES_SECONDS);
  const url = `${env.APP_URL}/login/qr-transfer?token=${token}`;

  return NextResponse.json({ url, expiresInSeconds: EXPIRES_SECONDS });
}
