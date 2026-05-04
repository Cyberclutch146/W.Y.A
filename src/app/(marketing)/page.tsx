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

const STATS = [
  { label: 'Active Events', value: 248, suffix: '+', icon: <Calendar size={20}/>, color: 'from-blue-500/20 to-cyan-500/20', iconColor: 'text-blue-500 dark:text-cyan-400' },
  { label: 'Students', value: 12, suffix: 'K+', icon: <Users size={20}/>, color: 'from-purple-500/20 to-pink-500/20', iconColor: 'text-purple-500 dark:text-pink-400' },
  { label: 'Campus Clubs', value: 80, suffix: '+', icon: <Compass size={20}/>, color: 'from-emerald-500/20 to-teal-500/20', iconColor: 'text-emerald-600 dark:text-emerald-400' },
];

const FEATURES = [
  { icon: <Compass className="w-8 h-8 text-blue-500 dark:text-cyan-400" />, title: 'Discovery Feed', desc: 'Browse personalized events based on your interests and clubs. AI-driven recommendations tailored for your campus journey.', span: 'md:col-span-2' },
  { icon: <Trophy className="w-8 h-8 text-purple-500 dark:text-purple-400" />, title: 'Earn Points', desc: 'RSVP, bring friends, and climb the campus leaderboard.', span: 'md:col-span-1' },
  { icon: <Sparkles className="w-8 h-8 text-emerald-500 dark:text-emerald-400" />, title: 'Host Events', desc: 'Create, promote, and manage campus events in minutes with our intuitive builder.', span: 'md:col-span-1' },
  { icon: <ShieldCheck className="w-8 h-8 text-pink-500 dark:text-pink-400" />, title: 'Verified Access', desc: 'Secure student-only access ensuring a safe, authentic, and vibrant campus community.', span: 'md:col-span-2' },
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
            <button onClick={handleJoinUs} disabled={authLoading || loading} className="relative overflow-hidden rounded-full px-6 py-2.5 font-label font-semibold text-sm text-white shadow-[0_0_40px_-10px_rgba(99,102,241,0.5)] transition-all hover:scale-105 hover:shadow-[0_0_60px_-15px_rgba(99,102,241,0.7)] active:scale-95 disabled:opacity-70">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-tertiary" />
              <span className="relative flex items-center gap-2">
                {authLoading ? 'Loading...' : user ? 'Open App' : 'Get Started'}
                <ArrowRight size={16} />
              </span>
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
          <motion.div style={{ opacity }} className="flex flex-col items-start pt-10 pb-20">
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
              <button onClick={handleJoinUs} disabled={authLoading || loading} className="w-full sm:w-auto px-8 py-4 rounded-full bg-on-background text-background font-semibold flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all duration-300 shadow-xl shadow-on-background/10">
                {authLoading ? 'Joining...' : user ? 'Enter Dashboard' : 'Start Exploring'}
                <ArrowRight size={18} />
              </button>
              
              {!user && !loading && (
                <button onClick={handleGoogleJoin} disabled={authLoading || loading} className="w-full sm:w-auto px-8 py-4 rounded-full glass-panel hover:bg-surface-variant/50 font-semibold flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all duration-300">
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
              className="flex items-center gap-6 mt-12 pt-8 border-t border-outline/20 w-full"
            >
              {STATS.map((stat, i) => (
                <div key={i} className="flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={stat.iconColor}>{stat.icon}</span>
                    <CountUp to={stat.value as number} suffix={stat.suffix} className="font-headline font-bold text-2xl" />
                  </div>
                  <span className="text-xs text-on-surface-variant uppercase tracking-wider font-medium">{stat.label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Floating Display */}
          <motion.div style={{ opacity }} className="hidden lg:flex relative h-[600px] w-full items-center justify-center perspective-[1000px]">
            {/* Main Center Card */}
            <motion.div 
              initial={{ opacity: 0, rotateY: 20, z: -100 }}
              animate={{ opacity: 1, rotateY: 0, z: 0 }}
              transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="absolute z-30 w-[340px] rounded-2xl glass-panel p-6 shadow-2xl overflow-hidden premium-card-hover"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full -mr-10 -mt-10" />
              <div className="flex justify-between items-start mb-6">
                <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary rounded-full">Trending</span>
                <div className="flex items-center gap-1 text-on-surface-variant">
                  <MapPin size={14} />
                  <span className="text-xs font-medium">Main Auditorium</span>
                </div>
              </div>
              <h3 className="text-3xl font-headline font-bold leading-tight mb-2">Winter Tech <br/> Summit '26</h3>
              <p className="text-sm text-on-surface-variant mb-6">Join industry leaders for an exclusive deep dive into AI and the future of web design.</p>
              
              <div className="flex justify-between items-center bg-surface-variant/50 rounded-xl p-3 backdrop-blur-md">
                <div className="flex -space-x-2">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-surface bg-background flex items-center justify-center overflow-hidden">
                      <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="user" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                <div className="text-right">
                  <span className="block text-xs text-on-surface-variant">Spots left</span>
                  <span className="font-bold text-sm text-primary">12 / 150</span>
                </div>
              </div>
            </motion.div>

            {/* Back Left Card */}
            <motion.div 
              initial={{ opacity: 0, x: -50, rotate: -5, z: -200 }}
              animate={{ opacity: 0.8, x: -100, rotate: -8, z: -100 }}
              transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="absolute z-20 w-[280px] rounded-2xl glass-panel p-5 shadow-xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <Trophy size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Leaderboard</h4>
                  <p className="text-xs text-on-surface-variant">Top students this week</p>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { name: 'Alex M.', pts: '2,450 XP', color: 'bg-amber-400' },
                  { name: 'Sarah T.', pts: '2,100 XP', color: 'bg-slate-300' },
                  { name: 'James K.', pts: '1,890 XP', color: 'bg-amber-700' }
                ].map((user, i) => (
                  <div key={i} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${user.color}`} />
                      <span className="font-medium text-on-surface">{user.name}</span>
                    </div>
                    <span className="text-on-surface-variant">{user.pts}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Back Right Card */}
            <motion.div 
              initial={{ opacity: 0, x: 50, rotate: 5, z: -200 }}
              animate={{ opacity: 0.8, x: 100, rotate: 8, z: -100 }}
              transition={{ duration: 1, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="absolute z-10 w-[280px] rounded-2xl glass-panel p-5 shadow-xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-500">
                  <Calendar size={20} />
                </div>
                <h4 className="font-bold text-sm">Upcoming</h4>
              </div>
              <div className="space-y-4">
                {[
                  { title: 'Art Fest', time: 'Tomorrow, 4PM' },
                  { title: 'Soccer Finals', time: 'Wed, 6PM' }
                ].map((item, i) => (
                  <div key={i} className="flex flex-col">
                    <span className="font-medium text-sm text-on-surface">{item.title}</span>
                    <span className="text-xs text-on-surface-variant">{item.time}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* MARQUEE */}
      <section className="relative z-20 py-8 border-y border-outline/10 bg-surface/30 backdrop-blur-md overflow-hidden">
        <ScrollVelocity 
          texts={[MARQUEE.join('  ✧  ')] as any}
          velocity={40} 
          className="font-headline font-semibold text-lg md:text-2xl uppercase tracking-widest text-on-surface/50" 
          parallaxClassName="py-2"
          scrollerClassName="flex items-center gap-8"
          numCopies={4}
          scrollContainerRef={undefined}
          parallaxStyle={undefined}
          scrollerStyle={undefined}
        />
      </section>

      {/* BENTO GRID FEATURES */}
      <section className="relative z-10 py-32 px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-20 max-w-2xl mx-auto">
          <h2 className="font-headline text-4xl md:text-5xl font-bold mb-6">Designed for the <br/> <span className="premium-gradient-text">Modern Student</span></h2>
          <p className="text-lg text-on-surface-variant">Everything you need to navigate campus life, neatly organized in a seamless and beautiful interface.</p>
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
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none transition-opacity duration-500 group-hover:opacity-100 opacity-50" />
              
              <div className="mb-6 inline-flex p-4 rounded-2xl bg-surface shadow-sm border border-outline/10">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
              <p className="text-on-surface-variant leading-relaxed max-w-md">{feature.desc}</p>
              
              <div className="mt-8 flex items-center text-primary font-medium text-sm gap-2 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                Learn more <ChevronRight size={16} />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS MARQUEE */}
      <section className="py-20 relative overflow-hidden bg-surface-variant/30">
        <div className="absolute inset-0 bg-gradient-to-b from-background to-transparent h-20" />
        <ScrollVelocity 
          texts={[TESTIMONIALS.join('  ✦  ')] as any} 
          velocity={-30} 
          className="font-body font-medium text-xl md:text-3xl text-on-surface/80 px-4" 
          parallaxClassName="py-8"
          scrollerClassName="flex items-center gap-12"
          numCopies={3}
          scrollContainerRef={undefined}
          parallaxStyle={undefined}
          scrollerStyle={undefined}
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background to-transparent h-20" />
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
                className="w-full sm:w-auto px-10 py-5 rounded-full bg-primary text-white font-semibold text-lg flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/30"
              >
                {authLoading ? 'Connecting...' : 'Join The Pulse'} <Zap size={20} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-outline/10 py-12 px-6 lg:px-8 mt-20 relative z-10 bg-background">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Zap size={20} className="text-primary" />
            <span className="font-headline font-bold text-lg">CampusPulse</span>
          </div>
          <p className="text-sm text-on-surface-variant">© 2026 CampusPulse. All rights reserved.</p>
          <div className="flex gap-8">
            <Link href="/about" className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">About</Link>
            <Link href="/terms" className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">Privacy</Link>
            <Link href="/login" className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
