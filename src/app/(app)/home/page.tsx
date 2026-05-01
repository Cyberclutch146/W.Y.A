'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Plus, Calendar, MapPin, Users, Mail, Loader2 } from 'lucide-react'
import { getEvents } from '@/services/eventService'
import { useAuth } from '@/context/AuthContext'
import { CommunityEvent } from '@/types'
import { SentinelAlert } from '@/types/sentinel'
import MapWrapper from '@/components/MapWrapper'
import { EventCard } from '@/components/EventCard'
import { getRecommendedEvents } from '@/services/recommendationService'
import { getUserProfile } from '@/services/userService'

export default function HomePage() {
  const router = useRouter()
  const { profile } = useAuth()

  const [events, setEvents] = useState<CommunityEvent[]>([])
  const [alerts, setAlerts] = useState<SentinelAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [organizerEmail, setOrganizerEmail] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const [{ events: data }, sentinelData] = await Promise.all([
          getEvents(),
          fetch('/api/sentinel').then(res => res.ok ? res.json() : [])
        ])
        setEvents(data)
        setAlerts(sentinelData)
      } catch (err) {
        console.error('Failed to load events:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const featured = events.find(e => e.urgency === 'high' && e.status === 'active') ?? events[0] ?? null

  useEffect(() => {
    if (featured?.organizerId) {
      getUserProfile(featured.organizerId)
        .then(p => { if (p?.email) setOrganizerEmail(p.email) })
        .catch(err => console.error('Failed to fetch organizer profile:', err))
    }
  }, [featured?.organizerId])

  const recommendedEvents = getRecommendedEvents(profile?.skills ?? [], events, 4, profile?.equipment ?? [])
    .map(({ event }) => event)
    .filter(event => event.id !== featured?.id)
    .slice(0, 3)

  const handleContactOrganizer = (eventTitle: string) => {
    if (organizerEmail) {
      window.location.href = `mailto:${organizerEmail}?subject=Regarding Event: ${encodeURIComponent(eventTitle)}`
    } else {
      alert('Organizer contact information is currently unavailable.')
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

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh]">
        <div
          className="w-14 h-14 flex items-center justify-center border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          style={{ background: 'var(--color-primary-container-base)' }}
        >
          <Loader2 className="w-6 h-6 animate-spin text-on-surface" />
        </div>
        <p className="mt-4 font-label font-bold text-sm uppercase tracking-widest text-on-surface-variant">Loading events…</p>
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="flex-1 flex flex-col text-on-surface">
        <div className="px-6 md:px-10 mt-10 flex justify-between items-start">
          <div>
            <h1 className="font-headline font-black text-4xl md:text-5xl uppercase tracking-tight text-on-background">Upcoming Events</h1>
            <p className="mt-3 text-on-surface-variant max-w-xl leading-relaxed">Your campus, live. Be the first to create an event.</p>
          </div>
          <button
            onClick={() => router.push('/create')}
            className="flex items-center gap-2 px-6 py-3 font-label font-bold text-sm uppercase tracking-wider border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-150 mt-1"
            style={{ background: 'var(--color-primary-container-base)', color: 'var(--color-on-primary-container-base)' }}
          >
            <Plus size={16} /> Create Event
          </button>
        </div>
        <div className="px-10 mt-20 flex flex-col items-center justify-center text-center gap-4">
          <div className="w-20 h-20 flex items-center justify-center border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" style={{ background: 'var(--color-surface-container-base)' }}>
            <Calendar size={36} className="text-on-surface-variant" />
          </div>
          <p className="text-xl font-headline font-black uppercase text-on-surface">No events yet</p>
          <p className="text-on-surface-variant max-w-sm">Be the first to create an event and rally your community.</p>
        </div>
      </div>
    )
  }

  return (
    <main className="flex-1 flex flex-col text-on-surface w-full pb-32 md:pb-10">
      <div className="max-w-7xl mx-auto w-full">

        {/* Header */}
        <div className="px-6 md:px-8 mt-8 md:mt-12 flex flex-col gap-6 lg:flex-row lg:items-center justify-between pb-8 border-b-4 border-black">
          <div className="max-w-3xl">
            <h1 className="font-headline font-black text-4xl md:text-5xl uppercase tracking-tight text-on-background">
              <span
                className="px-3 pb-1 mr-2 inline-block border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                style={{ background: 'var(--color-primary-container-base)', color: 'var(--color-on-primary-container-base)' }}
              >
                Live
              </span>
              Campus Events
            </h1>
            <p className="mt-3 text-on-surface-variant leading-relaxed max-w-xl">
              Discover what's happening on campus. RSVP, earn points, and show up.
            </p>
          </div>
          <button
            onClick={() => router.push('/create')}
            className="flex items-center gap-2 px-6 py-3 font-label font-bold text-sm uppercase tracking-wider border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-150 w-fit"
            style={{ background: 'var(--color-secondary-container-base)', color: 'var(--color-on-secondary-container-base)' }}
          >
            <Plus size={16} /> Drop an Event
          </button>
        </div>

        {/* Main Section */}
        <div className="px-6 md:px-10 mt-6 grid grid-cols-1 gap-6 items-start lg:grid-cols-3">

          {/* Featured Card */}
          <div className="lg:col-span-2">
            <EventCard event={featured!} featured />
          </div>

          {/* Details Panel */}
          <div className="flex flex-col gap-4">
            {/* Event Details */}
            <div className="border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6" style={{ background: 'var(--color-surface-container-lowest-base)' }}>
              <h3 className="font-headline font-black text-base uppercase tracking-tight text-on-surface mb-5">Event Details</h3>
              <div className="space-y-4 text-sm">

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 shrink-0 flex items-center justify-center border-2 border-black" style={{ background: 'var(--color-primary-container-base)' }}>
                    <Calendar size={16} className="text-on-surface" />
                  </div>
                  <div>
                    <p className="font-bold text-on-surface">{formatDate(featured!.createdAt)}</p>
                    <p className="text-on-surface-variant text-xs">{featured!.location}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 shrink-0 flex items-center justify-center border-2 border-black" style={{ background: 'var(--color-secondary-container-base)' }}>
                    <MapPin size={16} className="text-on-surface" />
                  </div>
                  <div>
                    <p className="font-bold text-on-surface">{featured!.location}</p>
                    <p className="text-on-surface-variant text-xs">{featured!.distance || 'Nearby'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 shrink-0 flex items-center justify-center border-2 border-black" style={{ background: 'var(--color-tertiary-container-base)' }}>
                    <Users size={16} className="text-on-surface" />
                  </div>
                  <div className="w-full">
                    <p className="font-bold text-on-surface mb-2">{volCurrent} / {volGoal} Volunteers</p>
                    <div className="h-3 w-full overflow-hidden border-2 border-black" style={{ background: 'var(--color-surface-container-high-base)' }}>
                      <div className="h-full transition-all duration-700 ease-out" style={{ width: `${volPercent}%`, background: 'var(--color-primary-container-base)' }} />
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => router.push(`/event/${featured!.id}`)}
                className="mt-6 w-full py-3 font-label font-black text-sm uppercase tracking-wider border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-150"
                style={{ background: 'var(--color-primary-container-base)', color: 'var(--color-on-primary-container-base)' }}
              >
                Sign Up to Help →
              </button>
            </div>

            {/* Organizer Card */}
            <div className="border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 flex items-center justify-between" style={{ background: 'var(--color-surface-container-lowest-base)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 border-2 border-black" style={{ background: 'var(--color-secondary-container-base)' }} />
                <div>
                  <p className="text-xs text-on-surface-variant font-label uppercase font-bold">Organized by</p>
                  <p className="font-bold text-sm text-on-surface">{featured!.organizer || 'Community Organizer'}</p>
                </div>
              </div>
              <button
                onClick={() => handleContactOrganizer(featured!.title)}
                className="w-9 h-9 flex items-center justify-center border-4 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-150"
                style={{ background: 'var(--color-tertiary-container-base)' }}
                title="Contact Organizer"
              >
                <Mail size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="px-6 md:px-10 mt-14 pb-4">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-headline font-black text-2xl uppercase tracking-tight text-on-background">Explore on Map</h2>
          </div>
          <div className="h-[400px] w-full overflow-hidden border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <MapWrapper events={events} alerts={alerts} />
          </div>
        </div>

        {/* Recommended */}
        {recommendedEvents.length > 0 && (
          <div className="px-6 md:px-10 mt-16 pb-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-headline font-black text-2xl uppercase tracking-tight text-on-background">Recommended for You</h2>
              <button
                onClick={() => router.push('/feed')}
                className="font-label font-bold text-sm uppercase tracking-wider text-on-surface-variant hover:text-on-surface transition-colors"
              >
                View All →
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 min-[560px]:grid-cols-2 md:gap-6 lg:grid-cols-3">
              {recommendedEvents.map((evt) => (
                <EventCard key={evt.id} event={evt} />
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  )
}
