'use client';

import React, { useState } from 'react';
import { seedTripData } from '@/lib/firestoreUtils';
import { firstTripData, firstTripInfo } from '@/lib/seedData';
import { useAuth } from '@/lib/authContext';
import { AuthProvider } from '@/lib/authContext';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

function SeedPageContent() {
  const { user, signIn } = useAuth();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSeed = async () => {
    if (!user) {
      setMessage('Vui lòng đăng nhập trước');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setMessage('Đang tạo dữ liệu...');

    try {
      const tripId = await seedTripData(user.uid, firstTripInfo, firstTripData);
      setStatus('success');
      setMessage(`Đã tạo trip "${firstTripInfo.tripName}" với ${firstTripData.length} khoản chi. Trip ID: ${tripId}`);
    } catch (error) {
      console.error('Seed failed:', error);
      setStatus('error');
      setMessage('Lỗi khi tạo dữ liệu: ' + (error as Error).message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full space-y-6">
        <h1 className="text-2xl font-bold text-slate-800 text-center">
          🌱 Seed Data
        </h1>

        <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600">
          <p className="font-semibold mb-2">Sẽ tạo:</p>
          <ul className="space-y-1">
            <li>• Trip: {firstTripInfo.tripName}</li>
            <li>• Budget: {firstTripInfo.totalBudget.toLocaleString()}k</li>
            <li>• {firstTripData.length} khoản chi tiêu</li>
            <li>• Tổng: {firstTripData.reduce((sum, i) => sum + i.amount, 0).toLocaleString()}k</li>
          </ul>
        </div>

        {!user ? (
          <button
            onClick={signIn}
            className="w-full bg-indigo-600 text-white p-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors"
          >
            Đăng nhập với Google
          </button>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-slate-500 text-center">
              Logged in as: {user.email}
            </p>
            <button
              onClick={handleSeed}
              disabled={status === 'loading'}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white p-3 rounded-xl font-bold hover:shadow-lg transition-shadow disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {status === 'loading' ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                '🚀 Tạo dữ liệu mẫu'
              )}
            </button>
          </div>
        )}

        {message && (
          <div
            className={`p-4 rounded-xl text-sm flex items-start gap-3 ${
              status === 'success'
                ? 'bg-green-50 text-green-700'
                : status === 'error'
                ? 'bg-red-50 text-red-700'
                : 'bg-blue-50 text-blue-700'
            }`}
          >
            {status === 'success' ? (
              <CheckCircle className="w-5 h-5 shrink-0" />
            ) : status === 'error' ? (
              <AlertCircle className="w-5 h-5 shrink-0" />
            ) : null}
            <span>{message}</span>
          </div>
        )}

        <a
          href="/"
          className="block text-center text-indigo-600 hover:underline text-sm"
        >
          ← Quay về trang chính
        </a>
      </div>
    </div>
  );
}

export default function SeedPage() {
  return (
    <AuthProvider>
      <SeedPageContent />
    </AuthProvider>
  );
}
