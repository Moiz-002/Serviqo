import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('serviqo_session')?.value;

  // Parse session cookie: format "role:userId"
  let userRole = null;
  if (sessionCookie) {
    const [role] = sessionCookie.split(':');
    userRole = role;
  }

  // If unauthenticated and visiting a protected route
  if (!sessionCookie) {
    // Worker profile pages are public — allow access
    if (pathname.startsWith('/workers/')) {
      return NextResponse.next();
    }

    // Protect customer/worker/admin dashboards
    if (
      pathname.startsWith('/customer/') ||
      pathname.startsWith('/worker/') ||
      pathname.startsWith('/admin/')
    ) {
      // Store intended URL in cookie
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.set('intendedUrl', pathname, { maxAge: 60 * 60 }); // 1 hour
      return response;
    }

    // Protect onboarding flow for workers
    if (pathname === '/onboarding') {
      return NextResponse.redirect(new URL('/signup', request.url));
    }
  }

  // If authenticated, handle role-based redirects
  if (sessionCookie) {
    // Authenticated users shouldn't see auth pages
    if (pathname === '/login' || pathname === '/signup' || pathname === '/verify') {
      const dashboard =
        userRole === 'customer' ? '/customer/dashboard' : '/worker/dashboard';
      return NextResponse.redirect(new URL(dashboard, request.url));
    }

    // Protect admin routes — only admins can access
    if (pathname.startsWith('/admin/') && userRole !== 'admin') {
      return NextResponse.redirect(new URL('/customer/dashboard', request.url));
    }

    // After login, check for intended URL
    if (pathname === '/login') {
      const intendedUrl = request.cookies.get('intendedUrl')?.value;
      if (intendedUrl) {
        const response = NextResponse.redirect(new URL(intendedUrl, request.url));
        response.cookies.delete('intendedUrl');
        return response;
      }
    }
  }

  return NextResponse.next();
}

// Middleware config: specify which routes to run middleware on
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
