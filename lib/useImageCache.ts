'use client';

import { useEffect, useRef } from 'react';

// Cache for storing loaded images
const imageCache = new Set<string>();
const preloadCache = new Set<string>();

/**
 * Preload images into browser cache
 */
export const preloadImages = (urls: string[]) => {
  urls.forEach((url) => {
    if (!url || imageCache.has(url) || preloadCache.has(url)) return;

    preloadCache.add(url);

    const img = new Image();
    img.src = url;

    img.onload = () => {
      imageCache.add(url);
      preloadCache.delete(url);
    };

    img.onerror = () => {
      preloadCache.delete(url);
    };
  });
};

/**
 * Custom hook to preload and cache images
 */
export const useImageCache = (items: Array<{ imageUrl?: string; videoUrl?: string }>) => {
  const previousUrls = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Extract all unique image URLs
    const imageUrls = items
      .map((item) => item.imageUrl)
      .filter((url): url is string => Boolean(url));

    // Get URLs that weren't in the previous render
    const newUrls = imageUrls.filter((url) => !previousUrls.current.has(url));

    // Preload new images
    if (newUrls.length > 0) {
      // Use requestIdleCallback if available for better performance
      const preload = () => preloadImages(newUrls);

      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(preload);
      } else {
        // Fallback: use setTimeout with a small delay
        setTimeout(preload, 100);
      }
    }

    // Update previous URLs
    previousUrls.current = new Set(imageUrls);

    // Cleanup function
    return () => {
      // Keep images in cache for reuse
    };
  }, [items]);

  /**
   * Preload specific image URL immediately
   */
  const preloadSingle = (url: string) => {
    if (url && !imageCache.has(url)) {
      preloadImages([url]);
    }
  };

  return {
    preloadSingle,
    isCached: (url: string) => imageCache.has(url),
  };
};
