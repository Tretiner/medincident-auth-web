import { toast } from "sonner";
import { GenericError } from "@/domain/error";

const ERROR_MESSAGES: Record<string, string> = {
  NETWORK_ERROR: "Нет связи с сервером. Проверьте интернет.",
  AUTH_FAILED: "Неверные данные или сессия истекла.",
  USER_BANNED: "Доступ заблокирован.",
  TOO_MANY_REQUESTS: "Слишком много попыток. Подождите минуту.",
  PROVIDER_ERROR: "Ошибка на стороне сервиса авторизации.",
};

export function getErrorMessageByName(name: string): string {
  return ERROR_MESSAGES[name];
}

export function showErrorMessage(error: GenericError | string | Error) {
  let title = "Ошибка";
  let description = "Что-то пошло не так";

  if (typeof error === "string") {
    description = error;
  } else if (error instanceof Error) {
    description = error.message;
  } else {
    if (error.code && ERROR_MESSAGES[error.code]) {
      description = ERROR_MESSAGES[error.code];
    } else if (ERROR_MESSAGES[error.type]) {
      description = ERROR_MESSAGES[error.type];
    } else {
      description = error.message || description;
    }

    if (error.type === "NETWORK_ERROR") title = "Сбой соединения";
  }

  toast.error(title, {
    description,
    duration: 4000,
    action:
      description.includes("интернет") ?
        {
          label: "Обновить",
          onClick: () => window.location.reload(),
        }
      : undefined,
  });
}
