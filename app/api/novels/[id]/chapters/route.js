import { canManageNovel, findNovel } from '@/lib/novels';
import { addChapter, listChapters, normalizeChapter, reorderChapters, validateChapter } from '@/lib/chapters';
import { getAuthUser, hasRole, ROLES } from '@/lib/auth';

export async function GET(_request, { params }) {
  const { id } = await params;
  const novel = await findNovel(id);
  if (!novel) return Response.json({ success: false, message: 'ไม่พบนิยาย' }, { status: 404 });
  return Response.json({ success: true, chapters: await listChapters(id) });
}

export async function POST(request, { params }) {
  const user = getAuthUser(request);
  if (!user) return Response.json({ success: false, message: 'กรุณาเข้าสู่ระบบ' }, { status: 401 });
  if (!hasRole(user, [ROLES.AUTHOR, ROLES.ADMIN])) return Response.json({ success: false, message: 'คุณไม่มีสิทธิ์เพิ่มตอน' }, { status: 403 });
  const { id } = await params;
  const novel = await findNovel(id);
  if (!canManageNovel(user, novel)) return Response.json({ success: false, message: 'คุณไม่ใช่เจ้าของนิยายเรื่องนี้' }, { status: 403 });
  const chapter = normalizeChapter(await request.json());
  const error = validateChapter(chapter);
  if (error) return Response.json({ success: false, message: error }, { status: 400 });
  return Response.json({ success: true, chapter: await addChapter(id, chapter) }, { status: 201 });
}

export async function PUT(request, { params }) {
  const user = getAuthUser(request);
  if (!user) return Response.json({ success: false, message: 'กรุณาเข้าสู่ระบบ' }, { status: 401 });
  if (!hasRole(user, [ROLES.AUTHOR, ROLES.ADMIN])) return Response.json({ success: false, message: 'คุณไม่มีสิทธิ์เรียงตอน' }, { status: 403 });
  const { id } = await params;
  if (!canManageNovel(user, await findNovel(id))) return Response.json({ success: false, message: 'คุณไม่ใช่เจ้าของนิยายเรื่องนี้' }, { status: 403 });
  const chapterIds = (await request.json()).chapterIds;
  if (!Array.isArray(chapterIds) || !(await reorderChapters(id, chapterIds.map(String)))) {
    return Response.json({ success: false, message: 'ลำดับตอนไม่ถูกต้อง' }, { status: 400 });
  }
  return Response.json({ success: true, chapters: await listChapters(id) });
}
