"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { createUserProfile } from '@/services/userService';
import { motion, AnimatePresence } from 'framer-motion';
import LiquidEther from '@/components/LiquidEther';
import Folder from '@/components/Folder';

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

        {/* Right Side — Dynamic Experience Panel */}
        <div className="relative hidden md:flex flex-col border-l-4 border-black overflow-hidden group/panel bg-[#FF3D00]">
          {/* Animated Background */}
          <div className="absolute inset-0 z-0">
            <LiquidEther
              colors={['#FF3D00', '#FFD600', '#FF00CC']}
              mouseForce={50}
              cursorSize={200}
              isViscous
              viscous={25}
              iterationsViscous={32}
              iterationsPoisson={32}
              resolution={0.6}
              autoDemo
              autoSpeed={1.2}
              autoIntensity={3.5}
            />
          </div>

          {/* Noise Overlay */}
          <div className="absolute inset-0 z-10 opacity-30 pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
          
          {/* Content Layer */}
          <div className="relative z-20 flex-1 p-10 flex flex-col justify-between h-full pointer-events-none [&>*]:pointer-events-auto">
            <div className="text-right space-y-4">
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="inline-flex items-center gap-3 justify-end"
              >
                <span className="text-white font-label font-black text-[12px] uppercase tracking-[0.4em]">Auth // Identity_v2</span>
                <div className="w-12 h-[4px] bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
              </motion.div>

              <h2 className="font-headline font-black text-7xl uppercase tracking-tighter leading-[0.8] text-white">
                <motion.span 
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="block"
                >
                  START
                </motion.span>
                <motion.span 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="block italic text-black"
                >
                  LEGACY
                </motion.span>
              </h2>
            </div>

            {/* Identity Card Component */}
            <div className="flex flex-col gap-8 items-end w-full">
              <motion.div
                initial={{ rotate: 5, y: 50, opacity: 0 }}
                animate={{ rotate: -2, y: 0, opacity: 1 }}
                transition={{ type: 'spring', damping: 15 }}
                whileHover={{ rotate: 0, scale: 1.05 }}
                className="w-full max-w-[320px] p-6 border-4 border-black bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-2 bg-black text-white text-[8px] font-black uppercase tracking-widest">
                  Official ID
                </div>
                
                <div className="flex gap-4 mb-6">
                  <div className="w-16 h-16 border-4 border-black bg-[#FFD600] flex items-center justify-center">
                    <span className="material-symbols-outlined text-4xl">face</span>
                  </div>
                  <div className="flex-1">
                    <div className="h-4 w-3/4 bg-black/10 mb-2" />
                    <div className="h-3 w-1/2 bg-black/5" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t-4 border-black pt-4">
                  <div>
                    <p className="text-[8px] font-black uppercase opacity-40">Status</p>
                    <p className="text-[12px] font-black uppercase">Level 01</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-black uppercase opacity-40">Access</p>
                    <p className="text-[12px] font-black uppercase">Verified</p>
                  </div>
                </div>
              </motion.div>

              <div className="rotate-[5deg] self-end translate-y-4">
                <Folder 
                  color="#00E5FF" 
                  size={0.85} 
                  items={[
                    <div key="1" className="p-3 text-[11px] font-black uppercase text-black">New Perks Unlocked</div>,
                    <div key="2" className="px-3 pb-1 text-[9px] font-bold uppercase text-black/60 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-black" /> Exclusive Invites
                    </div>,
                    <div key="3" className="px-3 pb-3 text-[9px] font-bold uppercase text-black/60 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-black" /> Priority Booking
                    </div>
                  ]}
                />
              </div>
            </div>

            <div className="mt-auto text-right">
              <p className="font-label font-black text-[11px] uppercase tracking-[0.2em] text-white">
                Waiting for input...
              </p>
              <div className="mt-2 w-full h-1 bg-black/20 overflow-hidden">
                <motion.div 
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="w-1/3 h-full bg-white shadow-[0_0_10px_white]"
                />
              </div>
            </div>
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
