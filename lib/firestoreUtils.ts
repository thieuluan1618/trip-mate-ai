import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { Trip, TripItem } from '@/types';

const TRIPS_COLLECTION = 'trips';
const ITEMS_SUBCOLLECTION = 'items';

// ==================== TRIP FUNCTIONS ====================

/**
 * Get all trips for a user
 */
export const getUserTrips = async (userId: string): Promise<Trip[]> => {
  try {
    const tripsRef = collection(db, TRIPS_COLLECTION);
    const q = query(
      tripsRef,
      where('createdBy', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Trip, 'id'>),
      startDate: doc.data().startDate?.toDate() || new Date(),
      endDate: doc.data().endDate?.toDate() || undefined,
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    }));
  } catch (error) {
    console.error('Failed to get user trips:', error);
    return [];
  }
};

/**
 * Get trip by ID
 */
export const getTripById = async (tripId: string): Promise<Trip | null> => {
  try {
    const tripRef = doc(db, TRIPS_COLLECTION, tripId);
    const snapshot = await getDoc(tripRef);

    if (!snapshot.exists()) {
      return null;
    }

    const data = snapshot.data();
    return {
      id: snapshot.id,
      ...(data as Omit<Trip, 'id'>),
      startDate: data.startDate?.toDate() || new Date(),
      endDate: data.endDate?.toDate() || undefined,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    };
  } catch (error) {
    console.error('Failed to get trip:', error);
    return null;
  }
};

/**
 * Create a new trip
 */
export const createTrip = async (
  trip: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  try {
    const tripsRef = collection(db, TRIPS_COLLECTION);
    const now = new Date();
    const docRef = await addDoc(tripsRef, {
      ...trip,
      startDate: Timestamp.fromDate(new Date(trip.startDate)),
      endDate: trip.endDate ? Timestamp.fromDate(new Date(trip.endDate)) : null,
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
    });
    return docRef.id;
  } catch (error) {
    console.error('Failed to create trip:', error);
    throw error;
  }
};

/**
 * Update trip details
 */
export const updateTrip = async (
  tripId: string,
  data: Partial<Omit<Trip, 'id' | 'createdAt' | 'createdBy'>>
): Promise<void> => {
  try {
    const tripRef = doc(db, TRIPS_COLLECTION, tripId);
    const updateData: Record<string, any> = {
      ...data,
      updatedAt: Timestamp.fromDate(new Date()),
    };

    if (data.startDate) {
      updateData.startDate = Timestamp.fromDate(new Date(data.startDate));
    }
    if (data.endDate) {
      updateData.endDate = Timestamp.fromDate(new Date(data.endDate));
    }

    await updateDoc(tripRef, updateData);
  } catch (error) {
    console.error('Failed to update trip:', error);
    throw error;
  }
};

/**
 * Delete a trip and all its items
 */
export const deleteTrip = async (tripId: string): Promise<void> => {
  try {
    // Delete all items first
    const itemsRef = collection(db, TRIPS_COLLECTION, tripId, ITEMS_SUBCOLLECTION);
    const snapshot = await getDocs(itemsRef);
    const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref));
    await Promise.all(deletePromises);

    // Delete the trip
    const tripRef = doc(db, TRIPS_COLLECTION, tripId);
    await deleteDoc(tripRef);
  } catch (error) {
    console.error('Failed to delete trip:', error);
    throw error;
  }
};

/**
 * Subscribe to user's trips (real-time)
 */
export const subscribeUserTrips = (
  userId: string,
  callback: (trips: Trip[]) => void
): (() => void) => {
  try {
    const tripsRef = collection(db, TRIPS_COLLECTION);
    const q = query(
      tripsRef,
      where('createdBy', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const trips = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Trip, 'id'>),
        startDate: doc.data().startDate?.toDate() || new Date(),
        endDate: doc.data().endDate?.toDate() || undefined,
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      }));
      callback(trips);
    });

    return unsubscribe;
  } catch (error) {
    console.error('Failed to subscribe to trips:', error);
    return () => {};
  }
};

// ==================== TRIP ITEM FUNCTIONS ====================

/**
 * Save trip item to Firestore
 */
export const saveTripItem = async (
  tripId: string,
  item: Omit<TripItem, 'id'>
): Promise<string> => {
  try {
    const itemsRef = collection(db, TRIPS_COLLECTION, tripId, ITEMS_SUBCOLLECTION);
    const docRef = await addDoc(itemsRef, {
      ...item,
      timestamp: Timestamp.fromDate(new Date(item.timestamp)),
      createdAt: Timestamp.fromDate(new Date(item.createdAt)),
      updatedAt: Timestamp.fromDate(new Date(item.updatedAt)),
    });
    return docRef.id;
  } catch (error) {
    console.error('Failed to save trip item:', error);
    throw error;
  }
};

/**
 * Load all items for a trip
 */
export const loadTripItems = async (tripId: string): Promise<TripItem[]> => {
  try {
    const itemsRef = collection(db, TRIPS_COLLECTION, tripId, ITEMS_SUBCOLLECTION);
    const q = query(itemsRef, orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<TripItem, 'id'>),
      timestamp: doc.data().timestamp?.toDate() || new Date(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    }));
  } catch (error) {
    console.error('Failed to load trip items:', error);
    return [];
  }
};

/**
 * Subscribe to real-time updates for trip items
 */
export const subscribeTripItems = (
  tripId: string,
  callback: (items: TripItem[]) => void
): (() => void) => {
  try {
    const itemsRef = collection(db, TRIPS_COLLECTION, tripId, ITEMS_SUBCOLLECTION);
    const q = query(itemsRef, orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<TripItem, 'id'>),
        timestamp: doc.data().timestamp?.toDate() || new Date(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      }));
      callback(items);
    });

    return unsubscribe;
  } catch (error) {
    console.error('Failed to subscribe to trip items:', error);
    return () => {};
  }
};

/**
 * Create or get default trip for guest user
 */
export const getOrCreateDefaultTrip = async (userId: string): Promise<string> => {
  try {
    const tripsRef = collection(db, TRIPS_COLLECTION);
    const q = query(
      tripsRef,
      where('createdBy', '==', userId),
      where('tripName', '==', 'My Trip')
    );
    const snapshot = await getDocs(q);

    if (snapshot.size > 0) {
      return snapshot.docs[0].id;
    }

    // Create default trip if doesn't exist
    const docRef = await addDoc(tripsRef, {
      tripName: 'My Trip',
      totalBudget: 10000,
      startDate: Timestamp.fromDate(new Date()),
      currency: 'VND',
      memberCount: 1,
      createdBy: userId,
      createdAt: Timestamp.fromDate(new Date()),
      updatedAt: Timestamp.fromDate(new Date()),
    });

    return docRef.id;
  } catch (error) {
    console.error('Failed to get or create default trip:', error);
    throw error;
  }
};

/**
 * Seed trip with sample data
 */
export const seedTripData = async (
  userId: string,
  tripInfo: {
    tripName: string;
    totalBudget: number;
    startDate: Date;
    endDate?: Date;
    currency: string;
    memberCount: number;
  },
  items: Omit<TripItem, 'id' | 'tripId' | 'createdBy' | 'createdAt' | 'updatedAt'>[]
): Promise<string> => {
  try {
    // 1. Create the trip
    const tripId = await createTrip({
      ...tripInfo,
      createdBy: userId,
    });

    // 2. Add all items
    const now = new Date();
    for (const item of items) {
      await saveTripItem(tripId, {
        ...item,
        tripId,
        createdBy: userId,
        createdAt: now,
        updatedAt: now,
      });
    }

    console.log(`Seeded trip ${tripId} with ${items.length} items`);
    return tripId;
  } catch (error) {
    console.error('Failed to seed trip data:', error);
    throw error;
  }
};
