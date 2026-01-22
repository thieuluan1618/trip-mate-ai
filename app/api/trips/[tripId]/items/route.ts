import { NextRequest, NextResponse } from 'next/server';
import { collection, query, orderBy, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { TripItem } from '@/types';

// GET /api/trips/[tripId]/items - Get all items for a trip
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params;
    const itemsRef = collection(db, 'trips', tripId, 'items');
    const q = query(itemsRef, orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);

    const items = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<TripItem, 'id'>),
      timestamp: doc.data().timestamp?.toDate() || new Date(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    }));

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Failed to load trip items:', error);
    return NextResponse.json(
      { error: 'Failed to load items' },
      { status: 500 }
    );
  }
}

// POST /api/trips/[tripId]/items - Save trip item
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params;
    const body = await request.json();
    const {
      name,
      amount,
      category,
      type,
      imageUrl,
      timestamp,
      description,
      createdBy
    } = body;

    if (!name || !category || !type || !createdBy) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const itemsRef = collection(db, 'trips', tripId, 'items');
    const now = new Date();
    const docRef = await addDoc(itemsRef, {
      name,
      amount: amount || 0,
      category,
      type,
      imageUrl: imageUrl || null,
      timestamp: Timestamp.fromDate(new Date(timestamp || now)),
      description: description || '',
      createdBy,
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
    });

    return NextResponse.json({ itemId: docRef.id }, { status: 201 });
  } catch (error) {
    console.error('Failed to save trip item:', error);
    return NextResponse.json(
      { error: 'Failed to save item' },
      { status: 500 }
    );
  }
}
