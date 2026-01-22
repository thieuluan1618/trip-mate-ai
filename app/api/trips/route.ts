import { NextRequest, NextResponse } from 'next/server';
import { collection, query, where, orderBy, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Trip } from '@/types';

// GET /api/trips?userId=xxx - Get all trips for a user
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    const tripsRef = collection(db, 'trips');
    const q = query(
      tripsRef,
      where('createdBy', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);

    const trips = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Trip, 'id'>),
      startDate: doc.data().startDate?.toDate() || new Date(),
      endDate: doc.data().endDate?.toDate() || undefined,
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    }));

    return NextResponse.json({ trips });
  } catch (error) {
    console.error('Failed to get user trips:', error);
    return NextResponse.json(
      { error: 'Failed to get trips' },
      { status: 500 }
    );
  }
}

// POST /api/trips - Create a new trip
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tripName, totalBudget, startDate, endDate, currency, memberCount, createdBy } = body;

    if (!tripName || !totalBudget || !startDate || !currency || !memberCount || !createdBy) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const tripsRef = collection(db, 'trips');
    const now = new Date();
    const docRef = await addDoc(tripsRef, {
      tripName,
      totalBudget,
      startDate: Timestamp.fromDate(new Date(startDate)),
      endDate: endDate ? Timestamp.fromDate(new Date(endDate)) : null,
      currency,
      memberCount,
      createdBy,
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
    });

    return NextResponse.json({ tripId: docRef.id }, { status: 201 });
  } catch (error) {
    console.error('Failed to create trip:', error);
    return NextResponse.json(
      { error: 'Failed to create trip' },
      { status: 500 }
    );
  }
}
