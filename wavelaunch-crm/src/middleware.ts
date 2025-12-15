import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// Simplified rate limiting for Edge Function
function checkRateLimit(identifier: string, endpoint: string): { allowed: boolean; remaining: number; resetIn: number } {
  const key = `${identifier}:${endpoint}`
  const limit = 100 // requests per hour
  const window = 60 * 60 * 1000 // 1 hour
  
  const now = Date.now()
  const requests = (global as any)._rateLimitStore?.[key] || []
  const validRequests = requests.filter((time: number) => now - time < window)
  
  ;(global as any)._rateLimitStore = { ...(global as any)._rateLimitStore, [key]: validRequests }
  
  if (validRequests.length >= limit) {
    return { allowed: false, remaining: 0, resetIn: Math.ceil((validRequests[0] + window - now) / 1000) }
  }
  
  validRequests.push(now)
  ;(global as any)._rateLimitStore[key] = validRequests
  
  return { allowed: true, remaining: limit - validRequests.length, resetIn: 3600 }
}

function getClientIdentifier(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0] || 
         req.headers.get('x-real-ip') || 
         'unknown'
}

function generateRequestId(): string {
  return Math.random().toString(36).substring(2, 15)
}

function addCorsHeaders(response: NextResponse, req: Request): NextResponse {
  const origin = req.headers.get('origin')
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

function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
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

// Simple CSRF verification
async function verifyCsrfToken(req: Request): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get('csrf-token')?.value
  const headerToken = req.headers.get('x-csrf-token')
  
  return !!(token && headerToken && token === headerToken)
}

export default auth(async (req) => {
  const { pathname } = req.nextUrl
  const isAdminLoggedIn = !!req.auth
  const startTime = Date.now()
  const requestId = generateRequestId()

  let response: NextResponse

  // Handle OPTIONS preflight requests
  if (req.method === 'OPTIONS') {
    response = new NextResponse(null, { status: 204 })
    return addCorsHeaders(response, req)
  }

  const isApiRoute = pathname.startsWith('/api/')

  // Apply basic rate limiting to API routes
  if (isApiRoute) {
    const clientId = getClientIdentifier(req)
    const rateLimitResult = checkRateLimit(clientId, pathname)

    if (!rateLimitResult.allowed) {
      response = NextResponse.json(
        {
          success: false,
          error: 'Too many requests. Please try again later.',
          retryAfter: rateLimitResult.resetIn,
        },
        { status: 429 }
      )
      response.headers.set('X-Request-ID', requestId)
      response.headers.set('X-Rate-Limit-Remaining', rateLimitResult.remaining.toString())
      return addSecurityHeaders(addCorsHeaders(response, req))
    }
  }

  // CSRF Protection for state-changing API requests
  const isStateChangingMethod = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)
  const isAuthEndpoint = pathname.startsWith('/api/auth/') || pathname.startsWith('/portal/api/auth/')

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
      return addSecurityHeaders(addCorsHeaders(response, req))
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
      
      response = NextResponse.next()
      response.cookies.set('csrf-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24,
      })
    }
  }

  // Portal routes authentication
  if (pathname.startsWith('/portal')) {
    const isPublicPortalRoute =
      pathname === '/portal/login' ||
      pathname.startsWith('/portal/invite/') ||
      pathname.startsWith('/portal/api/auth/login') ||
      pathname.startsWith('/portal/api/auth/forgot-password') ||
      pathname.startsWith('/portal/api/auth/reset-password') ||
      pathname.startsWith('/portal/api/invite')

    if (isPublicPortalRoute) {
      response = NextResponse.next()
      return addSecurityHeaders(addCorsHeaders(response, req))
    }

    const cookieStore = await cookies()
    const portalToken = cookieStore.get('portal_token')

    if (!portalToken) {
      if (pathname.startsWith('/portal/api/')) {
        response = NextResponse.json(
          { success: false, error: 'Unauthorized - Portal authentication required' },
          { status: 401 }
        )
        return addSecurityHeaders(addCorsHeaders(response, req))
      }
      response = NextResponse.redirect(new URL('/portal/login', req.url))
      return addSecurityHeaders(addCorsHeaders(response, req))
    }

    response = NextResponse.next()
    return addSecurityHeaders(addCorsHeaders(response, req))
  }

  // Admin routes authentication
  const isPublicRoute = pathname === '/login' || pathname.startsWith('/api/auth')

  if (isAdminLoggedIn && pathname === '/login') {
    response = NextResponse.redirect(new URL('/dashboard', req.url))
    return addSecurityHeaders(addCorsHeaders(response, req))
  }

  if (!isAdminLoggedIn && !isPublicRoute) {
    response = NextResponse.redirect(new URL('/login', req.url))
    return addSecurityHeaders(addCorsHeaders(response, req))
  }

  response = NextResponse.next()
  response.headers.set('X-Request-ID', requestId)

  return addSecurityHeaders(addCorsHeaders(response, req))
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|apply).*)'],
}
