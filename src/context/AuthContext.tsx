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
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string) => Promise<FirebaseUser>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // Mock user for testing without authentication
  const mockUser = { uid: 'mock-uid-123', email: 'tester@campuspulse.com', displayName: 'Test Student' } as FirebaseUser;
  const mockProfile: UserProfile = {
    email: 'tester@campuspulse.com',
    displayName: 'Test Student',
    bio: 'Testing the app',
    location: 'Campus',
    phone: '1234567890',
    skills: [],
    equipment: [],
    travelRadius: 5,
    availability: 'anytime',
    avatarUrl: '',
    role: 'student',
    volunteerHours: 10,
    totalDonated: 0,
    profileComplete: true,
    department: 'Computer Science',
    year: '3',
    rollNumber: 'CS123',
    clubs: ['Coding Club'],
    interests: ['Technology', 'Hackathons'],
    xp: 150,
    badges: [],
    eventsAttended: 2
  };

  const [user, setUser] = useState<FirebaseUser | null>(mockUser);
  const [profile, setProfile] = useState<UserProfile | null>(mockProfile);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Authentication is bypassed for now
  }, []);

  const login = async (email: string, pass: string) => {};
  const register = async (email: string, pass: string) => mockUser;
  const loginWithGoogle = async () => {};
  const logout = async () => {};

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, register, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
