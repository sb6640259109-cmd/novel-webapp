import { FieldValue } from 'firebase-admin/firestore';
import { getFirestoreDatabase } from '@/lib/firebase-admin';

const chaptersCollection = (novelId) => getFirestoreDatabase()
  .collection('novels').doc(String(novelId)).collection('chapters');

function serialize(document) {
  const data = document.data();
  return {
    id: document.id,
    ...data,
    createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
    updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
  };
}

export function normalizeChapter(body) {
  return {
    title: String(body.title || '').trim(),
    content: String(body.content || '').trim(),
  };
}

export function validateChapter(chapter) {
  if (!chapter.title) return 'กรุณากรอกชื่อตอน';
  if (!chapter.content) return 'กรุณากรอกเนื้อหาตอน';
  return null;
}

export async function listChapters(novelId) {
  const snapshot = await chaptersCollection(novelId).orderBy('order', 'asc').get();
  return snapshot.docs.map(serialize);
}

export async function findChapter(novelId, chapterId) {
  const document = await chaptersCollection(novelId).doc(String(chapterId)).get();
  return document.exists ? serialize(document) : null;
}

export async function addChapter(novelId, chapter) {
  const existing = await listChapters(novelId);
  const reference = await chaptersCollection(novelId).add({
    ...chapter,
    order: existing.length + 1,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  return serialize(await reference.get());
}

export async function editChapter(novelId, chapterId, chapter) {
  const reference = chaptersCollection(novelId).doc(String(chapterId));
  if (!(await reference.get()).exists) return null;
  await reference.update({ ...chapter, updatedAt: FieldValue.serverTimestamp() });
  return serialize(await reference.get());
}

export async function removeChapter(novelId, chapterId) {
  const reference = chaptersCollection(novelId).doc(String(chapterId));
  if (!(await reference.get()).exists) return false;
  await reference.delete();
  const remaining = await listChapters(novelId);
  await reorderChapters(novelId, remaining.map((chapter) => chapter.id));
  return true;
}

export async function reorderChapters(novelId, chapterIds) {
  const chapters = await listChapters(novelId);
  const existingIds = chapters.map((chapter) => chapter.id);
  if (chapterIds.length !== existingIds.length
    || new Set(chapterIds).size !== existingIds.length
    || existingIds.some((id) => !chapterIds.includes(id))) {
    return false;
  }
  const batch = getFirestoreDatabase().batch();
  chapterIds.forEach((id, index) => {
    batch.update(chaptersCollection(novelId).doc(id), {
      order: index + 1,
      updatedAt: FieldValue.serverTimestamp(),
    });
  });
  await batch.commit();
  return true;
}

export async function removeAllChapters(novelId) {
  const snapshot = await chaptersCollection(novelId).get();
  if (snapshot.empty) return;
  const batch = getFirestoreDatabase().batch();
  snapshot.docs.forEach((document) => batch.delete(document.ref));
  await batch.commit();
}
