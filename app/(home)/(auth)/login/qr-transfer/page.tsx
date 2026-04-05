import { redirect } from "next/navigation";
import { consumeTransferToken } from "@/services/zitadel/transfer-store";
import { createSessionByUserId, getSession } from "@/services/zitadel/api";
import { addSessionToCookie } from "@/services/zitadel/cookies";

interface Props {
  searchParams: Promise<{ token?: string }>;
}

export default async function QrTransferPage({ searchParams }: Props) {
  const { token } = await searchParams;

  if (!token) {
    redirect("/login");
  }

  const userId = consumeTransferToken(token);
  if (!userId) {
    redirect("/login?error=qr_expired");
  }

  const sessionRes = await createSessionByUserId(userId);
  if (!sessionRes.success || !sessionRes.data?.sessionId || !sessionRes.data?.sessionToken) {
    redirect("/login?error=qr_expired");
  }

  const { sessionId, sessionToken } = sessionRes.data;

  const sessionDataRes = await getSession(sessionId);
  const session = sessionDataRes.success ? sessionDataRes.data?.session : undefined;
  const userFactors = session?.factors?.user || {};

  await addSessionToCookie({
    session: {
      id: sessionId,
      token: sessionToken,
      creationTs: new Date(session?.creationDate || Date.now()).getTime().toString(),
      expirationTs: new Date(session?.expirationDate || Date.now() + 86400000).getTime().toString(),
      changeTs: new Date(session?.changeDate || Date.now()).getTime().toString(),
      loginName: userFactors.loginName || "unknown",
      organization: userFactors.organizationId || "",
    },
    cleanup: true,
  });

  console.log("[auth:qrTransfer] Сессия создана для userId=%s, sessionId=%s", userId, sessionId);

  redirect("/profile");
}
