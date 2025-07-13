import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { validateRequest } from '@/lib/services/auth';

// Routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/settings',
  '/api/customers',
  '/api/invoices',
  '/api/recommendations',
  '/api/approvals',
  '/api/collection-outcomes',
  '/api/dso-metrics',
];

// Routes that should redirect to dashboard if authenticated
const authRoutes = [
  '/auth/signin',
  '/auth/signup',
  '/auth/forgot-password',
];

// API routes that don't require authentication
const publicApiRoutes = [
  '/api/auth/signin',
  '/api/auth/signup',
  '/api/auth/signout',
  '/api/auth/google',
  '/api/auth/callback',
  '/api/health',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files, images, and public assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/icons') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Skip authentication for public API routes
  if (publicApiRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Validate session
  const { valid, profile } = await validateRequest(request);

  // Handle protected routes
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!valid || !profile) {
      // Redirect to signin for web pages
      if (!pathname.startsWith('/api/')) {
        return NextResponse.redirect(new URL('/auth/signin', request.url));
      }
      
      // Return 401 for API routes
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is active
    if (!profile.isActive || profile.isBlocked) {
      // Clear session cookie
      const response = NextResponse.redirect(new URL('/auth/signin?error=account_disabled', request.url));
      response.cookies.delete('session_token');
      return response;
    }

    // Add user info to request headers for API routes
    if (pathname.startsWith('/api/')) {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', profile.userId);
      requestHeaders.set('x-user-email', profile.email);
      requestHeaders.set('x-user-role', profile.role);
      
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }
  }

  // Handle auth routes (redirect to dashboard if already authenticated)
  if (authRoutes.some(route => pathname.startsWith(route))) {
    if (valid && profile) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Add security headers
  const response = NextResponse.next();
  
  // Security headers for zero trust
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https:;"
  );

  // Add HSTS header for HTTPS
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};