/**
 * Migration script to generate thumbnails for existing videos using ffmpeg
 * 
 * Prerequisites:
 *   brew install ffmpeg (macOS)
 * 
 * Usage:
 *   npx dotenv -e .env.local -- npx tsx scripts/migrate-video-thumbnails.ts
 * 
 * Options:
 *   --dry-run    Preview changes without modifying data
 *   --limit=N    Process only N items
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL, uploadBytes } from 'firebase/storage';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

console.log('🔧 Video Thumbnail Migration Script (with ffmpeg)');
console.log('Using project:', firebaseConfig.projectId);

// Check ffmpeg is installed
try {
  execSync('ffmpeg -version', { stdio: 'pipe' });
  console.log('✅ ffmpeg detected\n');
} catch {
  console.error('❌ ffmpeg not found. Install with: brew install ffmpeg');
  process.exit(1);
}

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

interface VideoToMigrate {
  tripId: string;
  itemId: string;
  videoUrl: string;
  name?: string;
}

async function downloadFile(url: string, destPath: string): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to download: ${response.status}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(destPath, buffer);
}

async function generateVideoThumbnail(videoPath: string): Promise<{ thumbnailBuffer: Buffer; blurDataUrl: string }> {
  const tmpDir = os.tmpdir();
  const thumbPath = path.join(tmpDir, `thumb_${Date.now()}.webp`);
  const blurPath = path.join(tmpDir, `blur_${Date.now()}.webp`);

  try {
    // Generate 400px thumbnail at 1 second
    execSync(
      `ffmpeg -y -i "${videoPath}" -ss 00:00:01 -vframes 1 -vf "scale=400:-1" -q:v 80 "${thumbPath}"`,
      { stdio: 'pipe' }
    );

    // Generate 16px blur placeholder
    execSync(
      `ffmpeg -y -i "${videoPath}" -ss 00:00:01 -vframes 1 -vf "scale=16:-1" -q:v 20 "${blurPath}"`,
      { stdio: 'pipe' }
    );

    const thumbnailBuffer = fs.readFileSync(thumbPath);
    const blurBuffer = fs.readFileSync(blurPath);
    const blurDataUrl = `data:image/webp;base64,${blurBuffer.toString('base64')}`;

    // Cleanup
    fs.unlinkSync(thumbPath);
    fs.unlinkSync(blurPath);

    return { thumbnailBuffer, blurDataUrl };
  } catch (error) {
    // Cleanup on error
    if (fs.existsSync(thumbPath)) fs.unlinkSync(thumbPath);
    if (fs.existsSync(blurPath)) fs.unlinkSync(blurPath);
    throw error;
  }
}

async function uploadThumbnail(
  thumbnailBuffer: Buffer,
  tripId: string,
  itemId: string
): Promise<string> {
  const thumbnailPath = `trips/${tripId}/items/${itemId}_video_thumb.webp`;
  const thumbnailRef = ref(storage, thumbnailPath);
  
  await uploadBytes(thumbnailRef, thumbnailBuffer, {
    contentType: 'image/webp',
  });
  
  return getDownloadURL(thumbnailRef);
}

async function migrate() {
  console.log('📦 Fetching videos without thumbnails...\n');

  const tripsSnapshot = await getDocs(collection(db, 'trips'));
  const videosToMigrate: VideoToMigrate[] = [];

  for (const tripDoc of tripsSnapshot.docs) {
    const tripId = tripDoc.id;
    const itemsSnapshot = await getDocs(collection(db, 'trips', tripId, 'items'));
    
    for (const itemDoc of itemsSnapshot.docs) {
      const data = itemDoc.data();
      
      if (data.videoUrl && !data.thumbnailUrl) {
        videosToMigrate.push({
          tripId,
          itemId: itemDoc.id,
          videoUrl: data.videoUrl,
          name: data.name,
        });
      }
    }
  }

  console.log(`Found ${videosToMigrate.length} videos to migrate\n`);

  if (videosToMigrate.length === 0) {
    console.log('✅ All videos already have thumbnails!');
    process.exit(0);
  }

  const toProcess = videosToMigrate.slice(0, limit);
  let processed = 0;
  let success = 0;
  let failed = 0;

  const tmpDir = os.tmpdir();

  for (const video of toProcess) {
    processed++;
    const prefix = `[${processed}/${toProcess.length}]`;
    
    try {
      console.log(`${prefix} Processing: ${video.name || video.itemId}`);
      
      if (isDryRun) {
        console.log(`  ↳ Would generate thumbnail for video`);
        success++;
        continue;
      }

      // Download video to temp file
      const videoPath = path.join(tmpDir, `video_${Date.now()}.mp4`);
      console.log(`  ↳ Downloading video...`);
      await downloadFile(video.videoUrl, videoPath);
      const videoSize = fs.statSync(videoPath).size;
      console.log(`  ↳ Downloaded: ${(videoSize / (1024 * 1024)).toFixed(1)}MB`);

      // Generate thumbnail
      console.log(`  ↳ Generating thumbnail with ffmpeg...`);
      const { thumbnailBuffer, blurDataUrl } = await generateVideoThumbnail(videoPath);
      console.log(`  ↳ Thumbnail: ${(thumbnailBuffer.length / 1024).toFixed(1)}KB`);

      // Cleanup video
      fs.unlinkSync(videoPath);

      // Upload thumbnail
      const thumbnailUrl = await uploadThumbnail(thumbnailBuffer, video.tripId, video.itemId);
      console.log(`  ↳ Uploaded thumbnail`);

      // Update Firestore
      const itemRef = doc(db, 'trips', video.tripId, 'items', video.itemId);
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
