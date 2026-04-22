import { redirect } from "next/navigation";

// Zitadel RP-Initiated Logout (/oidc/v1/end_session) в итоге приводит
// сюда — иногда напрямую (как зарегистрированный post_logout_redirect_uri),
// иногда через v2-hosted logout UI, который редиректит на этот же URL.
// Единственная роль страницы — быстро увести пользователя на /login.
// URL должен быть зарегистрирован в Post Logout URIs приложения в Zitadel
// (custom_ui_service) как https://{APP_URL}/logout.
// Также Traefik-роутер custom-ui должен пропускать PathPrefix(`/logout`)
// — см. docker-compose.yml.
export default function LogoutPage(): never {
  redirect("/login");
}
