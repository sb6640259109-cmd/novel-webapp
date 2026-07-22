import { getAuthUser } from '@/lib/auth';
import { findNovel } from '@/lib/novels';
import { addComment, getEngagement, removeComment, setRating, toggleAuthorFollow, toggleFavorite, toggleNovelFollow } from '@/lib/reader-data';
import { hasRole, ROLES } from '@/lib/auth';

export async function GET(request, { params }) {
  const { id } = await params;
  const selectedNovel = await findNovel(id);
  if (!selectedNovel) return Response.json({ success: false, message: 'ไม่พบนิยาย' }, { status: 404 });
  const user = await getAuthUser(request);
  return Response.json({ success: true, engagement: await getEngagement(id, user?.id) });
}

export async function DELETE(request, { params }) {
  const user = await getAuthUser(request);
  if (!hasRole(user, [ROLES.ADMIN])) return Response.json({ success: false, message: 'เฉพาะ Admin เท่านั้นที่ลบความคิดเห็นได้' }, { status: 403 });
  const { id } = await params;
  const commentId = new URL(request.url).searchParams.get('commentId');
  if (!commentId) return Response.json({ success: false, message: 'ไม่พบความคิดเห็น' }, { status: 400 });
  return (await removeComment(id, commentId))
    ? Response.json({ success: true, engagement: await getEngagement(id, user.id) })
    : Response.json({ success: false, message: 'ไม่พบความคิดเห็น' }, { status: 404 });
}

export async function POST(request, { params }) {
  const user = await getAuthUser(request);
  if (!user) return Response.json({ success: false, message: 'กรุณาเข้าสู่ระบบก่อน' }, { status: 401 });
  const { id } = await params;
  const selectedNovel = await findNovel(id);
  if (!selectedNovel) return Response.json({ success: false, message: 'ไม่พบนิยาย' }, { status: 404 });
  const body = await request.json();
  if (body.action === 'favorite') {
    const isFavorite = await toggleFavorite(id, user.id);
    return Response.json({ success: true, isFavorite, engagement: await getEngagement(id, user.id) });
  }
  if (body.action === 'followNovel') {
    await toggleNovelFollow(id, user.id);
    return Response.json({ success: true, engagement: await getEngagement(id, user.id) });
  }
  if (body.action === 'followAuthor') {
    await toggleAuthorFollow(selectedNovel.author, user.id);
    return Response.json({ success: true, engagement: await getEngagement(id, user.id) });
  }
  if (body.action === 'rating') {
    const value = Number(body.value);
    if (!Number.isInteger(value) || value < 1 || value > 5) return Response.json({ success: false, message: 'คะแนนต้องเป็น 1–5' }, { status: 400 });
    await setRating(id, user.id, value);
    return Response.json({ success: true, engagement: await getEngagement(id, user.id) });
  }
  if (body.action === 'comment') {
    const text = String(body.text || '').trim();
    if (!text || text.length > 1000) return Response.json({ success: false, message: 'ความคิดเห็นต้องมี 1–1,000 ตัวอักษร' }, { status: 400 });
    const comment = await addComment(id, user, text);
    return Response.json({ success: true, comment, engagement: await getEngagement(id, user.id) }, { status: 201 });
  }
  return Response.json({ success: false, message: 'คำสั่งไม่ถูกต้อง' }, { status: 400 });
}
