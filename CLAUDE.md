# Auth UI

Custom login/profile UI for a self-hosted Zitadel IAM instance. Replaces the default Zitadel ui and provides profile management for users of the MedIncident platform.

Integrates with Zitadel via machine-to-machine JWT assertion (RS256), exposes OIDC-compatible login flows, and communicates with the MedIncident backend over gRPC.

## Stack

Next.js 16 (App Router, Turbopack), Bun, TypeScript (strict), Tailwind CSS v4, shadcn/ui (new-york), Zitadel (self-hosted IAM), NextAuth.js v5, react-hook-form + Zod, zustand, nice-grpc.

## Project Structure

```
app/                         - Next.js App Router: routing shells only, max ~10 lines per page
  (home)/
    (auth)/login/            - Login flow pages and server actions
    (details)/profile/       - Profile, security, settings pages and server actions
  api/
    auth/[...nextauth]/      - NextAuth.js route handler
    health/                  - Health check endpoint
services/                    - External integrations (never import into shared/ or domain/)
  zitadel/
    api/                     - Fetch + Axios clients, JWT auth, error handling
      requests/              - Per-resource API functions (users, sessions, auth, idps, links)
    user/auth.ts             - NextAuth.js config with Zitadel provider + token refresh
    session.ts               - Server-side session validation and redirect helper
    cookies.ts               - HttpOnly session cookie management
    current-session.ts       - Current session ID tracking
    helpers.ts               - Timestamp utilities for Zitadel proto types
  grpc/
    client.ts                - nice-grpc channel config for MedIncident gRPC API
shared/                      - Cross-cutting, no business logic
  ui/                        - shadcn/ui base components (button, card, input, dialog, etc.)
  lib/
    utils.ts                 - cn() class merging, delay()
    constants.ts             - APP_NAME and other app-wide constants
    fetch-helper.ts          - Generic typed fetch wrapper with Zod validation
    ui-error-handler.ts      - Toast error display helpers
    user-agent.ts            - Browser/OS parser from User-Agent string
    mock-db.ts               - Dev-only mock data (do not use in production paths)
  config/
    env.ts                   - @t3-oss/env-nextjs environment validation schema
domain/                      - Business types and Zod schemas, no runtime side effects
  auth/                      - TelegramUser, AuthResponse, JwtUser, QrData
  profile/                   - User, PersonalInfo, UserSession, SecurityData
  consent/                   - Consent flow params and response schemas
  error.ts                   - Result<T> discriminated union
  external-api.ts            - External API response schemas
lib/generated/               - Auto-generated protobuf (buf generate) — do not edit
components/
  icons.tsx                  - Custom SVG icon components
```

## Where to Put New Code

| What you're adding | Where it goes |
|--------------------|---------------|
| New Zitadel API call | `services/zitadel/api/requests/<resource>.ts` |
| New gRPC call | `services/grpc/` |
| New shadcn component | `shared/ui/` (run `bunx shadcn add <component>`, then move) |
| New utility function | `shared/lib/utils.ts` or a new file in `shared/lib/` |
| New env variable | `shared/config/env.ts` (add to server or client schema) |
| New business type or Zod schema | `domain/<feature>/types.ts` and `domain/<feature>/schema.ts` |
| New login/auth UI | `app/(home)/(auth)/login/_components/` + actions in `app/(home)/(auth)/login/` |
| New profile/settings UI | `app/(home)/(details)/profile/<section>/` |
| Page-level server action | Co-locate with the page in `app/` — not in services/ |
| Feature store (zustand) | Co-locate with the feature in `app/` if small, or `app/<feature>/store.ts` |

## Rules

### Routing
Pages in `app/` are thin routing shells. No business logic, no direct API calls, no large JSX trees. Extract to `_components/` inside the page directory.

### Imports — layer boundaries
```
app/        → can import from services/, shared/, domain/
services/   → can import from shared/, domain/
shared/     → can import from domain/ only
domain/     → no internal imports
```
Never import upward (services must not import from app/).

### Server vs Client components
Default to server components. Add `"use client"` only for:
- Event handlers (onClick, onChange, onSubmit)
- React hooks (useState, useEffect, etc.)
- Browser-only APIs

### Forms
Always: `react-hook-form` + `zod` resolver + Russian locale error messages.

### State
Use zustand for cross-component state. Co-locate store with the feature that owns it.

---

## Design System Rules

### STRICT: Only use semantic color tokens

All colors MUST come from CSS variables defined in `app/globals.css`. Never use raw Tailwind colors (red-500, emerald-400, gray-300, etc.) or hardcoded hex/rgb/hsl/oklch values in components.

**Allowed (semantic tokens):**
```
bg-background, text-foreground
bg-card, text-card-foreground
bg-primary, text-primary-foreground
bg-secondary, text-secondary-foreground
bg-muted, text-muted-foreground
bg-accent, text-accent-foreground
bg-destructive, text-destructive-foreground
bg-warning, text-warning-foreground
border-border, border-input, ring-ring
bg-brand-telegram, bg-brand-max
```

**Forbidden in components:**
```
text-red-500, bg-emerald-400, text-amber-500, bg-gray-300  (raw Tailwind palette)
text-[#76c446], bg-[#ff0000]                               (arbitrary hex)
style={{ color: 'red' }}                                   (inline colors)
```

**Why:** Raw colors break dark mode, prevent centralized theme changes, and create visual inconsistency. All color decisions live in `globals.css` `:root` and `.dark` selectors.

### When you need a new color

If a design requires a color that doesn't exist as a semantic token:
1. Add the token to `:root` and `.dark` in `app/globals.css`
2. Expose it via `@theme` block (e.g., `--color-success: var(--success)`)
3. Use the new token in components (`text-success`)

Never bypass this by hardcoding.

### Known violations to fix

These files currently have hardcoded colors that should be replaced with theme tokens:
- `app/(home)/(auth)/login/_components/qr-code-card.tsx` — `text-[#76c446]` → `text-primary`, `fgColor="#2b3a15"` → use CSS var
- `app/(home)/(details)/profile/details/_components/profile-form.tsx` — `text-amber-500` → `text-warning`, `text-emerald-500` → `text-primary`
- `app/(home)/(details)/profile/security/security-view.tsx` — `bg-emerald-500/10`, `text-emerald-600`, `dark:text-emerald-400`, `border-emerald-500/20` → add `--success` token to globals.css
- `app/(home)/(details)/profile/security/_components/sessions-list.tsx` — `text-emerald-500` → `text-primary` or `text-success`
- `shared/ui/skeleton.tsx` — `bg-gray-500/10` → `bg-muted`

### Color token reference

| Token | Light | Dark | Use for |
|-------|-------|------|---------|
| `primary` | green oklch(0.696) | green oklch(0.62) | Main actions, links, active states |
| `secondary` | light green | dark gray | Secondary actions, subtle backgrounds |
| `muted` | gray-100 | dark gray | Disabled states, placeholders |
| `accent` | light green | dark gray | Hover backgrounds, highlights |
| `destructive` | red | red | Errors, delete actions |
| `warning` | orange | orange | Warnings, pending states |
| `border` | gray-200 | dark border | All borders |
| `brand-telegram` | blue | blue | Telegram-specific UI |
| `brand-max` | purple | purple | MAX ID-specific UI |

### Gradients

Use CSS variable gradients, not inline values:
```
bg-gradient-telegram  (uses --telegram-gradient)
bg-gradient-max       (uses --max-gradient)
```

### Radius

Use theme radius tokens: `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-2xl`, `rounded-3xl`. Don't hardcode pixel values.

---

## Component Patterns

### Imports
```typescript
import { Button } from "@/shared/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { cn } from "@/shared/lib/utils"
import { env } from "@/shared/config/env"
```

### Button variants
Available: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`, `icon`, `telegram`, `max`

### Code style
- Russian locale for Zod validation messages
- Comments in Russian are acceptable
- Use `cn()` from `@/shared/lib/utils` for conditional class merging
- Prefer server components; use `"use client"` only when needed
- API routes in `app/api/` directory
