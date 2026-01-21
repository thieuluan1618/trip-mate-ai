'use client';

import React from 'react';
import { TripItem } from '@/types';

interface PhotoCardProps {
  item: TripItem;
  onClick: () => void;
}

const categoryColors: Record<string, string> = {
  food: 'bg-orange-100 text-orange-700',
  transport: 'bg-blue-100 text-blue-700',
  stay: 'bg-purple-100 text-purple-700',
  other: 'bg-pink-100 text-pink-700',
  scenery: 'bg-teal-100 text-teal-700',
  memory: 'bg-rose-100 text-rose-700',
  video: 'bg-indigo-100 text-indigo-700',
};

const categoryLabels: Record<string, string> = {
  food: 'Ăn uống',
  transport: 'Di chuyển',
  stay: 'Lưu trú',
  other: 'Khác',
  scenery: 'Phong cảnh',
  memory: 'Kỷ niệm',
  video: 'Video',
};

export const PhotoCard: React.FC<PhotoCardProps> = ({ item, onClick }) => {
  const imageUrl = item.imageUrl || item.videoUrl;
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const isVideo = !!item.videoUrl;

  if (!imageUrl) return null;

  return (
    <div
      className="relative break-inside-avoid mb-3 rounded-xl overflow-hidden group cursor-pointer shadow-sm hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      {/* Image or Video */}
      {isVideo ? (
        <video
          src={item.videoUrl}
          className="w-full h-auto object-cover"
          muted
          onMouseEnter={(e) => e.currentTarget.play()}
          onMouseLeave={(e) => {
            e.currentTarget.pause();
            e.currentTarget.currentTime = 0;
          }}
        />
      ) : (
        <>
          {/* Blur placeholder while loading */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-slate-200 animate-pulse" />
          )}
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-auto object-cover transition-opacity duration-300"
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            style={{ opacity: imageLoaded ? 1 : 0 }}
          />
        </>
      )}

      {/* Overlay (shows on hover/tap) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
          {/* Name */}
          <h3 className="font-bold text-sm mb-1 line-clamp-1">{item.name}</h3>

          {/* Expense Info */}
          {item.type === 'expense' ? (
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-yellow-300">
                -{item.amount.toLocaleString('vi-VN')}k
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${categoryColors[item.category]}`}>
                {categoryLabels[item.category]}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs opacity-90">
                {isVideo ? '🎬 Video' : '📸 Kỷ niệm'}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${categoryColors[item.category]}`}>
                {categoryLabels[item.category]}
              </span>
            </div>
          )}

          {/* Multiple Images Indicator */}
          {item.images && item.images.length > 1 && (
            <div className="text-[10px] opacity-75 mt-1">
              📸 {item.images.length} ảnh
            </div>
          )}
        </div>
      </div>

      {/* Type Indicator (always visible) */}
      <div className="absolute top-2 right-2">
        <div
          className={`px-2 py-1 rounded-full text-[10px] font-bold shadow-sm ${
            item.type === 'expense'
              ? 'bg-indigo-500 text-white'
              : isVideo
              ? 'bg-purple-500 text-white'
              : 'bg-rose-500 text-white'
          }`}
        >
          {item.type === 'expense' ? '💰' : isVideo ? '🎬' : '📸'}
        </div>
      </div>

      {/* Video Play Button Indicator */}
      {isVideo && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-12 h-12 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center">
            <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-white border-b-8 border-b-transparent ml-1" />
          </div>
        </div>
      )}
    </div>
  );
};
