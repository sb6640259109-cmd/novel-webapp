import { FieldValue } from 'firebase-admin/firestore';
import { getFirestoreDatabase } from '@/lib/firebase-admin';

const db = () => getFirestoreDatabase();
const novel = (id) => db().collection('novels').doc(String(id));

function serialize(document) {
  const data = document.data();
  return {
    id: document.id,
    ...data,
    createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
    updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
  };
}

export async function getEngagement(novelId, userId = null) {
  const [favorites, followers, ratings, comments, novelDocument] = await Promise.all([
    novel(novelId).collection('favorites').get(),
    novel(novelId).collection('followers').get(),
    novel(novelId).collection('ratings').get(),
    novel(novelId).collection('comments').orderBy('createdAt', 'desc').limit(50).get(),
    novel(novelId).get(),
  ]);
  const author = String(novelDocument.data()?.author || '').trim();
  const authorFollow = userId && author
    ? await db().collection('users').doc(userId).collection('followedAuthors').doc(encodeURIComponent(author)).get()
    : null;
  const values = ratings.docs.map((item) => Number(item.data().value)).filter(Number.isFinite);
  return {
    favoriteCount: favorites.size,
    ratingCount: values.length,
    averageRating: values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0,
    isFavorite: userId ? favorites.docs.some((item) => item.id === userId) : false,
    followerCount: followers.size,
    isFollowingNovel: userId ? followers.docs.some((item) => item.id === userId) : false,
    isFollowingAuthor: Boolean(authorFollow?.exists),
    userRating: userId ? Number(ratings.docs.find((item) => item.id === userId)?.data()?.value || 0) : 0,
    comments: comments.docs.map(serialize),
  };
}

export async function toggleNovelFollow(novelId, userId) {
  const reference = novel(novelId).collection('followers').doc(userId);
  const current = await reference.get();
  if (current.exists) await reference.delete();
  else await reference.set({ createdAt: FieldValue.serverTimestamp() });
  return !current.exists;
}

export async function toggleAuthorFollow(author, userId) {
  const normalizedAuthor = String(author || '').trim();
  if (!normalizedAuthor) throw new Error('AUTHOR_REQUIRED');
  const reference = db().collection('users').doc(userId).collection('followedAuthors').doc(encodeURIComponent(normalizedAuthor));
  const current = await reference.get();
  if (current.exists) await reference.delete();
  else await reference.set({ author: normalizedAuthor, createdAt: FieldValue.serverTimestamp() });
  return !current.exists;
}

export async function toggleFavorite(novelId, userId) {
  const reference = novel(novelId).collection('favorites').doc(userId);
  const current = await reference.get();
  if (current.exists) await reference.delete();
  else await reference.set({ createdAt: FieldValue.serverTimestamp() });
  return !current.exists;
}

export async function setRating(novelId, userId, value) {
  await novel(novelId).collection('ratings').doc(userId).set({ value, updatedAt: FieldValue.serverTimestamp() });
}

export async function addComment(novelId, user, text) {
  const reference = await novel(novelId).collection('comments').add({
    userId: user.id,
    username: user.username || user.email,
    text,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  return serialize(await reference.get());
}

export async function removeComment(novelId, commentId) {
  const reference = novel(novelId).collection('comments').doc(String(commentId));
  if (!(await reference.get()).exists) return false;
  await reference.delete();
  return true;
}

export async function saveReadingProgress(user, data) {
  await db().collection('users').doc(user.id).collection('readingHistory').doc(String(data.novelId)).set({
    novelId: String(data.novelId),
    novelTitle: String(data.novelTitle || ''),
    chapterId: data.chapterId ? String(data.chapterId) : null,
    chapterTitle: data.chapterTitle ? String(data.chapterTitle) : null,
    progress: Math.max(0, Math.min(100, Number(data.progress) || 0)),
    updatedAt: FieldValue.serverTimestamp(),
  }, { merge: true });
}

export async function getReadingHistory(userId) {
  const snapshot = await db().collection('users').doc(userId).collection('readingHistory')
    .orderBy('updatedAt', 'desc').limit(50).get();
  return snapshot.docs.map(serialize);
}

export async function getFavoriteNovelIds(novelIds, userId) {
  const documents = await Promise.all(novelIds.map((novelId) => novel(novelId).collection('favorites').doc(userId).get()));
  return documents.filter((document) => document.exists).map((document) => document.ref.parent.parent.id);
}

export async function removeAllEngagement(novelId) {
  for (const collectionName of ['favorites', 'followers', 'ratings', 'comments']) {
    const snapshot = await novel(novelId).collection(collectionName).get();
    if (snapshot.empty) continue;
    const batch = db().batch();
    snapshot.docs.forEach((document) => batch.delete(document.ref));
    await batch.commit();
  }
}
