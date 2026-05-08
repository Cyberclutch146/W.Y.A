import { Timestamp } from 'firebase/firestore';

// ─── Student Interests / Clubs ───────────────────────────
export type StudentInterest =
  | 'coding'
  | 'design'
  | 'music'
  | 'sports'
  | 'debate'
  | 'photography'
  | 'entrepreneurship'
  | 'gaming'
  | 'literature'
  | 'film'
  | 'dance'
  | 'robotics'
  | 'community service'
  | 'mathematics'
  | 'science'
  | 'art'
  | 'theatre'
  | 'journalism';

export type Department =
  | 'Computer Science'
  | 'Electronics'
  | 'Mechanical'
  | 'Civil'
  | 'Electrical'
  | 'Information Technology'
  | 'Business Administration'
  | 'Arts & Humanities'
  | 'Law'
  | 'Medicine'
  | 'Architecture'
  | 'Other';

export type AcademicYear = '1st Year' | '2nd Year' | '3rd Year' | '4th Year' | 'Postgraduate';

// ─── User ───────────────────────────────────────────────
export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  bio: string;
  location: string;
  phone: string;
  // Campus-specific fields
  department: Department | '';
  year: AcademicYear | '';
  rollNumber: string;
  clubs: string[];             // clubs the student is a member of
  interests: StudentInterest[];
  // Recommendation Engine tracking
  rsvpEventIds: string[];      // IDs of events the user has joined
  savedEventIds: string[];     // IDs of events the user has bookmarked
  dismissedEventIds: string[]; // IDs of events the user explicitly dismissed
  // Gamification
  xp: number;
  badges: string[];
  eventsAttended: number;
  // Legacy / kept for compatibility
  campusZone: string;
  avatarUrl: string;
  role: string;                // 'student' | 'club_admin' | 'faculty' | 'admin'
  eventHours: number;          // repurposed from eventHours
  totalDonated: number;
  profileComplete: boolean;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

export interface RecommendationReason {
  type: 'interest' | 'department' | 'club' | 'history' | 'social' | 'urgency' | 'ai';
  label: string;
}

export interface ScoredEvent {
  event: CommunityEvent;
  score: number;
  matchedInterests: string[];
  reasons: RecommendationReason[];
}

export type UserProfileCreate = Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>;

// ─── Event Categories ────────────────────────────────────
export type EventCategory =
  | 'Technical'
  | 'Cultural'
  | 'Academic'
  | 'Sports'
  | 'Social'
  | 'Career'
  | 'Club'
  | 'Other';

// ─── Event ──────────────────────────────────────────────
export interface EventNeeds {
  attendees?: { current: number; goal: number };
  funds?: { current: number; goal: number };
  goods?: string[];                                  // items to bring / sponsor
}

export interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  organizer: string;
  organizerId: string;
  location: string;              // venue name / room number
  distance: string;
  category: EventCategory | string;
  urgency: 'high' | 'normal';
  imageUrl: string;
  image?: string;
  needs: EventNeeds;
  progress: number;
  status: 'active' | 'completed';
  lat?: number;
  lng?: number;
  eventDate?: string;
  // Campus-specific
  clubName?: string;             // hosting club
  tags?: string[];               // e.g. ['open to all', 'registration required']
  registrationLink?: string;
  maxAttendees?: number;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

export type CommunityEventCreate = Omit<CommunityEvent, 'id' | 'createdAt' | 'updatedAt' | 'progress' | 'status'>;

// ─── RSVP / Signup ──────────────────────────────────────
export type RSVPStatus = 'interested' | 'going' | 'attended';

export interface EventRSVP {
  id: string;
  userId: string;
  userName: string;
  userEmail?: string;
  ticketId?: string;
  status: RSVPStatus;
  signedUpAt: Timestamp | null;
}

// Alias kept for backward compatibility with eventService.ts
export type Signup = EventRSVP;

// ─── Donation ───────────────────────────────────────────
export interface Donation {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  createdAt: Timestamp | null;
}

// ─── Message ────────────────────────────────────────────
export interface ChatMessage {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: Timestamp | null;
}

// ─── Goods Pledge ───────────────────────────────────────
export interface GoodsPledge {
  id: string;
  userId: string;
  userName: string;
  items: string[];
  otherItems: string;
  pledgedAt: Timestamp | null;
}

// ─── Notification ───────────────────────────────────────
export type NotificationType =
  | 'event_join'
  | 'goods_pledge'
  | 'event_update'
  | 'bulletin'
  | 'profile'
  | 'general'
  | 'xp_earned'       // gamification: XP awarded after event
  | 'badge_unlocked'; // gamification: new badge earned

export type NotificationTone = 'alert' | 'info' | 'success';

export interface NotificationData {
  id: string;
  title: string;
  body: string;
  path: string;
  type: NotificationType;
  tone: NotificationTone;
  read: boolean;
  createdAt: Timestamp | null;
}
