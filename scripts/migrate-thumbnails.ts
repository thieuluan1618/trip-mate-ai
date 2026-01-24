/**
 * Migration script to generate thumbnails for existing images
 * 
 * Usage:
 *   npx dotenv -e .env.local -- npx tsx scripts/migrate-thumbnails.ts
 * 
 * Options:
 *   --dry-run    Preview changes without modifying data
 *   --limit=N    Process only N items
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc, query, collectionGroup } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL, uploadBytes } from 'firebase/storage';
import sharp from 'sharp';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

console.log('🔧 Thumbnail Migration Script');
console.log('Using project:', firebaseConfig.projectId);

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, 'trip-mate-ai');
const storage = getStorage(app);

// Parse CLI args
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const limitArg = args.find(a => a.startsWith('--limit='));
const limit = limitArg ? parseInt(limitArg.split('=')[1]) : Infinity;

if (isDryRun) console.log('🔍 DRY RUN - No changes will be made\n');
if (limit < Infinity) console.log(`📊 Processing max ${limit} items\n`);

interface ItemToMigrate {
  tripId: string;
  itemId: string;
  imageUrl: string;
  name?: string;
}

async function fetchImageAsBuffer(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function generateThumbnailAndBlur(imageBuffer: Buffer): Promise<{
  thumbnailBuffer: Buffer;
  blurDataUrl: string;
}> {
  // Generate thumbnail (400px, WebP)
  const thumbnailBuffer = await sharp(imageBuffer)
    .resize(400, 400, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 75 })
    .toBuffer();

  // Generate blur placeholder (16px tiny image)
  const blurBuffer = await sharp(imageBuffer)
    .resize(16, 16, { fit: 'inside' })
    .webp({ quality: 20 })
    .toBuffer();
  
  const blurDataUrl = `data:image/webp;base64,${blurBuffer.toString('base64')}`;

  return { thumbnailBuffer, blurDataUrl };
}

async function uploadThumbnail(
  thumbnailBuffer: Buffer,
  tripId: string,
  itemId: string
): Promise<string> {
  const thumbnailPath = `trips/${tripId}/items/${itemId}_thumb.webp`;
  const thumbnailRef = ref(storage, thumbnailPath);
  
  await uploadBytes(thumbnailRef, thumbnailBuffer, {
    contentType: 'image/webp',
  });
  
  return getDownloadURL(thumbnailRef);
}

async function migrate() {
  console.log('📦 Fetching items without thumbnails...\n');

  // Get all trips
  const tripsSnapshot = await getDocs(collection(db, 'trips'));
  const itemsToMigrate: ItemToMigrate[] = [];

  for (const tripDoc of tripsSnapshot.docs) {
    const tripId = tripDoc.id;
    const itemsSnapshot = await getDocs(collection(db, 'trips', tripId, 'items'));
    
    for (const itemDoc of itemsSnapshot.docs) {
      const data = itemDoc.data();
      
      // Only migrate items with imageUrl but no thumbnailUrl
      if (data.imageUrl && !data.thumbnailUrl) {
        itemsToMigrate.push({
          tripId,
          itemId: itemDoc.id,
          imageUrl: data.imageUrl,
          name: data.name,
        });
      }
    }
  }

  console.log(`Found ${itemsToMigrate.length} items to migrate\n`);

  if (itemsToMigrate.length === 0) {
    console.log('✅ All items already have thumbnails!');
    process.exit(0);
  }

  // Process items
  let processed = 0;
  let success = 0;
  let failed = 0;

  const toProcess = itemsToMigrate.slice(0, limit);

  for (const item of toProcess) {
    processed++;
    const prefix = `[${processed}/${toProcess.length}]`;
    
    try {
      console.log(`${prefix} Processing: ${item.name || item.itemId}`);
      
      if (isDryRun) {
        console.log(`  ↳ Would generate thumbnail for: ${item.imageUrl.substring(0, 60)}...`);
        success++;
        continue;
      }

      // 1. Fetch original image
      const imageBuffer = await fetchImageAsBuffer(item.imageUrl);
      console.log(`  ↳ Downloaded: ${(imageBuffer.length / 1024).toFixed(1)}KB`);

      // 2. Generate thumbnail and blur
      const { thumbnailBuffer, blurDataUrl } = await generateThumbnailAndBlur(imageBuffer);
      console.log(`  ↳ Thumbnail: ${(thumbnailBuffer.length / 1024).toFixed(1)}KB`);

      // 3. Upload thumbnail
      const thumbnailUrl = await uploadThumbnail(thumbnailBuffer, item.tripId, item.itemId);
      console.log(`  ↳ Uploaded thumbnail`);

      // 4. Update Firestore document
      const itemRef = doc(db, 'trips', item.tripId, 'items', item.itemId);
      await updateDoc(itemRef, {
        thumbnailUrl,
        blurDataUrl,
      });
      console.log(`  ✅ Updated document\n`);

      success++;
    } catch (error) {
      console.error(`  ❌ Failed: ${error}\n`);
      failed++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 Migration Summary');
  console.log('='.repeat(50));
  console.log(`Total processed: ${processed}`);
  console.log(`✅ Success: ${success}`);
  console.log(`❌ Failed: ${failed}`);
  
  if (isDryRun) {
    console.log('\n🔍 This was a dry run. Run without --dry-run to apply changes.');
  }

  process.exit(failed > 0 ? 1 : 0);
}

migrate().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
