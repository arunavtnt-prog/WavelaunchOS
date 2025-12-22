import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip authentication for public routes
  const publicPaths = ['/login', '/portal/login', '/portal/forgot-password', '/portal/reset-password']
  const isPublicPath = publicPaths.includes(pathname)

  // Skip authentication for API routes and static files
  if (pathname.startsWith('/api/') || pathname.startsWith('/_next/') || pathname.startsWith('/favicon.ico')) {
    return NextResponse.next()
  }

  // Skip authentication for portal routes (they have their own auth)
  if (pathname.startsWith('/portal/')) {
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
  
  if (!token && !isPublicPath) {
    // Redirect to login if not authenticated and not on public path
    console.log('Middleware - Redirecting to login')
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // Additional check: if user is authenticated but trying to access portal routes, redirect to admin dashboard
  if (token && pathname.startsWith('/portal/')) {
    console.log('Middleware - Authenticated user accessing portal, redirecting to admin dashboard')
    const dashboardUrl = new URL('/dashboard', request.url)
    return NextResponse.redirect(dashboardUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}