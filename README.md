# 🧳 Trip Mate AI

Smart travel expense tracker & memory timeline for group trips. Upload bills or photos, AI auto-categorizes everything.

![Next.js](https://img.shields.io/badge/Next.js-16+-black?logo=next.js)
![Firebase](https://img.shields.io/badge/Firebase-Firestore-orange?logo=firebase)
![Gemini](https://img.shields.io/badge/Gemini-AI-blue?logo=google)

## ✨ Features

- 📸 **Smart Upload** - Upload bills/photos, Gemini AI extracts merchant, amount & category
- 📊 **Expense Dashboard** - Total spending, per-person split, category breakdown
- 🖼️ **Photo Gallery** - Trip memories with timeline view
- 🔄 **Real-time Sync** - Firestore live updates across devices
- 🎭 **Fun Vietnamese UI** - Humorous messages & personality

## 🚀 Quick Start

```bash
# Clone
git clone https://github.com/thieuluan1618/trip-mate-ai.git
cd trip-mate-ai

# Install
npm install

# Setup environment
cp .env.example .env.local
# Fill in your Firebase & Gemini credentials

# Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🔧 Environment Variables

Copy `.env.example` to `.env.local` and fill in:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Web API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase Storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID |
| `NEXT_PUBLIC_GEMINI_API_KEY` | Google Gemini API key |

## 🛠️ Tech Stack

- **Framework:** Next.js 16+ (App Router)
- **UI:** React 19, Tailwind CSS, Lucide Icons
- **Backend:** Firebase (Auth, Firestore, Storage)
- **AI:** Google Gemini 2.5 Flash (Vision)
- **Deploy:** Vercel

## 📁 Project Structure

```
trip-mate-ai/
├── app/
│   ├── page.tsx           # Main app
│   ├── seed/page.tsx      # Data seeding page
│   └── layout.tsx         # Root layout
├── components/
│   ├── AuthGuard.tsx      # Auth wrapper
│   ├── PreviewModal.tsx   # Upload preview
│   ├── Toast.tsx          # Notifications
│   └── ...
├── lib/
│   ├── firebase.ts        # Firebase init
│   ├── firestoreUtils.ts  # Firestore CRUD
│   ├── storageUtils.ts    # Storage uploads
│   ├── gemini.ts          # AI analysis
│   └── appVoice.ts        # UI messages
├── scripts/
│   └── seed.ts            # Data seeding script
└── types/
    └── index.ts           # TypeScript types
```

## 📝 Scripts

```bash
npm run dev       # Development server
npm run build     # Production build
npm run lint      # ESLint check
npm run seed      # Seed sample data (requires .env.local)
```

## 🔥 Firebase Setup

1. Create project at [Firebase Console](https://console.firebase.google.com)
2. Enable **Firestore Database** (use named database: `trip-mate-ai`)
3. Enable **Storage**
4. Enable **Authentication** → Google Sign-in
5. Add composite index for `trips` collection:
   - Fields: `createdBy` (Asc), `createdAt` (Desc)

## 🤖 Gemini API

Get API key from [Google AI Studio](https://ai.google.dev)

## 📦 Deploy

Auto-deploys to Vercel on push to `main`:

```bash
npx vercel --prod
```

Add all `.env.local` variables to Vercel dashboard.

## 📄 License

MIT

---

Built with ❤️ for group travelers
