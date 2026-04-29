import {
  clearDeviceCtx,
  getDeviceCtx,
  setDeviceTokens,
  type DeviceCtx,
} from "@/services/zitadel/device-context";
import { rateLimit, clientKeyFromRequest } from "@/shared/lib/rate-limit";
import { env } from "@/shared/config/env";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

// RFC 8628 рекомендует interval ≥ 5с между опросами token endpoint.
const POLL_INTERVAL_MS = 5000;
const MAX_SSE_DURATION_MS = 5 * 60 * 1000;

interface PendingResult { status: "pending" }
interface ExpiredResult { status: "expired" }
interface ConfirmedResult {
  status: "confirmed";
  accessToken: string;
  idToken: string;
  refreshToken?: string;
  expiresIn: number;
}
type PollResult = PendingResult | ExpiredResult | ConfirmedResult;

async function pollDeviceToken(ctx: DeviceCtx): Promise<PollResult> {
  const tokenRes = await fetch(`${env.ZITADEL_API_URL}/oauth/v2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.APP_CLIENT_ID,
      grant_type: "urn:ietf:params:oauth:grant-type:device_code",
      device_code: ctx.deviceCode,
    }),
    cache: "no-store",
  });

  const body = await tokenRes.json();

  if (tokenRes.ok && body.access_token && body.id_token) {
    return {
      status: "confirmed",
      accessToken: body.access_token,
      idToken: body.id_token,
      refreshToken: body.refresh_token,
      expiresIn: Number(body.expires_in) || 3600,
    };
  }

  if (body.error === "authorization_pending" || body.error === "slow_down") {
    return { status: "pending" };
  }

  return { status: "expired" };
}

async function persistTokens(ctx: DeviceCtx, result: ConfirmedResult): Promise<void> {
  await setDeviceTokens({
    accessToken: result.accessToken,
    idToken: result.idToken,
    refreshToken: result.refreshToken,
    nonce: ctx.nonce,
    expiresAt: Date.now() + result.expiresIn * 1000,
  });
  await clearDeviceCtx();
}

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    if (signal.aborted) return resolve();
    const timer = setTimeout(resolve, ms);
    signal.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        resolve();
      },
      { once: true },
    );
  });
}

/**
 * SSE endpoint для статуса Device Flow.
 * Устройство A (браузер) держит EventSource, сервер опрашивает Zitadel
 * /oauth/v2/token каждые 5с и пушит статус обновление клиенту.
 *
 * deviceCode хранится в HttpOnly cookie (zdc_ctx), никогда не попадает к клиенту.
 * Токены при успехе кладутся в HttpOnly cookie (zdc_tokens).
 */
export async function GET(req: NextRequest) {
  const rl = rateLimit(`qr:status:${clientKeyFromRequest(req)}`, 60, 60_000);
  if (!rl.ok) {
    return new Response(JSON.stringify({ status: "expired" }), {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)),
      },
    });
  }

  const ctx = await getDeviceCtx();
  if (!ctx) {
    return new Response(JSON.stringify({ status: "expired" }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  const acceptsSSE = req.headers.get("accept")?.includes("text/event-stream");

  if (!acceptsSSE) {
    // Fallback: одноразовый poll для клиентов без SSE.
    const result = await pollDeviceToken(ctx);
    if (result.status === "confirmed") {
      await persistTokens(ctx, result);
    }
    return new Response(JSON.stringify({ status: result.status }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  const abortSignal = req.signal;
  const encoder = new TextEncoder();
  const startTime = Date.now();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        try {
          controller.enqueue(
            encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
          );
        } catch {
          // controller already closed
        }
      };

      send("status", { status: "pending" });

      while (!abortSignal.aborted) {
        if (Date.now() - startTime > MAX_SSE_DURATION_MS) {
          send("status", { status: "expired" });
          controller.close();
          return;
        }

        await sleep(POLL_INTERVAL_MS, abortSignal);
        if (abortSignal.aborted) return;

        const currentCtx = await getDeviceCtx();
        if (!currentCtx) {
          send("status", { status: "expired" });
          controller.close();
          return;
        }

        const result = await pollDeviceToken(currentCtx);

        if (result.status === "confirmed") {
          await persistTokens(currentCtx, result);
          send("status", { status: "confirmed" });
          controller.close();
          return;
        }

        if (result.status === "expired") {
          send("status", { status: "expired" });
          controller.close();
          return;
        }
        // pending — продолжаем
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
