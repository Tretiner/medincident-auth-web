import { redirect } from "next/navigation";
import { retrieveIdpIntent } from "@/services/zitadel/api";
import { setIdpIntentCookie } from "../../_lib/reg-flow";
import { handleLoginAction } from "./actions";

export default async function CallbackSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ requestId?: string; id?: string; token?: string; userId?: string; user?: string }>;
}) {
  const params = await searchParams;
  const { requestId } = params;
  const id = params.id as string;
  const token = params.token as string;
  const userId = params.userId ?? params.user;

  if (!params.id || !params.token) {
    redirect("/login");
  }

  // Пользователь уже привязан — создаём сессию автоматически
  if (userId) {
    await handleLoginAction(userId, id, token, requestId);
    return null;
  }

  // Новый пользователь — получаем данные провайдера и сохраняем в cookie
  const intentRes = await retrieveIdpIntent(id, { idpIntentToken: token });

  if (!intentRes.success) {
    const failParams = new URLSearchParams({ error: "Не удалось получить данные провайдера" });
    if (requestId) failParams.set("requestId", requestId);
    redirect(`/login/callback/failure?${failParams}`);
  }

  await setIdpIntentCookie({
    intentId: id,
    intentToken: token,
    idpInformation: (intentRes as { success: true; data: any }).data?.idpInformation,
    requestId,
  });

  const regParams = new URLSearchParams({ source: "idp" });
  if (requestId) regParams.set("requestId", requestId);
  redirect(`/login/register?${regParams}`);
}
