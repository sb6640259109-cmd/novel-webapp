import { parseCookie } from 'cookie';
import { verifyToken } from '@/lib/jwt';

export async function GET(request) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const cookies = parseCookie(cookieHeader);
    const jwtToken = cookies.auth_token;

    if (!jwtToken) {
      return Response.json({ authenticated: false });
    }

    const payload = verifyToken(jwtToken);
    return Response.json({ authenticated: true, user: payload });
  } catch (error) {
    return Response.json({ authenticated: false });
  }
}
