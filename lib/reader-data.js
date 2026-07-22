import { assertSupabase, getSupabase } from '@/lib/supabase';

const now = () => new Date().toISOString();
const exists = async (table, match) => {
  let query = getSupabase().from(table).select('id');
  Object.entries(match).forEach(([key, value]) => { query = query.eq(key, value); });
  return Boolean(assertSupabase(await query.maybeSingle()));
};
const removeWhere = async (table, match) => {
  let query = getSupabase().from(table).delete();
  Object.entries(match).forEach(([key, value]) => { query = query.eq(key, value); });
  assertSupabase(await query);
};
const toggle = async (table, match, extra = {}) => {
  if (await exists(table, match)) { await removeWhere(table, match); return false; }
  assertSupabase(await getSupabase().from(table).insert({ ...match, ...extra }));
  return true;
};

export async function getEngagement(novelId, userId = null) {
  const db = getSupabase();
  const [favorites, followers, ratings, comments, novel] = await Promise.all([
    db.from('novel_favorites').select('user_id').eq('novel_id', String(novelId)),
    db.from('novel_followers').select('user_id').eq('novel_id', String(novelId)),
    db.from('novel_ratings').select('user_id,value').eq('novel_id', String(novelId)),
    db.from('novel_comments').select('*').eq('novel_id', String(novelId)).order('created_at', { ascending: false }).limit(50),
    db.from('novels').select('author').eq('id', String(novelId)).maybeSingle(),
  ]);
  const favoriteRows = assertSupabase(favorites), followerRows = assertSupabase(followers);
  const ratingRows = assertSupabase(ratings), commentRows = assertSupabase(comments);
  const author = assertSupabase(novel)?.author?.trim() || '';
  const authorFollow = userId && author ? await exists('followed_authors', { user_id: userId, author }) : false;
  const values = ratingRows.map((item) => Number(item.value)).filter(Number.isFinite);
  return {
    favoriteCount: favoriteRows.length, ratingCount: values.length,
    averageRating: values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0,
    isFavorite: Boolean(userId && favoriteRows.some((item) => item.user_id === userId)),
    followerCount: followerRows.length,
    isFollowingNovel: Boolean(userId && followerRows.some((item) => item.user_id === userId)),
    isFollowingAuthor: authorFollow,
    userRating: userId ? Number(ratingRows.find((item) => item.user_id === userId)?.value || 0) : 0,
    comments: commentRows.map((item) => ({ ...item, userId: item.user_id, createdAt: item.created_at, updatedAt: item.updated_at })),
  };
}

export const toggleNovelFollow = (novelId, userId) => toggle('novel_followers', { novel_id: String(novelId), user_id: userId });
export async function toggleAuthorFollow(author, userId) {
  const value = String(author || '').trim();
  if (!value) throw new Error('AUTHOR_REQUIRED');
  return toggle('followed_authors', { user_id: userId, author: value });
}
export const toggleFavorite = (novelId, userId) => toggle('novel_favorites', { novel_id: String(novelId), user_id: userId });

export async function setRating(novelId, userId, value) {
  assertSupabase(await getSupabase().from('novel_ratings').upsert({ novel_id: String(novelId), user_id: userId, value, updated_at: now() }, { onConflict: 'novel_id,user_id' }));
  const rows = assertSupabase(await getSupabase().from('novel_ratings').select('value').eq('novel_id', String(novelId)));
  const average = rows.reduce((sum, item) => sum + Number(item.value), 0) / (rows.length || 1);
  assertSupabase(await getSupabase().from('novels').update({ rating: average, updated_at: now() }).eq('id', String(novelId)));
}

export async function addComment(novelId, user, text) {
  const row = assertSupabase(await getSupabase().from('novel_comments').insert({ novel_id: String(novelId), user_id: user.id, username: user.username || user.email, text }).select().single());
  return { ...row, userId: row.user_id, createdAt: row.created_at, updatedAt: row.updated_at };
}
export async function removeComment(novelId, commentId) {
  const rows = assertSupabase(await getSupabase().from('novel_comments').delete().eq('novel_id', String(novelId)).eq('id', String(commentId)).select('id'));
  return rows.length > 0;
}
export async function saveReadingProgress(user, data) {
  assertSupabase(await getSupabase().from('reading_history').upsert({ user_id: user.id, novel_id: String(data.novelId), novel_title: String(data.novelTitle || ''), chapter_id: data.chapterId ? String(data.chapterId) : null, chapter_title: data.chapterTitle ? String(data.chapterTitle) : null, progress: Math.max(0, Math.min(100, Number(data.progress) || 0)), updated_at: now() }, { onConflict: 'user_id,novel_id' }));
}
export async function getReadingHistory(userId) {
  const rows = assertSupabase(await getSupabase().from('reading_history').select('*').eq('user_id', userId).order('updated_at', { ascending: false }).limit(50));
  return rows.map((item) => ({ ...item, novelId: item.novel_id, novelTitle: item.novel_title, chapterId: item.chapter_id, chapterTitle: item.chapter_title, updatedAt: item.updated_at }));
}
export async function getFavoriteNovelIds(novelIds, userId) {
  if (!novelIds.length) return [];
  return assertSupabase(await getSupabase().from('novel_favorites').select('novel_id').eq('user_id', userId).in('novel_id', novelIds.map(String))).map((item) => item.novel_id);
}
export async function removeAllEngagement(novelId) {
  await Promise.all(['novel_favorites', 'novel_followers', 'novel_ratings', 'novel_comments'].map((table) => removeWhere(table, { novel_id: String(novelId) })));
}
