import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

console.log('Using project:', firebaseConfig.projectId);

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, 'trip-mate-ai');

const firstTripData = [
  { name: 'Nhậu 1 (Lẩu bò Thiên Kim)', amount: 502, category: 'food', type: 'expense', timestamp: new Date('2025-01-15T18:00:00'), description: 'Nhậu lẩu bò' },
  { name: 'Trà sữa', amount: 254, category: 'food', type: 'expense', timestamp: new Date('2025-01-15T20:00:00'), description: 'Trà sữa ngon' },
  { name: 'Trứng', amount: 80, category: 'food', type: 'expense', timestamp: new Date('2025-01-16T07:00:00'), description: 'Ăn sáng' },
  { name: 'Cafe sáng + beers', amount: 195, category: 'food', type: 'expense', timestamp: new Date('2025-01-16T08:00:00'), description: 'Cafe buổi sáng' },
  { name: 'Nhậu hải sản', amount: 1852, category: 'food', type: 'expense', timestamp: new Date('2025-01-16T12:00:00'), description: 'Hải sản tươi' },
  { name: 'Cafe sáng', amount: 51, category: 'food', type: 'expense', timestamp: new Date('2025-01-17T07:30:00'), description: 'Cafe' },
  { name: 'Mì', amount: 11, category: 'food', type: 'expense', timestamp: new Date('2025-01-17T08:00:00'), description: 'Mì ăn liền' },
  { name: 'Vỏ bia + đá', amount: 40, category: 'food', type: 'expense', timestamp: new Date('2025-01-17T10:00:00'), description: 'Bia và đá' },
  { name: 'Tiền cưới', amount: 2000, category: 'other', type: 'expense', timestamp: new Date('2025-01-17T11:00:00'), description: 'Mừng cưới' },
  { name: 'Xe 1', amount: 100, category: 'transport', type: 'expense', timestamp: new Date('2025-01-15T06:00:00'), description: 'Xe đi' },
  { name: 'Xe 2', amount: 150, category: 'transport', type: 'expense', timestamp: new Date('2025-01-16T06:00:00'), description: 'Xe đi tiếp' },
  { name: 'Xe 3', amount: 100, category: 'transport', type: 'expense', timestamp: new Date('2025-01-17T06:00:00'), description: 'Xe về' },
  { name: 'Xăng (đợt 1)', amount: 500, category: 'transport', type: 'expense', timestamp: new Date('2025-01-15T07:00:00'), description: 'Đổ xăng' },
  { name: 'Cafe nhà nghỉ', amount: 42, category: 'food', type: 'expense', timestamp: new Date('2025-01-16T14:00:00'), description: 'Cafe tại nhà nghỉ' },
  { name: 'Ăn sáng', amount: 75, category: 'food', type: 'expense', timestamp: new Date('2025-01-17T07:00:00'), description: 'Bữa sáng' },
  { name: 'Cafe resort', amount: 250, category: 'food', type: 'expense', timestamp: new Date('2025-01-16T15:00:00'), description: 'Cafe tại resort' },
  { name: 'Cơm gà', amount: 190, category: 'food', type: 'expense', timestamp: new Date('2025-01-16T18:00:00'), description: 'Cơm gà ngon' },
  { name: 'Cafe Thân', amount: 61, category: 'food', type: 'expense', timestamp: new Date('2025-01-17T09:00:00'), description: 'Cafe với bạn' },
  { name: 'Cafe + rửa xe', amount: 60, category: 'transport', type: 'expense', timestamp: new Date('2025-01-17T14:00:00'), description: 'Rửa xe và cafe' },
  { name: 'Homestay', amount: 3612, category: 'stay', type: 'expense', timestamp: new Date('2025-01-15T21:00:00'), description: 'Tiền homestay' },
  { name: 'Mực + bánh căn', amount: 110, category: 'food', type: 'expense', timestamp: new Date('2025-01-16T19:00:00'), description: 'Ăn vặt' },
  { name: 'Cafe + sâm', amount: 70, category: 'food', type: 'expense', timestamp: new Date('2025-01-17T10:30:00'), description: 'Cafe sâm' },
  { name: 'Villa Thomasa (full, gồm cọc)', amount: 1910, category: 'stay', type: 'expense', timestamp: new Date('2025-01-16T20:00:00'), description: 'Tiền villa' },
  { name: 'Nhậu cừu – Hủ Tiếu Của Lộc', amount: 1607, category: 'food', type: 'expense', timestamp: new Date('2025-01-17T12:00:00'), description: 'Nhậu cừu' },
  { name: 'Cafe chiều', amount: 100, category: 'food', type: 'expense', timestamp: new Date('2025-01-17T15:00:00'), description: 'Cafe buổi chiều' },
  { name: 'Nhậu hải sản (bill mới)', amount: 1291, category: 'food', type: 'expense', timestamp: new Date('2025-01-17T18:00:00'), description: 'Hải sản tối' },
  { name: 'Xăng (đợt 2)', amount: 500, category: 'transport', type: 'expense', timestamp: new Date('2025-01-17T16:00:00'), description: 'Đổ xăng về' },
  { name: 'Nước uống', amount: 75, category: 'food', type: 'expense', timestamp: new Date('2025-01-17T13:00:00'), description: 'Nước' },
  { name: 'Thuê xe', amount: 3850, category: 'transport', type: 'expense', timestamp: new Date('2025-01-15T05:00:00'), description: 'Thuê xe cả chuyến' },
];

const firstTripInfo = {
  tripName: 'Chuyến đi Phú Yên 🌊',
  totalBudget: 20000,
  startDate: new Date('2025-01-15'),
  endDate: new Date('2025-01-19'),
  currency: 'VND',
  memberCount: 4,
};

async function seed() {
  const userId = 'guest';
  const now = new Date();

  console.log('🌱 Starting seed...');
  console.log(`Trip: ${firstTripInfo.tripName}`);
  console.log(`Items: ${firstTripData.length}`);

  // Create trip
  const tripRef = await addDoc(collection(db, 'trips'), {
    ...firstTripInfo,
    startDate: Timestamp.fromDate(firstTripInfo.startDate),
    endDate: Timestamp.fromDate(firstTripInfo.endDate),
    createdBy: userId,
    createdAt: Timestamp.fromDate(now),
    updatedAt: Timestamp.fromDate(now),
  });

  console.log(`✅ Created trip: ${tripRef.id}`);

  // Add items
  let count = 0;
  for (const item of firstTripData) {
    await addDoc(collection(db, 'trips', tripRef.id, 'items'), {
      ...item,
      tripId: tripRef.id,
      timestamp: Timestamp.fromDate(item.timestamp),
      createdBy: userId,
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
    });
    count++;
    process.stdout.write(`\r📝 Added ${count}/${firstTripData.length} items`);
  }

  console.log('\n✅ Seed complete!');
  console.log(`Total: ${firstTripData.reduce((s, i) => s + i.amount, 0).toLocaleString()}k`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
