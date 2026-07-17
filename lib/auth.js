import { parseCookie } from 'cookie';
import { verifyToken } from '@/lib/jwt';

export function getAuthTokenFromRequest(request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = parseCookie(cookieHeader);
  return cookies.auth_token;
}

export function getAuthUser(request) {
  const token = getAuthTokenFromRequest(request);
  if (!token) return null;

  try {
    return verifyToken(token);
  } catch (error) {
    return null;
  }
}

export function requireAuth(request) {
  const user = getAuthUser(request);
  if (!user) {
    return new Response(
      JSON.stringify({ success: false, message: 'ไม่อนุญาตให้เข้าถึง' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return user;
}
