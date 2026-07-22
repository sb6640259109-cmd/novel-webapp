import { getAuthUser, hasRole, ROLES } from '@/lib/auth';
import { assertSupabase, getSupabase } from '@/lib/supabase';
import { updateUser } from '@/lib/users';

const serializeApplication = (row) => row && ({
  id: row.id, userId: row.user_id, username: row.username, email: row.email,
  penName: row.pen_name, introduction: row.introduction, genres: row.genres,
  fullName: row.full_name, birthDate: row.birth_date, phone: row.phone, country: row.country,
  rulesVersion: row.rules_version, rulesAcceptedAt: row.rules_accepted_at,
  sampleWork: row.sample_work, status: row.status, rejectionReason: row.rejection_reason,
  submittedAt: row.submitted_at, reviewedAt: row.reviewed_at, reviewedBy: row.reviewed_by,
});

export async function GET(request) {
  const user = await getAuthUser(request);
  if (!user) return Response.json({ success: false, message: 'กรุณาเข้าสู่ระบบ' }, { status: 401 });
  if (hasRole(user, [ROLES.ADMIN])) {
    const rows = assertSupabase(await getSupabase().from('author_applications').select('*').order('submitted_at', { ascending: false }));
    return Response.json({ success: true, applications: rows.map(serializeApplication) });
  }
  const row = assertSupabase(await getSupabase().from('author_applications').select('*').eq('user_id', user.id).maybeSingle());
  return Response.json({ success: true, application: serializeApplication(row) });
}

export async function POST(request) {
  const user = await getAuthUser(request);
  if (!user) return Response.json({ success: false, message: 'กรุณาเข้าสู่ระบบ' }, { status: 401 });
  if (!hasRole(user, [ROLES.READER])) return Response.json({ success: false, message: 'เฉพาะ Reader เท่านั้นที่สมัครเป็นนักเขียนได้' }, { status: 403 });
  const body = await request.json();
  const fullName = String(body.fullName || '').trim();
  const birthDate = String(body.birthDate || '').trim();
  const phone = String(body.phone || '').trim();
  const country = String(body.country || '').trim();
  const penName = String(body.penName || '').trim();
  const introduction = String(body.introduction || '').trim();
  const genres = String(body.genres || '').trim();
  const sampleWork = String(body.sampleWork || '').trim();
  if (body.accepted !== true) return Response.json({ success: false, message: 'กรุณายอมรับกฎการเป็นนักเขียนก่อนส่งคำขอ' }, { status: 400 });
  if (fullName.length < 4 || fullName.length > 150) return Response.json({ success: false, message: 'กรุณากรอกชื่อ–นามสกุลจริงให้ถูกต้อง' }, { status: 400 });
  const parsedBirthDate = new Date(`${birthDate}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate) || Number.isNaN(parsedBirthDate.getTime()) || parsedBirthDate > new Date()) return Response.json({ success: false, message: 'กรุณาระบุวันเกิดให้ถูกต้อง' }, { status: 400 });
  if (!/^[+0-9()\-\s]{8,20}$/.test(phone)) return Response.json({ success: false, message: 'กรุณาระบุเบอร์โทรศัพท์ที่ติดต่อได้' }, { status: 400 });
  if (country.length < 2 || country.length > 100) return Response.json({ success: false, message: 'กรุณาระบุประเทศหรือภูมิภาค' }, { status: 400 });
  if (penName.length < 2 || penName.length > 100) return Response.json({ success: false, message: 'นามปากกาต้องมี 2–100 ตัวอักษร' }, { status: 400 });
  if (introduction.length < 20 || introduction.length > 1000) return Response.json({ success: false, message: 'คำแนะนำตัวต้องมี 20–1,000 ตัวอักษร' }, { status: 400 });
  if (!genres || genres.length > 200) return Response.json({ success: false, message: 'กรุณาระบุประเภทนิยายที่สนใจ' }, { status: 400 });
  if (sampleWork.length > 2000) return Response.json({ success: false, message: 'ตัวอย่างผลงานต้องไม่เกิน 2,000 ตัวอักษร' }, { status: 400 });
  const current = assertSupabase(await getSupabase().from('author_applications').select('status').eq('user_id', user.id).maybeSingle());
  if (current?.status === 'PENDING') return Response.json({ success: false, message: 'คุณมีคำขอที่กำลังรอตรวจสอบอยู่แล้ว' }, { status: 409 });
  const row = assertSupabase(await getSupabase().from('author_applications').upsert({
    user_id: user.id, username: user.username, email: user.email, pen_name: penName,
    full_name: fullName, birth_date: birthDate, phone, country,
    introduction, genres, sample_work: sampleWork || null, status: 'PENDING',
    rules_version: '2026-07-23', rules_accepted_at: new Date().toISOString(),
    rejection_reason: null, submitted_at: new Date().toISOString(), reviewed_at: null, reviewed_by: null,
  }, { onConflict: 'user_id' }).select().single());
  return Response.json({ success: true, message: 'ส่งคำขอสมัครนักเขียนแล้ว กรุณารอ Admin ตรวจสอบ', application: serializeApplication(row) }, { status: 201 });
}

export async function PATCH(request) {
  const admin = await getAuthUser(request);
  if (!hasRole(admin, [ROLES.ADMIN])) return Response.json({ success: false, message: 'เฉพาะ Admin เท่านั้น' }, { status: 403 });
  const body = await request.json();
  const status = String(body.status || '').toUpperCase();
  if (!['APPROVED', 'REJECTED'].includes(status)) return Response.json({ success: false, message: 'สถานะไม่ถูกต้อง' }, { status: 400 });
  const userId = String(body.userId || '');
  const application = assertSupabase(await getSupabase().from('author_applications').select('*').eq('user_id', userId).maybeSingle());
  if (!application) return Response.json({ success: false, message: 'ไม่พบคำขอ' }, { status: 404 });
  const rejectionReason = String(body.rejectionReason || '').trim();
  if (status === 'REJECTED' && !rejectionReason) return Response.json({ success: false, message: 'กรุณาระบุเหตุผลที่ปฏิเสธ' }, { status: 400 });
  if (status === 'APPROVED') {
    await updateUser(application.user_id, { role: 'AUTHOR', displayName: application.pen_name });
    const { error } = await getSupabase().auth.admin.updateUserById(application.user_id, {
      user_metadata: { username: application.username, display_name: application.pen_name },
      app_metadata: { role: 'AUTHOR' },
    });
    if (error) throw error;
  }
  const row = assertSupabase(await getSupabase().from('author_applications').update({
    status, rejection_reason: status === 'REJECTED' ? rejectionReason : null,
    reviewed_at: new Date().toISOString(), reviewed_by: admin.id,
  }).eq('user_id', application.user_id).select().single());
  return Response.json({ success: true, message: status === 'APPROVED' ? 'อนุมัติเป็นนักเขียนแล้ว' : 'ปฏิเสธคำขอแล้ว', application: serializeApplication(row) });
}
