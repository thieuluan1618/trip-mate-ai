'use client';

import React from 'react';

export const PhotoCardSkeleton: React.FC = () => {
  return (
    <div className="relative break-inside-avoid mb-3 rounded-xl overflow-hidden bg-slate-200 animate-pulse">
      {/* Placeholder image */}
      <div className="w-full h-48 bg-slate-300" />

      {/* Type indicator */}
      <div className="absolute top-2 right-2 w-8 h-6 rounded-full bg-slate-400" />
    </div>
  );
};
