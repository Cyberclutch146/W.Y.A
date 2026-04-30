// ─── Campus Bulletin Board Types ────────────────────────
// Replaces the old Sentinel (disaster alert) system with
// a campus-centric announcement and notice board system.

export type BulletinAlertType = 'ACADEMIC' | 'ADMIN' | 'SOCIAL' | 'EMERGENCY';

export type BulletinSeverity = 'Extreme' | 'Severe' | 'Moderate' | 'Minor' | 'Unknown';

export interface BulletinCoordinates {
  lat: number;
  lng: number;
}

export interface BulletinAlert {
  id: string;
  source: string;       // e.g., "Dean's Office", "Student Council", "Campus Safety"
  type: BulletinAlertType;
  severity: BulletinSeverity;
  title: string;
  description: string;
  url?: string;
  timestamp: string;    // ISO string
  locationName: string; // e.g., "Main Auditorium", "Block B"
  coordinates?: BulletinCoordinates;
  polygon?: BulletinCoordinates[];
}
