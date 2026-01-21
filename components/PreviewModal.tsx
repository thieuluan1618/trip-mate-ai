'use client';

import React from 'react';
import { X, Loader2 } from 'lucide-react';
import { TripItem } from '@/types';

interface PreviewModalProps {
  item: TripItem & { previewUrl?: string };
  isOpen: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  onEdit?: (field: string, value: any) => void;
}

const categoryColors: Record<string, string> = {
  food: 'bg-orange-100 text-orange-700',
  transport: 'bg-blue-100 text-blue-700',
  stay: 'bg-purple-100 text-purple-700',
  other: 'bg-pink-100 text-pink-700',
  scenery: 'bg-teal-100 text-teal-700',
  memory: 'bg-rose-100 text-rose-700',
};

export const PreviewModal: React.FC<PreviewModalProps> = ({
  item,
  isOpen,
  isLoading,
  onConfirm,
  onCancel,
  onEdit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 p-4 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-800">Xác nhận thông tin</h2>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Image Preview */}
          {item.previewUrl && (
            <div className="rounded-lg overflow-hidden bg-slate-100">
              <img
                src={item.previewUrl}
                alt="preview"
                className="w-full max-h-64 object-cover"
              />
            </div>
          )}

          {/* Type Badge */}
          <div className="flex gap-2 items-center">
            <span className="text-xs font-semibold text-slate-600 uppercase">Loại:</span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                item.type === 'expense'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-rose-100 text-rose-700'
              }`}
            >
              {item.type === 'expense' ? '💰 Chi tiêu' : '📸 Kỷ niệm'}
            </span>
          </div>

          {/* Category */}
          <div className="flex gap-2 items-center">
            <span className="text-xs font-semibold text-slate-600 uppercase">Danh mục:</span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${categoryColors[item.category] || 'bg-gray-100'}`}>
              {item.category}
            </span>
          </div>

          {/* Name */}
          <div>
            <label className="text-xs font-semibold text-slate-600 uppercase">Tên:</label>
            <input
              type="text"
              value={item.name}
              onChange={(e) => onEdit?.('name', e.target.value)}
              disabled={isLoading}
              className="w-full mt-2 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none disabled:bg-slate-50"
            />
          </div>

          {/* Amount (if expense) */}
          {item.type === 'expense' && (
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase">Số tiền (k):</label>
              <input
                type="number"
                value={item.amount}
                onChange={(e) => onEdit?.('amount', Number(e.target.value))}
                disabled={isLoading}
                className="w-full mt-2 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none disabled:bg-slate-50"
              />
            </div>
          )}

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-slate-600 uppercase">Mô tả:</label>
            <textarea
              value={item.description}
              onChange={(e) => onEdit?.('description', e.target.value)}
              disabled={isLoading}
              rows={3}
              className="w-full mt-2 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none disabled:bg-slate-50"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 border-t border-slate-100 bg-white p-4 flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-slate-200 rounded-lg font-semibold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-lg font-semibold text-white hover:shadow-lg transition-shadow disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang lưu...
              </>
            ) : (
              '✓ Lưu'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
