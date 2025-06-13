import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Handle password reset redirect
  if (request.nextUrl.hash && request.nextUrl.hash.includes('type=recovery')) {
    const redirectUrl = new URL('/reset-password', request.url)
    redirectUrl.hash = request.nextUrl.hash
    return NextResponse.redirect(redirectUrl)
  }
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
} 