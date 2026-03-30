"use server";

import { env } from "@/shared/config/env";
import { cookies } from "next/headers";

const CURRENT_SESSION_COOKIE_NAME = "zitadel_current_session";

export async function setCurrentSessionId(sessionId: string) {
  const cookiesList = await cookies();

  cookiesList.set({
    name: CURRENT_SESSION_COOKIE_NAME,
    value: sessionId,
    httpOnly: true,
    secure: env.isProd,
    path: "/",
    sameSite: "lax",
  });
}

export async function getCurrentSessionId(): Promise<string | undefined> {
  const cookiesList = await cookies();
  const sessionCookie = cookiesList.get(CURRENT_SESSION_COOKIE_NAME);
  return sessionCookie?.value;
}

export async function removeCurrentSessionId() {
  const cookiesList = await cookies();
  cookiesList.delete(CURRENT_SESSION_COOKIE_NAME);
}
