'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getEventsByOrganizer, getRegisteredEvents, backfillEventCoordinates } from '@/services/eventService';
import { CommunityEvent } from '@/types';
import Image from 'next/image';
import { SentinelAlert } from '@/types/sentinel';
import { isPointInPolygon, getDistanceMiles } from '@/utils/geo';

export default function DashboardPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [registeredEvents, setRegisteredEvents] = useState<CommunityEvent[]>([]);
  const [alerts, setAlerts] = useState<SentinelAlert[]>([]);
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
        const [organizedData, registeredData, alertsData] = await Promise.all([
          getEventsByOrganizer(user.uid),
          getRegisteredEvents(user.uid),
          fetch('/api/sentinel').then(res => res.ok ? res.json() : [])
        ]);
        setEvents(organizedData);
        setRegisteredEvents(registeredData);
        setAlerts(alertsData);
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
  const totalVolunteers = events.reduce((sum, e) => sum + (e.needs?.volunteers?.current ?? 0), 0);
  const activeCount = events.filter(e => e.status === 'active').length;
  const highRiskAlertsCount = alerts.filter(a => a.severity === 'Extreme' || a.severity === 'Severe').length;

  if (!user) {
    return (
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full pb-32 md:pb-10 flex justify-center items-center">
        <p className="text-on-surface-variant font-label font-bold uppercase tracking-wider">Please sign in to view your dashboard.</p>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full pb-32 md:pb-10 flex justify-center items-center">
        <div className="w-12 h-12 border-4 border-black border-t-transparent animate-spin" />
      </main>
    );
  }

  const statCards = [
    { label: 'Active Events', value: activeCount, icon: 'campaign', bg: '--color-primary-container-base' },
    { label: 'Total Raised', value: `$${totalRaised.toLocaleString()}`, icon: 'attach_money', bg: '--color-secondary-container-base' },
    { label: 'Volunteers', value: totalVolunteers, icon: 'group', bg: '--color-tertiary-container-base' },
    { label: 'Severe Alerts', value: highRiskAlertsCount, icon: 'warning', bg: '--color-error-container-base' },
  ];

  return (
    <main className="flex-1 p-4 md:p-10 max-w-7xl mx-auto w-full pb-32 md:pb-10">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 text-[10px] font-label font-bold uppercase tracking-[0.16em] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mb-4" style={{ background: 'var(--color-secondary-container-base)', color: 'var(--color-on-secondary-container-base)' }}>
          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
          Dashboard
        </div>
        <h2 className="font-headline font-black text-4xl md:text-5xl uppercase tracking-tight text-on-surface leading-none">Your Impact</h2>
        <p className="text-on-surface-variant font-body mt-2">
          Welcome back, {profile?.displayName || 'Organizer'}. Here&apos;s your snapshot.
        </p>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4 mb-10">
        {statCards.map((stat, i) => (
          <div
            key={stat.label}
            className="p-4 min-[430px]:p-5 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            style={{ background: `var(${stat.bg})` }}
          >
            <div className="mb-3 flex items-center gap-2.5 min-[430px]:gap-3">
              <span
                className="material-symbols-outlined text-[20px] w-10 h-10 flex items-center justify-center border-2 border-black"
                style={{ fontVariationSettings: "'FILL' 1", background: 'var(--color-surface-container-lowest-base)' }}
              >
                {stat.icon}
              </span>
              <p className="text-[10px] font-label font-black uppercase tracking-[0.14em] text-on-surface min-[430px]:text-xs">{stat.label}</p>
            </div>
            <p className="text-2xl font-headline font-black text-on-surface min-[430px]:text-3xl md:text-4xl">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* ── Events Grid ── */}
      <div className="mb-6 flex flex-col gap-3 min-[560px]:flex-row min-[560px]:items-center min-[560px]:justify-between">
        <h3 className="font-headline font-black text-xl uppercase tracking-tight text-on-surface">Your Events</h3>
        <div className="flex flex-col gap-3 min-[430px]:flex-row min-[430px]:items-center">
          <button
            onClick={handleBackfill}
            disabled={backfilling}
            className="flex items-center justify-center gap-2 py-2.5 px-4 font-label font-bold text-sm uppercase tracking-wider border-4 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-150 text-on-surface disabled:opacity-50"
            style={{ background: 'var(--color-surface-container-base)' }}
          >
            <span className="material-symbols-outlined text-[18px]">map</span>
            {backfilling ? 'Refreshing...' : 'Refresh Coords'}
          </button>
          <button
            onClick={() => router.push('/create')}
            className="flex items-center justify-center gap-2 py-2.5 px-4 font-label font-black text-sm uppercase tracking-wider border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-150"
            style={{ background: 'var(--color-primary-container-base)', color: 'var(--color-on-primary-container-base)' }}
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Event
          </button>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="p-8 flex flex-col items-center justify-center text-center py-16 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]" style={{ background: 'var(--color-surface-container-base)' }}>
          <span className="material-symbols-outlined text-[64px] mb-4 text-on-surface-variant">volunteer_activism</span>
          <h3 className="font-headline font-black text-xl uppercase tracking-tight text-on-surface mb-2">No events yet</h3>
          <p className="text-on-surface-variant max-w-md mb-6 font-body">
            You haven&apos;t organized any events yet. Start a local initiative and rally your campus!
          </p>
          <button
            onClick={() => router.push('/create')}
            className="px-6 py-3 font-label font-black text-sm uppercase tracking-wider border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-150"
            style={{ background: 'var(--color-primary-container-base)', color: 'var(--color-on-primary-container-base)' }}
          >
            Create Your First Event
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 min-[560px]:grid-cols-2 md:gap-6 lg:grid-cols-3">
          {events.map(event => (
            <EventCard key={event.id} event={event} alerts={alerts} onClick={() => router.push(`/dashboard/event/${event.id}`)} />
          ))}
        </div>
      )}

      {/* ── Registered Events Section ── */}
      {registeredEvents.length > 0 && (
        <div className="mt-16">
          <div className="mb-6">
            <h3 className="font-headline font-black text-xl uppercase tracking-tight text-on-surface">Events You&apos;re Supporting</h3>
            <p className="text-on-surface-variant text-sm mt-1 font-body">Initiatives you&apos;re helping through volunteer support.</p>
          </div>
          <div className="grid grid-cols-1 gap-4 min-[560px]:grid-cols-2 md:gap-6 lg:grid-cols-3">
            {registeredEvents.map(event => (
              <EventCard key={event.id} event={event} alerts={alerts} onClick={() => router.push(`/event/${event.id}`)} />
            ))}
          </div>
        </div>
      )}
    </main>
  );
}

// ── Helper Component for Event Cards ──
function EventCard({ event, alerts, onClick }: { event: CommunityEvent, alerts: SentinelAlert[], onClick: () => void }) {
  const fundPercent = event.needs?.funds ? Math.min(100, Math.round((event.needs.funds.current / event.needs.funds.goal) * 100)) : null;
  const volPercent = event.needs?.volunteers ? Math.min(100, Math.round((event.needs.volunteers.current / event.needs.volunteers.goal) * 100)) : null;

  const intersectingAlerts = alerts.filter((alert: SentinelAlert) => {
    if (!event.lat || !event.lng) return false;
    if (alert.polygon && alert.polygon.length > 0) {
      return isPointInPolygon({ lat: event.lat, lng: event.lng }, alert.polygon);
    } else if (alert.coordinates) {
      const dist = getDistanceMiles(event.lat, event.lng, alert.coordinates.lat, alert.coordinates.lng);
      return dist <= 30;
    }
    return false;
  });
  const hasAlerts = intersectingAlerts.length > 0;

  return (
    <button
      onClick={onClick}
      className="overflow-hidden text-left transition-all duration-150 group flex flex-col h-full border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
      style={{ background: 'var(--color-surface-container-lowest-base)' }}
    >
      <div className="relative h-40 w-full overflow-hidden border-b-4 border-black">
        <Image
          src={event.imageUrl || '/logo.svg'}
          alt={event.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {hasAlerts && (
          <span className="absolute top-3 left-3 text-[10px] font-label font-black uppercase tracking-wider px-2.5 py-1 border-2 border-black bg-red-500 text-white flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">warning</span> Alert
          </span>
        )}
        <span
          className="absolute top-3 right-3 text-[10px] font-label font-black uppercase tracking-wider px-2.5 py-1 border-2 border-black"
          style={event.status === 'active' ? {
            background: 'var(--color-primary-container-base)',
            color: 'var(--color-on-primary-container-base)',
          } : {
            background: 'var(--color-surface-container-base)',
            color: 'var(--color-on-surface-variant-base)',
          }}
        >
          {event.status === 'active' ? '● Active' : 'Done'}
        </span>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div>
          <h4 className="font-headline font-black text-on-surface mb-1 line-clamp-1 uppercase tracking-tight">{event.title}</h4>
          <p className="text-on-surface-variant text-sm mb-4 font-body">{event.category}</p>
        </div>

        {fundPercent !== null && (
          <div className="mb-3">
            <div className="flex justify-between text-[10px] font-label font-bold uppercase tracking-wider mb-1">
              <span className="text-on-surface-variant">Funds</span>
              <span className="text-on-surface font-black">{fundPercent}%</span>
            </div>
            <div className="w-full h-3 overflow-hidden border-2 border-black" style={{ background: 'var(--color-surface-container-base)' }}>
              <div className="h-full transition-all duration-700" style={{ width: `${fundPercent}%`, background: 'var(--color-primary-container-base)' }} />
            </div>
          </div>
        )}

        {volPercent !== null && (
          <div className="mb-3">
            <div className="flex justify-between text-[10px] font-label font-bold uppercase tracking-wider mb-1">
              <span className="text-on-surface-variant">Volunteers</span>
              <span className="text-on-surface font-black">{volPercent}%</span>
            </div>
            <div className="w-full h-3 overflow-hidden border-2 border-black" style={{ background: 'var(--color-surface-container-base)' }}>
              <div className="h-full transition-all duration-700" style={{ width: `${volPercent}%`, background: 'var(--color-secondary-container-base)' }} />
            </div>
          </div>
        )}

        <div className="mt-auto pt-4 border-t-2 border-black">
          <span className="font-label font-black text-sm uppercase tracking-wider text-on-surface">View details →</span>
        </div>
      </div>
    </button>
  );
}
