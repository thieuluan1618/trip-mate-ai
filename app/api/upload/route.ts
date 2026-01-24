import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import sharp from 'sharp';

const MAX_IMAGE_SIZE = 50 * 1024 * 1024; // 50MB for images
const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500MB for videos

// POST /api/upload - Upload file to Firebase Storage
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const tripId = formData.get('tripId') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!tripId) {
      return NextResponse.json(
        { error: 'No tripId provided' },
        { status: 400 }
      );
    }

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    // Validate file type
    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: 'Only image and video files are allowed' },
        { status: 400 }
      );
    }

    // Validate file size based on type
    const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
    if (file.size > maxSize) {
      const limitMB = maxSize / (1024 * 1024);
      return NextResponse.json(
        { error: `File size exceeds ${limitMB}MB limit` },
        { status: 400 }
      );
    }

    // Generate storage paths
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const basePath = `trips/${tripId}/items/${timestamp}`;
    const originalPath = `${basePath}_${sanitizedName}`;

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload original file
    const originalRef = ref(storage, originalPath);
    const originalSnapshot = await uploadBytes(originalRef, buffer, {
      contentType: file.type,
    });
    const originalURL = await getDownloadURL(originalSnapshot.ref);

    // For videos, return without thumbnail processing
    if (isVideo) {
      return NextResponse.json({
        url: originalURL,
        thumbnailUrl: '',
        blurDataUrl: '',
        path: originalPath,
        thumbnailPath: '',
        name: file.name,
        size: file.size,
        type: file.type,
        isVideo: true,
      });
    }

    // For images, generate thumbnail and blur placeholder
    const thumbnailPath = `${basePath}_thumb_${sanitizedName}`;
    let thumbnailBuffer: Buffer;
    let blurDataUrl = '';

    try {
      thumbnailBuffer = await sharp(buffer)
        .resize(400, 400, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 75 })
        .toBuffer();

      const blurBuffer = await sharp(buffer)
        .resize(16, 16, { fit: 'inside' })
        .webp({ quality: 20 })
        .toBuffer();
      blurDataUrl = `data:image/webp;base64,${blurBuffer.toString('base64')}`;
    } catch (sharpError) {
      console.error('Sharp processing failed, uploading original only:', sharpError);
      thumbnailBuffer = buffer;
    }

    // Upload thumbnail
    const thumbnailRef = ref(storage, thumbnailPath);
    const thumbnailSnapshot = await uploadBytes(thumbnailRef, thumbnailBuffer, {
      contentType: 'image/webp',
    });
    const thumbnailURL = await getDownloadURL(thumbnailSnapshot.ref);

    return NextResponse.json({
      url: originalURL,
      thumbnailUrl: thumbnailURL,
      blurDataUrl,
      path: originalPath,
      thumbnailPath,
      name: file.name,
      size: file.size,
      type: file.type,
      isVideo: false,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

// DELETE /api/upload - Delete file from Firebase Storage
export async function DELETE(request: NextRequest) {
  try {
    const { path } = await request.json();

    if (!path) {
      return NextResponse.json(
        { error: 'No path provided' },
        { status: 400 }
      );
    }

    const storageRef = ref(storage, path);
    await deleteObject(storageRef);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}
