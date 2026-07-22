import { createAuthClient } from '@/lib/supabase-auth';
import { findUserById } from '@/lib/users';

export async function POST(request) {
  try {
    const body = await request.json();
    const email = body.email?.trim().toLowerCase();
    const password = body.password;
    if (!email || !password) return Response.json({ success: false, message: 'กรุณากรอกอีเมลและรหัสผ่าน' }, { status: 400 });
    const supabase = await createAuthClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) return Response.json({ success: false, message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' }, { status: 401 });
    const user = await findUserById(data.user.id);
    if (!user) return Response.json({ success: false, message: 'ไม่พบข้อมูลโปรไฟล์ผู้ใช้' }, { status: 500 });
    return Response.json({ success: true, message: 'เข้าสู่ระบบสำเร็จ', user });
  } catch (error) {
    console.error('Supabase login error:', error);
    return Response.json({ success: false, message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' }, { status: 500 });
  }
}
