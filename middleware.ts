import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the pathname of the request (e.g. /, /buyers, /login)
  const { pathname } = request.nextUrl

  // Define public paths that don't require authentication
  const publicPaths = ['/login', '/']

  // If it's a public path, allow access
  if (publicPaths.includes(pathname)) {
    return NextResponse.next()
  }

  // For protected paths, check if user is authenticated
  // Since we're using localStorage for auth, we can't check on server side
  // So we'll let the client-side auth provider handle redirects
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}