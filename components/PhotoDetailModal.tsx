'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Edit2, Trash2 } from 'lucide-react';
import { TripItem } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

interface PhotoDetailModalProps {
  item: TripItem;
  allItems: TripItem[];
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (item: TripItem) => void;
  onDelete?: (itemId: string) => void;
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

export const PhotoDetailModal: React.FC<PhotoDetailModalProps> = ({
  item,
  allItems,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Find current item index in all items
  useEffect(() => {
    const index = allItems.findIndex((i) => i.id === item.id);
    setCurrentIndex(index);
  }, [item.id, allItems]);

  // Get all images for current item
  const getCurrentMedia = useCallback(() => {
    const currentItem = allItems[currentIndex];
    if (!currentItem) return [];
    // If video, return video URL
    if (currentItem.videoUrl) {
      return [currentItem.videoUrl];
    }
    // Combine main image with additional images if any
    const images = currentItem.images || [];
    if (currentItem.imageUrl) {
      return [currentItem.imageUrl, ...images];
    }
    return images;
  }, [currentIndex, allItems]);

  const currentMedia = getCurrentMedia();
  const isVideo = allItems[currentIndex]?.videoUrl ? true : false;

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, currentImageIndex]);

  const handlePrev = () => {
    if (currentMedia.length > 1 && currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    } else if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setCurrentImageIndex(0);
    }
  };

  const handleNext = () => {
    if (currentMedia.length > 1 && currentImageIndex < currentMedia.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    } else if (currentIndex < allItems.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setCurrentImageIndex(0);
    }
  };

  const currentItem = allItems[currentIndex];
  if (!currentItem) return null;

  const currentMediaUrl = currentMedia[currentImageIndex] || currentItem.imageUrl || currentItem.videoUrl;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black flex flex-col"
          onClick={onClose}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-4 bg-gradient-to-b from-black/50 to-transparent" onClick={(e) => e.stopPropagation()}>
            <div className="flex gap-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(currentItem)}
                  className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
                  title="Chỉnh sửa"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(currentItem.id)}
                  className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-red-500/80 transition-colors"
                  title="Xóa"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Image/Video Container */}
          <div className="flex-1 flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
            {isVideo ? (
              <motion.video
                key={currentMediaUrl}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
                src={currentMediaUrl}
                controls
                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl"
              />
            ) : (
              <motion.img
                key={currentMediaUrl}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
                src={currentMediaUrl}
                alt={currentItem.name}
                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl"
              />
            )}
          </div>

          {/* Navigation Arrows */}
          {currentMedia.length > 1 || currentIndex > 0 ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          ) : null}
          {currentMedia.length > 1 || currentIndex < allItems.length - 1 ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          ) : null}

          {/* Image Dots Indicator */}
          {currentMedia.length > 1 && (
            <div className="absolute bottom-32 left-1/2 -translate-x-1/2 flex gap-2">
              {currentMedia.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(idx);
                  }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentImageIndex ? 'bg-white w-6' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Info Panel */}
          <div className="bg-gradient-to-t from-black via-black/80 to-transparent p-6 text-white" onClick={(e) => e.stopPropagation()}>
            <div className="max-w-lg mx-auto">
              <h3 className="text-xl font-bold mb-2">{currentItem.name}</h3>

              <div className="flex items-center gap-3 mb-3">
                {currentItem.type === 'expense' ? (
                  <>
                    <span className="text-3xl font-black text-yellow-400">
                      -{currentItem.amount.toLocaleString('vi-VN')}k
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${categoryColors[currentItem.category]}`}
                    >
                      {categoryLabels[currentItem.category]}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-sm opacity-90">📸 Kỷ niệm</span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${categoryColors[currentItem.category]}`}
                    >
                      {categoryLabels[currentItem.category]}
                    </span>
                  </>
                )}
              </div>

              {currentItem.description && (
                <p className="text-sm opacity-80 italic">"{currentItem.description}"</p>
              )}

              {currentMedia.length > 1 && (
                <div className="mt-2 text-xs opacity-60">
                  {isVideo ? 'Video' : 'Ảnh'} {currentImageIndex + 1} / {currentMedia.length}
                </div>
              )}

              <div className="mt-2 text-xs opacity-60">
                {new Date(currentItem.timestamp).toLocaleString('vi-VN')}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
