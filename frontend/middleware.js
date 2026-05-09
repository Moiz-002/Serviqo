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

  // 1. If UN-AUTHENTICATED
  if (!sessionCookie) {
    // Worker profile pages are public — allow access
    if (pathname.startsWith('/workers/')) {
      return NextResponse.next();
    }

    // Protect customer/worker dashboards -> redirect to /login
    if (
      pathname.startsWith('/customer/') ||
      pathname.startsWith('/worker/') ||
      pathname === '/onboarding'
    ) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.set('intendedUrl', pathname, { maxAge: 60 * 60 });
      return response;
    }

    // Protect admin dashboard -> redirect to /admin/login
    if (pathname.startsWith('/admin/') && pathname !== '/admin/login') {
      const response = NextResponse.redirect(new URL('/admin/login', request.url));
      response.cookies.set('intendedUrl', pathname, { maxAge: 60 * 60 });
      return response;
    }
  }

  // 2. If AUTHENTICATED
  if (sessionCookie) {
    // Authenticated users shouldn't see auth pages
    const authPages = [
      '/login',
      '/signup',
      '/verify',
      '/forgot-password',
      '/reset-password',
      '/login-otp',
      '/admin/login',
    ];
    
    if (authPages.includes(pathname)) {
      const dashboard =
        userRole === 'admin' 
          ? '/admin/dashboard' 
          : userRole === 'worker' 
            ? '/worker/dashboard' 
            : '/customer/dashboard';
      return NextResponse.redirect(new URL(dashboard, request.url));
    }

    // Role-based route protection
    
    // Protect onboarding flow — only for workers
    if (pathname === '/onboarding' && userRole !== 'worker') {
      const dashboard = userRole === 'admin' ? '/admin/dashboard' : '/customer/dashboard';
      return NextResponse.redirect(new URL(dashboard, request.url));
    }

    // Protect admin routes — only admins can access
    if (pathname.startsWith('/admin/') && userRole !== 'admin') {
      const dashboard = userRole === 'worker' ? '/worker/dashboard' : '/customer/dashboard';
      return NextResponse.redirect(new URL(dashboard, request.url));
    }

    // Protect worker routes — only workers can access
    if (pathname.startsWith('/worker/') && userRole !== 'worker') {
      const dashboard = userRole === 'admin' ? '/admin/dashboard' : '/customer/dashboard';
      return NextResponse.redirect(new URL(dashboard, request.url));
    }

    // Protect customer routes — only customers can access
    if (pathname.startsWith('/customer/') && userRole !== 'customer') {
      const dashboard = userRole === 'admin' ? '/admin/dashboard' : '/worker/dashboard';
      return NextResponse.redirect(new URL(dashboard, request.url));
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
