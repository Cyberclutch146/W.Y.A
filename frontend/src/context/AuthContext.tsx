'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  GoogleAuthProvider, 
  signInWithPopup 
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { UserProfile } from '@/types';
import { subscribeToUserProfile } from '@/services/userService';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isOtpVerified: boolean;
  setOtpVerified: (verified: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<User>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOtpVerified, setIsOtpVerified] = useState(false);

  useEffect(() => {
    // Check if OTP was verified in this session
    const storedVerified = sessionStorage.getItem('otp_verified') === 'true';
    setIsOtpVerified(storedVerified);

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      
      if (!firebaseUser) {
        setProfile(null);
        setLoading(false);
        setIsOtpVerified(false);
        sessionStorage.removeItem('otp_verified');
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | undefined;

    if (user) {
      unsubscribeProfile = subscribeToUserProfile(user.uid, (userProfile) => {
        setProfile(userProfile);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }

    return () => {
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, [user]);

  const setOtpVerified = (verified: boolean) => {
    setIsOtpVerified(verified);
    if (verified) {
      sessionStorage.setItem('otp_verified', 'true');
    } else {
      sessionStorage.removeItem('otp_verified');
    }
  };

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (email: string, password: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result.user;
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
    sessionStorage.removeItem('otp_verified');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      isOtpVerified, 
      setOtpVerified,
      login, 
      register, 
      loginWithGoogle, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}