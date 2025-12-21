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
    secret: process.env.NEXTAUTH_SECRET 
  })
  
  if (!token && !isPublicPath) {
    // Redirect to login if not authenticated and not on public path
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}