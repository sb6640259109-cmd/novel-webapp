import { getAuthUser, hasRole, ROLES } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';
import { findDuplicateUser, findUserById, listUsers, updateUser } from '@/lib/users';
import { listNovels } from '@/lib/novels';

async function requireAdmin() {
  const user = await getAuthUser();
  return hasRole(user, [ROLES.ADMIN]) ? user : null;
}

export async function GET() {
  if (!await requireAdmin()) return Response.json({ success: false, message: 'เฉพาะ Admin เท่านั้น' }, { status: 403 });
  return Response.json({ success: true, users: await listUsers() });
}

export async function PUT(request) {
  if (!await requireAdmin()) return Response.json({ success: false, message: 'เฉพาะ Admin เท่านั้น' }, { status: 403 });
  const body = await request.json();
  const role = String(body.role || '').toUpperCase();
  const userId = String(body.userId || '');
  const username = body.username?.trim();
  const displayName = body.displayName?.trim() || null;
  if (!userId || !['READER', 'AUTHOR', 'ADMIN'].includes(role)) return Response.json({ success: false, message: 'ข้อมูลผู้ใช้ไม่ถูกต้อง' }, { status: 400 });
  if (username && (username.length < 3 || username.length > 50)) return Response.json({ success: false, message: 'ชื่อผู้ใช้ต้องมี 3–50 ตัวอักษร' }, { status: 400 });
  const user = await updateUser(userId, { role, ...(username ? { username } : {}), ...(body.displayName !== undefined ? { displayName } : {}) });
  if (!user) return Response.json({ success: false, message: 'ไม่พบผู้ใช้งาน' }, { status: 404 });
  const { error } = await getSupabase().auth.admin.updateUserById(userId, { user_metadata: { username: user.username, display_name: user.displayName }, app_metadata: { role } });
  if (error) throw error;
  return Response.json({ success: true, message: 'อัปเดตผู้ใช้เรียบร้อยแล้ว', user });
}

export async function POST(request) {
  if (!await requireAdmin()) return Response.json({ success: false, message: 'เฉพาะ Admin เท่านั้น' }, { status: 403 });
  const body = await request.json();
  const username = body.username?.trim();
  const email = body.email?.trim().toLowerCase();
  const password = body.password;
  if (!username || username.length < 3 || username.length > 50 || !email || !/^\S+@\S+\.\S+$/.test(email) || !password || password.length < 8) return Response.json({ success: false, message: 'กรุณากรอกชื่อ อีเมล และรหัสผ่านอย่างน้อย 8 ตัวอักษรให้ถูกต้อง' }, { status: 400 });
  if (await findDuplicateUser({ email, username })) return Response.json({ success: false, message: 'อีเมลหรือชื่อผู้ใช้นี้ถูกใช้แล้ว' }, { status: 409 });
  const { data, error } = await getSupabase().auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { username } });
  if (error) return Response.json({ success: false, message: error.message }, { status: 400 });
  const user = await updateUser(data.user.id, { role: 'AUTHOR' });
  await getSupabase().auth.admin.updateUserById(data.user.id, { app_metadata: { role: 'AUTHOR' } });
  return Response.json({ success: true, message: 'เพิ่มนักเขียนเรียบร้อยแล้ว', user }, { status: 201 });
}

export async function DELETE(request) {
  const admin = await requireAdmin();
  if (!admin) return Response.json({ success: false, message: 'เฉพาะ Admin เท่านั้น' }, { status: 403 });
  const userId = new URL(request.url).searchParams.get('userId');
  if (!userId || userId === admin.id) return Response.json({ success: false, message: 'ไม่สามารถลบบัญชีนี้ได้' }, { status: 400 });
  if (!await findUserById(userId)) return Response.json({ success: false, message: 'ไม่พบผู้ใช้งาน' }, { status: 404 });
  if ((await listNovels()).some((novel) => novel.ownerId === userId)) return Response.json({ success: false, message: 'นักเขียนยังมีผลงาน กรุณาจัดการผลงานก่อนลบบัญชี' }, { status: 409 });
  const { error } = await getSupabase().auth.admin.deleteUser(userId);
  if (error) throw error;
  return Response.json({ success: true, message: 'ลบผู้ใช้งานเรียบร้อยแล้ว' });
}
