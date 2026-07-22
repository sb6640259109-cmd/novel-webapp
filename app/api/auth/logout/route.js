import { createAuthClient } from '@/lib/supabase-auth';

export async function POST() {
  const supabase = await createAuthClient();
  await supabase.auth.signOut();
  return Response.json({ success: true, message: 'ออกจากระบบสำเร็จ' });
}
