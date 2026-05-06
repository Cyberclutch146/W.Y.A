'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User as FirebaseUser, 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { subscribeToUserProfile } from '@/services/userService';
import { UserProfile } from '@/types';

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<FirebaseUser>;
  register: (email: string, pass: string) => Promise<FirebaseUser>;
  loginWithGoogle: () => Promise<FirebaseUser>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      // Reject anonymous sessions immediately
      if (firebaseUser?.isAnonymous) {
        await firebaseSignOut(auth);
        return;
      }

      setUser(firebaseUser);

      if (firebaseUser) {
        unsubscribeProfile = subscribeToUserProfile(firebaseUser.uid, async (userProfile) => {
          if (!userProfile) {
            const { createUserProfile } = await import('@/services/userService');
            await createUserProfile(firebaseUser.uid, {
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || 'Student',
              bio: '',
              location: '',
              phone: '',
              campusZone: '',
              avatarUrl: firebaseUser.photoURL || '',
              role: 'student',
              eventHours: 0,
              totalDonated: 0,
              profileComplete: false,
              department: '',
              year: '',
              rollNumber: '',
              clubs: [],
              interests: [],
              xp: 0,
              badges: [],
              eventsAttended: 0,
              rsvpEventIds: [],
              savedEventIds: [],
              dismissedEventIds: []
            });
          } else {
            setProfile(userProfile);
            setLoading(false);
          }
        });
      } else {
        setProfile(null);
        if (unsubscribeProfile) unsubscribeProfile();
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  const login = async (email: string, pass: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    return cred.user;
  };

  const register = async (email: string, pass: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    return cred.user;
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const cred = await signInWithPopup(auth, provider);
    return cred.user;
  };

  const logout = async () => {
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, register, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
