import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/config/env";
import { telegramUserSchema } from "@/app/(home)/(auth)/login/_components/telegram-widget";
import { loginWithTelegram, loginWithTelegramMock } from "@/services/server-http-client";
import { createSession } from "@/services/session/session-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // 1. Валидация входных данных
    const parseResult = telegramUserSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { message: "Некорректные данные Telegram" },
        { status: 400 }
      );
    }

    const user = parseResult.data;

    // 2. Вызов сервиса авторизации (или мока)
    let apiResult;
    if (env.isDev) {
      apiResult = await loginWithTelegramMock();
    } else {
      apiResult = await loginWithTelegram(user);
    }

    // 3. Обработка ошибок API
    if (!apiResult.success) {
      console.error(`Login Failed: [${apiResult.error.type}] ${apiResult.error.message}`);
      
      let status = 500;
      let uiMessage = "Ошибка авторизации";

      if (apiResult.error.type === "NETWORK_ERROR") {
        uiMessage = "Проблемы с сетью";
        status = 503;
      }
      if (apiResult.error.code === 401) {
        uiMessage = "Пользователь не найден или данные устарели";
        status = 401;
      }

      return NextResponse.json({ message: uiMessage }, { status });
    }

    // 4. Создание сессии (установка cookies)
    const result = apiResult.data;
    await createSession(
      result.UserID,
      result.AccessToken,
      result.AccessExpiresAt,
      result.RefreshToken,
      result.RefreshExpiresAt
    );

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json(
      { message: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}