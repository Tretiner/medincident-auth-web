import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

// Числовые Zitadel ID (snowflake-style, обычно 18 цифр)
const zitadelId = () => z.string().regex(/^\d+$/, "должен быть числовой Zitadel ID");

// JSON-массив IDP: ZITADEL_IDPS='[{"provider":"telegram","id":"123"},{"provider":"max","id":"456"}]'
// Провайдеры полностью определяются содержимым переменной — whitelist = env.
// Парсится из env-строки через preprocess и валидируется Zod'ом.
const zitadelIdpsSchema = z.preprocess(
  (val) => {
    if (typeof val !== "string" || val.trim() === "") return val;
    try {
      return JSON.parse(val);
    } catch {
      // Возвращаем как есть — Zod даст понятную ошибку валидации
      return val;
    }
  },
  z
    .array(
      z.object({
        provider: z.string().min(1, "provider не может быть пустым"),
        id: zitadelId(),
      }),
    )
    .superRefine((arr, ctx) => {
      const seen = new Set<string>();
      for (const { provider } of arr) {
        if (seen.has(provider)) {
          ctx.addIssue({
            code: "custom",
            message: `Дубликат провайдера в ZITADEL_IDPS: ${provider}`,
          });
        }
        seen.add(provider);
      }
    }),
);

export type ZitadelIdp = { provider: string; id: string };

const envConfig = createEnv({
  server: {
    // Zitadel core
    ZITADEL_API_URL: z.url(),
    ZITADEL_SECRET: z.string().min(32),
    ZITADEL_MACHINE_KEY_PATH: z.string(),
    ZITADEL_ORG_ID: z.string().min(1),
    ZITADEL_PROJECT_ID: zitadelId(),

    // Zitadel IDP links (для /api/profile/me/links).
    // JSON-массив: [{"provider":"telegram","id":"..."},{"provider":"max","id":"..."}]
    ZITADEL_IDPS: zitadelIdpsSchema,

    // App
    APP_URL: z.url(),
    APP_CLIENT_ID: z.string(),
    API_URL: z.url(),
    GRPC_API_URL: z.string(),

    // Runtime
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().default(3000),
  },

  runtimeEnv: {
    ZITADEL_API_URL: process.env.ZITADEL_API_URL,
    ZITADEL_SECRET: process.env.ZITADEL_SECRET,
    ZITADEL_MACHINE_KEY_PATH: process.env.ZITADEL_MACHINE_KEY_PATH,
    ZITADEL_ORG_ID: process.env.ZITADEL_ORG_ID,
    ZITADEL_PROJECT_ID: process.env.ZITADEL_PROJECT_ID,

    ZITADEL_IDPS: process.env.ZITADEL_IDPS,

    APP_URL: process.env.APP_URL,
    APP_CLIENT_ID: process.env.APP_CLIENT_ID,
    API_URL: process.env.API_URL,
    GRPC_API_URL: process.env.GRPC_API_URL,

    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
  },
});

// Удобный доступ к IDP по provider-ключу (O(1) lookup)
const idpMap: ReadonlyMap<string, string> = new Map(
  envConfig.ZITADEL_IDPS.map((i) => [i.provider, i.id]),
);

export const env = {
  ...envConfig,

  /** Получить Zitadel IDP ID по ключу провайдера. `undefined` если провайдер не сконфигурирован. */
  getIdpId(provider: string): string | undefined {
    return idpMap.get(provider);
  },

  /** Список ключей сконфигурированных провайдеров (в порядке объявления в ZITADEL_IDPS). */
  get idpProviders(): readonly string[] {
    return envConfig.ZITADEL_IDPS.map((i) => i.provider);
  },

  get isDev(): boolean {
    return envConfig.NODE_ENV === "development";
  },
  get isProd(): boolean {
    return envConfig.NODE_ENV === "production";
  },
};
