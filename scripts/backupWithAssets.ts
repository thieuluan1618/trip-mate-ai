/**
 * Complete backup script - downloads all Firebase data AND image/video files
 * Usage: npm run backup-full
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import https from 'https';
import http from 'http';
import { URL } from 'url';

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
  // Backup file paths
  backedUpImageUrl?: string;
  backedUpThumbnailUrl?: string;
  backedUpVideoUrl?: string;
}

interface BackupData {
  backupDate: string;
  version: string;
  trips: any[];
  items: BackupItem[];
}

/**
 * Download a file from URL to local path (follows redirects)
 */
function downloadFile(url: string, filepath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    const makeRequest = (currentUrl: string) => {
      const urlObj = new URL(currentUrl);
      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || (url.startsWith('https') ? '443' : '80'),
        path: urlObj.pathname + urlObj.search,
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Node.js Backup Script)',
        },
      };

      const req = protocol.request(options, (response: any) => {
        // Handle redirects
        if (response.statusCode === 301 || response.statusCode === 302) {
          const redirectUrl = response.headers.location;
          if (redirectUrl) {
            makeRequest(redirectUrl);
            return;
          }
        }

        if (response.statusCode === 200) {
          const chunks: Buffer[] = [];
          response.on('data', (chunk: Buffer) => chunks.push(chunk));
          response.on('end', () => {
            const buffer = Buffer.concat(chunks);
            writeFile(filepath, buffer)
              .then(() => resolve())
              .catch(reject);
          });
        } else {
          reject(new Error(`Failed to download: ${response.statusCode}`));
        }
      });

      req.on('error', reject);
      req.setTimeout(30000, () => {
        req.destroy();
        reject(new Error('Download timeout'));
      });
      req.end();
    };

    makeRequest(url);
  });
}

/**
 * Backup all Firebase data including asset files
 */
async function backupWithAssets() {
  console.log('\n🔄 Starting complete Firebase backup (including assets)...\n');

  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const backupDir = join(process.cwd(), 'backups', `backup-${timestamp}`);
    const assetsDir = join(backupDir, 'assets');

    // Create directories
    await mkdir(assetsDir, { recursive: true });
    console.log(`📁 Created backup directory: ${backupDir}\n`);

    const backupData: BackupData = {
      backupDate: new Date().toISOString(),
      version: '2.0', // Version 2 includes asset files
      trips: [],
      items: [],
    };

    // Backup all trips
    console.log('📁 Fetching trips...');
    const tripsRef = collection(db, 'trips');
    const tripsSnapshot = await getDocs(tripsRef);

    for (const tripDoc of tripsSnapshot.docs) {
      const tripData = tripDoc.data();
      const trip = {
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

    // Backup all items and download assets
    console.log('📸 Fetching items and downloading assets...');
    let totalItems = 0;
    let downloadedFiles = 0;
    let skippedFiles = 0;

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

        // Download image
        if (item.imageUrl) {
          try {
            const ext = item.imageUrl.includes('.png') ? '.png' :
                       item.imageUrl.includes('.webp') ? '.webp' :
                       item.imageUrl.includes('.jpeg') ? '.jpg' : '.jpg';
            const filename = `${item.id}_original${ext}`;
            const filepath = join(assetsDir, filename);
            await downloadFile(item.imageUrl, filepath);
            item.backedUpImageUrl = `assets/${filename}`;
            downloadedFiles++;
            console.log(`    ✓ ${filename}`);
          } catch (err: any) {
            console.error(`    ⚠️  Failed to download image for "${item.name}": ${err.message}`);
            skippedFiles++;
          }
        }

        // Download thumbnail
        if (item.thumbnailUrl) {
          try {
            const filename = `${item.id}_thumb.webp`;
            const filepath = join(assetsDir, filename);
            await downloadFile(item.thumbnailUrl, filepath);
            item.backedUpThumbnailUrl = `assets/${filename}`;
            downloadedFiles++;
          } catch (err) {
            // Silently skip thumbnail errors
            skippedFiles++;
          }
        }

        // Download video
        if (item.videoUrl) {
          try {
            const ext = item.videoUrl.includes('.mp4') ? '.mp4' :
                       item.videoUrl.includes('.mov') ? '.mov' : '.mp4';
            const filename = `${item.id}_video${ext}`;
            const filepath = join(assetsDir, filename);
            await downloadFile(item.videoUrl, filepath);
            item.backedUpVideoUrl = `assets/${filename}`;
            downloadedFiles++;
            console.log(`    ✓ ${filename}`);
          } catch (err: any) {
            console.error(`    ⚠️  Failed to download video for "${item.name}": ${err.message}`);
            skippedFiles++;
          }
        }

        backupData.items.push(item);
        totalItems++;
      }

      console.log(`  ✓ Trip "${trip.tripName}": ${itemsSnapshot.docs.length} item(s)\n`);
    }

    console.log(`\n📊 Backup Summary:`);
    console.log(`   • ${totalItems} item(s) total`);
    console.log(`   • ${downloadedFiles} file(s) downloaded`);
    if (skippedFiles > 0) {
      console.log(`   • ${skippedFiles} file(s) skipped (errors)`);
    }

    // Save metadata to JSON
    const metadataPath = join(backupDir, 'backup-metadata.json');
    await writeFile(metadataPath, JSON.stringify(backupData, null, 2), 'utf-8');

    console.log(`\n✅ Metadata saved to: backup-metadata.json`);
    console.log(`✅ Assets saved to: assets/`);
    console.log(`\n📦 Complete backup location: ${backupDir}\n`);

    return backupData;
  } catch (error: any) {
    console.error('❌ Backup failed:', error.message);
    throw error;
  }
}

// Main execution
(async () => {
  try {
    await backupWithAssets();
    console.log('✅ Backup completed successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Backup failed:', error);
    process.exit(1);
  }
})();
