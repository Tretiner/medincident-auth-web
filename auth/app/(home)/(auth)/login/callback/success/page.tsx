import { redirect } from "next/navigation";
import { retrieveIdpIntent } from "@/services/zitadel/api";
import { AutoActionForm } from "./_components/auto-action-form";
import { handleLoginAction, saveIdpIntentAndRedirectAction } from "./actions";

export default async function CallbackSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ requestId?: string; id?: string; token?: string; userId?: string; user?: string }>;
}) {
  const params = await searchParams;
  const id = params.id as string;
  const token = params.token as string;
  const requestId = params.requestId;
  const userId = params.userId ?? params.user;

  if (!id || !token) {
    redirect("/login");
  }

  // Пользователь уже привязан — создаём сессию через Server Action
  if (userId) {
    return (
      <AutoActionForm
        action={async (formData: FormData) => {
          "use server";
          await handleLoginAction(
            formData.get("userId") as string,
            formData.get("intentId") as string,
            formData.get("intentToken") as string,
            formData.get("requestId") as string | undefined || undefined,
          );
        }}
        fields={{ userId, intentId: id, intentToken: token, requestId }}
      />
    );
  }

  // Новый пользователь — читаем данные провайдера (чтение в Server Component допустимо)
  const intentRes = await retrieveIdpIntent(id, { idpIntentToken: token });

  if (!intentRes.success) {
    const failParams = new URLSearchParams({ error: "Не удалось получить данные провайдера" });
    if (requestId) failParams.set("requestId", requestId);
    redirect(`/login/callback/failure?${failParams}`);
  }

  const idpInformation = (intentRes as { success: true; data: any }).data?.idpInformation;

  return (
    <AutoActionForm
      action={saveIdpIntentAndRedirectAction}
      fields={{
        intentId: id,
        intentToken: token,
        requestId,
        idpInformation: idpInformation ? JSON.stringify(idpInformation) : undefined,
      }}
    />
  );
}
