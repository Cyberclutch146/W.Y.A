"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { createUserProfile } from '@/services/userService';
import { motion } from 'framer-motion';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(''), 7000);
    return () => clearTimeout(timer);
  }, [error]);

  const { register, loginAnonymously, loginWithGoogle } = useAuth();
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      setError('You must agree to the Terms.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const user = await register(email, password);
      await createUserProfile(user.uid, {
        displayName: fullName,
        email,
        location,
        role: 'student',
        skills: [],
        equipment: [],
        travelRadius: 0,
        availability: 'anytime',
        bio: '',
        phone: '',
        avatarUrl: '',
        volunteerHours: 0,
        totalDonated: 0,
        profileComplete: false,
        department: '',
        year: '',
        rollNumber: '',
        clubs: [],
        interests: [],
        xp: 0,
        badges: [],
        eventsAttended: 0
      });
      router.replace('/home');
    } catch (err: any) {
      setError(err.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymousSignIn = async () => {
    if (!agreed) {
      setError('You must agree to the Terms.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await loginAnonymously();
      router.replace('/home');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in anonymously');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!agreed) {
      setError('You must agree to the Terms.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
      router.replace('/home');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };


  const inputClass = "w-full px-4 py-3.5 border-4 border-black bg-transparent text-sm font-body outline-none transition-all focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-2px] focus:translate-y-[-2px] placeholder:text-on-surface-variant/50";

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6 text-on-background relative" style={{ background: 'var(--color-background-base)' }}>
      {/* Dot grid background */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #00000033 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden"
        style={{ background: 'var(--color-surface-container-lowest-base)' }}
      >

        {/* Left Side — Register Form */}
        <div className="flex flex-col justify-center p-8 md:p-12 lg:p-14">
          <Link href="/" className="mb-6 inline-flex items-center gap-2 text-[11px] font-label font-bold uppercase tracking-[0.14em] text-on-surface-variant transition-all hover:text-on-surface hover:translate-x-[-2px]">
            ← Back to homepage
          </Link>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 text-[10px] font-label font-bold uppercase tracking-[0.16em] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] w-fit mb-5" style={{ background: 'var(--color-secondary-container-base)', color: 'var(--color-on-secondary-container-base)' }}>
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>person_add</span>
            New Account
          </div>

          <h1 className="font-headline font-black text-3xl md:text-4xl uppercase tracking-tight text-on-surface leading-none mb-2">
            Join{' '}
            <span className="px-2 pb-0.5 inline-block border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" style={{ background: 'var(--color-primary-container-base)', color: 'var(--color-on-primary-container-base)' }}>CampusPulse.</span>
          </h1>
          <p className="text-on-surface-variant text-sm mb-6 max-w-[380px] leading-relaxed">
            Create your account and start owning your campus social life.
          </p>

          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <div>
              <label className="block text-[10px] font-label font-bold uppercase tracking-[0.14em] text-on-surface mb-1.5">Full Name</label>
              <input className={inputClass} style={{ background: 'var(--color-surface-container-base)' }} type="text" placeholder="Your Name" value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={loading} required />
            </div>

            <div>
              <label className="block text-[10px] font-label font-bold uppercase tracking-[0.14em] text-on-surface mb-1.5">Email</label>
              <input className={inputClass} style={{ background: 'var(--color-surface-container-base)' }} type="email" placeholder="you@campus.edu" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} required />
            </div>

            <div>
              <label className="block text-[10px] font-label font-bold uppercase tracking-[0.14em] text-on-surface mb-1.5">Location</label>
              <input className={inputClass} style={{ background: 'var(--color-surface-container-base)' }} type="text" placeholder="City, Country" value={location} onChange={(e) => setLocation(e.target.value)} disabled={loading} required />
            </div>

            <div>
              <label className="block text-[10px] font-label font-bold uppercase tracking-[0.14em] text-on-surface mb-1.5">Password</label>
              <input className={inputClass} style={{ background: 'var(--color-surface-container-base)' }} type="password" placeholder="Min 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} required minLength={8} />
            </div>

            <div className="flex items-start gap-3 mt-1 text-sm text-on-surface-variant">
              <input 
                type="checkbox" 
                checked={agreed} 
                onChange={(e) => setAgreed(e.target.checked)} 
                disabled={loading} 
                className="mt-1 w-5 h-5 accent-black border-2 border-black"
                required
              />
              <span className="text-xs leading-relaxed">
                I agree to the <a href="#" className="font-bold text-on-surface underline decoration-2 underline-offset-2 hover:text-primary transition-colors">Terms of Service</a> and <a href="#" className="font-bold text-on-surface underline decoration-2 underline-offset-2 hover:text-primary transition-colors">Privacy Policy</a>.
              </span>
            </div>

            <button 
              className="w-full py-4 font-label font-black text-sm uppercase tracking-wider border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-150 active:scale-[0.98] disabled:opacity-50 mt-1"
              style={{ background: 'var(--color-primary-container-base)', color: 'var(--color-on-primary-container-base)' }}
              type="submit" 
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Join CampusPulse →'}
            </button>

            <div className="flex items-center gap-3 my-1 text-on-surface-variant text-[10px] font-label font-bold uppercase tracking-[0.14em]">
              <div className="flex-1 h-[3px] bg-black" />
              <span>or</span>
              <div className="flex-1 h-[3px] bg-black" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button 
                type="button" 
                className="flex items-center justify-center gap-2 py-3.5 font-label font-bold text-sm uppercase tracking-wider border-4 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-150 text-on-surface disabled:opacity-50"
                style={{ background: 'var(--color-surface-container-base)' }}
                onClick={handleGoogleSignIn} 
                disabled={loading}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </button>

              <button 
                type="button" 
                className="flex items-center justify-center gap-2 py-3.5 font-label font-bold text-sm uppercase tracking-wider border-4 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-150 text-on-surface disabled:opacity-50"
                style={{ background: 'var(--color-surface-container-base)' }}
                onClick={handleAnonymousSignIn} 
                disabled={loading}
              >
                <span className="material-symbols-outlined text-base">person_off</span>
                Guest
              </button>
            </div>
          </form>

          <div className="mt-6 text-sm text-on-surface-variant font-body">
            Already have an account?{' '}
            <Link href="/login" className="font-bold text-on-surface underline decoration-4 underline-offset-4 hover:text-primary transition-colors uppercase">
              Log In
            </Link>
          </div>
        </div>

        {/* Right Side — Brutalist Collage Panel */}
        <div className="relative hidden md:flex flex-col border-l-4 border-black overflow-hidden">
          <div className="flex-1 p-8 flex flex-col justify-between border-b-4 border-black" style={{ background: 'var(--color-tertiary-container-base)' }}>
            <div>
              <p className="font-headline font-black text-xs uppercase tracking-[0.2em] opacity-60 mb-2">Start Your Journey</p>
              <h2 className="font-headline font-black text-3xl uppercase tracking-tight leading-none">
                Own Your<br />Campus Life
              </h2>
            </div>
            <div className="flex gap-2 flex-wrap mt-4">
              {['🎸 Music', '🏆 Compete', '🎨 Create', '⚽ Sports'].map(tag => (
                <span key={tag} className="px-3 py-1.5 text-[11px] font-label font-bold uppercase border-2 border-black" style={{ background: 'var(--color-surface-container-lowest-base)' }}>{tag}</span>
              ))}
            </div>
          </div>
          <div className="flex-1 p-6 flex flex-col justify-center border-b-4 border-black" style={{ background: 'var(--color-primary-container-base)' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 flex items-center justify-center border-4 border-black" style={{ background: 'var(--color-secondary-container-base)' }}>
                <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
              </div>
              <div>
                <p className="font-headline font-black text-sm uppercase">Earn XP & Badges</p>
                <p className="font-body text-xs text-on-surface-variant">Show up, get rewarded</p>
              </div>
            </div>
          </div>
          <div className="flex-1 p-6 flex flex-col justify-center" style={{ background: 'var(--color-secondary-container-base)' }}>
            <p className="font-headline font-black text-xs uppercase tracking-[0.2em] mb-3">248+ Active Events</p>
            <p className="font-body text-sm text-on-surface-variant leading-relaxed">RSVP in one tap, earn points for showing up, climb the leaderboard.</p>
          </div>
        </div>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3.5 text-sm font-label font-bold uppercase tracking-wider z-50 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          style={{ background: 'var(--color-error-container-base)', color: 'var(--color-on-error-container-base)' }}
        >
          ⚠ {error}
        </motion.div>
      )}
    </div>
  );
}
