"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { createUserProfile } from '@/services/userService';
import { motion, AnimatePresence } from 'framer-motion';
import LiquidEther from '@/components/LiquidEther';
import { UserPlus, Loader2, Sparkles, Star, Trophy, ArrowLeft, RotateCcw, ChevronRight, Mail, Lock, User as UserIcon } from 'lucide-react';
import StickerPeel from '@/components/StickerPeel';


type Step = 'form' | 'otp';

export default function RegisterPage() {
  const [step, setStep] = useState<Step>('form');

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);

  // OTP
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, loginWithGoogle, user } = useAuth();
  const router = useRouter();

  useEffect(() => { if (user) router.replace('/home'); }, [user, router]);

  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(''), 7000);
    return () => clearTimeout(t);
  }, [error]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown(c => c - 1), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  // ── Send OTP helper ────────────────────────────────────
  const sendOtp = async (toEmail: string) => {
    const res = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: toEmail }),
    });
    if (!res.ok) {
      const d = await res.json();
      throw new Error(d.error || 'Failed to send OTP');
    }
  };

  // ── Register step 1 ────────────────────────────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) { setError('You must agree to the Terms.'); return; }
    setError(''); setLoading(true);
    try {
      const firebaseUser = await register(email, password);
      await createUserProfile(firebaseUser.uid, {
        displayName: fullName, email, location, role: 'student',
        campusZone: '', bio: '', phone: '', avatarUrl: '', volunteerHours: 0, totalDonated: 0,
        profileComplete: false, department: '', year: '', rollNumber: '',
        clubs: [], interests: [], xp: 0, badges: [], eventsAttended: 0,
        rsvpEventIds: [], savedEventIds: [], dismissedEventIds: []
      });
      await sendOtp(email);
      setStep('otp');
      setResendCooldown(60);
    } catch (err: any) {
      setError(err.message || 'Failed to register');
    } finally { setLoading(false); }
  };

  // ── Resend OTP ─────────────────────────────────────────
  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError('');
    try {
      await sendOtp(email);
      setResendCooldown(60);
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } catch (err: any) { setError(err.message || 'Failed to resend'); }
  };

  // ── OTP digit input ────────────────────────────────────
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus();
  };
  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) { setOtp(pasted.split('')); otpRefs.current[5]?.focus(); }
    e.preventDefault();
  };

  // ── OTP verify ─────────────────────────────────────────
  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) { setError('Enter all 6 digits'); return; }
    setError(''); setOtpLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: code }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Verification failed'); return; }
      router.replace('/home');
    } catch { setError('Something went wrong'); }
    finally { setOtpLoading(false); }
  };

  // ── Google sign in ─────────────────────────────────────
  const handleGoogleSignIn = async () => {
    if (!agreed) { setError('You must agree to the Terms.'); return; }
    setError(''); setLoading(true);
    try {
      await loginWithGoogle();
      router.replace('/home');
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') setError(err.message || 'Google sign-in failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6 relative" style={{ background: 'var(--cp-bg)' }}>
      <div className="fixed inset-0 pointer-events-none z-0" style={{ background: 'radial-gradient(circle at 70% 30%, hsl(from var(--cp-accent) h s l / 0.04) 0%, transparent 60%), radial-gradient(circle at 20% 80%, hsl(from var(--cp-orange) h s l / 0.04) 0%, transparent 60%)' }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 overflow-hidden"
        style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border)', borderRadius: 'var(--r-2xl)', boxShadow: '0 25px 80px -12px rgba(0,0,0,0.25)' }}
      >
        {/* Left — Form or OTP */}
        <div className="flex flex-col justify-center p-8 md:p-12 lg:p-14">
          <Link href="/" className="mb-6 inline-flex items-center gap-2 text-xs font-semibold hover:gap-3 transition-all" style={{ color: 'var(--cp-text-3)' }}>
            <ArrowLeft size={13} /> Back to homepage
          </Link>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg w-fit mb-5"
            style={{ background: 'hsl(from var(--cp-secondary) h s l / 0.1)', color: 'var(--cp-secondary)' }}>
            <UserPlus size={12} /> New Account
          </div>

          <AnimatePresence mode="wait">
            {/* ── Step 1: Registration form ── */}
            {step === 'form' && (
              <motion.div key="form" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} transition={{ duration: 0.2 }}>
                <h1 className="font-headline font-bold text-3xl md:text-4xl tracking-tight leading-tight mb-2" style={{ color: 'var(--cp-text-1)' }}>
                  Join{' '}
                  <span className="px-2 py-0.5 inline-block rounded-lg" style={{ background: 'linear-gradient(135deg, var(--cp-primary), var(--cp-accent))', color: 'white' }}>WYA</span>
                </h1>
                <p className="text-sm mb-6 max-w-[380px] leading-relaxed" style={{ color: 'var(--cp-text-3)' }}>
                  Create your account. We'll verify your email with a one-time code.
                </p>

                <form onSubmit={handleRegister} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--cp-text-2)' }}>Full Name</label>
                    <div className="relative">
                      <UserIcon size={14} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--cp-text-3)' }} />
                      <input className="input-base" style={{ paddingLeft: '2.75rem' }} type="text" placeholder="Your Name" value={fullName} onChange={e => setFullName(e.target.value)} disabled={loading} required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--cp-text-2)' }}>Email</label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--cp-text-3)' }} />
                      <input className="input-base" style={{ paddingLeft: '2.75rem' }} type="email" placeholder="you@campus.edu" value={email} onChange={e => setEmail(e.target.value)} disabled={loading} required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--cp-text-2)' }}>Location</label>
                    <input className="input-base" type="text" placeholder="City, Country" value={location} onChange={e => setLocation(e.target.value)} disabled={loading} required />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--cp-text-2)' }}>Password</label>
                    <div className="relative">
                      <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--cp-text-3)' }} />
                      <input className="input-base" style={{ paddingLeft: '2.75rem' }} type="password" placeholder="Min 8 characters" value={password} onChange={e => setPassword(e.target.value)} disabled={loading} required minLength={8} />
                    </div>
                  </div>

                  <div className="flex items-start gap-3 mt-1 text-sm" style={{ color: 'var(--cp-text-3)' }}>
                    <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} disabled={loading}
                      className="mt-1 w-4 h-4 rounded" style={{ accentColor: 'var(--cp-primary)' }} required />
                    <span className="text-xs leading-relaxed">
                      I agree to the{' '}
                      <a href="#" className="font-bold underline underline-offset-2" style={{ color: 'var(--cp-primary)' }}>Terms of Service</a>
                      {' '}and{' '}
                      <a href="#" className="font-bold underline underline-offset-2" style={{ color: 'var(--cp-primary)' }}>Privacy Policy</a>.
                    </span>
                  </div>

                  <button className="btn-primary w-full justify-center py-4 text-sm mt-1 disabled:opacity-50 flex items-center gap-2"
                    type="submit" disabled={loading}>
                    {loading ? <><Loader2 size={16} className="animate-spin" /> Sending code...</> : <>Create Account <ChevronRight size={15} /></>}
                  </button>

                  <div className="flex items-center gap-3 my-1" style={{ color: 'var(--cp-text-3)' }}>
                    <div className="flex-1 h-px" style={{ background: 'var(--cp-border)' }} />
                    <span className="text-[10px] font-semibold uppercase tracking-wider">or</span>
                    <div className="flex-1 h-px" style={{ background: 'var(--cp-border)' }} />
                  </div>

                  <button type="button" onClick={handleGoogleSignIn} disabled={loading}
                    className="btn-secondary w-full justify-center py-3 text-sm disabled:opacity-50 flex items-center gap-2">
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Continue with Google
                  </button>
                </form>

                <div className="mt-6 text-sm" style={{ color: 'var(--cp-text-3)' }}>
                  Already have an account?{' '}
                  <Link href="/login" className="font-bold underline underline-offset-4 hover:opacity-80" style={{ color: 'var(--cp-primary)' }}>Log In</Link>
                </div>
              </motion.div>
            )}

            {/* ── Step 2: OTP verification ── */}
            {step === 'otp' && (
              <motion.div key="otp" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.2 }}>
                <h1 className="font-headline font-bold text-3xl md:text-4xl tracking-tight leading-tight mb-2" style={{ color: 'var(--cp-text-1)' }}>
                  Verify your<br />
                  <span className="px-2 py-0.5 rounded-lg" style={{ background: 'linear-gradient(135deg, var(--cp-secondary), var(--cp-primary))', color: 'white' }}>Email</span>
                </h1>
                <p className="text-sm mb-2 leading-relaxed" style={{ color: 'var(--cp-text-3)' }}>We sent a 6-digit code to</p>
                <p className="text-sm font-bold mb-8" style={{ color: 'var(--cp-text-1)' }}>{email}</p>

                <form onSubmit={handleOtpVerify} className="flex flex-col gap-6">
                  <div className="flex gap-2 justify-between" onPaste={handleOtpPaste}>
                    {otp.map((digit, i) => (
                      <input key={i}
                        ref={el => { otpRefs.current[i] = el; }}
                        type="text" inputMode="numeric" maxLength={1} value={digit}
                        onChange={e => handleOtpChange(i, e.target.value)}
                        onKeyDown={e => handleOtpKeyDown(i, e)}
                        className="w-full aspect-square text-center text-xl font-black rounded-xl transition-all outline-none focus:ring-2"
                        style={{
                          background: digit ? 'hsl(from var(--cp-primary) h s l / 0.08)' : 'var(--cp-surface-dim)',
                          border: `2px solid ${digit ? 'var(--cp-primary)' : 'var(--cp-border)'}`,
                          color: 'var(--cp-text-1)',
                        }}
                      />
                    ))}
                  </div>

                  <button type="submit" disabled={otpLoading || otp.join('').length < 6}
                    className="btn-primary w-full justify-center py-4 text-sm disabled:opacity-50 flex items-center gap-2">
                    {otpLoading ? <><Loader2 size={15} className="animate-spin" /> Verifying...</> : 'Verify & Finish'}
                  </button>
                </form>

                <div className="mt-5 flex items-center justify-between text-xs">
                  <button onClick={() => { setStep('form'); setOtp(['','','','','','']); setError(''); }}
                    className="flex items-center gap-1.5 font-semibold" style={{ color: 'var(--cp-text-3)' }}>
                    <ArrowLeft size={12} /> Back
                  </button>
                  <button onClick={handleResend} disabled={resendCooldown > 0}
                    className="flex items-center gap-1.5 font-semibold disabled:opacity-50" style={{ color: 'var(--cp-primary)' }}>
                    <RotateCcw size={12} className={resendCooldown === 0 ? "hover:-rotate-90 transition-transform" : ""} />
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right — Animated Panel */}
        <div className="relative hidden md:flex flex-col overflow-hidden" style={{ background: '#0a0a0a' }}>
          <div className="absolute inset-0 z-0 opacity-60 mix-blend-screen">
            <LiquidEther
              colors={['#5227FF', '#00E5FF', '#FF00CC']}
              mouseForce={40} cursorSize={150} isViscous viscous={35}
              iterationsViscous={32} iterationsPoisson={32} resolution={0.5}
              autoDemo autoSpeed={0.8} autoIntensity={2.5}
            />
          </div>

          <div className="relative z-20 flex-1 p-10 flex flex-col justify-between pointer-events-none [&>*]:pointer-events-auto overflow-hidden">
            {/* Top Accent */}
            <div className="relative z-30">
              <motion.div initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex items-center gap-3">
                <div className="w-10 h-[2px] rounded-full bg-white/40" />
                <span className="text-white/50 text-[10px] font-bold uppercase tracking-[0.3em]">Campus Pulse</span>
              </motion.div>
            </div>

            {/* Absolutely positioned Lanyard hanging from the top */}
            <div className="absolute top-0 inset-x-0 flex flex-col items-center justify-start z-10 pointer-events-none">
              <div className="pointer-events-auto -translate-y-8">
                {/* ── Lanyard Assembly ── */}
                <motion.div
                  className="flex flex-col items-center"
                  animate={{ rotate: [0, 3.5, 0, -3.5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ transformOrigin: 'top center' }}
                >

                  {/* ── Realistic Lanyard Strap ── */}
                  <div className="relative flex flex-col items-center">
                    {/* Fabric ribbon - wider with woven texture */}
                    <div className="w-[26px] h-[80px] relative overflow-hidden rounded-[1px]"
                      style={{ background: 'linear-gradient(90deg, #4a0e0e 0%, #7a2020 20%, #9b2c2c 40%, #a83434 50%, #9b2c2c 60%, #7a2020 80%, #4a0e0e 100%)' }}>
                      {/* Center satin stripe */}
                      <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[6px]"
                        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,180,180,0.12), transparent)' }} />
                      {/* Edge stitching - left */}
                      <div className="absolute inset-y-0 left-[3px] w-[1px]" style={{ background: 'rgba(255,255,255,0.06)' }} />
                      {/* Edge stitching - right */}
                      <div className="absolute inset-y-0 right-[3px] w-[1px]" style={{ background: 'rgba(255,255,255,0.06)' }} />
                      {/* Woven crosshatch pattern */}
                      {Array.from({ length: 16 }).map((_, i) => (
                        <div key={i} className="absolute left-0 right-0 h-[1px]"
                          style={{ top: `${i * 6.25}%`, background: i % 2 === 0 ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.03)' }} />
                      ))}
                      {/* Fabric sheen highlight */}
                      <div className="absolute top-0 left-0 right-0 h-[30%]"
                        style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.1), transparent)' }} />
                    </div>

                    {/* Metal ring / grommet connecting strap to clip */}
                    <div className="relative -mt-[4px] w-[20px] h-[20px] rounded-full z-10 flex items-center justify-center"
                      style={{
                        background: 'conic-gradient(from 0deg, #e8e8e8, #b0b0b0, #d0d0d0, #a0a0a0, #c8c8c8, #909090, #e8e8e8)',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.35), inset 0 0 3px rgba(255,255,255,0.4)',
                      }}>
                      <div className="w-[10px] h-[10px] rounded-full"
                        style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0.15), rgba(0,0,0,0.05))', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.3)' }} />
                    </div>
                  </div>

                  {/* ── Alligator Clip Assembly ── */}
                  <div className="relative -mt-[6px] flex flex-col items-center z-10">
                    {/* Clip top jaw (spring housing) */}
                    <div className="w-[40px] h-[14px] rounded-t-[3px] relative"
                      style={{
                        background: 'linear-gradient(180deg, #e0e0e0 0%, #c8c8c8 40%, #b0b0b0 100%)',
                        boxShadow: '0 -1px 0 rgba(255,255,255,0.6), inset 0 -1px 2px rgba(0,0,0,0.1)',
                      }}>
                      {/* Top shine strip */}
                      <div className="absolute top-[1px] left-[4px] right-[4px] h-[3px] rounded-[1px]"
                        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8) 40%, rgba(255,255,255,0.9) 50%, rgba(255,255,255,0.8) 60%, transparent)' }} />
                      {/* Spring cylinder detail */}
                      <div className="absolute bottom-[2px] left-1/2 -translate-x-1/2 w-[12px] h-[4px] rounded-[2px]"
                        style={{ background: 'linear-gradient(180deg, #a0a0a0, #888)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3)' }} />
                    </div>
                    {/* Clip body */}
                    <div className="w-[38px] h-[12px] relative"
                      style={{
                        background: 'linear-gradient(180deg, #c0c0c0 0%, #a8a8a8 50%, #989898 100%)',
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5), 0 2px 4px rgba(0,0,0,0.2)',
                      }}>
                      {/* Center crease line */}
                      <div className="absolute top-1/2 -translate-y-1/2 left-[6px] right-[6px] h-[1px]"
                        style={{ background: 'rgba(0,0,0,0.12)' }} />
                    </div>
                    {/* Bottom jaw with teeth */}
                    <div className="w-[36px] h-[8px] rounded-b-[3px] relative"
                      style={{
                        background: 'linear-gradient(180deg, #a0a0a0 0%, #808080 100%)',
                        boxShadow: '0 3px 8px rgba(0,0,0,0.3)',
                      }}>
                      {/* Teeth serration */}
                      <div className="absolute bottom-0 left-[4px] right-[4px] h-[2px] flex justify-between">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <div key={i} className="w-[3px] h-full rounded-b-[1px]"
                            style={{ background: 'linear-gradient(180deg, #909090, #707070)' }} />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* ── Card Holder Sleeve ── */}
                  <motion.div
                    initial={{ rotate: 12, y: 60, opacity: 0, scale: 0.9 }}
                    animate={{ rotate: 0, y: 0, opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', damping: 10, stiffness: 60, delay: 0.15 }}
                    whileHover={{ rotate: -3, scale: 1.07, y: -8 }}
                    className="relative mt-[1px]"
                    style={{ transformOrigin: 'top center' }}
                  >
                    {/* Plastic sleeve */}
                    <div className="relative rounded-2xl"
                      style={{
                        padding: '7px 7px 10px 7px',
                        background: 'linear-gradient(180deg, rgba(255,255,255,0.42) 0%, rgba(255,255,255,0.22) 40%, rgba(255,255,255,0.12) 100%)',
                        border: '1.5px solid rgba(255,255,255,0.45)',
                        boxShadow: '0 35px 70px -15px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.3)',
                        backdropFilter: 'blur(3px)',
                      }}>

                      {/* Slot hole at top */}
                      <div className="absolute -top-[5px] left-1/2 -translate-x-1/2 w-[44px] h-[10px] rounded-b-[5px] overflow-hidden"
                        style={{ background: 'rgba(0,0,0,0.12)', boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.25)' }}>
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[30px] h-[3px] rounded-t-[2px]"
                          style={{ background: 'rgba(255,255,255,0.1)' }} />
                      </div>

                      {/* Corner reflections on sleeve */}
                      <div className="absolute top-2 right-2 w-8 h-16 rounded-tr-xl pointer-events-none"
                        style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.15), transparent)', borderRadius: '0 12px 0 0' }} />

                      {/* ════ THE CARD ════ */}
                      <div className="relative w-[260px] rounded-xl overflow-hidden"
                        style={{ background: 'white', boxShadow: '0 2px 15px rgba(0,0,0,0.06)' }}>

                        {/* Holographic shimmer */}
                        <motion.div animate={{ x: ['-200%', '500%'] }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', repeatDelay: 3 }}
                          className="absolute inset-y-0 w-1/3 z-30 pointer-events-none"
                          style={{ background: 'linear-gradient(100deg, transparent 10%, rgba(255,200,255,0.25) 30%, rgba(255,255,255,0.55) 45%, rgba(150,230,255,0.35) 55%, rgba(255,255,255,0.55) 60%, rgba(200,255,200,0.2) 75%, transparent 90%)' }} />

                        {/* ── Top White Section ── */}
                        <div className="relative bg-white pt-6 pb-0 text-center">

                          {/* Photo circle */}
                          <div className="relative inline-block mb-2">
                            <motion.div
                              animate={{ boxShadow: ['0 0 0px rgba(0,210,255,0.3)', '0 0 20px rgba(0,210,255,0.5)', '0 0 0px rgba(0,210,255,0.3)'] }}
                              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                              className="w-[68px] h-[68px] rounded-full flex items-center justify-center mx-auto"
                              style={{
                                background: 'linear-gradient(135deg, var(--cp-primary), var(--cp-violet))',
                                border: '3.5px solid #00d2ff',
                              }}>
                              <UserIcon size={28} className="text-white" />
                            </motion.div>
                          </div>

                          {/* Name */}
                          <motion.h3 layout className="text-[18px] font-black leading-tight px-4"
                            style={{ color: fullName ? '#0f172a' : 'rgba(0,0,0,0.15)', fontStyle: fullName ? 'normal' : 'italic' }}>
                            {fullName || 'Your Name'}
                          </motion.h3>
                          {/* Role */}
                          <p className="text-[11px] font-bold mt-0.5 mb-3"
                            style={{ color: 'var(--cp-primary)' }}>
                            Member
                          </p>
                        </div>

                        {/* ── Wave Swoosh Separator ── */}
                        <div className="relative h-[32px]" style={{ background: 'white' }}>
                          <svg viewBox="0 0 260 32" className="absolute top-0 left-0 w-full h-full" preserveAspectRatio="none">
                            {/* Accent wave (cyan) */}
                            <path d="M0,16 C35,4 75,30 130,10 C185,-4 225,22 260,8 L260,32 L0,32 Z"
                              fill="#00d2ff" opacity="0.35" />
                            {/* Violet wave */}
                            <path d="M0,20 C45,8 90,30 145,14 C195,2 235,24 260,12 L260,32 L0,32 Z"
                              fill="var(--cp-violet)" opacity="0.5" />
                            {/* Dark wave on top */}
                            <path d="M0,24 C55,12 105,30 165,16 C215,6 245,24 260,16 L260,32 L0,32 Z"
                              fill="#0f1629" />
                          </svg>
                        </div>

                        {/* ── Dark Bottom Section ── */}
                        <div className="relative px-5 pb-4 pt-3" style={{ background: '#0f1629' }}>

                          {/* Info grid */}
                          <div className="grid grid-cols-2 gap-x-4 gap-y-3 mb-3.5">
                            {[
                              { label: 'E-mail', value: email, placeholder: 'your@email.edu' },
                              { label: 'ID No.', value: '#WYA-0001', placeholder: null },
                              { label: 'Department', value: null, placeholder: 'Add me later' },
                              { label: 'Year', value: null, placeholder: 'Add me later' },
                            ].map(({ label, value, placeholder }) => (
                              <div key={label}>
                                <p className="text-[7px] font-bold uppercase tracking-[0.18em] mb-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{label}</p>
                                <p className="text-[10px] font-semibold truncate"
                                  style={{ color: value ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.25)', fontStyle: value ? 'normal' : 'italic' }}>
                                  {value ?? placeholder}
                                </p>
                              </div>
                            ))}
                          </div>

                          {/* Divider */}
                          <div className="w-full h-[1px] mb-3" style={{ background: 'rgba(255,255,255,0.08)' }} />

                          {/* Status badge */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <motion.div animate={{ scale: [1, 1.4, 1], opacity: [1, 0.7, 1] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                                className="w-[6px] h-[6px] rounded-full" style={{ background: step === 'otp' ? '#22c55e' : '#00d2ff', boxShadow: `0 0 12px ${step === 'otp' ? 'rgba(34,197,94,0.6)' : 'rgba(0,210,255,0.6)'}` }} />
                              <p className="text-[8px] font-bold uppercase tracking-[0.15em]" style={{ color: 'rgba(255,255,255,0.5)' }}>
                                {step === 'otp' ? 'Email Verified' : 'Pending Verification'}
                              </p>
                            </div>
                            <p className="text-[8px] font-mono" style={{ color: 'rgba(255,255,255,0.2)' }}>2025</p>
                          </div>

                          {/* Barcode */}
                          <div className="flex items-end gap-[1.5px] h-[24px] overflow-hidden justify-center">
                            {[2,1,3,1,2,1,1,3,1,2,1,1,2,3,1,2,1,3,1,1,2,1,2,1,3,1,2,1,1,3,1,2,1,2,3,1,1,2,1,3,1,2].map((w, i) => (
                              <div key={i} className="shrink-0 rounded-[0.5px]"
                                style={{ width: `${w * 1.2}px`, height: `${65 + (i % 5) * 7}%`, background: `rgba(255,255,255,${i % 8 === 0 ? 0.15 : 0.4})` }} />
                            ))}
                          </div>
                          <p className="text-[6px] font-mono text-center mt-1 tracking-[0.5em]" style={{ color: 'rgba(255,255,255,0.15)' }}>WYA 2025 0001</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </div>

            {/* Bottom Content Grouping */}
            <div className="relative z-30 mt-auto flex flex-col w-full">
              
              <div className="flex flex-col w-full max-w-sm self-end">
                {/* Header Text (Moved to bottom right) */}
                <div className="space-y-4 mb-8 text-right w-full">
                  <h2 className="font-headline font-black text-5xl tracking-tight leading-[0.9] text-white">
                    <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                      className="block" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.3)', color: 'transparent' }}>
                      Create
                    </motion.span>
                    <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                      className="block bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                      Account.
                    </motion.span>
                  </h2>
                </div>

                {/* Dots */}
                <div className="space-y-2 pb-6 flex flex-col items-end">
                {[
                  { dot: '#00E5FF', text: 'Live event tracking active' },
                  { dot: '#FF00CC', text: 'OTP-secured email access' },
                  { dot: '#5227FF', text: 'Google one-click login' },
                ].map((item, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex items-center gap-3 p-3 rounded-xl w-max backdrop-blur-md" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: item.dot }} />
                    <span className="text-white/40 text-[10px] font-semibold uppercase tracking-widest">{item.text}</span>
                  </motion.div>
                ))}
                </div>
              </div>

              {/* Footer */}
              <div className="pt-6 border-t border-white/10 flex justify-between relative z-30 shrink-0 w-full mt-4">
                <div><p className="text-white/20 text-[9px] uppercase tracking-[0.2em]">Platform</p><p className="text-white text-sm font-bold">W.Y.A</p></div>
                <div className="text-right"><p className="text-white/20 text-[9px] uppercase tracking-[0.2em]">Security</p><p className="text-sm font-bold" style={{ color: '#00E5FF' }}>OTP + OAuth</p></div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>


      {/* Error toast */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3.5 text-sm font-bold z-50 rounded-xl whitespace-nowrap"
            style={{ background: 'hsl(from var(--cp-accent) h s l / 0.15)', color: 'var(--cp-accent)', border: '1px solid hsl(from var(--cp-accent) h s l / 0.3)', backdropFilter: 'blur(12px)' }}>
            ⚠ {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
