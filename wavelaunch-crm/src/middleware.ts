import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip authentication for static files, images, and Next.js internals
  const staticAssets = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.pdf', '.webp', '.css', '.js']
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    staticAssets.some(ext => pathname.toLowerCase().endsWith(ext))
  ) {
    return NextResponse.next()
  }


  // Skip authentication for public UI routes
  const publicPaths = ['/login', '/portal/login', '/portal/forgot-password', '/portal/reset-password']
  const isPublicPath = publicPaths.includes(pathname)
  if (isPublicPath) {
    return NextResponse.next()
  }

  // Skip authentication for allowed public API routes
  const publicApiPaths = ['/api/health']
  const isPublicApi = publicApiPaths.includes(pathname) || pathname.startsWith('/api/auth/') || pathname === '/api/applications'
  if (isPublicApi) {
    return NextResponse.next()
  }

  // Handle portal routes
  if (pathname.startsWith('/portal/')) {
    const portalPublicPaths = ['/portal/login', '/portal/forgot-password', '/portal/reset-password', '/portal/invite/']
    const isPortalPublic = portalPublicPaths.some(p => pathname.startsWith(p))

    if (isPortalPublic) {
      return NextResponse.next()
    }

    // Protection for other portal routes is handled within the app (layout/pages)
    // as it uses a separate session system (portal-token cookie)
    return NextResponse.next()
  }



  // Check if user is authenticated
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === 'production'
  })

  // Debug logging (remove in production)
  console.log('Middleware - Path:', pathname)
  console.log('Middleware - Token exists:', !!token)
  console.log('Middleware - IsPublicPath:', isPublicPath)
  console.log('Middleware - IsPublicApi:', isPublicApi)

  if (!token) {
    // If it's an API route, return 401 instead of redirecting
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Redirect to login if not authenticated and not on a public path
    console.log('Middleware - Redirecting to login')
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // Additional check: if user is authenticated but trying to access portal routes, redirect to admin dashboard
  // (Note: portal routes were already skipped above, but if we wanted to restrict them further we'd do it here)
  if (token && pathname.startsWith('/portal/')) {
    console.log('Middleware - Authenticated user accessing portal, redirecting to admin dashboard')
    const dashboardUrl = new URL('/dashboard', request.url)
    return NextResponse.redirect(dashboardUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}