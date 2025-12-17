import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export default async function middleware(req: any) {
  const { pathname } = new URL(req.url)

  // Admin routes - check for NextAuth session token
  // Public routes that don't require authentication
  const isPublicRoute =
    pathname === '/login' ||
    pathname.startsWith('/api/auth') ||
    pathname === '/api/applications' ||           // Public application submission
    pathname.startsWith('/api/applications/submit') ||  // Alternative submit endpoint
    pathname.startsWith('/api/applications/external')   // External API endpoint
  
  if (!isPublicRoute && !pathname.startsWith('/portal/')) {
    const cookieStore = await cookies()
    // NextAuth v5 uses 'authjs.' prefix instead of 'next-auth.'
    const sessionToken = cookieStore.get('authjs.session-token') ||
                         cookieStore.get('__Secure-authjs.session-token') ||
                         // Fallback for v4 compatibility
                         cookieStore.get('next-auth.session-token') ||
                         cookieStore.get('__Secure-next-auth.session-token')

    if (!sessionToken && pathname !== '/login') {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  const response = NextResponse.next()

  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|apply).*)'],
}
