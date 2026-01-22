# 🚀 Trip Mate AI - Development Guide

## Project Overview

**Trip Mate AI** is a mobile-first travel expense & memory manager for group trips. Built with Next.js, React, Tailwind CSS, Firebase, and Google Gemini AI.

- **Repo:** https://github.com/thieuluan1618/trip-mate-ai
- **Live:** https://trip-mate-ai-roan.vercel.app
- **Status:** 🚧 Phase 2 (Firebase Integration)

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| **Framework** | Next.js 16+ (App Router) |
| **UI Library** | React 19+ with TypeScript |
| **Styling** | Tailwind CSS |
| **Icons** | lucide-react |
| **AI Integration** | google-generative-ai (Gemini 2.5 Flash) |
| **Backend** | Firebase (Auth, Firestore, Storage) |
| **Image Compression** | browser-image-compression |
| **Animations** | framer-motion |
| **Deployment** | Vercel |

---

## 📁 Project Structure

```
trip-mate-ai/
├── app/
│   ├── page.tsx                 # Main app (Client Component)
│   ├── seed/page.tsx            # Data seeding UI
│   ├── layout.tsx               # Root layout
│   └── globals.css              # Global styles
├── components/
│   ├── AuthGuard.tsx            # Auth wrapper component
│   ├── PreviewModal.tsx         # Upload preview modal
│   ├── Toast.tsx                # Toast notifications
│   ├── FilterChips.tsx          # Filter UI chips
│   └── PhotoGrid.tsx            # Photo gallery grid
├── lib/
│   ├── firebase.ts              # Firebase config & initialization
│   ├── firestoreUtils.ts        # Firestore CRUD operations
│   ├── storageUtils.ts          # Firebase Storage uploads
│   ├── gemini.ts                # Gemini AI integration
│   ├── imageUtils.ts            # Image compression & encoding
│   ├── appVoice.ts              # App personality & messages
│   ├── authContext.tsx          # Auth context provider
│   └── seedData.ts              # Sample trip data
├── scripts/
│   └── seed.ts                  # CLI seed script
├── types/
│   └── index.ts                 # TypeScript type definitions
├── public/                      # Static assets
├── .env.example                 # Environment template
├── .env.local                   # Local environment (gitignored)
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
├── firestore.rules              # Firestore security rules
├── storage.rules                # Storage security rules
└── AGENTS.md                    # This file
```

---

## 🔧 Setup & Installation

### Prerequisites
- Node.js 18+
- npm or pnpm
- Firebase project with Firestore & Storage

### Install Dependencies
```bash
npm install
```

### Environment Variables
```bash
cp .env.example .env.local
# Fill in Firebase & Gemini credentials
```

---

## 📝 Key Commands

```bash
npm run dev          # Development server (localhost:3000)
npm run build        # Production build
npm run lint         # ESLint checks

# Seed data
npx dotenv -e .env.local -- npx tsx scripts/seed.ts
```

---

## 🔥 Firebase Configuration

### Database
Using **named database**: `trip-mate-ai` (not default)

In `lib/firebase.ts`:
```typescript
db = getFirestore(app, 'trip-mate-ai');
```

### Required Indexes
Create composite index in Firebase Console → Firestore → Indexes:

| Collection | Fields |
|------------|--------|
| `trips` | `createdBy` (Asc), `createdAt` (Desc) |

### Data Structure
```
trips/{tripId}
  ├── tripName: string
  ├── totalBudget: number
  ├── startDate: Timestamp
  ├── endDate: Timestamp
  ├── currency: string
  ├── memberCount: number
  ├── createdBy: string (userId or 'guest')
  ├── createdAt: Timestamp
  └── updatedAt: Timestamp

trips/{tripId}/items/{itemId}
  ├── name: string
  ├── amount: number
  ├── category: 'food' | 'transport' | 'stay' | 'other' | 'scenery' | 'memory'
  ├── type: 'expense' | 'memory'
  ├── imageUrl: string (Firebase Storage URL)
  ├── timestamp: Timestamp
  ├── description: string
  ├── createdBy: string
  ├── createdAt: Timestamp
  └── updatedAt: Timestamp
```

---

## 🎨 Core Modules

### `lib/firestoreUtils.ts`
```typescript
// Trip operations
getUserTrips(userId)              // Get all user's trips
getTripById(tripId)               // Get single trip
createTrip(trip)                  // Create new trip
updateTrip(tripId, data)          // Update trip
deleteTrip(tripId)                // Delete trip + items
subscribeUserTrips(userId, cb)    // Real-time trip list

// Item operations
saveTripItem(tripId, item)        // Save expense/memory
loadTripItems(tripId)             // Load all items
subscribeTripItems(tripId, cb)    // Real-time items
getOrCreateDefaultTrip(userId)    // Get/create default trip
seedTripData(userId, info, items) // Seed sample data
```

### `lib/storageUtils.ts`
```typescript
uploadFileToStorage(file, path)   // Upload to Firebase Storage
generateStoragePath(tripId, name) // Generate unique path
```

### `lib/gemini.ts`
```typescript
analyzeImage(base64, mimeType)    // AI image analysis
analyzeTripExpenses(expenses)     // AI expense analysis
```

### `lib/appVoice.ts`
Randomized Vietnamese messages:
- `uploadErrors` - Funny error messages
- `successMessages` - Success confirmations
- `emptyStates` - Empty state jokes
- `loadingMessages` - Loading humor

---

## 🎯 Current Features (Phase 2)

✅ **Smart Uploader**
- Upload image (bill or memory)
- Client-side compression (500KB max)
- Gemini Vision analysis
- Preview modal with editing
- Upload to Firebase Storage

✅ **Firebase Integration**
- Firestore persistence
- Real-time sync with listeners
- Firebase Storage for images
- Optional Google Sign-in

✅ **Timeline & Gallery**
- Chronological timeline view
- Photo gallery grid
- Category filtering
- Full image modal

✅ **Financial Dashboard**
- Total spending display
- Split cost calculator
- Category breakdown
- AI expense analysis

---

## 🚧 Upcoming Features

### Phase 3: Enhanced AI
- [ ] Smarter expense insights
- [ ] Budget recommendations
- [ ] Spending patterns

### Phase 4: Mobile (Capacitor)
- [ ] PWA offline support
- [ ] iOS/Android builds
- [ ] Push notifications

---

## 🎨 Design System

### Color Palette
| Category | Color |
|----------|-------|
| Food | Orange `#f97316` |
| Transport | Blue `#3b82f6` |
| Stay | Purple `#a855f7` |
| Other | Pink `#ec4899` |
| Scenery | Teal `#14b8a6` |
| Memory | Rose `#f43f5e` |
| Primary | Indigo → Violet gradient |

### Responsive Breakpoints
- Mobile: `max-w-md` (default)
- Tablet: `md:max-w-2xl`
- Desktop: `lg:max-w-4xl`

---

## 🐛 Debugging

### Common Issues

**"Query requires an index"**
- Create composite index in Firebase Console
- Check console error for direct link

**"NOT_FOUND" on Firestore**
- Verify database exists and is named `trip-mate-ai`
- Check project ID in `.env.local`

**Images not loading**
- Check Storage rules allow reads
- Verify `imageUrl` is Firebase Storage URL (not blob)

### Useful Commands
```bash
# Check TypeScript errors
npx tsc --noEmit

# Test Firestore connection
npx dotenv -e .env.local -- npx tsx scripts/seed.ts
```

---

## 📤 Deployment

### Vercel (Auto)
Push to `main` → auto-deploys to https://trip-mate-ai-roan.vercel.app

### Manual
```bash
npx vercel --prod
```

### Environment on Vercel
Add all `.env.local` variables in Vercel dashboard → Settings → Environment Variables

---

**Last Updated:** January 22, 2026
