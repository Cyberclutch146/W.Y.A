# 💎 W.Y.A Campus — Project Status

This document tracks the evolution of the **W.Y.A (Where You At)** Campus Intelligence Platform. It is the single source of truth for completed milestones, system architecture, active bugs, and the immediate development trajectory.

---

## 📊 System Health Overview

| System | Status | Connectivity | Details |
| :--- | :--- | :--- | :--- |
| **Project Structure** | 🟢 PRODUCTION-READY | ROOT WORKSPACES | Monorepo: `frontend/`, `backend/`, `documentation/`. |
| **Frontend (Next.js 16)** | 🟢 OPERATIONAL | PORT 3000 (Turbopack) | React 19.2, App Router, Tailwind 4, Framer Motion 12. |
| **Backend (Firebase)** | 🟢 CONFIGURED | ADMIN SDK v13.8 | Firestore + RTDB. All writes server-side via Admin SDK. |
| **Auth (OTP)** | 🟢 ACTIVE | SMTP / NODEMAILER | Gmail App Passwords. 3-step: send → verify → confirm. |
| **Database (RTDB)** | 🟢 SYNCING | REAL-TIME | Rules deployed via Firebase CLI. |
| **Database (Firestore)** | 🟢 LOCKED DOWN | ADMIN SDK ONLY | Zero client-side writes. 98-line security rules file. |
| **Intelligence (Gemini)** | 🟢 READY | GEMINI 1.5 FLASH | AI description gen, event meta, chatbot, recommendations. |
| **Payments (Razorpay)** | 🟡 CONFIGURED | API KEYS SET | Payment order creation route exists; UI flow partial. |
| **SMS (Twilio)** | 🟡 STUB | SDK INSTALLED | Service file exists but not fully integrated. |

---

## 🏗️ Architecture Deep-Dive

### Monorepo Structure
```text
IEMxRCC-1/
├── frontend/                      # Next.js 16.2.4 (Turbopack)
│   ├── src/
│   │   ├── app/
│   │   │   ├── (marketing)/       # Landing, Login, Register (public)
│   │   │   ├── (app)/             # Authenticated routes
│   │   │   │   ├── home/          # Post-login home
│   │   │   │   ├── feed/          # Event discovery feed
│   │   │   │   ├── create/        # AI-powered event wizard
│   │   │   │   ├── event/[id]/    # Event detail + RSVP
│   │   │   │   ├── dashboard/     # Organizer command center
│   │   │   │   │   └── event/[id]/scan/  # QR scanner for check-in
│   │   │   │   ├── profile/       # User profile + digital wallet
│   │   │   │   ├── leaderboard/   # XP-based campus rankings
│   │   │   │   ├── bulletin/      # Campus noticeboard
│   │   │   │   └── about/         # About page
│   │   │   └── api/               # 15 Server-side API route groups
│   │   ├── components/            # 40+ reusable UI components
│   │   ├── context/               # AuthContext, ThemeProvider
│   │   ├── services/              # 12 service modules
│   │   ├── types/                 # TypeScript interfaces (202 lines)
│   │   ├── utils/                 # Geo helpers, persona utils
│   │   ├── lib/                   # Firebase init, avatar gen, Razorpay
│   │   └── data/                  # Static data files
│   ├── public/                    # Logos, category images, assets
│   └── package.json               # 48 dependencies
├── backend/
│   ├── firebase.json              # Hosting + RTDB config
│   ├── firestore.rules            # 98-line locked-down security rules
│   ├── firestore.indexes.json     # Composite indexes
│   ├── .firebaserc                # Project alias
│   ├── serviceAccountKey.json     # Admin SDK credentials
│   ├── config/                    # Additional config
│   ├── scripts/                   # Admin utility scripts
│   └── wipe-events.js             # DB cleanup utility
└── documentation/
    ├── PROJECT_STATUS.md           # ← This file
    └── CAMPUS_ENGINE_ROADMAP.md    # 30-feature growth plan
```

### API Routes (15 Groups)

| Route | Method | Purpose |
| :--- | :--- | :--- |
| `/api/auth/send-otp` | POST | Generates OTP, sends via Nodemailer SMTP |
| `/api/auth/verify-otp` | POST | Validates OTP against server store |
| `/api/auth/confirm-registration` | POST | Finalizes account creation in Firestore |
| `/api/events` | GET/POST | CRUD for events via Admin SDK |
| `/api/user` | GET/POST | Profile read/write via Admin SDK |
| `/api/chat` | POST | Event chat messages (server-validated) |
| `/api/chatbot` | POST | AI-powered campus assistant (Gemini) |
| `/api/recommendations` | GET | Personalized event scoring engine |
| `/api/search` | GET | Semantic + keyword event search |
| `/api/bulletin` | GET/POST/DELETE | Campus noticeboard CRUD |
| `/api/notifications` | GET/POST | Push notification management |
| `/api/generate-description` | POST | AI event description generator |
| `/api/generate-event-meta` | POST | AI category/tag suggestion |
| `/api/generate-image` | POST | AI event poster generation |
| `/api/promote` | POST | Event promotion engine |
| `/api/create-payment-order` | POST | Razorpay payment order creation |
| `/api/sms` | POST | SMS notification stub (Twilio) |

### Service Layer (12 Modules)

| Service | File | Responsibility |
| :--- | :--- | :--- |
| **eventService** | `eventService.ts` (15KB) | Full event CRUD, RSVP join/leave, donation logging, goods pledges, QR ticket generation, attendee scanning |
| **userService** | `userService.ts` (4KB) | Profile CRUD, XP/badge management |
| **recommendationService** | `recommendationService.ts` (11KB) | Multi-signal scoring: interests, department, clubs, history, urgency, social proof |
| **searchService** | `searchService.ts` (6KB) | Keyword + semantic search with Gemini embeddings |
| **aiActions** | `aiActions.ts` (14KB) | Gemini-powered description gen, event meta extraction, chatbot responses |
| **aiTools** | `aiTools.ts` (4KB) | Tool definitions for Gemini function calling |
| **emailService** | `emailService.ts` (5KB) | SMTP transport, OTP emails, ticket confirmation emails |
| **bulletinService** | `bulletinService.ts` (4KB) | Campus bulletin CRUD |
| **chatService** | `chatService.ts` (1KB) | Real-time event chat |
| **notificationService** | `notificationService.ts` (3KB) | In-app notification creation/management |
| **storageService** | `storageService.ts` (1KB) | Firebase Storage file uploads |
| **smsService** | `smsService.ts` (1KB) | Twilio SMS stub |

### Component Library (40+ Components)

**Navigation & Layout:**
- `PillNavbar.tsx` (26KB) — GSAP-powered floating pill navigation with scroll-awareness
- `AppNavigation.tsx` (11KB) — Mobile bottom tab bar
- `Navbar_top.tsx` (21KB) — Desktop top navigation with notifications
- `Navigation.tsx` (14KB) — Responsive navigation wrapper
- `StaggeredMenu.tsx` (20KB) — Full-screen staggered menu overlay
- `StaggeredNav.tsx` (16KB) — Staggered navigation variant

**Event System:**
- `EventCard.tsx` (22KB) — Premium event card with category gradients, urgency badges, progress bars
- `RSVPModal.tsx` (20KB) — 3-step RSVP flow: OTP → Verify → Success with QR ticket
- `DonationPanel.tsx` (16KB) — Three-pillar participation: Funds, Attendees, Goods
- `GoodsPledgeModal.tsx` (9KB) — Material contribution pledge form
- `PromotionModal.tsx` (9KB) — Event boost/promotion interface
- `DateTimePicker.tsx` (9KB) — Custom date/time selector
- `LocationPicker.tsx` (6KB) — Map-based venue selection
- `ScannerView.tsx` (5KB) — QR code scanner for organizer check-in

**Visual & Animation:**
- `LiquidEther.tsx` (41KB) — Three.js WebGL liquid background shader
- `Galaxy.jsx` (10KB) — Three.js particle galaxy effect
- `LanyardBadge.tsx` (11KB) — 3D lanyard badge with physics simulation
- `StickerPeel.tsx` (13KB) — Interactive sticker peel animation
- `Orb.tsx` (10KB) — Animated gradient orb
- `TextPressure.tsx` (8KB) — Pressure-sensitive text effect
- `ScrollVelocity.jsx` (4KB) — Velocity-based scroll animations
- `DynamicBackground.tsx` (2KB) — Theme-aware animated backgrounds
- `ConfettiBurst.tsx` (1KB) — Canvas confetti celebrations

**Intelligence & Social:**
- `AIChatWidget.tsx` (15KB) — Floating AI campus assistant chatbot
- `InterestMatchBanner.tsx` (8KB) — "Why this event?" AI match explanation
- `EngagementLeaderboard.tsx` (6KB) — XP-ranked campus leaderboard

**Utility:**
- `ThemeToggle.tsx` — Light/dark mode switch
- `ErrorBoundary.tsx` — React error boundary
- `LiveBadge.tsx` — Real-time "LIVE" indicator
- `ProgressBar.tsx` — Animated progress bar
- `CountUp.tsx` — Animated number counter
- `AppAccessGate.tsx` — Auth guard wrapper
- `SquigglyDivider.tsx` — Decorative SVG divider

### Design System

The global CSS (`globals.css`, 682 lines) defines a comprehensive token-based design system:

**Color Palette:**
- Core: Primary (violet), Secondary (emerald), Accent (pink), Gold
- Dopamine accents: Violet, Pink, Lime, Cyan, Orange
- Full light/dark mode support with semantic tokens

**Typography:**
- Headlines: `Bungee` (display), `Luckiest Guy` (playful)
- Body: System font stack with Inter fallback

**Shadow System (Neobrutalist):**
- `--shadow-xs` through `--shadow-xl`: Hard-offset black shadows
- `--shadow-glow`: Primary color glow for emphasis

**Surfaces:**
- `--cp-bg`, `--cp-surface`, `--cp-surface-dim`, `--cp-surface-raised`
- Glass morphism: `--glass-bg`, `--glass-border`

**Radii:** `--r-sm` through `--r-full` (0.375rem to 9999px)

### Type System (TypeScript)

Fully typed interfaces covering:
- `UserProfile` — 22 fields including department, year, clubs, XP, badges
- `CommunityEvent` — 20 fields with EventNeeds, geo, tags, registration
- `EventRSVP` — Status tracking (interested → going → attended)
- `Donation`, `GoodsPledge`, `ChatMessage` — Participation primitives
- `NotificationData` — 8 notification types with tone control
- `ScoredEvent`, `RecommendationReason` — AI scoring types
- Enums: `StudentInterest` (18), `Department` (12), `AcademicYear` (5), `EventCategory` (8)

### Security Model

**Firestore Rules (98 lines):**
- ALL client-side writes are **denied** — zero exceptions
- Every mutation flows through API routes using Firebase Admin SDK
- Users can only read their own notifications and registrations
- Events are publicly readable (for landing page and feed)
- Bulletins readable by authenticated users only
- Promotions/logs completely locked (server-only)

---

## ✅ Completed Milestones

### 🎨 Premium UI/UX Overhaul
- [x] **Aesthetic Pivot**: Transitioned from "Zine/Brutalist" to premium SaaS with neobrutalist accents
- [x] **Glassmorphism & Motion**: Integrated GSAP + Framer Motion for cinematic transitions
- [x] **PillNavbar**: Custom GSAP-powered floating navigation with scroll-awareness and active state tracking
- [x] **Y2K-Inspired Branding**: "W.Y.A?" signature branding across registration and profile panels
- [x] **Design Token System**: 682-line global CSS with full light/dark mode, 6 shadow tiers, glass morphism
- [x] **Category Asset Integration**: AI-generated images for all 8 event categories
- [x] **Mobile-First Optimization**: Touch-accessible 44px targets, responsive breakpoints, bottom tab nav
- [x] **Profile Page Premium Polish**: Unified shadow system, equal-height grid cards, Digital Wallet card container, Interest Archetype persona badges
- [x] **Dashboard Analytics**: Category Interest Pulse visualization, top performance metrics, action-required panels, instructional modal popups

### 🛡️ Security & Auth Hardening
- [x] **3-Step OTP Flow**: send-otp → verify-otp → confirm-registration
- [x] **Gmail App Password SMTP**: Resolved EAUTH failures with dedicated transport config
- [x] **Admin SDK Middleware**: All sensitive writes go through server-side API routes
- [x] **Firestore Lockdown**: Zero client-side writes, recursive subcollection rules
- [x] **Token Persistence**: Session persistence for authenticated navigation between routes
- [x] **Field Unification**: Resolved `code` vs `otp` payload mismatch across the RSVP flow

### 🎫 Event & RSVP System
- [x] **Resilient Data Fetching**: Sequential, error-handled dashboard loading
- [x] **Unified RSVP Flow**: Users can RSVP regardless of event "needs" configuration
- [x] **Three-Pillar Participation**: Funds (Razorpay), Attendees (RSVP), Goods (Pledge modal)
- [x] **QR Ticket Generation**: Instant QR code on RSVP success, stored in Digital Wallet
- [x] **QR Scanner**: Organizer check-in scanner with html5-qrcode
- [x] **Digital Wallet UI**: Offline-capable ticket storage with sub-card layout
- [x] **Event Chat**: Real-time messaging on event detail pages

### 🧠 AI Intelligence
- [x] **Gemini Integration**: Event description generation, category/tag suggestion, chatbot
- [x] **AI Event Wizard**: Manual-trigger AI suggestions to preserve API tokens
- [x] **Recommendation Engine**: Multi-signal scoring (interests, department, clubs, history, urgency, social proof)
- [x] **Interest Match Banner**: AI-generated "Why this event?" explanations
- [x] **AI Chat Widget**: Floating campus assistant powered by Gemini
- [x] **Persona Archetypes**: Interest-based persona classification (Explorer, Hustler, Artist, etc.)

### 📢 Community Features
- [x] **Campus Bulletin Board**: Create/read/delete campus-wide notices
- [x] **Engagement Leaderboard**: XP-ranked campus standings
- [x] **Notification System**: 8 notification types with read/dismiss support
- [x] **Event Promotion Engine**: Boost events with promotion modal

### 🎨 Premium Visual Components
- [x] **Three.js LiquidEther**: WebGL liquid shader background (41KB)
- [x] **Galaxy Particles**: Three.js particle effect
- [x] **3D Lanyard Badge**: Physics-simulated conference badge
- [x] **Sticker Peel**: Interactive peel animation
- [x] **Confetti Burst**: Canvas confetti celebrations
- [x] **Scroll Velocity Text**: Speed-reactive scroll animations

---

## 🛠️ Active Development (Current Sprint: "The Guardian")

### 1. 🎫 Ticket & Check-in Polish (Priority: Critical)
- [ ] **E2E Ticket Verification**: Link `SuccessModal` ticketId to Admin panel lookup for organizer validation
- [ ] **SMTP Retry Logic**: Automated retry for failed OTP/ticket emails (429/timeout handling)
- [ ] **Scanner Haptics**: Mobile haptic feedback + instant visual status on QR scan success
- [ ] **Offline Ticket Sync**: Service worker caching for Digital Wallet tickets when offline

### 2. 🧠 AI Deep Integration (Priority: High)
- [ ] **Vector Search Migration**: Move from Firestore `where` queries to Gemini-native embeddings or pgvector for semantic event matching
- [ ] **Dynamic Hero**: Landing page hero message personalized to user's most recent interaction
- [ ] **Persona Feed Sorting**: Use Interest Archetype data to re-order the event feed

### 3. 📊 Dashboard Analytics v2 (Priority: Medium)
- [ ] **RSVP Churn Tracking**: "Going" vs. actually "Checked In" comparison metrics
- [ ] **Organizer Insights Panel**: Detailed breakdown per event with conversion funnels

### 4. 💳 Payments (Priority: Medium)
- [ ] **Razorpay E2E**: Complete the donation payment flow from order creation to success callback
- [ ] **Payment Receipts**: Auto-generated receipt emails post-donation

---

## 🧠 Technical Retrospective & Lessons Learned

> [!NOTE]
> **Issue: Field Mismatch in RSVP Flow**
> *   **Discovery**: `/api/auth/verify-otp` expected `otp` in the JSON body, but `RSVPModal.tsx` was sending `code`.
> *   **Resolution**: Unified the payload structure to use `otp` globally.
> *   **Takeaway**: Always generate TypeScript interfaces for API request/response bodies.

> [!WARNING]
> **Issue: Gmail EAUTH Failures**
> *   **Discovery**: Standard login credentials failed due to Google's "Less Secure Apps" deprecation.
> *   **Resolution**: Switched to App Passwords and moved SMTP config to `emailService.ts`.
> *   **Takeaway**: Plan migration to Resend or SendGrid for production.

> [!NOTE]
> **Issue: Neobrutalist Shadow Inconsistency**
> *   **Discovery**: Some profile cards used `var(--shadow-lg)` while others had inline ambient shadows, causing visual misalignment.
> *   **Resolution**: Unified all cards to `var(--shadow-lg)` with `items-stretch` + `h-full flex flex-col justify-between` for equal heights.
> *   **Takeaway**: Maintain a single shadow token across all surface cards.

> [!NOTE]
> **Issue: Digital Wallet Alignment**
> *   **Discovery**: Digital Wallet had a floating header + loose ticket cards instead of a proper card container.
> *   **Resolution**: Wrapped entire section in a unified `rounded-[2rem]` card with tickets as lighter sub-cards.
> *   **Takeaway**: Every content section should be wrapped in a card container for grid consistency.

---

## 📅 Roadmap Highlights

- **Phase 1 (Imminent)**: Offline PWA optimization, E2E payment flow, scanner haptics.
- **Phase 2 (Growth)**: Social graph integration, group RSVP, freshman onboarding paths.
- **Phase 3 (Scale)**: Multi-campus deployment, departmental leaderboards, club affinity matrix.

See [CAMPUS_ENGINE_ROADMAP.md](./CAMPUS_ENGINE_ROADMAP.md) for the full 30-feature growth plan.

---
*Last Updated: 2026-05-08 (Current Session: Profile Alignment & Digital Wallet Polish)*
