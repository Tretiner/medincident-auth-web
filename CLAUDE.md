# Auth UI — MedIncident

Custom login/profile UI for self-hosted Zitadel IAM. Replaces default Zitadel UI, provides profile management. Integrates via JWT assertion (RS256), OIDC login flows, gRPC to MedIncident backend.

## Stack

Next.js 16 (App Router, Turbopack), Bun, TypeScript (strict), Tailwind CSS v4, shadcn/ui (new-york), Zitadel, NextAuth.js v5, react-hook-form + Zod, zustand, nice-grpc.

## Project Structure

```
app/                         — routing shells only, max ~10 lines per page
  (home)/(auth)/login/       — login flow pages + server actions
  (home)/(details)/profile/  — profile, security pages + server actions
  api/auth/[...nextauth]/    — NextAuth.js route handler
  api/health/                — health check
services/                    — external integrations
  zitadel/api/requests/      — per-resource API (users, sessions, auth, idps, links)
  zitadel/user/auth.ts       — NextAuth.js config + Zitadel provider
  zitadel/session.ts         — server-side session validation
  zitadel/cookies.ts         — HttpOnly session cookie management
  zitadel/current-session.ts — current session ID tracking
  zitadel/helpers.ts         — timestamp utilities
  grpc/client.ts             — nice-grpc channel config
shared/                      — cross-cutting, zero business logic
  ui/                        — shadcn/ui components (button, card, input, dialog…)
  lib/utils.ts               — cn(), delay()
  lib/constants.ts           — APP_NAME
  lib/fetch-helper.ts        — typed fetch wrapper + Zod validation
  lib/ui-error-handler.ts    — toast error display
  lib/user-agent.ts          — browser/OS parser
  config/env.ts              — @t3-oss/env-nextjs schema
domain/                      — business types + Zod schemas, no side effects
  auth/                      — TelegramUser, AuthResponse, JwtUser, QrData
  profile/                   — User, PersonalInfo, UserSession, SecurityData
  consent/                   — consent flow schemas
  error.ts                   — Result<T> discriminated union
lib/generated/               — auto-generated protobuf (buf generate) — DO NOT EDIT
components/icons.tsx         — AppLogoIcon, TelegramLogoIcon, MaxLogoIcon
```

## Where to Put New Code

| What | Where |
|------|-------|
| Zitadel API call | `services/zitadel/api/requests/<resource>.ts` |
| gRPC call | `services/grpc/` |
| shadcn component | `shared/ui/` via `bunx shadcn add <name>` |
| Utility function | `shared/lib/` |
| Env variable | `shared/config/env.ts` (server or client schema) |
| Business type / Zod schema | `domain/<feature>/types.ts` + `schema.ts` |
| Login/auth UI | `app/(home)/(auth)/login/_components/` |
| Profile/settings UI | `app/(home)/(details)/profile/<section>/` |
| Server action | co-locate with page in `app/`, not in `services/` |
| Zustand store | co-locate with feature in `app/` |

---

## Rules

### Architecture

**Import boundaries — strict:**
```
app/        → services/, shared/, domain/
services/   → shared/, domain/
shared/     → domain/
domain/     → nothing
```
Upward imports are forbidden. `services/` must never import from `app/`.

**Pages** — thin routing shells. No business logic, no direct API calls. Extract everything into `_components/` inside the page directory.

**Server vs Client** — server components by default. Add `"use client"` only for: event handlers, React hooks, browser APIs.

**Server Actions vs Route Handlers** — prefer Server Actions. Use Route Handlers only when a Server Action cannot work: webhooks, OAuth callbacks, streaming responses, or external services that require a stable URL. Never use a Route Handler just to set cookies or call an API — a Server Action does both without an extra HTTP round-trip.

**Forms** — always `react-hook-form` + `zod` resolver + Russian locale error messages.

**State** — zustand for cross-component state. Co-locate store with the feature that owns it.

---

## Styles

All colors are CSS variables in OKLCH, defined in `app/globals.css`. Light/dark mode via `:root` / `.dark` selectors.

### Color Tokens

| Token | Purpose | Usage example |
|-------|---------|---------------|
| `primary` | main actions, links, active states | `bg-primary text-primary-foreground` |
| `secondary` | secondary actions, subtle backgrounds | `bg-secondary text-secondary-foreground` |
| `muted` | disabled elements, placeholders | `text-muted-foreground bg-muted` |
| `accent` | hover backgrounds, highlights | `hover:bg-accent` |
| `destructive` | errors, delete actions | `text-destructive bg-destructive/10` |
| `warning` | warnings, pending states | `text-warning` |
| `success` | success states, verified status | `text-success bg-success/10` |
| `border` | all borders | `border-border` |
| `brand-telegram` | Telegram UI | `text-brand-telegram` |
| `brand-max` | MAX ID UI | `text-brand-max` |

Every token supports `bg-*`, `text-*`, `border-*` + a `*-foreground` pair for text on top.

### Gradients

```tsx
// In className
className="bg-gradient-telegram"   // var(--telegram-gradient)
className="bg-gradient-max"        // var(--max-gradient)

// In component configs
className="bg-[image:var(--telegram-gradient)]"
```

### Text Sizes

| Class | Size | When to use |
|-------|------|-------------|
| `text-3xs` | 10px/14px | badges, status labels |
| `text-2xs` | 11px/16px | validation errors, small captions |
| `text-xs` | 12px/16px | standard small text |

### Custom Utilities

| Class | Expands to | When to use |
|-------|-----------|-------------|
| `section-label` | `text-sm font-medium text-muted-foreground uppercase tracking-wider ml-1` | section headings |
| `scrollbar-app` | custom thin scrollbar + `scrollbar-gutter: stable` | scrollable containers |
| `container` | centered container + responsive padding | page wrappers |

### Border Radius

`rounded-sm` / `rounded-md` / `rounded-lg` / `rounded-xl` / `rounded-2xl` / `rounded-3xl`. Hardcoded pixel values are forbidden.

### Adding a New Color

1. Add CSS variable to `:root` and `.dark` in `app/globals.css`
2. Expose in `@theme` block: `--color-<name>: var(--<name>)`
3. Use in components: `text-<name>`, `bg-<name>`

---

## Components

### shadcn/ui — `shared/ui/`

Style: new-york. Install: `bunx shadcn add <component>`.

`Button`, `Card`, `Input`, `Label`, `Dialog`, `Avatar`, `Separator`, `Skeleton`, `Sonner` (toasts).

### Icons

- **Custom SVGs** in `components/icons.tsx`: `AppLogoIcon`, `TelegramLogoIcon`, `MaxLogoIcon`
- **Lucide React** (`lucide-react`) — primary icon library

### Button

Variants: `default` · `destructive` · `outline` · `secondary` · `ghost` · `link` · `icon` · `telegram` · `max`

Sizes: `default`(h-9) · `sm`(h-8) · `md`(h-10) · `lg`(h-10 px-8) · `icon`(h-9 w-9)

**Already in base — do NOT duplicate:**

| Base style | Consequence |
|-----------|-------------|
| `shadow-none` | never add `shadow-none` in className |
| `transition-all` | never add `transition-all` / `transition-colors` |
| `[&_svg]:size-4` | never add `w-4 h-4` / `size-4` to icons inside buttons |
| `[&_svg]:size-6` (telegram/max/icon) | never size icons inside these variants |

```tsx
// YES
<Button variant="ghost" size="icon"><LogOut /></Button>
<Button><Loader2 className="mr-2 animate-spin" />Saving</Button>

// NO
<Button className="shadow-none transition-all"><LogOut className="w-4 h-4" /></Button>
```

### Card

**In base:** `shadow-none`, `border border-border`, `bg-card`, `text-card-foreground`. Do not duplicate.

```tsx
// YES
<Card className="rounded-xl p-4">

// NO
<Card className="shadow-none border border-border bg-card">
```

### Input

**In base:** `shadow-none`. Error state via `cn()`:

```tsx
<Input className={cn(errors.field && "border-destructive focus-visible:ring-destructive")} />
```

### Configurable Components (providers)

Styles live in a config object as Tailwind classes, applied via `cn()`:

```tsx
// YES — class in config
const PROVIDERS = {
  telegram: { icon: TelegramLogoIcon, activeClass: "bg-[image:var(--telegram-gradient)]" },
  max:      { icon: MaxLogoIcon,      activeClass: "bg-[image:var(--max-gradient)]" },
};
<div className={cn("base", isActive && config.activeClass)} />

// NO — inline style
<div style={{ background: config.gradient }} />
```

---

## Checklist Before Writing Styles

Verify every point when writing or reviewing className:

1. **Color from a token?** — `text-primary`, not `text-green-500` / `text-[#hex]` / `style={{ color }}`
2. **Gradient via class?** — `bg-gradient-telegram` / `bg-[image:var(--…)]`, not `style={{ background }}`
3. **Not duplicating component base?** — check `shadow-none`, `transition-*`, `[&_svg]:size-*` in `shared/ui/` source
4. **Text size from the palette?** — `text-3xs` / `text-2xs` / `text-xs` / `text-sm`, not `text-[10px]`
5. **No conflicts?** — never put `h-full h-fit`, `bg-white bg-background`, two `transition-*` on one element
6. **Repeated 3+ times?** — extract to `@utility` in `globals.css`
7. **Conditional classes via `cn()`?** — never concatenate with template literals
8. **Radius from tokens?** — `rounded-xl`, not `rounded-[12px]`
9. **Icons inside Button without size?** — size is inherited from button base

---

## Code Style

- Comments in Russian are acceptable
- Zod errors use Russian locale
- `cn()` from `@/shared/lib/utils` is the only way to merge classes
- Server components by default; `"use client"` only when necessary
- API routes go in `app/api/`

### Imports

```typescript
import { Button } from "@/shared/ui/button"
import { Card, CardContent } from "@/shared/ui/card"
import { cn } from "@/shared/lib/utils"
import { env } from "@/shared/config/env"
```
