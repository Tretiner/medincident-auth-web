import { toast } from "sonner";
import { GenericError } from "@/domain/error";

export function showErrorMessage(error: GenericError | string | Error) {
  let title = "Ошибка";
  let description = "Что-то пошло не так";

  if (typeof error === "string") {
    description = error;
  } else if (error instanceof Error) {
    description = error.message;
  } else {
    // Обработка GenericError из вашего domain
    switch (error.type) {
      case "NETWORK_ERROR":
        title = "Ошибка сети";
        description = "Проверьте подключение к интернету";
        break;
      case "VALIDATION_ERROR":
        title = "Ошибка данных";
        description = error.message || "Получены некорректные данные";
        break;
      case "API_ERROR":
      default:
        title = "Ошибка сервера";
        description = error.message;
        break;
    }
  }

  toast.error(title, {
    description,
    duration: 4000,
  });
}