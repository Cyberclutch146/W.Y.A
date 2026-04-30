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
| Firebase Auth (Google SSO) | **College SSO / Google Login** | `AuthContext.tsx`, `login/`, `register/` |
| Event CRUD (Create/Read/Update/Delete) | **Event Management** | `eventService.ts`, `create/page.tsx`, `/api/events/*` |
| QR Ticket Generation | **Digital Entry Pass** | `VolunteerModal.tsx` (ticket logic) |
| QR Scanner | **Attendance Scanner** | `ScannerView.tsx`, `/api/events/scan/` |
| AI Description Generator | **AI Event Description** | `/api/generate-description/route.ts` |
| AI Image Generator | **AI Event Poster** | `/api/generate-image/route.ts` |
| Semantic Search (Gemini) | **Smart Event Search** | `searchService.ts`, `/api/search/route.ts` |
| Notification System | **Event Reminders & Updates** | `notificationService.ts` |
| Chat per Event | **Event Discussion Thread** | `chatService.ts`, `components/ai/ChatBox.tsx`, `/api/chat/` |
| Bulk Promotion (Email/SMS) | **Club Mass-Invite System** | `PromotionModal.tsx`, `emailService.ts`, `smsService.ts`, `/api/promote/` |
| Paginated Feed + Filters | **Event Discovery Feed** | `feed/page.tsx` |
| Map View (Leaflet) | **Campus Map View** | `MapArea.tsx`, `MapWrapper.tsx` |
| Goods Pledge | **Resource/Equipment Pledge** (for workshops needing laptops, etc.) | `GoodsPledgeModal.tsx` |
| Theme Toggle (Dark/Light) | **Theme Toggle** | `ThemeProvider.tsx`, `ThemeToggle.tsx` |

### 🔄 Requires Adaptation
| NexusAid Feature | CampusPulse Adaptation | Effort |
|:---|:---|:---|
| Recommendation Engine (disaster skills) | Remap to **academic interests & club affiliations** | Medium |
| Community Sentinel (NOAA/USGS alerts) | Replace with **Campus Announcements & Trending Feed** | Medium |
| Volunteer Leaderboard | **Student Engagement Leaderboard** (XP for attendance) | Low |
| Donation Panel (Razorpay) | **Event Ticketing** (free/paid events) or remove | Low |
| Profile (skills, equipment, travel radius) | **Interests, Department, Year, Club Memberships** | Medium |
| AI Chatbot + Tools (`aiActions.ts`, `aiTools.ts`) | Update all guidance text and tool definitions for campus context | Medium |
| Mock Data (`data/mockData.ts`) | Replace disaster relief mock events with campus event samples | Low |
| About Page (`(app)/about/page.tsx`) | Rewrite copy for CampusPulse mission | Low |
| Home Page (`(app)/home/page.tsx`) | Update dashboard/home copy and stats | Low |

### ❌ Remove / Deprecate
| Feature | Reason |
|:---|:---|
| NOAA, USGS, GDACS, NASA, Sachet API integrations | Not relevant to campus |
| Urgency levels (high/normal for disasters) | Replace with event type priority |
| `sentinelService.ts` external API calls | Gut and repurpose for campus broadcasts |
| `types/sentinel.ts` type definitions | Replace with `types/bulletin.ts` |
| `/api/sentinel/route.ts` | Gut and repurpose as `/api/bulletin/route.ts` |
| `lib/openai.ts` + OpenAI dependency | Not actively used (Gemini handles all AI); can remove |
| `lib/razorpay.ts` + `/api/create-payment-order/` | Remove or convert to event ticketing |

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
- **Implementation**: Extend the existing `Signup` interface with a `status` field

#### 📊 Event Analytics Dashboard (for Organizers)
Enhance existing dashboard with:
- **Attendance rate**: RSVPs vs. actual check-ins (QR scan data)
- **Interest funnel**: Views → Interested → Going → Attended
- **Peak engagement times**: When students interact most
- **Implementation**: Aggregate from existing Firestore subcollections

### 🌟 Tier 2 — Medium Effort, High Differentiation (Week 2-3)

#### 🧠 AI Event Concierge (Enhanced Chatbot)
Repurpose the existing Gemini chatbot (`AIChatWidget.tsx`, `aiActions.ts`, `aiTools.ts`) to:
- "What events are happening this weekend?"
- "Find me coding workshops near the CS building"
- "Sign me up for the hackathon"
- "What's trending on campus this week?"
- Already supports function calling — update tool definitions in `aiTools.ts` and system prompt in `aiActions.ts`

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
- **Implementation**: Extend Firebase Storage usage (`storageService.ts`), new `PhotoWall.tsx` component

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
| NexusAid | CampusPulse | All branding, `layout.tsx`, landing page, `package.json` |
| Volunteer | Attendee / Participant | `eventService.ts`, `VolunteerModal.tsx`, types, `aiTools.ts` |
| Community Event | Campus Event | `types/index.ts`, all pages |
| Organizer | Event Organizer / Club Lead | `dashboard/`, `create/` |
| Skills | Interests | `UserProfile`, `recommendationService.ts`, `profile/` |
| Equipment | N/A (remove or repurpose to "Can Bring") | `UserProfile`, `profile/` |
| Travel Radius | Campus Preference (North/South/Main) | `UserProfile` |
| Availability | Free Slots | `UserProfile` |
| Volunteer Hours | Attendance Count / XP | `UserProfile`, `leaderboard/`, `mockData.ts` |
| Total Donated | Events Attended | `UserProfile`, `mockData.ts` |
| Urgency (high/normal) | Priority (featured/regular) | `CommunityEvent`, feed filters, `mockData.ts` |
| Community Sentinel | Campus Bulletin | `sentinelService.ts` → `bulletinService.ts` |
| SentinelAlert | BulletinItem | `types/sentinel.ts` → `types/bulletin.ts` |
| Food Drive, Urgent Needs, Community | Technical, Cultural, Academic, Sports, Social, Career, Club | Category dropdowns, `mockData.ts` |
| Goods Pledge | Resource Pledge | `GoodsPledgeModal.tsx` |
| Community Relief Initiative | Campus Event Platform | Landing page tagline |
| "Rooted in community, grown through care" | "Never miss what matters on campus" | `layout.tsx` metadata |

---

## 5. Phase-by-Phase Implementation

### Phase 0: Foundation (Day 1) ⚡
- [ ] Rename project in `package.json`: `"name": "nexusaid"` → `"name": "campuspulse"`
- [ ] Update `layout.tsx` metadata (title, description)
- [ ] Update all admin/organizer emails in `eventService.ts`
- [ ] Update landing page (`(marketing)/page.tsx`) branding and hero content
- [ ] Update `Navbar_top.tsx` logo/brand text
- [ ] Update `Navigation.tsx` bottom nav labels if needed

### Phase 1: Data Model & Types (Day 1-2) 🏗️
- [ ] Update `types/index.ts` — rename interfaces, add new fields (`interests`, `department`, `year`, `clubs`, `xp`, `badges`)
- [ ] Rename `types/sentinel.ts` → `types/bulletin.ts` with campus-appropriate types
- [ ] Update `recommendationService.ts` — new interest-to-category mapping (replace `SKILL_CATEGORY_MAP`)
- [ ] Update category options in `create/page.tsx` (Technical, Cultural, Academic, Sports, Social, Career, Club)
- [ ] Update profile fields in `profile/page.tsx` (skills→interests, add department/year)
- [ ] Update `data/mockData.ts` — replace disaster events with campus events, rename fields
- [ ] Update `Signup` interface to support RSVP status field

### Phase 2: UI Rebrand (Day 2-3) 🎨
- [ ] Update color palette in `globals.css` (campus-friendly indigo/purple theme)
- [ ] Rewrite landing page (`(marketing)/page.tsx`) — new hero, copy, imagery
- [ ] Update feed page headings and filter labels (`feed/page.tsx`)
- [ ] Update dashboard headings and stat cards (`dashboard/page.tsx`)
- [ ] Update about page copy (`about/page.tsx`)
- [ ] Update home page copy (`home/page.tsx`)
- [ ] Update leaderboard page copy (`leaderboard/page.tsx`)
- [ ] Replace hero image with campus-themed image

### Phase 3: Smart Features (Day 3-5) 🧠
- [ ] Implement RSVP system ("Interested" / "Going") in `VolunteerModal.tsx` → `RSVPModal.tsx`
- [ ] Build Calendar View component (`CalendarView.tsx`)
- [ ] Repurpose `SentinelAlertFeed.tsx` → `CampusBulletin.tsx`
- [ ] Repurpose `SentinelMapOverlay.tsx` → `CampusMapOverlay.tsx`
- [ ] Repurpose `sentinelService.ts` → `bulletinService.ts`
- [ ] Repurpose `/api/sentinel/route.ts` → `/api/bulletin/route.ts`
- [ ] Update AI chatbot system prompt in `aiActions.ts`
- [ ] Update AI tool guidance in `aiTools.ts` (volunteer→attendee, donate→RSVP language)
- [ ] Update semantic search prompts in `searchService.ts`
- [ ] Update `/api/chatbot/` route for campus context

### Phase 4: Engagement & Analytics (Day 5-7) 📊
- [ ] Implement XP/Badge system in user profile
- [ ] Build enhanced organizer analytics on `dashboard/page.tsx`
- [ ] Update `VolunteerLeaderboard.tsx` → `EngagementLeaderboard.tsx`
- [ ] Update `SkillMatchBanner.tsx` → `InterestMatchBanner.tsx`
- [ ] Implement trending events algorithm
- [ ] Add "Happening Now" indicator to feed
- [ ] Weekly digest email template via `emailService.ts`

### Phase 5: Polish & Launch (Day 7-8) ✨
- [ ] End-to-end testing of event creation → RSVP → QR check-in flow
- [ ] SEO optimization (meta tags, OG images)
- [ ] Performance audit (Lighthouse)
- [ ] Clean up unused dependencies (`openai`, `razorpay` if not needed)
- [ ] Update `README.md` with final screenshots
- [ ] Deploy

---

## 6. File-Level Change Registry

### Files to **Rename/Replace**
| Current File | Action | New Name |
|:---|:---|:---|
| `services/sentinelService.ts` | Gut & repurpose | `services/bulletinService.ts` |
| `components/SentinelAlertFeed.tsx` | Gut & repurpose | `components/CampusBulletin.tsx` |
| `components/SentinelMapOverlay.tsx` | Gut & repurpose | `components/CampusMapOverlay.tsx` |
| `components/VolunteerModal.tsx` | Rename + update copy | `components/RSVPModal.tsx` |
| `components/VolunteerLeaderboard.tsx` | Rename + update logic | `components/EngagementLeaderboard.tsx` |
| `components/SkillMatchBanner.tsx` | Rename + update | `components/InterestMatchBanner.tsx` |
| `components/DonationPanel.tsx` | Remove or convert to ticketing | — |
| `types/sentinel.ts` | Gut & repurpose | `types/bulletin.ts` |
| `app/api/sentinel/route.ts` | Gut & repurpose | `app/api/bulletin/route.ts` |

### Files to **Edit In-Place**
| File | Changes |
|:---|:---|
| `package.json` | Rename to `campuspulse` |
| `types/index.ts` | Rename `UserProfile` fields, update `CommunityEvent`, add RSVP status to `Signup` |
| `services/recommendationService.ts` | Replace `SKILL_CATEGORY_MAP` with interest taxonomy |
| `services/searchService.ts` | Update Gemini prompts for campus context |
| `services/aiActions.ts` | Update function definitions and system prompt |
| `services/aiTools.ts` | Update all guidance text (volunteer→attendee, donate→RSVP) |
| `services/eventService.ts` | Update admin emails, rename volunteer references |
| `services/userService.ts` | Update leaderboard scoring formula |
| `data/mockData.ts` | Replace disaster events with campus events |
| `app/layout.tsx` | Update metadata title/description |
| `app/globals.css` | Update color palette tokens |
| `app/(app)/feed/page.tsx` | Update headings, filter labels, category list |
| `app/(app)/dashboard/page.tsx` | Update stat cards and headings |
| `app/(app)/create/page.tsx` | Update categories, field labels, placeholders |
| `app/(app)/profile/page.tsx` | Replace skills→interests, update field labels |
| `app/(app)/about/page.tsx` | Rewrite copy for CampusPulse |
| `app/(app)/home/page.tsx` | Update copy and stat labels |
| `app/(app)/leaderboard/page.tsx` | Update headings and scoring labels |
| `app/(marketing)/page.tsx` | Full copy rewrite, new imagery |
| `components/Navbar_top.tsx` | Update branding and navigation labels |
| `components/Navigation.tsx` | Update bottom nav labels |
| `components/EventCard.tsx` | Update urgency→priority labels, category display |
| `components/AIChatWidget.tsx` | Update greeting text and placeholder copy |
| `components/ai/ChatBox.tsx` | Update placeholder text |

### Files to **Create**
| File | Purpose |
|:---|:---|
| `components/CalendarView.tsx` | Week/month calendar component |
| `components/CampusBulletin.tsx` | Trending + happening now + announcements |
| `components/TrendingEvents.tsx` | "Hot right now" section |
| `components/BadgeDisplay.tsx` | XP and badge visualization |
| `types/bulletin.ts` | Campus bulletin type definitions |

### Files **Unchanged** (No Edits Needed)
| File | Reason |
|:---|:---|
| `services/chatService.ts` | Event chat works as-is |
| `services/emailService.ts` | Email infrastructure is generic |
| `services/smsService.ts` | SMS infrastructure is generic |
| `services/storageService.ts` | Image upload is generic |
| `services/notificationService.ts` | Notification system is generic |
| `context/AuthContext.tsx` | Auth is identity-agnostic |
| `context/ThemeProvider.tsx` | Theme system is generic |
| `lib/firebase.ts` | Client SDK config — no changes |
| `lib/firebase-admin.ts` | Admin SDK config — no changes |
| `lib/avatar.ts` | Avatar helper — generic |
| `utils/geo.ts` | Geo calculations — reusable for campus map |
| `types/ai.ts` | AI message types — generic |
| `components/DateTimePicker.tsx` | UI component is reusable |
| `components/LocationPicker.tsx` | Map picker works for campus locations |
| `components/LocationPickerWrapper.tsx` | Wrapper is generic |
| `components/MapArea.tsx` | Map component works for campus |
| `components/MapWrapper.tsx` | Dynamic import wrapper |
| `components/ProgressBar.tsx` | Generic component |
| `components/ThemeToggle.tsx` | Dark/light mode stays |
| `components/DynamicBackground.tsx` | Aesthetic component |
| `components/AppAccessGate.tsx` | Auth gate is generic |
| `components/PromotionModal.tsx` | Bulk invite works for clubs as-is |
| `components/ai/ChatPanel.tsx` | Chat UI is generic |
| `components/ai/ChatMessagesList.tsx` | Message rendering is generic |
| `components/ai/ChatbotWidget.tsx` | Widget wrapper is generic |
| `app/api/events/create/` | Event creation route — generic |
| `app/api/events/join/` | Join/signup route — generic |
| `app/api/events/scan/` | QR scan route — generic |
| `app/api/chat/` | Chat route — generic |
| `app/api/auth/` | Auth route — generic |
| `app/api/promote/` | Promotion route — generic |
| `app/api/sms/` | SMS route — generic |
| `app/api/generate-description/` | AI generation — generic |
| `app/api/generate-image/` | AI generation — generic |
| `app/api/user/profile/` | Profile update route — generic |

### Files to **Consider Removing**
| File | Reason |
|:---|:---|
| `lib/openai.ts` | OpenAI not actively used; Gemini handles all AI |
| `lib/razorpay.ts` | Remove if not doing paid ticketing |
| `app/api/create-payment-order/` | Remove if not doing paid ticketing |

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
- **Keep**: `Literata` (serif, headings), `Nunito Sans` (body), `Elms Sans` (accent)
- These fonts already feel modern and premium — no change needed

### Branding
- Logo: Update from relief-themed to education/campus icon
- Tagline: "Never miss what matters on campus"
- Description: Update `layout.tsx` metadata from "Rooted in community, grown through care"

---

## 8. Data Model Changes

### UserProfile Updates
```typescript
// OLD (NexusAid)
interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  bio: string;
  location: string;
  phone: string;
  skills: string[];           // "Cooking", "First Aid"
  equipment: string[];        // "Truck", "Generator"
  travelRadius: number;       // km
  availability: string;       // "weekdays" | "weekends"
  avatarUrl: string;
  role: string;
  volunteerHours: number;
  totalDonated: number;
  profileComplete: boolean;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

// NEW (CampusPulse) — additive changes
interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  bio: string;
  location: string;
  phone: string;
  interests: string[];        // "Coding", "Music", "Sports" (replaces skills)
  department: string;         // "Computer Science" (NEW)
  year: number;               // 1, 2, 3, 4 (NEW)
  clubs: string[];            // ["IEEE", "Drama Club"] (NEW)
  campusZone: string;         // "North Campus" | "South Campus" (replaces travelRadius)
  availability: string;       // keep as-is
  avatarUrl: string;
  role: string;
  xp: number;                 // replaces volunteerHours
  eventsAttended: number;     // replaces totalDonated
  badges: string[];           // NEW gamification
  semesterXp: number;         // NEW — resets each semester
  profileComplete: boolean;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}
```

### CommunityEvent → CampusEvent
```typescript
interface CampusEvent {
  id: string;
  title: string;
  description: string;
  organizer: string;
  organizerId: string;
  location: string;
  distance: string;
  category: string;                  // campus categories (Technical, Cultural, etc.)
  urgency: 'featured' | 'regular';   // was 'high' | 'normal'
  imageUrl: string;
  image?: string;
  needs: EventNeeds;
  progress: number;
  status: 'active' | 'completed';
  lat?: number;
  lng?: number;
  eventDate?: string;
  rsvpCount: number;                 // NEW: interested count
  clubId?: string;                   // NEW: organizing club
  recurring?: {                      // NEW: recurrence
    type: 'weekly' | 'monthly';
    dayOfWeek?: number;
  };
  venue?: string;                    // NEW: specific room/hall
  tags?: string[];                   // NEW: searchable tags
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}
```

### Signup → EventRSVP
```typescript
interface EventRSVP {
  id: string;
  userId: string;
  userName: string;
  userEmail?: string;
  ticketId?: string;
  status: 'interested' | 'going';    // NEW: two-tier RSVP
  signedUpAt: Timestamp | null;
}
```

### NotificationType Update
```typescript
// OLD
export type NotificationType = 'event_join' | 'goods_pledge' | 'event_update' | 'sentinel' | 'profile' | 'general';

// NEW
export type NotificationType = 'event_join' | 'goods_pledge' | 'event_update' | 'bulletin' | 'profile' | 'general' | 'xp_earned' | 'badge_unlocked';
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
| Import breakage from file renames | Medium | Use find-and-replace across all imports after each rename |
| Mock data inconsistency | Low | Update `mockData.ts` early in Phase 1 to avoid confusion |

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

*Plan generated and audited against codebase · April 30, 2026*
