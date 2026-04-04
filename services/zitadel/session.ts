import { redirect } from "next/navigation";
import { getCurrentSessionId, removeCurrentSessionId } from "./current-session";
import { zitadelApi } from "./api/client";

export async function getOptionalSession(): Promise<{
  currentSessionId: string;
  userId: string;
  sessionData: any;
} | null> {
  const currentSessionId = await getCurrentSessionId();
  if (!currentSessionId) return null;

  try {
    const res = await zitadelApi.get(`/v2/sessions/${currentSessionId}`);
    if (!res.data?.session?.factors?.user?.id) return null;
    return {
      currentSessionId,
      userId: res.data.session.factors.user.id,
      sessionData: res.data.session,
    };
  } catch {
    return null;
  }
}

export async function requireValidSession() {
  const currentSessionId = await getCurrentSessionId();
  if (!currentSessionId) {
    redirect("/");
  }

  let isAlive = false;
  let data: any = null;

  try {
    const res = await zitadelApi.get(`/v2/sessions/${currentSessionId}`);
    isAlive = true;
    data = res.data;
  } catch (error) {
    console.error("Failed to verify session in Zitadel:", error);
  }

  if (!isAlive || !data?.session?.factors?.user?.id) {
    await removeCurrentSessionId();
    redirect("/");
  }

  return {
    currentSessionId,
    userId: data.session.factors.user.id,
    sessionData: data.session,
  };
}
