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

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-44 md:h-96 overflow-hidden mb-5 md:mb-8 relative"
            style={{
              borderRadius: 'var(--r-2xl)',
              border: '1px solid var(--cp-border)',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <Image
              src={event.imageUrl || event.image || '/logo.svg'}
              alt={event.title || 'Event'}
              className="w-full h-full object-cover"
              fill
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </motion.div>

          {/* Event Info */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span
                className="pill-tag"
                style={{
                  background: 'hsl(from var(--cp-secondary) h s l / 0.12)',
                  color: 'var(--cp-secondary)',
                  border: '1px solid hsl(from var(--cp-secondary) h s l / 0.3)',
                }}
              >
                <Verified size={12} />
                {event.organizer}
              </span>
              <span
                className="pill-tag"
                style={{
                  background: 'var(--cp-surface-dim)',
                  color: 'var(--cp-text-2)',
                  border: '1px solid var(--cp-border)',
                }}
              >
                <MapPin size={12} />
                {event.distance}
              </span>
            </div>

            <h1
              className="font-headline font-bold text-2xl md:text-5xl tracking-tight leading-tight mb-3 md:mb-4"
              style={{ color: 'var(--cp-text-1)' }}
            >
              {event.title}
            </h1>

            <p className="text-base leading-relaxed max-w-2xl mb-6" style={{ color: 'var(--cp-text-2)' }}>
              Join your campus in supporting this initiative and stay informed about any nearby safety alerts.
            </p>

            {/* Admin Controls */}
            {isAdmin && (
              <div
                className="mb-6 p-4 flex items-center justify-between rounded-xl"
                style={{
                  background: 'hsl(from var(--cp-accent) h s l / 0.08)',
                  border: '1px solid hsl(from var(--cp-accent) h s l / 0.25)',
                }}
              >
                <div>
                  <p className="text-sm font-bold" style={{ color: 'var(--cp-accent)' }}>
                    Admin Controls
                  </p>
                  <p className="text-xs" style={{ color: 'var(--cp-text-3)' }}>
                    You have administrative privileges.
                  </p>
                </div>

                <button
                  onClick={handleDeleteEvent}
                  className="px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95 flex items-center gap-2 text-white"
                  style={{ background: 'var(--cp-accent)', boxShadow: '0 4px 12px -3px hsl(from var(--cp-accent) h s l / 0.5)' }}
                >
                  <Trash2 size={15} />
                  Delete
                </button>
              </div>
            )}



            <p className="text-base leading-relaxed mb-5 md:mb-6" style={{ color: 'var(--cp-text-2)' }}>
              {event.description}
            </p>

            {/* Social Sharing */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--cp-text-3)' }}>
                <Share2 size={13} /> Share:
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
              className="mb-6 md:mb-10 p-4 md:p-6 rounded-2xl"
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
          <div className="mt-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <ChatBox eventId={event.id} />
              <EngagementLeaderboard eventId={event.id} />
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
            enrolledCount={event.needs?.attendees?.current || 0}
            needs={event.needs || {}}
            onActionComplete={refreshEvent}
          />
        </div>
      </div>
    </main>
  );
}