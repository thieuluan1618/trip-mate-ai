# 🌍 Trip Mate AI - Intelligent Travel Expense & Memory Manager

---

## 📋 Project Overview

**Project Name:** Trip Mate AI  
**Target Audience:** Gen Z/Millennials traveling in groups  
**Primary Language:** Vietnamese  
**Platform:** Next.js (App Router) + React + Tailwind CSS

Build a high-performance, mobile-first web application that acts as both a **financial ledger** and a **social memory timeline** for group trips. Integrate Google Gemini API for automated data entry via image recognition and provide humorous, insightful spending analysis.

**Priority:** Maximize load speed and mobile responsiveness.

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| **Framework** | Next.js 16+ (App Router) |
| **UI Library** | React 19+ with TypeScript |
| **Styling** | Tailwind CSS (gradients, glassmorphism) |
| **Icons** | lucide-react |
| **AI Integration** | google-generative-ai (Gemini SDK) |
| **Authentication** | Firebase Auth (Google Sign-in) |
| **Database** | Firebase Firestore (NoSQL, real-time) |
| **Storage** | Firebase Storage (compressed images) |
| **Animations** | framer-motion |

---

## ✨ Key Features

### A. Smart Uploader (Gemini Vision)

**Input:** User uploads an image (Bill/Receipt OR Scenery/Food/Selfie)

**Performance Pipeline:**
1. **Compress Image** on client-side (browser-image-compression)
2. **Upload** to Firebase Storage → Get signed URL
3. **Send** URL/Base64 to Gemini 2.5 Flash for analysis
4. **Save** metadata to Firestore

**Processing Logic:**
- **Receipt Detection:** Extract merchant name, total amount → categorize as expense
- **Memory Detection:** Generate creative, emotional caption → categorize as memory
- **Output:** Return JSON to update app state automatically

---

### B. Pinterest-Style Gallery (Main View)

**Primary View:** Masonry grid layout showcasing all trip images in a visually stunning Pinterest-style layout.

**UI Components:**
- **Masonry Grid:** 2-3 columns with varied image heights (waterfall layout)
- **Photo Cards:**
  - Full-width image with rounded corners
  - Overlay info on hover/tap (amount, category, timestamp)
  - Expense indicator (💰) or Memory indicator (📸)
- **Filter Chips:** All | Bills Only | Memories Only | By Category
- **Detail Modal:** Instagram-style photo viewer with swipe navigation

**Smart Bulk Upload:**
- **Multi-select:** User selects 10-50 photos at once
- **AI Batch Processing:** Analyzes all images in parallel queue
- **Bill Grouping Logic:**
  - Groups photos by content (bills vs memories)
  - Clusters bills by time proximity (within 5-10 minutes = same expense)
  - Example: 3 bill photos at 19:05, 19:07, 19:10 → Single expense record with 3 images
- **Memory Handling:** Non-bill photos → Saved as standalone memories or attached to nearest expense

**Optimization:**
- Lazy loading images below fold
- Image compression (max 500KB, 1920px)
- Firebase Storage CDN for fast delivery
- Progressive image loading (blur placeholder)

---

### C. Timeline Feed (Alternative View)

Display items (expenses & memories) in **reverse chronological order** (accessible via tab switch).

**UI Components:**
- **Vertical timeline** with line connector
- **Expense Cards:** Amount (highlighted), category icon, receipt preview
- **Memory Cards:** Photo, AI-generated caption, category (Food/Scenery)

**Optimization:**
- Use `next/image` with Firebase Storage loader for responsive image optimization
- Implement lazy loading for timeline images

---

### C. Financial Dashboard (Analytical View)

#### Budget Management
- **Input:** Total trip budget
- **Visual Progress:** Bar gauge showing % of budget used
- **Status Indicators:**
  - 🟢 Green: Safe (0-79%)
  - 🟡 Yellow: Warning (80-99%)
  - 🔴 Red: Overdraft (100%+)
- **Display:** Remaining balance prominently

#### Cost Analysis
- **Total Spending:** Big, bold display of actual spending
- **Split Cost:** Input "Number of People" → auto-calculate cost per person
- **Category Breakdown:** Progress bars for Food, Transport, Stay, Other

#### AI-Powered Trip Analysis
- Button triggers Gemini text generation
- Reads expense list from Firestore
- Produces humorous summary + financial advice (Vietnamese)
- Example: *"You spent 50% of your budget on coffee ☕ Maybe slow down?"*

---

## 📊 Data Structure (Firestore Schema)

### Trips Collection
```json
{
  "tripId": "string (UUID)",
  "tripName": "string",
  "totalBudget": "number",
  "startDate": "Timestamp",
  "currency": "string (default: VND)",
  "memberCount": "number"
}
```

### Items Sub-Collection (trips/{tripId}/items)
```json
{
  "id": "string (UUID)",
  "name": "string (Title/Merchant)",
  "amount": "number (0 if memory)",
  "category": "enum (food | transport | stay | other | scenery | memory)",
  "type": "enum (expense | memory)",
  "storagePath": "string (Firebase Storage reference)",
  "imageUrl": "string (Public signed URL - primary image)",
  "images": "array<string> (Multiple image URLs for grouped bills)",
  "timestamp": "Timestamp",
  "description": "string (AI-generated caption)",
  "createdBy": "string (userId)"
}
```

---

## 🎨 UI/UX Design System

### Layout
- **Header:** Sticky, gradient background (Indigo → Violet), tab switcher (Gallery vs. Timeline vs. Dashboard)
- **Gallery View:** Pinterest-style masonry grid (primary view)
- **Animations:** framer-motion for smooth, hardware-accelerated transitions

### Color Palette
| Category | Color |
|----------|-------|
| 🍔 Food | Orange/Yellow |
| 🚗 Transport | Blue |
| 🏨 Stay | Purple |
| 💰 Expense (General) | Indigo |
| 📸 Memory | Rose/Pink |
| 💚 Budget Good | Emerald |
| ⚠️ Budget Warning | Amber |
| 🚨 Budget Over | Rose |

### Responsiveness
- ✅ Touch-friendly targets (min 44px)
- ✅ Readable font sizes for mobile
- ✅ Mobile-first design approach

---

## ⚡ Performance & Best Practices

### Server-Side Optimization
- ✅ Use Next.js Server Components to fetch Firestore data (faster initial paint)
- ✅ Use Client Components only for interactive elements (Upload, Tab switcher)
- ✅ Implement Image Optimization via `next/image`

### Client-Side Optimization
- ✅ Image compression before upload (reduce bandwidth & storage costs)
- ✅ Lazy loading for timeline images
- ✅ framer-motion for performant animations

### Data & User Experience
- ✅ **Mock Data:** Robust Vietnamese context mock data for demo (no login required)
- ✅ **Error Handling:** Graceful fallbacks if AI API calls fail
- ✅ **Real-time Updates:** Firestore listeners for live dashboard updates

---

## 🚀 Development Roadmap

### Phase 1: Foundation
- [ ] Setup Firebase project & authentication
- [ ] Create Firestore schema
- [ ] Build core layout (Header, Timeline, Dashboard tabs)

### Phase 2: Core Features
- [ ] Implement Smart Uploader with Gemini integration
- [ ] Build Pinterest-Style Gallery (main view)
  - [ ] Masonry grid layout (2-3 columns)
  - [ ] Photo cards with overlay info
  - [ ] Filter chips (All/Bills/Memories/Category)
  - [ ] Photo detail modal with swipe navigation
- [ ] Implement Smart Bulk Upload
  - [ ] Multi-file selection (10-50 photos)
  - [ ] Batch AI processing queue
  - [ ] Bill grouping by time proximity (5-10 min threshold)
  - [ ] Support multiple images per expense
- [ ] Build Timeline Feed UI (alternative view)
- [ ] Create Financial Dashboard

### Phase 3: Polish & Deploy
- [ ] AI Trip Analysis feature
- [ ] Performance optimization
- [ ] Mobile testing
- [ ] Deploy to Vercel

### Phase 4: Mobile App (Capacitor) 📱
- [ ] Setup Capacitor project
- [ ] Build iOS & Android native apps
- [ ] Configure App Store & Google Play signing
- [ ] Setup in-app purchase (RevenueCat)
- [ ] Submit to App Store & Play Store

---

## 📱 Mobile Strategy: Capacitor

**Decision:** Use Capacitor for quick app store launch with code reuse.

### Why Capacitor?
✅ Reuse 90% of existing Next.js/React code  
✅ Native iOS & Android apps  
✅ Full App Store & Google Play support  
✅ In-app purchases & monetization ready  
✅ Faster ship time (1-2 weeks)  
✅ Offline support via Service Workers  

### Capacitor Tech Stack
- **Framework:** Capacitor 6+
- **Bundler:** Next.js build → Capacitor wrapper
- **Plugins:** Camera, Geolocation, Local Storage, Push Notifications
- **Monetization:** RevenueCat + Stripe
- **Analytics:** Firebase Analytics (shared with web)

---

**Last Updated:** January 2026  
**Status:** Ready for Development 🚀
