import { NextResponse } from 'next/server';
import { parseCookie } from 'cookie';
import { verifyToken } from '@/lib/jwt';

const protectedPaths = ['/admin', '/profile'];
const authPages = ['/login', '/register'];

function getTokenFromRequest(request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = parseCookie(cookieHeader);
  return cookies.auth_token;
}

function isAuthenticated(request) {
  const token = getTokenFromRequest(request);
  if (!token) return false;

  try {
    verifyToken(token);
    return true;
  } catch (error) {
    return false;
  }
}

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const authenticated = isAuthenticated(request);

  if (protectedPaths.some((path) => pathname.startsWith(path))) {
    if (!authenticated) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (authPages.some((path) => pathname === path)) {
    if (authenticated) {
      const adminUrl = new URL('/admin', request.url);
      return NextResponse.redirect(adminUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/profile', '/login', '/register'],
};
