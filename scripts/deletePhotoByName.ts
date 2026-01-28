/**
 * Utility script to delete a photo by name from Firebase
 * Usage: npm run delete-photo "Photo Name"
 * Example: npm run delete-photo "Thử thách trên cát"
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, doc, deleteDoc, getDoc } from 'firebase/firestore';
import { getStorage, ref, deleteObject } from 'firebase/storage';

interface TripItemData {
  name: string;
  type: string;
  category: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  videoUrl?: string;
}

// Firebase config from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
// Use default Firestore database (no database ID parameter)
const db = getFirestore(app);
const storage = getStorage(app);

/**
 * Delete a photo by name from Firestore and Storage
 */
async function deletePhotoByName(photoName: string) {
  console.log(`\n🔍 Searching for photo: "${photoName}"\n`);

  try {
    // Search in all trips
    const tripsRef = collection(db, 'trips');
    const tripsSnapshot = await getDocs(tripsRef);

    const foundItems: Array<{itemId: string, tripId: string, data: TripItemData}> = [];

    // Search each trip for the photo
    for (const tripDoc of tripsSnapshot.docs) {
      const itemsRef = collection(db, 'trips', tripDoc.id, 'items');
      const q = query(itemsRef, where('name', '==', photoName));
      const itemsSnapshot = await getDocs(q);

      itemsSnapshot.forEach((itemDoc) => {
        const data = itemDoc.data() as TripItemData;
        if (data.name && data.type && data.category) {
          foundItems.push({
            itemId: itemDoc.id,
            tripId: tripDoc.id,
            data
          });
        }
      });
    }

    if (foundItems.length === 0) {
      console.log(`❌ No photo found with name: "${photoName}"`);
      console.log(`\n💡 Tip: Make sure the name matches exactly (case-sensitive)\n`);
      return;
    }

    console.log(`✅ Found ${foundItems.length} photo(s) with name: "${photoName}"\n`);

    // Delete each found item
    for (const { itemId, tripId, data } of foundItems) {
      console.log(`📸 Photo ID: ${itemId}`);
      console.log(`   Trip ID: ${tripId}`);
      console.log(`   Name: ${data.name}`);
      console.log(`   Type: ${data.type}`);
      console.log(`   Category: ${data.category}`);

      // Get the item document to retrieve file URLs
      const itemRef = doc(db, 'trips', tripId, 'items', itemId);
      const itemSnapshot = await getDoc(itemRef);

      if (!itemSnapshot.exists()) {
        console.log(`⚠️  Item ${itemId} no longer exists, skipping...\n`);
        continue;
      }

      const itemData = itemSnapshot.data();

      // Delete image from Storage
      if (itemData.imageUrl) {
        try {
          const urlObj = new URL(itemData.imageUrl);
          const pathMatch = urlObj.pathname.match(/\/o\/([^?]+)/);
          if (pathMatch) {
            const path = decodeURIComponent(pathMatch[1]);
            console.log(`   🗑️  Deleting image from Storage...`);
            const storageRef = ref(storage, path);
            await deleteObject(storageRef);
            console.log(`   ✅ Image deleted from Storage`);
          }
        } catch (storageError: any) {
          console.error(`   ⚠️  Failed to delete image: ${storageError.message}`);
        }
      }

      // Delete thumbnail from Storage
      if (itemData.thumbnailUrl) {
        try {
          const urlObj = new URL(itemData.thumbnailUrl);
          const pathMatch = urlObj.pathname.match(/\/o\/([^?]+)/);
          if (pathMatch) {
            const path = decodeURIComponent(pathMatch[1]);
            console.log(`   🗑️  Deleting thumbnail from Storage...`);
            const storageRef = ref(storage, path);
            await deleteObject(storageRef);
            console.log(`   ✅ Thumbnail deleted from Storage`);
          }
        } catch (storageError: any) {
          console.error(`   ⚠️  Failed to delete thumbnail: ${storageError.message}`);
        }
      }

      // Delete video from Storage
      if (itemData.videoUrl) {
        try {
          const urlObj = new URL(itemData.videoUrl);
          const pathMatch = urlObj.pathname.match(/\/o\/([^?]+)/);
          if (pathMatch) {
            const path = decodeURIComponent(pathMatch[1]);
            console.log(`   🗑️  Deleting video from Storage...`);
            const storageRef = ref(storage, path);
            await deleteObject(storageRef);
            console.log(`   ✅ Video deleted from Storage`);
          }
        } catch (storageError: any) {
          console.error(`   ⚠️  Failed to delete video: ${storageError.message}`);
        }
      }

      // Delete Firestore document
      console.log(`   🗑️  Deleting Firestore document...`);
      await deleteDoc(itemRef);
      console.log(`   ✅ Firestore document deleted\n`);
    }

    console.log(`✅ Successfully deleted all photos with name: "${photoName}"\n`);

  } catch (error: any) {
    console.error('❌ Error deleting photo:', error.message);
    throw error;
  }
}

// Main execution
const photoName = process.argv[2];

if (!photoName) {
  console.error('Usage: npm run delete-photo "Photo Name"');
  console.error('Example: npm run delete-photo "Thử thách trên cát"');
  process.exit(1);
}

deletePhotoByName(photoName)
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
