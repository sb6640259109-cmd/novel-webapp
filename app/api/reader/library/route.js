import { getAuthUser } from '@/lib/auth';
import { listNovels } from '@/lib/novels';
import { getFavoriteNovelIds, getReadingHistory } from '@/lib/reader-data';

export async function GET(request) {
  const user = getAuthUser(request);
  if (!user) return Response.json({ success: false, message: 'กรุณาเข้าสู่ระบบก่อน' }, { status: 401 });

  const novels = await listNovels();
  const [favoriteIds, history] = await Promise.all([
    getFavoriteNovelIds(novels.map((novel) => novel.id), user.id),
    getReadingHistory(user.id),
  ]);
  return Response.json({
    success: true,
    favorites: novels.filter((novel) => favoriteIds.includes(novel.id)),
    history,
  });
}
