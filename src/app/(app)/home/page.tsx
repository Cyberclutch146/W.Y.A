'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Plus, PlusCircle, Calendar, MapPin, Users, Mail, Loader2, Zap, ArrowRight } from 'lucide-react'
import { getEvents } from '@/services/eventService'
import { useAuth } from '@/context/AuthContext'
import { CommunityEvent } from '@/types'

import MapWrapper from '@/components/MapWrapper'
import { EventCard } from '@/components/EventCard'
import { getRecommendedEvents, getMatchPercentage } from '@/services/recommendationService'
import { getUserProfile, updateUserProfile } from '@/services/userService'
import { motion } from 'framer-motion'
import { LiveBadge } from '@/components/LiveBadge'
import { ErrorBoundary } from '@/components/ErrorBoundary'

const QUICK_FILTERS = [
  { label: '🎸 Music', q: 'Music', color: 'var(--cp-pink)' },
  { label: '⚽ Sports', q: 'Sports', color: 'var(--cp-lime)' },
  { label: '💻 Tech', q: 'Tech', color: 'var(--cp-cyan)' },
  { label: '🎉 Party', q: 'Party', color: 'var(--cp-violet)' },
  { label: '🎨 Arts', q: 'Arts', color: 'var(--cp-orange)' },
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

  const [events, setEvents] = useState<CommunityEvent[]>([])

  const [loading, setLoading] = useState(true)
  const [organizerEmail, setOrganizerEmail] = useState<string | null>(null)
  const [vibeMatches, setVibeMatches] = useState<string[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const { events: data } = await getEvents()
        setEvents(data)
      } catch (err) {
        console.error('Failed to load events:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    if (profile && events.length > 0) {
      const fetchVibeMatches = async () => {
        try {
          const res = await fetch('/api/recommendations/vibe-match', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ profile, events: events.slice(0, 10) })
          });
          const data = await res.json();
          if (data.success && data.results) {
            setVibeMatches(data.results);
          }
        } catch (e) {
          console.error('Failed to fetch vibe matches:', e);
        }
      };
      fetchVibeMatches();
    }
  }, [profile, events]);

  const featured = events.find(e => e.urgency === 'high' && e.status === 'active') ?? events[0] ?? null

  useEffect(() => {
    if (featured?.organizerId) {
      getUserProfile(featured.organizerId)
        .then(p => { if (p?.email) setOrganizerEmail(p.email) })
        .catch(err => console.error('Failed to fetch organizer profile:', err))
    }
  }, [featured?.organizerId])

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

  const volCurrent = featured?.needs?.volunteers?.current ?? 0
  const volGoal = featured?.needs?.volunteers?.goal ?? 1
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
          {QUICK_FILTERS.map(({ label, q, color }) => (
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

      {/* Map Section */}
      <div className="mt-14 w-full relative z-10">
        <div
          className="py-12"
          style={{ background: 'linear-gradient(135deg, hsl(from var(--cp-primary) h s l / 0.06), hsl(from var(--cp-secondary) h s l / 0.04))', borderTop: '1px solid var(--cp-border)', borderBottom: '1px solid var(--cp-border)' }}
        >
          <div className="max-w-7xl mx-auto w-full px-6 md:px-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-headline font-bold text-2xl" style={{ color: 'var(--cp-text-1)' }}>Explore on Map</h2>
              <button onClick={() => router.push('/feed')} className="btn-ghost text-sm" style={{ color: 'var(--cp-text-2)' }}>
                View All <ArrowRight size={14} />
              </button>
            </div>
            <div
              className="h-[400px] w-full overflow-hidden"
              style={{ borderRadius: 'var(--r-xl)', border: '1px solid var(--cp-border)', boxShadow: 'var(--shadow-lg)' }}
            >
              <MapWrapper events={events} />
            </div>
          </div>
        </div>
      </div>

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
