import imageCompression from 'browser-image-compression';

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
