import { assertSupabase, getSupabase } from '@/lib/supabase';

const normalizeRow = (row) => row && ({
  ...row,
  ownerId: row.owner_id,
  ownerUsername: row.owner_username,
  moderationStatus: row.moderation_status,
  moderationReason: row.moderation_reason,
  copyrightStatus: row.copyright_status,
  moderatedAt: row.moderated_at,
  moderatedBy: row.moderated_by,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export function normalizeNovel(body) {
  return {
    title: String(body.title || '').trim(), author: String(body.author || '').trim(),
    genre: String(body.genre || '').trim(), description: String(body.description || '').trim(),
    content: String(body.content || '').trim() || null,
    rating: Number(body.rating || 0), image: body.image ? String(body.image).trim() : null,
  };
}

export function validateNovel(novel) {
  if (!novel.title || !novel.author || !novel.genre || !novel.description) return 'กรุณากรอกข้อมูลที่จำเป็นให้ครบ';
  if (!Number.isFinite(novel.rating) || novel.rating < 0 || novel.rating > 5) return 'คะแนนต้องอยู่ระหว่าง 0 ถึง 5';
  return null;
}

export async function listNovels() {
  return assertSupabase(await getSupabase().from('novels').select('*').order('created_at', { ascending: false })).map(normalizeRow);
}

export async function findNovel(id) {
  const result = await getSupabase().from('novels').select('*').eq('id', String(id)).maybeSingle();
  return normalizeRow(assertSupabase(result));
}

export async function addNovel(data, owner = null) {
  const row = { ...data, moderation_status: 'ACTIVE', copyright_status: 'CLEAR' };
  if (owner) Object.assign(row, { owner_id: owner.id, owner_username: owner.username || owner.email });
  return normalizeRow(assertSupabase(await getSupabase().from('novels').insert(row).select().single()));
}

export async function moderateNovel(id, data) {
  const row = {
    moderation_status: data.moderationStatus,
    moderation_reason: data.moderationReason || null,
    copyright_status: data.copyrightStatus,
    moderated_at: new Date().toISOString(),
    moderated_by: data.moderatedBy,
    updated_at: new Date().toISOString(),
  };
  return normalizeRow(assertSupabase(await getSupabase().from('novels').update(row).eq('id', String(id)).select().maybeSingle()));
}

export function canManageNovel(user, novel) {
  if (!user || !novel) return false;
  if (user.role === 'ADMIN') return true;
  return user.role === 'AUTHOR' && Boolean(novel.ownerId) && novel.ownerId === user.id;
}

export async function editNovel(id, data) {
  return normalizeRow(assertSupabase(await getSupabase().from('novels').update({ ...data, updated_at: new Date().toISOString() }).eq('id', String(id)).select().maybeSingle()));
}

export async function removeNovel(id) {
  const rows = assertSupabase(await getSupabase().from('novels').delete().eq('id', String(id)).select('id'));
  return rows.length > 0;
}
