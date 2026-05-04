"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import LiquidEther from '@/components/LiquidEther';
import { LogIn, User, Zap, Shield, Wifi, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => {
      setError('');
    }, 7000);
    return () => clearTimeout(timer);
  }, [error]);
  
  const { login, loginAnonymously, loginWithGoogle } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.replace('/home');
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymousSignIn = async () => {
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
      <div className="fixed inset-0 pointer-events-none z-0" style={{ background: 'radial-gradient(circle at 30% 20%, hsl(from var(--cp-primary) h s l / 0.04) 0%, transparent 60%), radial-gradient(circle at 80% 80%, hsl(from var(--cp-violet) h s l / 0.04) 0%, transparent 60%)' }} />

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
        
        {/* Left Side — Dynamic Pulse Panel */}
        <div className="relative hidden md:flex flex-col overflow-hidden" style={{ background: '#0a0a0a' }}>
          {/* Animated Background */}
          <div className="absolute inset-0 z-0 opacity-60 mix-blend-screen">
            <LiquidEther
              colors={['#5227FF', '#00E5FF', '#FF00CC']}
              mouseForce={40}
              cursorSize={150}
              isViscous
              viscous={35}
              iterationsViscous={32}
              iterationsPoisson={32}
              resolution={0.5}
              autoDemo
              autoSpeed={0.8}
              autoIntensity={2.5}
            />
          </div>

          {/* Content Layer */}
          <div className="relative z-20 flex-1 p-10 flex flex-col justify-between h-full pointer-events-none [&>*]:pointer-events-auto">
            <div className="space-y-6">
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="flex items-center gap-3"
              >
                <div className="w-12 h-[3px] rounded-full" style={{ background: 'var(--cp-primary)' }} />
                <span className="text-white/60 text-[11px] font-semibold uppercase tracking-[0.3em]">Welcome Back</span>
              </motion.div>

              <h2 className="font-headline font-bold text-6xl tracking-tight leading-[0.9] text-white">
                <motion.span 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="block"
                  style={{ WebkitTextStroke: '1.5px rgba(255,255,255,0.4)', color: 'transparent' }}
                >
                  Campus
                </motion.span>
                <motion.span 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="block bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent"
                >
                  Pulse
                </motion.span>
              </h2>
            </div>

            {/* Status items */}
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                {[
                  { Icon: Zap, text: 'Live event tracking active', color: '#00E5FF' },
                  { Icon: Shield, text: 'Auth protocol secured', color: '#FF00CC' },
                  { Icon: Wifi, text: 'Campus network linked', color: '#5227FF' }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + (i * 0.1) }}
                    className="flex items-center gap-3 p-3 rounded-xl backdrop-blur-md transition-colors"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <item.Icon size={14} style={{ color: item.color }} />
                    <span className="text-white/50 text-[10px] font-semibold uppercase tracking-widest">
                      {item.text}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="mt-8 flex items-end justify-between pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="space-y-1">
                <p className="text-white/30 text-[9px] font-semibold uppercase tracking-[0.2em]">Established</p>
                <p className="text-white font-headline font-bold text-sm tracking-wider">Est. 2024</p>
              </div>
              <div className="text-right">
                <p className="text-white/30 text-[9px] font-semibold uppercase tracking-[0.2em]">Connection</p>
                <p className="text-sm font-bold tracking-wider" style={{ color: '#00E5FF' }}>Encrypted</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side — Login Form */}
        <div className="flex flex-col justify-center p-8 md:p-12 lg:p-16">
          <Link href="/" className="mb-6 inline-flex items-center gap-2 text-xs font-semibold transition-all hover:gap-3" style={{ color: 'var(--cp-text-3)' }}>
            ← Back to homepage
          </Link>

          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg w-fit mb-6"
            style={{ background: 'hsl(from var(--cp-primary) h s l / 0.1)', color: 'var(--cp-primary)' }}
          >
            <LogIn size={12} />
            Sign In
          </div>

          <h1 className="font-headline font-bold text-4xl md:text-5xl tracking-tight leading-none mb-3" style={{ color: 'var(--cp-text-1)' }}>
            Welcome<br />
            <span
              className="px-2 py-0.5 inline-block rounded-lg"
              style={{ background: 'linear-gradient(135deg, var(--cp-primary), var(--cp-violet))', color: 'white' }}
            >Back.</span>
          </h1>
          <p className="text-sm mb-8 max-w-[380px] leading-relaxed" style={{ color: 'var(--cp-text-3)' }}>
            Continue your campus journey with CampusPulse.
          </p>

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--cp-text-2)' }}>Email</label>
              <input
                className="input-base"
                type="email"
                placeholder="you@campus.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--cp-text-2)' }}>Password</label>
              <input
                className="input-base"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <button 
              className="btn-primary w-full justify-center py-4 text-sm mt-2 disabled:opacity-50"
              type="submit" 
              disabled={loading}
            >
              {loading ? <><Loader2 size={16} className="animate-spin" /> Signing in...</> : 'Sign In →'}
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

          <div className="mt-8 text-sm" style={{ color: 'var(--cp-text-3)' }}>
            New here?{' '}
            <Link href="/register" className="font-bold underline underline-offset-4 transition-colors hover:opacity-80" style={{ color: 'var(--cp-primary)' }}>
              Create Account
            </Link>
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
