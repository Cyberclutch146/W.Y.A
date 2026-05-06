'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getEventsByOrganizer, getRegisteredEvents, backfillEventCoordinates } from '@/services/eventService';
import { CommunityEvent } from '@/types';
import Image from 'next/image';
import { LayoutDashboard, DollarSign, Users, AlertTriangle, MapIcon, PlusCircle, Heart, Megaphone } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [registeredEvents, setRegisteredEvents] = useState<CommunityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [backfilling, setBackfilling] = useState(false);

  const handleBackfill = async () => {
    if (!confirm('This will sequentially geocode all events missing coordinates. It takes ~1.5s per event. Continue?')) return;
    setBackfilling(true);
    try {
      const res = await backfillEventCoordinates();
      alert(`Backfill complete: Updated ${res.updated}, Failed ${res.failed} out of ${res.total} total events.`);
    } catch (err) {
      alert('Error backfilling: ' + String(err));
    } finally {
      setBackfilling(false);
    }
  };

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    const load = async () => {
      try {
        const [organizedData, registeredData] = await Promise.all([
          getEventsByOrganizer(user.uid),
          getRegisteredEvents(user.uid)
        ]);
        setEvents(organizedData);
        setRegisteredEvents(registeredData);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  // ── Aggregate Stats ──
  const totalRaised = events.reduce((sum, e) => sum + (e.needs?.funds?.current ?? 0), 0);
  const totalAttendees = events.reduce((sum, e) => sum + (e.needs?.attendees?.current ?? 0), 0);
  const activeCount = events.filter(e => e.status === 'active').length;

  if (!user) {
    return (
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full pb-32 md:pb-10 flex justify-center items-center">
        <p className="font-bold uppercase tracking-wider text-sm" style={{ color: 'var(--cp-text-2)' }}>Please sign in to view your dashboard.</p>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full pb-32 md:pb-10 flex justify-center items-center">
        <div className="w-12 h-12 animate-spin rounded-full border-4 border-t-transparent" style={{ borderColor: 'var(--cp-border)', borderTopColor: 'var(--cp-primary)' }} />
      </main>
    );
  }

  const statCards = [
    { label: 'Active Events', value: activeCount, icon: Megaphone, bg: 'var(--cp-primary-light)' },
    { label: 'Total Raised', value: `$${totalRaised.toLocaleString()}`, icon: DollarSign, bg: 'var(--cp-surface-dim)' },
    { label: 'Attendees', value: totalAttendees, icon: Users, bg: 'var(--cp-surface)' }
  ];

  return (
    <main className="flex-1 p-4 md:p-10 max-w-7xl mx-auto w-full pb-32 md:pb-10">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wider mb-4" style={{ borderRadius: 'var(--r-full)', background: 'var(--cp-primary-light)', color: 'var(--cp-primary)', border: '1px solid hsl(258 90% 63% / 0.2)' }}>
          <LayoutDashboard size={14} />
          Dashboard
        </div>
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-none" style={{ color: 'var(--cp-text-1)' }}>Your Impact</h2>
        <p className="mt-2 text-base" style={{ color: 'var(--cp-text-2)' }}>
          Welcome back, {profile?.displayName || 'Organizer'}. Here&apos;s your snapshot.
        </p>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-3 gap-2 sm:gap-5 mb-8 md:mb-10">
        {statCards.map((stat, i) => (
          <div
            key={stat.label}
            className="p-4 min-[430px]:p-5 transition-all duration-300 hover:-translate-y-1"
            style={{ borderRadius: 'var(--r-xl)', background: stat.bg, border: '1.5px solid var(--cp-border)', boxShadow: 'var(--shadow-sm)' }}
          >
            <div className="mb-3 flex items-center gap-2.5 min-[430px]:gap-3">
              <div
                className="w-10 h-10 flex items-center justify-center"
                style={{ background: 'var(--cp-surface)', borderRadius: 'var(--r-full)', boxShadow: 'var(--shadow-xs)' }}
              >
                <stat.icon size={18} style={{ color: 'var(--cp-text-1)' }} />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-wider min-[430px]:text-xs" style={{ color: 'var(--cp-text-2)' }}>{stat.label}</p>
            </div>
            <p className="text-xl font-bold min-[430px]:text-2xl md:text-4xl" style={{ color: 'var(--cp-text-1)' }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* ── Events Grid ── */}
      <div className="mb-6 flex flex-col gap-3 min-[560px]:flex-row min-[560px]:items-center min-[560px]:justify-between">
        <h3 className="text-xl font-bold tracking-tight" style={{ color: 'var(--cp-text-1)' }}>Your Events</h3>
        <div className="flex flex-col gap-3 min-[430px]:flex-row min-[430px]:items-center">
          <button
            onClick={handleBackfill}
            disabled={backfilling}
            className="btn-secondary flex items-center justify-center gap-2"
          >
            <MapIcon size={16} />
            {backfilling ? 'Refreshing...' : 'Refresh Coords'}
          </button>
          <button
            onClick={() => router.push('/create')}
            className="btn-primary flex items-center justify-center gap-2"
          >
            <PlusCircle size={16} />
            New Event
          </button>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="p-8 flex flex-col items-center justify-center text-center py-16" style={{ borderRadius: 'var(--r-xl)', background: 'var(--cp-surface)', border: '1.5px dashed var(--cp-border)' }}>
          <Heart size={48} className="mb-4" style={{ color: 'var(--cp-text-3)' }} />
          <h3 className="text-xl font-bold tracking-tight mb-2" style={{ color: 'var(--cp-text-1)' }}>No events yet</h3>
          <p className="max-w-md mb-6 text-sm" style={{ color: 'var(--cp-text-2)' }}>
            You haven&apos;t organized any events yet. Start a local initiative and rally your campus!
          </p>
          <button
            onClick={() => router.push('/create')}
            className="btn-primary"
          >
            Create Your First Event
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 min-[560px]:grid-cols-2 md:gap-6 lg:grid-cols-3">
          {events.map(event => (
            <EventCard key={event.id} event={event} onClick={() => router.push(`/dashboard/event/${event.id}`)} />
          ))}
        </div>
      )}

      {/* ── Registered Events Section ── */}
      {registeredEvents.length > 0 && (
        <div className="mt-10 md:mt-16">
          <div className="mb-5 md:mb-6">
            <h3 className="text-xl font-bold tracking-tight" style={{ color: 'var(--cp-text-1)' }}>Events You&apos;re Supporting</h3>
            <p className="text-sm mt-1" style={{ color: 'var(--cp-text-2)' }}>Initiatives you&apos;re helping through attendee support.</p>
          </div>
          <div className="grid grid-cols-1 gap-4 min-[560px]:grid-cols-2 md:gap-6 lg:grid-cols-3">
            {registeredEvents.map(event => (
              <EventCard key={event.id} event={event} onClick={() => router.push(`/event/${event.id}`)} />
            ))}
          </div>
        </div>
      )}
    </main>
  );
}

// ── Helper Component for Event Cards ──
function EventCard({ event, onClick }: { event: CommunityEvent, onClick: () => void }) {
  const fundPercent = event.needs?.funds ? Math.min(100, Math.round((event.needs.funds.current / event.needs.funds.goal) * 100)) : null;
  const volPercent = event.needs?.attendees ? Math.min(100, Math.round((event.needs.attendees.current / event.needs.attendees.goal) * 100)) : null;

  return (
    <button
      onClick={onClick}
      className="overflow-hidden text-left transition-all duration-300 group flex flex-col h-full active:scale-[0.98]"
      style={{ background: 'var(--cp-surface)', borderRadius: 'var(--r-lg)', border: '1.5px solid var(--cp-border)', boxShadow: 'var(--shadow-sm)' }}
    >
      <div className="relative h-32 md:h-40 w-full overflow-hidden" style={{ borderBottom: '1.5px solid var(--cp-border)' }}>
        <Image
          src={event.imageUrl || '/logo.svg'}
          alt={event.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <span
          className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 shadow-sm"
          style={event.status === 'active' ? {
            background: 'var(--cp-primary)',
            color: '#fff',
            borderRadius: 'var(--r-full)',
          } : {
            background: 'var(--cp-surface)',
            color: 'var(--cp-text-2)',
            borderRadius: 'var(--r-full)',
          }}
        >
          {event.status === 'active' ? '● Active' : 'Done'}
        </span>
      </div>

      <div className="p-3.5 md:p-5 flex flex-col flex-1">
        <div>
          <h4 className="font-bold mb-1 line-clamp-1 text-base" style={{ color: 'var(--cp-text-1)' }}>{event.title}</h4>
          <p className="text-sm mb-4" style={{ color: 'var(--cp-text-2)' }}>{event.category}</p>
        </div>

        {fundPercent !== null && (
          <div className="mb-3">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider mb-1">
              <span style={{ color: 'var(--cp-text-2)' }}>Funds</span>
              <span style={{ color: 'var(--cp-text-1)' }}>{fundPercent}%</span>
            </div>
            <div className="w-full h-2 overflow-hidden" style={{ background: 'var(--cp-surface-dim)', borderRadius: 'var(--r-full)' }}>
              <div className="h-full transition-all duration-700" style={{ width: `${fundPercent}%`, background: 'var(--cp-primary)', borderRadius: 'var(--r-full)' }} />
            </div>
          </div>
        )}

        {volPercent !== null && (
          <div className="mb-3">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider mb-1">
              <span style={{ color: 'var(--cp-text-2)' }}>Attendees</span>
              <span style={{ color: 'var(--cp-text-1)' }}>{volPercent}%</span>
            </div>
            <div className="w-full h-2 overflow-hidden" style={{ background: 'var(--cp-surface-dim)', borderRadius: 'var(--r-full)' }}>
              <div className="h-full transition-all duration-700" style={{ width: `${volPercent}%`, background: 'hsl(140, 80%, 40%)', borderRadius: 'var(--r-full)' }} />
            </div>
          </div>
        )}

        <div className="mt-auto pt-4 flex items-center justify-end" style={{ borderTop: '1px solid var(--cp-border)' }}>
          <span className="font-bold text-xs uppercase tracking-wider" style={{ color: 'var(--cp-primary)' }}>View details →</span>
        </div>
      </div>
    </button>
  );
}
