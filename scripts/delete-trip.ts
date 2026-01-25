import { initializeApp } from 'firebase/app';
import { getFirestore, doc, deleteDoc, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, 'trip-mate-ai');

const tripId = 'ttH01mRWlLVtxG92vh3N';

async function deleteTrip() {
  console.log(`Deleting trip: ${tripId}`);
  
  // Delete all items in the trip first
  const itemsRef = collection(db, 'trips', tripId, 'items');
  const items = await getDocs(itemsRef);
  console.log(`Found ${items.size} items to delete`);
  
  for (const item of items.docs) {
    await deleteDoc(doc(db, 'trips', tripId, 'items', item.id));
    console.log(`  Deleted item: ${item.id}`);
  }
  
  // Delete the trip
  await deleteDoc(doc(db, 'trips', tripId));
  console.log('✅ Trip deleted successfully');
}

deleteTrip().catch(console.error);
