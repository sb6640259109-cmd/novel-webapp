import { getAuthUser, hasRole, ROLES } from '@/lib/auth';
import { addNovel, listNovels, normalizeNovel, validateNovel } from '@/lib/novels';

export async function GET(request) {
  try {
    const user = getAuthUser(request);
    const novels = await listNovels();
    const visible = hasRole(user, [ROLES.AUTHOR, ROLES.ADMIN])
      ? novels
      : novels.filter((novel) => !novel.moderationStatus || novel.moderationStatus === 'ACTIVE');
    return Response.json({ success: true, novels: visible, database: 'firestore' });
  } catch (error) {
    console.error('Firestore list novels error:', error);
    return Response.json({ success: false, message: 'เชื่อมต่อ Cloud Firestore ไม่สำเร็จ กรุณาตรวจสอบ service account และเปิดใช้งาน Firestore' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = getAuthUser(request);
    if (!user) return Response.json({ success: false, message: 'กรุณาเข้าสู่ระบบก่อนจัดการนิยาย' }, { status: 401 });
    if (!hasRole(user, [ROLES.AUTHOR])) return Response.json({ success: false, message: 'เฉพาะนักเขียนเท่านั้นที่เพิ่มนิยายได้' }, { status: 403 });
    const novel = normalizeNovel(await request.json());
    const validationError = validateNovel(novel);
    if (validationError) return Response.json({ success: false, message: validationError }, { status: 400 });
    return Response.json({ success: true, novel: await addNovel(novel, user) }, { status: 201 });
  } catch (error) {
    console.error('Firestore create novel error:', error);
    return Response.json({ success: false, message: 'เพิ่มนิยายใน Cloud Firestore ไม่สำเร็จ' }, { status: 500 });
  }
}
