export const AUTH_COOKIE_NAME = 'auth_token';

function isHttpsRequest(request) {
  if (!request) return false;

  const url = new URL(request.url);
  if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') return false;

  const forwardedProto = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim();
  return forwardedProto ? forwardedProto === 'https' : url.protocol === 'https:';
}

export function getAuthCookieOptions(request) {
  return {
    httpOnly: true,
    secure: isHttpsRequest(request),
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  };
}
