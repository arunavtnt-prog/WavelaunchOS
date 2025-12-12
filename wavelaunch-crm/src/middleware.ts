import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Lightweight Edge-compatible middleware
 * Only checks for session cookie existence - actual validation in API routes
 * Heavy operations (rate limiting, full auth) moved to API routes
 */

function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  )

  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ')

  response.headers.set('Content-Security-Policy', cspDirectives)

  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains'
    )
  }

  return response
}

function addCorsHeaders(response: NextResponse, origin: string | null): NextResponse {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  ]

  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Credentials', 'true')
  }

  response.headers.set(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE, OPTIONS'
  )
  response.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-CSRF-Token, X-Request-ID'
  )
  response.headers.set('Access-Control-Max-Age', '86400')

  return response
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const origin = request.headers.get('origin')

  // Handle OPTIONS preflight
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 204 })
    return addCorsHeaders(response, origin)
  }

  // Check for NextAuth session cookie (authjs.session-token or __Secure-authjs.session-token)
  const sessionToken = request.cookies.get('authjs.session-token') ||
                       request.cookies.get('__Secure-authjs.session-token') ||
                       request.cookies.get('next-auth.session-token') ||
                       request.cookies.get('__Secure-next-auth.session-token')
  const hasAdminSession = !!sessionToken

  // Portal routes
  if (pathname.startsWith('/portal')) {
    const isPublicPortalRoute =
      pathname === '/portal/login' ||
      pathname.startsWith('/portal/invite/') ||
      pathname.startsWith('/api/portal/auth/login') ||
      pathname.startsWith('/api/portal/auth/forgot-password') ||
      pathname.startsWith('/api/portal/auth/reset-password') ||
      pathname.startsWith('/api/portal/invite')

    if (isPublicPortalRoute) {
      return addSecurityHeaders(NextResponse.next())
    }

    const portalToken = request.cookies.get('portal-token')
    if (!portalToken) {
      if (pathname.startsWith('/api/portal/')) {
        const response = NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        )
        return addSecurityHeaders(response)
      }
      return addSecurityHeaders(
        NextResponse.redirect(new URL('/portal/login', request.url))
      )
    }

    return addSecurityHeaders(NextResponse.next())
  }

  // Admin routes
  const isPublicRoute = pathname === '/login' || pathname.startsWith('/api/auth')

  // Redirect logged-in users from login page
  if (hasAdminSession && pathname === '/login') {
    return addSecurityHeaders(
      NextResponse.redirect(new URL('/dashboard', request.url))
    )
  }

  // Redirect non-logged-in users to login
  if (!hasAdminSession && !isPublicRoute) {
    return addSecurityHeaders(
      NextResponse.redirect(new URL('/login', request.url))
    )
  }

  let response = NextResponse.next()
  response = addCorsHeaders(response, origin)
  return addSecurityHeaders(response)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
