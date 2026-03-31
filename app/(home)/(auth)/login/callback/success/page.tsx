import { redirect } from "next/navigation";
import { retrieveIdpIntent } from "@/services/zitadel/api";
import { handleLoginAction } from "./actions";

export default async function CallbackSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ requestId?: string; id?: string; token?: string; userId?: string; user?: string }>;
}) {
  const { requestId, id, token, userId: queryUserId, user } = await searchParams;

  if (!id || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <h1 className="text-xl text-destructive font-bold">Отсутствуют id или token</h1>
      </div>
    );
  }

  const userId = queryUserId || user;
  if (!userId){
    redirect(`/login/register?id=${id}&token=${token}${requestId ? `&requestId=${requestId}` : ""}`);
    return;
  }

  const response = await retrieveIdpIntent(userId, { idpIntentToken: token!!});
  if (!response || !response.success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <h1 className="text-xl text-destructive font-bold">Не удалось получить информацию из внешнего провайдера</h1>
      </div>
    );
  }

  await handleLoginAction(userId, id!!, token!!, requestId);
  return null;
}
