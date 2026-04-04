"use server";

import { redirect } from "next/navigation";
import { getQrEntry } from "@/services/zitadel/qr-store";
import { requireValidSession } from "@/services/zitadel/session";
import { getDeviceAuthorization, approveDeviceAuthorization } from "@/services/zitadel/api";
import { getSessionCookieById } from "@/services/zitadel/cookies";

export async function confirmQrAction(userCode: string) {
  const entry = getQrEntry(userCode);
  if (!entry || entry.status !== "pending") {
    throw new Error("QR-код недействителен или истёк");
  }

  // Device B должен быть залогинен
  const { currentSessionId } = await requireValidSession();

  // Берём sessionToken из cookie Device B
  const sessionCookie = await getSessionCookieById({ sessionId: currentSessionId });
  if (!sessionCookie?.token) {
    throw new Error("Не найдена сессия Device B");
  }

  // Получаем device authorization request по user_code
  const deviceAuthRes = await getDeviceAuthorization(userCode);
  if (!deviceAuthRes.success || !deviceAuthRes.data?.deviceAuthorizationRequest?.id) {
    throw new Error("Не удалось получить информацию о QR-запросе");
  }

  const deviceAuthId = deviceAuthRes.data.deviceAuthorizationRequest.id;

  // Одобряем: машинный юзер вызывает API, передавая сессию Device B
  const approveRes = await approveDeviceAuthorization(
    deviceAuthId,
    currentSessionId,
    sessionCookie.token
  );
  if (!approveRes.success) {
    throw new Error("Не удалось подтвердить вход");
  }

  redirect("/profile");
}
