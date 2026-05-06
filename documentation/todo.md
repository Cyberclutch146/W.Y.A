# CampusPulse Development TODO

## 🚀 Hero Visuals (Current Focus)
- [x] **Live Data Integration**: Hook up `HeroFloatingEcosystem` (and other options) to live information from Firestore events.
    - [x] Map real RSVP counts.
    - [x] Display actual event XP rewards.
    - [x] Integrate real "Upcoming Events" satellite.
    - [x] Sync Leaderboard satellite with real user rankings.
- [x] **Final Selection & Cleanup**: Once a hero visual is finalized:
    - [x] Merge the component directly into `page.tsx`.
    - [x] Remove the modular `HeroVisual` wrapper and unused alternatives (PulseOrb, InfiniteStream, etc.).
- [x] **Performance Audit**: Ensure 60FPS on motion-heavy components (Ecosystem/Orb) for low-end devices.

## 🧠 Recommendation Engine (Phase 1)
- [x] **Academic Rhythm Layer**: Implement scoring that shifts priority based on the campus calendar (Finals vs. Welcome Week).
- [x] **Semantic AI Vibe Matching**: Use Gemini to match event descriptions to student bios beyond keywords.
- [x] **Departmental Trending Heat**: Real-time boosts for events popular within a student's major.
- [x] **Transparency Tooltips**: Explain the "Why" behind a recommendation (e.g., *"Matched because 4 friends are going"*).

## 🛠️ UI & Infrastructure
- [x] **Real Event Integration**: Replace all static mockups in the feed with data from `AuthContext` or API.
- [x] **Security Hardening**:
    - [x] Migrate remaining client-side writes (Chat, User Profiles) to secure API routes.
    - [x] Tighten Firestore rules once migrations are complete.
- [x] **Error Handling**: Implement robust error boundaries for external data feeds (Event check-ins, real-time stats).

---
*Last Updated: 2026-05-04*
