import { getAuthUser } from '@/lib/auth';

export async function GET() {
  const user = await getAuthUser();
  return user ? Response.json({ authenticated: true, user }) : Response.json({ authenticated: false });
}
