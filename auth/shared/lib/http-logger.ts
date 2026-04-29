"server only";

export type LogBodyMode = "none" | "compact" | "pretty";

// ─── ANSI ────────────────────────────────────────────────────────────────────

const c = {
  reset:  "\x1b[0m",
  dim:    "\x1b[2m",
  bold:   "\x1b[1m",
  cyan:   "\x1b[36m",
  green:  "\x1b[32m",
  yellow: "\x1b[33m",
  red:    "\x1b[31m",
  gray:   "\x1b[90m",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function methodColor(method: string): string {
  switch (method.toUpperCase()) {
    case "GET":    return c.green;
    case "POST":   return c.cyan;
    case "PUT":    return c.yellow;
    case "DELETE": return c.red;
    default:       return c.gray;
  }
}

export function statusColor(status: number): string {
  if (status < 300) return c.green;
  if (status < 400) return c.yellow;
  return c.red;
}

export function formatBody(data: unknown, mode: Exclude<LogBodyMode, "none">): string {
  let parsed: unknown;
  try {
    parsed = typeof data === "string" ? JSON.parse(data) : data;
  } catch {
    return String(data);
  }
  if (mode === "pretty") return JSON.stringify(parsed, null, 2);
  // compact — одна строка без пробелов
  return JSON.stringify(parsed);
}

// ─── Log functions ────────────────────────────────────────────────────────────

function logHeaders(headers: Record<string, unknown>): void {
  const safe = { ...headers };
  // Скрываем секретное значение Bearer
  if (safe["Authorization"]) safe["Authorization"] = "Bearer [hidden]";
  console.log(`${c.gray}  headers:${c.reset} ${JSON.stringify(safe)}`);
}

export function logRequest(
  method: string, url: string,
  body: unknown, bodyMode: LogBodyMode,
  headers: Record<string, unknown> | undefined, showHeaders: boolean
): void {
  const m = method.toUpperCase();
  console.log(`${c.bold}${methodColor(m)}→ ${m}${c.reset} ${c.dim}${url}${c.reset}`);
  if (showHeaders && headers) logHeaders(headers);
  if (bodyMode !== "none" && body) {
    console.log(`${c.gray}  body:${c.reset} ${formatBody(body, bodyMode)}`);
  }
}

export function logResponse(
  method: string, url: string, status: number, ms: number,
  body: unknown, bodyMode: LogBodyMode,
  headers: Record<string, unknown> | undefined, showHeaders: boolean
): void {
  const m = method.toUpperCase();
  console.log(
    `${c.bold}${methodColor(m)}← ${m}${c.reset} ` +
    `${c.dim}${url}${c.reset} ` +
    `${c.bold}${statusColor(status)}${status}${c.reset} ` +
    `${c.gray}${ms}ms${c.reset}`
  );
  if (showHeaders && headers) logHeaders(headers);
  if (bodyMode !== "none" && body) {
    console.log(`${c.gray}  response:${c.reset} ${formatBody(body, bodyMode)}`);
  }
}

export function logResponseError(
  method: string, url: string, status: number | string, ms: number,
  body: unknown, bodyMode: LogBodyMode,
  headers: Record<string, unknown> | undefined, showHeaders: boolean
): void {
  const m = method.toUpperCase();
  console.error(
    `${c.bold}${c.red}✗ ${m}${c.reset} ` +
    `${c.dim}${url}${c.reset} ` +
    `${c.bold}${c.red}${status}${c.reset} ` +
    `${c.gray}${ms}ms${c.reset}`
  );
  if (showHeaders && headers) logHeaders(headers);
  if (bodyMode !== "none" && body) {
    console.error(`${c.gray}  error:${c.reset} ${formatBody(body, bodyMode)}`);
  }
}
