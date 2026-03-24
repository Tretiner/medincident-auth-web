import { redirect } from "next/navigation";
import { getCurrentSessionId, removeCurrentSessionId } from "./zitadel-current-session";

const ZITADEL_API_URL = process.env.ZITADEL_API_URL || process.env.NEXT_PUBLIC_AUTH_URL;
const ZITADEL_TOKEN = process.env.ZITADEL_API_TOKEN;

export async function requireValidSession() {
  const currentSessionId = await getCurrentSessionId();

  if (!currentSessionId) {
    redirect("/"); 
  }

  let isAlive = false;
  let data = null;

  try {
    const res = await fetch(`${ZITADEL_API_URL}/v2/sessions/${currentSessionId}`, {
      headers: {
        "Authorization": `Bearer ${ZITADEL_TOKEN}`,
        "Content-Type": "application/json",
      },
      cache: "no-store", 
    });

    if (res.ok) {
      isAlive = true;
      data = await res.json();
    }
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