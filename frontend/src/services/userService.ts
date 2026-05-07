import { db } from '@/lib/firebase';
import { doc, getDoc, onSnapshot, collection, getDocs } from 'firebase/firestore';
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
    const snapshot = await getDocs(usersRef); // ONE read instead of TWO

    let totalHours = 0;
    let totalDonated = 0;

    const allEntries: LeaderboardEntry[] = snapshot.docs.map(doc => {
      const data = doc.data() as UserProfile;
      totalHours += data.eventHours || 0;
      totalDonated += data.totalDonated || 0;
      const impactScore =
        (data.eventHours || 0) * 10 +
        (data.totalDonated || 0) +
        (data.interests?.length || 0) * 5;
      return {
        id: doc.id,
        displayName: data.displayName || 'Anonymous Hero',
        avatarUrl: data.avatarUrl || '',
        eventHours: data.eventHours || 0,
        totalDonated: data.totalDonated || 0,
        interests: data.interests || [],
        location: data.location || '',
        impactScore,
      };
    });

    const entries = allEntries
      .filter(e => e.impactScore > 0)
      .sort((a, b) => b.impactScore - a.impactScore)
      .slice(0, topN);

    return {
      entries,
      stats: { totalAttendees: snapshot.docs.length, totalHours, totalDonated },
    };
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

