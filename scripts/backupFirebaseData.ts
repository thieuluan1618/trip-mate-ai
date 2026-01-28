/**
 * Backup script to export all Firebase data to JSON
 * Usage: npm run backup-data
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs, getDoc, doc } from 'firebase/firestore';
import { writeFile } from 'fs/promises';
import { join } from 'path';

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

interface BackupTrip {
  id: string;
  tripName: string;
  totalBudget: number;
  startDate: any;
  endDate: any;
  currency: string;
  memberCount: number;
  createdBy: string;
  createdAt: any;
  updatedAt: any;
}

interface BackupItem {
  id: string;
  tripId: string;
  name: string;
  amount: number;
  category: string;
  type: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  blurDataUrl?: string;
  videoUrl?: string;
  timestamp: any;
  description?: string;
  createdBy: string;
  createdAt: any;
  updatedAt: any;
}

interface BackupData {
  backupDate: string;
  version: string;
  trips: BackupTrip[];
  items: BackupItem[];
}

/**
 * Backup all Firebase data to JSON file
 */
async function backupData() {
  console.log('\n🔄 Starting Firebase backup...\n');

  try {
    const backupData: BackupData = {
      backupDate: new Date().toISOString(),
      version: '1.0',
      trips: [],
      items: [],
    };

    // Backup all trips
    console.log('📁 Fetching trips...');
    const tripsRef = collection(db, 'trips');
    const tripsSnapshot = await getDocs(tripsRef);

    for (const tripDoc of tripsSnapshot.docs) {
      const tripData = tripDoc.data();
      const trip: BackupTrip = {
        id: tripDoc.id,
        tripName: tripData.tripName,
        totalBudget: tripData.totalBudget,
        startDate: tripData.startDate?.toDate?.() || tripData.startDate,
        endDate: tripData.endDate?.toDate?.() || tripData.endDate,
        currency: tripData.currency,
        memberCount: tripData.memberCount,
        createdBy: tripData.createdBy,
        createdAt: tripData.createdAt?.toDate?.() || tripData.createdAt,
        updatedAt: tripData.updatedAt?.toDate?.() || tripData.updatedAt,
      };
      backupData.trips.push(trip);
      console.log(`  ✓ Trip: ${trip.tripName} (${trip.id})`);
    }

    console.log(`\n✅ Backed up ${backupData.trips.length} trip(s)\n`);

    // Backup all items for each trip
    console.log('📸 Fetching items...');
    let totalItems = 0;

    for (const trip of backupData.trips) {
      const itemsRef = collection(db, 'trips', trip.id, 'items');
      const itemsSnapshot = await getDocs(itemsRef);

      for (const itemDoc of itemsSnapshot.docs) {
        const itemData = itemDoc.data();
        const item: BackupItem = {
          id: itemDoc.id,
          tripId: trip.id,
          name: itemData.name,
          amount: itemData.amount,
          category: itemData.category,
          type: itemData.type,
          imageUrl: itemData.imageUrl,
          thumbnailUrl: itemData.thumbnailUrl,
          blurDataUrl: itemData.blurDataUrl,
          videoUrl: itemData.videoUrl,
          timestamp: itemData.timestamp?.toDate?.() || itemData.timestamp,
          description: itemData.description,
          createdBy: itemData.createdBy,
          createdAt: itemData.createdAt?.toDate?.() || itemData.createdAt,
          updatedAt: itemData.updatedAt?.toDate?.() || itemData.updatedAt,
        };
        backupData.items.push(item);
        totalItems++;
      }

      console.log(`  ✓ Trip "${trip.tripName}": ${itemsSnapshot.docs.length} item(s)`);
    }

    console.log(`\n✅ Backed up ${totalItems} item(s) total\n`);

    // Save to JSON file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `firebase-backup-${timestamp}.json`;
    const filepath = join(process.cwd(), 'backups', filename);

    await writeFile(filepath, JSON.stringify(backupData, null, 2), 'utf-8');

    console.log(`✅ Backup saved to: ${filepath}`);
    console.log(`📊 File size: ${(JSON.stringify(backupData).length / 1024).toFixed(2)} KB\n`);

    return backupData;
  } catch (error: any) {
    console.error('❌ Backup failed:', error.message);
    throw error;
  }
}

// Main execution
(async () => {
  try {
    await backupData();
    console.log('✅ Backup completed successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Backup failed:', error);
    process.exit(1);
  }
})();
