# 🎓 CampusPulse — Implementation Plan
### *Intelligent Campus Event Recommendation Engine*
#### Pivoting NexusAid → CampusPulse

---

> [!IMPORTANT]
> This plan leverages **~80% of the existing NexusAid infrastructure**. The core architecture (Next.js 16, Firebase, Gemini AI, QR system, notifications) remains intact. We are re-skinning and re-contextualizing, not rebuilding.

---

## 📋 Table of Contents
1. [Problem Statement Alignment](#1-problem-statement-alignment)
2. [Feature Mapping: NexusAid → CampusPulse](#2-feature-mapping)
3. [New Features & Ideas](#3-new-features--ideas)
4. [Terminology Rename Map](#4-terminology-rename-map)
5. [Phase-by-Phase Implementation](#5-phase-by-phase-implementation)
6. [File-Level Change Registry](#6-file-level-change-registry)
7. [Design System Updates](#7-design-system-updates)
8. [Data Model Changes](#8-data-model-changes)
9. [Risk Assessment](#9-risk-assessment)

---

## 1. Problem Statement Alignment

**Problem:** College campuses host dozens of events, but students discover them through scattered sources like WhatsApp, posters, and social media. This leads to:
- ❌ Missed events & low attendance
- ❌ Poor analytics for organizers
- ❌ No centralized archive
- ❌ No personalization

**CampusPulse Solution** (mapped from NexusAid capabilities):

| Problem | CampusPulse Feature | Existing NexusAid Code |
|:---|:---|:---|
| Scattered discovery | **Unified Event Feed** with filters, search, map view | `feed/page.tsx`, `EventCard.tsx` |
| No personalization | **AI Interest Matching** — recommends events based on student profile | `recommendationService.ts` |
| Poor analytics | **Organizer Dashboard** with attendance stats, engagement metrics | `dashboard/page.tsx` |
| No archive | **Event History & Search** with AI-powered semantic search | `searchService.ts` |
| Low attendance | **Smart Notifications** + **QR Check-in** for frictionless entry | `notificationService.ts`, `ScannerView.tsx` |

---

## 2. Feature Mapping

### ✅ Direct Reuse (Minimal Changes)
| NexusAid Feature | CampusPulse Equivalent | Files |
|:---|:---|:---|
| Firebase Auth (Google SSO) | **College SSO / Google Login** | `AuthContext`, `login/`, `register/` |
| Event CRUD (Create/Read/Update/Delete) | **Event Management** | `eventService.ts`, `create/page.tsx` |
| QR Ticket Generation | **Digital Entry Pass** | `VolunteerModal.tsx` (ticket logic) |
| QR Scanner | **Attendance Scanner** | `ScannerView.tsx` |
| AI Description Generator | **AI Event Description** | `/api/generate-description` |
| AI Image Generator | **AI Event Poster** | `/api/generate-image` |
| Semantic Search (Gemini) | **Smart Event Search** | `searchService.ts` |
| Notification System | **Event Reminders & Updates** | `notificationService.ts` |
| Chat per Event | **Event Discussion Thread** | `chatService.ts` |
| Bulk Promotion (Email/SMS) | **Club Mass-Invite System** | `PromotionModal.tsx`, `emailService.ts`, `smsService.ts` |
| Paginated Feed + Filters | **Event Discovery Feed** | `feed/page.tsx` |
| Map View (Leaflet) | **Campus Map View** | `MapArea.tsx`, `MapWrapper.tsx` |
| Goods Pledge | **Resource/Equipment Pledge** (for workshops needing laptops, etc.) | `GoodsPledgeModal.tsx` |

### 🔄 Requires Adaptation
| NexusAid Feature | CampusPulse Adaptation | Effort |
|:---|:---|:---|
| Recommendation Engine (disaster skills) | Remap to **academic interests & club affiliations** | Medium |
| Community Sentinel (NOAA/USGS alerts) | Replace with **Campus Announcements & Trending Feed** | Medium |
| Volunteer Leaderboard | **Student Engagement Leaderboard** (XP for attendance) | Low |
| Donation Panel (Razorpay) | **Event Ticketing** (free/paid events) or remove | Low |
| Profile (skills, equipment, travel radius) | **Interests, Department, Year, Club Memberships** | Medium |

### ❌ Remove / Deprecate
| Feature | Reason |
|:---|:---|
| NOAA, USGS, GDACS, NASA, Sachet API integrations | Not relevant to campus |
| Urgency levels (high/normal for disasters) | Replace with event type priority |
| `sentinelService.ts` external API calls | Gut and repurpose for campus broadcasts |

---

## 3. New Features & Ideas

### 🌟 Tier 1 — High Impact, Low Effort (Week 1-2)

#### 📅 Academic Calendar Integration
- Add a **calendar view** (week/month) alongside list and map views
- Show events on a timeline with color-coded categories
- **Implementation**: New `CalendarView.tsx` component, reuse event data

#### 🏷️ Event Tags & Categories (Campus-Specific)
Replace disaster categories with:
```
Technical    → Hackathons, Coding Workshops, Tech Talks
Cultural     → Fests, Music, Dance, Drama
Academic     → Seminars, Guest Lectures, Conferences
Sports       → Tournaments, Tryouts, Fitness
Social       → Meetups, Networking, Parties
Career       → Placement Drives, Resume Workshops, Internships
Club         → Club Meetings, Recruitment Drives
```

#### 🔔 "Interested" / "Going" RSVP System
- Two-tier engagement: "Interested" (soft) and "Going" (committed, gets QR ticket)
- Shows social proof: "12 people interested, 8 going"
- **Implementation**: Extend the existing signup subcollection with a `status` field

#### 📊 Event Analytics Dashboard (for Organizers)
Enhance existing dashboard with:
- **Attendance rate**: RSVPs vs. actual check-ins (QR scan data)
- **Interest funnel**: Views → Interested → Going → Attended
- **Peak engagement times**: When students interact most
- **Implementation**: Aggregate from existing Firestore subcollections

### 🌟 Tier 2 — Medium Effort, High Differentiation (Week 2-3)

#### 🧠 AI Event Concierge (Enhanced Chatbot)
Repurpose the existing Gemini chatbot (`AIChatWidget.tsx`, `aiActions.ts`) to:
- "What events are happening this weekend?"
- "Find me coding workshops near the CS building"
- "Sign me up for the hackathon"
- "What's trending on campus this week?"
- Already supports function calling — just update the tool definitions

#### 📱 Campus Bulletin Board
Replace Sentinel with a **live campus feed** showing:
- Trending events (most RSVPs in last 24h)
- "Happening Now" — events currently in progress
- Club announcements
- Admin broadcasts (exam schedules, holidays)
- **Implementation**: Repurpose `SentinelAlertFeed.tsx` → `CampusBulletin.tsx`

#### 🏆 Student Engagement System (Gamification)
Evolve the leaderboard into:
- **XP Points**: Attend event (+50 XP), Organize event (+100 XP), First RSVP (+20 XP)
- **Badges**: "Event Explorer" (attend 5 events), "Culture Vulture" (attend 3 cultural events)
- **Semester Rankings**: Leaderboard resets each semester
- **Implementation**: Extend `UserProfile` with `xp`, `badges[]`, `semesterXp`

#### 🗓️ Recurring Events
- Support weekly/monthly recurring events (e.g., "Chess Club every Wednesday")
- Add `recurrence` field: `{ type: 'weekly' | 'monthly', dayOfWeek: number }`
- Auto-generate instances

### 🌟 Tier 3 — Stretch Goals (Week 3-4)

#### 🤝 Club Management Module
- Clubs can create a "club profile" with members, description, and past events
- Students can "follow" clubs for auto-notifications
- Club organizers get a dedicated dashboard
- **Implementation**: New `clubs` Firestore collection, `ClubProfile` page

#### 📍 Indoor Campus Navigation
- Leverage the existing Leaflet map to show **building-level** event locations
- Custom campus map tiles or overlay
- "Navigate to event" with walking directions

#### 📸 Event Photo Wall
- Attendees can upload photos after events
- Creates a gallery/archive for each event
- Social proof for future events
- **Implementation**: Extend Firebase Storage usage, new `PhotoWall.tsx` component

#### 🔗 Social Sharing & Deep Links
- Generate shareable event cards (OG images) for WhatsApp/Instagram
- Deep link: `campuspulse.app/event/xyz` opens directly to event

#### 📧 Digest Emails
- Weekly personalized digest: "Events matching your interests this week"
- Leverage existing `emailService.ts` + `recommendationService.ts`

---

## 4. Terminology Rename Map

| Old (NexusAid) | New (CampusPulse) | Files Affected |
|:---|:---|:---|
| NexusAid | CampusPulse | All branding, `layout.tsx`, landing page |
| Volunteer | Attendee / Participant | `eventService.ts`, `VolunteerModal.tsx`, types |
| Community Event | Campus Event | `types/index.ts`, all pages |
| Organizer | Event Organizer / Club Lead | `dashboard/`, `create/` |
| Skills | Interests | `UserProfile`, `recommendationService.ts`, `profile/` |
| Equipment | N/A (remove or repurpose to "Can Bring") | `UserProfile`, `profile/` |
| Travel Radius | Campus Preference (North/South/Main) | `UserProfile` |
| Availability | Free Slots | `UserProfile` |
| Volunteer Hours | Attendance Count / XP | `UserProfile`, leaderboard |
| Total Donated | Events Attended | `UserProfile` |
| Urgency (high/normal) | Priority (featured/regular) | `CommunityEvent`, feed filters |
| Community Sentinel | Campus Bulletin | `sentinelService.ts` → `bulletinService.ts` |
| Food Drive, Urgent Needs | Technical, Cultural, Academic, Sports | Category dropdowns |
| Goods Pledge | Resource Pledge | `GoodsPledgeModal.tsx` |
| Community Relief Initiative | Campus Event Platform | Landing page tagline |

---

## 5. Phase-by-Phase Implementation

### Phase 0: Foundation (Day 1) ⚡
- [ ] Rename project: `package.json` name → `campuspulse`
- [ ] Update `PROJECT_STATUS.md` with new roadmap
- [ ] Update all admin emails in `eventService.ts`
- [ ] Update landing page branding and hero content
- [ ] Update `layout.tsx` metadata (title, description)

### Phase 1: Data Model & Types (Day 1-2) 🏗️
- [ ] Update `types/index.ts` — rename interfaces, add new fields
- [ ] Update `recommendationService.ts` — new interest-to-category mapping
- [ ] Update category options in `create/page.tsx`
- [ ] Update profile fields in `profile/page.tsx`
- [ ] Update Firestore rules if needed

### Phase 2: UI Rebrand (Day 2-3) 🎨
- [ ] Update color palette in `globals.css` (campus-friendly colors)
- [ ] Update landing page (`(marketing)/page.tsx`) — new hero, copy, imagery
- [ ] Update feed page headings and filter labels
- [ ] Update dashboard headings and stat cards
- [ ] Update navbar branding
- [ ] Replace hero image with campus-themed image

### Phase 3: Smart Features (Day 3-5) 🧠
- [ ] Implement RSVP system ("Interested" / "Going")
- [ ] Build Calendar View component
- [ ] Repurpose Sentinel → Campus Bulletin
- [ ] Update AI chatbot context and tool definitions
- [ ] Update semantic search prompts for campus context

### Phase 4: Engagement & Analytics (Day 5-7) 📊
- [ ] Implement XP/Badge system in user profile
- [ ] Build enhanced organizer analytics
- [ ] Implement trending events algorithm
- [ ] Add "Happening Now" indicator
- [ ] Weekly digest email template

### Phase 5: Polish & Launch (Day 7-8) ✨
- [ ] End-to-end testing of event creation → RSVP → QR check-in flow
- [ ] Update README.md with new project description
- [ ] SEO optimization (meta tags, OG images)
- [ ] Performance audit
- [ ] Deploy

---

## 6. File-Level Change Registry

### Files to **Rename/Replace**
| Current File | Action | New Name |
|:---|:---|:---|
| `sentinelService.ts` | Gut & repurpose | `bulletinService.ts` |
| `SentinelAlertFeed.tsx` | Gut & repurpose | `CampusBulletin.tsx` |
| `SentinelMapOverlay.tsx` | Gut & repurpose | `CampusMapOverlay.tsx` |
| `VolunteerModal.tsx` | Rename + update copy | `RSVPModal.tsx` |
| `VolunteerLeaderboard.tsx` | Rename + update logic | `EngagementLeaderboard.tsx` |
| `SkillMatchBanner.tsx` | Rename + update | `InterestMatchBanner.tsx` |
| `DonationPanel.tsx` | Remove or convert to ticketing | — |

### Files to **Edit In-Place**
| File | Changes |
|:---|:---|
| `types/index.ts` | Rename `UserProfile` fields, update `CommunityEvent` |
| `recommendationService.ts` | Replace `SKILL_CATEGORY_MAP` with interest taxonomy |
| `searchService.ts` | Update Gemini prompts for campus context |
| `aiActions.ts` | Update function definitions and system prompt |
| `eventService.ts` | Update admin emails, rename volunteer references |
| `userService.ts` | Update leaderboard scoring formula |
| `feed/page.tsx` | Update headings, filter labels, category list |
| `dashboard/page.tsx` | Update stat cards and headings |
| `create/page.tsx` | Update categories, field labels, placeholders |
| `profile/page.tsx` | Replace skills→interests, update field labels |
| `(marketing)/page.tsx` | Full copy rewrite, new imagery |
| `Navbar_top.tsx` | Update branding and navigation labels |
| `Navigation.tsx` | Update bottom nav labels |
| `globals.css` | Update color palette tokens |
| `layout.tsx` | Update metadata |

### Files to **Create**
| File | Purpose |
|:---|:---|
| `CalendarView.tsx` | Week/month calendar component |
| `CampusBulletin.tsx` | Trending + happening now + announcements |
| `TrendingEvents.tsx` | "Hot right now" section |
| `BadgeDisplay.tsx` | XP and badge visualization |
| `types/campus.ts` | New campus-specific type definitions |

### Files **Unchanged**
| File | Reason |
|:---|:---|
| `chatService.ts` | Event chat works as-is |
| `emailService.ts` | Email infrastructure is generic |
| `smsService.ts` | SMS infrastructure is generic |
| `storageService.ts` | Image upload is generic |
| `notificationService.ts` | Notification system is generic |
| `DateTimePicker.tsx` | UI component is reusable |
| `LocationPicker*.tsx` | Map picker works for campus locations |
| `ProgressBar.tsx` | Generic component |
| `ThemeToggle.tsx` | Dark/light mode stays |
| `DynamicBackground.tsx` | Aesthetic component |
| `AppAccessGate.tsx` | Auth gate is generic |
| All API routes | Structure remains, just update context |

---

## 7. Design System Updates

### Color Palette Pivot
| Token | NexusAid (Relief Green) | CampusPulse (Vibrant Blue) |
|:---|:---|:---|
| `--color-primary` | `#3B6B4A` (Forest green) | `#4F46E5` (Indigo) or `#2563EB` (Blue) |
| `--color-moss` | `#5A8A6A` | `#7C3AED` (Purple accent) |
| `--color-warm-amber` | `#D4A852` | `#F59E0B` (Amber — keep) |
| `--color-terracotta` | `#C2715B` | `#EC4899` (Pink accent) |
| `--color-sage` | `#8BAE8F` | `#06B6D4` (Cyan) |

### Typography
- Keep the existing font stack (it's already premium)
- Update the serif font usage for a more youthful/modern feel

### Branding
- Logo: Update from relief-themed to education/campus icon
- Tagline: "Never miss what matters on campus"

---

## 8. Data Model Changes

### UserProfile Updates
```typescript
// OLD (NexusAid)
interface UserProfile {
  skills: string[];           // "Cooking", "First Aid"
  equipment: string[];        // "Truck", "Generator"
  travelRadius: number;       // km
  availability: string;       // "weekdays" | "weekends"
  volunteerHours: number;
  totalDonated: number;
}

// NEW (CampusPulse) — additive changes
interface UserProfile {
  interests: string[];        // "Coding", "Music", "Sports"
  department: string;         // "Computer Science"
  year: number;               // 1, 2, 3, 4
  clubs: string[];            // ["IEEE", "Drama Club"]
  campusZone: string;         // "North Campus" | "South Campus"
  availability: string;       // keep as-is
  xp: number;                 // replaces volunteerHours
  eventsAttended: number;     // replaces totalDonated
  badges: string[];           // new gamification
  semesterXp: number;         // resets each semester
  // Keep old fields for backward compat during migration
  skills: string[];           // alias for interests
  equipment: string[];        // deprecate
  travelRadius: number;       // deprecate
  volunteerHours: number;     // alias for xp
  totalDonated: number;       // alias for eventsAttended
}
```

### CommunityEvent Updates
```typescript
// Rename fields but keep structure
interface CampusEvent {
  // ... all existing fields ...
  urgency: 'featured' | 'regular';  // was 'high' | 'normal'
  category: string;                  // new campus categories
  rsvpCount: number;                 // new: interested count
  clubId?: string;                   // new: organizing club
  recurring?: {                      // new: recurrence
    type: 'weekly' | 'monthly';
    dayOfWeek?: number;
  };
  venue?: string;                    // new: specific room/hall
  tags?: string[];                   // new: searchable tags
}
```

---

## 9. Risk Assessment

| Risk | Impact | Mitigation |
|:---|:---|:---|
| Firestore data migration | Medium | Add new fields alongside old ones; migrate gradually |
| Breaking existing auth flow | High | Auth system is generic — no changes needed |
| Gemini API prompt changes | Low | Prompts are string-based, easy to update |
| Color system refactor | Low | CSS variables make this a single-file change |
| Losing existing features | Medium | Phase the changes; test each module independently |
| Scope creep on new features | High | Stick to Tier 1 first, then iterate |

---

## 📐 Estimated Timeline

| Phase | Duration | Priority |
|:---|:---|:---|
| Phase 0: Foundation | 0.5 day | 🔴 Critical |
| Phase 1: Data Model | 1 day | 🔴 Critical |
| Phase 2: UI Rebrand | 1.5 days | 🔴 Critical |
| Phase 3: Smart Features | 2 days | 🟡 High |
| Phase 4: Engagement | 2 days | 🟡 High |
| Phase 5: Polish | 1 day | 🟢 Normal |
| **Total** | **~8 days** | |

---

> [!TIP]
> **Quick Win Strategy**: Phases 0-2 alone (3 days) will give you a fully functional, rebranded campus event platform that already has AI search, QR check-in, organizer dashboards, and a recommendation engine. Phases 3-5 add differentiation and wow-factor.

---

*Plan generated by Antigravity AI · April 30, 2026*
