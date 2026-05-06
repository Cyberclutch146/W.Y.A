<div align="center">
  <img src="frontend/public/logo.png" alt="W.Y.A Logo" width="120" style="margin-bottom: 20px" />

# 🌐 W.Y.A — Where You At?
### **The Premium Intelligence Engine for Campus Life**

[![Next.js](https://img.shields.io/badge/Next.js-15+-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Realtime_Cloud-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Gemini AI](https://img.shields.io/badge/Google_Gemini-1.5_Flash-4285F4?style=for-the-badge&logo=google-gemini&logoColor=white)](https://ai.google.dev/)

> [!IMPORTANT]
> **W.Y.A (formerly CampusPulse) is the final evolution of campus engagement.**
> We've transitioned to a premium SaaS-style architecture, focusing on high-fidelity motion, semantic intelligence, and a frictionless "Identity-First" RSVP system.

**"Find your tribe. Own your time. Know exactly Where You At."**

[The Feed](#-neural-discovery) • [The Engine](#-the-vibe-engine) • [Identity](#-digital-identity) • [Setup](#-igniting-the-pulse)

</div>

---

## 💎 The Premium Pillars

### 🧠 **Neural Discovery (RAG)**
We've replaced generic search with a **Retrieval-Augmented Generation (RAG)** engine.
- **Intent Search**: Search for *"chill music vibes tonight"* or *"hardcore hackathons with prizes"* and get matched based on event *context*, not just keywords.
- **Vibe Matching**: Our engine analyzes your bio and academic track to curate a "Daily Pulse" feed tailored uniquely to you.

### 🎨 **State-of-the-Art UX**
Built for the aesthetic-conscious student.
- **Glassmorphism**: A sleek, translucent UI that feels modern and lightweight.
- **Fluid Motion**: Powered by **GSAP** and **Framer Motion**, every transition is a choreographed experience.
- **Responsive DNA**: A "Mobile-First" philosophy ensuring the pulse is accessible from the lecture hall to the dorm room.

### 🛡️ **Identity-First RSVP**
- **OTP Verification**: Frictionless, secure email-based identity checks powered by Nodemailer.
- **Encrypted Tickets**: Instant QR code generation for every event, stored in your digital wallet.
- **One-Tap Check-in**: Organizers verify attendance in milliseconds with the built-in scanner.

---

## 🏗 Project Architecture

W.Y.A follows a **Secure-Server Architecture**, ensuring all sensitive mutations happen within the Firebase Admin SDK environment.

```mermaid
graph LR
    subgraph Client
        UI[React/Next.js UI]
        GSAP[Animation Engine]
    end
    subgraph Edge_API
        OTP[Auth Service]
        RAG[Gemini RAG]
        EV[Event Manager]
    end
    subgraph Storage
        FB[Firebase RTDB]
        FS[Firestore Admin]
    end

    UI --> Edge_API
    Edge_API --> Storage
    RAG -.->|Context| UI
```

---

## 📂 Folder Structure

The project is cleanly divided into three primary domains:

```text
├── frontend/               # Next.js 15 App Router Project
│   ├── src/                # Core React components & API routes
│   ├── public/             # Static assets
│   ├── .env.local          # Environment configuration
│   └── package.json        # Frontend-specific dependencies
├── backend/                # Firebase & Server-side configuration
│   ├── firebase.json       # Firebase Hosting & RTDB config
│   ├── firestore.rules     # Security rules for Firestore
│   ├── scripts/            # Admin utility scripts
│   └── serviceAccountKey.json # Sensitive Admin SDK credentials
└── documentation/          # Extensive project guides
    ├── PROJECT_STATUS.md   # Real-time milestone tracker
    └── CAMPUS_ENGINE_ROADMAP.md # 30-feature growth plan
```

---

## 🛠 The Tech DNA

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Framework** | **Next.js 15+** | React 19 support, Server Actions, and lightning-fast streaming. |
| **Styling** | **Tailwind 4.0** | Future-proof CSS with zero-runtime overhead. |
| **Brain** | **Gemini 1.5 Flash** | High-speed, low-latency AI for real-time recommendation synthesis. |
| **State** | **Firebase Admin** | Industrial-grade security rules and real-time syncing. |
| **Comms** | **Nodemailer** | Custom SMTP control for branded, secure OTP delivery. |
| **Animation** | **GSAP / Framer** | Professional-grade cinematic motion and scroll-based triggers. |

---

## ⚙️ Igniting the Pulse

### 1. Configure the Core
Create `frontend/.env.local` and inject your credentials:
```env
# Firebase Public
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...

# Firebase Admin (Sensitive)
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."

# Intelligence
GEMINI_API_KEY=...

# Communication (Gmail App Password)
EMAIL=your_email@gmail.com
EMAIL_PASS=xxxx_xxxx_xxxx_xxxx
```

### 2. Launch
You can run the project directly from the root directory:
```bash
npm install
npm run dev
```

---

## 🛡 Security & Trust
- **Server-Side Integrity**: No direct client-side writes to sensitive Firestore collections. Everything flows through the Admin SDK.
- **OTP Resilience**: Verified SMTP connection with EAUTH error handling.
- **Privacy Core**: We use Gemini strictly for local context matching; student data is never used for training external models.

---

<div align="center">

### **Built for the ambitious. Driven by intelligence. Powering the campus.**

Developed with ❤️ by the W.Y.A Team.

[**Check Progress**](documentation/PROJECT_STATUS.md) • [**View Roadmap**](documentation/CAMPUS_ENGINE_ROADMAP.md) • [**Source**](https://github.com/your-repo/wya-campus)

</div>


