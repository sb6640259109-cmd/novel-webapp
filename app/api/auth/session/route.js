import { verifyToken } from '@/lib/jwt';
import { AUTH_COOKIE_NAME } from '@/lib/cookies';
import { normalizeRole } from '@/lib/auth';

export async function GET(request) {
  try {
    const jwtToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;

    if (!jwtToken) {
      return Response.json({ authenticated: false });
    }

    const payload = verifyToken(jwtToken);
    return Response.json({ authenticated: true, user: { ...payload, role: normalizeRole(payload.role) } });
  } catch (error) {
    console.error('Session verification error:', error);
    return Response.json({ authenticated: false });
  }
}
