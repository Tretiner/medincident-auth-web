"use server";

import { redirect } from "next/navigation";
import { getActiveIdps, startIdpIntent } from "@/lib/zitadel/zitadel-api";
import { env } from "@/config/env";

export async function fetchProvidersAction() {
  const response = await getActiveIdps();
  console.log("Полученные провайдеры:", JSON.stringify(response));
  
  if (!response.success) {
    console.error("Ошибка при получении провайдеров:", response.error);
    return [];
  }
  
  return response.data.identityProviders || [];
}

export async function loginWithProviderAction(idpId: string, requestId?: string) {
  const baseUrl = env.APP_URL;

  const successUrl = requestId 
    ? `${baseUrl}/login/callback/success?requestId=${requestId}` 
    : `${baseUrl}/login/callback/success`;

  const response = await startIdpIntent({
    idpId,
    urls: {
      successUrl: successUrl,
      failureUrl: `${baseUrl}/login/callback/failure`,
    },
  });

  if (!response.success || !response.data?.authUrl) {
    throw new Error("Не удалось запустить авторизацию");
  }

  redirect(response.data.authUrl);
}