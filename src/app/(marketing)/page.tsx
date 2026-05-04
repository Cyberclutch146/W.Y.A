"use client";

import React, { useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Zap, Users, Calendar, Sparkles, MapPin, Trophy, ChevronRight, Compass, ShieldCheck } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { CountUp } from '@/components/CountUp';
import LiquidEther from '@/components/LiquidEther';
import ScrollVelocity from '@/components/ScrollVelocity';

// ── Hero Visual Options ──
// Uncomment ONE of these to swap the hero right-side visual:
import HeroVisual from '@/components/hero/HeroFloatingEcosystem';   // Option 1: Floating Ecosystem
//import HeroVisual from '@/components/hero/HeroPulseOrb';          // Option 2: Pulse Orb
//import HeroVisual from '@/components/hero/HeroInfiniteStream';    // Option 3: Infinite Stream
//import HeroVisual from '@/components/hero/HeroDashboardMockup';   // Option 4: Dashboard Mockup

const STATS = [
  { label: 'Active Events', value: 248, suffix: '+', icon: <Calendar size={20}/>, iconStyle: { color: 'var(--cp-primary)' } },
  { label: 'Students', value: 12, suffix: 'K+', icon: <Users size={20}/>, iconStyle: { color: 'var(--cp-accent)' } },
  { label: 'Campus Clubs', value: 80, suffix: '+', icon: <Compass size={20}/>, iconStyle: { color: 'var(--cp-secondary)' } },
];

const FEATURES = [
  { iconStyle: { color: 'var(--cp-primary)' }, Icon: Compass, title: 'Discovery Feed', desc: 'Browse personalized events based on your interests and clubs. AI-driven recommendations tailored for your campus journey.', span: 'md:col-span-2' },
  { iconStyle: { color: 'var(--cp-violet)' }, Icon: Trophy, title: 'Earn Points', desc: 'RSVP, bring friends, and climb the campus leaderboard.', span: 'md:col-span-1' },
  { iconStyle: { color: 'var(--cp-secondary)' }, Icon: Sparkles, title: 'Host Events', desc: 'Create, promote, and manage campus events in minutes with our intuitive builder.', span: 'md:col-span-1' },
  { iconStyle: { color: 'var(--cp-accent)' }, Icon: ShieldCheck, title: 'Verified Access', desc: 'Secure student-only access ensuring a safe, authentic, and vibrant campus community.', span: 'md:col-span-2' },
];

const MARQUEE = ['Battle of the Bands', 'Hackathon 2025', 'Art Fest', 'Inter-House Soccer', 'Food Festival', 'Drama Night', 'TEDx Talks', 'Gaming Tournament', 'Startup Pitch Night', 'Open Mic'];

const TESTIMONIALS = [
  { quote: 'I found my startup co-founder at a hackathon here.', name: 'James K.', role: 'CS Senior' },
  { quote: 'Went from zero campus friends to a full squad in two weeks.', name: 'Priya R.', role: 'First Year' },
  { quote: 'The only app that actually tells me what is happening this weekend.', name: 'Marcus L.', role: 'Engineering Junior' },
  { quote: 'I earned 2,000 XP in a month just by showing up to events.', name: 'Alex M.', role: 'Club President' },
  { quote: 'Posting our event here tripled our attendance overnight.', name: 'Sam D.', role: 'Society Lead' },
  { quote: 'The leaderboard made me competitive about attending lectures.', name: 'Nadia C.', role: 'Biology Sophomore' },
];

export default function LandingPage() {
  const { user, loading, loginAnonymously, loginWithGoogle } = useAuth();
  const router = useRouter();
  const [authLoading, setAuthLoading] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

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
    <div className="min-h-screen bg-background text-foreground font-body relative overflow-x-hidden selection:bg-primary/30 selection:text-primary">
      {/* NAVBAR */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 transition-all duration-300 glass-panel border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="group flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-tertiary flex items-center justify-center text-white font-bold shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform">
              <Zap size={18} fill="currentColor" />
            </div>
            <span className="font-headline font-bold text-xl tracking-tight">CampusPulse</span>
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {!user && !loading && (
              <Link href="/login" className="hidden md:block px-4 py-2 font-label font-medium text-sm text-on-surface/80 hover:text-on-surface transition-colors">
                Log in
              </Link>
            )}
            <button onClick={handleJoinUs} disabled={authLoading || loading} className="btn-primary px-6 py-2.5 text-sm">
              {authLoading ? 'Loading...' : user ? 'Open App' : 'Get Started'}
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section ref={heroRef} className="relative min-h-[100svh] flex items-center pt-20 overflow-hidden">
        {/* Animated Background */}
        <motion.div style={{ y: yBg }} className="absolute inset-0 z-0 opacity-40 dark:opacity-60 mix-blend-screen">
          <LiquidEther
            colors={['#6366f1', '#a855f7', '#ec4899']}
            mouseForce={15}
            cursorSize={120}
            isViscous
            viscous={40}
            iterationsViscous={32}
            iterationsPoisson={32}
            resolution={0.5}
            isBounce={false}
            autoDemo
            autoSpeed={0.3}
            autoIntensity={1.5}
          />
        </motion.div>
        
        {/* Deep dark gradient overlay for text readability */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-background/40 via-background/60 to-background pointer-events-none" />

        <div className="max-w-7xl mx-auto w-full px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div style={{ opacity }} className="flex flex-col items-start py-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel border border-primary/20 bg-primary/5 text-primary mb-8"
            >
              <Sparkles size={14} />
              <span className="text-xs font-semibold uppercase tracking-wider">The Ultimate Campus Network</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="font-headline text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6"
            >
              Elevate Your <br />
              <span className="premium-gradient-text">Campus Experience.</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-lg sm:text-xl text-on-surface-variant max-w-lg mb-10 leading-relaxed"
            >
              Discover underground events, RSVP with one tap, earn rewards for showing up, and own your social life in a beautifully curated ecosystem.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
            >
              <button onClick={handleJoinUs} disabled={authLoading || loading} className="btn-primary w-full sm:w-auto px-8 py-4 text-base">
                {authLoading ? 'Joining...' : user ? 'Enter Dashboard' : 'Start Exploring'}
                <ArrowRight size={18} />
              </button>
              
              {!user && !loading && (
                <button onClick={handleGoogleJoin} disabled={authLoading || loading} className="btn-secondary w-full sm:w-auto px-8 py-4 text-base">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </button>
              )}
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-6 mt-12 pt-8 w-full"
              style={{ borderTop: '1px solid var(--cp-border)' }}
            >
              {STATS.map((stat, i) => (
                <div key={i} className="flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <span style={stat.iconStyle}>{stat.icon}</span>
                    <CountUp to={stat.value as number} suffix={stat.suffix} className="font-headline font-bold text-2xl" />
                  </div>
                  <span className="text-xs uppercase tracking-wider font-medium" style={{ color: 'var(--cp-text-3)' }}>{stat.label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* ─── Hero Visual (swap component to try different options) ─── */}
          <HeroVisual />
        </div>
      </section>

      {/* MARQUEE */}
      <section className="relative z-20 py-6 overflow-hidden" style={{ borderTop: '1px solid var(--cp-border)', borderBottom: '1px solid var(--cp-border)', background: 'var(--cp-surface-dim)' }}>
        <div className="flex items-center gap-10 animate-marquee-x whitespace-nowrap">
          {[...MARQUEE, ...MARQUEE, ...MARQUEE].map((item, i) => (
            <span key={i} className="font-headline font-bold text-2xl md:text-3xl shrink-0 uppercase tracking-tight"
              style={{ color: i % 3 === 0 ? 'var(--cp-primary)' : i % 3 === 1 ? 'var(--cp-text-1)' : 'var(--cp-text-3)' }}>
              {item}
              <span className="mx-5" style={{ color: 'var(--cp-border)' }}>·</span>
            </span>
          ))}
        </div>
      </section>

      {/* BENTO GRID FEATURES */}
      <section className="relative z-10 py-32 px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-20 max-w-2xl mx-auto">
          <h2 className="font-headline text-4xl md:text-5xl font-bold mb-6">Designed for the <br/> <span className="premium-gradient-text">Modern Student</span></h2>
          <p className="text-lg" style={{ color: 'var(--cp-text-2)' }}>Everything you need to navigate campus life, neatly organized in a seamless and beautiful interface.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`glass-panel p-8 rounded-3xl premium-card-hover ${feature.span} group relative overflow-hidden`}
            >

              
              <div className="mb-6 inline-flex p-4 rounded-2xl"
                style={{ background: 'var(--cp-surface-dim)', border: '1px solid var(--cp-border)' }}>
                <feature.Icon className="w-8 h-8" style={feature.iconStyle} />
              </div>
              <h3 className="text-2xl font-bold mb-3" style={{ color: 'var(--cp-text-1)' }}>{feature.title}</h3>
              <p className="leading-relaxed max-w-md" style={{ color: 'var(--cp-text-2)' }}>{feature.desc}</p>
              
              <div className="mt-8 flex items-center font-semibold text-sm gap-2 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
                style={{ color: 'var(--cp-primary)' }}>
                Learn more <ChevronRight size={16} />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-headline text-4xl md:text-5xl font-bold mb-4">Trusted by <span className="premium-gradient-text">real students</span></h2>
            <p className="text-base" style={{ color: 'var(--cp-text-2)' }}>From freshers to final years — here's what the campus is saying.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="glass-panel rounded-2xl p-6 flex flex-col gap-4"
              >
                <p className="text-lg font-medium leading-snug" style={{ color: 'var(--cp-text-1)' }}>
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-auto pt-4 flex flex-col" style={{ borderTop: '1px solid var(--cp-border)' }}>
                  <span className="font-bold text-sm" style={{ color: 'var(--cp-text-1)' }}>{t.name}</span>
                  <span className="text-xs" style={{ color: 'var(--cp-text-3)' }}>{t.role}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="relative z-20 py-32 px-6 lg:px-8">
        <div className="max-w-5xl mx-auto rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden glass-panel border border-primary/20 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-tertiary/10" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-[400px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="relative z-10">
            <h2 className="font-headline text-5xl md:text-7xl font-bold tracking-tight mb-8">
              Ready to <span className="premium-gradient-text">Plug In?</span>
            </h2>
            <p className="text-xl text-on-surface-variant max-w-2xl mx-auto mb-12">
              Join thousands of students who are already discovering the best events, building communities, and earning rewards.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={handleJoinUs} 
                disabled={authLoading || loading} 
                className="btn-primary px-10 py-5 text-lg w-full sm:w-auto"
              >
                {authLoading ? 'Connecting...' : 'Join The Pulse'} <Zap size={20} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-6 lg:px-8 mt-20 relative z-10" style={{ borderTop: '1px solid var(--cp-border)', background: 'var(--cp-bg)' }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Zap size={20} style={{ color: 'var(--cp-primary)' }} />
            <span className="font-headline font-bold text-lg">CampusPulse</span>
          </div>
          <p className="text-sm" style={{ color: 'var(--cp-text-3)' }}>© 2026 CampusPulse. All rights reserved.</p>
          <div className="flex gap-8">
            {[['About', '/about'], ['Privacy', '/terms'], ['Login', '/login']].map(([label, href]) => (
              <Link key={href} href={href} className="text-sm font-medium transition-colors" style={{ color: 'var(--cp-text-2)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--cp-primary)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--cp-text-2)'; }}
              >{label}</Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
