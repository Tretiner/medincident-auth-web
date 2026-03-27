import { redirect } from "next/navigation";
import { getCurrentSessionId, removeCurrentSessionId } from "./zitadel-current-session";
import { zitadelApi } from "./api/client";

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