import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: 'AIzaSyCJqg81eYsItPujaa93w8rxD9H0w61nnXs',
  authDomain: 'project-fin-8674f.firebaseapp.com',
  projectId: 'project-fin-8674f',
  storageBucket: 'project-fin-8674f.firebasestorage.app',
  messagingSenderId: '412731195819',
  appId: '1:412731195819:web:990d0c879377c8933ad2ee',
  measurementId: 'G-C1FT8Q1P4Y',
};

const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const analyticsPromise = isSupported().then((supported) => {
  if (!supported) return null;
  return getAnalytics(firebaseApp);
});

export const firebaseAppInstance = firebaseApp;

export function getFirebaseApiKey() {
  return process.env.FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY || firebaseConfig.apiKey;
}

export async function registerWithFirebase(email, password) {
  const apiKey = getFirebaseApiKey();

  if (!apiKey) {
    throw new Error('Missing Firebase API key. Please set FIREBASE_API_KEY in your environment.');
  }

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: true,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    const message = data?.error?.message || 'Firebase registration failed';
    throw new Error(message);
  }

  return {
    localId: data.localId,
    idToken: data.idToken,
    refreshToken: data.refreshToken,
    email: data.email,
  };
}
