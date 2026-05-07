'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, PlusCircle, Calendar, MapPin, Users, Mail, Loader2, Zap, ArrowRight } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useEventsCache } from '@/context/EventsCacheContext'

import { EventCard } from '@/components/EventCard'
import { getRecommendedEvents, getMatchPercentage } from '@/services/recommendationService'
import { getUserProfile, updateUserProfile } from '@/services/userService'
import { motion } from 'framer-motion'
import { LiveBadge } from '@/components/LiveBadge'
import { ErrorBoundary } from '@/components/ErrorBoundary'

import { Music, Trophy, Code2, PartyPopper, Palette } from 'lucide-react'

const QUICK_FILTERS = [
  { label: 'Music', q: 'Music', color: 'var(--cp-pink)', Icon: Music },
  { label: 'Sports', q: 'Sports', color: 'var(--cp-lime)', Icon: Trophy },
  { label: 'Tech', q: 'Tech', color: 'var(--cp-cyan)', Icon: Code2 },
  { label: 'Party', q: 'Party', color: 'var(--cp-violet)', Icon: PartyPopper },
  { label: 'Arts', q: 'Arts', color: 'var(--cp-orange)', Icon: Palette },
]

const formatRelativeTime = (ts: any) => {
  if (!ts) return 'recently';
  const date = typeof ts.toDate === 'function' ? ts.toDate() : new Date(ts);
  const diffInMinutes = Math.floor((new Date().getTime() - date.getTime()) / 60000);
  
  if (diffInMinutes < 1) return 'just now';
  if (diffInMinutes < 60) return `${diffInMinutes} mins ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hrs ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} days ago`;
};


export default function HomePage() {
  const router = useRouter()
  const { profile } = useAuth()
  const { events, loading: cacheLoading, fetchEvents } = useEventsCache()

  const [loading, setLoading] = useState(true)
  const [organizerEmail, setOrganizerEmail] = useState<string | null>(null)
  const [vibeMatches, setVibeMatches] = useState<string[]>([])
  const vibeMatchFiredRef = useRef(false)

  // ── 1. Fetch events immediately on mount — don't wait for profile ──
  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchEvents()

        if (data.length > 0) {
          const featuredEvent = data.find(e => e.urgency === 'high' && e.status === 'active') ?? data[0]
          if (featuredEvent?.organizerId) {
            getUserProfile(featuredEvent.organizerId)
              .then(p => { if (p?.email) setOrganizerEmail(p.email) })
              .catch(() => {})
          }
        }
      } catch (err) {
        console.error('Failed to load events:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // ── 2. Fire vibe-match once profile AND events are both ready (background, non-blocking) ──
  useEffect(() => {
    if (!profile || events.length === 0 || vibeMatchFiredRef.current) return
    vibeMatchFiredRef.current = true
    fetch('/api/recommendations/vibe-match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile, events: events.slice(0, 10) })
    })
      .then(res => res.json())
      .then(d => { if (d.success && d.results) setVibeMatches(d.results) })
      .catch(() => {})
  }, [profile, events])

  const recommendedEvents = profile ? getRecommendedEvents(profile, events, 6).map(item => {
    if (vibeMatches.includes(item.event.id)) {
      return {
        ...item,
        score: item.score + 30, // Boost score
        reasons: [{ type: 'ai', label: 'AI Vibe Match' }, ...item.reasons]
      }
    }
    return item;
  }).sort((a, b) => b.score - a.score) : []

  const handleContactOrganizer = (eventTitle: string) => {
    if (organizerEmail) {
      window.location.href = `mailto:${organizerEmail}?subject=Regarding Event: ${encodeURIComponent(eventTitle)}`
    } else {
      alert('Organizer contact information is currently unavailable.')
    }
  }

  const handleDismissRecommendation = async (eventId: string) => {
    if (!profile) return
    try {
      const currentDismissed = profile.dismissedEventIds || []
      if (!currentDismissed.includes(eventId)) {
        await updateUserProfile(profile.id, { dismissedEventIds: [...currentDismissed, eventId] })
      }
    } catch (err) {
      console.error('Failed to dismiss recommendation:', err)
    }
  }

  const formatDate = (ts: CommunityEvent['createdAt']) => {
    if (!ts) return 'TBD'
    const date = typeof (ts as { toDate?: () => Date }).toDate === 'function'
      ? (ts as { toDate: () => Date }).toDate()
      : new Date(ts as unknown as string)
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  const featured = events.find(e => e.urgency === 'high' && e.status === 'active') ?? events[0] ?? null

  const volCurrent = featured?.needs?.attendees?.current ?? 0
  const volGoal = featured?.needs?.attendees?.goal ?? 1
  const volPercent = Math.min(Math.round((volCurrent / volGoal) * 100), 100)

  const getGreeting = () => {
    const h = new Date().getHours()
    if (h < 12) return { text: 'Good morning', emoji: '☀️' }
    if (h < 18) return { text: 'Good afternoon', emoji: '☕' }
    return { text: 'Good evening', emoji: '🌙' }
  }
  const greeting = getGreeting()

  const liveActivity = events.slice(0, 3).map((e, i) => {
    const colors = ['var(--cp-cyan)', 'var(--cp-pink)', 'var(--cp-violet)', 'var(--cp-orange)', 'var(--cp-lime)'];
    return {
      id: e.id,
      initial: (e.organizer || e.title || 'A').charAt(0).toUpperCase(),
      color: colors[i % colors.length],
      name: e.organizer || 'Community Member',
      action: `created ${e.title}`,
      ago: formatRelativeTime(e.createdAt)
    };
  });

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div
          className="w-24 h-24 rounded-[2.5rem] flex items-center justify-center animate-bounce shadow-glow"
          style={{ 
            background: 'linear-gradient(135deg, var(--cp-primary), var(--cp-violet))'
          }}
        >
          <Zap className="w-12 h-12 text-white fill-current" />
        </div>
        <div className="text-center animate-fade-in-up">
          <h2 className="text-2xl font-headline font-black tracking-tight" style={{ color: 'var(--cp-text-1)' }}>Powering Up...</h2>
          <p className="text-sm mt-1 font-medium" style={{ color: 'var(--cp-text-3)' }}>Syncing campus energy</p>
        </div>
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="flex-1 flex flex-col p-6 md:p-10" style={{ color: 'var(--cp-text-1)' }}>
        <div className="flex justify-between items-start mb-12">
          <div>
            <h1 className="font-headline font-black text-4xl md:text-6xl tracking-tighter" style={{ color: 'var(--cp-text-1)' }}>Upcoming</h1>
            <p className="mt-2 text-lg" style={{ color: 'var(--cp-text-2)' }}>The campus is quiet... for now.</p>
          </div>
          <button onClick={() => router.push('/create')} className="btn-primary scale-110">
            <Plus size={18} /> Create Event
          </button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-6 py-20">
          <div className="w-32 h-32 rounded-[2.5rem] flex items-center justify-center rotate-3" style={{ background: 'var(--cp-surface-dim)', border: '2px dashed var(--cp-border)' }}>
            <Calendar size={48} style={{ color: 'var(--cp-text-3)' }} className="opacity-50" />
          </div>
          <div className="max-w-sm">
            <h2 className="text-2xl font-headline font-bold mb-2">No events yet</h2>
            <p style={{ color: 'var(--cp-text-2)' }}>Be the spark that starts the next campus movement.</p>
          </div>
          <button onClick={() => router.push('/create')} className="btn-primary py-4 px-8 rounded-2xl">
            Drop the First Event
          </button>
        </div>
      </div>
    )
  }

  return (
    <main className="flex-1 flex flex-col w-full pb-32 md:pb-0 relative overflow-x-hidden" style={{ color: 'var(--cp-text-1)' }}>
      <div className="max-w-7xl mx-auto w-full relative z-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="px-6 md:px-8 mt-12 md:mt-16 flex flex-col gap-8 lg:flex-row lg:items-end justify-between pb-10"
        >
          <div className="max-w-2xl relative">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
              <Zap size={14} className="text-primary fill-current animate-pulse" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--cp-primary)' }}>
                {greeting.text}, {profile?.displayName?.split(' ')[0] || 'Student'} {greeting.emoji}
              </p>
            </div>
            <h1 className="font-headline font-black text-5xl md:text-7xl tracking-tighter leading-[0.9] mb-4" style={{ color: 'var(--cp-text-1)' }}>
              Campus <span className="text-primary">Pulse</span>
            </h1>
            <p className="text-lg md:text-xl font-medium max-w-lg leading-snug" style={{ color: 'var(--cp-text-2)' }}>
              The heartbeat of your university. <span className="text-foreground">Discover, Connect, and Energize.</span>
            </p>
          </div>
          <button 
            onClick={() => router.push('/create')} 
            className="btn-primary px-8 py-5 text-base rounded-[2rem] shadow-2xl hover:scale-105 active:scale-95 transition-all"
            style={{ boxShadow: '0 20px 40px -10px hsl(from var(--cp-primary) h s l / 0.4)' }}
          >
            <PlusCircle size={20} /> Drop an Event
          </button>
        </motion.div>

        {/* Quick Filters */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="px-6 md:px-8 flex flex-wrap gap-3 mb-12"
        >
          {QUICK_FILTERS.map(({ label, q, color, Icon }) => (
            <button
              key={q}
              onClick={() => router.push(`/feed?q=${q}`)}
              className="px-6 py-3 rounded-2xl text-sm font-bold transition-all hover:scale-105 active:scale-95 border border-transparent shadow-sm flex items-center gap-2"
              style={{
                background: `linear-gradient(135deg, ${color}15, ${color}08)`,
                color: color,
              }}
              onMouseEnter={e => { 
                (e.currentTarget as HTMLElement).style.borderColor = `${color}40`;
                (e.currentTarget as HTMLElement).style.background = `${color}20`;
              }}
              onMouseLeave={e => { 
                (e.currentTarget as HTMLElement).style.borderColor = 'transparent';
                (e.currentTarget as HTMLElement).style.background = `linear-gradient(135deg, ${color}15, ${color}08)`;
              }}
            >
              {Icon && <Icon size={16} strokeWidth={2.5} />}
              {label}
            </button>
          ))}
        </motion.div>

        {/* Main Grid */}
        <div className="px-6 md:px-8 grid grid-cols-1 gap-6 items-start lg:grid-cols-3">

          {/* Featured Card */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <EventCard event={featured!} featured />
          </motion.div>

          {/* Sidebar */}
          <motion.div
            className="flex flex-col gap-4"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Event Details Card */}
            <div className="card-elevated p-6 bg-gradient-to-br from-white to-[hsl(var(--cp-primary-light))] dark:from-[var(--cp-surface)] dark:to-[hsl(var(--cp-primary-light)/0.05)] border-primary/10">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-headline font-black text-sm uppercase tracking-widest" style={{ color: 'var(--cp-text-1)' }}>Live Stats</h3>
                <LiveBadge />
              </div>
              <div className="space-y-6">
                <div className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform" style={{ background: 'var(--cp-surface-dim)', border: '1px solid var(--cp-border)' }}>
                    <Calendar size={20} style={{ color: 'var(--cp-primary)' }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] opacity-50">Scheduled</p>
                    <p className="text-base font-black truncate" style={{ color: 'var(--cp-text-1)' }}>{formatDate(featured!.createdAt)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform" style={{ background: 'var(--cp-surface-dim)', border: '1px solid var(--cp-border)' }}>
                    <MapPin size={20} style={{ color: 'var(--cp-secondary)' }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] opacity-50">Venue</p>
                    <p className="text-base font-black truncate" style={{ color: 'var(--cp-text-1)' }}>{featured!.location}</p>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex justify-between items-end mb-2">
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] opacity-50">Crew Capacity</p>
                    <p className="text-sm font-black" style={{ color: 'var(--cp-secondary)' }}>{volPercent}%</p>
                  </div>
                  <div className="h-3 w-full rounded-full overflow-hidden p-0.5 shadow-inner" style={{ background: 'var(--cp-surface-dim)', border: '1px solid var(--cp-border)' }}>
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${volPercent}%` }}
                      transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                      className="progress-bar-fill" 
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={() => router.push(`/event/${featured!.id}`)}
                className="btn-primary w-full mt-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all"
              >
                Join the Crew <ArrowRight size={16} />
              </button>
            </div>

            {/* Organizer Card */}
            <div className="card-elevated p-4 flex items-center justify-between border-primary/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 shadow-sm" style={{ background: 'var(--cp-primary-light)', border: '1px solid var(--cp-border)' }}>
                  <span className="w-full h-full flex items-center justify-center font-bold text-sm" style={{ color: 'var(--cp-primary)' }}>
                    {(featured!.organizer || 'C').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] opacity-50">Organized by</p>
                  <p className="text-sm font-black" style={{ color: 'var(--cp-text-1)' }}>{featured!.organizer || 'Community Organizer'}</p>
                </div>
              </div>
              <button
                onClick={() => handleContactOrganizer(featured!.title)}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                style={{ background: 'hsl(from var(--cp-accent) h s l / 0.12)', color: 'var(--cp-accent)' }}
                title="Contact Organizer"
              >
                <Mail size={15} />
              </button>
            </div>

            {/* Live Activity */}
            <div className="card-elevated p-6 bg-gradient-to-br from-white to-[hsl(var(--cp-secondary-light)/0.2)] dark:from-[var(--cp-surface)] dark:to-[hsl(var(--cp-secondary-light)/0.05)] border-secondary/5">
              <h3 className="font-headline font-black text-sm uppercase tracking-[0.2em] mb-6 flex items-center gap-2" style={{ color: 'var(--cp-text-1)' }}>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-secondary shadow-[0_0_8px_var(--cp-secondary)]"></span>
                </span>
                Live Pulse
              </h3>
              <div className="flex flex-col gap-6">
                {liveActivity.map((item) => (
                  <div key={item.id} className="flex items-start gap-4 group cursor-default">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm text-white shrink-0 shadow-lg transition-all group-hover:scale-110 group-hover:rotate-3"
                      style={{ background: item.color, boxShadow: `0 8px 16px -4px ${item.color}40` }}
                    >
                      {item.initial}
                    </div>
                    <div className="min-w-0 pt-0.5">
                      <p className="text-sm font-black leading-none mb-1 truncate" style={{ color: 'var(--cp-text-1)' }}>{item.name}</p>
                      <p className="text-xs font-medium leading-relaxed opacity-70 mb-1 line-clamp-1" style={{ color: 'var(--cp-text-2)' }}>{item.action}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-30">{item.ago}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ═══ PULSE COMMAND CENTER ═══ */}
      {(() => {
        const totalEvents = events.length
        const activeNow = events.filter(e => e.status === 'active').length
        const totalAttendees = events.reduce((sum, e) => sum + (e.needs?.attendees?.current ?? 0), 0)
        const uniqueCategories = [...new Set(events.map(e => e.category).filter(Boolean))]
        const categoryCounts = events.reduce((acc, e) => {
          if (e.category) acc[e.category] = (acc[e.category] || 0) + 1
          return acc
        }, {} as Record<string, number>)
        const trending = Object.entries(categoryCounts).sort(([,a], [,b]) => b - a).slice(0, 6)
        const recentEvents = [...events].sort((a, b) => {
          const tA = a.createdAt ? (typeof (a.createdAt as any).toDate === 'function' ? (a.createdAt as any).toDate() : new Date(a.createdAt as any)) : new Date(0)
          const tB = b.createdAt ? (typeof (b.createdAt as any).toDate === 'function' ? (b.createdAt as any).toDate() : new Date(b.createdAt as any)) : new Date(0)
          return tB.getTime() - tA.getTime()
        }).slice(0, 8)
        // Compute a "pulse" percentage (0-100) based on activity ratio
        const pulseLevel = totalEvents > 0 ? Math.min(100, Math.round((activeNow / totalEvents) * 100 + totalAttendees * 2)) : 0

        const statCards = [
          { label: 'Total Events', value: totalEvents, icon: <Calendar size={20} />, color: 'var(--cp-primary)', glow: 'hsl(258 90% 63% / 0.35)' },
          { label: 'Live Now', value: activeNow, icon: <Zap size={20} />, color: 'var(--cp-secondary)', glow: 'hsl(160 70% 50% / 0.35)' },
          { label: 'Attendees', value: totalAttendees, icon: <Users size={20} />, color: 'var(--cp-cyan, #06b6d4)', glow: 'hsl(185 100% 55% / 0.35)' },
          { label: 'Categories', value: uniqueCategories.length, icon: <Plus size={20} />, color: 'var(--cp-violet, #8b5cf6)', glow: 'hsl(270 100% 70% / 0.35)' },
        ]

        return (
          <div className="mt-14 w-full relative z-10">
            <div className="relative overflow-hidden" style={{ borderTop: '1px solid var(--cp-border)', borderBottom: '1px solid var(--cp-border)' }}>
              {/* Deep gradient background */}
              <div className="absolute inset-0" style={{
                background: `
                  radial-gradient(ellipse 80% 60% at 50% 40%, hsl(258 90% 63% / 0.08) 0%, transparent 70%),
                  radial-gradient(ellipse 60% 50% at 20% 80%, hsl(160 70% 50% / 0.06) 0%, transparent 60%),
                  radial-gradient(ellipse 50% 40% at 80% 20%, hsl(185 100% 55% / 0.05) 0%, transparent 60%),
                  linear-gradient(180deg, hsl(from var(--cp-bg) h s l / 0.95) 0%, var(--cp-bg) 100%)
                `
              }} />

              {/* Subtle grid pattern */}
              <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: `
                  linear-gradient(var(--cp-text-1) 1px, transparent 1px),
                  linear-gradient(90deg, var(--cp-text-1) 1px, transparent 1px)
                `,
                backgroundSize: '60px 60px'
              }} />

              <div className="relative max-w-7xl mx-auto w-full px-6 md:px-10 py-16 md:py-20">

                {/* ── Top Row: Title + CTA ── */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-end justify-between mb-12 md:mb-16"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: 'var(--cp-secondary)' }} />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: 'var(--cp-secondary)' }} />
                      </span>
                      <p className="text-[11px] font-black uppercase tracking-[0.25em]" style={{ color: 'var(--cp-secondary)' }}>Live Pulse</p>
                    </div>
                    <h2 className="font-headline font-black text-3xl md:text-4xl tracking-tight" style={{ color: 'var(--cp-text-1)' }}>
                      Campus Command
                    </h2>
                    <p className="text-sm mt-1 max-w-md" style={{ color: 'var(--cp-text-3)' }}>
                      Real-time overview of everything happening across campus right now.
                    </p>
                  </div>
                  <button
                    onClick={() => router.push('/feed')}
                    className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all hover:scale-105 active:scale-95"
                    style={{ background: 'var(--cp-primary)', color: 'var(--cp-primary-on)', boxShadow: '0 0 24px -4px hsl(258 90% 63% / 0.5)' }}
                  >
                    Explore All <ArrowRight size={14} />
                  </button>
                </motion.div>

                {/* ── Main Grid: Pulse Orb + Stat Cards ── */}
                <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8 md:gap-10 items-start">

                  {/* Left: Pulse Orb */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className="relative mx-auto lg:mx-0 flex items-center justify-center"
                    style={{ width: 280, height: 280 }}
                  >
                    {/* Orbit rings */}
                    {[140, 110, 80].map((size, i) => (
                      <motion.div
                        key={i}
                        className="absolute rounded-full"
                        style={{
                          width: size * 2, height: size * 2,
                          border: `1px solid hsl(258 90% 63% / ${0.08 + i * 0.04})`,
                        }}
                        animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
                        transition={{ duration: 20 + i * 8, repeat: Infinity, ease: 'linear' }}
                      >
                        {/* Orbiting dot */}
                        <motion.span
                          className="absolute rounded-full"
                          style={{
                            width: 6 + i * 2, height: 6 + i * 2,
                            background: i === 0 ? 'var(--cp-primary)' : i === 1 ? 'var(--cp-secondary)' : 'var(--cp-cyan, #06b6d4)',
                            boxShadow: `0 0 12px ${i === 0 ? 'hsl(258 90% 63% / 0.6)' : i === 1 ? 'hsl(160 70% 50% / 0.6)' : 'hsl(185 100% 55% / 0.6)'}`,
                            top: -3 - i, left: '50%', transform: 'translateX(-50%)',
                          }}
                        />
                      </motion.div>
                    ))}

                    {/* Inner glow */}
                    <div className="absolute rounded-full" style={{
                      width: 120, height: 120,
                      background: 'radial-gradient(circle, hsl(258 90% 63% / 0.15) 0%, transparent 70%)',
                      filter: 'blur(20px)',
                    }} />

                    {/* Center stat */}
                    <div className="relative flex flex-col items-center justify-center text-center z-10">
                      <motion.p
                        className="font-headline font-black text-6xl tracking-tighter"
                        style={{ color: 'var(--cp-text-1)' }}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5, duration: 0.6, type: 'spring', stiffness: 200 }}
                      >
                        {pulseLevel}
                      </motion.p>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] mt-0.5" style={{ color: 'var(--cp-text-3)' }}>Pulse Score</p>
                      <div className="mt-3 w-16 h-1 rounded-full overflow-hidden" style={{ background: 'var(--cp-border)' }}>
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: 'linear-gradient(90deg, var(--cp-primary), var(--cp-secondary))' }}
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(pulseLevel, 100)}%` }}
                          transition={{ delay: 0.8, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                        />
                      </div>
                    </div>
                  </motion.div>

                  {/* Right: Stat Cards Grid */}
                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    {statCards.map((stat, i) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 24, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: 0.3 + i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="group relative rounded-2xl p-5 md:p-6 overflow-hidden cursor-default transition-transform duration-300 hover:scale-[1.03]"
                        style={{
                          background: 'var(--cp-surface)',
                          border: '1px solid var(--cp-border)',
                          boxShadow: `var(--shadow-sm), 0 0 0 0 ${stat.glow}`,
                        }}
                        whileHover={{ boxShadow: `var(--shadow-md), 0 0 30px -8px ${stat.glow}` }}
                      >
                        {/* Card gradient accent */}
                        <div className="absolute top-0 right-0 w-24 h-24 opacity-10 pointer-events-none" style={{
                          background: `radial-gradient(circle at top right, ${stat.color}, transparent 70%)`
                        }} />

                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                            style={{ background: `color-mix(in srgb, ${stat.color} 12%, transparent)`, color: stat.color }}
                          >
                            {stat.icon}
                          </div>
                          <p className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: 'var(--cp-text-3)' }}>{stat.label}</p>
                        </div>

                        <p className="text-4xl md:text-5xl font-black font-headline tracking-tight" style={{ color: 'var(--cp-text-1)' }}>
                          {stat.value}
                        </p>

                        {/* Micro accent bar */}
                        <div className="mt-4 h-0.5 w-full rounded-full overflow-hidden" style={{ background: 'var(--cp-border)' }}>
                          <motion.div
                            className="h-full rounded-full"
                            style={{ background: stat.color }}
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((stat.value / Math.max(totalEvents, 1)) * 100 + 15, 100)}%` }}
                            transition={{ delay: 0.6 + i * 0.1, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* ── Activity Ticker ── */}
                {recentEvents.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                    className="mt-10 md:mt-14 relative overflow-hidden rounded-2xl"
                    style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border)' }}
                  >
                    <div className="px-5 py-3 flex items-center gap-3 border-b" style={{ borderColor: 'var(--cp-border)' }}>
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: 'var(--cp-accent)' }} />
                          <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: 'var(--cp-accent)' }} />
                        </span>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--cp-text-3)' }}>Recent Activity</p>
                      </div>
                    </div>
                    <div className="relative overflow-hidden" style={{ height: 48 }}>
                      <motion.div
                        className="flex items-center gap-6 px-5 absolute whitespace-nowrap"
                        animate={{ x: ['0%', '-50%'] }}
                        transition={{ duration: recentEvents.length * 5, repeat: Infinity, ease: 'linear' }}
                        style={{ height: 48 }}
                      >
                        {[...recentEvents, ...recentEvents].map((evt, i) => (
                          <button
                            key={`${evt.id}-${i}`}
                            onClick={() => router.push(`/event/${evt.id}`)}
                            className="inline-flex items-center gap-2 text-xs font-medium transition-colors hover:opacity-80 shrink-0"
                            style={{ color: 'var(--cp-text-2)' }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{
                              background: evt.status === 'active' ? 'var(--cp-secondary)' : 'var(--cp-text-3)'
                            }} />
                            <span className="font-semibold" style={{ color: 'var(--cp-text-1)' }}>{evt.title}</span>
                            <span className="opacity-40">·</span>
                            <span className="opacity-50">{evt.category || 'Event'}</span>
                            <span className="opacity-40">·</span>
                            <span className="opacity-40">{formatRelativeTime(evt.createdAt)}</span>
                          </button>
                        ))}
                      </motion.div>
                      {/* Edge fades */}
                      <div className="absolute left-0 top-0 bottom-0 w-12 z-10 pointer-events-none" style={{ background: `linear-gradient(90deg, var(--cp-surface), transparent)` }} />
                      <div className="absolute right-0 top-0 bottom-0 w-12 z-10 pointer-events-none" style={{ background: `linear-gradient(270deg, var(--cp-surface), transparent)` }} />
                    </div>
                  </motion.div>
                )}

                {/* ── Trending Tags ── */}
                {trending.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1, duration: 0.4 }}
                    className="mt-8 flex flex-wrap items-center gap-2.5"
                  >
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] mr-1" style={{ color: 'var(--cp-text-3)' }}>Trending</span>
                    {trending.map(([cat, count], i) => (
                      <motion.button
                        key={cat}
                        onClick={() => router.push(`/feed?q=${cat}`)}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.1 + i * 0.06 }}
                        className="px-4 py-2 rounded-full text-xs font-bold transition-all hover:scale-105 active:scale-95 group"
                        style={{
                          background: 'color-mix(in srgb, var(--cp-primary) 8%, var(--cp-surface))',
                          border: '1px solid color-mix(in srgb, var(--cp-primary) 20%, var(--cp-border))',
                          color: 'var(--cp-text-1)',
                        }}
                      >
                        {cat}
                        <span className="ml-1.5 opacity-30 group-hover:opacity-60 transition-opacity">{count}</span>
                      </motion.button>
                    ))}
                  </motion.div>
                )}

                {/* Mobile CTA */}
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                  onClick={() => router.push('/feed')}
                  className="md:hidden mt-8 w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold"
                  style={{ background: 'var(--cp-primary)', color: 'var(--cp-primary-on)', boxShadow: '0 0 24px -4px hsl(258 90% 63% / 0.4)' }}
                >
                  Explore All Events <ArrowRight size={14} />
                </motion.button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Recommended */}
      {recommendedEvents.length > 0 && (
        <div className="py-16 w-full relative z-10">
          <div className="max-w-7xl mx-auto w-full px-6 md:px-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--cp-primary)' }}>Curated for you</p>
                <h2 className="font-headline font-bold text-2xl" style={{ color: 'var(--cp-text-1)' }}>Recommended Events</h2>
              </div>
              <button onClick={() => router.push('/feed')} className="btn-ghost text-sm" style={{ color: 'var(--cp-text-2)' }}>
                View All <ArrowRight size={14} />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 min-[560px]:grid-cols-2 md:gap-5 lg:grid-cols-3">
              <ErrorBoundary>
                {recommendedEvents.map((item, index) => (
                  <motion.div
                    key={item.event.id}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.07, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <EventCard
                      event={item.event}
                      recommendationPercentage={getMatchPercentage(item.score)}
                      matchedInterests={item.matchedInterests}
                      reasons={item.reasons}
                      onDismiss={handleDismissRecommendation}
                    />
                  </motion.div>
                ))}
              </ErrorBoundary>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
