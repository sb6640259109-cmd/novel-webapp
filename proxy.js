import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { AUTH_COOKIE_NAME } from '@/lib/cookies';

const authPages = ['/login', '/register'];

function readUser(request) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const user = verifyToken(token);
    return { ...user, role: user.role === 'USER' ? 'READER' : user.role };
  } catch {
    return null;
  }
}

function memberHome(user) {
  return ['AUTHOR', 'ADMIN'].includes(user.role) ? '/admin' : '/profile';
}

export function proxy(request) {
  const { pathname } = request.nextUrl;
  const user = readUser(request);

  if (pathname.startsWith('/admin')) {
    if (!user) return NextResponse.redirect(new URL('/login', request.url));
    if (!['AUTHOR', 'ADMIN'].includes(user.role)) {
      return NextResponse.redirect(new URL('/profile', request.url));
    }
  }

  if (pathname === '/profile' && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (authPages.includes(pathname) && user) {
    return NextResponse.redirect(new URL(memberHome(user), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/profile', '/login', '/register'],
};
