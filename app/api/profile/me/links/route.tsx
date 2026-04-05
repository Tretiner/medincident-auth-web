import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/services/zitadel/user/auth";
import { decodeJwt } from "jose";
import { fetchZitadel } from "@/services/zitadel/api";

// Маппинг ключей на реальные IDP ID в Zitadel.
// ВАЖНО: Замени эти ID на реальные ID провайдеров из консоли Zitadel!
const IDP_MAP: Record<string, string> = {
  telegram: "123456789012345678", // ID провайдера Telegram
  max: "987654321098765432",      // ID провайдера MAX
};

async function getUserIdFromAuth(): Promise<string | null> {
  const session = await auth();
  const accessToken = (session as any)?.accessToken as string | undefined;
  if (!accessToken) return null;
  try {
    const claims = decodeJwt(accessToken);
    return (claims.sub as string) ?? null;
  } catch {
    return null;
  }
}

// GET: Получить статусы привязок
export async function GET(req: NextRequest) {
  try {
    const userId = await getUserIdFromAuth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Ищем привязки пользователя
    const linksRes = await fetchZitadel(`/v2/users/${userId}/idplinks/_search`, {
      method: "POST",
      body: JSON.stringify({})
    });

    // Собираем булевый статус для фронта
    const linkedIdps = linksRes.result || [];
    const status = {
      telegram: linkedIdps.some((link: any) => link.idpId === IDP_MAP.telegram),
      max: linkedIdps.some((link: any) => link.idpId === IDP_MAP.max),
    };

    return NextResponse.json(status);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Отвязать/привязать аккаунт (Toggle)
export async function POST(req: NextRequest) {
  try {
    const userId = await getUserIdFromAuth();
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const providerKey = body.provider; // "telegram" или "max"
    const targetIdpId = IDP_MAP[providerKey];

    if (!targetIdpId) return NextResponse.json({ success: false, error: "Invalid provider" }, { status: 400 });

    // Проверяем, привязан ли уже этот IDP
    const linksRes = await fetchZitadel(`/v2/users/${userId}/idplinks/_search`, {
      method: "POST", body: JSON.stringify({})
    });

    const existingLink = (linksRes.result || []).find((link: any) => link.idpId === targetIdpId);

    if (existingLink) {
      // ЕСЛИ ПРИВЯЗАН -> ОТВЯЗЫВАЕМ (DELETE)
      const externalUserId = existingLink.externalUserId;
      await fetchZitadel(`/v2/users/${userId}/idplinks/${targetIdpId}/${externalUserId}`, {
        method: "DELETE"
      });
      return NextResponse.json({ success: true, action: "unlinked" });
    } else {
      // ЕСЛИ НЕ ПРИВЯЗАН -> ПРИВЯЗЫВАЕМ
      // Привязка нового аккаунта "на лету" требует OIDC Intent (перехода на сайт провайдера).
      return NextResponse.json({
        success: false,
        error: "Для привязки аккаунта требуется пройти авторизацию у провайдера."
      }, { status: 400 });
    }

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
