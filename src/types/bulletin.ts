// ─── Campus Bulletin Board Types ────────────────────────
// Campus-centric announcement and notice board for academic,
// administrative, social, and emergency notices.

export type BulletinAlertType =
  | 'ACADEMIC'
  | 'ADMIN'
  | 'SOCIAL'
  | 'EMERGENCY'
  | 'MARKETPLACE'
  | 'LOST_AND_FOUND'
  | 'ANNOUNCEMENT';

export type BulletinSeverity = 'Extreme' | 'Severe' | 'Moderate' | 'Minor' | 'Unknown';

export interface BulletinCoordinates {
  lat: number;
  lng: number;
}

export interface BulletinAlert {
  id: string;
  source: string;           // e.g., "Dean's Office", "Student Council", "Campus Safety"
  type: BulletinAlertType;
  severity: BulletinSeverity;
  title: string;
  description: string;
  url?: string;
  timestamp: string;        // ISO string
  locationName: string;     // e.g., "Main Auditorium", "Block B"
  coordinates?: BulletinCoordinates;
  polygon?: BulletinCoordinates[];
  // Authorship & ownership
  authorId: string;         // Firebase UID of the poster
  authorAvatar?: string;    // Profile picture URL
  // Admin controls
  pinned?: boolean;         // Admin-pinned notices float to top
  // Optional extras
  contactInfo?: string;     // For marketplace / lost & found items
  expiresAt?: string;       // ISO string — auto-expire ephemeral notices
}

export type BulletinAlertCreate = Omit<BulletinAlert, 'id'>;
