export interface Trip {
  id: string;
  tripName: string;
  totalBudget: number;
  startDate: Date;
  endDate?: Date;
  currency: string;
  memberCount: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TripItem {
  id: string;
  tripId: string;
  name: string;
  amount: number; // 0 if memory
  category: 'food' | 'transport' | 'stay' | 'other' | 'scenery' | 'memory';
  type: 'expense' | 'memory';
  storagePath?: string; // Firebase Storage path
  imageUrl?: string; // Public signed URL (primary image)
  images?: string[]; // Multiple image URLs for grouped bills
  timestamp: Date;
  description: string;
  createdBy: string; // userId
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryInfo {
  label: string;
  icon: any;
  color: string;
}

export type TabType = 'gallery' | 'timeline' | 'dashboard';
