# Отчёт по уязвимостям — `custom-ui` (Next.js 16 / Zitadel UI)

## Контекст

Аудит приложения [custom-ui/](./) — кастомный login/profile UI поверх self-hosted Zitadel. Стек: Next.js 16 (App Router), NextAuth.js v5 (beta), nice-grpc, JWT-ассерт сервисного пользователя через RSA-ключ из [secrets/key.json](secrets/key.json).

Цель — найти серьёзные проблемы безопасности, объяснить, чем они опасны, и дать конкретные правки. Все находки проверены чтением исходников.

Замечание: я не выполнял `git log` на предмет того, утекали ли когда-либо секреты в историю — это стоит сделать отдельно (`git log -p -- secrets/ .env`).

---

## Сводная таблица

| # | Severity | Уязвимость | Файл |
|---|----------|------------|------|
| 1 | **CRITICAL** | Bearer-токен сервисного пользователя пишется в `console.log` | [services/grpc/client.ts:19](services/grpc/client.ts#L19) |
| 2 | **CRITICAL** | Кэшированный access token Zitadel пишется в `console.log` | [services/zitadel/api/access-token.ts:18](services/zitadel/api/access-token.ts#L18) |
| 3 | **CRITICAL** | Полные gRPC-метаданные (с `Authorization`) и тело запроса логируются | [services/grpc/client.ts:42-43, 53](services/grpc/client.ts#L42) |
| 4 | **CRITICAL** | SSRF в прокси аватарок: `id` и `u` интерполируются в URL без валидации | [app/api/res/avatar/[id]/route.tsx:15](app/api/res/avatar/%5Bid%5D/route.tsx#L15) |
| 5 | **CRITICAL** | Реалистичные секреты (`SESSION_SECRET`, `TELEGRAM_BOT_TOKEN`) закоммичены в [.env.example](.env.example) | [.env.example:3-4](.env.example#L3-L4) |
| 6 | **HIGH** | IDOR: `DELETE /api/profile/sessions?id=<...>` удаляет сессию по ID без проверки владельца | [app/api/profile/sessions/route.tsx:91-93](app/api/profile/sessions/route.tsx#L91-L93) |
| 7 | **HIGH** | `decodeJwt(accessToken)` на opaque-токен Zitadel — endpoint всегда вернёт 401 | [app/api/profile/me/links/route.tsx:13-23](app/api/profile/me/links/route.tsx#L13-L23) |
| 8 | **HIGH** | `error: error.message` отдаётся клиенту → утечка внутренних деталей | [app/api/profile/sessions/route.tsx:57,99](app/api/profile/sessions/route.tsx#L57), [app/api/profile/me/links/route.tsx:46,86](app/api/profile/me/links/route.tsx#L46) |
| 9 | **HIGH** | `secure: process.env.NODE_ENV === "production"` для основного `sessions` cookie — рассинхрон с auth.ts | [services/zitadel/cookies.ts:43](services/zitadel/cookies.ts#L43) |
| 10 | **HIGH** | Нет HTTP security headers (CSP, X-Frame-Options, HSTS, X-Content-Type-Options и др.) | [next.config.ts](next.config.ts) |
| 11 | **HIGH** | Нет rate-limiting нигде: login, OTP/email verify, QR poll, password reset | весь `app/api/` |
| 12 | **HIGH** | Хардкод `IDP_MAP` и project ID в исходниках | [app/api/profile/me/links/route.tsx:8-11](app/api/profile/me/links/route.tsx#L8-L11), [services/zitadel/api/access-token.ts:54](services/zitadel/api/access-token.ts#L54) |
| 13 | **MEDIUM** | `accessToken` Zitadel прокидывается в клиентскую сессию NextAuth | [services/zitadel/user/auth.ts:140](services/zitadel/user/auth.ts#L140) |
| 14 | **MEDIUM** | `iFrameEnabled=true` ставит `SameSite=none` на сессионный cookie без CSRF-механизма | [services/zitadel/cookies.ts:29-31](services/zitadel/cookies.ts#L29-L31) |
| 15 | **MEDIUM** | Отсутствие валидации `userCode` в QR SSE — нет проверки формата, нет rate-limit на enumeration | [app/api/auth/qr/status/route.ts:64](app/api/auth/qr/status/route.ts#L64) |
| 16 | **MEDIUM** | `JSON.parse((userRes as any).error)` упадёт исключением, если ошибка не валидный JSON | `app/(home)/(auth)/login/register/register-actions.ts` |
| 17 | **MEDIUM** | `NODE_ENV` дефолтится в `"development"` — при незаданной переменной всё работает в небезопасном режиме | [shared/config/env.ts:18](shared/config/env.ts#L18) |
| 18 | **MEDIUM** | Cookie overflow молча выкидывает старые сессии (`MAX_COOKIE_SIZE=2048`) | [services/zitadel/cookies.ts:85-91](services/zitadel/cookies.ts#L85-L91) |
| 19 | **MEDIUM** | `package-lock.json` и `bun.lock` оба в репо — drift лок-файлов | [package-lock.json](package-lock.json), [bun.lock](bun.lock) |
| 20 | **MEDIUM** | Dockerfile.production принимает секреты через `ARG` (попадают в слои), базовый образ не пиннят по digest | [Dockerfile.production](Dockerfile.production) |
| 21 | **LOW** | NextAuth.js v5 в beta — `^5.0.0-beta.30` | [package.json:31](package.json#L31) |
| 22 | **LOW** | `setLanguageCookie` без `secure` | [services/zitadel/cookies.ts:47-56](services/zitadel/cookies.ts#L47-L56) |
| 23 | **LOW** | Загрузка аватара валидируется только клиентски, доверяет MIME из браузера | [services/zitadel/user/requests/profile.ts](services/zitadel/user/requests/profile.ts) |

---

## Подробное описание

### CRITICAL

#### 1. Bearer-токен сервисного пользователя в логах (gRPC)

**Файл:** [services/grpc/client.ts:19](services/grpc/client.ts#L19)

```typescript
metadata.set('authorization', `Bearer ${await getZitadelAccessToken()}`);
console.log("bearer: " + await getZitadelAccessToken())
```

**Чем плохо.** Это токен **сервисного пользователя Zitadel** с правами `urn:zitadel:iam:org:project:role:custom_ui_service` — он используется для всех серверных вызовов в Zitadel. Любой, у кого есть доступ к stdout / централизованным логам (Loki, Datadog, Sentry, kubectl logs), получает «бога» в Zitadel. Плюс `getZitadelAccessToken()` вызывается **дважды** — лишний trip + двойная нагрузка на кэш.

**Как чинить.** Удалить строку. Полностью. Если нужен debug — логировать только хеш токена (`crypto.createHash('sha256').update(t).digest('hex').slice(0,8)`) и только при `env.isDev`.

---

#### 2. Логирование закэшированного access token

**Файл:** [services/zitadel/api/access-token.ts:18](services/zitadel/api/access-token.ts#L18)

```typescript
if (cachedAccessToken && tokenExpiresAt && now < tokenExpiresAt - 5 * 60 * 1000) {
  console.log("cached access token:", cachedAccessToken)
  return cachedAccessToken;
}
```

**Чем плохо.** То же самое — токен в чистом виде в логи. Это тот же самый сервисный токен, что и в #1. Удалять без замены.

**Как чинить.** Удалить `console.log` (и заодно строку 21 `console.log("NOT CACHED access token")` — она бесполезна).

---

#### 3. gRPC logging middleware дампит метаданные и тело запроса

**Файл:** [services/grpc/client.ts:42-43, 53](services/grpc/client.ts#L42-L53)

```typescript
console.log("Метаданные (Headers):", JSON.stringify(metadataRecord, null, 2));
console.log("Тело запроса (Body):", JSON.stringify(call.request, null, 2));
// ...
console.log("Результат:", JSON.stringify(response, null, 2));
```

**Чем плохо.** `metadataRecord` содержит `authorization: Bearer …` (токен из #1). Тело запроса/ответа может содержать персональные данные (email, имя, телефон, данные сессий). Логи попадают в production — и в файл `zitadel-actions.log`, лежащий рядом с проектом, и в любой агрегатор.

**Как чинить.**
1. Перевести логирование на `slog`-подобный логгер с уровнями (`debug`/`info`/`warn`/`error`).
2. На уровне middleware сделать redaction: вырезать `authorization`, `cookie`, `x-zitadel-orgid`, поля `password`, `token`, `email`, `phone` из тела.
3. Дамп тела включать только при `env.isDev && process.env.GRPC_DEBUG === "1"`.

---

#### 4. SSRF в прокси аватарок

**Файл:** [app/api/res/avatar/[id]/route.tsx:7-15](app/api/res/avatar/%5Bid%5D/route.tsx#L7-L15)

```typescript
const { id } = await params;
const userId = searchParams.get("u");
if (!userId) return new NextResponse("Missing user ID", { status: 400 });
const externalUrl = `https://i.pravatar.cc/${id}?u=${userId}`;
const response = await fetch(externalUrl, { cache: 'force-cache' });
```

**Чем плохо.** `id` (path param) и `userId` (query) подставляются в URL без проверки. `id` может содержать `..`, `@`, `?`, `#`, `%2F` — `URL` на стороне Node.js разрулит это, и атакующий теоретически может «сменить» хост через `id = "@attacker.com/path"`. Эндпоинт **не требует аутентификации** и доступен анонимно. Хотя кэширование и наличие фиксированного `https://i.pravatar.cc/` ограничивает blast radius, это всё равно неаутентифицированный outbound proxy с user-controlled path — классический SSRF-сурфейс.

Дополнительно: `Cache-Control: public, max-age=31536000, immutable` на год — если завтра поменяется аватар, по всему интернету будет валяться старая копия.

**Как чинить.**
```typescript
// 1. Валидация формата id
if (!/^\d{1,4}$/.test(id)) return new NextResponse("Bad id", { status: 400 });

// 2. Валидация userId (UUID или числовой Zitadel ID)
if (!/^[a-zA-Z0-9_-]{1,64}$/.test(userId)) return new NextResponse("Bad user", { status: 400 });

// 3. Построить URL через конструктор и сверить хост
const upstream = new URL("https://i.pravatar.cc/" + id);
upstream.searchParams.set("u", userId);
if (upstream.hostname !== "i.pravatar.cc") return new NextResponse("Forbidden", { status: 403 });

// 4. Cache-Control max-age=86400 + ETag
```

Лучше — закешировать аватары в S3/MinIO/Zitadel assets и не проксировать вообще.

---

#### 5. Реальные секреты в `.env.example`

**Файл:** [.env.example:3-4](.env.example#L3-L4)

```
SESSION_SECRET="QFsQOyS/rTFzV1ygxGvVH95iwVO5ffy/i06A4xNkkT0="
TELEGRAM_BOT_TOKEN="1234567898:AAH30wJ2djpVOPbNTObg16-99Hzv9YkKBrQ"
```

**Чем плохо.** `SESSION_SECRET` выглядит как настоящий результат `openssl rand -base64 32` (комментарий выше прямо ссылается на эту команду). Telegram-токен по формату (`<bot_id>:<35-char>`) идентичен реальным токенам BotFather. Файл `.env.example` коммитится в git — если эти значения были использованы хоть раз в реальной среде, они утекли навсегда (git history, PR mirrors, GitHub search).

**Как чинить.**
1. **Проверить git history**: `git log --all -p -- .env.example` и `git log --all -S 'QFsQOyS' -S 'AAH30wJ2'`. Если это были когда-либо реальные значения — **немедленно ротировать** оба секрета (новый `SESSION_SECRET`, перевыпуск Telegram-бота через BotFather → `/revoke`).
2. Заменить значения на очевидно поддельные:
   ```
   SESSION_SECRET="REPLACE_ME_run_openssl_rand_base64_32"
   TELEGRAM_BOT_TOKEN="REPLACE_ME_bot_token_from_BotFather"
   ```

---

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

#### 7. `decodeJwt` на opaque access token

**Файл:** [app/api/profile/me/links/route.tsx:13-23](app/api/profile/me/links/route.tsx#L13-L23)

```typescript
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
```

**Чем плохо.** Zitadel по умолчанию выпускает **opaque** access token (не JWT), о чём прямо предупреждает комментарий в [app/api/profile/sessions/route.tsx:8-9](app/api/profile/sessions/route.tsx#L8-L9). `decodeJwt` падает → catch возвращает `null` → endpoint всегда возвращает `401 Unauthorized` для всех залогиненных пользователей. Помимо того, что endpoint **сломан**, паттерн опасен: даже если бы токен был JWT, `claims.sub` ≠ Zitadel user ID (зависит от настроек id_token).

**Как чинить.** Использовать тот же приём, что в `sessions/route.tsx`:
```typescript
const session = await auth();
return (session as any)?.zitadelUserId ?? null;
```
И вынести `getUserIdFromAuth` в общий хелпер (`services/zitadel/user/get-user-id.ts`), чтобы не было двух разных реализаций.

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

#### 12. Хардкод IDP IDs и project ID в коде

**Файлы:**
- [app/api/profile/me/links/route.tsx:8-11](app/api/profile/me/links/route.tsx#L8-L11):
  ```typescript
  const IDP_MAP: Record<string, string> = {
    telegram: "123456789012345678",
    max: "987654321098765432",
  };
  ```
- [services/zitadel/api/access-token.ts:54](services/zitadel/api/access-token.ts#L54):
  ```
  urn:zitadel:iam:org:project:id:365068666124894213:aud
  ```

**Чем плохо.**
- IDP_MAP — placeholders (комментарий прямо говорит «Замени эти ID на реальные»). Если задеплоится в прод как есть → broken endpoint. А если заменят — реальные IDs Zitadel будут в открытом коде.
- Project ID `365068666124894213` уже **реальный** и закоммичен — не критично само по себе (не секрет), но это знак: переменные среды используются непоследовательно.

**Как чинить.** Перенести в [shared/config/env.ts](shared/config/env.ts):
```typescript
ZITADEL_PROJECT_ID: z.string().regex(/^\d+$/),
ZITADEL_IDP_TELEGRAM_ID: z.string().regex(/^\d+$/),
ZITADEL_IDP_MAX_ID: z.string().regex(/^\d+$/),
```
И собирать scope строку из них в `access-token.ts`.

---

### MEDIUM

#### 13. `accessToken` Zitadel в клиентской сессии

**Файл:** [services/zitadel/user/auth.ts:138-145](services/zitadel/user/auth.ts#L138-L145)

```typescript
async session({ session, token }) {
  if (token) {
    // @ts-ignore
    session.accessToken = token.accessToken;
    // @ts-ignore
    session.zitadelUserId = token.zitadelUserId;
    // @ts-ignore
    session.error = token.error;
  }
  return session;
}
```

**Чем плохо.** `useSession()` на клиенте получает access token Zitadel — любой XSS (а CSP сейчас нет, см. #10) утаскивает токен и идёт напрямую в Zitadel API от лица пользователя. Токен нужен **только серверу**, у клиента ему делать нечего.

**Как чинить.** Не прокидывать `accessToken` в session callback. Серверный код может получать его через `auth()` (он лежит в JWT-cookie NextAuth, а не в JSON-объекте session). Если нужен звонок в Zitadel из клиента — делать это через server action или route handler в этом приложении.

---

#### 14. `iFrameEnabled` ставит `SameSite=none` без CSRF-защиты

**Файл:** [services/zitadel/cookies.ts:23-44](services/zitadel/cookies.ts#L23-L44)

```typescript
if (iFrameEnabled) {
  resolvedSameSite = "none";
} else {
  resolvedSameSite = "lax";
}
```

**Чем плохо.** Когда приложение работает в iframe, sessions cookie ставится с `SameSite=None`. Это означает, что любой POST к route-handler'ам этого приложения с другого origin (сабмит формы, fetch с `credentials: include` от чужого скрипта) будет отправлен с этим cookie. Без явного CSRF-токена это эквивалентно «у нас нет CSRF-защиты, когда iframe включён». Server actions Next.js имеют свою защиту через origin-check, но raw route handlers ([app/api/profile/sessions/route.tsx](app/api/profile/sessions/route.tsx), [app/api/profile/me/links/route.tsx](app/api/profile/me/links/route.tsx)) — нет.

**Как чинить.** Если iframe-режим действительно нужен:
1. Добавить явный CSRF-токен (double-submit cookie) для всех POST/PATCH/DELETE в route handlers.
2. Проверять `Origin`/`Referer` header против whitelist в начале каждого state-changing handler.
3. CSP `frame-ancestors` строго на доверенные домены.

Если iframe не нужен — удалить опцию `iFrameEnabled` и оставить `lax` всегда.

---

#### 15. QR token (`userCode`) без валидации формата

**Файл:** [app/api/auth/qr/status/route.ts:64](app/api/auth/qr/status/route.ts#L64)

```typescript
const userCode = req.nextUrl.searchParams.get("token");
if (!userCode) { /* 400 */ }
const entry = getQrEntry(userCode);
```

**Чем плохо.** Нет проверки формата (длина, alphabet). Хранилище QR — in-memory globalThis. Без rate-limit (#11) атакующий может перебирать `userCode` в надежде поймать чужой подтверждённый QR — после `confirmed` endpoint отдаёт `accessToken`/`idToken` (см. строки 32-33 функции `pollDeviceToken`).

**Как чинить.**
1. Валидировать формат: Zitadel device user code обычно 8 символов вида `XXXX-XXXX` в верхнем регистре. Использовать `z.string().regex(/^[A-Z0-9-]{8,12}$/)`.
2. Жёсткий rate-limit на endpoint (см. #11).
3. Удалять entry из store сразу после `confirmed` отдачи токенов первому клиенту (`getQrEntry` должен быть pop, а не peek).

---

#### 16. `JSON.parse` на возможно-не-JSON ошибке

**Файл:** `app/(home)/(auth)/login/register/register-actions.ts:156, 240` (по результатам sub-агента — лично не подтверждал чтением)

```typescript
const errMsg = !userRes.success ? JSON.parse((userRes as any).error) : "userId отсутствует"
```

**Чем плохо.** Если `userRes.error` — строка, не являющаяся валидным JSON, `JSON.parse` бросит `SyntaxError` поверх уже произошедшей ошибки регистрации, и пользователь увидит криптично сломанную форму.

**Как чинить.**
```typescript
const raw = (userRes as any).error;
const errMsg = typeof raw === "string" ? raw : JSON.stringify(raw);
```
Перед фиксом проверить точный код в файле.

---

#### 17. `NODE_ENV` дефолтится в `"development"`

**Файл:** [shared/config/env.ts:18](shared/config/env.ts#L18)

```typescript
NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
```

**Чем плохо.** Если кто-то забудет проставить `NODE_ENV=production` в Helm/Kubernetes/docker-compose — приложение запустится в `development` и автоматически получит cookies без `Secure`-флага (#9), включенный (потенциально) verbose logging, dev-only флаги Next.js. Fail-loud > fail-silent для конфига.

**Как чинить.** Убрать `.default()`:
```typescript
NODE_ENV: z.enum(["development", "test", "production"]),
```
Это сделает приложение упасть на старте, если переменная не задана — что и нужно.

---

#### 18. Cookie overflow молча выбрасывает старые сессии

**Файл:** [services/zitadel/cookies.ts:85-91](services/zitadel/cookies.ts#L85-L91)

```typescript
if (JSON.stringify(temp).length >= MAX_COOKIE_SIZE) {
  console.log("WARNING COOKIE OVERFLOW");
  // TODO: improve cookie handling
  currentSessions = [session].concat(currentSessions.slice(1));
}
```

**Чем плохо.** При >2 KB суммарного JSON — старая сессия молча удаляется. Пользователь получает «вы как-будто разлогинились» без объяснений. Не критично для безопасности (никаких leak'ов), но это тонкий UX-баг и сигнал, что cookie-storage сессий не масштабируется. По-хорошему, в cookie должна лежать только короткая ссылка на server-side session store (Redis/postgres).

**Как чинить.** Долгосрочно — server-side session store. Минимально — показать пользователю toast при overflow.

---

#### 19. Два лок-файла одновременно

**Файлы:** [bun.lock](bun.lock) (148 KB) и [package-lock.json](package-lock.json) (296 KB) присутствуют оба.

**Чем плохо.** Версии резолвятся неконсистентно: `bun install` смотрит на `bun.lock`, `npm ci` — на `package-lock.json`. Если CI и dev используют разные пакетники, рискуем получить разные версии в проде и в локали (включая security patches). По CLAUDE.md проект использует Bun.

**Как чинить.** Удалить `package-lock.json` (если канон — Bun), добавить в CI шаг `bun install --frozen-lockfile` и проверку `git diff --exit-code bun.lock`.

---

#### 20. Dockerfile.production: ARG-секреты и неприбитый base image

**Файл:** [Dockerfile.production](Dockerfile.production)

**Чем плохо.**
- `ARG ZITADEL_SECRET` + `ENV ZITADEL_SECRET=${ZITADEL_SECRET}` — секрет попадает в слои образа и виден в `docker history`. Anyone, кто получит сам образ, получит и секрет.
- `FROM oven/bun:1-alpine` без digest — supply-chain risk: завтра контейнер пересобёрётся с другим content.

**Как чинить.**
1. Убрать `ARG`/`ENV` для секретов. Передавать их через runtime env (`docker run -e`, K8s Secret, Docker Swarm secret).
2. Использовать BuildKit secrets: `RUN --mount=type=secret,id=zitadel_secret cat /run/secrets/zitadel_secret`.
3. Запиннить образ: `FROM oven/bun:1-alpine@sha256:<digest>`.
4. Использовать `hadolint` в CI.

---

### LOW

#### 21. NextAuth.js v5 в beta

**Файл:** [package.json:31](package.json#L31) — `^5.0.0-beta.30`.

Beta могут получать security-патчи с задержкой. Запиннить точную версию (`5.0.0-beta.30`) и следить за релизами. Когда выйдет `5.0.0` стабильный — мигрировать.

#### 22. `setLanguageCookie` без `secure`

**Файл:** [services/zitadel/cookies.ts:47-56](services/zitadel/cookies.ts#L47-L56). Не критично (preference language — не секрет), но непоследовательно. Привести к единому виду из #9.

#### 23. Avatar upload — клиентская валидация

**Файл:** [app/(home)/(details)/profile/details/_components/editable-avatar.tsx](app/(home)/(details)/profile/details/_components/editable-avatar.tsx) + [services/zitadel/user/requests/profile.ts](services/zitadel/user/requests/profile.ts)

Проверка размера/типа только в браузере — обходится curl-ом за 1 секунду. Серверная проверка делегирована Zitadel `/assets/v1/users/me/avatar`. Доверять Zitadel здесь разумно (он валидирует MIME), но для defense-in-depth можно добавить серверную проверку magic bytes (`89 50 4E 47` для PNG, `FF D8 FF` для JPEG, `52 49 46 46 ?? ?? ?? ?? 57 45 42 50` для WebP) перед форвардом.

---

## Что НЕ покрыто в этом аудите

Чтобы понимать границы отчёта:

1. **Telegram OAuth flow** — есть ли валидация HMAC-SHA256(bot_token, sorted_params) согласно [спеке Telegram Login Widget](https://core.telegram.org/widgets/login#checking-authorization). Скорее всего обработка делегирована Zitadel IDP, но стоит подтвердить.
2. **MAX ID OAuth flow** — то же самое.
3. **Логика server actions для регистрации** ([app/(home)/(auth)/login/register/register-actions.ts](app/(home)/(auth)/login/register/register-actions.ts)) — не читал сам файл. Перед фиксами #16 верифицировать.
4. **Полный обзор `app/(home)/(auth)/login/callback/success/actions.ts`** — там может быть open-redirect через `requestId`.
5. **gRPC-сервер на стороне MedIncident backend** — в скоупе только клиент.
6. **Git history на предмет утёкших секретов** — `git log -p` нужно прогнать отдельно.
7. **Container scanning** — `trivy image` на собранный prod-образ.
8. **Dependency CVE scan** — `bun audit` / `npm audit` / Snyk.

---

## Рекомендуемая очерёдность фиксов

Если нет ресурса делать всё сразу, в этом порядке:

**Сегодня (1 час работы):**
1. Удалить `console.log` с токенами: #1, #2, #3.
2. Проверить git history на `.env.example` → если секреты были реальными, ротировать (#5).

**Эта неделя:**
3. Закрыть IDOR (#6) и сломанный links endpoint (#7).
4. Добавить generic error responses (#8).
5. Привести cookie `secure` flag к единому критерию (#9).
6. Убрать `accessToken` из клиентской сессии (#13).
7. Добавить базовый набор security headers (#10) — начать с CSP в `Report-Only`.
8. Хардкоды (#12) → env vars.

**Этот спринт:**
9. Rate-limiting (#11).
10. SSRF в avatar proxy (#4) или вообще убрать прокси.
11. CSRF / iframe-режим (#14).
12. QR enumeration защита (#15).

**Постоянная гигиена:**
13. Удалить `package-lock.json` (#19).
14. Pin Docker image, BuildKit secrets (#20).
15. `NODE_ENV` без default (#17).
16. Запиннить NextAuth beta (#21).

---

## Верификация после фикса

### Ручная проверка (без запуска кода)

- `grep -rn "console.log" services/grpc services/zitadel/api` → не должно остаться логов с `Bearer`/`token`.
- `grep -rn "decodeJwt" app/api` → должно быть пусто (или явно с комментарием «не на opaque токен»).
- `grep -rn "error.message" app/api` → ноль матчей в `NextResponse.json`.

### Запуск вживую

```bash
# 1. SSRF — должно вернуть 400/403, а не 200 с картинкой
curl -i 'http://localhost:3000/api/res/avatar/100/?u=../../../etc/passwd'
curl -i 'http://localhost:3000/api/res/avatar/@evil.com%2F100?u=test'

# 2. IDOR — попытка удалить чужую сессию должна возвращать 403
# Залогиниться двумя пользователями A и B, взять session id у B, дёрнуть от A:
curl -i -X DELETE 'http://localhost:3000/api/profile/sessions?id=<B_SESSION_ID>' \
  -H "Cookie: <A_AUTH_COOKIE>"

# 3. Links endpoint — должен возвращать 200, а не 401 (после фикса #7)
curl -i 'http://localhost:3000/api/profile/me/links' -H "Cookie: <AUTH_COOKIE>"

# 4. Security headers — должны присутствовать
curl -sI http://localhost:3000/login | grep -iE 'content-security-policy|x-frame-options|strict-transport'

# 5. Rate limit на login — 6-я попытка должна быть отклонена с 429
for i in {1..6}; do
  curl -i -X POST 'http://localhost:3000/login/email' --data 'email=x@y.z&password=wrong'
done

# 6. error.message не должно протекать
curl -i -X DELETE 'http://localhost:3000/api/profile/sessions?id=invalid' -H "Cookie: <AUTH_COOKIE>"
# В body не должно быть слов "Zitadel", "v2/sessions", stack traces.
```

### Автоматизированно

```bash
# Один раз
bun audit                                    # CVE в зависимостях
docker build -f Dockerfile.production -t custom-ui:audit .
trivy image custom-ui:audit                  # CVE в образе + поиск секретов в слоях
docker history --no-trunc custom-ui:audit | grep -iE 'secret|token|key'  # ничего не должно найтись

# В CI постоянно
bun audit
hadolint Dockerfile.production
# headers-test через https://github.com/koenbuyens/securityheaders или Mozilla Observatory
```

### Файлы, которые гарантированно изменятся при фиксах CRITICAL+HIGH

- [services/grpc/client.ts](services/grpc/client.ts)
- [services/zitadel/api/access-token.ts](services/zitadel/api/access-token.ts)
- [services/zitadel/cookies.ts](services/zitadel/cookies.ts)
- [services/zitadel/user/auth.ts](services/zitadel/user/auth.ts)
- [app/api/profile/sessions/route.tsx](app/api/profile/sessions/route.tsx)
- [app/api/profile/me/links/route.tsx](app/api/profile/me/links/route.tsx)
- [app/api/res/avatar/[id]/route.tsx](app/api/res/avatar/%5Bid%5D/route.tsx)
- [next.config.ts](next.config.ts)
- [shared/config/env.ts](shared/config/env.ts)
- [.env.example](.env.example)
- новые: `shared/lib/rate-limit.ts` / `shared/lib/api-error.ts` / `services/zitadel/user/get-user-id.ts`
