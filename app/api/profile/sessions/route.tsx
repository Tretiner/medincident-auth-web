import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/services/zitadel/user/auth";
import { decodeJwt } from "jose";
import { fetchZitadel } from "@/services/zitadel/api";
import { getAllSessionCookieIds } from "@/services/zitadel/cookies";

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

async function findCurrentSessionId(userId: string): Promise<string | null> {
  const cookieIds = await getAllSessionCookieIds();
  const cookieIdSet = new Set(cookieIds);

  const allSessionsRes = await fetchZitadel(`/v2/sessions/_search`, {
    method: "POST",
    body: JSON.stringify({
      queries: [{ userIdQuery: { id: userId } }]
    })
  });

  const sessions: any[] = allSessionsRes.sessions || [];
  const match = sessions.find((s: any) => cookieIdSet.has(s.id));
  return match?.id ?? null;
}

// GET: Получить все сессии пользователя
export async function GET(req: NextRequest) {
  try {
    const userId = await getUserIdFromAuth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const currentSessionId = await findCurrentSessionId(userId);

    // Ищем все сессии этого пользователя (v2 API)
    const allSessionsRes = await fetchZitadel(`/v2/sessions/_search`, {
      method: "POST",
      body: JSON.stringify({
        queries: [{ userIdQuery: { id: userId } }]
      })
    });

    // Форматируем под интерфейс UserSession
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
    const userId = await getUserIdFromAuth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const currentSessionId = await findCurrentSessionId(userId);

    const searchParams = req.nextUrl.searchParams;
    const type = searchParams.get("type"); // revoke_all
    const targetSessionId = searchParams.get("id"); // specific id

    if (type === "revoke_all") {
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
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
