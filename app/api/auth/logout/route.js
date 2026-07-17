import { deleteAuthCookie } from '@/lib/cookies';

export async function POST() {
  const cookie = deleteAuthCookie();

  return new Response(
    JSON.stringify({ success: true, message: 'ออกจากระบบสำเร็จ' }),
    {
      status: 200,
      headers: { 'Set-Cookie': cookie, 'Content-Type': 'application/json' },
    }
  );
}
