'use client';

import React, { useState, useEffect, useRef } from 'react';
import { TripItem } from '@/types';
import { PhotoCard } from './PhotoCard';
import { PhotoCardSkeleton } from './PhotoCardSkeleton';
import { Clock } from 'lucide-react';

interface PhotoGridProps {
  items: TripItem[];
  onSelect: (item: TripItem) => void;
  loading?: boolean;
}

const ITEMS_PER_PAGE = 20;

export const PhotoGrid: React.FC<PhotoGridProps> = ({ items, onSelect, loading = false }) => {
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  const visibleItems = items.slice(0, visibleCount);
  const hasMore = visibleCount < items.length;

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          setIsLoadingMore(true);
          // Simulate network delay for smoother UX
          setTimeout(() => {
            setVisibleCount((prev) => Math.min(prev + ITEMS_PER_PAGE, items.length));
            setIsLoadingMore(false);
          }, 300);
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isLoadingMore, items.length]);

  if (loading) {
    return (
      <div className="columns-2 md:columns-3 gap-3 space-y-3">
        {Array.from({ length: 6 }).map((_, idx) => (
          <PhotoCardSkeleton key={idx} />
        ))}
      </div>
    );
  }

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
      {visibleItems.map((item) => (
        <PhotoCard key={item.id} item={item} onClick={() => onSelect(item)} />
      ))}

      {/* Loading indicator for infinite scroll */}
      {isLoadingMore && hasMore && (
        <>
          {Array.from({ length: 3 }).map((_, idx) => (
            <PhotoCardSkeleton key={`loading-${idx}`} />
          ))}
        </>
      )}

      {/* Observer target */}
      <div ref={observerTarget} className="w-full h-1" />

      {/* End of list indicator */}
      {!hasMore && items.length > ITEMS_PER_PAGE && (
        <div className="col-span-full text-center py-4 text-xs text-slate-400">
          Đã hiển thị tất cả ảnh
        </div>
      )}
    </div>
  );
};
