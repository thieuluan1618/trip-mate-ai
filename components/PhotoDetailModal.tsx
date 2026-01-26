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
  onNavigate?: (item: TripItem) => void;
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
  onNavigate,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Filter to only items with media (photo or video)
  const mediaItems = allItems.filter((i) => i.imageUrl || i.videoUrl);

  // Find current item index in filtered media items
  useEffect(() => {
    const index = mediaItems.findIndex((i) => i.id === item.id);
    setCurrentIndex(index >= 0 ? index : 0);
  }, [item.id, mediaItems]);

  // Get all images for current item
  const getCurrentMedia = useCallback(() => {
    const currentItem = mediaItems[currentIndex];
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
  }, [currentIndex, mediaItems]);

  const currentMedia = getCurrentMedia();
  const isVideo = mediaItems[currentIndex]?.videoUrl ? true : false;

  // Preload adjacent images for smooth navigation
  useEffect(() => {
    const preloadImages: string[] = [];
    
    // Get prev/next items (2 in each direction)
    for (let offset = -2; offset <= 2; offset++) {
      if (offset === 0) continue; // Skip current
      const idx = currentIndex + offset;
      if (idx >= 0 && idx < mediaItems.length) {
        const item = mediaItems[idx];
        // Preload full image, not thumbnail
        if (item.imageUrl) {
          preloadImages.push(item.imageUrl);
        }
      }
    }
    
    console.log(`🔄 Preloading ${preloadImages.length} images for index ${currentIndex}`);
    
    // Preload using native Image objects (use window.Image to avoid conflict with next/image)
    preloadImages.forEach((src, i) => {
      const img = new window.Image();
      const startTime = performance.now();
      img.onload = () => {
        console.log(`✅ Preloaded image ${i + 1}: ${Math.round(performance.now() - startTime)}ms`);
      };
      img.onerror = () => {
        console.log(`❌ Failed to preload image ${i + 1}`);
      };
      img.src = src;
    });
  }, [currentIndex, mediaItems]);

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
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      setCurrentImageIndex(0);
      onNavigate?.(mediaItems[newIndex]);
    }
  };

  const handleNext = () => {
    if (currentMedia.length > 1 && currentImageIndex < currentMedia.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    } else if (currentIndex < mediaItems.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setCurrentImageIndex(0);
      onNavigate?.(mediaItems[newIndex]);
    }
  };

  const currentItem = mediaItems[currentIndex];
  if (!currentItem) return null;

  const currentMediaUrl = currentMedia[currentImageIndex] || currentItem.imageUrl || currentItem.videoUrl;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="photo-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] bg-black flex flex-col !m-0 !max-w-none"
          onClick={onClose}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
        >
          {/* Header - positioned absolutely over the image */}
          <div className="absolute top-0 left-0 right-0 z-10 flex justify-between items-center p-4 bg-gradient-to-b from-black/70 via-black/20 to-transparent" onClick={(e) => e.stopPropagation()}>
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
                  onClick={() => setShowDeleteConfirm(true)}
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

          {/* Image/Video Container - full screen */}
          <div className="absolute inset-0 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            {isVideo ? (
              <motion.video
                key={currentMediaUrl}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
                src={currentMediaUrl}
                controls
                className="w-full h-full object-contain"
              />
            ) : (
              <motion.img
                key={currentMediaUrl}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
                src={currentMediaUrl || ''}
                alt={currentItem.name}
                className="max-w-full max-h-full object-contain"
              />
            )}
          </div>

          {/* Navigation Arrows - larger touch targets on mobile */}
          {(currentImageIndex > 0 || currentIndex > 0) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 active:scale-110 transition-all duration-200"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}
          {(currentImageIndex < currentMedia.length - 1 || currentIndex < mediaItems.length - 1) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 active:scale-110 transition-all duration-200"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}

          {/* Image Dots Indicator */}
          {currentMedia.length > 1 && (
            <div className="absolute bottom-24 sm:bottom-32 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2">
              {currentMedia.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(idx);
                  }}
                  className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all ${
                    idx === currentImageIndex ? 'bg-white w-4 sm:w-6' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Info Panel - absolutely positioned at bottom */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4 sm:p-6 text-white pointer-events-none" onClick={(e) => e.stopPropagation()}>
            <div className="max-w-lg mx-auto">
              <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">{currentItem.name}</h3>

              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                {currentItem.type === 'expense' ? (
                  <>
                    <span className="text-2xl sm:text-3xl font-black text-yellow-400">
                      -{currentItem.amount.toLocaleString('vi-VN')}k
                    </span>
                    <span
                      className={`px-2 sm:px-3 py-1 rounded-full text-xs font-bold ${categoryColors[currentItem.category]}`}
                    >
                      {categoryLabels[currentItem.category]}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-xs sm:text-sm opacity-90">📸 Kỷ niệm</span>
                    <span
                      className={`px-2 sm:px-3 py-1 rounded-full text-xs font-bold ${categoryColors[currentItem.category]}`}
                    >
                      {categoryLabels[currentItem.category]}
                    </span>
                  </>
                )}
              </div>

              {currentItem.description && (
                <p className="text-xs sm:text-sm opacity-80 italic mb-1">&ldquo;{currentItem.description}&rdquo;</p>
              )}

              <div className="flex items-center gap-2 text-xs opacity-60">
                {currentMedia.length > 1 && (
                  <span>
                    {isVideo ? 'Video' : 'Ảnh'} {currentImageIndex + 1} / {currentMedia.length}
                  </span>
                )}
                <span>• {new Date(currentItem.timestamp).toLocaleString('vi-VN')}</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <motion.div
          key="delete-confirm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-5 pb-0">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 text-center">Xác nhận xóa?</h3>
              <p className="text-sm text-slate-500 text-center mt-2">
                Bạn có chắc muốn xóa ảnh này không? Hành động này không thể hoàn tác.
              </p>
            </div>
            
            {/* Buttons */}
            <div className="p-5 flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 active:scale-98 transition-all"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  onDelete?.(currentItem.id);
                  setShowDeleteConfirm(false);
                }}
                className="flex-1 px-4 py-3 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 active:scale-98 transition-all shadow-lg shadow-red-500/25"
              >
                Xóa
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
