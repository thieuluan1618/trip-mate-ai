import imageCompression from 'browser-image-compression';
import exifr from 'exifr';

export const compressImage = async (file: File, options?: {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
}): Promise<File> => {
  const defaultOptions = {
    maxSizeMB: 0.5, // 500KB
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  };

  try {
    const compressedFile = await imageCompression(file, {
      ...defaultOptions,
      ...options,
    });
    return compressedFile;
  } catch (error) {
    console.error('Image compression failed:', error);
    return file; // Return original if compression fails
  }
};

export const createThumbnail = async (file: File): Promise<File> => {
  try {
    const thumbnailFile = await imageCompression(file, {
      maxSizeMB: 0.05, // 50KB for thumbnails
      maxWidthOrHeight: 400, // Small size for grid
      useWebWorker: true,
    });
    return thumbnailFile;
  } catch (error) {
    console.error('Thumbnail creation failed:', error);
    return file;
  }
};

export const generateBlurDataUrl = async (file: File): Promise<string> => {
  try {
    const tinyImage = await imageCompression(file, {
      maxSizeMB: 0.001, // ~1KB
      maxWidthOrHeight: 16, // Tiny for blur placeholder
      useWebWorker: true,
    });
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string); // Full data URL for blur placeholder
      };
      reader.onerror = reject;
      reader.readAsDataURL(tinyImage);
    });
  } catch (error) {
    console.error('Blur data URL generation failed:', error);
    return '';
  }
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      resolve(base64.split(',')[1]); // Remove data:image/... prefix
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const fileToPreviewUrl = (file: File): string => {
  return URL.createObjectURL(file);
};

/**
 * Generate thumbnail from video file (extracts frame at 1 second)
 */
export const generateVideoThumbnail = (file: File): Promise<{ thumbnail: Blob; blurDataUrl: string }> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;
    
    video.onloadeddata = () => {
      // Seek to 1 second or 10% of duration (whichever is smaller)
      video.currentTime = Math.min(1, video.duration * 0.1);
    };
    
    video.onseeked = () => {
      try {
        // Create thumbnail canvas (400px width)
        const canvas = document.createElement('canvas');
        const aspectRatio = video.videoHeight / video.videoWidth;
        canvas.width = 400;
        canvas.height = Math.round(400 * aspectRatio);
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Generate thumbnail blob
        canvas.toBlob(
          (thumbnailBlob) => {
            if (!thumbnailBlob) {
              reject(new Error('Failed to create thumbnail blob'));
              return;
            }
            
            // Generate blur placeholder (16px)
            const blurCanvas = document.createElement('canvas');
            blurCanvas.width = 16;
            blurCanvas.height = Math.round(16 * aspectRatio);
            const blurCtx = blurCanvas.getContext('2d');
            blurCtx?.drawImage(video, 0, 0, blurCanvas.width, blurCanvas.height);
            const blurDataUrl = blurCanvas.toDataURL('image/webp', 0.2);
            
            // Cleanup
            URL.revokeObjectURL(video.src);
            
            resolve({ thumbnail: thumbnailBlob, blurDataUrl });
          },
          'image/webp',
          0.8
        );
      } catch (error) {
        reject(error);
      }
    };
    
    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error('Failed to load video'));
    };
    
    video.src = URL.createObjectURL(file);
  });
};

/**
 * Extract the original date from image EXIF data
 * Falls back to file lastModified or current date if no EXIF data
 */
export const getImageDate = async (file: File): Promise<Date> => {
  try {
    const exif = await exifr.parse(file, {
      pick: ['DateTimeOriginal', 'CreateDate', 'ModifyDate'],
    });
    
    if (exif?.DateTimeOriginal) {
      return new Date(exif.DateTimeOriginal);
    }
    if (exif?.CreateDate) {
      return new Date(exif.CreateDate);
    }
    if (exif?.ModifyDate) {
      return new Date(exif.ModifyDate);
    }
  } catch (error) {
    console.warn('Failed to extract EXIF date:', error);
  }
  
  // Fallback to file's lastModified or current date
  if (file.lastModified) {
    return new Date(file.lastModified);
  }
  return new Date();
};
