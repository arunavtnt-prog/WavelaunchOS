import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export default async function middleware(req: any) {
  const { pathname } = new URL(req.url)
  const requestId = Math.random().toString(36).substring(2, 15)

  // Handle OPTIONS preflight requests
  if (req.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 204 })
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token, X-Request-ID')
    return response
  }

  const isApiRoute = pathname.startsWith('/api/')
  const isPortalRoute = pathname.startsWith('/portal/')

  // Basic rate limiting
  if (isApiRoute) {
    const clientId = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
    const key = `${clientId}:${pathname}`
    const limit = 100
    const now = Date.now()
    const requests = (global as any)._rateLimitStore?.[key] || []
    const validRequests = requests.filter((time: number) => now - time < 3600000)
    
    if (validRequests.length >= limit) {
      return new NextResponse(
        JSON.stringify({ success: false, error: 'Too many requests' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    validRequests.push(now)
    ;(global as any)._rateLimitStore = { ...(global as any)._rateLimitStore, [key]: validRequests }
  }

  // CSRF Protection for API routes
  if (isApiRoute && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    const isAuthEndpoint = pathname.startsWith('/api/auth/') || pathname.startsWith('/portal/api/auth/')
    if (!isAuthEndpoint) {
      const cookieStore = await cookies()
      const token = cookieStore.get('csrf-token')?.value
      const headerToken = req.headers.get('x-csrf-token')
      
      if (!token || !headerToken || token !== headerToken) {
        return new NextResponse(
          JSON.stringify({ success: false, error: 'Invalid CSRF token' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        )
      }
    }
  }

  // Set CSRF token for page loads
  if (!isApiRoute) {
    const cookieStore = await cookies()
    const existingToken = cookieStore.get('csrf-token')?.value

    if (!existingToken) {
      const array = new Uint8Array(32)
      crypto.getRandomValues(array)
      const token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
      
      const response = NextResponse.next()
      response.cookies.set('csrf-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 86400,
      })
      return response
    }
  }

  // Portal routes authentication
  if (isPortalRoute) {
    const isPublicPortalRoute = pathname === '/portal/login' ||
                               pathname.startsWith('/portal/invite/') ||
                               pathname.startsWith('/portal/api/auth/') ||
                               pathname.startsWith('/portal/api/invite')

    if (!isPublicPortalRoute) {
      const cookieStore = await cookies()
      const portalToken = cookieStore.get('portal_token')

      if (!portalToken) {
        if (pathname.startsWith('/portal/api/')) {
          return new NextResponse(
            JSON.stringify({ success: false, error: 'Unauthorized' }),
            { status: 401, headers: { 'Content-Type': 'application/json' } }
          )
        }
        return NextResponse.redirect(new URL('/portal/login', req.url))
      }
    }
  }

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
  response.headers.set('X-Request-ID', requestId)

  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|apply).*)'],
}
