import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  
  const token = request.cookies.get('session')?.value;
  
  const { pathname } = request.nextUrl;
  const isLoginPage = pathname.startsWith('/login');
  const isProtectedPage = pathname.startsWith('/profile');

  if (isProtectedPage && !token) {
    console.log(`PROXY DENIED (Redirect to login): ${pathname}`);
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isLoginPage && token) {
    console.log(`PROXY ALREADY LOGGED IN (Redirect to profile): ${pathname}`);
    return NextResponse.redirect(new URL('/profile', request.url));
  }

    console.log(`PROXY PASS: ${pathname}`);
  return NextResponse.next();
}

export const config = {
  matcher: ['/profile/:path*', '/login'], // Защищаемые маршруты
};