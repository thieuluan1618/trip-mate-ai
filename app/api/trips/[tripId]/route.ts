import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, updateDoc, deleteDoc, query, where, getDocs, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Trip } from '@/types';

// GET /api/trips/[tripId] - Get a single trip
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params;
    const tripRef = doc(db, 'trips', tripId);
    const snapshot = await getDoc(tripRef);

    if (!snapshot.exists()) {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      );
    }

    const data = snapshot.data();
    const trip: Trip = {
      id: snapshot.id,
      ...(data as Omit<Trip, 'id'>),
      startDate: data.startDate?.toDate() || new Date(),
      endDate: data.endDate?.toDate() || undefined,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    };

    return NextResponse.json({ trip });
  } catch (error) {
    console.error('Failed to get trip:', error);
    return NextResponse.json(
      { error: 'Failed to get trip' },
      { status: 500 }
    );
  }
}

// PATCH /api/trips/[tripId] - Update trip
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params;
    const body = await request.json();

    const tripRef = doc(db, 'trips', tripId);
    const updateData: Record<string, any> = {
      ...body,
      updatedAt: new Date(),
    };

    // Convert Date fields to Timestamp
    if (body.startDate) {
      updateData.startDate = new Date(body.startDate);
    }
    if (body.endDate) {
      updateData.endDate = new Date(body.endDate);
    }

    await updateDoc(tripRef, updateData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update trip:', error);
    return NextResponse.json(
      { error: 'Failed to update trip' },
      { status: 500 }
    );
  }
}

// DELETE /api/trips/[tripId] - Delete trip and all items
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params;

    // Delete all items first
    const itemsRef = collection(db, 'trips', tripId, 'items');
    const snapshot = await getDocs(itemsRef);
    const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref));
    await Promise.all(deletePromises);

    // Delete the trip
    const tripRef = doc(db, 'trips', tripId);
    await deleteDoc(tripRef);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete trip:', error);
    return NextResponse.json(
      { error: 'Failed to delete trip' },
      { status: 500 }
    );
  }
}
