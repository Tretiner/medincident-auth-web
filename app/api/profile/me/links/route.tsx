import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/services/zitadel/user/auth";
import { fetchZitadel } from "@/services/zitadel/api";
import { env } from "@/shared/config/env";

async function getUserIdFromAuth(): Promise<string | null> {
  const session = await auth();
  // Используем zitadelUserId (числовой ID) из NextAuth сессии.
  // НЕ декодируем accessToken — Zitadel выдаёт opaque токены, decodeJwt на них падает.
  return (session as any)?.zitadelUserId ?? null;
}

// GET: Получить статусы привязок
export async function GET() {
  try {
    const userId = await getUserIdFromAuth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Ищем привязки пользователя
    const linksRes = await fetchZitadel(`/v2/users/${userId}/idplinks/_search`, {
      method: "POST",
      body: JSON.stringify({})
    });

    // Собираем булевый статус для фронта — по всем сконфигурированным провайдерам из env
    const linkedIdps: Array<{ idpId: string }> = linksRes.result || [];
    const status: Record<string, boolean> = {};
    for (const provider of env.idpProviders) {
      const idpId = env.getIdpId(provider)!; // гарантированно есть — из того же массива
      status[provider] = linkedIdps.some((link) => link.idpId === idpId);
    }

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
    const providerKey = body.provider;

    // Валидация: provider должен быть непустой строкой и присутствовать в ZITADEL_IDPS
    if (typeof providerKey !== "string" || providerKey.length === 0) {
      return NextResponse.json({ success: false, error: "Invalid provider" }, { status: 400 });
    }

    const targetIdpId = env.getIdpId(providerKey);
    if (!targetIdpId) {
      return NextResponse.json(
        { success: false, error: "Провайдер не сконфигурирован" },
        { status: 400 },
      );
    }

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
