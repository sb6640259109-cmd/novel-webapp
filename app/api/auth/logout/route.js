import { NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME, getAuthCookieOptions } from '@/lib/cookies';

export async function POST(request) {
  const response = NextResponse.json({ success: true, message: 'ออกจากระบบสำเร็จ' });
  response.cookies.set(AUTH_COOKIE_NAME, '', {
    ...getAuthCookieOptions(request),
    maxAge: 0,
  });
  return response;
}
