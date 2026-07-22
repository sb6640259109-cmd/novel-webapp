import { getAuthUser, hasRole, ROLES } from '@/lib/auth';
import { removeAllChapters } from '@/lib/chapters';
import { removeAllEngagement } from '@/lib/reader-data';
import { canManageNovel, editNovel, findNovel, normalizeNovel, removeNovel, validateNovel } from '@/lib/novels';

function unauthorized() {
  return Response.json({ success: false, message: 'กรุณาเข้าสู่ระบบก่อนจัดการนิยาย' }, { status: 401 });
}

function forbidden() {
  return Response.json({ success: false, message: 'คุณไม่มีสิทธิ์จัดการนิยาย' }, { status: 403 });
}

export async function GET(_request, { params }) {
  try {
    const novel = await findNovel((await params).id);
    return novel
      ? Response.json({ success: true, novel })
      : Response.json({ success: false, message: 'ไม่พบนิยาย' }, { status: 404 });
  } catch (error) {
    console.error('Supabase get novel error:', error);
    return Response.json({ success: false, message: 'โหลดข้อมูลนิยายไม่สำเร็จ' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const user = await getAuthUser(request);
    if (!user) return unauthorized();
    if (!hasRole(user, [ROLES.AUTHOR, ROLES.ADMIN])) return forbidden();
    const existing = await findNovel((await params).id);
    if (!canManageNovel(user, existing)) return forbidden();
    const novel = normalizeNovel(await request.json());
    novel.rating = Number(existing.rating || 0);
    const validationError = validateNovel(novel);
    if (validationError) return Response.json({ success: false, message: validationError }, { status: 400 });
    const updated = await editNovel(existing.id, novel);
    return updated
      ? Response.json({ success: true, novel: updated })
      : Response.json({ success: false, message: 'ไม่พบนิยาย' }, { status: 404 });
  } catch (error) {
    console.error('Supabase update novel error:', error);
    return Response.json({ success: false, message: 'แก้ไขนิยายใน Supabase ไม่สำเร็จ' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await getAuthUser(request);
    if (!user) return unauthorized();
    if (!hasRole(user, [ROLES.AUTHOR, ROLES.ADMIN])) return forbidden();
    const novelId = (await params).id;
    if (!canManageNovel(user, await findNovel(novelId))) return forbidden();
    await removeAllChapters(novelId);
    await removeAllEngagement(novelId);
    const removed = await removeNovel(novelId);
    return removed
      ? Response.json({ success: true, message: 'ลบนิยายสำเร็จ' })
      : Response.json({ success: false, message: 'ไม่พบนิยาย' }, { status: 404 });
  } catch (error) {
    console.error('Supabase delete novel error:', error);
    return Response.json({ success: false, message: 'ลบนิยายจาก Supabase ไม่สำเร็จ' }, { status: 500 });
  }
}
