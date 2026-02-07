import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '')

  // Public paths that don't require authentication
  const publicPaths = ['/login']
  const isPublicPath = publicPaths.some(path => request.nextUrl.pathname.startsWith(path))

  // If trying to access protected route without token
  if (!isPublicPath && !token) {
    // Check localStorage on client side (this won't work in middleware)
    // So we'll handle this in the page component
    return NextResponse.next()
  }

  // If trying to access login page with token
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
