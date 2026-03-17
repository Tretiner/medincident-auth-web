import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const envConfig = createEnv({
  server: {
    // Secrets
    SESSION_SECRET: z.string().min(32),
    TELEGRAM_BOT_TOKEN: z.string().min(1),
    APP_URL:   z.url(),

    ZITADEL_API_URL:   z.url(),
    ZITADEL_API_TOKEN: z.string().min(32),

    // Default
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().default(3000),
  },

  client: {
    NEXT_PUBLIC_AUTH_URL: z.string(),
    NEXT_PUBLIC_TELEGRAM_BOT_NAME: z.string().min(1),
  },

  runtimeEnv: {
    SESSION_SECRET: process.env.SESSION_SECRET,
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    APP_URL: process.env.APP_URL,
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    ZITADEL_API_URL: process.env.ZITADEL_API_URL,
    ZITADEL_API_TOKEN: process.env.ZITADEL_API_TOKEN,
    NEXT_PUBLIC_AUTH_URL: process.env.NEXT_PUBLIC_AUTH_URL,
    NEXT_PUBLIC_TELEGRAM_BOT_NAME: process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME,
  },
});

export const env = {
  ...envConfig,

  get isDev(): boolean {
    return envConfig.NODE_ENV === "development";
  },
  get isProd(): boolean {
    return envConfig.NODE_ENV === "production";
  },
};
