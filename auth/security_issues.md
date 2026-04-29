# Отчёт по уязвимостям — `custom-ui` (Next.js 16 / Zitadel UI)

## Контекст

Аудит приложения [custom-ui/](./) — кастомный login/profile UI поверх self-hosted Zitadel. Стек: Next.js 16 (App Router), NextAuth.js v5 (beta), nice-grpc, JWT-ассерт сервисного пользователя через RSA-ключ из [secrets/key.json](secrets/key.json).

Цель — найти серьёзные проблемы безопасности, объяснить, чем они опасны, и дать конкретные правки. Все находки проверены чтением исходников.

---

## Сводная таблица

| # | Severity | Уязвимость | Файл |
|---|----------|------------|------|
| 6 | **HIGH** | IDOR: `DELETE /api/profile/sessions?id=<...>` удаляет сессию по ID без проверки владельца | [app/api/profile/sessions/route.tsx:91-93](app/api/profile/sessions/route.tsx#L91-L93) |
| 8 | **HIGH** | `error: error.message` отдаётся клиенту → утечка внутренних деталей | [app/api/profile/sessions/route.tsx:57,99](app/api/profile/sessions/route.tsx#L57), [app/api/profile/me/links/route.tsx:46,86](app/api/profile/me/links/route.tsx#L46) |
| 9 | **HIGH** | `secure: process.env.NODE_ENV === "production"` для основного `sessions` cookie — рассинхрон с auth.ts | [services/zitadel/cookies.ts:43](services/zitadel/cookies.ts#L43) |
| 10 | **HIGH** | Нет HTTP security headers (CSP, X-Frame-Options, HSTS, X-Content-Type-Options и др.) | [next.config.ts](next.config.ts) |
| 11 | **HIGH** | Нет rate-limiting нигде: login, OTP/email verify, QR poll, password reset | весь `app/api/` |
| L1 | **LOGS** | Bearer-токен сервисного пользователя пишется в `console.log` | [services/grpc/client.ts:19](services/grpc/client.ts#L19) |
| L2 | **LOGS** | Кэшированный access token Zitadel пишется в `console.log` | [services/zitadel/api/access-token.ts:18](services/zitadel/api/access-token.ts#L18) |
| L3 | **LOGS** | Полные gRPC-метаданные (с `Authorization`) и тело запроса логируются | [services/grpc/client.ts:42-43, 53](services/grpc/client.ts#L42) |

---

## Подробное описание

### HIGH

#### 6. IDOR: удаление чужих сессий

**Файл:** [app/api/profile/sessions/route.tsx:62-100](app/api/profile/sessions/route.tsx#L62-L100)

```typescript
export async function DELETE(req: NextRequest) {
  const userId = await getUserIdFromAuth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // ...
  const targetSessionId = searchParams.get("id");
  // ...
  if (targetSessionId) {
    await fetchZitadel(`/v2/sessions/${targetSessionId}`, { method: "DELETE" });
    return NextResponse.json({ success: true });
  }
}
```

**Чем плохо.** Аутентификация есть (нужна валидная NextAuth-сессия), но **авторизация отсутствует**: не проверяется, что `targetSessionId` принадлежит текущему `userId`. Любой залогиненный пользователь может делать `DELETE /api/profile/sessions?id=<чужая_session_id>` и завершать сессии других пользователей. `fetchZitadel` ходит сервисным токеном и подчиняется ему, а не правам пользователя — это и есть «god-mode client» pattern.

Аналогичная картина в `revoke_all`: фильтр `s.id !== currentSessionId` работает только если `findCurrentSessionId` сработал; если он вернул `null` (например, потому что cookie с session-id истёк), будут удалены **все** найденные сессии — в том числе текущая.

**Как чинить.** Перед удалением получить список сессий пользователя и убедиться, что `targetSessionId` есть в нём:

```typescript
const allUserSessions = await fetchZitadel(`/v2/sessions/_search`, {
  method: "POST",
  body: JSON.stringify({ queries: [{ userIdQuery: { id: userId } }] }),
});
const ownsSession = (allUserSessions.sessions ?? []).some((s: any) => s.id === targetSessionId);
if (!ownsSession) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
```

И в `revoke_all` проверять, что `currentSessionId` не `null`, иначе отказывать — иначе пользователь молча выкинет сам себя.

---

#### 8. Утечка `error.message` клиенту

**Файлы:**
- [app/api/profile/sessions/route.tsx:57, 99](app/api/profile/sessions/route.tsx#L57)
- [app/api/profile/me/links/route.tsx:46, 86](app/api/profile/me/links/route.tsx#L46)

```typescript
} catch (error: any) {
  return NextResponse.json({ error: error.message }, { status: 500 });
}
```

**Чем плохо.** При ошибке в `fetchZitadel` сообщение часто содержит URL, тело ответа Zitadel, иногда внутренние ID организаций/проектов, формулировки правил. Это leak информации, которая помогает атакующему строить дальнейшие атаки (узнать структуру v2 API, валидные IDP IDs, etc.). Также может выдать stacktrace при `JSON.parse` ошибках.

**Как чинить.** Шаблон:
```typescript
} catch (error) {
  console.error("[/api/profile/sessions] failed:", error);
  return NextResponse.json({ error: "Не удалось обработать запрос" }, { status: 500 });
}
```
Логировать со стороны сервера, клиенту — обобщённое сообщение. Сделать общий error-handler для route-handlers (например, `withErrorHandler(handler)`).

---

#### 9. `sessions` cookie без `secure` в staging/dev-https

**Файл:** [services/zitadel/cookies.ts:43](services/zitadel/cookies.ts#L43)

```typescript
return cookiesList.set({
  name: "sessions",
  // ...
  secure: process.env.NODE_ENV === "production",
});
```

**Чем плохо.** Для NextAuth-cookies в [services/zitadel/user/auth.ts:50](services/zitadel/user/auth.ts#L50) используется правильный признак: `useSecureCookies = env.APP_URL.startsWith("https://")`. А для самого важного cookie — `sessions`, в котором лежат `token` всех сессий — используется `NODE_ENV === "production"`. Если в staging стоит `NODE_ENV=development`, но домен HTTPS — cookie уходит без `Secure`-флага, и его можно перехватить downgrade-атакой (HTTP → MITM).

**Как чинить.** Привести к единому критерию из `auth.ts`:
```typescript
import { env } from "@/shared/config/env";
const useSecureCookies = env.APP_URL.startsWith("https://");
// ...
secure: useSecureCookies,
```
Сделать это во всех местах: `setSessionHttpOnlyCookie`, `setPreferredSessionId`, `setLanguageCookie`.

---

#### 10. Нет HTTP security headers

**Файл:** [next.config.ts](next.config.ts)

```typescript
const nextConfig: NextConfig = {
  allowedDevOrigins: [...],
  experimental: { turbopackFileSystemCacheForDev: true, authInterrupts: true },
  turbopack: { resolveAlias: {} },
};
```

**Чем плохо.** Нет ни `Content-Security-Policy`, ни `X-Frame-Options`, ни `Strict-Transport-Security`, ни `Referrer-Policy`, ни `X-Content-Type-Options`, ни `Permissions-Policy`. Это login-приложение для IAM — буквально первая цель для clickjacking и XSS-вектора. Особенно учитывая, что в [services/zitadel/cookies.ts:29-31](services/zitadel/cookies.ts#L29-L31) уже заложена опция `iFrameEnabled` — то есть приложение собирается работать в iframe, но без CSP `frame-ancestors` его можно встроить откуда угодно.

**Как чинить.** Добавить в `next.config.ts`:

```typescript
async headers() {
  return [{
    source: "/:path*",
    headers: [
      { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" }, // если iframe не нужен; иначе CSP frame-ancestors
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
      { key: "Content-Security-Policy", value: [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline'", // Next.js inline скрипты
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data: https://i.pravatar.cc",
          "connect-src 'self' " + new URL(process.env.ZITADEL_API_URL!).origin,
          "frame-ancestors 'none'", // или конкретные origin-ы
          "form-action 'self' " + new URL(process.env.ZITADEL_API_URL!).origin,
          "base-uri 'self'",
        ].join("; ")
      },
    ],
  }];
}
```
CSP начать в `Report-Only` режиме на пару дней, потом включить enforce.

---

#### 11. Нет rate-limiting

**Где нет.** Везде. Login по паролю ([app/(home)/(auth)/login/email/actions.ts](app/(home)/(auth)/login/email/actions.ts)), email-OTP verify, password reset, QR poll ([app/api/auth/qr/status/route.ts](app/api/auth/qr/status/route.ts)), `revoke_all`, `/api/profile/me/links` POST.

**Чем плохо.** Email-код обычно 6 цифр = 10⁶ комбинаций — без throttling брутфорсится за минуты. Login по паролю — credential stuffing. QR token enumeration ([app/api/auth/qr/status/route.ts:64](app/api/auth/qr/status/route.ts#L64)) — бесконечный polling, чтобы перехватить чужой подтверждённый QR.

**Как чинить.** Поставить middleware-уровневый rate limiter. Минимально — `@upstash/ratelimit` + Redis или in-memory `lru-cache` с окном:
- Login/OTP: 5 попыток / 15 мин на IP + 5 попыток / 15 мин на email/loginName.
- QR status polling: 30 запросов / мин на IP.
- Profile mutations: 60 / мин на сессию.

Поместить вызов в [proxy.ts](proxy.ts) (это middleware Next.js, несмотря на название файла) либо обернуть каждый чувствительный endpoint декоратором.

Дополнительно: положиться на rate-limit Zitadel **нельзя** — он защищает Zitadel, а не endpoint этого приложения.

---

### LOGS

Отдельный severity для проблем с логированием секретов и PII. Чинятся быстро (по сути — удалить пару строк), но критичны: токен в логе = компрометация сервисного аккаунта Zitadel.

#### L1. Bearer-токен сервисного пользователя в логах (gRPC)

**Файл:** [services/grpc/client.ts:19](services/grpc/client.ts#L19)

```typescript
metadata.set('authorization', `Bearer ${await getZitadelAccessToken()}`);
console.log("bearer: " + await getZitadelAccessToken())
```

**Чем плохо.** Это токен **сервисного пользователя Zitadel** с правами `urn:zitadel:iam:org:project:role:custom_ui_service` — он используется для всех серверных вызовов в Zitadel. Любой, у кого есть доступ к stdout / централизованным логам (Loki, Datadog, Sentry, kubectl logs), получает «бога» в Zitadel. Плюс `getZitadelAccessToken()` вызывается **дважды** — лишний trip + двойная нагрузка на кэш.

**Как чинить.** Удалить строку. Полностью. Если нужен debug — логировать только хеш токена (`crypto.createHash('sha256').update(t).digest('hex').slice(0,8)`) и только при `env.isDev`.

---

#### L2. Логирование закэшированного access token

**Файл:** [services/zitadel/api/access-token.ts:18](services/zitadel/api/access-token.ts#L18)

```typescript
if (cachedAccessToken && tokenExpiresAt && now < tokenExpiresAt - 5 * 60 * 1000) {
  console.log("cached access token:", cachedAccessToken)
  return cachedAccessToken;
}
```

**Чем плохо.** То же самое — токен в чистом виде в логи. Это тот же самый сервисный токен, что и в L1. Удалять без замены.

**Как чинить.** Удалить `console.log` (и заодно строку 21 `console.log("NOT CACHED access token")` — она бесполезна).

---

#### L3. gRPC logging middleware дампит метаданные и тело запроса

**Файл:** [services/grpc/client.ts:42-43, 53](services/grpc/client.ts#L42-L53)

```typescript
console.log("Метаданные (Headers):", JSON.stringify(metadataRecord, null, 2));
console.log("Тело запроса (Body):", JSON.stringify(call.request, null, 2));
// ...
console.log("Результат:", JSON.stringify(response, null, 2));
```

**Чем плохо.** `metadataRecord` содержит `authorization: Bearer …` (токен из L1). Тело запроса/ответа может содержать персональные данные (email, имя, телефон, данные сессий). Логи попадают в production — и в файл `zitadel-actions.log`, лежащий рядом с проектом, и в любой агрегатор.

**Как чинить.**
1. Перевести логирование на `slog`-подобный логгер с уровнями (`debug`/`info`/`warn`/`error`).
2. На уровне middleware сделать redaction: вырезать `authorization`, `cookie`, `x-zitadel-orgid`, поля `password`, `token`, `email`, `phone` из тела.
3. Дамп тела включать только при `env.isDev && process.env.GRPC_DEBUG === "1"`.

---

## Рекомендуемая очерёдность фиксов

**Сегодня (1 час работы):**
1. Удалить `console.log` с токенами и метаданными: L1, L2, L3.

**Эта неделя:**
2. Закрыть IDOR (#6).
3. Добавить generic error responses (#8).
4. Привести cookie `secure` flag к единому критерию (#9).
5. Добавить базовый набор security headers (#10) — начать с CSP в `Report-Only`.

**Этот спринт:**
6. Rate-limiting (#11).

---

## Верификация после фикса

### Ручная проверка

- `grep -rn "console.log" services/grpc services/zitadel/api` → не должно остаться логов с `Bearer`/`token`.
- `grep -rn "error.message" app/api` → ноль матчей в `NextResponse.json`.

### Запуск вживую

```bash
# 1. IDOR — попытка удалить чужую сессию должна возвращать 403
# Залогиниться двумя пользователями A и B, взять session id у B, дёрнуть от A:
curl -i -X DELETE 'http://localhost:3000/api/profile/sessions?id=<B_SESSION_ID>' \
  -H "Cookie: <A_AUTH_COOKIE>"

# 2. Security headers — должны присутствовать
curl -sI http://localhost:3000/login | grep -iE 'content-security-policy|x-frame-options|strict-transport'

# 3. Rate limit на login — 6-я попытка должна быть отклонена с 429
for i in {1..6}; do
  curl -i -X POST 'http://localhost:3000/login/email' --data 'email=x@y.z&password=wrong'
done

# 4. error.message не должно протекать
curl -i -X DELETE 'http://localhost:3000/api/profile/sessions?id=invalid' -H "Cookie: <AUTH_COOKIE>"
# В body не должно быть слов "Zitadel", "v2/sessions", stack traces.
```
