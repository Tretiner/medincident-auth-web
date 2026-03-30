import { Result } from "@/domain/error";
import z from "zod";

const ServerErrorSchema = z.object({
  domain: z.string().optional(),
  message: z.string(),
  traceId: z.string().optional(),
});


export async function handleFetch<T>(
  request: () => Promise<Response>,
  schema: z.Schema<T>,
): Promise<Result<T>> {
  try {
    const response = await request();

    // Обработка ошибок (4xx, 5xx)
    if (!response.ok) {
      let errorMessage = "Ошибка сервера";
      let errorCode: string | number = response.status;

      console.error(`[API Error] Full body: ${await response.text()}`);

      try {
        const rawBody = await response.json();
        const parsedError = ServerErrorSchema.safeParse(rawBody);

        if (parsedError.success) {
          errorMessage = parsedError.data.message;
          errorCode = parsedError.data.domain || response.status;
          if (parsedError.data.traceId) {
            console.error(`[API Error] TraceID: ${parsedError.data.traceId}`);
          }
        } else {
          errorMessage = (rawBody as any).message || JSON.stringify(rawBody);
        }
      } catch {
        try {
          const textBody = await response.text();
          if (textBody) errorMessage = textBody;
        } catch {
          errorMessage = response.statusText;
        }
      }

      return {
        success: false,
        error: {
          type: "API_ERROR",
          code: errorCode,
          message: errorMessage,
        },
      };
    }

    const rawData = await response.json();
    console.log("RESPONSE:" + "\n" + JSON.stringify(rawData).toString());
    const parseResult = schema.safeParse(rawData);

    if (!parseResult.success) {
      console.error("Zod Validation Failed:", parseResult.error);
      return {
        success: false,
        error: {
          type: "VALIDATION_ERROR",
          message: "Некорректный ответ от сервера",
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
