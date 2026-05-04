"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { createUserProfile } from '@/services/userService';
import { motion, AnimatePresence } from 'framer-motion';
import LiquidEther from '@/components/LiquidEther';
import { UserPlus, User, Loader2, Sparkles, Star, Trophy } from 'lucide-react';

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
        eventsAttended: 0,
        rsvpEventIds: [],
        savedEventIds: [],
        dismissedEventIds: []
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

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6 relative" style={{ background: 'var(--cp-bg)' }}>
      {/* Subtle gradient background */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{ background: 'radial-gradient(circle at 70% 30%, hsl(from var(--cp-accent) h s l / 0.04) 0%, transparent 60%), radial-gradient(circle at 20% 80%, hsl(from var(--cp-orange) h s l / 0.04) 0%, transparent 60%)' }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 overflow-hidden"
        style={{
          background: 'var(--cp-surface)',
          border: '1px solid var(--cp-border)',
          borderRadius: 'var(--r-2xl)',
          boxShadow: '0 25px 80px -12px rgba(0,0,0,0.25)',
        }}
      >

        {/* Left Side — Register Form */}
        <div className="flex flex-col justify-center p-8 md:p-12 lg:p-14">
          <Link href="/" className="mb-6 inline-flex items-center gap-2 text-xs font-semibold transition-all hover:gap-3" style={{ color: 'var(--cp-text-3)' }}>
            ← Back to homepage
          </Link>

          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg w-fit mb-5"
            style={{ background: 'hsl(from var(--cp-secondary) h s l / 0.1)', color: 'var(--cp-secondary)' }}
          >
            <UserPlus size={12} />
            New Account
          </div>

          <h1 className="font-headline font-bold text-3xl md:text-4xl tracking-tight leading-none mb-2" style={{ color: 'var(--cp-text-1)' }}>
            Join{' '}
            <span
              className="px-2 py-0.5 inline-block rounded-lg"
              style={{ background: 'linear-gradient(135deg, var(--cp-primary), var(--cp-violet))', color: 'white' }}
            >CampusPulse.</span>
          </h1>
          <p className="text-sm mb-6 max-w-[380px] leading-relaxed" style={{ color: 'var(--cp-text-3)' }}>
            Create your account and start owning your campus social life.
          </p>

          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--cp-text-2)' }}>Full Name</label>
              <input className="input-base" type="text" placeholder="Your Name" value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={loading} required />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--cp-text-2)' }}>Email</label>
              <input className="input-base" type="email" placeholder="you@campus.edu" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} required />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--cp-text-2)' }}>Location</label>
              <input className="input-base" type="text" placeholder="City, Country" value={location} onChange={(e) => setLocation(e.target.value)} disabled={loading} required />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--cp-text-2)' }}>Password</label>
              <input className="input-base" type="password" placeholder="Min 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} required minLength={8} />
            </div>

            <div className="flex items-start gap-3 mt-1 text-sm" style={{ color: 'var(--cp-text-3)' }}>
              <input 
                type="checkbox" 
                checked={agreed} 
                onChange={(e) => setAgreed(e.target.checked)} 
                disabled={loading} 
                className="mt-1 w-4 h-4 rounded"
                style={{ accentColor: 'var(--cp-primary)' }}
                required
              />
              <span className="text-xs leading-relaxed">
                I agree to the <a href="#" className="font-bold underline underline-offset-2 transition-colors" style={{ color: 'var(--cp-primary)' }}>Terms of Service</a> and <a href="#" className="font-bold underline underline-offset-2 transition-colors" style={{ color: 'var(--cp-primary)' }}>Privacy Policy</a>.
              </span>
            </div>

            <button 
              className="btn-primary w-full justify-center py-4 text-sm mt-1 disabled:opacity-50"
              type="submit" 
              disabled={loading}
            >
              {loading ? <><Loader2 size={16} className="animate-spin" /> Creating Account...</> : 'Join CampusPulse →'}
            </button>

            <div className="flex items-center gap-3 my-1" style={{ color: 'var(--cp-text-3)' }}>
              <div className="flex-1 h-px" style={{ background: 'var(--cp-border)' }} />
              <span className="text-[10px] font-semibold uppercase tracking-wider">or</span>
              <div className="flex-1 h-px" style={{ background: 'var(--cp-border)' }} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button 
                type="button" 
                className="btn-secondary justify-center py-3 text-sm disabled:opacity-50"
                onClick={handleGoogleSignIn} 
                disabled={loading}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </button>

              <button 
                type="button" 
                className="btn-secondary justify-center py-3 text-sm disabled:opacity-50"
                onClick={handleAnonymousSignIn} 
                disabled={loading}
              >
                <User size={16} />
                Guest
              </button>
            </div>
          </form>

          <div className="mt-6 text-sm" style={{ color: 'var(--cp-text-3)' }}>
            Already have an account?{' '}
            <Link href="/login" className="font-bold underline underline-offset-4 transition-colors hover:opacity-80" style={{ color: 'var(--cp-primary)' }}>
              Log In
            </Link>
          </div>
        </div>

        {/* Right Side — Dynamic Experience Panel */}
        <div className="relative hidden md:flex flex-col overflow-hidden" style={{ background: 'var(--cp-accent)' }}>
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
          <div className="absolute inset-0 z-10 opacity-20 pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
          
          {/* Content Layer */}
          <div className="relative z-20 flex-1 p-10 flex flex-col justify-between h-full pointer-events-none [&>*]:pointer-events-auto">
            <div className="text-right space-y-4">
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="inline-flex items-center gap-3 justify-end"
              >
                <span className="text-white/70 text-[11px] font-semibold uppercase tracking-[0.3em]">Your Journey Starts</span>
                <div className="w-12 h-[3px] rounded-full bg-white" />
              </motion.div>

              <h2 className="font-headline font-bold text-6xl tracking-tight leading-[0.9] text-white">
                <motion.span 
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="block"
                >
                  Start
                </motion.span>
                <motion.span 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="block bg-gradient-to-r from-yellow-200 to-white bg-clip-text text-transparent"
                >
                  Your Legacy
                </motion.span>
              </h2>
            </div>

            {/* Perk Cards */}
            <div className="flex flex-col gap-4 items-end w-full">
              <motion.div
                initial={{ rotate: 3, y: 50, opacity: 0 }}
                animate={{ rotate: -1, y: 0, opacity: 1 }}
                transition={{ type: 'spring', damping: 15 }}
                whileHover={{ rotate: 0, scale: 1.03 }}
                className="w-full max-w-[300px] p-6 relative overflow-hidden"
                style={{
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(12px)',
                  borderRadius: 'var(--r-2xl)',
                  boxShadow: '0 20px 60px -15px rgba(0,0,0,0.3)',
                }}
              >
                <div className="absolute top-0 right-0 px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-white rounded-bl-xl" style={{ background: 'var(--cp-primary)' }}>
                  Official ID
                </div>
                
                <div className="flex gap-4 mb-5">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #FFD600, #FF9800)' }}
                  >
                    <User size={24} className="text-white" />
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="h-3 w-3/4 rounded-full mb-2" style={{ background: 'rgba(0,0,0,0.08)' }} />
                    <div className="h-2.5 w-1/2 rounded-full" style={{ background: 'rgba(0,0,0,0.05)' }} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                  <div>
                    <p className="text-[9px] font-semibold uppercase text-black/30">Status</p>
                    <p className="text-[12px] font-bold text-black/80">Level 01</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-semibold uppercase text-black/30">Access</p>
                    <p className="text-[12px] font-bold text-black/80">Verified ✓</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col gap-2 w-full max-w-[260px]"
              >
                {[
                  { Icon: Sparkles, text: 'Exclusive Invites', color: '#FFD600' },
                  { Icon: Star, text: 'Priority Booking', color: '#FF00CC' },
                  { Icon: Trophy, text: 'Earn XP & Badges', color: '#00E5FF' },
                ].map((perk, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)' }}
                  >
                    <perk.Icon size={14} style={{ color: perk.color }} />
                    <span className="text-white text-[11px] font-bold tracking-wide">{perk.text}</span>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            <div className="mt-auto text-right">
              <p className="text-white/60 text-[11px] font-semibold uppercase tracking-[0.2em]">
                Waiting for input...
              </p>
              <div className="mt-2 w-full h-1 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.2)' }}>
                <motion.div 
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="w-1/3 h-full rounded-full"
                  style={{ background: 'white', boxShadow: '0 0 10px white' }}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3.5 text-sm font-bold z-50 rounded-xl"
            style={{
              background: 'hsl(from var(--cp-accent) h s l / 0.15)',
              color: 'var(--cp-accent)',
              border: '1px solid hsl(from var(--cp-accent) h s l / 0.3)',
              backdropFilter: 'blur(12px)',
            }}
          >
            ⚠ {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
