import { verifyToken } from '@/lib/jwt';
import { AUTH_COOKIE_NAME } from '@/lib/cookies';

export const ROLES = Object.freeze({
  READER: 'READER',
  AUTHOR: 'AUTHOR',
  ADMIN: 'ADMIN',
});

export function normalizeRole(role) {
  return role === 'USER' ? ROLES.READER : role;
}

export function hasRole(user, allowedRoles) {
  return Boolean(user && allowedRoles.includes(normalizeRole(user.role)));
}

export function getAuthTokenFromRequest(request) {
  return request.cookies.get(AUTH_COOKIE_NAME)?.value;
}

export function getAuthUser(request) {
  const token = getAuthTokenFromRequest(request);
  if (!token) return null;

  try {
    const user = verifyToken(token);
    return { ...user, role: normalizeRole(user.role) };
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
