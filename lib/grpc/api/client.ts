import { 
  createChannel, 
  createClientFactory, 
  ClientMiddlewareCall, 
  CallOptions 
} from 'nice-grpc';
import { Metadata } from 'nice-grpc-common';
import { env } from '@/config/env';
import { UserServiceDefinition } from '@/lib/generated/proto/medincident/v1/user';
import { getZitadelAccessToken } from '@/lib/zitadel/api/access-token';

async function* authMiddleware<Request, Response>(
  call: ClientMiddlewareCall<Request, Response>,
  options: CallOptions
) {
  try {
    const metadata = Metadata(options.metadata ?? {});
    metadata.set('authorization', `Bearer ${await getZitadelAccessToken()}`);
    console.log("bearer: " + await getZitadelAccessToken())
    
    options.metadata = metadata;
  } catch (error) {
    console.warn("⚠️ Не удалось прикрепить токен к gRPC запросу:", error);
  }

  return yield* call.next(call.request, options);
}

// --- 2. MIDDLEWARE ЛОГИРОВАНИЯ (Самый последний перед сетью) ---
async function* loggingMiddleware<Request, Response>(
  call: ClientMiddlewareCall<Request, Response>,
  options: CallOptions
) {
  const { path } = call.method; 
  
  // Извлекаем все метаданные (заголовки), включая те, что только что добавил authMiddleware
  // nice-grpc Metadata — это итерируемый объект, переводим его в обычный словарь для красивого лога
  const metadataArray = options.metadata ? Array.from(options.metadata) : [];
  const metadataRecord = Object.fromEntries(metadataArray);

  console.log(`\n[gRPC ➡️] ЗАПРОС: ${path}`);
  console.log("Метаданные (Headers):", JSON.stringify(metadataRecord, null, 2));
  console.log("Тело запроса (Body):", JSON.stringify(call.request, null, 2));
  
  const startTime = Date.now();

  try {
    // Отправляем реальный запрос на сервер
    const response = yield* call.next(call.request, options);
    
    const duration = Date.now() - startTime;
    console.log(`[gRPC ✅] ОТВЕТ: ${path} (${duration}ms)`);
    console.log("Результат:", JSON.stringify(response, null, 2));
    
    return response;
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`[gRPC ❌] ОШИБКА: ${path} (${duration}ms)`);
    console.error("Код:", error.code);
    console.error("Детали:", error.details || error.message);
    
    throw error; // Пробрасываем ошибку дальше
  }
}

// --- 3. СОЗДАНИЕ КЛИЕНТА ---
const channel = createChannel(env.GRPC_API_URL);

// ПОРЯДОК ОЧЕНЬ ВАЖЕН:
// 1. authMiddleware: добавляет токен.
// 2. loggingMiddleware: читает измененные опции и выводит всё в консоль.
const clientFactory = createClientFactory()
  .use(loggingMiddleware)
  .use(authMiddleware);
export const userService = clientFactory.create(UserServiceDefinition, channel);

