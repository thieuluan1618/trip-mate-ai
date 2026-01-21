'use client';

import React, { useState, useMemo, useRef } from 'react';
import {
  Wallet,
  Users,
  Car,
  Home,
  Utensils,
  Gift,
  PieChart,
  Receipt,
  X,
  Image as ImageIcon,
  Sparkles,
  Loader2,
  Clock,
  Camera,
  MapPin,
  Heart,
  LogOut,
} from 'lucide-react';
import { analyzeImage, analyzeTripExpenses } from '@/lib/gemini';
import { compressImage, fileToBase64, fileToPreviewUrl } from '@/lib/imageUtils';
import { uploadFileToStorage, generateStoragePath } from '@/lib/storageUtils';
import { appVoice, getRandomMessage, getBudgetStatusWithVibe } from '@/lib/appVoice';
import { TripItem, TabType, CategoryInfo } from '@/types';
import { useAuth } from '@/lib/authContext';
import { AuthGuard } from '@/components/AuthGuard';

const categories: Record<string, CategoryInfo> = {
  all: { label: 'Tất cả', icon: Wallet, color: 'bg-gray-100 text-gray-800' },
  food: { label: 'Ăn uống', icon: Utensils, color: 'bg-orange-100 text-orange-600' },
  transport: { label: 'Di chuyển', icon: Car, color: 'bg-blue-100 text-blue-600' },
  stay: { label: 'Lưu trú', icon: Home, color: 'bg-purple-100 text-purple-600' },
  other: { label: 'Khác', icon: Gift, color: 'bg-pink-100 text-pink-600' },
  scenery: { label: 'Phong cảnh', icon: MapPin, color: 'bg-teal-100 text-teal-600' },
  memory: { label: 'Kỷ niệm', icon: Heart, color: 'bg-rose-100 text-rose-600' },
};

const mockData: TripItem[] = [
  {
    id: '1',
    tripId: 'trip-1',
    name: 'Nhậu 1 (Lẩu bò Thiên Kim)',
    amount: 502,
    category: 'food',
    type: 'expense',
    timestamp: new Date(Date.now() - 70 * 3600000),
    description: 'Nhậu lẩu bò',
    createdBy: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    tripId: 'trip-1',
    name: 'Trà sữa',
    amount: 254,
    category: 'food',
    type: 'expense',
    timestamp: new Date(Date.now() - 68 * 3600000),
    description: 'Trà sữa ngon',
    createdBy: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const AuthButton = () => {
  const { signIn } = useAuth();
  return (
    <button
      onClick={signIn}
      className="px-3 py-1 text-sm rounded-lg bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors font-semibold"
    >
      Đăng nhập
    </button>
  );
};

const SmartUploader = ({
  onAddResult,
  isProcessing,
  setIsProcessing,
}: {
  onAddResult: (item: TripItem) => void;
  isProcessing: boolean;
  setIsProcessing: (val: boolean) => void;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      // 1. Compress image
      const compressedFile = await compressImage(file);

      // 2. Convert to Base64
      const base64Data = await fileToBase64(compressedFile);

      // 3. Get preview URL
      const previewUrl = fileToPreviewUrl(compressedFile);

      // 4. Analyze with Gemini
      const aiData = await analyzeImage(base64Data, compressedFile.type);

      // 5. Create new item
      const newItem: TripItem = {
        id: Date.now().toString(),
        tripId: 'trip-1', // TODO: Use actual trip ID
        name: aiData.name,
        amount: aiData.amount,
        category: aiData.category,
        type: aiData.type,
        imageUrl: previewUrl,
        timestamp: new Date(),
        description: aiData.description,
        createdBy: 'user-1', // TODO: Use actual user ID
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      onAddResult(newItem);
    } catch (error) {
      console.error('AI Analysis Failed:', error);
      alert(getRandomMessage(appVoice.uploadErrors));
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileSelect}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isProcessing}
        className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white p-3 rounded-xl font-bold shadow-lg shadow-pink-200 flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform active:scale-95 disabled:opacity-50"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" /> Đang phân tích ảnh...
          </>
        ) : (
          <>
            <Camera className="w-5 h-5" /> Thêm Bill / Ảnh mới
          </>
        )}
      </button>
      <p className="text-xs text-center text-slate-400 mt-2">
        {appVoice.tooltips.upload}
      </p>
    </div>
  );
};

function AppContent() {
  const { user, logOut } = useAuth();
  const [data, setData] = useState<TripItem[]>(mockData);
  const [activeTab, setActiveTab] = useState<TabType>('timeline');
  const [isProcessing, setIsProcessing] = useState(false);
  const [numPeople, setNumPeople] = useState(1);
  const [selectedItem, setSelectedItem] = useState<TripItem | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Stats
  const stats = useMemo(() => {
    const expenses = data.filter((i) => i.type === 'expense');
    const total = expenses.reduce((acc, item) => acc + (item.amount || 0), 0);
    const byCategory = expenses.reduce(
      (acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + item.amount;
        return acc;
      },
      {} as Record<string, number>
    );
    return { total, byCategory, expenses };
  }, [data]);

  const handleAddResult = (newItem: TripItem) => {
    // Add user info if logged in
    const itemWithUser = {
      ...newItem,
      createdBy: user?.uid || 'guest',
    };
    setData((prev) => [itemWithUser, ...prev]);
    if (newItem.type === 'expense') {
      alert(`${getRandomMessage(appVoice.successMessages)}\n\n${newItem.name} • ${newItem.amount}k`);
    }
  };

  const handleAnalyzeTrip = async () => {
    setIsAnalyzing(true);
    setAiAnalysis('');
    try {
      const analysis = await analyzeTripExpenses(stats.expenses);
      setAiAnalysis(analysis);
    } catch (error) {
      console.error('Analysis failed:', error);
      setAiAnalysis('Lỗi AI. Thử lại sau.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')} • ${d.getDate()}/${d.getMonth() + 1}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20">
      <div className="max-w-md mx-auto min-h-screen bg-white shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 p-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-black bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Trip Mate AI
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              {user ? user.displayName : '👤 Chưa đăng nhập'}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('timeline')}
              className={`p-2 rounded-lg transition-all ${
                activeTab === 'timeline'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-slate-400 hover:bg-slate-50'
              }`}
            >
              <Clock className="w-5 h-5" />
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`p-2 rounded-lg transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-slate-400 hover:bg-slate-50'
              }`}
            >
              <PieChart className="w-5 h-5" />
            </button>
            {user ? (
              <button
                onClick={logOut}
                className="p-2 rounded-lg transition-all text-slate-400 hover:bg-slate-50"
                title="Đăng xuất"
              >
                <LogOut className="w-5 h-5" />
              </button>
            ) : (
              <AuthButton />
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <SmartUploader
            onAddResult={handleAddResult}
            isProcessing={isProcessing}
            setIsProcessing={setIsProcessing}
          />

          {/* Timeline */}
          {activeTab === 'timeline' && (
            <div className="space-y-6 relative pl-4 border-l-2 border-indigo-100 ml-2">
              {[...data].length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <p className="text-sm">{getRandomMessage(appVoice.emptyStates)}</p>
                </div>
              ) : (
                <>
              {[...data]
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .map((item, idx) => (
                  <div key={item.id} className="relative group">
                    <div
                      className={`absolute -left-[21px] top-3 w-3 h-3 rounded-full border-2 border-white shadow-sm ${
                        item.type === 'expense' ? 'bg-indigo-500' : 'bg-rose-500'
                      }`}
                    ></div>

                    <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {formatDate(item.timestamp)}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                            categories[item.category]?.color || 'bg-gray-100'
                          }`}
                        >
                          {categories[item.category]?.label}
                        </span>
                      </div>

                      <div className="flex gap-3">
                        {item.imageUrl && (
                          <div
                            className="w-16 h-16 shrink-0 rounded-lg bg-slate-100 overflow-hidden cursor-pointer"
                            onClick={() => setSelectedItem(item)}
                          >
                            <img
                              src={item.imageUrl}
                              alt="preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        <div className="flex-1">
                          <h3 className="font-bold text-slate-800 text-sm">{item.name}</h3>
                          {item.type === 'expense' ? (
                            <p className="text-lg font-black text-indigo-600 mt-1">
                              -{item.amount.toLocaleString('vi-VN')}k
                            </p>
                          ) : (
                            <p className="text-sm text-slate-500 mt-1 italic">
                              "{item.description || 'Một kỷ niệm đẹp...'}"
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                </>
              )}
            </div>
          )}

          {/* Dashboard */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-6 rounded-2xl text-white shadow-lg shadow-indigo-200">
                <p className="text-indigo-100 text-sm font-medium mb-1">Tổng chi tiêu</p>
                <h2 className="text-4xl font-black tracking-tight mb-4">
                  {stats.total.toLocaleString('vi-VN')} k
                </h2>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 flex items-center gap-3">
                  <Users className="w-5 h-5 text-indigo-200" />
                  <div className="flex-1 flex items-center gap-2">
                    <span className="text-xs text-indigo-200">Chia cho:</span>
                    <input
                      type="number"
                      min="1"
                      value={numPeople}
                      onChange={(e) => setNumPeople(Number(e.target.value))}
                      className="w-12 bg-white/20 border-none rounded text-center text-sm font-bold focus:ring-1 focus:ring-white outline-none"
                    />
                    <span className="text-xs text-indigo-200">người</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-indigo-200">Mỗi người</div>
                    <div className="font-bold text-yellow-300">
                      {(stats.total / (numPeople || 1)).toLocaleString('vi-VN', {
                        maximumFractionDigits: 0,
                      })}{' '}
                      k
                    </div>
                  </div>
                </div>
              </div>

              {!aiAnalysis && (
                <button
                  onClick={handleAnalyzeTrip}
                  disabled={isAnalyzing}
                  className="w-full bg-white border border-slate-200 p-3 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                  title={appVoice.tooltips.analyze}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {getRandomMessage(appVoice.loadingMessages)}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-yellow-500" />
                      Nhận xét thói quen chi tiêu
                    </>
                  )}
                </button>
              )}
              {aiAnalysis && (
                <div className="bg-yellow-50 p-4 rounded-xl text-sm text-slate-700 border border-yellow-100 relative">
                  <button onClick={() => setAiAnalysis('')} className="absolute top-2 right-2">
                    <X className="w-3 h-3" />
                  </button>
                  {aiAnalysis}
                </div>
              )}

              <div className="space-y-3">
                <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider">
                  Theo danh mục
                </h3>
                {Object.entries(stats.byCategory).map(([cat, amount]) => {
                  const info = categories[cat] || categories.other;
                  const percent = (amount / stats.total) * 100;
                  return (
                    <div key={cat} className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${info.color}`}>
                        <info.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-slate-700">{info.label}</span>
                          <span className="font-bold text-slate-900">
                            {amount.toLocaleString('vi-VN')}k
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${info.color.split(' ')[0]}`}
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
          <button
            onClick={() => setSelectedItem(null)}
            className="absolute top-4 right-4 p-2 bg-white/20 rounded-full text-white hover:bg-white/30"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="w-full max-w-lg bg-black flex items-center justify-center rounded-lg overflow-hidden">
            {selectedItem.imageUrl ? (
              <img
                src={selectedItem.imageUrl}
                className="max-w-full max-h-[70vh] object-contain"
                alt="Full view"
              />
            ) : (
              <div className="text-white/50 flex flex-col items-center">
                <ImageIcon className="w-16 h-16 mb-2" />
                <span>Không có ảnh</span>
              </div>
            )}
          </div>

          <div className="mt-4 text-center text-white">
            <h3 className="text-lg font-bold">{selectedItem.name}</h3>
            {selectedItem.type === 'expense' && (
              <p className="text-2xl font-black text-yellow-400 mt-1">
                {selectedItem.amount.toLocaleString('vi-VN')} k
              </p>
            )}
            <p className="text-sm text-white/60 mt-2 max-w-xs mx-auto">
              {selectedItem.description || formatDate(selectedItem.timestamp)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthGuard>
      <AppContent />
    </AuthGuard>
  );
}
