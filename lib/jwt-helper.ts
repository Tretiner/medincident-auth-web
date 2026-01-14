"server only"

import { JWTPayload, jwtVerify } from "jose";
import { SignJWT } from "jose/jwt/sign";

export async function signJwt(
  key: string,
  expirationTime: string = "7d",
  payload?: JWTPayload | undefined
) {
  const secretKey = new TextEncoder().encode(key);
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expirationTime)
    .sign(secretKey);
}

export async function verifyJwt<JwtPayload extends JWTPayload>(
  token: string,
  key: string
): Promise<JwtPayload | null> {
  try {
    const secretKey = new TextEncoder().encode(key);
    const { payload } = await jwtVerify<JwtPayload>(token, secretKey, {
      algorithms: ["HS256"],
    });

    return payload;
  } catch (err) {
    console.error("Token verification failed:", err);
    return null;
  }
}
