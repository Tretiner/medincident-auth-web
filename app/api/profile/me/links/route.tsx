import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { fetchZitadel } from "@/lib/zitadel/api";

// Маппинг твоих ключей на реальные IDP ID в Zitadel. 
// ВАЖНО: Замени эти ID на реальные ID твоих провайдеров из консоли Zitadel!
const IDP_MAP: Record<string, string> = {
  telegram: "123456789012345678", // ID провайдера Telegram
  max: "987654321098765432",      // ID провайдера MAX
};

// GET: Получить статусы привязок
export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const currentSessionId = cookieStore.get("zitadel_current_session")?.value;
    if (!currentSessionId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const currentSessionData = await fetchZitadel(`/v2/sessions/${currentSessionId}`);
    const userId = currentSessionData.session.factors.user.id;

    // Ищем привязки пользователя
    const linksRes = await fetchZitadel(`/v2/users/${userId}/idplinks/_search`, {
      method: "POST",
      body: JSON.stringify({})
    });

    // Собираем булевый статус для фронта (как ожидает твой хук)
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

// POST: Фронт вызывает это, чтобы отвязать/привязать аккаунт 
// (В твоем компоненте кнопка работает как Toggle)
export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const currentSessionId = cookieStore.get("zitadel_current_session")?.value;
    if (!currentSessionId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const providerKey = body.provider; // "telegram" или "max"
    const targetIdpId = IDP_MAP[providerKey];

    if (!targetIdpId) return NextResponse.json({ success: false, error: "Invalid provider" }, { status: 400 });

    const currentSessionData = await fetchZitadel(`/v2/sessions/${currentSessionId}`);
    const userId = currentSessionData.session.factors.user.id;

    // Проверяем, привязан ли уже этот IDP
    const linksRes = await fetchZitadel(`/v2/users/${userId}/idplinks/_search`, {
      method: "POST", body: JSON.stringify({})
    });
    
    const existingLink = (linksRes.result || []).find((link: any) => link.idpId === targetIdpId);

    if (existingLink) {
      // ЕСЛИ ПРИВЯЗАН -> ОТВЯЗЫВАЕМ (DELETE)
      // В Zitadel v2 эндпоинт отвязки обычно требует externalUserId
      const externalUserId = existingLink.externalUserId;
      await fetchZitadel(`/v2/users/${userId}/idplinks/${targetIdpId}/${externalUserId}`, {
        method: "DELETE"
      });
      return NextResponse.json({ success: true, action: "unlinked" });
    } else {
      // ЕСЛИ НЕ ПРИВЯЗАН -> ПРИВЯЗЫВАЕМ
      // Внимание: Привязка нового аккаунта "на лету" требует OIDC Intent (перехода на сайт провайдера).
      // Вернем фронту URL для редиректа или ошибку, если фронт просто ожидал смены статуса.
      // В твоем текущем UI хук ждет `{ success: true }`.
      return NextResponse.json({ 
        success: false, 
        error: "Для привязки аккаунта требуется пройти авторизацию у провайдера." 
      }, { status: 400 });
    }

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}