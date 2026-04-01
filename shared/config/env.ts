import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const envConfig = createEnv({
  server: {
    // Secrets
    ZITADEL_API_URL: z.url(),
    ZITADEL_SECRET: z.string().min(32),
    ZITADEL_MACHINE_KEY_PATH: z.string(),
    ZITADEL_ORG_ID: z.string().min(1),

    APP_URL: z.url(),
    APP_CLIENT_ID: z.string(),
    API_URL: z.url(),
    GRPC_API_URL: z.string(),

    // Default
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().default(3000),
  },

  runtimeEnv: {
    ZITADEL_API_URL: process.env.ZITADEL_API_URL,
    ZITADEL_SECRET: process.env.ZITADEL_SECRET,
    ZITADEL_MACHINE_KEY_PATH: process.env.ZITADEL_MACHINE_KEY_PATH,
    ZITADEL_ORG_ID: process.env.ZITADEL_ORG_ID,

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
