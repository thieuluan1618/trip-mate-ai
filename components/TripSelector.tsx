'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Plus, Loader2, Check, MapPin } from 'lucide-react';
import { getUserTrips, createTrip } from '@/lib/apiClient';
import { Trip } from '@/types';

interface TripSelectorProps {
  currentTripId: string;
  currentTripName: string;
  userId: string;
  onTripSwitch: (tripId: string, tripName: string) => void;
}

export const TripSelector: React.FC<TripSelectorProps> = ({
  currentTripId,
  currentTripName,
  userId,
  onTripSwitch,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTripName, setNewTripName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchTrips = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getUserTrips(userId);
      setTrips(data);
    } catch (error) {
      console.error('Failed to fetch trips:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const handleToggle = () => {
    const opening = !isOpen;
    setIsOpen(opening);
    if (opening) {
      setShowCreateForm(false);
      setNewTripName('');
      fetchTrips();
    }
  };

  const handleSelectTrip = (trip: Trip) => {
    if (trip.id === currentTripId) {
      setIsOpen(false);
      return;
    }
    onTripSwitch(trip.id, trip.tripName);
    setIsOpen(false);
  };

  const handleCreateTrip = async () => {
    if (!newTripName.trim()) return;
    setIsCreating(true);
    try {
      const newTripId = await createTrip({
        tripName: newTripName.trim(),
        totalBudget: 0,
        startDate: new Date(),
        currency: 'VND',
        memberCount: 1,
        createdBy: userId,
      });
      onTripSwitch(newTripId, newTripName.trim());
      setIsOpen(false);
      setShowCreateForm(false);
      setNewTripName('');
    } catch (error) {
      console.error('Failed to create trip:', error);
    } finally {
      setIsCreating(false);
    }
  };

  // Focus input when create form shows
  useEffect(() => {
    if (showCreateForm) {
      inputRef.current?.focus();
    }
  }, [showCreateForm]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Escape to close
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const formatDate = (date: Date | string) =>
    new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={handleToggle}
        className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
      >
        <h1 className="text-xl font-black bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent truncate max-w-[200px]">
          {currentTripName || 'Trip Mate AI'}
        </h1>
        <ChevronDown
          className={`w-4 h-4 text-indigo-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-50">
          {/* Trip List */}
          <div className="max-h-64 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
              </div>
            ) : trips.length === 0 ? (
              <div className="py-6 text-center text-sm text-slate-400">
                Chưa có chuyến đi nào
              </div>
            ) : (
              trips.map((trip) => (
                <button
                  key={trip.id}
                  onClick={() => handleSelectTrip(trip)}
                  className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors ${
                    trip.id === currentTripId
                      ? 'bg-indigo-50'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  {trip.coverImageUrl ? (
                    <div className="w-8 h-8 rounded-full flex-shrink-0 overflow-hidden ring-2 ring-offset-1 ring-indigo-200">
                      <img
                        src={trip.coverImageUrl}
                        alt={trip.tripName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        trip.id === currentTripId
                          ? 'bg-indigo-100 text-indigo-600'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {trip.id === currentTripId ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <MapPin className="w-4 h-4" />
                      )}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm font-semibold truncate ${
                        trip.id === currentTripId
                          ? 'text-indigo-700'
                          : 'text-slate-700'
                      }`}
                    >
                      {trip.tripName}
                    </p>
                    <p className="text-xs text-slate-400">
                      {formatDate(trip.startDate)}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Create Trip Section */}
          <div className="border-t border-slate-100 p-3">
            {showCreateForm ? (
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={newTripName}
                  onChange={(e) => setNewTripName(e.target.value)}
                  placeholder="Tên chuyến đi..."
                  disabled={isCreating}
                  className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none disabled:bg-slate-50"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateTrip();
                    if (e.key === 'Escape') {
                      setShowCreateForm(false);
                      setNewTripName('');
                    }
                  }}
                />
                <button
                  onClick={handleCreateTrip}
                  disabled={isCreating || !newTripName.trim()}
                  className="px-3 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-lg text-white text-sm font-semibold disabled:opacity-50 flex items-center gap-1"
                >
                  {isCreating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Tạo'
                  )}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowCreateForm(true)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Tạo chuyến đi mới
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
