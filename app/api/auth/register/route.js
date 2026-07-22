import { createAuthClient } from '@/lib/supabase-auth';
import { getSupabase } from '@/lib/supabase';
import { findDuplicateUser, findUserById } from '@/lib/users';

export async function POST(request) {
  try {
    const body = await request.json();
    const username = body.username?.trim();
    const email = body.email?.trim().toLowerCase();
    const password = body.password;
    if (body.termsAccepted !== true) return Response.json({ success: false, message: 'กรุณายอมรับกฎการใช้งานและนโยบายความเป็นส่วนตัวก่อนสมัครสมาชิก' }, { status: 400 });
    if (!username || !email || !password) return Response.json({ success: false, message: 'กรุณากรอกข้อมูลให้ครบถ้วน' }, { status: 400 });
    if (username.length < 3 || username.length > 50 || password.length < 8) return Response.json({ success: false, message: 'ชื่อผู้ใช้ต้องมี 3–50 ตัวอักษร และรหัสผ่านอย่างน้อย 8 ตัวอักษร' }, { status: 400 });
    if (await findDuplicateUser({ email, username })) return Response.json({ success: false, message: 'อีเมลหรือชื่อผู้ใช้นี้ถูกใช้แล้ว' }, { status: 409 });
    const { data: created, error: createError } = await getSupabase().auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { username },
      app_metadata: { role: 'READER' },
    });
    if (createError || !created.user) return Response.json({ success: false, message: createError?.message || 'สมัครสมาชิกไม่สำเร็จ' }, { status: 400 });
    const supabase = await createAuthClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      await getSupabase().auth.admin.deleteUser(created.user.id);
      throw signInError;
    }
    const user = await findUserById(created.user.id);
    return Response.json({
      success: true,
      message: 'ลงทะเบียนและเข้าสู่ระบบสำเร็จ',
      user,
      requiresEmailConfirmation: false,
    }, { status: 201 });
  } catch (error) {
    console.error('Supabase register error:', error);
    return Response.json({ success: false, message: 'เกิดข้อผิดพลาดในการลงทะเบียน' }, { status: 500 });
  }
}
