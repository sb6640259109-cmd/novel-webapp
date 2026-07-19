import { FieldValue } from 'firebase-admin/firestore';
import { getFirestoreDatabase } from '@/lib/firebase-admin';

const novelsCollection = () => getFirestoreDatabase().collection('novels');

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

function serialize(document) {
  const data = document.data();
  return {
    id: document.id,
    ...data,
    createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
    updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
  };
}

export async function listNovels() {
  const snapshot = await novelsCollection().orderBy('createdAt', 'desc').get();
  return snapshot.docs.map(serialize);
}

export async function findNovel(id) {
  const document = await novelsCollection().doc(String(id)).get();
  return document.exists ? serialize(document) : null;
}

export async function addNovel(data, owner = null) {
  const reference = await novelsCollection().add({
    ...data,
    moderationStatus: 'ACTIVE',
    moderationReason: null,
    copyrightStatus: 'CLEAR',
    ...(owner ? { ownerId: owner.id, ownerUsername: owner.username || owner.email } : {}),
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  const document = await reference.get();
  return serialize(document);
}

export async function moderateNovel(id, data) {
  const reference = novelsCollection().doc(String(id));
  if (!(await reference.get()).exists) return null;
  await reference.update({
    moderationStatus: data.moderationStatus,
    moderationReason: data.moderationReason || null,
    copyrightStatus: data.copyrightStatus,
    moderatedAt: FieldValue.serverTimestamp(),
    moderatedBy: data.moderatedBy,
    updatedAt: FieldValue.serverTimestamp(),
  });
  return serialize(await reference.get());
}

export function canManageNovel(user, novel) {
  if (!user || !novel) return false;
  if (user.role === 'ADMIN') return true;
  return user.role === 'AUTHOR' && Boolean(novel.ownerId) && novel.ownerId === user.id;
}

export async function editNovel(id, data) {
  const reference = novelsCollection().doc(String(id));
  if (!(await reference.get()).exists) return null;
  await reference.update({ ...data, updatedAt: FieldValue.serverTimestamp() });
  return serialize(await reference.get());
}

export async function removeNovel(id) {
  const reference = novelsCollection().doc(String(id));
  if (!(await reference.get()).exists) return false;
  await reference.delete();
  return true;
}
