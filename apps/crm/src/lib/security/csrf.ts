/**
 * CSRF Protection
 *
 * Implements Cross-Site Request Forgery protection for all state-changing operations.
 * Uses double-submit cookie pattern with secure, httpOnly cookies.
 */

import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const CSRF_COOKIE_NAME = 'csrf-token'
const CSRF_HEADER_NAME = 'x-csrf-token'
const CSRF_TOKEN_LENGTH = 32

/**
 * Generate a cryptographically secure CSRF token
 */
export async function generateCsrfToken(): Promise<string> {
  const array = new Uint8Array(CSRF_TOKEN_LENGTH)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Set CSRF token in cookie
 * Should be called on page load to establish the token
 */
export async function setCsrfToken(): Promise<string> {
  const cookieStore = await cookies()
  let token = cookieStore.get(CSRF_COOKIE_NAME)?.value

  if (!token) {
    token = await generateCsrfToken()
    cookieStore.set(CSRF_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    })
  }

  return token
}

/**
 * Get CSRF token from cookies
 */
export async function getCsrfToken(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get(CSRF_COOKIE_NAME)?.value
}

/**
 * Verify CSRF token from request
 * Checks that token in cookie matches token in header
 */
export async function verifyCsrfToken(req: NextRequest): Promise<boolean> {
  // Skip CSRF check for GET, HEAD, OPTIONS (safe methods)
  const method = req.method.toUpperCase()
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return true
  }

  // Get token from cookie
  const cookieToken = req.cookies.get(CSRF_COOKIE_NAME)?.value

  // Get token from header
  const headerToken = req.headers.get(CSRF_HEADER_NAME)

  // Both must exist and match
  if (!cookieToken || !headerToken) {
    return false
  }

  // Use constant-time comparison to prevent timing attacks
  if (cookieToken.length !== headerToken.length) {
    return false
  }
  
  // Simple constant-time comparison
  let result = 0
  for (let i = 0; i < cookieToken.length; i++) {
    result |= cookieToken.charCodeAt(i) ^ headerToken.charCodeAt(i)
  }
  return result === 0
}

/**
 * Middleware to verify CSRF token
 * Returns 403 if verification fails
 */
export async function csrfProtection(
  req: NextRequest,
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  const isValid = await verifyCsrfToken(req)

  if (!isValid) {
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid CSRF token. Please refresh the page and try again.',
      },
      { status: 403 }
    )
  }

  return handler()
}

/**
 * Wrapper for API routes to add CSRF protection
 */
export function withCsrf(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    return csrfProtection(req, () => handler(req))
  }
}

/**
 * Client-side helper to get CSRF token for fetch requests
 * This should be called from the client to get the token from cookie
 */
export function getCsrfTokenFromCookie(): string | undefined {
  if (typeof document === 'undefined') return undefined

  const cookies = document.cookie.split(';')
  const csrfCookie = cookies.find((c) =>
    c.trim().startsWith(`${CSRF_COOKIE_NAME}=`)
  )

  if (!csrfCookie) return undefined

  return csrfCookie.split('=')[1]
}
