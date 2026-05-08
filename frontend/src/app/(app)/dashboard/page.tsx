'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getEventsByOrganizer, getRegisteredEvents, backfillEventCoordinates } from '@/services/eventService';
import { CommunityEvent } from '@/types';
import Image from 'next/image';
import { LayoutDashboard, DollarSign, Users, AlertTriangle, MapIcon, PlusCircle, Heart, Megaphone, Info, ChevronRight, X } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [registeredEvents, setRegisteredEvents] = useState<CommunityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [backfilling, setBackfilling] = useState(false);
  const [showPulseInfo, setShowPulseInfo] = useState(false);

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

      {/* ── Campus Pulse Network ── */}
      <div 
        className="mb-10 p-6 md:p-8 overflow-hidden relative group"
        style={{ borderRadius: 'var(--r-2xl)', background: 'var(--cp-surface)', border: '1px solid var(--cp-border)', boxShadow: '0 8px 32px -8px rgba(0,0,0,0.08)' }}
      >
        {/* Subtle background glow */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, var(--cp-primary-light) 0%, transparent 70%)' }} />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <h3 className="text-xl font-bold tracking-tight" style={{ color: 'var(--cp-text-1)' }}>Category Interest Pulse</h3>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <button 
                onClick={() => setShowPulseInfo(!showPulseInfo)}
                className="ml-2 p-1 rounded-full transition-colors hover:bg-black/5 dark:hover:bg-white/10"
                style={{ color: 'var(--cp-text-3)' }}
                title="What is this?"
              >
                <Info size={16} />
              </button>
            </div>
            <p className="text-sm font-medium" style={{ color: 'var(--cp-text-2)' }}>Live RSVP activity across your event categories</p>
          </div>
          <div className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2" style={{ background: 'var(--cp-surface-dim)', color: 'var(--cp-text-2)', border: '1px solid var(--cp-border)' }}>
            <MapIcon size={12} /> Live Sync Active
          </div>
        </div>

        {/* Instruction Manual Modal */}
        {showPulseInfo && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowPulseInfo(false)} />
            <div className="relative w-full max-w-md p-6 md:p-8 rounded-2xl border animate-in zoom-in-95 duration-200"
                 style={{ background: 'var(--cp-surface)', borderColor: 'var(--cp-border)', boxShadow: '0 24px 48px -12px rgba(0,0,0,0.25)' }}>
              <button 
                onClick={() => setShowPulseInfo(false)}
                className="absolute top-4 right-4 p-2 rounded-full transition-colors hover:bg-black/5 dark:hover:bg-white/10"
                style={{ color: 'var(--cp-text-3)' }}
              >
                <X size={18} />
              </button>
              
              <div className="w-12 h-12 rounded-full mb-4 flex items-center justify-center" style={{ background: 'var(--cp-primary-light)', color: 'var(--cp-primary)' }}>
                <Info size={24} />
              </div>

              <h4 className="font-bold text-xl mb-3 tracking-tight" style={{ color: 'var(--cp-text-1)' }}>
                How the Pulse works
              </h4>
              <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--cp-text-2)' }}>
                The <strong>Category Interest Pulse</strong> visualizes the popularity of your event themes. It automatically scans all your organized events and aggregates the total number of RSVPs per category (e.g., Tech, Social, Sports). 
                <br /><br />
                Larger, faster-pulsing nodes indicate higher audience interest, helping you instantly identify what type of events your community loves the most.
              </p>
              <button 
                onClick={() => setShowPulseInfo(false)} 
                className="w-full py-3 rounded-xl text-sm font-bold transition-transform active:scale-95" 
                style={{ background: 'var(--cp-primary)', color: 'var(--cp-surface)' }}
              >
                Got it, thanks!
              </button>
            </div>
          </div>
        )}

        <div className="relative pt-4 pb-8 px-4 md:px-12">
          {(() => {
            const extractCategories = () => {
              const categoryCounts: Record<string, number> = {};
              events.forEach(e => {
                const cat = e.category || 'General';
                categoryCounts[cat] = (categoryCounts[cat] || 0) + (e.needs?.attendees?.current ?? 0);
              });
              
              const entries = Object.entries(categoryCounts);
              if (entries.length === 0) {
                 return [
                   { category: 'Tech', rsvps: 0 },
                   { category: 'Social', rsvps: 0 },
                   { category: 'Sports', rsvps: 0 },
                   { category: 'Academic', rsvps: 0 },
                   { category: 'Creative', rsvps: 0 }
                 ];
              }
              // pad with empty categories if needed to make it look nice
              const defaultCats = ['Tech', 'Social', 'Sports', 'Academic', 'Creative'];
              let result = entries.sort((a,b) => b[1] - a[1]).slice(0, 5).map(e => ({ category: e[0], rsvps: e[1] }));
              while (result.length < 5) {
                const missingCat = defaultCats.find(c => !result.some(r => r.category === c)) || `Other ${result.length}`;
                result.push({ category: missingCat, rsvps: 0 });
              }
              return result;
            };

            const categoryStats = extractCategories();
            // Ensure a baseline max so 1 RSVP doesn't look like maximum capacity
            const maxRSVPs = Math.max(...categoryStats.map(z => z.rsvps), 10);

            return (
              <div className="relative flex justify-between items-center w-full">
                {/* Connecting Line */}
                <div className="absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full" style={{ background: 'var(--cp-border)' }} />
                
                {categoryStats.map(({ category, rsvps }, index) => {
                  const percentage = Math.round((rsvps / maxRSVPs) * 100);
                  const hasActivity = rsvps > 0;
                  
                  // Calculate dynamic sizing and glow based on activity
                  const nodeSize = hasActivity ? 16 + (percentage / 100) * 32 : 12; // 12px min, 48px max
                  
                  return (
                    <div key={category + index} className="relative z-10 flex flex-col items-center group cursor-crosshair">
                      {/* Node Container */}
                      <div className="relative flex items-center justify-center w-16 h-16">
                        {/* Hover Tooltip */}
                        <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap z-50 pointer-events-none"
                             style={{ background: 'var(--cp-text-1)', color: 'var(--cp-surface)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                          {rsvps} RSVPs
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45" style={{ background: 'var(--cp-text-1)' }} />
                        </div>

                        {/* Pulse Ring */}
                        {hasActivity && (
                           <div 
                             className="absolute inset-0 rounded-full animate-ping opacity-20" 
                             style={{ 
                               background: 'var(--cp-primary)',
                               animationDuration: `${3 - (percentage / 100) * 1.5}s` 
                             }} 
                           />
                        )}
                        
                        {/* Core Node */}
                        <div 
                          className="relative rounded-full transition-all duration-500 group-hover:scale-110"
                          style={{
                            width: `${nodeSize}px`,
                            height: `${nodeSize}px`,
                            background: hasActivity ? 'var(--cp-primary)' : 'var(--cp-surface)',
                            border: `2px solid ${hasActivity ? 'var(--cp-surface)' : 'var(--cp-border)'}`,
                            boxShadow: hasActivity ? '0 0 20px hsl(from var(--cp-primary) h s l / 0.5), inset 0 0 8px rgba(0,0,0,0.2)' : 'none',
                            zIndex: 10
                          }}
                        />
                      </div>
                      
                      {/* Label */}
                      <div className="absolute top-16 mt-2 flex flex-col items-center">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-center leading-tight whitespace-nowrap" style={{ color: hasActivity ? 'var(--cp-text-1)' : 'var(--cp-text-3)' }}>
                          {category}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      </div>

      {/* ── Insights & Action ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {/* Top Performing Events */}
        <div className="p-6 rounded-2xl border" style={{ background: 'var(--cp-surface)', borderColor: 'var(--cp-border)', boxShadow: '0 8px 32px -8px rgba(0,0,0,0.04)' }}>
          <h3 className="text-lg font-bold tracking-tight mb-4" style={{ color: 'var(--cp-text-1)' }}>Top Performing Events</h3>
          <div className="space-y-4">
            {events.length > 0 ? [...events].sort((a,b) => (b.needs?.attendees?.current || 0) - (a.needs?.attendees?.current || 0)).slice(0, 3).map(event => (
              <div key={event.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer" onClick={() => router.push(`/event/${event.id}`)}>
                 <div>
                    <p className="text-sm font-bold truncate max-w-[180px]" style={{ color: 'var(--cp-text-1)' }}>{event.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--cp-text-3)' }}>{event.category || 'General'}</p>
                 </div>
                 <div className="text-right">
                    <p className="text-sm font-black" style={{ color: 'var(--cp-primary)' }}>{event.needs?.attendees?.current || 0}</p>
                    <p className="text-[10px] uppercase font-bold" style={{ color: 'var(--cp-text-3)' }}>RSVPs</p>
                 </div>
              </div>
            )) : (
              <div className="text-center py-6">
                <p className="text-sm font-medium" style={{ color: 'var(--cp-text-3)' }}>No events to display</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Required */}
        <div className="p-6 rounded-2xl border" style={{ background: 'var(--cp-surface)', borderColor: 'var(--cp-border)', boxShadow: '0 8px 32px -8px rgba(0,0,0,0.04)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold tracking-tight" style={{ color: 'var(--cp-text-1)' }}>Action Required</h3>
            <span className="flex h-5 w-5 bg-orange-500/20 text-orange-500 rounded-full items-center justify-center text-[10px] font-bold">
              {events.filter(e => (e.needs?.attendees?.current || 0) < 5).length}
            </span>
          </div>
          <div className="space-y-4">
            {events.length > 0 && events.filter(e => (e.needs?.attendees?.current || 0) < 5).slice(0,3).length > 0 ? events.filter(e => (e.needs?.attendees?.current || 0) < 5).slice(0,3).map(event => (
              <div key={event.id} className="flex items-start gap-3 p-3 rounded-xl bg-orange-500/5 border border-orange-500/10 cursor-pointer" onClick={() => router.push(`/event/${event.id}`)}>
                <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500 mt-0.5">
                   <AlertTriangle size={14} />
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: 'var(--cp-text-1)' }}>{event.title}</p>
                  <p className="text-xs leading-tight mt-1" style={{ color: 'var(--cp-text-2)' }}>Low RSVPs. Consider promoting this event to reach more people.</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-6 flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center mb-2">
                  <Heart size={16} className="text-emerald-500" />
                </div>
                <p className="text-sm font-medium" style={{ color: 'var(--cp-text-1)' }}>You&apos;re all caught up!</p>
                <p className="text-xs" style={{ color: 'var(--cp-text-3)' }}>No events need your immediate attention.</p>
              </div>
            )}
          </div>
        </div>
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
              <div className="h-full transition-all duration-700" style={{ width: `${volPercent}%`, background: 'var(--cp-secondary)', borderRadius: 'var(--r-full)' }} />
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
