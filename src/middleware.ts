import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { authLogger } from '@/lib/logger';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('eventosnow-auth-token')?.value;

  if (pathname.startsWith('/api/dashboard')) {
    if (!token) {
      authLogger.warn('Token not found in cookie');
      return NextResponse.json({ success: false, error: 'Token não encontrado' }, { status: 401 });
    }

    try {
      const decoded = jwt.decode(token) as { sub?: string } | null;

      if (!decoded?.sub) {
        authLogger.warn('Invalid token or missing sub');
        return NextResponse.json({ success: false, error: 'Token inválido' }, { status: 401 });
      }

      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-cognito-id', decoded.sub);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      authLogger.error('Error processing token', { error });
      return NextResponse.json(
        { success: false, error: 'Erro ao processar token' },
        { status: 400 }
      );
    }
  }

  const isAuthPage = pathname.startsWith('/auth');
  const isDashboardPage = pathname.startsWith('/dashboard');

  if (isDashboardPage && !token) {
    const loginUrl = new URL('/auth/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPage && token) {
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/auth/:path*', '/dashboard/:path*', '/api/dashboard/:path*'],
};
