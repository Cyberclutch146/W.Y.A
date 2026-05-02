"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Zap, Users, Calendar, Trophy } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { CountUp } from '@/components/CountUp';
import Folder from '@/components/Folder';
import ScrollVelocity from '@/components/ScrollVelocity';

const STATS = [
  { label: 'Active Events', value: 248, suffix: '+', icon: 'calendar_today', color: 'var(--color-primary-container-base)', onColor: 'var(--color-on-primary-container-base)' },
  { label: 'Students', value: 12, suffix: 'K+', icon: 'groups', color: 'var(--color-secondary-container-base)', onColor: 'var(--color-on-secondary-container-base)' },
  { label: 'Campus Clubs', value: 80, suffix: '+', icon: 'school', color: 'var(--color-tertiary-container-base)', onColor: 'var(--color-on-tertiary-container-base)' },
];

const FEATURES = [
  { icon: 'dashboard', title: 'Discovery Feed', desc: 'Browse personalized events based on your interests and clubs.', bg: 'var(--color-primary-container-base)', num: '01' },
  { icon: 'emoji_events', title: 'Earn Points', desc: 'RSVP, bring friends, and climb the campus leaderboard.', bg: 'var(--color-secondary-container-base)', num: '02' },
  { icon: 'add_circle', title: 'Host Events', desc: 'Create, promote, and manage campus events in minutes.', bg: 'var(--color-tertiary-container-base)', num: '03' },
];

const MARQUEE = ['🎸 Battle of the Bands', '🏆 Hackathon 2025', '🎨 Art Fest', '⚽ Inter-House Soccer', '🍕 Food Festival', '🎭 Drama Night', '💡 TEDx Talks', '🎮 Gaming Tournament'];

const TESTIMONIALS = [
  '"Best way to find free food on campus!" — Sarah T.',
  '"I met my co-founder at a hackathon I found here." — James K.',
  '"Finally, I know what\'s happening on weekends." — Priya R.',
  '"Got 500 XP just for showing up to the chess club." — Alex M.',
  '"The leaderboard is dangerously addictive." — Sam D.',
];

export default function LandingPage() {
  const { user, loading, loginAnonymously, loginWithGoogle } = useAuth();
  const router = useRouter();
  const [authLoading, setAuthLoading] = useState(false);

  const handleJoinUs = async (e: React.MouseEvent) => {
    if (user) { router.push('/home'); return; }
    e.preventDefault();
    setAuthLoading(true);
    try { await loginAnonymously(); router.push('/home'); }
    catch (err) { console.error('Failed to login anonymously:', err); setAuthLoading(false); }
  };

  const handleGoogleJoin = async () => {
    if (user) { router.push('/home'); return; }
    setAuthLoading(true);
    try {
      await loginWithGoogle();
      router.push('/home');
    } catch (err) {
      console.error('Failed to login with Google:', err);
      setAuthLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-on-background font-body relative overflow-x-hidden" style={{ background: 'var(--color-background-base)' }}>
      {/* NAVBAR */}
      <header className="relative z-50 flex items-center justify-between px-6 md:px-12 py-4 border-b-4 border-black" style={{ background: 'var(--color-surface-container-lowest-base)' }}>
        <Link href="/" className="group flex items-center gap-3">
          <span className="px-4 py-2 font-headline font-black text-lg uppercase tracking-tight border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:translate-x-[2px] group-hover:translate-y-[2px] group-hover:shadow-none transition-all duration-150" style={{ background: 'var(--color-primary-container-base)', color: 'var(--color-on-primary-container-base)' }}>CampusPulse</span>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {!user && !loading && (
            <Link href="/login" className="px-5 py-2.5 font-label font-bold text-sm uppercase tracking-wider border-4 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-150 text-on-surface">Login</Link>
          )}
          <button onClick={handleJoinUs} disabled={authLoading || loading} className="px-6 py-2.5 font-label font-black text-sm uppercase tracking-wider border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-150 disabled:opacity-60" style={{ background: 'var(--color-primary-container-base)', color: 'var(--color-on-primary-container-base)' }}>
            {authLoading ? 'Loading...' : user ? 'Open App →' : 'Join Free →'}
          </button>
        </div>
      </header>

      {/* HERO */}
      <section className="relative z-10 min-h-[88vh] grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-0">
        <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, ease: 'easeOut' }} className="flex flex-col justify-center px-8 md:px-14 lg:px-20 py-16">
          <span className="inline-flex items-center gap-2 px-4 py-2 text-[11px] font-label font-bold uppercase tracking-[0.2em] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-fit mb-8" style={{ background: 'var(--color-secondary-container-base)', color: 'var(--color-on-secondary-container-base)' }}>
            <Zap size={13} /> Student Event Intelligence
          </span>
          <h1 className="font-headline font-black text-5xl md:text-7xl lg:text-[88px] leading-[0.95] uppercase tracking-tighter text-on-background mb-8">
            Your Campus,<br />
            <span className="px-4 pb-1 inline-block border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] skew-x-[-2deg]" style={{ background: 'var(--pop-acid-lime)', color: 'black' }}>Alive.</span>
          </h1>
          <p className="text-on-surface-variant text-base md:text-lg leading-relaxed max-w-md mb-10">Discover events, RSVP in one tap, earn points for showing up, and own your campus social life.</p>
          <div className="flex flex-wrap items-center gap-4 mb-12">
            <div className="relative group">
              <div className="absolute -inset-1 bg-[image:var(--gradient-party)] blur-md opacity-70 group-hover:opacity-100 transition duration-200 animate-gradient-xy"></div>
              <button onClick={handleJoinUs} disabled={authLoading || loading} className="relative flex items-center gap-3 px-8 py-4 font-label font-black text-base uppercase tracking-wider border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all duration-150 disabled:opacity-60" style={{ background: 'var(--color-primary-container-base)', color: 'var(--color-on-primary-container-base)' }}>
                {authLoading ? 'Joining...' : user ? 'Go to Home' : 'Get Started'} <ArrowRight size={18} />
              </button>
            </div>
            {!user && !loading && (
              <>
                <Link href="/login" className="flex items-center gap-2 px-8 py-4 font-label font-bold text-sm uppercase tracking-wider border-4 border-black hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-150 text-on-surface">Sign In</Link>
                <button 
                  onClick={handleGoogleJoin} 
                  disabled={authLoading || loading}
                  className="flex items-center gap-3 px-8 py-4 font-label font-bold text-sm uppercase tracking-wider border-4 border-black hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-150 text-on-surface disabled:opacity-60 bg-white"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Google
                </button>
              </>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            {STATS.map((s, i) => (
              <motion.div 
                key={s.label} 
                className="flex items-center gap-2 px-4 py-2 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer" 
                style={{ background: s.color, color: s.onColor }}
                whileHover={{ scale: 1.05, rotate: i % 2 === 0 ? 3 : -3 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
                <CountUp to={s.value as number} suffix={s.suffix} className="font-headline font-black text-sm" />
                <span className="font-label text-[11px] uppercase font-bold opacity-75">{s.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right collage panel */}
        <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="relative hidden lg:flex flex-col border-l-4 border-black overflow-hidden">
          <div className="flex-1 relative overflow-hidden border-b-4 border-black p-6 flex flex-col justify-between" style={{ background: 'var(--color-primary-container-base)' }}>
            <div>
              <p className="font-headline font-black text-xs uppercase tracking-[0.2em] opacity-60 mb-1">Now Trending</p>
              <p className="font-headline font-black text-2xl uppercase">Battle of the Bands 🎸</p>
              <p className="font-body text-sm text-on-surface-variant mt-1">Main Auditorium · Fri 8 PM</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 w-fit border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" style={{ background: 'var(--color-secondary-container-base)', color: 'var(--color-on-secondary-container-base)' }}>
              <Trophy size={16} /><span className="font-label font-black text-sm uppercase">+50 XP</span>
            </div>
          </div>
          <div className="flex-1 relative overflow-hidden border-b-4 border-black p-6 flex flex-col justify-between" style={{ background: 'var(--color-secondary-container-base)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center border-4 border-black" style={{ background: 'var(--color-tertiary-container-base)' }}>
                <Users size={18} />
              </div>
              <div>
                <p className="font-headline font-black text-sm uppercase">234 Students RSVP'd</p>
                <p className="font-body text-xs text-on-surface-variant">Hackathon 2025</p>
              </div>
            </div>
            <div className="h-3 w-full border-4 border-black overflow-hidden" style={{ background: 'var(--color-surface-container-lowest-base)' }}>
              <div className="h-full" style={{ width: '72%', background: 'var(--color-on-secondary-container-base)' }} />
            </div>
          </div>
          <div className="flex-1 relative overflow-hidden p-6" style={{ background: 'var(--color-tertiary-container-base)' }}>
            <p className="font-headline font-black text-xs uppercase tracking-[0.2em] mb-3">This Week</p>
            {['🎨 Art Fest', '⚽ Soccer Finals', '🍕 Food Carnival'].map((item) => (
              <div key={item} className="flex items-center gap-2 mb-2"><Calendar size={12} /><span className="font-body text-sm">{item}</span></div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* MARQUEE */}
      <div className="relative z-10 border-y-4 border-black overflow-hidden flex flex-col bg-black">
        <div className="w-full" style={{ background: 'var(--pop-acid-lime)' }}>
          <ScrollVelocity 
            texts={[MARQUEE.join(' ◆ ')]} 
            velocity={50} 
            className="font-headline font-black text-sm md:text-lg uppercase tracking-widest px-2 text-black" 
            parallaxClassName="parallax py-4"
            scrollerClassName="scroller"
            numCopies={4}
          />
        </div>
        <div className="w-full border-t-4 border-black" style={{ background: 'var(--pop-electric-purple)' }}>
          <ScrollVelocity 
            texts={[TESTIMONIALS.join(' ★ ')]} 
            velocity={-50} 
            className="font-headline font-black text-sm md:text-lg uppercase tracking-widest px-2 text-black" 
            parallaxClassName="parallax py-4"
            scrollerClassName="scroller"
            numCopies={4}
          />
        </div>
      </div>

      {/* FEATURES */}
      <section className="relative z-10 py-24 px-8 md:px-14 lg:px-20 max-w-7xl mx-auto">
        <div className="mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 text-[11px] font-label font-bold uppercase tracking-[0.2em] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-6" style={{ background: 'var(--color-tertiary-container-base)', color: 'var(--color-on-tertiary-container-base)' }}>How It Works</div>
          <h2 className="font-headline font-black text-4xl md:text-6xl uppercase tracking-tight text-on-background leading-tight max-w-2xl">
            Everything you need to<br /><span style={{ color: 'var(--color-primary-container-base)', WebkitTextStroke: '2px black' }}>dominate campus life</span>
          </h2>
        </div>
        <div className="flex justify-center items-center py-32 border-4 border-black bg-[var(--color-surface-container-lowest-base)]">
          <Folder 
            color="var(--pop-electric-purple)"
            size={1}
            items={FEATURES.map((f, i) => (
              <div key={f.num} className="w-full h-full border-2 border-black flex flex-col p-5" style={{ background: f.bg }}>
                <span className="material-symbols-outlined text-[32px] text-black mb-3" style={{ fontVariationSettings: "'FILL' 1" }}>{f.icon}</span>
                <h3 className="font-headline font-black text-lg md:text-xl uppercase text-black leading-tight mb-2">{f.title}</h3>
                <p className="font-body text-sm md:text-base leading-[1.4] text-black/80">{f.desc}</p>
              </div>
            ))}
          />
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 border-y-4 border-black py-24 px-8 md:px-14 overflow-hidden" style={{ background: 'var(--pop-hot-pink)' }}>
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(45deg, black 0px, black 2px, transparent 2px, transparent 12px)' }} />
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-12">
          <div>
            <p className="font-label font-bold text-[11px] uppercase tracking-[0.2em] text-on-surface/60 mb-4">Ready to plug in?</p>
            <h2 className="font-headline font-black text-4xl md:text-6xl uppercase leading-tight tracking-tight text-on-surface">Your campus is calling.<br />Answer it.</h2>
          </div>
          <div className="flex flex-col gap-4 min-w-[220px]">
            <button onClick={handleJoinUs} disabled={authLoading || loading} className="flex items-center justify-center gap-3 px-8 py-5 font-label font-black text-base uppercase tracking-wider border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all duration-150 disabled:opacity-60" style={{ background: 'var(--color-on-primary-container-base)', color: 'var(--color-primary-container-base)' }}>
              {authLoading ? 'Joining...' : user ? 'Go to Home' : 'Join Free'} <ArrowRight size={18} />
            </button>
            {!user && !loading && (
              <>
                <button 
                  onClick={handleGoogleJoin} 
                  disabled={authLoading || loading}
                  className="flex items-center justify-center gap-3 px-8 py-5 font-label font-bold text-sm uppercase tracking-wider border-4 border-black hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-150 text-on-surface disabled:opacity-60 bg-white"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Sign in with Google
                </button>
                <Link href="/login" className="flex items-center justify-center gap-2 px-8 py-5 font-label font-bold text-sm uppercase tracking-wider border-4 border-black hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-150 text-on-surface">Already have an account?</Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t-4 border-black py-8 px-8 md:px-14 flex flex-col md:flex-row items-center justify-between gap-4" style={{ background: 'var(--color-surface-container-lowest-base)' }}>
        <p className="font-headline font-black text-sm uppercase tracking-wider text-on-surface">CampusPulse © 2025</p>
        <div className="flex gap-6">
          <Link href="/about" className="font-label text-xs uppercase font-bold tracking-wider text-on-surface-variant hover:text-on-surface transition-colors">About</Link>
          <Link href="/login" className="font-label text-xs uppercase font-bold tracking-wider text-on-surface-variant hover:text-on-surface transition-colors">Login</Link>
        </div>
      </footer>

      <style>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes marquee-reverse { 0% { transform: translateX(-50%); } 100% { transform: translateX(0); } }
        .animate-marquee { animation: marquee 28s linear infinite; }
        .animate-marquee-reverse { animation: marquee-reverse 35s linear infinite; }
      `}</style>
    </div>
  );
}
