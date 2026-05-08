'use client';
import { useRouter } from 'next/navigation';
import { ProgressBar } from '@/components/ProgressBar';
import { DonationPanel } from '@/components/DonationPanel';
import { ChatBox } from '@/components/ai/ChatBox';
import { EngagementLeaderboard } from '@/components/EngagementLeaderboard';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, use, useCallback } from 'react';
import { getEventById, deleteEvent, ADMIN_EMAILS } from '@/services/eventService';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Trash2, AlertTriangle, Info, Send, ArrowLeft, Verified, MapPin, Loader2, Share2 } from 'lucide-react';
import { CommunityEvent } from '@/types';

import { motion } from 'framer-motion';

export default function EventDetails({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();
  const { user } = useAuth();

  const [event, setEvent] = useState<CommunityEvent | null>(null);

  const [loading, setLoading] = useState(true);

  const [smsNumber, setSmsNumber] = useState('');
  const [sendingSms, setSendingSms] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [id]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventData = await getEventById(id);

        if (!eventData) {
          toast.error("Event not found.");
          router.push("/feed");
           return;
          }

        setEvent(eventData);

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
          message: `Hi! You are invited to join "${event.title}" on W.Y.A. Location: ${event.location}. Please open the platform to attendee or support this event.`,
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
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin" style={{ color: 'var(--cp-primary)' }} />
          <p className="text-sm font-semibold" style={{ color: 'var(--cp-text-3)' }}>Loading event...</p>
        </div>
      </main>
    );
  }

  if (!event) return null;



  return (
    <main className="flex-1 p-4 md:p-10 max-w-7xl mx-auto w-full pb-28 md:pb-10" style={{ color: 'var(--cp-text-1)' }}>
      {/* Back button */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        <Link
          href="/feed"
          className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl transition-all hover:scale-105"
          style={{
            background: 'var(--cp-surface-dim)',
            color: 'var(--cp-text-2)',
            border: '1px solid var(--cp-border)',
          }}
        >
          <ArrowLeft size={15} />
          Back to Feed
        </Link>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-8 relative">
        {/* Background Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[400px] bg-gradient-to-b from-[var(--cp-secondary)] to-transparent opacity-[0.05] blur-[100px] pointer-events-none rounded-full" />

        <div className="flex-1 min-w-0 z-10">
          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-64 md:h-[450px] overflow-hidden mb-8 md:mb-12 relative group"
            style={{
              borderRadius: 'var(--r-3xl)',
              border: '1px solid var(--cp-border)',
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            <Image
              src={event.imageUrl || event.image || '/logo.svg'}
              alt={event.title || 'Event'}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              fill
            />
            {/* Gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            
            {/* Floating Glassmorphic Info Badge */}
            <div className="absolute bottom-4 md:bottom-8 left-4 md:left-8 right-4 md:right-8 flex flex-col md:flex-row gap-4 justify-between items-end md:items-center">
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span
                    className="pill-tag"
                    style={{
                      background: 'hsl(from var(--cp-secondary) h s l / 0.8)',
                      color: '#000',
                      border: '1px solid hsl(from var(--cp-secondary) h s l / 0.5)',
                      backdropFilter: 'blur(8px)'
                    }}
                  >
                    <Verified size={12} />
                    {event.organizer}
                  </span>
                  <span
                    className="pill-tag"
                    style={{
                      background: 'rgba(0,0,0,0.4)',
                      color: '#fff',
                      border: '1px solid rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(8px)'
                    }}
                  >
                    <MapPin size={12} />
                    {event.distance || 'Local'}
                  </span>
                </div>
                <h1
                  className="font-headline font-bold text-3xl md:text-5xl lg:text-6xl tracking-tight leading-tight text-white drop-shadow-md"
                >
                  {event.title}
                </h1>
              </div>
            </div>
          </motion.div>

          {/* Event Info */}
          <motion.div
            className="mb-10"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center gap-4 py-4 mb-8 border-y" style={{ borderColor: 'var(--cp-border)' }}>
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--cp-text-3)' }}>Date & Time</p>
                <p className="text-sm font-medium" style={{ color: 'var(--cp-text-1)' }}>
                  {event.eventDate ? new Date(event.eventDate).toLocaleString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'TBD'}
                </p>
              </div>
              <div className="w-px h-10" style={{ background: 'var(--cp-border)' }} />
              <div className="flex-1 pl-4">
                <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--cp-text-3)' }}>Location</p>
                <p className="text-sm font-medium" style={{ color: 'var(--cp-text-1)' }}>{event.location}</p>
              </div>
            </div>

            <h2 className="text-xl md:text-2xl font-bold mb-4 font-headline" style={{ color: 'var(--cp-text-1)' }}>About this Event</h2>
            <p className="text-base md:text-lg leading-relaxed max-w-3xl mb-8" style={{ color: 'var(--cp-text-2)' }}>
              {event.description || "Join your campus in supporting this initiative and stay informed about any nearby safety alerts."}
            </p>

            {/* Admin Controls */}
            {isAdmin && (
              <div
                className="mb-8 p-5 flex flex-col md:flex-row items-start md:items-center justify-between rounded-2xl gap-4"
                style={{
                  background: 'hsl(from var(--cp-accent) h s l / 0.05)',
                  border: '1px solid hsl(from var(--cp-accent) h s l / 0.2)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <div>
                  <p className="text-sm font-bold flex items-center gap-2 mb-1" style={{ color: 'var(--cp-accent)' }}>
                    <AlertTriangle size={16} /> Admin Controls
                  </p>
                  <p className="text-sm" style={{ color: 'var(--cp-text-3)' }}>
                    You have administrative privileges to manage this event.
                  </p>
                </div>

                <button
                  onClick={handleDeleteEvent}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95 flex items-center gap-2 text-white shadow-lg"
                  style={{ background: 'var(--cp-accent)', boxShadow: '0 4px 12px -3px hsl(from var(--cp-accent) h s l / 0.4)' }}
                >
                  <Trash2 size={16} />
                  Delete Event
                </button>
              </div>
            )}

            {/* Social Sharing */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--cp-text-3)' }}>
                <Share2 size={14} /> Share:
              </span>

              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `🚀 Check out "${event.title}" on W.Y.A!\n\n${event.description?.slice(
                    0,
                    120
                  )}...\n\n📍 ${event.location}\n\n👉 ${
                    typeof window !== 'undefined' ? window.location.href : ''
                  }`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl transition-all hover:scale-105 active:scale-95"
                style={{
                  background: 'hsl(142, 70%, 45%)',
                  color: 'white',
                  boxShadow: '0 4px 12px -3px hsl(142, 70%, 45%, 0.4)',
                }}
              >
                WhatsApp
              </a>

              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  `🚀 Check out "${event.title}" — a campus event at ${event.location}! #WYA`
                )}&url=${encodeURIComponent(
                  typeof window !== 'undefined' ? window.location.href : ''
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl transition-all hover:scale-105 active:scale-95"
                style={{
                  background: 'hsl(203, 89%, 53%)',
                  color: 'white',
                  boxShadow: '0 4px 12px -3px hsl(203, 89%, 53%, 0.4)',
                }}
              >
                Post on X
              </a>
            </div>
          </motion.div>

          {/* Progress Bar */}
          {event.needs?.funds && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="mb-8 p-5 md:p-8 rounded-3xl"
              style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border)', boxShadow: 'var(--shadow-md)' }}
            >
              <ProgressBar
                current={event.needs.funds.current}
                goal={event.needs.funds.goal}
                label={`$${event.needs.funds.current.toLocaleString()} raised of $${event.needs.funds.goal.toLocaleString()} goal`}
              />
            </motion.div>
          )}

          {/* Chat & Leaderboard */}
          <div className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              <ChatBox eventId={event.id} />
              <EngagementLeaderboard eventId={event.id} />
            </div>
          </div>
        </div>

        {/* Sidebar — Donation Panel */}
        <div className="w-full lg:w-[420px] flex-shrink-0 sticky top-24 self-start">
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
            enrolledCount={event.needs?.attendees?.current || 0}
            needs={event.needs || {}}
            onActionComplete={refreshEvent}
          />
        </div>
      </div>
    </main>
  );
}