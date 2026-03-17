"use server";

import { redirect } from "next/navigation";
import { getZitadelIdps, startIdpIntent } from "@/lib/zitadel/zitadel-api";
import { env } from "@/config/env";

export async function fetchProvidersAction() {
  const response = await getZitadelIdps();
  console.log("Полученные провайдеры:", JSON.stringify(response));
  
  if (!response.success) {
    console.error("Ошибка при получении провайдеров:", response.error);
    return [];
  }
  
  return response.data.identityProviders || [];
}

export async function loginWithProviderAction(idpId: string) {
  const response = await startIdpIntent({
    idpId,
    urls: {
      successUrl: `${env.APP_URL}/login/callback/success`,
      failureUrl: `${env.APP_URL}/login/callback/failure`,
    },
  });
  console.log("СТАРТ ПРОВАЙДЕРА:", JSON.stringify(response));

  if (!response.success) {
    console.error("Ошибка при инициализации IDP Intent:", response.error);
    throw new Error("Не удалось запустить авторизацию");
  }

  redirect(response.data.authUrl);
}