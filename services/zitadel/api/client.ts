import axios from "axios";
import { getZitadelAccessToken } from "./access-token";
import { env } from "@/shared/config/env";
import { type LogBodyMode, logRequest, logResponse, logResponseError } from "@/shared/lib/http-logger";

export const zitadelApi = axios.create({
    baseURL: env.ZITADEL_API_URL,
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
    },
});

zitadelApi.interceptors.request.use(
    async (config) => {
        const token = await getZitadelAccessToken();
        config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);


// LOGS
// ─── "none" | "compact" | "pretty" ───────────────────────────────────────────
const LOG_BODY: LogBodyMode = "compact";
const LOG_HEADERS = false;

zitadelApi.interceptors.request.use(
    (config) => {
        (config as any)._startTime = Date.now();
        logRequest(
            config.method ?? "?", config.url ?? "",
            config.data, LOG_BODY,
            LOG_HEADERS ? config.headers as Record<string, unknown> : undefined, LOG_HEADERS
        );
        return config;
    },
    (error) => Promise.reject(error)
);

zitadelApi.interceptors.response.use(
    (response) => {
        const ms = Date.now() - ((response.config as any)._startTime ?? Date.now());
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
        logResponseError(
            config.method ?? "?", config.url ?? "",
            error.response?.status ?? "ERR", ms,
            error.response?.data, LOG_BODY,
            LOG_HEADERS ? error.response?.headers as Record<string, unknown> : undefined, LOG_HEADERS
        );
        return Promise.reject(error);
    }
);
