import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { generateCsrfToken, verifyCsrfToken } from '@/lib/security/csrf'

/**
 * Add security headers to response
 * Protects against XSS, clickjacking, MIME sniffing, etc.
 */
function addSecurityHeaders(response: NextResponse): NextResponse {
  // Prevent clickjacking attacks
  response.headers.set('X-Frame-Options', 'DENY')

  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff')

  // Control referrer information
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // Restrict access to browser features
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  )

  // Content Security Policy (CSP)
  // Note: Next.js uses inline styles, so we need 'unsafe-inline' for style-src
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // unsafe-eval needed for Next.js dev
    "style-src 'self' 'unsafe-inline'", // unsafe-inline needed for Tailwind
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ')

  response.headers.set('Content-Security-Policy', cspDirectives)

  // Strict Transport Security (HTTPS only)
  // Only enable in production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains'
    )
  }

  return response
}

export default auth(async (req) => {
  const { pathname } = req.nextUrl
  const isAdminLoggedIn = !!req.auth

  let response: NextResponse

  // CSRF Protection for API routes (POST, PUT, PATCH, DELETE)
  const isApiRoute = pathname.startsWith('/api/')
  const isStateChangingMethod = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)

  // Exclude auth endpoints from CSRF check (they use other protections)
  const isAuthEndpoint = pathname.startsWith('/api/auth/') ||
                         pathname.startsWith('/portal/api/auth/')

  if (isApiRoute && isStateChangingMethod && !isAuthEndpoint) {
    const isValid = await verifyCsrfToken(req)
    if (!isValid) {
      response = NextResponse.json(
        {
          success: false,
          error: 'Invalid CSRF token. Please refresh the page and try again.',
        },
        { status: 403 }
      )
      return addSecurityHeaders(response)
    }
  }

  // Set CSRF token for all page loads (not API requests)
  if (!isApiRoute) {
    const cookieStore = await cookies()
    const existingToken = cookieStore.get('csrf-token')?.value

    if (!existingToken) {
      const token = generateCsrfToken()
      // Token will be set in response cookies
      response = NextResponse.next()
      response.cookies.set('csrf-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24, // 24 hours
      })
    }
  }

  // Portal routes - check for portal authentication
  if (pathname.startsWith('/portal')) {
    // Public portal routes (login, invite pages)
    const isPublicPortalRoute =
      pathname === '/portal/login' ||
      pathname.startsWith('/portal/invite/') ||
      pathname.startsWith('/portal/api/auth/login') ||
      pathname.startsWith('/portal/api/auth/forgot-password') ||
      pathname.startsWith('/portal/api/auth/reset-password') ||
      pathname.startsWith('/portal/api/invite')

    if (isPublicPortalRoute) {
      response = NextResponse.next()
      return addSecurityHeaders(response)
    }

    // Check for portal authentication token
    const cookieStore = await cookies()
    const portalToken = cookieStore.get('portal_token')

    if (!portalToken) {
      // Redirect to portal login if accessing protected portal routes
      if (pathname.startsWith('/portal/api/')) {
        response = NextResponse.json(
          { success: false, error: 'Unauthorized - Portal authentication required' },
          { status: 401 }
        )
        return addSecurityHeaders(response)
      }
      response = NextResponse.redirect(new URL('/portal/login', req.url))
      return addSecurityHeaders(response)
    }

    response = NextResponse.next()
    return addSecurityHeaders(response)
  }

  // Admin routes - check for admin authentication
  // Public admin routes
  const isPublicRoute = pathname === '/login' || pathname.startsWith('/api/auth')

  // Redirect logged-in users away from login page
  if (isAdminLoggedIn && pathname === '/login') {
    response = NextResponse.redirect(new URL('/dashboard', req.url))
    return addSecurityHeaders(response)
  }

  // Redirect non-logged-in users to login page
  if (!isAdminLoggedIn && !isPublicRoute) {
    response = NextResponse.redirect(new URL('/login', req.url))
    return addSecurityHeaders(response)
  }

  response = NextResponse.next()
  return addSecurityHeaders(response)
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
