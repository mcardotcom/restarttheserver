import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });

  // Add security headers
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://saicsblgnrrxvkncabni.supabase.co';
  res.headers.set(
    'Content-Security-Policy',
    `default-src 'self'; connect-src 'self' ${supabaseUrl}; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;`
  );
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // Check if we have a session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If accessing admin routes without a session, redirect to login
  if (request.nextUrl.pathname.startsWith('/admin') && !session) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
  ],
}; 