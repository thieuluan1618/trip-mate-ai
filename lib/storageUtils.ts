import { storage } from './firebase';
import { ref, uploadBytes, getBytes, getDownloadURL } from 'firebase/storage';

/**
 * Upload file to Firebase Storage
 * @param file - File to upload
 * @param path - Storage path (e.g., "trips/{tripId}/items/{itemId}")
 * @returns Download URL of uploaded file
 */
export const uploadFileToStorage = async (file: File, path: string): Promise<string> => {
  try {
    const storageRef = ref(storage, path);
    
    // Upload file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Upload to Firebase Storage failed:', error);
    throw error;
  }
};

/**
 * Generate unique storage path for trip item
 * @param tripId - Trip ID
 * @param fileName - Original file name
 * @returns Storage path
 */
export const generateStoragePath = (tripId: string, fileName: string): string => {
  const timestamp = Date.now();
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `trips/${tripId}/items/${timestamp}_${sanitizedName}`;
};

/**
 * Delete file from Firebase Storage
 * @param path - Storage path
 */
export const deleteFileFromStorage = async (path: string): Promise<void> => {
  try {
    const storageRef = ref(storage, path);
    // Note: Firebase SDK doesn't have direct delete in client SDK
    // This is for future use when backend is implemented
    console.log('Delete function requires backend implementation:', path);
  } catch (error) {
    console.error('Delete from Firebase Storage failed:', error);
    throw error;
  }
};
