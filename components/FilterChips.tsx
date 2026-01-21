'use client';

import React from 'react';
import { Wallet, Utensils, Car, Home, Gift, MapPin, Heart, Video } from 'lucide-react';

export type FilterType = 'all' | 'expense' | 'memory';
export type CategoryType = 'food' | 'transport' | 'stay' | 'other' | 'scenery' | 'memory' | 'video';

interface FilterChipsProps {
  filter: FilterType;
  setFilter: (filter: FilterType) => void;
  categoryFilter: CategoryType | null;
  setCategoryFilter: (category: CategoryType | null) => void;
}

const categories = {
  food: { label: 'Ăn uống', icon: Utensils, color: 'bg-orange-100 text-orange-700 border-orange-200' },
  transport: { label: 'Di chuyển', icon: Car, color: 'bg-blue-100 text-blue-700 border-blue-200' },
  stay: { label: 'Lưu trú', icon: Home, color: 'bg-purple-100 text-purple-700 border-purple-200' },
  other: { label: 'Khác', icon: Gift, color: 'bg-pink-100 text-pink-700 border-pink-200' },
  scenery: { label: 'Phong cảnh', icon: MapPin, color: 'bg-teal-100 text-teal-700 border-teal-200' },
  memory: { label: 'Kỷ niệm', icon: Heart, color: 'bg-rose-100 text-rose-700 border-rose-200' },
  video: { label: 'Video', icon: Video, color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
};

export const FilterChips: React.FC<FilterChipsProps> = ({
  filter,
  setFilter,
  categoryFilter,
  setCategoryFilter,
}) => {
  const handleFilterChange = (newFilter: FilterType) => {
    setFilter(newFilter);
    // Clear category filter when switching main filters
    if (newFilter !== 'all') {
      setCategoryFilter(null);
    }
  };

  const handleCategoryChange = (category: CategoryType) => {
    if (categoryFilter === category) {
      // Toggle off if already selected
      setCategoryFilter(null);
      setFilter('all');
    } else {
      // Set new category
      setCategoryFilter(category);
      setFilter('all');
    }
  };

  return (
    <div className="space-y-3">
      {/* Main Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => handleFilterChange('all')}
          className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
            filter === 'all' && !categoryFilter
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Tất cả
        </button>
        <button
          onClick={() => handleFilterChange('expense')}
          className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
            filter === 'expense'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          💰 Hóa đơn
        </button>
        <button
          onClick={() => handleFilterChange('memory')}
          className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
            filter === 'memory'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          📸 Kỷ niệm
        </button>
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {(Object.entries(categories) as [CategoryType, typeof categories[CategoryType]][]).map(
          ([cat, info]) => {
            const Icon = info.icon;
            const isSelected = categoryFilter === cat;
            return (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                  isSelected
                    ? info.color
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {info.label}
              </button>
            );
          }
        )}
      </div>
    </div>
  );
};
