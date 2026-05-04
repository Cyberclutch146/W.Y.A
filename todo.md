# CampusPulse Development TODO

## 🚀 Hero Visuals (Current Focus)
- [ ] **Live Data Integration**: Hook up `HeroFloatingEcosystem` (and other options) to live information from Firestore events.
    - [ ] Map real RSVP counts.
    - [ ] Display actual event XP rewards.
    - [ ] Integrate real "Upcoming Events" satellite.
    - [ ] Sync Leaderboard satellite with real user rankings.
- [ ] **Final Selection & Cleanup**: Once a hero visual is finalized:
    - [ ] Merge the component directly into `page.tsx`.
    - [ ] Remove the modular `HeroVisual` wrapper and unused alternatives (PulseOrb, InfiniteStream, etc.).
- [ ] **Performance Audit**: Ensure 60FPS on motion-heavy components (Ecosystem/Orb) for low-end devices.

## 🧠 Recommendation Engine (Phase 1)
- [ ] **Academic Rhythm Layer**: Implement scoring that shifts priority based on the campus calendar (Finals vs. Welcome Week).
- [ ] **Semantic AI Vibe Matching**: Use Gemini to match event descriptions to student bios beyond keywords.
- [ ] **Departmental Trending Heat**: Real-time boosts for events popular within a student's major.
- [ ] **Transparency Tooltips**: Explain the "Why" behind a recommendation (e.g., *"Matched because 4 friends are going"*).

## 🛠️ UI & Infrastructure
- [ ] **Real Event Integration**: Replace all static mockups in the feed with data from `AuthContext` or API.
- [ ] **Security Hardening**:
    - [ ] Migrate remaining client-side writes (Chat, User Profiles) to secure API routes.
    - [ ] Tighten Firestore rules once migrations are complete.
- [ ] **Error Handling**: Implement robust error boundaries for external data feeds (Event check-ins, real-time stats).

---
*Last Updated: 2026-05-04*
