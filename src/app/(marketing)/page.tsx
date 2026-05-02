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
import LiquidEther from '@/components/LiquidEther';

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
        {/* Animated Liquid Background */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <LiquidEther
            colors={['#5227FF', '#FF9FFC', '#B497CF']}
            mouseForce={20}
            cursorSize={100}
            isViscous
            viscous={30}
            iterationsViscous={32}
            iterationsPoisson={32}
            resolution={0.5}
            isBounce={false}
            autoDemo
            autoSpeed={0.5}
            autoIntensity={2.2}
            takeoverDuration={0.25}
            autoResumeDelay={3000}
            autoRampDuration={0.6}
            color0="#5227FF"
            color1="#FF9FFC"
            color2="#B497CF"
          />
        </div>

        <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, ease: 'easeOut' }} className="flex flex-col justify-center px-8 md:px-14 lg:px-20 py-16 relative z-20 pointer-events-none [&>*]:pointer-events-auto">
          
          {/* Badge */}
          <motion.div 
             initial={{ opacity: 0, y: -20, rotate: -2 }} 
             animate={{ opacity: 1, y: 0, rotate: -2 }} 
             whileHover={{ rotate: 0, scale: 1.05 }}
             transition={{ duration: 0.5 }} 
             className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-label font-black uppercase tracking-[0.2em] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-fit mb-10 cursor-pointer bg-[var(--pop-acid-lime)] text-black"
          >
            <span className="relative flex h-3 w-3 mr-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-40"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-black"></span>
            </span>
            The Campus Network
          </motion.div>

          <h1 className="font-headline font-black text-6xl md:text-8xl lg:text-[100px] leading-[0.85] uppercase tracking-tighter text-on-background mb-8 relative">
            <span className="block" style={{ WebkitTextStroke: '2px black', color: 'transparent' }}>Dominate</span>
            <span className="block">Your Campus.</span>
            <motion.div 
               animate={{ rotate: [0, 5, 0, -5, 0] }} 
               transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
               className="absolute -right-8 -top-8 w-24 h-24 hidden md:flex items-center justify-center border-4 border-black rounded-full bg-[var(--pop-electric-purple)] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
            >
               <span className="font-headline font-black text-2xl text-white">V1.0</span>
            </motion.div>
          </h1>
          
          <p className="font-body text-on-surface-variant text-lg md:text-xl font-bold leading-relaxed max-w-lg mb-12 border-l-4 border-black pl-6">
            Discover underground events, RSVP in one tap, earn massive points for showing up, and own your social life.
          </p>
          
          <div className="flex flex-wrap items-center gap-6 mb-16">
            <div className="relative group">
              <div className="absolute -inset-2 bg-[image:var(--gradient-party)] blur-xl opacity-50 group-hover:opacity-100 transition duration-300 animate-pulse"></div>
              <button onClick={handleJoinUs} disabled={authLoading || loading} className="relative flex items-center gap-4 px-10 py-5 font-label font-black text-lg uppercase tracking-wider border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all duration-150 disabled:opacity-60 bg-[var(--color-primary-container-base)] text-[var(--color-on-primary-container-base)]">
                {authLoading ? 'Joining...' : user ? 'Enter Nexus' : 'Get Started'} 
                <span className="bg-black text-white rounded-full p-1"><ArrowRight size={20} /></span>
              </button>
            </div>
            {!user && !loading && (
              <button 
                onClick={handleGoogleJoin} 
                disabled={authLoading || loading}
                className="flex items-center gap-3 px-8 py-5 font-label font-black text-base uppercase tracking-wider border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-150 text-black disabled:opacity-60 bg-white"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </button>
            )}
          </div>
          
          <div className="flex flex-wrap gap-4">
            {STATS.map((s, i) => (
              <motion.div 
                key={s.label} 
                className="relative group flex items-center gap-3 px-5 py-3 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer overflow-hidden" 
                style={{ background: s.color, color: s.onColor }}
                whileHover={{ scale: 1.05, rotate: i % 2 === 0 ? 4 : -4, y: -5 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 0px, #000 2px, transparent 2px, transparent 8px)' }} />
                <div className="w-10 h-10 border-2 border-black bg-white rounded-full flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover:scale-110 transition-transform text-black">
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
                </div>
                <div className="flex flex-col relative z-10">
                  <CountUp to={s.value as number} suffix={s.suffix} className="font-headline font-black text-xl leading-none" />
                  <span className="font-label text-[10px] uppercase font-bold tracking-widest opacity-80 mt-1">{s.label}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right collage panel - Dynamic Floating Cards */}
        <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="relative hidden lg:flex flex-col border-l-4 border-black bg-[var(--color-surface-container-lowest-base)]/40 backdrop-blur-[2px] overflow-hidden items-center justify-center p-8 z-20 pointer-events-none [&>*]:pointer-events-auto">

          <div className="relative w-full max-w-[360px] h-[600px]">
            
            {/* Card 1: Trending Ticket */}
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 0, zIndex: 40 }}
              className="absolute top-0 right-0 w-[90%] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-[var(--pop-acid-lime)] origin-bottom-right z-20 cursor-pointer flex flex-col"
              style={{ rotate: 3 }}
            >
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <span className="font-headline font-black text-xs uppercase tracking-widest bg-black text-white px-2 py-1">Trending</span>
                  <Zap size={20} className="text-black" />
                </div>
                <h3 className="font-headline font-black text-3xl uppercase leading-none mb-2 text-black">Battle of<br/>the Bands</h3>
                <p className="font-label font-bold text-sm text-black opacity-80">Main Aud · Fri 8PM</p>
              </div>
              <div className="border-t-4 border-dashed border-black p-4 flex justify-between items-center bg-white/30">
                <div className="flex -space-x-2">
                  {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-black bg-white flex items-center justify-center font-bold text-xs text-black">U{i}</div>)}
                </div>
                <div className="px-3 py-1 border-2 border-black bg-white font-label font-black text-xs uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black">
                  +50 XP
                </div>
              </div>
            </motion.div>

            {/* Card 2: Live RSVP Progress */}
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 0, zIndex: 40 }}
              className="absolute top-[210px] left-0 w-[95%] border-4 border-black p-5 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-[var(--pop-electric-purple)] origin-top-left z-30 cursor-pointer"
              style={{ rotate: -4 }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 flex items-center justify-center border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <Users size={24} className="text-black" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--pop-acid-lime)] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--pop-acid-lime)] border-2 border-black"></span>
                    </span>
                    <span className="font-headline font-black text-xs uppercase tracking-widest text-white">Live Now</span>
                  </div>
                  <h4 className="font-headline font-black text-xl text-white leading-none">Hackathon 2025</h4>
                </div>
              </div>
              <p className="font-label font-bold text-sm text-white mb-2">234 / 300 Spots Filled</p>
              <div className="h-5 w-full border-4 border-black bg-white overflow-hidden p-0.5">
                <div className="h-full bg-black relative overflow-hidden" style={{ width: '78%' }}>
                  <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, white 10px, white 20px)' }} />
                </div>
              </div>
            </motion.div>

            {/* Card 3: This Week */}
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 0, zIndex: 40 }}
              className="absolute bottom-6 right-2 w-[85%] border-4 border-black p-5 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white origin-bottom-left z-10 cursor-pointer"
              style={{ rotate: 2 }}
            >
              <div className="flex items-center gap-2 mb-4 border-b-4 border-black pb-3">
                <Calendar size={20} className="text-black" />
                <h4 className="font-headline font-black text-lg uppercase text-black">This Week</h4>
              </div>
              <div className="flex flex-col gap-4">
                {[
                  { icon: '🎨', name: 'Art Fest', time: 'Tomorrow' },
                  { icon: '⚽', name: 'Soccer Finals', time: 'Wed, 4 PM' },
                  { icon: '🍕', name: 'Food Carnival', time: 'Friday' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 flex items-center justify-center bg-[var(--color-surface-container-lowest-base)] border-2 border-black rounded-full group-hover:scale-110 transition-transform text-sm text-black">{item.icon}</div>
                      <span className="font-label font-black text-sm text-black uppercase tracking-tight">{item.name}</span>
                    </div>
                    <span className="font-body text-xs text-black/60 font-bold uppercase tracking-wider">{item.time}</span>
                  </div>
                ))}
              </div>
            </motion.div>

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left: Text */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 text-[11px] font-label font-bold uppercase tracking-[0.2em] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-6" style={{ background: 'var(--color-tertiary-container-base)', color: 'var(--color-on-tertiary-container-base)' }}>
              How It Works
            </div>
            <h2 className="font-headline font-black text-4xl md:text-6xl uppercase tracking-tight text-on-background leading-tight mb-8">
              Everything you need to<br />
              <span className="block mt-2" style={{ color: 'var(--color-primary-container-base)', WebkitTextStroke: '2px black' }}>
                dominate<br/>campus life
              </span>
            </h2>
            <p className="font-body text-xl font-bold text-on-surface-variant border-l-4 border-black pl-6 mb-12">
              We've packed all the tools you need into one slick interface. Click the folder to unpack your arsenal.
            </p>

            <div className="flex flex-col gap-6">
              {FEATURES.map((f, i) => (
                <motion.div 
                  key={f.num} 
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.15 }}
                  whileHover={{ x: 12, scale: 1.02 }}
                  className="group flex items-start gap-5 p-6 border-4 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all cursor-default"
                >
                  <div className="w-14 h-14 shrink-0 border-4 border-black flex items-center justify-center bg-[var(--pop-acid-lime)] text-black font-black text-2xl group-hover:rotate-[10deg] transition-transform">
                    {f.num}
                  </div>
                  <div>
                    <h4 className="font-headline font-black text-2xl uppercase text-black mb-1.5">{f.title}</h4>
                    <p className="font-body text-base font-bold text-black/60 leading-relaxed">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right: Folder Component Container */}
          <div className="relative flex justify-center items-center h-[600px] md:h-[700px] border-4 border-black bg-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] mt-12 lg:mt-0 overflow-visible">
            {/* Dynamic Background Pattern */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
               <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] opacity-30" 
                    style={{ backgroundImage: 'radial-gradient(var(--pop-electric-purple) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(82,39,255,0.15)_0%,transparent_70%)]" />
               
               {/* Floating Sticker / Badge */}
               <motion.div 
                 animate={{ rotate: [5, -5, 5], y: [0, 10, 0] }}
                 transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                 className="absolute top-10 right-10 px-4 py-2 bg-[var(--pop-hot-pink)] border-4 border-black shadow-[4px_4px_0px_0px_black] font-headline font-black text-sm uppercase text-black z-20"
               >
                 Live Pulse
               </motion.div>
            </div>

            {/* Folder container (no overflow hidden, so papers can pop out) */}
            <div className="relative z-10 w-full flex justify-center mt-24">
              <Folder 
                color="var(--pop-electric-purple)"
                size={0.9}
                items={FEATURES.map((f) => (
                  <div key={f.num} className="w-full h-full border-4 border-black flex flex-col p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" style={{ background: f.bg }}>
                    <span className="material-symbols-outlined text-[40px] text-black mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>{f.icon}</span>
                    <h3 className="font-headline font-black text-2xl uppercase text-black leading-tight mb-2">{f.title}</h3>
                    <p className="font-body text-base font-bold text-black/80">{f.desc}</p>
                  </div>
                ))}
              />
            </div>
          </div>

        </div>
      </section>

      {/* CTA SECTION */}
      <section className="relative z-20 border-y-4 border-black py-32 px-8 md:px-14 overflow-hidden" style={{ background: 'var(--pop-hot-pink)' }}>
        {/* Dynamic Pattern Background */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, black 0px, black 2px, transparent 2px, transparent 12px)' }} />
        
        {/* Floating Stickers */}
        <motion.div 
          animate={{ rotate: [-5, 5, -5], y: [0, 20, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-20 right-[15%] hidden lg:block px-6 py-3 bg-[var(--pop-acid-lime)] border-4 border-black shadow-[6px_6px_0px_0px_black] font-headline font-black text-sm uppercase text-black -rotate-6"
        >
          Limited Early Access
        </motion.div>

        <motion.div 
          animate={{ rotate: [3, -3, 3], y: [0, -15, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-20 left-[10%] hidden lg:block px-6 py-3 bg-white border-4 border-black shadow-[6px_6px_0px_0px_black] font-headline font-black text-sm uppercase text-black rotate-3"
        >
          Join 12K+ Students
        </motion.div>

        <div className="relative z-10 max-w-6xl mx-auto flex flex-col items-center text-center gap-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex flex-col items-center"
          >
            <p className="font-label font-black text-[12px] uppercase tracking-[0.4em] text-black/50 mb-6">Are you ready to plug in?</p>
            <h2 className="font-headline font-black text-5xl md:text-8xl uppercase leading-[0.85] tracking-tighter text-black mb-10">
              YOUR CAMPUS<br />
              <span className="text-white drop-shadow-[4px_4px_0px_black]">IS CALLING.</span>
            </h2>
          </motion.div>

          <div className="flex flex-col md:flex-row gap-6 w-full max-w-2xl justify-center items-center">
            <motion.button 
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleJoinUs} 
              disabled={authLoading || loading} 
              className="w-full md:w-auto min-w-[280px] flex items-center justify-center gap-4 px-10 py-6 font-label font-black text-xl uppercase tracking-widest border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all duration-150 disabled:opacity-60 bg-black text-[var(--pop-acid-lime)]"
            >
              {authLoading ? 'PLUGGING IN...' : user ? 'GO TO HOME' : 'JOIN THE PULSE'} <ArrowRight size={24} />
            </motion.button>
            
            {!user && !loading && (
              <motion.button 
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGoogleJoin} 
                disabled={authLoading || loading}
                className="w-full md:w-auto min-w-[280px] flex items-center justify-center gap-4 px-10 py-6 font-label font-black text-xl uppercase tracking-widest border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all duration-150 text-black disabled:opacity-60 bg-white"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                GOOGLE
              </motion.button>
            )}
          </div>
          
          <Link href="/login" className="font-label font-black text-xs uppercase tracking-[0.2em] text-black/60 hover:text-black transition-colors">
            Already a member? Sign in here →
          </Link>
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
