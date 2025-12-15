import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { generateCsrfToken, verifyCsrfToken } from '@/lib/security/csrf'
import {
  checkRateLimit,
  getClientIdentifier,
  addRateLimitHeaders,
  RATE_LIMITS,
} from '@/lib/rate-limiter-enhanced'
import { generateRequestId, logRequest, logResponse } from '@/lib/logging/logger'

/**
 * Add CORS headers to response
 */
function addCorsHeaders(response: NextResponse, req: Request): NextResponse {
  const origin = req.headers.get('origin')
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  ]

  // Check if origin is allowed
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
  response.headers.set('Access-Control-Max-Age', '86400') // 24 hours

  return response
}

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
  const startTime = Date.now()

  // Generate request ID for tracking
  const requestId = generateRequestId()

  let response: NextResponse

  // Handle OPTIONS preflight requests
  if (req.method === 'OPTIONS') {
    response = new NextResponse(null, { status: 204 })
    response = addCorsHeaders(response, req)
    return response
  }

  const isApiRoute = pathname.startsWith('/api/')

  // Apply global rate limiting to API routes
  if (isApiRoute) {
    const clientId = getClientIdentifier(req)
    const method = req.method.toUpperCase()

    // Determine rate limit based on endpoint and method
    let rateLimitConfig = RATE_LIMITS.GENERAL

    if (pathname.includes('/auth/login')) {
      rateLimitConfig = RATE_LIMITS.AUTH_LOGIN
    } else if (pathname.includes('/auth/register')) {
      rateLimitConfig = RATE_LIMITS.AUTH_REGISTER
    } else if (pathname.includes('/auth/reset-password') || pathname.includes('/auth/forgot-password')) {
      rateLimitConfig = RATE_LIMITS.AUTH_PASSWORD_RESET
    } else if (pathname.includes('/files/upload')) {
      rateLimitConfig = RATE_LIMITS.FILE_UPLOAD
    } else if (pathname.includes('/files/') && pathname.includes('/download')) {
      rateLimitConfig = RATE_LIMITS.FILE_DOWNLOAD
    } else if (method === 'POST') {
      rateLimitConfig = RATE_LIMITS.API_POST
    } else if (method === 'PUT') {
      rateLimitConfig = RATE_LIMITS.API_PUT
    } else if (method === 'PATCH') {
      rateLimitConfig = RATE_LIMITS.API_PATCH
    } else if (method === 'DELETE') {
      rateLimitConfig = RATE_LIMITS.API_DELETE
    } else if (method === 'GET') {
      rateLimitConfig = RATE_LIMITS.API_GET
    }

    // Check rate limit
    const rateLimitResult = await checkRateLimit({
      identifier: clientId,
      endpoint: pathname,
      ...rateLimitConfig,
    })

    // Log request
    logRequest({
      requestId,
      method,
      path: pathname,
      ip: clientId,
      rateLimitRemaining: rateLimitResult.remaining,
    })

    if (!rateLimitResult.allowed) {
      response = NextResponse.json(
        {
          success: false,
          error: 'Too many requests. Please try again later.',
          retryAfter: rateLimitResult.resetIn,
        },
        { status: 429 }
      )

      // Add rate limit headers
      addRateLimitHeaders(response.headers, rateLimitResult)
      response.headers.set('X-Request-ID', requestId)

      // Log response
      logResponse({
        requestId,
        method,
        path: pathname,
        statusCode: 429,
        duration: Date.now() - startTime,
      })

      return addSecurityHeaders(response)
    }

    // Store rate limit result for later header addition
    req.headers.set('X-Rate-Limit-Result', JSON.stringify(rateLimitResult))
  }

  // CSRF Protection for API routes (POST, PUT, PATCH, DELETE)
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
      // Generate token synchronously for middleware
      const array = new Uint8Array(32)
      crypto.getRandomValues(array)
      const token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
      
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

  // Add request ID to all responses
  response.headers.set('X-Request-ID', requestId)

  // Add rate limit headers if available
  if (isApiRoute) {
    const rateLimitResultHeader = req.headers.get('X-Rate-Limit-Result')
    if (rateLimitResultHeader) {
      try {
        const rateLimitResult = JSON.parse(rateLimitResultHeader)
        addRateLimitHeaders(response.headers, rateLimitResult)
      } catch (e) {
        // Ignore parse errors
      }
    }
  }

  // Add CORS headers
  response = addCorsHeaders(response, req)

  // Log API responses
  if (isApiRoute) {
    logResponse({
      requestId,
      method: req.method,
      path: pathname,
      statusCode: response.status,
      duration: Date.now() - startTime,
    })
  }

  return addSecurityHeaders(response)
})

export const config = {
  // Exclude static files, images, favicon, and public apply routes from middleware
  matcher: ['/((?!_next/static|_next/image|favicon.ico|apply).*)'],
}
