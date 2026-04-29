"server only";

import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";
import { env } from "@/shared/config/env";

// Zitadel JWKS для валидации id_token из Device Flow.
// jose кэширует ключи автоматически (5 мин cooldown).

let jwksPromise: ReturnType<typeof createRemoteJWKSet> | null = null;
function getJwks() {
  if (!jwksPromise) {
    jwksPromise = createRemoteJWKSet(new URL(`${env.ZITADEL_API_URL}/oauth/v2/keys`));
  }
  return jwksPromise;
}

export interface VerifiedIdToken extends JWTPayload {
  sub: string;
}

// Валидирует подпись id_token, issuer и audience.
// RFC 8628 Device Flow не передаёт nonce в id_token, поэтому nonce-binding
// делается отдельно (через zdc_ctx ↔ zdc_tokens cookies).
export async function verifyIdToken(idToken: string): Promise<VerifiedIdToken> {
  const jwks = getJwks();

  const { payload } = await jwtVerify(idToken, jwks, {
    issuer: env.ZITADEL_API_URL,
    audience: env.APP_CLIENT_ID,
  });

  if (!payload.sub) {
    throw new Error("id_token без sub");
  }

  return payload as VerifiedIdToken;
}
