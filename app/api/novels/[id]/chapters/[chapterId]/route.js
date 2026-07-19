import { editChapter, findChapter, normalizeChapter, removeChapter, validateChapter } from '@/lib/chapters';
import { getAuthUser, hasRole, ROLES } from '@/lib/auth';
import { canManageNovel, findNovel } from '@/lib/novels';

export async function GET(_request, { params }) {
  const { id, chapterId } = await params;
  const chapter = await findChapter(id, chapterId);
  return chapter
    ? Response.json({ success: true, chapter })
    : Response.json({ success: false, message: 'ไม่พบตอนนิยาย' }, { status: 404 });
}

export async function PUT(request, { params }) {
  const user = getAuthUser(request);
  if (!user) return Response.json({ success: false, message: 'กรุณาเข้าสู่ระบบ' }, { status: 401 });
  if (!hasRole(user, [ROLES.AUTHOR, ROLES.ADMIN])) return Response.json({ success: false, message: 'คุณไม่มีสิทธิ์แก้ไขตอน' }, { status: 403 });
  const { id, chapterId } = await params;
  if (!canManageNovel(user, await findNovel(id))) return Response.json({ success: false, message: 'คุณไม่ใช่เจ้าของนิยายเรื่องนี้' }, { status: 403 });
  const chapter = normalizeChapter(await request.json());
  const error = validateChapter(chapter);
  if (error) return Response.json({ success: false, message: error }, { status: 400 });
  const updated = await editChapter(id, chapterId, chapter);
  return updated
    ? Response.json({ success: true, chapter: updated })
    : Response.json({ success: false, message: 'ไม่พบตอนนิยาย' }, { status: 404 });
}

export async function DELETE(request, { params }) {
  const user = getAuthUser(request);
  if (!user) return Response.json({ success: false, message: 'กรุณาเข้าสู่ระบบ' }, { status: 401 });
  if (!hasRole(user, [ROLES.AUTHOR, ROLES.ADMIN])) return Response.json({ success: false, message: 'คุณไม่มีสิทธิ์ลบตอน' }, { status: 403 });
  const { id, chapterId } = await params;
  if (!canManageNovel(user, await findNovel(id))) return Response.json({ success: false, message: 'คุณไม่ใช่เจ้าของนิยายเรื่องนี้' }, { status: 403 });
  return (await removeChapter(id, chapterId))
    ? Response.json({ success: true, message: 'ลบตอนเรียบร้อยแล้ว' })
    : Response.json({ success: false, message: 'ไม่พบตอนนิยาย' }, { status: 404 });
}
