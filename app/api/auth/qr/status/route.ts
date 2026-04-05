import { confirmQrEntry, getQrEntry } from "@/services/zitadel/qr-store";
import { env } from "@/shared/config/env";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

// Интервал между запросами к Zitadel device_code endpoint (RFC рекомендует ≥5сек)
const POLL_INTERVAL_MS = 5000;
// Максимальное время жизни SSE соединения
const MAX_SSE_DURATION_MS = 5 * 60 * 1000; // 5 минут

async function pollDeviceToken(
  entry: { deviceCode: string },
): Promise<
  | { status: "pending" }
  | { status: "expired" }
  | { status: "confirmed"; accessToken: string; idToken: string }
> {
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
    return { status: "confirmed", accessToken: body.access_token, idToken: body.id_token };
  }

  if (body.error === "authorization_pending" || body.error === "slow_down") {
    return { status: "pending" };
  }

  return { status: "expired" };
}

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    if (signal.aborted) return resolve();
    const timer = setTimeout(resolve, ms);
    signal.addEventListener("abort", () => {
      clearTimeout(timer);
      resolve();
    }, { once: true });
  });
}

/**
 * SSE (Server-Sent Events) endpoint для QR статуса.
 * Держит соединение открытым и пушит обновления вместо polling.
 *
 * Клиент подключается через EventSource:
 *   new EventSource("/api/auth/qr/status?token=xxx")
 *
 * Fallback: обычный JSON для legacy клиентов (без Accept: text/event-stream)
 */
export async function GET(req: NextRequest) {
  const userCode = req.nextUrl.searchParams.get("token");

  if (!userCode) {
    return new Response(JSON.stringify({ status: "expired" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const entry = getQrEntry(userCode);
  if (!entry) {
    return new Response(JSON.stringify({ status: "expired" }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  // Уже подтверждён — отдаём сразу
  if (entry.status === "confirmed") {
    return new Response(JSON.stringify({ status: "confirmed" }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  // SSE — если клиент запрашивает event-stream
  const acceptsSSE = req.headers.get("accept")?.includes("text/event-stream");

  if (!acceptsSSE) {
    // Fallback: одноразовый poll (совместимость со старым SWR клиентом)
    const result = await pollDeviceToken(entry);
    if (result.status === "confirmed") {
      confirmQrEntry(userCode, result.accessToken, result.idToken);
    }
    return new Response(JSON.stringify({ status: result.status }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  // SSE stream — слушаем abort от клиента для корректного завершения
  const abortSignal = req.signal;
  const encoder = new TextEncoder();
  const startTime = Date.now();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        try {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        } catch {
          // controller already closed
        }
      };

      // Отправляем начальный статус
      send("status", { status: "pending" });

      while (!abortSignal.aborted) {
        // Таймаут — закрываем соединение
        if (Date.now() - startTime > MAX_SSE_DURATION_MS) {
          send("status", { status: "expired" });
          controller.close();
          return;
        }

        await sleep(POLL_INTERVAL_MS, abortSignal);

        // Клиент отключился — прекращаем polling
        if (abortSignal.aborted) return;

        // Проверяем не был ли уже подтверждён другим запросом
        const currentEntry = getQrEntry(userCode);
        if (!currentEntry) {
          send("status", { status: "expired" });
          controller.close();
          return;
        }

        if (currentEntry.status === "confirmed") {
          send("status", { status: "confirmed" });
          controller.close();
          return;
        }

        // Поллим Zitadel
        const result = await pollDeviceToken(currentEntry);

        if (result.status === "confirmed") {
          confirmQrEntry(userCode, result.accessToken, result.idToken);
          send("status", { status: "confirmed" });
          controller.close();
          return;
        }

        if (result.status === "expired") {
          send("status", { status: "expired" });
          controller.close();
          return;
        }

        // pending — продолжаем цикл
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no", // для nginx — не буферизировать
    },
  });
}
