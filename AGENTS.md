# 🚀 Trip Mate AI - Development Guide

## Project Overview

**Trip Mate AI** is a mobile-first travel expense & memory manager for group trips. Built with Next.js, React, Tailwind CSS, Firebase, and Google Gemini AI.

- **Repo:** https://github.com/thieuluan1618/trip-mate-ai
- **Live:** https://trip-mate-ai-roan.vercel.app
- **Status:** 🚧 In Development (Foundation Phase)

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
│   ├── layout.tsx              # Root layout
│   └── globals.css             # Global styles
├── lib/
│   ├── firebase.ts             # Firebase config & initialization
│   ├── gemini.ts               # Gemini AI integration
│   ├── imageUtils.ts           # Image compression & encoding
│   └── appVoice.ts             # App personality & messages
├── types/
│   └── index.ts                # TypeScript type definitions
├── public/                      # Static assets
├── .env.local                  # Environment variables (template)
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
└── AGENTS.md                   # This file
```

---

## 🔧 Setup & Installation

### Prerequisites
- Node.js 18+
- npm or pnpm

### Install Dependencies
```bash
npm install
# or
pnpm install
```

### Environment Variables
Create `.env.local` in project root and fill in your Firebase & Gemini credentials:

```env
# Firebase Config
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain_here
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id_here
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket_here
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id_here

# Gemini API
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

> 🔐 **Security Note:** Never commit `.env.local`. Add to `.gitignore`.

---

## 📝 Key Commands

### Development
```bash
npm run dev
# Runs Next.js dev server at http://localhost:3000
```

### Build
```bash
npm run build
# Creates optimized production build
```

### Type Check
```bash
npm run type-check
# or
npx tsc --noEmit
```

### Lint
```bash
npm run lint
# ESLint checks
```

### Deploy to Vercel
```bash
npx vercel --prod
```

---

## 🎨 App Architecture

### Core Modules

#### `lib/firebase.ts`
- Firebase app initialization
- Auth, Firestore, Storage instances
- **Usage:** Import `auth`, `db`, `storage` for Firebase operations

#### `lib/gemini.ts`
```typescript
// Analyze uploaded image
analyzeImage(base64Data, mimeType) → AIAnalysisResult

// Generate trip expense analysis
analyzeTripExpenses(expenses) → string
```

#### `lib/imageUtils.ts`
```typescript
// Compress image before upload
compressImage(file, options) → File

// Convert file to Base64
fileToBase64(file) → Promise<string>

// Create preview URL
fileToPreviewUrl(file) → string
```

#### `lib/appVoice.ts`
App personality & messaging. Messages are randomized for each interaction:
- **uploadErrors:** 6 funny AI error messages
- **successMessages:** 5 success confirmations
- **emptyStates:** 3 "no data yet" jokes
- **loadingMessages:** 4 loading state messages
- **budgetMessages:** Safe/Warning/Overdraft statuses
- **tooltips:** UI element hover texts

Usage:
```typescript
getRandomMessage(appVoice.uploadErrors)  // Get random error
getBudgetStatusWithVibe(spent, budget)   // Get status + emoji
```

### Data Types (`types/index.ts`)

```typescript
interface Trip {
  id: string
  tripName: string
  totalBudget: number
  startDate: Date
  currency: string (default: VND)
  memberCount: number
}

interface TripItem {
  id: string
  tripId: string
  name: string
  amount: number (0 if memory)
  category: 'food' | 'transport' | 'stay' | 'other' | 'scenery' | 'memory'
  type: 'expense' | 'memory'
  imageUrl?: string
  timestamp: Date
  description: string
  createdBy: string (userId)
}
```

---

## 🎯 Current Features (Phase 1)

✅ **Smart Uploader**
- Upload image (bill or memory)
- Client-side compression (500KB max)
- Gemini Vision analysis
- Auto-detection: receipt → expense, photo → memory

✅ **Timeline Feed**
- Chronological display of expenses & memories
- Category badges & color coding
- Image preview on cards
- Full image modal

✅ **Financial Dashboard**
- Total spending display
- Split cost calculator (per person)
- Category breakdown with progress bars
- Budget status (safe/warning/overdraft)

✅ **App Personality**
- Funny Vietnamese messages throughout
- Randomized success/error alerts
- Humorous empty states
- Loading state humor

---

## 🚧 Upcoming Features (Phase 2-4)

### Phase 2: Firebase Integration
- [ ] User authentication (Google Sign-in)
- [ ] Firestore data persistence
- [ ] Firebase Storage for images
- [ ] Real-time trip sync

### Phase 3: AI Trip Analysis
- [ ] Gemini text generation for expense analysis
- [ ] Humorous financial advice in Vietnamese
- [ ] Spending pattern insights

### Phase 4: Mobile App (Capacitor)
- [ ] PWA setup (offline support)
- [ ] iOS build
- [ ] Android build
- [ ] App Store & Play Store submission

---

## 🎨 Design System

### Color Palette

| Category | Color | Hex |
|----------|-------|-----|
| Food | Orange/Yellow | `#f97316` |
| Transport | Blue | `#3b82f6` |
| Stay | Purple | `#a855f7` |
| Other | Pink | `#ec4899` |
| Scenery | Teal | `#14b8a6` |
| Memory | Rose | `#f43f5e` |
| Primary | Indigo → Violet | `#4f46e5 → #7c3aed` |

### Typography
- **Headers:** Bold, gradient text
- **Body:** Regular, slate-800
- **Secondary:** Slate-500, smaller size
- **Interactive:** Bold, with hover effects

### Spacing
- **Card padding:** p-4
- **Section gaps:** space-y-6
- **Button height:** p-3 (44px+ for touch)

---

## 💬 App Voice & Personality

**Tone:** Casual, funny, millennial/Gen Z Vietnamese

Every interaction should feel personal and humorous. Examples:

```
Error:    "AI mải uống cà phê ☕, chờ xíu nha!"
Success:  "Bill được lưu, ví bạn khóc rồi! 💸"
Empty:    "🎯 Đội trưởng giàu! Chưa tiêu đồng nào!"
Budget:   "⚠️ Cảnh báo: Ví đang 'cay'!"
```

---

## 🔐 Environment Setup Checklist

- [x] Clone repo
- [x] Run `npm install`
- [x] Create Firebase project (https://console.firebase.google.com)
- [x] Enable Authentication (Google Sign-in)
- [x] Create Firestore database
- [x] Create Cloud Storage bucket
- [x] Register Web app → copy Firebase config to `.env.local`
- [x] Deploy Storage rules: `firebase deploy --only storage`
- [ ] Get Gemini API key (https://ai.google.dev) - Optional for now
- [ ] Run `npm run dev` to test locally
- [ ] Add env vars to Vercel dashboard

---

## 📤 Git Workflow

```bash
# Create feature branch
git checkout -b feature/smart-uploader

# Make changes & commit
git add .
git commit -m "feat: add image compression to smart uploader"

# Push to GitHub
git push origin feature/smart-uploader

# Create PR, merge to main

# Deploy to Vercel (auto-deploys on push to main)
```

---

## 🚀 Deployment

### Vercel (Automatic)
Every push to `main` auto-deploys to: https://trip-mate-ai-roan.vercel.app

### Manual Vercel Deploy
```bash
npx vercel --prod
```

### Environment Variables on Vercel
1. Go to Vercel dashboard
2. Select project → Settings → Environment Variables
3. Add all `.env.local` variables
4. Redeploy

---

## 🐛 Debugging Tips

### Local Development
```bash
# Enable detailed logging
DEBUG=* npm run dev

# Check TypeScript errors
npm run type-check

# Lint check
npm run lint
```

### Firebase Issues
- Check credentials in `.env.local`
- Verify Firebase rules allow read/write
- Check browser console for auth errors

### Gemini API Issues
- Verify API key is active
- Check rate limits at https://ai.google.dev/account
- Ensure image is valid (JPG/PNG)

---

## 📞 Contact & Support

- **GitHub:** https://github.com/thieuluan1618/trip-mate-ai
- **Issues:** Open GitHub Issues for bugs/features

---

## 📅 Development Timeline

| Phase | Duration | Status |
|-------|----------|--------|
| **Phase 1: Foundation** | Week 1 | ✅ In Progress |
| **Phase 2: Firebase** | Week 2 | 🚧 Planned |
| **Phase 3: AI Analysis** | Week 3 | 🚧 Planned |
| **Phase 4: Mobile (Capacitor)** | Week 4-5 | 🚧 Planned |

---

**Last Updated:** January 21, 2026  
**Next Review:** After Firebase integration
