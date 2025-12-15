import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export default async function middleware(req: any) {
  const { pathname } = new URL(req.url)

  // Admin routes - check for NextAuth session token
  const isPublicRoute = pathname === '/login' || pathname.startsWith('/api/auth')
  
  if (!isPublicRoute && !pathname.startsWith('/portal/')) {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('next-auth.session-token')?.value ||
                        cookieStore.get('__Secure-next-auth.session-token')?.value

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
