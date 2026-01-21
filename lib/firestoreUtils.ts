import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { TripItem } from '@/types';

const TRIPS_COLLECTION = 'trips';
const ITEMS_SUBCOLLECTION = 'items';

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
