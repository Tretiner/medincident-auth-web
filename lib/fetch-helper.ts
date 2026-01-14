import { Result } from "@/domain/error";
import z from "zod";

export async function handleFetch<T>(
  request: () => Promise<Response>,
  schema: z.Schema<T>
): Promise<Result<T>> {
  try {
    const response = await request();

    // 1. Обработка HTTP ошибок (4xx, 5xx)
    if (!response.ok) {
      let errorMessage = "Ошибка сервера";
      try {
        const errorBody = await response.text();
        errorMessage = errorBody || response.statusText;
      } catch {
        /* игнорируем, если тело не читается */
      }

      return {
        success: false,
        error: {
          type: "API_ERROR",
          code: response.status,
          message: errorMessage,
        },
      };
    }

    // 2. Парсинг успешного ответа
    const rawData = await response.json();
    const parseResult = schema.safeParse(rawData);

    if (!parseResult.success) {
      console.error("Zod Validation Failed:", parseResult.error);
      return {
        success: false,
        error: {
          type: "VALIDATION_ERROR",
          message: "Некорректный ответ от сервера авторизации",
        },
      };
    }

    return { success: true, data: parseResult.data };
  } catch (err) {
    console.error("Network Error:", err);
    return {
      success: false,
      error: {
        type: "NETWORK_ERROR",
        message: "Не удалось выполнить запрос. Проверьте соединение.",
      },
    };
  }
}
