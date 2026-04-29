"server only";

import axios from "axios";
import { auth } from "./auth";
import { env } from "@/shared/config/env";
import { type LogBodyMode, logRequest, logResponse, logResponseError } from "@/shared/lib/http-logger";

export const zitadelUserApi = axios.create({
  baseURL: env.ZITADEL_API_URL,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});

// ─── Auth interceptor (NextAuth session token) ────────────────────────────────
zitadelUserApi.interceptors.request.use(async (config) => {
  const session = await auth();
  const accessToken = (session as any)?.accessToken as string | undefined;
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  } else {
    console.warn("[user-session] accessToken ОТСУТСТВУЕТ! session=%s, error=%s",
      session ? "exists" : "null", (session as any)?.error);
  }
  // Пользователь может быть в под-организации — передаём orgId для корректного поиска
  config.headers["x-zitadel-orgid"] = env.ZITADEL_ORG_ID;
  return config;
});

// ─── HTTP Logging (помечаем как [user-session]) ───────────────────────────────
const LOG_BODY: LogBodyMode = "compact";
const LOG_HEADERS = false;
const TAG = "[user-session]";

zitadelUserApi.interceptors.request.use(
  (config) => {
    (config as any)._startTime = Date.now();
    const method = config.method ?? "?";
    const url = config.url ?? "";
    console.log(`${TAG}`);
    logRequest(
      method, url,
      config.data, LOG_BODY,
      LOG_HEADERS ? config.headers as Record<string, unknown> : undefined, LOG_HEADERS
    );
    return config;
  },
  (error) => Promise.reject(error)
);

zitadelUserApi.interceptors.response.use(
  (response) => {
    const ms = Date.now() - ((response.config as any)._startTime ?? Date.now());
    console.log(`${TAG}`);
    logResponse(
      response.config.method ?? "?", response.config.url ?? "",
      response.status, ms,
      response.data, LOG_BODY,
      LOG_HEADERS ? response.headers as Record<string, unknown> : undefined, LOG_HEADERS
    );
    return response;
  },
  (error) => {
    const config = error.config ?? {};
    const ms = Date.now() - ((config as any)._startTime ?? Date.now());
    console.error(`${TAG}`);
    logResponseError(
      config.method ?? "?", config.url ?? "",
      error.response?.status ?? "ERR", ms,
      error.response?.data, LOG_BODY,
      LOG_HEADERS ? error.response?.headers as Record<string, unknown> : undefined, LOG_HEADERS
    );
    return Promise.reject(error);
  }
);
