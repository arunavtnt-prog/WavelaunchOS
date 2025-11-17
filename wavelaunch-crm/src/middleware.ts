import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export default auth(async (req) => {
  const { pathname } = req.nextUrl
  const isAdminLoggedIn = !!req.auth

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
      return NextResponse.next()
    }

    // Check for portal authentication token
    const cookieStore = await cookies()
    const portalToken = cookieStore.get('portal_token')

    if (!portalToken) {
      // Redirect to portal login if accessing protected portal routes
      if (pathname.startsWith('/portal/api/')) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized - Portal authentication required' },
          { status: 401 }
        )
      }
      return NextResponse.redirect(new URL('/portal/login', req.url))
    }

    return NextResponse.next()
  }

  // Admin routes - check for admin authentication
  // Public admin routes
  const isPublicRoute = pathname === '/login' || pathname.startsWith('/api/auth')

  // Redirect logged-in users away from login page
  if (isAdminLoggedIn && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Redirect non-logged-in users to login page
  if (!isAdminLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
