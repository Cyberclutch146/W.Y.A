"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Shield, Loader2, ArrowLeft, Mail, Lock, ChevronRight, RotateCcw } from 'lucide-react';

type Tab = 'google' | 'email';
type EmailStep = 'credentials' | 'otp';

export default function LoginPage() {
  const [tab, setTab] = useState<Tab>('google');
  const [emailStep, setEmailStep] = useState<EmailStep>('credentials');

  // Credentials
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // OTP
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, loginWithGoogle, user, isOtpVerified, setOtpVerified } = useAuth();
  const router = useRouter();

  // Redirect to home only if user is logged in AND verified
  useEffect(() => { 
    if (user && isOtpVerified) {
      router.replace('/home'); 
    } 
  }, [user, isOtpVerified, router]);

  // If already logged in but not verified, skip to OTP step and send code
  useEffect(() => {
    if (user && !isOtpVerified && emailStep !== 'otp' && !loading) {
      setEmail(user.email || '');
      setEmailStep('otp');
      setTab('email');
      // Fire-and-forget: send the code immediately
      sendOtp().catch(err => setError(err.message));
      setResendCooldown(60);
    }
  }, [user, isOtpVerified, emailStep, loading]);

  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(''), 6000);
    return () => clearTimeout(t);
  }, [error]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown(c => c - 1), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  // ── Google ────────────────────────────────────────────────
  const handleGoogleSignIn = async () => {
    setError(''); setLoading(true);
    try {
      await loginWithGoogle();
      router.replace('/home');
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user' && err?.code !== 'auth/cancelled-popup-request') {
        setError(err.message || 'Google sign-in failed');
      }
    } finally { setLoading(false); }
  };

  // ── Email step 1: sign in + send OTP ────────────────────
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(email, password);
      // Fire OTP
      await sendOtp();
      setEmailStep('otp');
      setResendCooldown(60);
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally { setLoading(false); }
  };

  const sendOtp = async () => {
    const res = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const d = await res.json();
      throw new Error(d.error || 'Failed to send OTP');
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError('');
    try {
      await sendOtp();
      setResendCooldown(60);
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err.message || 'Failed to resend');
    }
  };

  // ── OTP digit input ─────────────────────────────────────
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      otpRefs.current[5]?.focus();
    }
    e.preventDefault();
  };

  // ── OTP verify ──────────────────────────────────────────
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
      
      // Mark as verified in context
      setOtpVerified(true);
      router.replace('/home');
    } catch {
      setError('Something went wrong');
    } finally { setOtpLoading(false); }
  };

  // ── Shared left panel ────────────────────────────────────
  const LeftPanel = (
    <div className="relative hidden md:flex flex-col overflow-hidden" style={{ background: '#0a0a0a' }}>
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 w-full h-full opacity-60"
          style={{
            background: "radial-gradient(circle at 20% 0%, #5227FF 0%, transparent 50%), radial-gradient(circle at 80% 100%, #00E5FF 0%, transparent 50%), radial-gradient(circle at 50% 50%, #FF00CC 0%, transparent 60%)",
            filter: "blur(60px)",
            transform: "scale(1.2)"
          }}
        />
      </div>
      <div className="relative z-20 flex-1 p-10 flex flex-col justify-between pointer-events-none [&>*]:pointer-events-auto">
        <div className="space-y-6">
          <motion.div initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex items-center gap-3">
            <div className="w-10 h-[2px] rounded-full bg-white/40" />
            <span className="text-white/50 text-[10px] font-bold uppercase tracking-[0.3em]">Campus Pulse</span>
          </motion.div>
          <h2 className="font-headline font-black text-6xl tracking-tight leading-[0.9] text-white">
            <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="block" style={{ WebkitTextStroke: '1.5px rgba(255,255,255,0.3)', color: 'transparent' }}>
              Welcome
            </motion.span>
            <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="block bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
              Back.
            </motion.span>
          </h2>
        </div>

        <div className="space-y-2">
          {[
            { dot: '#00E5FF', text: 'Live event tracking active' },
            { dot: '#FF00CC', text: 'OTP-secured email access' },
            { dot: '#5227FF', text: 'Google one-click login' },
          ].map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
              className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: item.dot }} />
              <span className="text-white/40 text-[10px] font-semibold uppercase tracking-widest">{item.text}</span>
            </motion.div>
          ))}
        </div>

        <div className="pt-6 border-t border-white/10 flex justify-between">
          <div><p className="text-white/20 text-[9px] uppercase tracking-[0.2em]">Platform</p><p className="text-white text-sm font-bold">W.Y.A</p></div>
          <div className="text-right"><p className="text-white/20 text-[9px] uppercase tracking-[0.2em]">Security</p><p className="text-sm font-bold" style={{ color: '#00E5FF' }}>OTP + OAuth</p></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6 relative" style={{ background: 'var(--cp-bg)' }}>
      <div className="fixed inset-0 pointer-events-none z-0" style={{ background: 'radial-gradient(circle at 30% 20%, hsl(from var(--cp-primary) h s l / 0.04) 0%, transparent 60%), radial-gradient(circle at 80% 80%, hsl(from var(--cp-violet) h s l / 0.04) 0%, transparent 60%)' }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 overflow-hidden"
        style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border)', borderRadius: 'var(--r-2xl)', boxShadow: '0 25px 80px -12px rgba(0,0,0,0.25)' }}
      >
        {LeftPanel}

        {/* Right — Auth */}
        <div className="flex flex-col justify-center p-8 md:p-10 lg:p-14">
          <Link href="/" className="mb-6 inline-flex items-center gap-2 text-xs font-semibold hover:gap-3 transition-all" style={{ color: 'var(--cp-text-3)' }}>
            <ArrowLeft size={13} /> Back to homepage
          </Link>

          {/* Tab switcher */}
          <div className="inline-flex gap-1 p-1 rounded-xl mb-6 w-fit" style={{ background: 'var(--cp-surface-dim)', border: '1px solid var(--cp-border)' }}>
            {(['google', 'email'] as Tab[]).map(t => (
              <button key={t} onClick={() => { setTab(t); setEmailStep('credentials'); setError(''); setOtp(['','','','','','']); }}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg text-xs font-bold transition-all"
                style={{ width: '100px', padding: '8px 0', background: tab === t ? 'var(--cp-surface)' : 'transparent', color: tab === t ? 'var(--cp-text-1)' : 'var(--cp-text-3)', boxShadow: tab === t ? '0 2px 8px rgba(0,0,0,0.15)' : 'none' }}
              >
                {t === 'google' ? (<><svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg> Google</>) : (<><Mail size={13} /> Email</>)}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* ── Google tab ── */}
            {tab === 'google' && (
              <motion.div key="google" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.2 }}>
                <h1 className="font-headline font-bold text-3xl md:text-4xl tracking-tight leading-tight mb-2" style={{ color: 'var(--cp-text-1)' }}>
                  Sign in with<br />
                  <span className="inline-block mt-1 px-2.5 py-1 rounded-lg" style={{ background: 'linear-gradient(135deg, #4285F4, #34A853)', color: 'white' }}>Google</span>
                </h1>
                <p className="text-sm mb-6 leading-relaxed max-w-[340px]" style={{ color: 'var(--cp-text-3)' }}>One tap, instant access. Your Google account is all you need.</p>

                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleGoogleSignIn} disabled={loading}
                  className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl text-sm font-bold transition-all disabled:opacity-60"
                  style={{ background: 'var(--cp-surface-dim)', border: '1.5px solid var(--cp-border)', color: 'var(--cp-text-1)' }}
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : (
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  )}
                  <span>{loading ? 'Signing in...' : 'Continue with Google'}</span>
                </motion.button>

                {/* Separator */}
                <div className="flex items-center gap-3 my-5" style={{ color: 'var(--cp-text-3)' }}>
                  <div className="flex-1 h-px" style={{ background: 'var(--cp-border)' }} />
                  <span className="text-[10px] font-semibold uppercase tracking-wider">or use email</span>
                  <div className="flex-1 h-px" style={{ background: 'var(--cp-border)' }} />
                </div>

                <button type="button" onClick={() => { setTab('email'); setError(''); }}
                  className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl text-sm font-semibold transition-all hover:opacity-80"
                  style={{ background: 'transparent', border: '1.5px solid var(--cp-border)', color: 'var(--cp-text-2)' }}>
                  <Mail size={16} /> Sign in with Email & OTP
                </button>

                <p className="mt-6 text-center text-xs" style={{ color: 'var(--cp-text-3)' }}>
                  Don&apos;t have an account?{' '}
                  <Link href="/register" className="font-bold underline underline-offset-2" style={{ color: 'var(--cp-primary)' }}>Register</Link>
                </p>
              </motion.div>
            )}

            {/* ── Email tab — Credentials step ── */}
            {tab === 'email' && emailStep === 'credentials' && (
              <motion.div key="email-creds" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.2 }}>
                <h1 className="font-headline font-bold text-3xl md:text-4xl tracking-tight leading-tight mb-2" style={{ color: 'var(--cp-text-1)' }}>
                  Sign in with<br />
                  <span className="inline-block mt-1 px-2.5 py-1 rounded-lg" style={{ background: 'linear-gradient(135deg, var(--cp-primary), var(--cp-violet))', color: 'white' }}>Email</span>
                </h1>
                <p className="text-sm mb-6 leading-relaxed max-w-[340px]" style={{ color: 'var(--cp-text-3)' }}>Enter your credentials — we&apos;ll send a verification code to your inbox.</p>

                <form onSubmit={handleEmailSubmit} className="flex flex-col gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--cp-text-2)' }}>Email</label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--cp-text-3)' }} />
                      <input className="input-base" style={{ paddingLeft: '2.75rem' }} type="email" placeholder="you@campus.edu" value={email}
                        onChange={e => setEmail(e.target.value)} disabled={loading} required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--cp-text-2)' }}>Password</label>
                    <div className="relative">
                      <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--cp-text-3)' }} />
                      <input className="input-base" style={{ paddingLeft: '2.75rem' }} type="password" placeholder="••••••••" value={password}
                        onChange={e => setPassword(e.target.value)} disabled={loading} required />
                    </div>
                  </div>

                  <button type="submit" disabled={loading}
                    className="btn-primary w-full justify-center py-3.5 text-sm mt-1 disabled:opacity-50 flex items-center gap-2">
                    {loading ? <><Loader2 size={15} className="animate-spin" /> Sending code...</> : <>Continue <ChevronRight size={15} /></>}
                  </button>
                </form>

                <p className="mt-5 text-center text-xs" style={{ color: 'var(--cp-text-3)' }}>
                  Don&apos;t have an account?{' '}
                  <Link href="/register" className="font-bold underline underline-offset-2" style={{ color: 'var(--cp-primary)' }}>Register</Link>
                </p>
              </motion.div>
            )}

            {/* ── Email tab — OTP step ── */}
            {tab === 'email' && emailStep === 'otp' && (
              <motion.div key="email-otp" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.2 }}>
                <h1 className="font-headline font-bold text-3xl md:text-4xl tracking-tight leading-tight mb-2" style={{ color: 'var(--cp-text-1)' }}>
                  Check your<br />
                  <span className="inline-block mt-1 px-2.5 py-1 rounded-lg" style={{ background: 'linear-gradient(135deg, var(--cp-primary), var(--cp-accent))', color: 'white' }}>Inbox</span>
                </h1>
                <p className="text-sm mb-1.5 leading-relaxed" style={{ color: 'var(--cp-text-3)' }}>
                  We sent a 6-digit code to
                </p>
                <p className="text-sm font-bold mb-6" style={{ color: 'var(--cp-text-1)' }}>{email}</p>

                <form onSubmit={handleOtpVerify} className="flex flex-col gap-5">
                  {/* OTP Boxes */}
                  <div className="flex gap-2.5 justify-between" onPaste={handleOtpPaste}>
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={el => { otpRefs.current[i] = el; }}
                        type="text" inputMode="numeric" maxLength={1} value={digit}
                        onChange={e => handleOtpChange(i, e.target.value)}
                        onKeyDown={e => handleOtpKeyDown(i, e)}
                        className="w-full aspect-square max-w-[52px] text-center text-2xl font-black rounded-xl transition-all outline-none focus:ring-2"
                        style={{
                          background: digit ? 'hsl(from var(--cp-primary) h s l / 0.08)' : 'var(--cp-surface-dim)',
                          border: `2px solid ${digit ? 'var(--cp-primary)' : 'var(--cp-border)'}`,
                          color: 'var(--cp-text-1)',
                        }}
                      />
                    ))}
                  </div>

                  <button type="submit" disabled={otpLoading || otp.join('').length < 6}
                    className="btn-primary w-full justify-center py-3.5 text-sm disabled:opacity-50 flex items-center gap-2">
                    {otpLoading ? <><Loader2 size={15} className="animate-spin" /> Verifying...</> : 'Verify & Sign In'}
                  </button>
                </form>

                <div className="mt-4 flex items-center justify-between text-xs">
                  <button onClick={() => { setEmailStep('credentials'); setOtp(['','','','','','']); setError(''); }}
                    className="flex items-center gap-1.5 font-semibold hover:opacity-80 transition-opacity" style={{ color: 'var(--cp-text-3)' }}>
                    <ArrowLeft size={12} /> Change email
                  </button>
                  <button onClick={handleResend} disabled={resendCooldown > 0}
                    className="flex items-center gap-1.5 font-bold disabled:opacity-40 hover:opacity-80 transition-opacity"
                    style={{ color: 'var(--cp-primary)' }}>
                    <RotateCcw size={12} />
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
