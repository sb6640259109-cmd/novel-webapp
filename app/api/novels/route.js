import { getAuthUser, hasRole, ROLES } from '@/lib/auth';
import { addNovel, listNovels, normalizeNovel, validateNovel } from '@/lib/novels';

export async function GET(request) {
  try {
    const user = await getAuthUser(request);
    const novels = await listNovels();
    const managementView = new URL(request.url).searchParams.get('manage') === '1';
    const visible = managementView && hasRole(user, [ROLES.ADMIN])
      ? novels
      : managementView && hasRole(user, [ROLES.AUTHOR])
        ? novels.filter((novel) => novel.ownerId === user.id)
        : novels.filter((novel) => !novel.moderationStatus || novel.moderationStatus === 'ACTIVE');
    return Response.json({ success: true, novels: visible, database: 'supabase' });
  } catch (error) {
    console.error('Supabase list novels error:', error);
    return Response.json({ success: false, message: 'เชื่อมต่อ Supabase ไม่สำเร็จ กรุณาตรวจสอบ service account และเปิดใช้งาน Supabase' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getAuthUser(request);
    if (!user) return Response.json({ success: false, message: 'กรุณาเข้าสู่ระบบก่อนจัดการนิยาย' }, { status: 401 });
    if (!hasRole(user, [ROLES.AUTHOR])) return Response.json({ success: false, message: 'เฉพาะนักเขียนเท่านั้นที่เพิ่มนิยายได้' }, { status: 403 });
    const novel = normalizeNovel(await request.json());
    novel.rating = 0;
    const validationError = validateNovel(novel);
    if (validationError) return Response.json({ success: false, message: validationError }, { status: 400 });
    return Response.json({ success: true, novel: await addNovel(novel, user) }, { status: 201 });
  } catch (error) {
    console.error('Supabase create novel error:', error);
    return Response.json({ success: false, message: 'เพิ่มนิยายใน Supabase ไม่สำเร็จ' }, { status: 500 });
  }
}
