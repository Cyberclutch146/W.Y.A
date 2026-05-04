"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Zap, Users, Calendar, Sparkles, MapPin, Trophy, ChevronRight, Compass, ShieldCheck, Clock, Flame, TrendingUp, Star } from 'lucide-react';
import { getEvents } from "@/services/eventService";
import { getGlobalLeaderboard, getLeaderboardStats, LeaderboardEntry } from "@/services/userService";
import { CommunityEvent } from "@/types";
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { CountUp } from '@/components/CountUp';
import ScrollVelocity from '@/components/ScrollVelocity';
import Orb from '@/components/Orb';
import StaggeredMenu from '@/components/StaggeredMenu';

import { ThemeToggle } from '@/components/ThemeToggle';
import { useTheme } from 'next-themes';

// Merged HeroVisual directly into page
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
  const { user, loading, loginWithGoogle } = useAuth();
  const router = useRouter();
  const { resolvedTheme } = useTheme();
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
    router.push('/register');
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
      {/* STAGGERED MENU OVERLAY */}
      <StaggeredMenu
        isFixed
        position="right"
        colors={['#1a1a2e', '#6366f1', '#a855f7']}
        accentColor="#a855f7"
        panelBg="#0f0f1a"
        menuButtonColor={resolvedTheme === 'light' ? '#0f0f14' : '#f8f8fb'}
        openMenuButtonColor="#fff"
        rightElement={<ThemeToggle />}
        items={[
          { label: 'Home', ariaLabel: 'Go to Home', link: '/home', onClick: () => router.push('/home') },
          { label: 'Events', ariaLabel: 'Browse Events', link: '/home', onClick: () => router.push('/home') },
          { label: 'About', ariaLabel: 'About W.Y.A', link: '/about', onClick: () => router.push('/about') },
          { label: 'Login', ariaLabel: 'Log in', link: '/login', onClick: () => router.push('/login') },
        ]}
        socialItems={[
          { label: 'GitHub', link: '#' },
          { label: 'Twitter', link: '#' },
        ]}
      />

      {/* HERO SECTION */}
      <section ref={heroRef} className="relative min-h-[100svh] flex items-center pt-10 pb-20 overflow-hidden">
        {/* Chaotic Collage Background */}
        <motion.div style={{ y: yBg }} className="absolute inset-0 z-0 opacity-50 dark:opacity-70">
          <Image 
            src="/chaotic_collage_bg.png" 
            alt="Chaotic Campus Collage" 
            fill 
            className="object-cover object-center"
            priority
          />
        </motion.div>
        
        {/* Deep gradient overlay for text readability */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-background/70 via-background/80 to-background pointer-events-none" />

        <div className="max-w-7xl mx-auto w-full px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div style={{ opacity }} className="flex flex-col items-start py-8">
            <motion.h1
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-[7rem] sm:text-[9rem] md:text-[11rem] font-black leading-none mb-8"
              style={{ 
                fontFamily: 'var(--font-logo)',
                background: 'linear-gradient(135deg, var(--cp-text-1) 30%, var(--cp-text-3) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
            Where You At
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-lg sm:text-xl text-on-surface-variant max-w-lg mb-10 leading-relaxed"
            >
              Find your people, find the vibe. Discover events, RSVP with one tap, earn rewards for showing up, and own your campus social life.
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
          <HeroVisualSwitcher />
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
      <section className="relative z-10 py-32 px-6 lg:px-8 overflow-hidden">
        {/* Chaotic Collage Background */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Image 
            src="/features_collage_bg.png" 
            alt="Features background collage" 
            fill 
            className="object-cover opacity-30 dark:opacity-40"
            quality={90}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
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
      <section className="relative z-20 py-32 px-6 lg:px-8 overflow-hidden">
        {/* Chaotic Collage Background */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Image 
            src="/cta_collage_bg.png" 
            alt="CTA background collage" 
            fill 
            className="object-cover opacity-40 dark:opacity-50"
            quality={90}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto rounded-[3rem] p-12 md:p-20 text-center overflow-hidden glass-panel border border-primary/20 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background/80 to-tertiary/20" />
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
                {authLoading ? 'Connecting...' : 'Find Your Vibe'} <Zap size={20} />
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
            <span className="font-headline font-bold text-lg">W.Y.A</span>
          </div>
          <p className="text-sm" style={{ color: 'var(--cp-text-3)' }}>© 2026 W.Y.A — Where You At. All rights reserved.</p>
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

const float = (y: number, dur: number, delay = 0): any => ({
  y: [0, y, 0],
  transition: {
    y: { duration: dur, repeat: Infinity, ease: "easeInOut", delay },
  },
});

function HeroVisual() {
  const [liveEvent, setLiveEvent] = useState<CommunityEvent | null>(null);
  const [upcomingEvent, setUpcomingEvent] = useState<CommunityEvent | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [stats, setStats] = useState({ totalVolunteers: 12400 });

  useEffect(() => {
    const fetchLiveData = async () => {
      try {
        const { events } = await getEvents(5);
        if (events && events.length > 0) {
          setLiveEvent(events[0]);
          if (events.length > 1) setUpcomingEvent(events[1]);
        }

        const board = await getGlobalLeaderboard(3);
        setLeaderboard(board);

        const leaderStats = await getLeaderboardStats();
        if (leaderStats && leaderStats.totalVolunteers > 0) {
          setStats({ totalVolunteers: leaderStats.totalVolunteers });
        }
      } catch (error) {
        console.error("Failed to fetch live data for hero:", error);
      }
    };
    fetchLiveData();
  }, []);

  const liveGoal = liveEvent?.needs?.volunteers?.goal || 200;
  const liveCurrent = liveEvent?.needs?.volunteers?.current || 142;
  const liveProgress = Math.min(100, Math.round((liveCurrent / liveGoal) * 100));

  const formatNumber = (num: number) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };
  return (
    <div
      className="hidden lg:flex relative w-full items-center justify-center"
      style={{ minHeight: 520 }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 65% 60% at 55% 45%, hsl(from var(--cp-primary) h s l / 0.1), transparent 70%)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 45% 45% at 30% 70%, hsl(from var(--cp-accent) h s l / 0.06), transparent 60%)",
        }}
      />

      {[
        { top: "8%", left: "12%", size: 4, delay: 0, dur: 4 },
        { top: "22%", left: "82%", size: 3, delay: 1.5, dur: 5 },
        { top: "72%", left: "8%", size: 3, delay: 0.8, dur: 4.5 },
        { top: "85%", left: "75%", size: 3, delay: 2, dur: 3.5 },
        { top: "45%", left: "92%", size: 4, delay: 0.3, dur: 5 },
        { top: "15%", left: "55%", size: 2.5, delay: 1, dur: 4 },
        { top: "60%", left: "25%", size: 3, delay: 1.8, dur: 3.8 },
      ].map((p, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute rounded-full pointer-events-none"
          animate={{ opacity: [0.25, 0.7, 0.25], scale: [1, 1.4, 1] }}
          transition={{
            duration: p.dur,
            repeat: Infinity,
            ease: "easeInOut",
            delay: p.delay,
          }}
          style={{
            top: p.top,
            left: p.left,
            width: p.size,
            height: p.size,
            background: "var(--cp-primary)",
            willChange: "transform, opacity",
          }}
        />
      ))}

      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ opacity: 0.1 }}
      >
        <motion.line
          x1="30%" y1="28%" x2="55%" y2="38%"
          stroke="var(--cp-primary)" strokeWidth="1" strokeDasharray="4 6"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, delay: 1.2 }}
        />
        <motion.line
          x1="55%" y1="62%" x2="80%" y2="75%"
          stroke="var(--cp-accent)" strokeWidth="1" strokeDasharray="4 6"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, delay: 1.5 }}
        />
        <motion.line
          x1="72%" y1="18%" x2="55%" y2="38%"
          stroke="var(--cp-secondary)" strokeWidth="1" strokeDasharray="4 6"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, delay: 1.8 }}
        />
      </svg>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1, ...float(-6, 5) }}
        transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-30 w-[310px] rounded-2xl overflow-hidden"
        style={{
          background: "var(--cp-surface)",
          border: "1px solid var(--cp-border)",
          boxShadow:
            "0 8px 32px -4px rgba(0,0,0,0.15), 0 16px 60px -12px rgba(0,0,0,0.1), 0 0 80px -20px hsl(from var(--cp-primary) h s l / 0.2)",
          willChange: "transform",
        }}
      >
        <div
          className="h-24 relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, var(--cp-primary), var(--cp-accent))",
          }}
        >
          <div className="absolute inset-0" style={{
            background: "linear-gradient(to top, var(--cp-surface) 5%, transparent 50%)",
          }}/>
          <div className="absolute bottom-3 left-4 right-4 flex justify-between items-end">
            <span
              className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full backdrop-blur-md"
              style={{
                background: "hsl(from var(--cp-primary) h s l / 0.25)",
                color: "white",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              }}
            >
              <span className="inline-flex items-center gap-1">
                <Flame size={10} /> Live Now
              </span>
            </span>
            <div className="flex items-center gap-1 text-[11px] font-medium" style={{ color: "rgba(255,255,255,0.9)" }}>
              <MapPin size={10} /> Main Auditorium
            </div>
          </div>
        </div>

        <div className="p-4 pb-3.5">
          <h3 className="font-headline text-[17px] font-bold mb-0.5 leading-snug truncate" style={{ color: "var(--cp-text-1)" }}>
            {liveEvent?.title || "Winter Tech Summit '26"}
          </h3>
          <p className="text-[11px] mb-3 leading-relaxed line-clamp-1" style={{ color: "var(--cp-text-3)" }}>
            {liveEvent?.description || "AI, Web3 & the future of campus innovation"}
          </p>

          <div className="mb-3">
            <div className="flex justify-between text-[10px] mb-1">
              <span style={{ color: "var(--cp-text-3)" }}>Spots filled</span>
              <span className="font-bold" style={{ color: "var(--cp-primary)" }}>{liveCurrent} / {liveGoal}</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--cp-surface-dim)" }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, var(--cp-primary), var(--cp-accent))" }}
                initial={{ width: 0 }}
                animate={{ width: `${liveProgress}%` }}
                transition={{ duration: 1.2, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex -space-x-2.5">
              {[11, 12, 13, 14, 15].map((i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full overflow-hidden ring-2"
                  style={{ ["--tw-ring-color" as string]: "var(--cp-surface)" }}
                >
                  <img
                    src={`https://i.pravatar.cc/56?img=${i}`}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold ring-2"
                style={{
                  ["--tw-ring-color" as string]: "var(--cp-surface)",
                  background: "var(--cp-primary-light)",
                  color: "var(--cp-primary)",
                }}
              >
                +137
              </div>
            </div>
            <div className="flex items-center gap-1 text-[10px]" style={{ color: "var(--cp-text-3)" }}>
              <Clock size={10} /> Starting in 2h
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 24, scale: 0.9 }}
        animate={{ opacity: 1, x: 0, scale: 1, ...float(-4, 4.2, 0.5) }}
        transition={{ duration: 0.7, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
        className="absolute z-40 rounded-2xl flex items-center gap-3 px-4 py-3"
        style={{
          top: "6%",
          right: "2%",
          background: "var(--cp-surface)",
          borderTop: "2px solid var(--cp-secondary)",
          borderLeft: "1px solid var(--cp-border)",
          borderRight: "1px solid var(--cp-border)",
          borderBottom: "1px solid var(--cp-border)",
          boxShadow:
            "0 4px 24px -4px rgba(0,0,0,0.12), 0 8px 40px -12px rgba(0,0,0,0.08), 0 -2px 12px -2px hsl(from var(--cp-secondary) h s l / 0.15)",
          willChange: "transform",
        }}
      >
        <div className="relative">
          <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "var(--cp-secondary)" }} />
            <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: "var(--cp-secondary)" }} />
          </span>
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "var(--cp-secondary-light)" }}
          >
            <TrendingUp size={14} style={{ color: "var(--cp-secondary)" }} />
          </div>
        </div>
        <div>
          <div className="text-[11px] font-bold" style={{ color: "var(--cp-text-1)" }}>
            Recent activity surge
          </div>
          <div className="text-[9px]" style={{ color: "var(--cp-text-3)" }}>
            {liveEvent?.title || "Winter Tech Summit"}
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -20, scale: 0.9 }}
        animate={{ opacity: 1, x: 0, scale: 1, ...float(-5, 4.8, 0.3) }}
        transition={{ duration: 0.7, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="absolute z-20 w-[195px] rounded-2xl p-4"
        style={{
          top: "3%",
          left: "0%",
          background: "var(--cp-surface)",
          borderTop: "2px solid var(--cp-gold)",
          borderLeft: "1px solid var(--cp-border)",
          borderRight: "1px solid var(--cp-border)",
          borderBottom: "1px solid var(--cp-border)",
          boxShadow:
            "0 4px 24px -4px rgba(0,0,0,0.12), 0 8px 40px -12px rgba(0,0,0,0.08), 0 -2px 12px -2px hsl(from var(--cp-gold) h s l / 0.2)",
          willChange: "transform",
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "var(--cp-gold-light)" }}>
            <Trophy size={12} style={{ color: "var(--cp-gold)" }} />
          </div>
          <span className="text-[12px] font-bold" style={{ color: "var(--cp-text-1)" }}>
            Top This Week
          </span>
        </div>
        {leaderboard.length > 0 ? (
          leaderboard.map((u, i) => (
            <div key={u.id} className="flex items-center gap-2.5 py-1.5 text-[11px]">
              <span
                className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold shrink-0"
                style={{
                  background: i === 0 ? "var(--cp-gold)" : i === 1 ? "var(--cp-text-3)" : "var(--cp-orange)",
                  color: "white",
                }}
              >
                {i + 1}
              </span>
              <div className="w-5 h-5 rounded-full overflow-hidden shrink-0">
                <img src={u.avatarUrl || `https://i.pravatar.cc/40?img=${i + 10}`} alt="" className="w-full h-full object-cover" />
              </div>
              <span className="font-medium flex-1 truncate" style={{ color: "var(--cp-text-1)" }}>
                {u.displayName}
              </span>
              <span className="font-semibold" style={{ color: "var(--cp-text-3)" }}>{formatNumber(u.impactScore)}</span>
            </div>
          ))
        ) : (
          [
            { name: "Alex M.", pts: "2,450", rank: 1, img: 33 },
            { name: "Sarah T.", pts: "2,100", rank: 2, img: 44 },
            { name: "James K.", pts: "1,890", rank: 3, img: 51 },
          ].map((u) => (
            <div key={u.rank} className="flex items-center gap-2.5 py-1.5 text-[11px]">
              <span
                className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold shrink-0"
                style={{
                  background: u.rank === 1 ? "var(--cp-gold)" : u.rank === 2 ? "var(--cp-text-3)" : "var(--cp-orange)",
                  color: "white",
                }}
              >
                {u.rank}
              </span>
              <div className="w-5 h-5 rounded-full overflow-hidden shrink-0">
                <img src={`https://i.pravatar.cc/40?img=${u.img}`} alt="" className="w-full h-full object-cover" />
              </div>
              <span className="font-medium flex-1 truncate" style={{ color: "var(--cp-text-1)" }}>
                {u.name}
              </span>
              <span className="font-semibold" style={{ color: "var(--cp-text-3)" }}>{u.pts}</span>
            </div>
          ))
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.6, rotate: -8 }}
        animate={{ opacity: 1, scale: 1, rotate: 0, ...float(-3, 3.5, 0.7) }}
        transition={{ duration: 0.5, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}
        className="absolute z-40 rounded-2xl px-4 py-3 flex items-center gap-3"
        style={{
          bottom: "8%",
          right: "8%",
          background: "var(--cp-surface)",
          borderTop: "2px solid var(--cp-primary)",
          borderLeft: "1px solid var(--cp-border)",
          borderRight: "1px solid var(--cp-border)",
          borderBottom: "1px solid var(--cp-border)",
          boxShadow:
            "0 4px 24px -4px rgba(0,0,0,0.12), 0 8px 40px -12px rgba(0,0,0,0.08), 0 -2px 12px -2px hsl(from var(--cp-primary) h s l / 0.15)",
          willChange: "transform",
        }}
      >
        <div className="relative w-10 h-10">
          <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15" fill="none" stroke="var(--cp-surface-dim)" strokeWidth="3" />
            <motion.circle
              cx="18" cy="18" r="15" fill="none" stroke="var(--cp-primary)" strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="94.25"
              initial={{ strokeDashoffset: 94.25 }}
              animate={{ strokeDashoffset: 94.25 * 0.28 }}
              transition={{ duration: 1.5, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <Zap size={13} style={{ color: "var(--cp-primary)" }} />
          </div>
        </div>
        <div>
          <div className="text-sm font-extrabold" style={{ color: "var(--cp-primary)" }}>
            +250 XP
          </div>
          <div className="text-[9px] uppercase tracking-wider font-semibold" style={{ color: "var(--cp-text-3)" }}>
            Level 12
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1, ...float(-4, 4.5, 0.9) }}
        transition={{ duration: 0.6, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="absolute z-20 rounded-2xl px-4 py-3 flex items-center gap-3"
        style={{
          bottom: "10%",
          left: "2%",
          background: "var(--cp-surface)",
          borderTop: "2px solid var(--cp-accent)",
          borderLeft: "1px solid var(--cp-border)",
          borderRight: "1px solid var(--cp-border)",
          borderBottom: "1px solid var(--cp-border)",
          boxShadow:
            "0 4px 24px -4px rgba(0,0,0,0.12), 0 8px 40px -12px rgba(0,0,0,0.08), 0 -2px 12px -2px hsl(from var(--cp-accent) h s l / 0.15)",
          willChange: "transform",
        }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "var(--cp-accent-light)" }}
        >
          <Star size={16} style={{ color: "var(--cp-accent)" }} />
        </div>
        <div>
          <div className="text-[12px] font-bold truncate w-[110px]" style={{ color: "var(--cp-text-1)" }}>
            {upcomingEvent?.title || "Art & Design Expo"}
          </div>
          <div className="text-[10px] flex items-center gap-1.5" style={{ color: "var(--cp-text-3)" }}>
            <Clock size={9} /> Upcoming soon
          </div>
        </div>
        <div
          className="ml-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase"
          style={{
            background: "var(--cp-accent-light)",
            color: "var(--cp-accent)",
          }}
        >
          Soon
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0, ...float(-3, 3.8, 1.2) }}
        transition={{ duration: 0.5, delay: 1.1, ease: [0.16, 1, 0.3, 1] }}
        className="absolute z-10 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5"
        style={{
          top: "48%",
          right: "0%",
          background: "var(--cp-surface)",
          borderLeft: "2px solid var(--cp-primary)",
          borderTop: "1px solid var(--cp-border)",
          borderRight: "1px solid var(--cp-border)",
          borderBottom: "1px solid var(--cp-border)",
          boxShadow:
            "0 4px 24px -4px rgba(0,0,0,0.12), 0 8px 40px -12px rgba(0,0,0,0.08)",
          willChange: "transform",
        }}
      >
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "var(--cp-primary-light)" }}>
          <Users size={12} style={{ color: "var(--cp-primary)" }} />
        </div>
        <div>
          <div className="text-[13px] font-extrabold" style={{ color: "var(--cp-text-1)" }}>{formatNumber(stats.totalVolunteers)}</div>
          <div className="text-[8px] uppercase tracking-wider" style={{ color: "var(--cp-text-3)" }}>Active Users</div>
        </div>
      </motion.div>
    </div>
  );
}

function HeroVisualCalendar() {
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const router = useRouter();

  useEffect(() => {
    getEvents(4).then(({ events: evs }) => { if (evs?.length) setEvents(evs.slice(0, 4)); }).catch(() => {});
  }, []);

  const typeColors = ['primary', 'accent', 'secondary', 'violet'];
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  const displayEvents = events.length > 0 ? events : [
    { id:'1', title:'Tech Summit', eventDate: new Date().toISOString(), location:'Main Hall', category:'Tech Talk' },
    { id:'2', title:'Hackathon Kick-off', eventDate: new Date(Date.now()+86400000).toISOString(), location:'Lab Block', category:'Hackathon' },
    { id:'3', title:'Music & Arts Fest', eventDate: new Date(Date.now()+172800000).toISOString(), location:'Open Stage', category:'Concert' },
    { id:'4', title:'Career Fair', eventDate: new Date(Date.now()+259200000).toISOString(), location:'Convention Ctr', category:'Career Fair' },
  ] as unknown as CommunityEvent[];

  return (
    <div className="hidden lg:flex relative w-full items-center justify-center" style={{ minHeight: 520 }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 65% 60% at 55% 45%, hsl(from var(--cp-primary) h s l / 0.1), transparent 70%)" }} />
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1, ...float(-5, 5) }}
        transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-30 w-[360px] rounded-2xl overflow-hidden"
        style={{ background: "var(--cp-surface)", border: "1px solid var(--cp-border)", boxShadow: "0 8px 40px -8px rgba(0,0,0,0.2), 0 0 80px -20px hsl(from var(--cp-primary) h s l / 0.15)" }}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-4 flex justify-between items-center" style={{ borderBottom: '1px solid var(--cp-border)' }}>
          <div>
            <div className="text-[10px] uppercase tracking-widest font-semibold mb-0.5" style={{ color: 'var(--cp-text-3)' }}>Upcoming</div>
            <h3 className="font-headline text-xl font-bold">Campus Events</h3>
          </div>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--cp-primary-light)' }}>
            <Calendar size={17} style={{ color: 'var(--cp-primary)' }} />
          </div>
        </div>

        {/* Event rows */}
        <div className="divide-y" style={{ borderColor: 'var(--cp-border)' }}>
          {displayEvents.map((ev, i) => {
            const d = ev.eventDate ? new Date(ev.eventDate) : new Date(Date.now() + i * 86400000);
            const color = typeColors[i % typeColors.length];
            return (
              <motion.div
                key={ev.id}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex gap-4 items-center px-5 py-3.5 cursor-pointer group"
                style={{ transition: 'background 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--cp-surface-dim)')}
                onMouseLeave={e => (e.currentTarget.style.background = '')}
                onClick={() => router.push('/home')}
              >
                {/* Date block */}
                <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl shrink-0" style={{ background: `var(--cp-${color}-light)`, color: `var(--cp-${color})` }}>
                  <span className="text-[9px] uppercase font-bold leading-none">{days[d.getDay()]}</span>
                  <span className="text-2xl font-black leading-tight">{d.getDate()}</span>
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm leading-snug truncate" style={{ color: 'var(--cp-text-1)' }}>{ev.title}</h4>
                  <div className="flex items-center gap-1.5 mt-0.5 text-[10px]" style={{ color: 'var(--cp-text-3)' }}>
                    <MapPin size={9} />
                    <span className="truncate">{ev.location || 'Campus'}</span>
                  </div>
                </div>
                {/* Category pill */}
                <div className="shrink-0 px-2 py-0.5 rounded-full text-[9px] font-bold" style={{ background: `var(--cp-${color}-light)`, color: `var(--cp-${color})` }}>
                  {(ev.category || 'Event').toString().split(' ')[0]}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Footer CTA */}
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderTop: '1px solid var(--cp-border)' }}>
          <span className="text-[11px]" style={{ color: 'var(--cp-text-3)' }}>+{events.length > 4 ? events.length - 4 : '24'} more events this week</span>
          <button onClick={() => router.push('/home')} className="flex items-center gap-1 text-[11px] font-bold" style={{ color: 'var(--cp-primary)' }}>
            See all <ChevronRight size={13} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function HeroVisualSocial() {
  return (
    <div className="hidden lg:flex relative w-full items-center justify-center" style={{ minHeight: 520 }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 65% 60% at 55% 45%, hsl(from var(--cp-secondary) h s l / 0.1), transparent 70%)" }} />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1, ...float(-5, 6) }}
        className="relative z-30 w-[320px] rounded-2xl glass-panel p-5"
        style={{ background: "var(--cp-surface)", border: "1px solid var(--cp-border)", boxShadow: "var(--shadow-xl)" }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-accent p-[2px]">
            <img src="https://i.pravatar.cc/100?img=47" className="w-full h-full rounded-full border-2 border-surface object-cover" alt="" />
          </div>
          <div>
            <div className="text-sm font-bold">Campus Life Updates</div>
            <div className="text-xs text-on-surface-variant">@campus_pulse</div>
          </div>
        </div>
        <div className="w-full h-40 rounded-xl mb-4 overflow-hidden relative">
          <img src="/chaotic_collage_bg.png" className="w-full h-full object-cover" alt="" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
            <span className="text-white font-bold text-sm">Fest registrations open! 🔥</span>
          </div>
        </div>
        <div className="flex justify-between items-center text-sm font-medium" style={{ color: 'var(--cp-text-3)' }}>
          <span className="flex items-center gap-1"><Users size={14}/> 1.2k attending</span>
          <button className="btn-primary px-4 py-2 text-[10px]">RSVP</button>
        </div>
      </motion.div>
    </div>
  );
}

function HeroVisualMusic() {
  return (
    <div className="hidden lg:flex relative w-full items-center justify-center" style={{ minHeight: 520 }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 65% 60% at 55% 45%, hsl(from var(--cp-violet) h s l / 0.15), transparent 70%)" }} />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
        animate={{ opacity: 1, scale: 1, rotate: 0, ...float(-4, 4) }}
        className="relative z-30 w-[320px] rounded-2xl glass-panel p-5 overflow-hidden"
        style={{ background: "var(--cp-surface)", border: "1px solid var(--cp-border)", boxShadow: "var(--shadow-xl)" }}
      >
        <div className="w-full h-32 rounded-xl mb-4 relative overflow-hidden flex items-center justify-center bg-zinc-900">
           <motion.div animate={{ scale: [1, 1.1, 1], rotate: [0, 180, 360] }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="w-20 h-20 rounded-full bg-gradient-to-tr from-violet-500 to-pink-500 blur-xl opacity-50" />
           <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10">
               <div className="w-6 h-6 border-t-2 border-r-2 border-transparent border-l-white border-b-transparent translate-x-1 rotate-45" />
             </div>
           </div>
        </div>
        <div className="text-center mb-4">
          <div className="text-sm font-bold uppercase tracking-wider text-violet-500 mb-1">Live DJ Set</div>
          <h3 className="font-headline text-xl font-bold mb-1">Neon Nights</h3>
          <p className="text-xs text-on-surface-variant">EDM Society • Main Stage</p>
        </div>
        <div className="flex gap-2">
           <button className="flex-1 btn-primary py-2 text-xs">Join Stream</button>
           <button className="w-10 h-10 rounded-lg flex items-center justify-center bg-surface-dim border border-border"><Star size={16} /></button>
        </div>
      </motion.div>
    </div>
  );
}

function HeroVisualHackathon() {
  return (
    <div className="hidden lg:flex relative w-full items-center justify-center" style={{ minHeight: 520 }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 65% 60% at 55% 45%, hsl(from var(--cp-cyan) h s l / 0.1), transparent 70%)" }} />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0, ...float(-5, 5) }}
        className="relative z-30 w-[360px] rounded-2xl glass-panel p-6 font-mono"
        style={{ background: "var(--cp-surface)", border: "1px solid var(--cp-border)", boxShadow: "var(--shadow-xl)" }}
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="text-cyan-500 text-xs font-bold mb-1">{">"} SYSTEM.ONLINE</div>
            <h3 className="font-headline text-2xl font-black uppercase tracking-tighter">HackX 2025</h3>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-on-surface-variant uppercase">Time Remaining</div>
            <div className="text-xl font-bold tracking-widest">14:02:59</div>
          </div>
        </div>
        
        <div className="space-y-3 mb-6">
           <div className="bg-surface-dim rounded border border-border p-3 text-xs">
              <span className="text-cyan-500">const</span> <span className="text-pink-500">team</span> = [<span className="text-green-500">'frontend'</span>, <span className="text-green-500">'backend'</span>];<br/>
              <span className="text-cyan-500">await</span> team.build();
           </div>
        </div>

        <div className="flex justify-between items-center border-t border-border pt-4">
          <div className="flex -space-x-2">
             <div className="w-8 h-8 rounded-full bg-cyan-500 border-2 border-surface"></div>
             <div className="w-8 h-8 rounded-full bg-violet-500 border-2 border-surface"></div>
             <div className="w-8 h-8 rounded-full bg-pink-500 border-2 border-surface"></div>
          </div>
          <button className="bg-cyan-500 text-black font-bold uppercase text-xs px-4 py-2 hover:bg-cyan-400 transition-colors">
            Submit Project
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function HeroVisualSwitcher() {
  const [activeIndex, setActiveIndex] = useState(0);
  const variants = [
    { component: <HeroVisual />, label: "Card" },
    { component: <HeroVisualCalendar />, label: "Calendar" },
    { component: <HeroVisualRadar />, label: "Activity" },
    { component: <HeroVisualIsometric />, label: "Tickets" },
  ];


  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full h-[520px] relative flex items-center justify-center">
        {variants[activeIndex].component}
      </div>
      <div className="flex flex-wrap justify-center gap-2 mt-4 bg-surface/50 backdrop-blur-md p-2 rounded-full border border-border">
        {variants.map((v, i) => (
          <button 
            key={i} 
            onClick={() => setActiveIndex(i)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${activeIndex === i ? 'bg-primary text-primary-foreground' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-dim'}`}
          >
            {v.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function HeroVisualRadar() {
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [tick, setTick] = useState(0);
  const router = useRouter();

  useEffect(() => {
    getEvents(8).then(({ events: evs }) => { if (evs?.length) setEvents(evs); }).catch(() => {});
    const id = setInterval(() => setTick(t => t + 1), 3000);
    return () => clearInterval(id);
  }, []);

  const fallback: Partial<CommunityEvent>[] = [
    { id:'a', title:'Hackathon Kick-off', category:'Hackathon', location:'Lab Block', needs:{ volunteers:{ current:38, goal:60 } } },
    { id:'b', title:'Music Fest', category:'Concert', location:'Open Stage', needs:{ volunteers:{ current:210, goal:300 } } },
    { id:'c', title:'Tech Summit', category:'Tech Talk', location:'Main Hall', needs:{ volunteers:{ current:92, goal:120 } } },
    { id:'d', title:'Art & Design Expo', category:'Cultural Fest', location:'Gallery Wing', needs:{ volunteers:{ current:44, goal:80 } } },
    { id:'e', title:'Career Fair', category:'Career Fair', location:'Convention Ctr', needs:{ volunteers:{ current:175, goal:200 } } },
  ];
  const display = (events.length > 0 ? events : fallback).slice(0, 5) as CommunityEvent[];

  const categoryIcon = (cat: string) => {
    if (!cat) return <Zap size={14} />;
    if (cat.includes('Hack')) return <Trophy size={14} />;
    if (cat.includes('Concert') || cat.includes('Music')) return <Star size={14} />;
    if (cat.includes('Career')) return <TrendingUp size={14} />;
    if (cat.includes('Sport')) return <Flame size={14} />;
    return <Sparkles size={14} />;
  };

  return (
    <div className="hidden lg:flex relative w-full items-center justify-center" style={{ minHeight: 520 }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 65% 60% at 55% 45%, hsl(from var(--cp-accent) h s l / 0.08), transparent 70%)" }} />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-30 w-[380px] rounded-2xl overflow-hidden"
        style={{ background: "var(--cp-surface)", border: "1px solid var(--cp-border)", boxShadow: "0 8px 40px -8px rgba(0,0,0,0.2)" }}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--cp-border)' }}>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2"><span className="animate-ping absolute h-2 w-2 rounded-full opacity-75" style={{ background: 'var(--cp-secondary)' }} /><span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: 'var(--cp-secondary)' }} /></span>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--cp-text-3)' }}>Live Activity</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: 'var(--cp-secondary-light)', color: 'var(--cp-secondary)' }}>{display.length} events active</span>
        </div>

        {/* Feed */}
        <div className="divide-y" style={{ borderColor: 'var(--cp-border)' }}>
          {display.map((ev, i) => {
            const current = ev.needs?.volunteers?.current ?? 0;
            const goal = ev.needs?.volunteers?.goal ?? 100;
            const pct = Math.min(100, Math.round((current / goal) * 100));
            const isHot = pct > 70;
            return (
              <motion.div
                key={ev.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => router.push('/home')}
                className="flex items-center gap-3 px-5 py-3 cursor-pointer"
                style={{ transition: 'background 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--cp-surface-dim)')}
                onMouseLeave={e => (e.currentTarget.style.background = '')}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--cp-primary-light)', color: 'var(--cp-primary)' }}>
                  {categoryIcon(ev.category as string)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="font-semibold text-sm truncate" style={{ color: 'var(--cp-text-1)' }}>{ev.title}</span>
                    {isHot && <Flame size={11} style={{ color: 'var(--cp-orange)', flexShrink: 0 }} />}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'var(--cp-surface-dim)' }}>
                      <motion.div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, var(--cp-primary), var(--cp-accent))' }}
                        initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, delay: 0.3 + i * 0.08 }}
                      />
                    </div>
                    <span className="text-[10px] font-bold shrink-0" style={{ color: 'var(--cp-text-3)' }}>{current}/{goal}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="px-5 py-3.5 flex items-center justify-between" style={{ borderTop: '1px solid var(--cp-border)' }}>
          <span className="text-[11px]" style={{ color: 'var(--cp-text-3)' }}>Updated just now</span>
          <button onClick={() => router.push('/home')} className="flex items-center gap-1 text-[11px] font-bold" style={{ color: 'var(--cp-primary)' }}>Explore all <ChevronRight size={13} /></button>
        </div>
      </motion.div>
    </div>
  );
}

function HeroVisualIsometric() {
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [active, setActive] = useState(0);
  const router = useRouter();

  useEffect(() => {
    getEvents(3).then(({ events: evs }) => { if (evs?.length) setEvents(evs.slice(0, 3)); }).catch(() => {});
  }, []);

  const fallback: Partial<CommunityEvent>[] = [
    { id:'x', title:'Spring Music Festival', category:'Concert', location:'Main Campus Square', needs:{ volunteers:{ current:210, goal:300 } }, tags:['open to all'] },
    { id:'y', title:'National Hackathon', category:'Hackathon', location:'Innovation Hub', needs:{ volunteers:{ current:38, goal:60 } }, tags:['registration required'] },
    { id:'z', title:'Career Connect Fair', category:'Career Fair', location:'Convention Centre', needs:{ volunteers:{ current:92, goal:120 } }, tags:['bring resume'] },
  ];
  const cards = (events.length > 0 ? events : fallback) as CommunityEvent[];
  const ev = cards[active];
  const current = ev?.needs?.volunteers?.current ?? 0;
  const goal = ev?.needs?.volunteers?.goal ?? 100;
  const pct = Math.min(100, Math.round((current / goal) * 100));
  const gradients = [
    'linear-gradient(135deg, var(--cp-primary), var(--cp-accent))',
    'linear-gradient(135deg, var(--cp-violet), var(--cp-primary))',
    'linear-gradient(135deg, var(--cp-secondary), var(--cp-accent))',
  ];

  return (
    <div className="hidden lg:flex relative w-full items-center justify-center" style={{ minHeight: 520 }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 65% 60% at 55% 45%, hsl(from var(--cp-primary) h s l / 0.1), transparent 70%)" }} />

      {/* Background fan cards */}
      {cards.map((_, i) => i !== active && (
        <motion.div key={i} className="absolute w-[280px] rounded-3xl shadow-xl cursor-pointer"
          style={{ height: 380, background: 'var(--cp-surface)', border: '1px solid var(--cp-border)',
            rotate: i < active ? -18 : 18, x: i < active ? -80 : 80, y: 30, zIndex: 1, originY: 1 }}
          onClick={() => setActive(i)}
          whileHover={{ y: 20, scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        >
          <div className="h-1 w-full rounded-t-3xl" style={{ background: gradients[i % gradients.length] }} />
          <div className="p-5 pt-4">
            <div className="text-xs font-semibold truncate" style={{ color: 'var(--cp-text-3)' }}>{cards[i]?.title}</div>
          </div>
        </motion.div>
      ))}

      {/* Front card */}
      <motion.div
        key={active}
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1, ...float(-6, 5) }}
        transition={{ duration: 0.6, type: 'spring', bounce: 0.35 }}
        className="relative z-10 w-[300px] rounded-3xl overflow-hidden shadow-2xl"
        style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border)' }}
      >
        {/* Gradient header */}
        <div className="h-36 relative" style={{ background: gradients[active % gradients.length] }}>
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, var(--cp-surface) 0%, transparent 50%)' }} />
          <div className="absolute top-4 left-4 px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/20 text-white backdrop-blur-sm">
            {ev?.category || 'Event'}
          </div>
          <div className="absolute bottom-3 right-4 flex items-center gap-1 text-white/80 text-[11px]">
            <MapPin size={10} />{ev?.location || 'Campus'}
          </div>
        </div>

        <div className="px-5 pb-5 pt-2">
          <h3 className="font-headline font-bold text-xl leading-snug mb-1" style={{ color: 'var(--cp-text-1)' }}>{ev?.title || 'Campus Event'}</h3>
          <div className="text-[11px] mb-4" style={{ color: 'var(--cp-text-3)' }}>{(ev?.tags || ['Open to all'])[0]}</div>

          {/* Progress */}
          <div className="mb-4">
            <div className="flex justify-between text-[10px] mb-1.5" style={{ color: 'var(--cp-text-3)' }}>
              <span>Spots filled</span><span className="font-bold" style={{ color: 'var(--cp-primary)' }}>{current}/{goal}</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--cp-surface-dim)' }}>
              <motion.div className="h-full rounded-full" style={{ background: gradients[active % gradients.length] }}
                initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1.2, ease: [0.16,1,0.3,1] }}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={() => router.push('/home')} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: gradients[active % gradients.length] }}>RSVP Now</button>
            <button onClick={() => setActive((active + 1) % cards.length)} className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'var(--cp-surface-dim)', color: 'var(--cp-text-1)' }}>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

