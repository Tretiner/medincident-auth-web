import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const envConfig = createEnv({
  server: {
    // Secrets
    SESSION_SECRET: z.string().min(32),
    TELEGRAM_BOT_TOKEN: z.string().min(1),
    REDIS_URL: z.url(),

    // Default
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().default(3000),
  },

  client: {
    NEXT_PUBLIC_EXTERNAL_API: z.url(),
    NEXT_PUBLIC_TELEGRAM_BOT_NAME: z.string().min(1),
  },

  runtimeEnv: {
    SESSION_SECRET: process.env.SESSION_SECRET,
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    REDIS_URL: process.env.REDIS_URL,
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    NEXT_PUBLIC_EXTERNAL_API: process.env.NEXT_PUBLIC_EXTERNAL_API,
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
