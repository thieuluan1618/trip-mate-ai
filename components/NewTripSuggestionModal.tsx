'use client';

import React, { useState } from 'react';
import { X, Loader2, MapPin, ArrowRight } from 'lucide-react';

interface NewTripSuggestionModalProps {
  isOpen: boolean;
  photoDate: Date;
  tripDateRange: { earliest: Date; latest: Date };
  onCreateTrip: (tripName: string) => void;
  onContinue: () => void;
  onClose: () => void;
  isLoading?: boolean;
}

export const NewTripSuggestionModal: React.FC<NewTripSuggestionModalProps> = ({
  isOpen,
  photoDate,
  tripDateRange,
  onCreateTrip,
  onContinue,
  onClose,
  isLoading,
}) => {
  const [tripName, setTripName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  if (!isOpen) return null;

  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

  const daysDiff = Math.abs(
    Math.round(
      (new Date(photoDate).getTime() -
        new Date(tripDateRange.latest).getTime()) /
        (1000 * 60 * 60 * 24)
    )
  );

  const handleCreate = () => {
    if (!tripName.trim()) return;
    onCreateTrip(tripName.trim());
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="border-b border-slate-100 p-4 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-800">
            Chuyến đi mới?
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-amber-600" />
            </div>
          </div>

          <p className="text-center text-slate-600 text-sm">
            Ảnh này chụp ngày <span className="font-semibold text-slate-800">{formatDate(photoDate)}</span>,
            cách chuyến đi hiện tại khoảng <span className="font-semibold text-amber-600">{daysDiff} ngày</span>.
          </p>

          <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-500 text-center">
            Chuyến đi hiện tại: {formatDate(tripDateRange.earliest)} - {formatDate(tripDateRange.latest)}
          </div>

          {showCreateForm ? (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase">
                  Tên chuyến đi mới:
                </label>
                <input
                  type="text"
                  value={tripName}
                  onChange={(e) => setTripName(e.target.value)}
                  placeholder="VD: Đà Lạt tháng 3"
                  disabled={isLoading}
                  autoFocus
                  className="w-full mt-2 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none disabled:bg-slate-50"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreate();
                  }}
                />
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 bg-white rounded-b-2xl p-4 space-y-2">
          {showCreateForm ? (
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateForm(false)}
                disabled={isLoading}
                className="flex-1 px-4 py-2 border border-slate-200 rounded-lg font-semibold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Quay lại
              </button>
              <button
                onClick={handleCreate}
                disabled={isLoading || !tripName.trim()}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-lg font-semibold text-white hover:shadow-lg transition-shadow disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  <>
                    Tạo chuyến đi
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => setShowCreateForm(true)}
                disabled={isLoading}
                className="w-full px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-lg font-semibold text-white hover:shadow-lg transition-shadow disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <MapPin className="w-4 h-4" />
                Tạo chuyến đi mới
              </button>
              <button
                onClick={onContinue}
                disabled={isLoading}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg font-semibold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Thêm vào chuyến đi hiện tại
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
