import { z } from "zod";
import { ResultError, Result } from "@/domain/error";
import { AxiosError, AxiosResponse } from "axios";

export async function handleZitadelRequest<T>(
  requestFn: () => Promise<AxiosResponse<any>>,
  schema?: z.ZodSchema<T>
): Promise<Result<T>> {
try {
    const response = await requestFn();
    const data = response.data;

    if (schema) {
      const parsed = schema.safeParse(data);
      if (!parsed.success) {
        console.error("Ошибка валидации Zod:", parsed.error.format());
        return {
          success: false,
          error: {
            type: 'VALIDATION_ERROR',
            message: "Получен неверный формат данных от сервера",
            details: z.treeifyError(parsed.error),
          }
        };
      }
      return { success: true, data: parsed.data };
    }

    return { success: true, data: data as T };

  } catch (error: any) {
    if (error.isAxiosError) {
      const axiosError = error as AxiosError<any>;
      const status = axiosError.response?.status;
      const responseData = axiosError.response?.data;
      
      let errorType: ResultError['type'] = 'API_ERROR';
      
      if (!axiosError.response) {
        errorType = 'NETWORK_ERROR'; // Сервер не ответил или упал интернет
      } else if (status === 401 || status === 403) {
        errorType = 'AUTH_ERROR'; // Протух токен или нет прав
      } else if (responseData && responseData.code) {
        errorType = 'ZITADEL_ERROR'; // Специфичная ошибка ZITADEL (например, code: 9 "Intent has not succeeded")
      }

      const serverMessage = responseData?.message || axiosError.message;

      return {
        success: false,
        error: {
          type: errorType,
          message: serverMessage,
          code: status || axiosError.code,
          details: responseData?.details || responseData,
        }
      };
    }

    return {
      success: false,
      error: {
        type: 'ERROR',
        message: error.message || "Произошла неизвестная системная ошибка",
      }
    };
  }
}