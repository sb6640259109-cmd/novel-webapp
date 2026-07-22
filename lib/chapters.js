import { assertSupabase, getSupabase } from '@/lib/supabase';

const normalizeRow = (row) => row && ({ ...row, novelId: row.novel_id, createdAt: row.created_at, updatedAt: row.updated_at });

export function normalizeChapter(body) {
  return { title: String(body.title || '').trim(), content: String(body.content || '').trim() };
}

export function validateChapter(chapter) {
  if (!chapter.title) return 'กรุณากรอกชื่อตอน';
  if (!chapter.content) return 'กรุณากรอกเนื้อหาตอน';
  return null;
}

export async function listChapters(novelId) {
  return assertSupabase(await getSupabase().from('chapters').select('*').eq('novel_id', String(novelId)).order('order')).map(normalizeRow);
}

export async function findChapter(novelId, chapterId) {
  return normalizeRow(assertSupabase(await getSupabase().from('chapters').select('*').eq('novel_id', String(novelId)).eq('id', String(chapterId)).maybeSingle()));
}

export async function addChapter(novelId, chapter) {
  const existing = await listChapters(novelId);
  return normalizeRow(assertSupabase(await getSupabase().from('chapters').insert({ ...chapter, novel_id: String(novelId), order: existing.length + 1 }).select().single()));
}

export async function editChapter(novelId, chapterId, chapter) {
  return normalizeRow(assertSupabase(await getSupabase().from('chapters').update({ ...chapter, updated_at: new Date().toISOString() }).eq('novel_id', String(novelId)).eq('id', String(chapterId)).select().maybeSingle()));
}

export async function removeChapter(novelId, chapterId) {
  const rows = assertSupabase(await getSupabase().from('chapters').delete().eq('novel_id', String(novelId)).eq('id', String(chapterId)).select('id'));
  if (!rows.length) return false;
  await reorderChapters(novelId, (await listChapters(novelId)).map((item) => item.id));
  return true;
}

export async function reorderChapters(novelId, chapterIds) {
  const chapters = await listChapters(novelId);
  const existingIds = chapters.map((item) => item.id);
  if (chapterIds.length !== existingIds.length || new Set(chapterIds).size !== existingIds.length || existingIds.some((id) => !chapterIds.includes(id))) return false;
  await Promise.all(chapterIds.map(async (id, index) => assertSupabase(await getSupabase().from('chapters').update({ order: index + 1, updated_at: new Date().toISOString() }).eq('id', id))));
  return true;
}

export async function removeAllChapters(novelId) {
  assertSupabase(await getSupabase().from('chapters').delete().eq('novel_id', String(novelId)));
}
