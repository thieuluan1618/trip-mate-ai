import { NextRequest, NextResponse } from 'next/server';
import { doc, deleteDoc, getDoc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';

// DELETE /api/trips/[tripId]/items/[itemId] - Delete a trip item and its associated file
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string; itemId: string }> }
) {
  try {
    const { tripId, itemId } = await params;

    console.log(`Delete request - TripID: ${tripId}, ItemID: ${itemId}`);

    // 1. Get the item first to check if it has associated files
    const itemRef = doc(db, 'trips', tripId, 'items', itemId);
    const itemSnapshot = await getDoc(itemRef);

    console.log(`Item exists: ${itemSnapshot.exists()}`);

    if (!itemSnapshot.exists()) {
      // Item doesn't exist - treat as successful delete (idempotent)
      // This handles cases where item was already deleted or never saved to Firestore
      console.log(`Item ${itemId} not found in trip ${tripId} - treating as already deleted`);
      return NextResponse.json({ success: true, alreadyDeleted: true });
    }

    const itemData = itemSnapshot.data();

    // 2. Delete associated file from Storage if exists
    const imageUrl = itemData.imageUrl;
    const videoUrl = itemData.videoUrl;

    if (imageUrl) {
      try {
        // Extract path from Firebase Storage URL
        // URL format: https://firebasestorage.googleapis.com/v0/b/bucket/o/path?alt=media
        const urlObj = new URL(imageUrl);
        const pathMatch = urlObj.pathname.match(/\/o\/([^?]+)/);
        if (pathMatch) {
          const path = decodeURIComponent(pathMatch[1]);
          const storageRef = ref(storage, path);
          await deleteObject(storageRef);
        }
      } catch (storageError) {
        console.error('Failed to delete image from storage:', storageError);
        // Continue with item deletion even if storage deletion fails
      }
    }

    if (videoUrl) {
      try {
        const urlObj = new URL(videoUrl);
        const pathMatch = urlObj.pathname.match(/\/o\/([^?]+)/);
        if (pathMatch) {
          const path = decodeURIComponent(pathMatch[1]);
          const storageRef = ref(storage, path);
          await deleteObject(storageRef);
        }
      } catch (storageError) {
        console.error('Failed to delete video from storage:', storageError);
        // Continue with item deletion even if storage deletion fails
      }
    }

    // 3. Delete the item from Firestore
    await deleteDoc(itemRef);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete trip item:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return NextResponse.json(
      {
        error: 'Failed to delete item',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
