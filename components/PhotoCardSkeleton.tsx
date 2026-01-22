'use client';

import React from 'react';
import { motion } from 'framer-motion';

export const PhotoCardSkeleton: React.FC = () => {
  const heights = [160, 200, 240, 180, 220];
  const randomHeight = heights[Math.floor(Math.random() * heights.length)];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative break-inside-avoid mb-3 rounded-2xl overflow-hidden"
    >
      {/* Shimmer container */}
      <div
        className="relative bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200"
        style={{ height: randomHeight }}
      >
        {/* Animated shimmer effect */}
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />

        {/* Decorative elements */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-slate-300/50 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full bg-slate-400/50" />
          </div>
        </div>
      </div>

      {/* Bottom info skeleton */}
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-slate-300/90 to-transparent">
        <div className="space-y-2">
          <div className="h-3 w-3/4 bg-slate-400/50 rounded-full" />
          <div className="h-2 w-1/2 bg-slate-400/30 rounded-full" />
        </div>
      </div>

      {/* Category badge skeleton */}
      <div className="absolute top-2 right-2 w-16 h-5 rounded-full bg-slate-300/70" />

      {/* Type indicator skeleton */}
      <div className="absolute top-2 left-2 w-8 h-8 rounded-full bg-slate-300/70" />
    </motion.div>
  );
};
