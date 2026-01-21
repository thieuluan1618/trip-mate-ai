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
