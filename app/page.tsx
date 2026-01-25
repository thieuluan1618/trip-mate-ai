'use client';

import { AuthGuard } from '@/components/AuthGuard';
import { CategoryType, FilterChips, FilterType } from '@/components/FilterChips';
import { PhotoDetailModal } from '@/components/PhotoDetailModal';
import { PhotoGrid } from '@/components/PhotoGrid';
import { PreviewModal } from '@/components/PreviewModal';
import { useToast } from '@/components/Toast';
import {
  analyzeImage as analyzeImageAPI,
  analyzeTripExpenses,
  deleteTripItem,
  getUserTrips,
  saveTripItem,
  uploadFile
} from '@/lib/apiClient';
import { appVoice, getRandomMessage } from '@/lib/appVoice';
import { useAuth } from '@/lib/authContext';
import { getOrCreateDefaultTrip, subscribeTripItems } from '@/lib/firestoreUtils';
import { compressImage, fileToBase64 } from '@/lib/imageUtils';
import { CategoryInfo, TabType, TripItem } from '@/types';
import {
  Camera,
  Car,
  Clock,
  Gift,
  Heart,
  Home,
  Image as ImageIcon,
  Loader2,
  LogIn,
  MapPin,
  PieChart,
  Sparkles,
  Users,
  Utensils,
  Video,
  Wallet,
  X
} from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';

const categories: Record<string, CategoryInfo> = {
  all: { label: 'Tất cả', icon: Wallet, color: 'bg-gray-100 text-gray-800' },
  food: { label: 'Ăn uống', icon: Utensils, color: 'bg-orange-100 text-orange-600' },
  transport: { label: 'Di chuyển', icon: Car, color: 'bg-blue-100 text-blue-600' },
  stay: { label: 'Lưu trú', icon: Home, color: 'bg-purple-100 text-purple-600' },
  other: { label: 'Khác', icon: Gift, color: 'bg-pink-100 text-pink-600' },
  scenery: { label: 'Phong cảnh', icon: MapPin, color: 'bg-teal-100 text-teal-600' },
  memory: { label: 'Kỷ niệm', icon: Heart, color: 'bg-rose-100 text-rose-600' },
  video: { label: 'Video', icon: Video, color: 'bg-indigo-100 text-indigo-700' },
};

const AuthButton = () => {
  const { signIn } = useAuth();
  return (
    <button
      onClick={signIn}
      className="p-2 rounded-lg bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors"
      title="Đăng nhập"
    >
      <LogIn className="w-5 h-5" />
    </button>
  );
};

const SmartUploader = ({
  isProcessing,
  setIsProcessing,
  tripId,
  userId,
}: {
  isProcessing: boolean;
  setIsProcessing: (val: boolean) => void;
  tripId: string;
  userId: string;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();
  const [previewItem, setPreviewItem] = useState<(TripItem & { previewUrl?: string }) | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // File size validation (50MB for images, 500MB for videos)
    const MAX_IMAGE_SIZE = 50 * 1024 * 1024; // 50MB
    const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500MB

    const oversizedFiles = Array.from(files).filter(file => {
      if (file.type.startsWith('image/')) {
        return file.size > MAX_IMAGE_SIZE;
      } else if (file.type.startsWith('video/')) {
        return file.size > MAX_VIDEO_SIZE;
      }
      return false;
    });

    if (oversizedFiles.length > 0) {
      showToast(`File quá lớn! Giới hạn 50MB/ảnh, 500MB/video.`, 'error');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsProcessing(true);

    const fileArray = Array.from(files);
    setUploadProgress({ current: 0, total: fileArray.length });

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      setUploadProgress({ current: i + 1, total: fileArray.length });
      try {
        // Check if video
        const isVideo = file.type.startsWith('video/');

        if (isVideo) {
          // Handle video - NO AI analysis, just upload via API
          const uploaded = await uploadFile(file, tripId);

          // Create video item without AI (no ID - Firestore will generate)
          const newItem: Omit<TripItem, 'id'> = {
            tripId,
            name: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
            amount: 0,
            category: 'video',
            type: 'memory',
            videoUrl: uploaded.url,
            timestamp: new Date(),
            description: 'Video kỷ niệm 🎬',
            createdBy: userId,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          await saveTripItem(tripId, newItem);
          successCount++;
        } else {
          // Handle image with AI analysis via API
          const compressedFile = await compressImage(file);
          const base64Data = await fileToBase64(compressedFile);
          const aiData = await analyzeImageAPI(base64Data, compressedFile.type);

          const uploaded = await uploadFile(compressedFile, tripId);

          const newItem: Omit<TripItem, 'id'> = {
            tripId,
            name: aiData.name,
            amount: aiData.amount,
            category: aiData.category,
            type: aiData.type,
            imageUrl: uploaded.url,
            thumbnailUrl: uploaded.thumbnailUrl,
            blurDataUrl: uploaded.blurDataUrl,
            timestamp: new Date(),
            description: aiData.description,
            createdBy: userId,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          await saveTripItem(tripId, newItem);
          successCount++;
        }
      } catch (error) {
        console.error('Upload Failed for file:', file.name, error);
        errorCount++;
      }
    }

    setIsProcessing(false);
    if (fileInputRef.current) fileInputRef.current.value = '';

    // Show summary toast
    if (successCount > 0 && errorCount === 0) {
      showToast(`Đã lưu ${successCount} file thành công! ✅`, 'success');
    } else if (successCount > 0 && errorCount > 0) {
      showToast(`Đã lưu ${successCount} file, ${errorCount} lỗi ⚠️`, 'success');
    } else {
      showToast(getRandomMessage(appVoice.uploadErrors), 'error');
    }
  };

  const handleConfirm = async () => {
    if (!previewItem || !pendingFile) return;
    setIsSaving(true);
    try {
      // 1. Upload image to Firebase Storage via API
      const uploaded = await uploadFile(pendingFile, tripId);

      // 2. Create final item with Storage URL (no ID - Firestore generates it)
      const { id: _id, previewUrl: _previewUrl, ...itemData } = previewItem;
      const finalItem: Omit<TripItem, 'id'> = {
        ...itemData,
        imageUrl: uploaded.url,
        thumbnailUrl: uploaded.thumbnailUrl,
        blurDataUrl: uploaded.blurDataUrl,
      };

      // 3. Save to Firestore
      await saveTripItem(tripId, finalItem);
      showToast(getRandomMessage(appVoice.successMessages), 'success', 3000);

      // 4. Clean up
      setPreviewItem(null);
      setPendingFile(null);
    } catch (error) {
      console.error('Failed to save:', error);
      showToast(getRandomMessage(appVoice.uploadErrors), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setPreviewItem(null);
    setPendingFile(null);
  };

  const handleEditField = (field: string, value: any) => {
    if (!previewItem) return;
    setPreviewItem({
      ...previewItem,
      [field]: value,
    });
  };

  return (
    <>
      <div>
        <input
          type="file"
          accept="image/*,video/*"
          multiple
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
              <Loader2 className="w-5 h-5 animate-spin" />
              {uploadProgress.total > 0 ? `${uploadProgress.current}/${uploadProgress.total}` : 'Đang xử lý...'}
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

      {previewItem && (
        <PreviewModal
          item={previewItem}
          isOpen={!!previewItem}
          isLoading={isSaving}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          onEdit={handleEditField}
        />
      )}
    </>
  );
};

function AppContent() {
  const { user, logOut } = useAuth();
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [data, setData] = useState<TripItem[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('gallery');
  const [filter, setFilter] = useState<FilterType>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryType | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [numPeople, setNumPeople] = useState(1);
  const [selectedItem, setSelectedItem] = useState<TripItem | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [tripId, setTripId] = useState<string>('trip-1');
  const [tripName, setTripName] = useState<string>('');
  const [loadingData, setLoadingData] = useState(true);

  // Sync selected item with URL (use window.history for immediate update)
  const selectItem = useCallback((item: TripItem | null) => {
    setSelectedItem(item);
    const url = item ? `?photo=${item.id}` : '/';
    window.history.replaceState(null, '', url);
  }, []);

  // Open photo from URL on initial load only
  useEffect(() => {
    const photoId = searchParams.get('photo');
    if (photoId && data.length > 0) {
      const item = data.find(d => d.id === photoId);
      if (item) {
        setSelectedItem(item);
      }
    }
    // Only run once when data loads
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.length > 0]);

  // Initialize trip and load data on mount
  useEffect(() => {
    const initializeTrip = async () => {
      try {
        const userId = 'guest';

        // Try to get existing trips first
        const trips = await getUserTrips(userId);
        let id: string;
        let name: string = 'Trip Mate AI';

        if (trips.length > 0) {
          // Use the most recent trip
          id = trips[0].id;
          name = trips[0].tripName;
        } else {
          // Create default trip if none exists
          id = await getOrCreateDefaultTrip(userId);
        }

        setTripId(id);
        setTripName(name);

        // Subscribe to real-time updates
        const unsubscribe = subscribeTripItems(id, (items) => {
          if (items.length > 0) {
            setData(items);
          } else {
            setData([]); // Clear mock data if no items
          }
          setLoadingData(false);
        });

        return unsubscribe;
      } catch (error) {
        console.error('Failed to initialize trip:', error);
        setLoadingData(false);
      }
    };

    const unsubscribe = initializeTrip().then((unsub) => unsub);

    return () => {
      unsubscribe?.then((unsub) => unsub?.());
    };
  }, [user]);

  // Filter data based on filters
  const filteredData = useMemo(() => {
    let filtered = [...data];

    // Apply main filter
    if (filter === 'expense') {
      filtered = filtered.filter((item) => item.type === 'expense');
    } else if (filter === 'memory') {
      filtered = filtered.filter((item) => item.type === 'memory');
    }

    // Apply category filter
    if (categoryFilter) {
      filtered = filtered.filter((item) => item.category === categoryFilter);
    }

    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [data, filter, categoryFilter]);

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

  const handleDeleteItem = async (itemId: string) => {
    try {
      // Delete item via API (also deletes associated files from Storage)
      await deleteTripItem(tripId, itemId);

      // Firestore listener will update the data automatically
      showToast('Đã xóa thành công!', 'success', 2000);

      // Close the modal if the deleted item is currently selected
      if (selectedItem?.id === itemId) {
        selectItem(null);
      }
    } catch (error) {
      console.error('Failed to delete item:', error);
      showToast('Không thể xóa. Thử lại sau!', 'error');
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
      <div className="max-w-md md:max-w-2xl lg:max-w-4xl mx-auto min-h-screen bg-white shadow-xl flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 p-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-black bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              {tripName || 'Trip Mate AI'}
            </h1>
            {/* <p className="text-xs text-slate-500 font-medium">
              {user ? user.displayName : '👤 Chưa đăng nhập'}
            </p> */}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('gallery')}
              className={`p-2 rounded-lg transition-all ${
                activeTab === 'gallery'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-slate-400 hover:bg-slate-50'
              }`}
              title="Thư viện"
            >
              <ImageIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`p-2 rounded-lg transition-all ${
                activeTab === 'timeline'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-slate-400 hover:bg-slate-50'
              }`}
              title="Dòng thời gian"
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
              title="Thống kê"
            >
              <PieChart className="w-5 h-5" />
            </button>
            {/* {user ? (
              <button
                onClick={logOut}
                className="p-2 rounded-lg transition-all text-slate-400 hover:bg-slate-50"
                title="Đăng xuất"
              >
                <LogOut className="w-5 h-5" />
              </button>
            ) : (
              <AuthButton />
            )} */}
            {/* {!user && <AuthButton />} */}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Gallery View */}
          {activeTab === 'gallery' && (
            <>
              <SmartUploader
                                isProcessing={isProcessing}
                setIsProcessing={setIsProcessing}
                tripId={tripId}
                userId={user?.uid || 'guest'}
              />
              <div className="sticky top-14 z-30 bg-white/95 backdrop-blur-sm py-2 -mx-4 px-4 border-b border-slate-100">
                <FilterChips
                  filter={filter}
                  setFilter={setFilter}
                  categoryFilter={categoryFilter}
                  setCategoryFilter={setCategoryFilter}
                />
              </div>
              <PhotoGrid
                items={filteredData}
                onSelect={selectItem}
                loading={loadingData}
              />
            </>
          )}

          {/* Timeline & Dashboard Views */}
          {activeTab !== 'gallery' && (
            <>
              <SmartUploader
                                isProcessing={isProcessing}
                setIsProcessing={setIsProcessing}
                tripId={tripId}
                userId={user?.uid || 'guest'}
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
                            onClick={() => selectItem(item)}
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
            </>
          )}
        </div>
      </div>

      {/* Photo Detail Modal */}
      {selectedItem && (
        <PhotoDetailModal
          item={selectedItem}
          allItems={data}
          isOpen={!!selectedItem}
          onClose={() => selectItem(null)}
          onDelete={handleDeleteItem}
          onNavigate={selectItem}
        />
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
