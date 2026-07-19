import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

function getCredential() {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (serviceAccount) {
    try {
      return cert(JSON.parse(serviceAccount));
    } catch {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY ต้องเป็น JSON ของ Firebase service account ที่ถูกต้อง');
    }
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (projectId && clientEmail && privateKey) {
    return cert({ projectId, clientEmail, privateKey });
  }

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return applicationDefault();
  }

  throw new Error(
    'Firebase Admin environment variables are missing. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY in .env.local.'
  );
}

export function getFirebaseAdminApp() {
  if (getApps().length) return getApps()[0];
  return initializeApp({
    credential: getCredential(),
    projectId: process.env.FIREBASE_PROJECT_ID,
    ...(process.env.FIREBASE_STORAGE_BUCKET ? { storageBucket: process.env.FIREBASE_STORAGE_BUCKET } : {}),
  });
}

export function getFirestoreDatabase() {
  return getFirestore(getFirebaseAdminApp());
}
