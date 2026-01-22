import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase (singleton pattern for both client and server)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth (client-side only)
let auth: any;
if (typeof window !== 'undefined') {
  auth = getAuth(app);
}

// Initialize Firestore and Storage (works on both client and server)
const db = getFirestore(app, 'trip-mate-ai');
const storage = getStorage(app);

export { auth, db, storage };
export default app;
