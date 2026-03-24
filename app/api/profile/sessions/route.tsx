import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAllSessions } from "@/lib/zitadel/zitadel-cookies"; // Твоя утилита из прошлого шага
import { fetchZitadel } from "@/lib/zitadel/zitadel-api";

// GET: Получить все сессии пользователя
export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const currentSessionId = cookieStore.get("zitadel_current_session")?.value;
    if (!currentSessionId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 1. Получаем инфу о текущей сессии, чтобы узнать userId
    const currentSessionData = await fetchZitadel(`/v2/sessions/${currentSessionId}`);
    const userId = currentSessionData.session.factors.user.id;

    // 2. Ищем все сессии этого пользователя (v2 API)
    const allSessionsRes = await fetchZitadel(`/v2/sessions/_search`, {
      method: "POST",
      body: JSON.stringify({
        queries: [{ userIdQuery: { id: userId } }]
      })
    });

    // 3. Форматируем под твой интерфейс UserSession
    const formattedSessions = allSessionsRes.sessions.map((sess: any) => ({
      id: sess.id,
      deviceName: sess.userAgent?.os || sess.userAgent?.description || "Неизвестное устройство",
      ip: sess.userAgent?.ip || "Скрыт",
      userAgent: sess.userAgent?.description || "Unknown Browser",
      lastActive: sess.changeDate || sess.creationDate,
      isCurrent: sess.id === currentSessionId,
    }));

    return NextResponse.json(formattedSessions);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Завершить одну или все другие сессии
export async function DELETE(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const currentSessionId = cookieStore.get("zitadel_current_session")?.value;
    if (!currentSessionId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const searchParams = req.nextUrl.searchParams;
    const type = searchParams.get("type"); // revoke_all
    const targetSessionId = searchParams.get("id"); // specific id

    if (type === "revoke_all") {
      // Чтобы удалить все, сначала находим их
      const currentSessionData = await fetchZitadel(`/v2/sessions/${currentSessionId}`);
      const userId = currentSessionData.session.factors.user.id;

      const allSessionsRes = await fetchZitadel(`/v2/sessions/_search`, {
        method: "POST",
        body: JSON.stringify({ queries: [{ userIdQuery: { id: userId } }] })
      });

      // Удаляем все, кроме текущей
      const sessionsToDelete = allSessionsRes.sessions.filter((s: any) => s.id !== currentSessionId);
      
      await Promise.all(
        sessionsToDelete.map((s: any) => 
          fetchZitadel(`/v2/sessions/${s.id}`, { method: "DELETE" })
        )
      );

      return NextResponse.json({ success: true });
    }

    if (targetSessionId) {
      // Удаляем конкретную сессию
      await fetchZitadel(`/v2/sessions/${targetSessionId}`, { method: "DELETE" });
      
      // Если удалили ту, в которой сидим — чистим куки
      if (targetSessionId === currentSessionId) {
        cookieStore.delete("zitadel_current_session");
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}