'use client';

import React from 'react';
import { TripItem } from '@/types';
import { PhotoCard } from './PhotoCard';
import { Clock } from 'lucide-react';

interface PhotoGridProps {
  items: TripItem[];
  onSelect: (item: TripItem) => void;
}

export const PhotoGrid: React.FC<PhotoGridProps> = ({ items, onSelect }) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p className="text-sm">Chưa có ảnh nào</p>
        <p className="text-xs mt-1">Hãy thêm bill hoặc ảnh kỷ niệm nhé! 📸</p>
      </div>
    );
  }

  return (
    <div className="columns-2 md:columns-3 gap-3 space-y-3">
      {items.map((item) => (
        <PhotoCard key={item.id} item={item} onClick={() => onSelect(item)} />
      ))}
    </div>
  );
};
