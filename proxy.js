import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

const authPages = ['/login', '/register'];

function redirectWithCookies(path, request, sourceResponse) {
  const target = NextResponse.redirect(new URL(path, request.url));
  sourceResponse.cookies.getAll().forEach((cookie) => target.cookies.set(cookie));
  return target;
}

export async function proxy(request) {
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return response;
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (items) => {
        items.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        items.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  const { data: { user } } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;
  const role = user?.app_metadata?.role || 'READER';

  if (pathname.startsWith('/admin')) {
    if (!user) return redirectWithCookies('/login', request, response);
    if (!['AUTHOR', 'ADMIN'].includes(role)) return redirectWithCookies('/profile', request, response);
  }
  if ((pathname === '/profile' || pathname === '/author-apply') && !user) return redirectWithCookies('/login', request, response);
  if (authPages.includes(pathname) && user) {
    const home = role === 'ADMIN' ? '/admin' : role === 'AUTHOR' ? '/' : '/profile';
    return redirectWithCookies(home, request, response);
  }
  return response;
}

export const config = { matcher: ['/admin/:path*', '/profile', '/author-apply', '/login', '/register'] };
