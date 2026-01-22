/**
 * API Client utilities for server-side API calls
 * These functions call Next.js API routes instead of Firebase directly
 */

export interface AIAnalysisResult {
  type: 'expense' | 'memory';
  category: 'food' | 'stay' | 'transport' | 'scenery' | 'other';
  name: string;
  amount: number;
  description: string;
}

// ==================== AI API ====================

/**
 * Analyze image using Gemini AI via API route
 */
export const analyzeImage = async (
  base64Data: string,
  mimeType: string
): Promise<AIAnalysisResult> => {
  const response = await fetch('/api/ai/analyze-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ base64Data, mimeType }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to analyze image');
  }

  return response.json();
};

/**
 * Analyze trip expenses using Gemini AI via API route
 */
export const analyzeTripExpenses = async (expenses: any[]): Promise<string> => {
  const response = await fetch('/api/ai/analyze-expenses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ expenses }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to analyze expenses');
  }

  const data = await response.json();
  return data.analysis;
};

// ==================== TRIPS API ====================

/**
 * Get all trips for a user
 */
export const getUserTrips = async (userId: string) => {
  const response = await fetch(`/api/trips?userId=${encodeURIComponent(userId)}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get trips');
  }

  const data = await response.json();
  return data.trips;
};

/**
 * Get a single trip by ID
 */
export const getTripById = async (tripId: string) => {
  const response = await fetch(`/api/trips/${tripId}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get trip');
  }

  const data = await response.json();
  return data.trip;
};

/**
 * Create a new trip
 */
export const createTrip = async (trip: {
  tripName: string;
  totalBudget: number;
  startDate: Date | string;
  endDate?: Date | string;
  currency: string;
  memberCount: number;
  createdBy: string;
}) => {
  const response = await fetch('/api/trips', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(trip),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create trip');
  }

  const data = await response.json();
  return data.tripId;
};

/**
 * Update a trip
 */
export const updateTrip = async (
  tripId: string,
  data: Partial<{
    tripName: string;
    totalBudget: number;
    startDate: Date | string;
    endDate: Date | string;
    currency: string;
    memberCount: number;
  }>
) => {
  const response = await fetch(`/api/trips/${tripId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update trip');
  }
};

/**
 * Delete a trip
 */
export const deleteTrip = async (tripId: string) => {
  const response = await fetch(`/api/trips/${tripId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete trip');
  }
};

// ==================== ITEMS API ====================

/**
 * Get all items for a trip
 */
export const getTripItems = async (tripId: string) => {
  const response = await fetch(`/api/trips/${tripId}/items`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get items');
  }

  const data = await response.json();
  return data.items;
};

/**
 * Save a trip item
 */
export const saveTripItem = async (
  tripId: string,
  item: {
    name: string;
    amount?: number;
    category: string;
    type: string;
    imageUrl?: string;
    timestamp?: Date | string;
    description?: string;
    createdBy: string;
  }
) => {
  const response = await fetch(`/api/trips/${tripId}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to save item');
  }

  const data = await response.json();
  return data.itemId;
};

/**
 * Delete a trip item (and its associated files from Storage)
 */
export const deleteTripItem = async (tripId: string, itemId: string) => {
  const response = await fetch(`/api/trips/${tripId}/items/${itemId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete item');
  }
};

// ==================== STORAGE API ====================

/**
 * Upload file to Firebase Storage via API
 */
export const uploadFile = async (
  file: File,
  tripId: string
): Promise<{
  url: string;
  path: string;
  name: string;
  size: number;
  type: string;
}> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('tripId', tripId);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to upload file');
  }

  return response.json();
};

/**
 * Delete file from Firebase Storage via API
 */
export const deleteFile = async (path: string) => {
  const response = await fetch('/api/upload', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete file');
  }
};
