import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const zitadelId = () => z.string().regex(/^\d+$/, "должен быть числовой Zitadel ID");

const envConfig = createEnv({
  server: {
    // Zitadel core
    ZITADEL_API_URL: z.url().default("http://localhost:8080"),
    ZITADEL_SECRET: z.string().min(32).default("placeholder_secret_at_least_32_chars_long"),
    ZITADEL_MACHINE_KEY_PATH: z.string().default("/app/secrets/key.json"),
    ZITADEL_ORG_ID: z.string().min(1).default("123456789"),
    ZITADEL_PROJECT_ID: zitadelId().default("123456789"),

    // App
    APP_URL: z.url().default("http://localhost"),
    APP_CLIENT_ID: z.string().default("placeholder-client-id"),
    API_URL: z.url().default("http://localhost"),
    GRPC_API_URL: z.string().default("localhost:8080"), // legacy

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

    APP_URL: process.env.APP_URL,
    APP_CLIENT_ID: process.env.APP_CLIENT_ID,
    API_URL: process.env.API_URL,
    GRPC_API_URL: process.env.GRPC_API_URL,

    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
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
