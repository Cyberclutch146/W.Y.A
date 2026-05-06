import {
  db,
} from '@/lib/firebase';
import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  QueryDocumentSnapshot,
  DocumentData,
  Unsubscribe,
  getDocs,
} from 'firebase/firestore';
import { BulletinAlert, BulletinAlertCreate } from '@/types/bulletin';

const COLLECTION = 'bulletins';

// ─── Helpers ────────────────────────────────────────────

const bulletinsRef = () => collection(db, COLLECTION);

// ─── Real-time listener ─────────────────────────────────
// Sorted: pinned first (client-side), then newest-first.

export const subscribeToBulletins = (
  callback: (notices: BulletinAlert[]) => void,
  maxCount: number = 50
): Unsubscribe => {
  const q = query(
    bulletinsRef(),
    orderBy('timestamp', 'desc'),
    limit(maxCount)
  );

  return onSnapshot(q, (snapshot) => {
    const raw = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as BulletinAlert[];

    // Pinned notices float to the top
    const pinned  = raw.filter((n) => n.pinned);
    const regular = raw.filter((n) => !n.pinned);
    callback([...pinned, ...regular]);
  });
};

// ─── Paginated fetch (one-shot, no listener) ────────────

export interface PaginatedBulletins {
  notices: BulletinAlert[];
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
}

export const getBulletins = async (
  pageSize: number = 20,
  lastDoc: QueryDocumentSnapshot<DocumentData> | null = null
): Promise<PaginatedBulletins> => {
  try {
    let q = query(
      bulletinsRef(),
      orderBy('timestamp', 'desc'),
      limit(pageSize)
    );

    if (lastDoc) {
      q = query(
        bulletinsRef(),
        orderBy('timestamp', 'desc'),
        startAfter(lastDoc),
        limit(pageSize)
      );
    }

    const snapshot = await getDocs(q);
    const notices = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as BulletinAlert[];

    return {
      notices,
      lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
      hasMore: snapshot.docs.length === pageSize,
    };
  } catch (error) {
    console.error('Failed to fetch bulletins:', error);
    throw error;
  }
};

// ─── Create ─────────────────────────────────────────────

export const createBulletin = async (
  data: Omit<BulletinAlertCreate, 'timestamp'>
): Promise<string> => {
  const response = await fetch('/api/bulletin/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Failed to create notice.');
  }

  return result.bulletinId as string;
};

// ─── Delete ─────────────────────────────────────────────

export const deleteBulletin = async (
  bulletinId: string,
  requesterId: string,
  requesterEmail?: string
): Promise<void> => {
  const response = await fetch('/api/bulletin/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bulletinId, requesterId, requesterEmail }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to delete notice');
  }

  return await response.json();
};

export const togglePin = async (
  bulletinId: string,
  pinned: boolean,
  requesterEmail: string
): Promise<void> => {
  const response = await fetch('/api/bulletin/pin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bulletinId, pinned, requesterEmail }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to update pinned status');
  }
};
