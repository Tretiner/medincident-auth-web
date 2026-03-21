import { NextRequest, NextResponse } from "next/server";

// Пути, требующие обязательной авторизации
const SECURE_PATHS = ["/profile", "/api/profile"];

// Функция, которая имитирует вашу timestampDate для Edge runtime (если нужно)
const isExpired = (expirationTs: string | undefined) => {
  if (!expirationTs) return false;
  return new Date(Number(expirationTs)) < new Date();
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Проверяем, является ли путь защищенным
  const isSecurePath = SECURE_PATHS.some((path) => pathname.startsWith(path));

  if (!isSecurePath) {
    return NextResponse.next();
  }

  // 2. Ищем куку текущей сессии
  const currentSessionId = request.cookies.get("zitadel_current_session")?.value;
  const sessionsCookie = request.cookies.get("sessions")?.value;

  let isAuthenticated = false;

  // 3. Валидация кук (без похода в сторонние API)
  if (currentSessionId && sessionsCookie) {
    try {
      const sessions = JSON.parse(sessionsCookie);
      
      // Ищем текущую сессию в массиве всех сессий
      const activeSession = sessions.find((s: any) => s.id === currentSessionId);

      // Если сессия найдена и не протухла
      if (activeSession && !isExpired(activeSession.expirationTs)) {
        isAuthenticated = true;
      }
    } catch (error) {
      console.error("Middleware: Ошибка парсинга кук", error);
    }
  }

  // 4. Если проверка провалилась - выбрасываем на главную
  if (!isAuthenticated) {
    console.info(`🔒 Запрещен доступ к ${pathname}. Редирект на /.`);
    
    const loginUrl = new URL("/", request.url);
    // Опционально: можно передать путь, куда человек пытался зайти, 
    // чтобы вернуть его туда после логина
    loginUrl.searchParams.set("redirect", pathname); 
    
    return NextResponse.redirect(loginUrl);
  }

  // 5. Все ок - пропускаем!
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/auth/qr).*)",
  ],
};