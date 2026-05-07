import { db } from '@/lib/firebase';
import { doc, getDoc, onSnapshot, collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { UserProfile, UserProfileCreate } from '@/types';

const USERS_COLLECTION = 'users';

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const userDocRef = doc(db, USERS_COLLECTION, userId);
  const userSnapshot = await getDoc(userDocRef);

  if (userSnapshot.exists()) {
    return { id: userSnapshot.id, ...userSnapshot.data() } as UserProfile;
  }
  
  return null;
};

export const subscribeToUserProfile = (userId: string, callback: (profile: UserProfile | null) => void) => {
  const userDocRef = doc(db, USERS_COLLECTION, userId);
  return onSnapshot(userDocRef, (snapshot) => {
    if (snapshot.exists()) {
      callback({ id: snapshot.id, ...snapshot.data() } as UserProfile);
    } else {
      callback(null);
    }
  });
};

export const createUserProfile = async (userId: string, data: UserProfileCreate): Promise<void> => {
  const response = await fetch('/api/user/profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'create', userId, data }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to create profile');
  }
};

export const updateUserProfile = async (userId: string, data: Partial<UserProfile>): Promise<void> => {
  const response = await fetch('/api/user/profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'update', userId, data }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to update profile');
  }
};

// ─── Global Leaderboard ──────────────────────────────────
export interface LeaderboardEntry {
  id: string;
  displayName: string;
  avatarUrl: string;
  eventHours: number;
  totalDonated: number;
  interests: string[];
  location: string;
  impactScore: number; // Computed composite score
}

// ─── Merged Leaderboard Fetch (single collection read) ─
export interface LeaderboardData {
  entries: LeaderboardEntry[];
  stats: { totalAttendees: number; totalHours: number; totalDonated: number };
}

export const getLeaderboardData = async (topN: number = 50): Promise<LeaderboardData> => {
  try {
    const usersRef = collection(db, USERS_COLLECTION);
    
    // 1. Fetch top users by impactScore (O(topN) instead of O(TotalUsers))
    const topQuery = query(
      usersRef,
      orderBy('impactScore', 'desc'),
      limit(topN)
    );
    
    const [topSnapshot, statsSnapshot] = await Promise.all([
      getDocs(topQuery),
      getDoc(doc(db, 'meta', 'platformStats'))
    ]);

    const entries: LeaderboardEntry[] = topSnapshot.docs.map(doc => {
      const data = doc.data() as UserProfile;
      return {
        id: doc.id,
        displayName: data.displayName || 'Anonymous Hero',
        avatarUrl: data.avatarUrl || '',
        eventHours: data.eventHours || 0,
        totalDonated: data.totalDonated || 0,
        interests: data.interests || [],
        location: data.location || '',
        impactScore: data.impactScore || 0,
      };
    });

    // 2. Get stats from pre-computed doc or fallback
    let stats = { totalAttendees: 0, totalHours: 0, totalDonated: 0 };
    if (statsSnapshot.exists()) {
      stats = statsSnapshot.data() as any;
    } else {
      stats = {
        totalAttendees: entries.length,
        totalHours: entries.reduce((sum, e) => sum + e.eventHours, 0),
        totalDonated: entries.reduce((sum, e) => sum + e.totalDonated, 0),
      };
    }

    return { entries, stats };
  } catch (error) {
    console.error('Failed to fetch leaderboard data:', error);
    return { entries: [], stats: { totalAttendees: 0, totalHours: 0, totalDonated: 0 } };
  }
};

// ─── Legacy wrappers (kept for backward compat, use getLeaderboardData instead) ─
export const getGlobalLeaderboard = async (topN: number = 50): Promise<LeaderboardEntry[]> => {
  const { entries } = await getLeaderboardData(topN);
  return entries;
};

export const getLeaderboardStats = async (): Promise<{
  totalAttendees: number;
  totalHours: number;
  totalDonated: number;
}> => {
  const { stats } = await getLeaderboardData();
  return stats;
};

