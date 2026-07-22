import { getAuthUser, hasRole, ROLES } from '@/lib/auth';
import { moderateNovel } from '@/lib/novels';

export async function PUT(request, { params }) {
  const admin = await getAuthUser(request);
  if (!hasRole(admin, [ROLES.ADMIN])) return Response.json({ success: false, message: 'เฉพาะ Admin เท่านั้น' }, { status: 403 });
  const body = await request.json();
  const moderationStatus = String(body.moderationStatus || '').toUpperCase();
  const copyrightStatus = String(body.copyrightStatus || '').toUpperCase();
  if (!['ACTIVE', 'REVIEW', 'SUSPENDED'].includes(moderationStatus)) return Response.json({ success: false, message: 'สถานะเนื้อหาไม่ถูกต้อง' }, { status: 400 });
  if (!['CLEAR', 'REVIEW', 'VIOLATION'].includes(copyrightStatus)) return Response.json({ success: false, message: 'สถานะลิขสิทธิ์ไม่ถูกต้อง' }, { status: 400 });
  const novel = await moderateNovel((await params).id, {
    moderationStatus,
    copyrightStatus,
    moderationReason: String(body.moderationReason || '').trim().slice(0, 1000),
    moderatedBy: admin.id,
  });
  return novel
    ? Response.json({ success: true, message: 'อัปเดตการตรวจสอบเรียบร้อยแล้ว', novel })
    : Response.json({ success: false, message: 'ไม่พบนิยาย' }, { status: 404 });
}
