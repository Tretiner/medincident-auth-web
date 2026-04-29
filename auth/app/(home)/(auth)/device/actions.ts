"use server";

import { redirect } from "next/navigation";
import {
  approveDeviceAuthorization,
  getDeviceAuthorization,
} from "@/services/zitadel/api";
import { getSessionCookieById } from "@/services/zitadel/cookies";
import { requireValidSession } from "@/services/zitadel/session";

export async function approveDeviceAction(userCode: string): Promise<void> {
  if (!userCode || userCode.length > 32) {
    throw new Error("Неверный код устройства");
  }

  const { currentSessionId } = await requireValidSession();

  const sessionCookie = await getSessionCookieById({ sessionId: currentSessionId });
  if (!sessionCookie?.token) {
    throw new Error("Не найдена сессия");
  }

  const deviceAuthRes = await getDeviceAuthorization(userCode);
  if (!deviceAuthRes.success || !deviceAuthRes.data?.deviceAuthorizationRequest?.id) {
    throw new Error("QR-код недействителен или истёк");
  }

  const deviceAuthId = deviceAuthRes.data.deviceAuthorizationRequest.id;

  const approveRes = await approveDeviceAuthorization(
    deviceAuthId,
    currentSessionId,
    sessionCookie.token,
  );
  if (!approveRes.success) {
    throw new Error("Не удалось подтвердить вход");
  }

  redirect("/device/success");
}

export async function denyDeviceAction(): Promise<void> {
  // Zitadel не предоставляет явного endpoint'а отклонения Device Flow;
  // Device A всё равно получит `access_denied` / `expired_token` через polling,
  // если просто не подтвердить. Редиректим юзера обратно в профиль.
  redirect("/profile");
}
