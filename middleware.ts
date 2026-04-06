import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyAccessTokenEdge } from '@/lib/jwt-edge'

// Routes that require authentication
const protectedRoutes = ['/dashboard', '/admin']
// Routes that require admin role
const adminRoutes = ['/admin']
// Auth routes (redirect if already logged in)
const authRoutes = ['/login', '/signup', '/user/login', '/user/signup', '/admin/login']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Security headers
  const response = NextResponse.next()
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://checkout.razorpay.com https://cdn.razorpay.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://res.cloudinary.com; connect-src 'self' https://api.razorpay.com https://lumberjack-cx.razorpay.com https://lumberjack.razorpay.com https://api.cloudinary.com; frame-src 'self' https://api.razorpay.com https://checkout.razorpay.com;"
  )

  const token = request.cookies.get('access_token')?.value
  
  // Debug logging
  console.log('[Middleware]', pathname, 'Token:', token ? 'Present' : 'Missing')

  // Check route types
  const isAuthRoute = authRoutes.some((route) => pathname === route) // Exact match for auth routes
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route)) && !isAuthRoute
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route)) && !isAuthRoute

  // Handle auth routes first (login/signup pages)
  if (isAuthRoute && token) {
    try {
      const payload = await verifyAccessTokenEdge(token)
      console.log('[Middleware] Redirecting authenticated user')
      // Redirect admins to admin panel, others to dashboard
      const redirectUrl = payload.role === 'ADMIN' ? '/admin' : '/dashboard'
      return NextResponse.redirect(new URL(redirectUrl, request.url))
    } catch {
      // Token invalid, allow access to auth routes
      console.log('[Middleware] Invalid token, allowing auth route access')
    }
  }

  // If it's an auth route and no token, allow access
  if (isAuthRoute) {
    return response
  }

  // Handle protected routes
  if (isProtected) {
    if (!token) {
      console.log('[Middleware] Redirecting to login - no token')
      return NextResponse.redirect(new URL('/login', request.url))
    }
    try {
      const payload = await verifyAccessTokenEdge(token)
      
      // Admin routes - only ADMIN can access
      if (isAdminRoute && payload.role !== 'ADMIN') {
        console.log('[Middleware] Non-admin trying to access admin route')
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
      
      // Dashboard routes - ADMIN, USER, and CUSTOMER can access
      // All authenticated users can access /dashboard
    } catch (error) {
      console.log('[Middleware] Token verification failed:', error)
      const res = NextResponse.redirect(new URL('/login', request.url))
      res.cookies.delete('access_token')
      return res
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|public).*)'],
}
