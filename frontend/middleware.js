import { NextResponse } from 'next/server';

function getRequiredRole(pathname) {
  if (pathname === '/admin/login') {
    return null;
  }
  if (pathname === '/onboarding' || pathname === '/worker' || pathname.startsWith('/worker/')) {
    return 'worker';
  }
  if (pathname === '/job' || pathname.startsWith('/job/') || pathname === '/customer' || pathname.startsWith('/customer/')) {
    return 'customer';
  }
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    return 'admin';
  }
  return null;
}

function redirectToLogin(request, role, pathname) {
  const loginPath = role === 'admin' ? '/admin/login' : `/login?role=${role}`;
  const response = NextResponse.redirect(new URL(loginPath, request.url));
  response.cookies.set('intendedUrl', pathname, { maxAge: 60 * 60, path: '/' });
  return response;
}

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('serviqo_session')?.value;

  let userRole = null;
  let validSession = false;
  if (sessionCookie) {
    let decodedSession;
    try {
      decodedSession = decodeURIComponent(sessionCookie);
      const [role, userId] = decodedSession.split(':');
      if (['customer', 'worker', 'admin'].includes(role) && /^[a-f\d]{24}$/i.test(userId || '')) {
        userRole = role;
        validSession = true;
      }
    } catch {
      // Treat malformed client session cookies as unauthenticated.
    }
  }

  const requiredRole = getRequiredRole(pathname);

  if (!validSession) {
    if (pathname.startsWith('/workers/')) {
      return NextResponse.next();
    }
    if (requiredRole) {
      return redirectToLogin(request, requiredRole, pathname);
    }
  }

  if (validSession) {
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

    if (requiredRole && userRole !== requiredRole) {
      const dashboard = userRole === 'admin'
        ? '/admin/dashboard'
        : userRole === 'worker'
          ? '/worker/dashboard'
          : '/customer/dashboard';
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
