/**
 * Debug script to check what's in the Firebase database
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

async function checkDatabase() {
  console.log('\n🔍 Checking Firebase database...\n');
  console.log('Project ID:', firebaseConfig.projectId);

  // Try with default database
  console.log('\n--- Trying with default database ---');
  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    const tripsRef = collection(db, 'trips');
    const snapshot = await getDocs(tripsRef);
    console.log(`✅ Found ${snapshot.docs.length} trips in default database`);

    snapshot.docs.forEach(doc => {
      console.log(`  Trip: ${doc.id} -> ${doc.data().tripName}`);
    });
  } catch (error: any) {
    console.error('❌ Error with default database:', error.message);
  }

  // Try with named database 'trip-mate-ai'
  console.log('\n--- Trying with database ID "trip-mate-ai" ---');
  try {
    const app2 = initializeApp(firebaseConfig, 'app2');
    const db2 = getFirestore(app2, 'trip-mate-ai');

    const tripsRef = collection(db2, 'trips');
    const snapshot = await getDocs(tripsRef);
    console.log(`✅ Found ${snapshot.docs.length} trips in "trip-mate-ai" database`);

    snapshot.docs.forEach(doc => {
      console.log(`  Trip: ${doc.id} -> ${doc.data().tripName}`);
    });
  } catch (error: any) {
    console.error('❌ Error with "trip-mate-ai" database:', error.message);
  }
}

checkDatabase()
  .then(() => {
    console.log('\n✅ Check complete\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Check failed:', error);
    process.exit(1);
  });
