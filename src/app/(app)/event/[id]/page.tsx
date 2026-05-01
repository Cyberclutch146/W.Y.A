'use client';
import { useRouter } from 'next/navigation';
import { ProgressBar } from '@/components/ProgressBar';
import { DonationPanel } from '@/components/DonationPanel';
import { ChatBox } from '@/components/ai/ChatBox';
import { VolunteerLeaderboard } from '@/components/VolunteerLeaderboard';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, use, useCallback } from 'react';
import { getEventById, deleteEvent, ADMIN_EMAILS } from '@/services/eventService';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Trash2, AlertTriangle, Info, Send } from 'lucide-react';
import { CommunityEvent } from '@/types';
import { SentinelAlert } from '@/types/sentinel';
import { isPointInPolygon, getDistanceMiles } from '@/utils/geo';

export default function EventDetails({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();
  const { user } = useAuth();

  const [event, setEvent] = useState<CommunityEvent | null>(null);
  const [alerts, setAlerts] = useState<SentinelAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const [smsNumber, setSmsNumber] = useState('');
  const [sendingSms, setSendingSms] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [id]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventData, alertsData] = await Promise.all([
          getEventById(id),
          fetch('/api/sentinel')
            .then((r) => r.json())
            .catch(() => []),
        ]);

        if (!eventData) {
          toast.error("Event not found.");
          router.push("/feed");
           return;
          }

        setEvent(eventData);
        setAlerts(alertsData);
      } catch (error) {
        console.error('Failed to load event data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const refreshEvent = useCallback(async () => {
    try {
      const data = await getEventById(id);
      if (data) setEvent(data);
    } catch (err) {
      console.error('Failed to refresh event:', err);
    }
  }, [id]);

  const handleDeleteEvent = async () => {
    if (
      !confirm(
        'ADMIN: Are you sure you want to delete this event? This action cannot be undone.'
      )
    )
      return;

    try {
      await deleteEvent(id);
      toast.success('Event deleted successfully.');
      router.push('/feed');
    } catch (error) {
      console.error('Failed to delete event:', error);
      toast.error('Failed to delete event.');
    }
  };

  const handleSendSms = async () => {
    if (!smsNumber.trim()) {
      toast.error('Please enter a phone number.');
      return;
    }

    if (!event) {
      toast.error('Event not loaded.');
      return;
    }

    setSendingSms(true);

    try {
      const res = await fetch('/api/sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: smsNumber,
          message: `Hi! You are invited to join "${event.title}" on CampusPulse. Location: ${event.location}. Please open the platform to volunteer or support this event.`,
          url: window.location.href     
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send SMS.');
      }

      toast.success('SMS sent successfully.');
      setSmsNumber('');
    } catch (error) {
      console.error('Failed to send SMS:', error);
      toast.error('Failed to send SMS.');
    } finally {
      setSendingSms(false);
    }
  };

  const isAdmin = ADMIN_EMAILS.includes(user?.email || '');

  if (loading) {
    return (
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full pb-28 md:pb-10 flex justify-center items-center">
        <div className="w-12 h-12 border-4 border-black border-t-transparent animate-spin" />
      </main>
    );
  }

  if (!event) return null;

  const intersectingAlerts = alerts.filter((alert: SentinelAlert) => {
    if (!event.lat || !event.lng) return false;

    if (alert.severity === 'Extreme' && alert.polygon && alert.polygon.length > 2) {
      if (isPointInPolygon({ lat: event.lat, lng: event.lng }, alert.polygon)) {
        return true;
      }
    }

    if (alert.coordinates?.lat && alert.coordinates?.lng) {
      const distance = getDistanceMiles(
        event.lat,
        event.lng,
        alert.coordinates.lat,
        alert.coordinates.lng
      );

      return distance <= 30;
    }

    return false;
  });

  return (
    <main className="flex-1 p-4 md:p-10 max-w-7xl mx-auto w-full pb-28 md:pb-10">
      <div className="mb-6">
        <Link
          href="/feed"
          className="inline-flex items-center gap-2 text-sm font-label font-bold uppercase tracking-wider text-on-surface-variant hover:text-on-surface transition-colors px-3 py-2 border-2 border-black/30 hover:border-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-150"
          style={{ background: 'var(--color-surface-container-base)' }}
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Feed
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          {/* Hero Image */}
          <div className="w-full h-64 md:h-96 overflow-hidden mb-8 relative border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <Image
              src={event.imageUrl || event.image || '/logo.svg'}
              alt={event.title || 'Event'}
              className="w-full h-full object-cover"
              fill
            />
          </div>

          {/* Event Info */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-label font-bold uppercase tracking-[0.14em] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                style={{ background: 'var(--color-secondary-container-base)', color: 'var(--color-on-secondary-container-base)' }}
              >
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                {event.organizer}
              </span>
              <span
                className="inline-flex items-center gap-1 px-3 py-1.5 text-[10px] font-label font-bold uppercase tracking-[0.14em] border-2 border-black"
                style={{ background: 'var(--color-surface-container-base)' }}
              >
                <span className="material-symbols-outlined text-sm">location_on</span>
                {event.distance}
              </span>
            </div>

            <h1 className="font-headline font-black text-3xl md:text-5xl uppercase tracking-tight text-on-surface mb-4 leading-none">
              {event.title}
            </h1>

            <p className="text-on-surface-variant text-base leading-relaxed max-w-2xl mb-6">
              Join your campus in supporting this initiative and stay informed about any nearby safety alerts.
            </p>

            {/* Admin Controls */}
            {isAdmin && (
              <div
                className="mb-6 p-4 flex items-center justify-between border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                style={{ background: 'var(--color-error-container-base)' }}
              >
                <div>
                  <p className="font-label font-black text-sm uppercase tracking-wider" style={{ color: 'var(--color-on-error-container-base)' }}>
                    Admin Controls
                  </p>
                  <p className="text-sm opacity-80" style={{ color: 'var(--color-on-error-container-base)' }}>
                    You have administrative privileges.
                  </p>
                </div>

                <button
                  onClick={handleDeleteEvent}
                  className="px-5 py-2.5 font-label font-black text-sm uppercase tracking-wider border-4 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-150 flex items-center gap-2 bg-red-600 text-white"
                >
                  <Trash2 size={18} />
                  Delete
                </button>
              </div>
            )}

            {/* Safety Alerts */}
            {intersectingAlerts.length > 0 && (
              <div
                className="mb-6 p-5 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                style={{ background: 'var(--color-tertiary-container-base)' }}
              >
                <div className="flex items-center gap-2 font-headline font-black uppercase tracking-tight mb-3 text-on-surface">
                  <AlertTriangle size={20} />
                  <h3 className="text-lg">Safety Alerts</h3>
                </div>

                <div className="space-y-3">
                  {intersectingAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="flex flex-col sm:flex-row sm:items-start gap-3 p-3 border-2 border-black"
                      style={{ background: 'var(--color-surface-container-base)' }}
                    >
                      <span
                        className={`px-2.5 py-1 text-[10px] font-label font-black uppercase tracking-wider whitespace-nowrap w-fit border-2 border-black ${
                          alert.severity === 'Extreme'
                            ? 'bg-red-500 text-white'
                            : alert.severity === 'Severe'
                              ? 'bg-orange-400 text-black'
                              : 'bg-amber-300 text-black'
                        }`}
                      >
                        {alert.severity} • {alert.type}
                      </span>

                      <div className="flex-1">
                        <p className="text-sm font-body font-bold text-on-surface mb-0.5">
                          {alert.title}
                        </p>
                        <p className="text-xs text-on-surface-variant line-clamp-2">
                          {alert.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="text-xs font-label font-bold uppercase tracking-wider mt-4 flex items-center gap-1.5 p-2.5 border-2 border-black text-on-surface" style={{ background: 'var(--color-surface-container-base)' }}>
                  <Info size={14} className="flex-shrink-0" />
                  Please exercise caution if you plan to attend.
                </p>
              </div>
            )}

            <p className="text-on-surface-variant text-lg leading-relaxed mb-6 font-body">
              {event.description}
            </p>

            {/* Social Sharing */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="text-[10px] font-label font-black uppercase tracking-[0.14em] text-on-surface-variant">
                Share:
              </span>

              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `🚀 Check out "${event.title}" on CampusPulse!\n\n${event.description?.slice(
                    0,
                    120
                  )}...\n\n📍 ${event.location}\n\n👉 ${
                    typeof window !== 'undefined' ? window.location.href : ''
                  }`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-label font-bold uppercase tracking-wider border-2 border-black hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-150 bg-green-400 text-black"
              >
                WhatsApp
              </a>

              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  `🚀 Check out "${event.title}" — a campus event at ${event.location}! #CampusPulse`
                )}&url=${encodeURIComponent(
                  typeof window !== 'undefined' ? window.location.href : ''
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-label font-bold uppercase tracking-wider border-2 border-black hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-150 bg-sky-400 text-black"
              >
                Post on X
              </a>
            </div>

            {/* Social Sharing */}
          </div>

          {/* Progress Bar */}
          {event.needs?.funds && (
            <div className="mb-10 p-6 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" style={{ background: 'var(--color-surface-container-base)' }}>
              <ProgressBar
                current={event.needs.funds.current}
                goal={event.needs.funds.goal}
                label={`$${event.needs.funds.current.toLocaleString()} raised of $${event.needs.funds.goal.toLocaleString()} goal`}
              />
            </div>
          )}

          {/* Chat & Leaderboard */}
          <div className="mt-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <ChatBox eventId={event.id} />
              <VolunteerLeaderboard eventId={event.id} />
            </div>
          </div>
        </div>

        {/* Sidebar — Donation Panel */}
        <div className="w-full lg:w-[400px] flex-shrink-0">
          <DonationPanel
            eventId={event.id}
            eventTitle={event.title}
            eventDescription={event.description}
            eventLocation={event.location}
            eventTime={
              event.eventDate
                ? new Date(event.eventDate).toLocaleString()
                : event.createdAt?.toDate?.()?.toLocaleString() || 'TBD'
            }
            enrolledCount={event.needs?.volunteers?.current || 0}
            needs={event.needs}
            onActionComplete={refreshEvent}
          />
        </div>
      </div>
    </main>
  );
}