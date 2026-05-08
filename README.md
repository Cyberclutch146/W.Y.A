<div align="center">
  <img src="frontend/public/logo.png" alt="W.Y.A Logo" width="120" style="margin-bottom: 20px" />

# 🌐 W.Y.A — Where You At?
### **The Premium Intelligence Engine for Campus Life**

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Admin_SDK_13.8-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Gemini AI](https://img.shields.io/badge/Google_Gemini-1.5_Flash-4285F4?style=for-the-badge&logo=google-gemini&logoColor=white)](https://ai.google.dev/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-FF0055?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion/)

> [!IMPORTANT]
> **W.Y.A (formerly CampusPulse) is the final evolution of campus engagement.**
> We've built a premium SaaS-style platform with high-fidelity motion, semantic AI intelligence, a three-pillar participation system, and a frictionless "Identity-First" RSVP engine — all secured by zero client-side writes.

**"Find your tribe. Own your time. Know exactly Where You At."**

[The Feed](#-neural-discovery-rag) • [The Engine](#-ai-intelligence-engine) • [Identity](#-identity-first-rsvp) • [Setup](#%EF%B8%8F-igniting-the-pulse)

</div>

---

## 💎 The Premium Pillars

### 🧠 **Neural Discovery (RAG)**
We've replaced generic search with a **Retrieval-Augmented Generation (RAG)** engine powered by Gemini 1.5 Flash.
- **Intent Search**: Search for *"chill music vibes tonight"* or *"hardcore hackathons with prizes"* and get matched based on event *context*, not just keywords.
- **Multi-Signal Scoring**: Our recommendation engine analyzes your interests, department, clubs, RSVP history, urgency, and social proof to curate a personalized feed.
- **Interest Archetypes**: AI classifies you as an "Explorer," "Tech Hustler," "Arts Enthusiast," or other persona based on your engagement patterns.
- **Transparency**: AI-generated "Why this event?" banners explain every recommendation.

### 🎨 **State-of-the-Art UX**
Built for the aesthetic-conscious student. 40+ custom components with a 682-line design token system.
- **Neobrutalist SaaS**: Bold hard-offset shadows, vibrant warm-cream backgrounds, and dopamine accent colors.
- **Fluid Motion**: Powered by **GSAP** and **Framer Motion 12** — every transition is choreographed. PillNavbar floats with scroll-awareness.
- **Three.js Visuals**: WebGL LiquidEther shader (41KB), particle Galaxy, physics-simulated Lanyard Badges.
- **Responsive DNA**: Mobile-first with 44px touch targets, bottom tab navigation, and responsive breakpoints.
- **Light/Dark Mode**: Full theme support with semantic color tokens.

### 🛡️ **Identity-First RSVP**
- **3-Step OTP**: Frictionless email verification flow — send → verify → confirm — powered by Nodemailer SMTP.
- **Encrypted Tickets**: Instant QR code generation stored in your **Digital Wallet** with offline capability.
- **One-Tap Check-in**: Organizers verify attendance in milliseconds with the built-in HTML5 QR scanner.
- **Zero Client Writes**: Every mutation flows through Firebase Admin SDK API routes. 98-line Firestore rules lock down all client-side writes.

### 🤖 **AI Intelligence Engine**
Gemini 1.5 Flash powers 5 distinct AI features:
- **Event Description Generator**: Create polished event descriptions from a few keywords.
- **Smart Category Tagging**: Auto-suggest categories, tags, and metadata for new events.
- **Campus AI Assistant**: Floating chatbot widget for campus questions and event discovery.
- **Recommendation Engine**: 6-signal scoring (interests, department, clubs, history, urgency, social proof).
- **Interest Match Explanations**: AI-generated "Why this event?" banners on every card.

### 🎫 **Three-Pillar Participation**
Every event supports three participation modes:
- **Attendance**: RSVP as "Going" or "Interested" with OTP-verified tickets.
- **Material Support**: Pledge goods (supplies, equipment) via the GoodsPledge modal.
- **Financial Support**: Donate to events via Razorpay payment integration.

---

## 🏗 Project Architecture

W.Y.A follows a **Secure-Server Architecture** with zero client-side Firestore writes. All mutations flow through 15 API route groups using Firebase Admin SDK.

```mermaid
graph LR
    subgraph Client["Client (React 19)"]
        UI[Next.js App Router]
        GSAP[GSAP + Framer Motion]
        THREE[Three.js Visuals]
    end
    subgraph Edge["API Routes (15 Groups)"]
        OTP[Auth Service]
        RAG[Gemini RAG]
        EV[Event Manager]
        NOTIFY[Notifications]
        SCAN[QR Scanner]
    end
    subgraph Storage["Storage Layer"]
        FS[Firestore Admin]
        RTDB[Firebase RTDB]
        STORE[Firebase Storage]
    end

    UI --> Edge
    Edge --> Storage
    RAG -.->|Context| UI
    GSAP -.->|Animation| UI
    THREE -.->|WebGL| UI
```

---

## 📂 Folder Structure

```text
IEMxRCC-1/
├── frontend/                          # Next.js 16.2.4 (Turbopack)
│   ├── src/
│   │   ├── app/
│   │   │   ├── (marketing)/           # Landing, Login, Register
│   │   │   │   ├── page.tsx           # Hero landing (62KB)
│   │   │   │   ├── login/             # OTP login flow
│   │   │   │   └── register/          # Profile creation
│   │   │   ├── (app)/                 # Authenticated routes
│   │   │   │   ├── feed/              # AI-curated event discovery
│   │   │   │   ├── create/            # AI-powered event wizard
│   │   │   │   ├── event/[id]/        # Event detail + RSVP + chat
│   │   │   │   ├── dashboard/         # Organizer command center
│   │   │   │   │   └── event/[id]/scan/ # QR scanner check-in
│   │   │   │   ├── profile/           # Profile + Digital Wallet
│   │   │   │   ├── leaderboard/       # XP campus rankings
│   │   │   │   ├── bulletin/          # Campus noticeboard
│   │   │   │   └── about/             # About page
│   │   │   └── api/                   # 15 server-side API groups
│   │   │       ├── auth/              # OTP send/verify/confirm
│   │   │       ├── events/            # CRUD, join, scan, pledge
│   │   │       ├── chat/              # Real-time event chat
│   │   │       ├── chatbot/           # AI campus assistant
│   │   │       ├── recommendations/   # Personalized scoring
│   │   │       ├── search/            # Semantic search
│   │   │       ├── bulletin/          # Noticeboard CRUD
│   │   │       ├── notifications/     # Push management
│   │   │       ├── generate-description/ # AI event descriptions
│   │   │       ├── generate-event-meta/  # AI category/tags
│   │   │       ├── generate-image/       # AI poster generation
│   │   │       ├── promote/           # Event promotion
│   │   │       ├── create-payment-order/ # Razorpay orders
│   │   │       ├── sms/              # Twilio SMS stub
│   │   │       └── user/             # Profile management
│   │   ├── components/                # 40+ reusable components
│   │   ├── context/                   # AuthContext, ThemeProvider
│   │   ├── services/                  # 12 service modules
│   │   ├── types/                     # TypeScript interfaces
│   │   ├── utils/                     # Geo, persona utilities
│   │   ├── lib/                       # Firebase, avatar, Razorpay
│   │   └── data/                      # Static data files
│   ├── public/                        # Logos, images, assets
│   └── package.json                   # 48 dependencies
├── backend/
│   ├── firebase.json                  # Hosting + RTDB config
│   ├── firestore.rules                # 98-line security lockdown
│   ├── firestore.indexes.json         # Composite indexes
│   ├── serviceAccountKey.json         # Admin SDK credentials
│   ├── scripts/                       # Admin utilities
│   └── wipe-events.js                 # DB cleanup utility
└── documentation/
    ├── PROJECT_STATUS.md              # Milestone tracker
    └── CAMPUS_ENGINE_ROADMAP.md       # 40-feature growth plan
```

---

## 🛠 The Tech DNA

| Layer | Technology | Version | Rationale |
| :--- | :--- | :--- | :--- |
| **Framework** | Next.js | 16.2.4 | React 19 Server Components, App Router, Turbopack |
| **UI Library** | React | 19.2.4 | Concurrent features, transitions, suspense |
| **Styling** | Tailwind CSS | 4.0 | Zero-runtime CSS with custom design tokens |
| **Animation** | GSAP + Framer Motion | 3.15 / 12.38 | Professional-grade cinematic motion |
| **3D/WebGL** | Three.js | 0.184 | LiquidEther shader, Galaxy particles, Lanyard physics |
| **AI Brain** | Gemini 1.5 Flash | Latest | Description gen, recommendations, chatbot, meta extraction |
| **Auth** | Firebase + Nodemailer | Admin 13.8 | OTP email verification, zero client writes |
| **Database** | Firestore + RTDB | Latest | Real-time sync, Admin SDK exclusivity |
| **Payments** | Razorpay | 2.9.6 | Indian payment gateway for donations |
| **QR Scanning** | html5-qrcode | 2.3.8 | Cross-platform camera-based QR reading |
| **Maps** | Leaflet + React-Leaflet | 1.9.4 / 5.0 | Venue selection and campus mapping |
| **Notifications** | Sonner | 2.0.7 | Toast notifications with animation |
| **Data Processing** | PapaParse + XLSX | Latest | CSV/Excel import for bulk operations |
| **UI Components** | shadcn/ui | 4.6.0 | Accessible component primitives |

---

## ⚙️ Igniting the Pulse

### 1. Configure the Core
Create `frontend/.env.local` and inject your credentials:
```env
# Firebase Public
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_DATABASE_URL=...

# Firebase Admin (Sensitive — used by API routes)
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."

# Intelligence
GEMINI_API_KEY=...

# Communication (Gmail App Password)
EMAIL=your_email@gmail.com
EMAIL_PASS=xxxx_xxxx_xxxx_xxxx

# Payments (Optional)
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
```

### 2. Launch
Run the project from the root directory:
```bash
npm install
npm run dev
```
The app launches at `http://localhost:3000` with Turbopack hot-reload.

### 3. Deploy Firebase Rules
```bash
cd backend
firebase deploy --only firestore:rules
firebase deploy --only database
```

---

## 🛡 Security & Trust

- **Zero Client Writes**: All Firestore mutations are denied client-side. 15 API routes handle every write through Firebase Admin SDK.
- **98-Line Security Rules**: Granular per-collection and per-subcollection rules with recursive deny-by-default.
- **OTP Resilience**: Verified SMTP with App Passwords, dedicated `emailService.ts` transport.
- **Privacy Core**: Gemini processes event context locally — student data is never used for training external models.
- **Auth Persistence**: Session tokens persist across route transitions within the App Router.

---

## 📊 Current Progress

| Area | Completion | Details |
| :--- | :--- | :--- |
| **UI/UX Design** | 🟢 95% | 40+ components, full light/dark mode, mobile-first |
| **Auth & Identity** | 🟢 90% | 3-step OTP, profiles, persona archetypes |
| **Event System** | 🟢 85% | CRUD, RSVP, chat, donations, pledges, tickets |
| **AI Intelligence** | 🟡 60% | 5 features shipped, vector search pending |
| **Payments** | 🟡 40% | Order creation exists, E2E flow pending |
| **Offline/PWA** | 🟡 30% | Digital Wallet UI done, service worker pending |
| **Social Features** | 🔴 10% | Leaderboard done, social graph not started |

---

<div align="center">

### **Built for the ambitious. Driven by intelligence. Powering the campus.**

Developed with ❤️ by the W.Y.A Team.

[**Check Progress**](documentation/PROJECT_STATUS.md) • [**View Roadmap**](documentation/CAMPUS_ENGINE_ROADMAP.md)

</div>
