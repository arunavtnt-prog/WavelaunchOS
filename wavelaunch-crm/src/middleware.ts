import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth(async function middleware(req: any) {
  const { pathname } = req.nextUrl

  // Admin routes authentication using NextAuth
  const isPublicRoute = pathname === '/login' || pathname.startsWith('/api/auth')
  const isAdminLoggedIn = !!req.auth

  if (isAdminLoggedIn && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  if (!isAdminLoggedIn && !isPublicRoute && !pathname.startsWith('/portal/')) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  const response = NextResponse.next()

  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  return response
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|apply).*)'],
}
