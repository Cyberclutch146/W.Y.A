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
import { Trash2, AlertTriangle, ArrowLeft, Verified, MapPin, Loader2, Share2, Calendar, X, ZoomIn } from 'lucide-react';
import { CommunityEvent } from '@/types';
import { AnimatePresence, motion } from 'framer-motion';

export default function EventDetails({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();
  const { user } = useAuth();

  const [event, setEvent] = useState<CommunityEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

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
  }, [id, router]);

  const refreshEvent = useCallback(async () => {
    try {
      const data = await getEventById(id);
      if (data) setEvent(data);
    } catch (err) {
      console.error('Failed to refresh event:', err);
    }
  }, [id]);

  const handleDeleteEvent = async () => {
    if (!confirm('ADMIN: Are you sure you want to delete this event? This action cannot be undone.')) return;
    try {
      await deleteEvent(id);
      toast.success('Event deleted successfully.');
      router.push('/feed');
    } catch (error) {
      console.error('Failed to delete event:', error);
      toast.error('Failed to delete event.');
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
        <div className="col-span-1 lg:col-span-8 z-10 space-y-6">
          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => setIsPreviewOpen(true)}
            className="w-full h-[280px] md:h-[380px] overflow-hidden relative group cursor-zoom-in"
            style={{
              borderRadius: '24px',
              border: '4px solid var(--cp-border)',
              boxShadow: '6px 6px 0px var(--cp-primary)',
            }}
          >
            <Image
              src={event.imageUrl || event.image || '/logo.svg'}
              alt={event.title || 'Event'}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              fill
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            
            {/* Zoom Hint */}
            <div className="absolute top-4 right-4 p-2 bg-black/40 backdrop-blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <ZoomIn size={20} className="text-white" />
            </div>

            <div className="absolute bottom-4 md:bottom-8 left-4 md:left-8 right-4 md:right-8 flex flex-col md:flex-row gap-4 justify-between items-end md:items-center">
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="pill-tag" style={{ background: 'hsl(from var(--cp-secondary) h s l / 0.8)', color: '#000', border: '1px solid hsl(from var(--cp-secondary) h s l / 0.5)', backdropFilter: 'blur(8px)' }}>
                    <Verified size={12} />
                    {event.organizer}
                  </span>
                  <span className="pill-tag" style={{ background: 'rgba(0,0,0,0.4)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}>
                    <MapPin size={12} />
                    {event.distance || 'Local'}
                  </span>
                </div>
                <h1 className="font-headline font-bold text-3xl md:text-5xl lg:text-6xl tracking-tight leading-tight text-white drop-shadow-md uppercase">
                  {event.title}
                </h1>
              </div>
            </div>
          </motion.div>

          {/* Bento Grid: Date/Time & Location */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            <div className="p-5 rounded-2xl flex items-center gap-4 group" style={{ background: 'var(--cp-surface)', border: '2px solid var(--cp-border)', boxShadow: '4px 4px 0px var(--cp-secondary)' }}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-transform group-hover:-rotate-12" style={{ background: 'var(--cp-secondary)', color: '#000' }}>
                <Calendar size={22} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-0.5" style={{ color: 'var(--cp-secondary)' }}>When</p>
                <p className="text-sm md:text-base font-bold font-headline leading-tight" style={{ color: 'var(--cp-text-1)' }}>
                  {event.eventDate ? new Date(event.eventDate).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'TBD'}
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl flex items-center gap-4 group" style={{ background: 'var(--cp-surface)', border: '2px solid var(--cp-border)', boxShadow: '4px 4px 0px var(--cp-orange)' }}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-transform group-hover:rotate-12" style={{ background: 'var(--cp-orange)', color: '#000' }}>
                <MapPin size={22} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-0.5" style={{ color: 'var(--cp-orange)' }}>Where</p>
                <p className="text-sm md:text-base font-bold font-headline leading-tight line-clamp-1" style={{ color: 'var(--cp-text-1)' }}>
                  {event.location}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Rundown */}
          <motion.div
            className="p-8 md:p-10 rounded-3xl relative overflow-hidden group"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            style={{ background: 'var(--cp-surface)', border: '4px solid var(--cp-border)', boxShadow: '6px 6px 0px var(--cp-violet)' }}
          >
            <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(var(--cp-violet) 2px, transparent 2px)', backgroundSize: '16px 16px' }} />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-black mb-6 font-headline tracking-tighter uppercase" style={{ color: 'var(--cp-text-1)' }}>The Rundown</h2>
              <p className="text-base md:text-lg leading-relaxed font-medium" style={{ color: 'var(--cp-text-2)' }}>
                {event.description || "Join your campus in supporting this initiative and stay informed about any nearby safety alerts."}
              </p>
            </div>
          </motion.div>

          {/* Admin & Social */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="space-y-6"
          >
            {isAdmin && (
              <div className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between rounded-2xl gap-4" style={{ background: 'var(--cp-surface)', border: '3px solid var(--cp-accent)', boxShadow: '4px 4px 0px var(--cp-accent)' }}>
                <div>
                  <p className="text-sm font-black uppercase tracking-widest flex items-center gap-2 mb-1" style={{ color: 'var(--cp-accent)' }}>
                    <AlertTriangle size={16} /> Admin Panel
                  </p>
                  <p className="text-sm font-medium" style={{ color: 'var(--cp-text-1)' }}>You have administrative privileges to manage this event.</p>
                </div>
                <button onClick={handleDeleteEvent} className="px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all active:translate-y-1 flex items-center gap-2 text-white" style={{ background: 'var(--cp-accent)', border: '2px solid var(--cp-border)' }}>
                  <Trash2 size={16} />
                  Delete Event
                </button>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5" style={{ color: 'var(--cp-text-3)' }}>
                <Share2 size={14} /> Share
              </span>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`🚀 Check out "${event.title}" on W.Y.A!\n\n📍 ${event.location}\n\n👉 ${typeof window !== 'undefined' ? window.location.href : ''}`)}`}
                target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all hover:scale-105 active:scale-95"
                style={{ background: 'hsl(142, 70%, 45%)', color: 'white', border: '2px solid var(--cp-border)', boxShadow: '3px 3px 0px hsl(from hsl(142, 70%, 45%) h s l / 0.5)' }}
              > WhatsApp </a>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`🚀 Check out "${event.title}" — a campus event at ${event.location}! #WYA`)}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all hover:scale-105 active:scale-95"
                style={{ background: 'hsl(203, 89%, 53%)', color: 'white', border: '2px solid var(--cp-border)', boxShadow: '3px 3px 0px hsl(from hsl(203, 89%, 53%) h s l / 0.5)' }}
              > Post on X </a>
            </div>
          </motion.div>

          {/* Progress Bar */}
          {event.needs?.funds && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="p-5 md:p-8 rounded-3xl relative overflow-hidden"
              style={{ background: 'var(--cp-surface)', border: '4px solid var(--cp-border)', boxShadow: '6px 6px 0px var(--cp-cyan)' }}
            >
              <ProgressBar current={event.needs.funds.current} goal={event.needs.funds.goal} label={`$${event.needs.funds.current.toLocaleString()} raised of $${event.needs.funds.goal.toLocaleString()} goal`} />
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <div className="col-span-1 lg:col-span-4 z-20">
          <div className="sticky top-24 space-y-6">
            <DonationPanel
              eventId={event.id}
              eventTitle={event.title}
              eventDescription={event.description}
              eventLocation={event.location}
              eventTime={event.eventDate ? new Date(event.eventDate).toLocaleString() : 'TBD'}
              enrolledCount={event.needs?.attendees?.current || 0}
              needs={event.needs || {}}
              onActionComplete={refreshEvent}
            />
            <EngagementLeaderboard eventId={event.id} />
          </div>
        </div>
      </div>

      {/* Footer Area: Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
        <div className="col-span-1 lg:col-span-8">
           <ChatBox eventId={event.id} />
        </div>
      </div>

      {/* Image Preview Overlay */}
      <AnimatePresence>
        {isPreviewOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-12"
            onClick={() => setIsPreviewOpen(false)}
          >
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-8 right-8 w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:rotate-90 transition-transform duration-300 z-[110]"
              onClick={(e) => { e.stopPropagation(); setIsPreviewOpen(false); }}
            >
              <X size={24} />
            </motion.button>
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-5xl aspect-[16/10] overflow-hidden"
              style={{ border: '8px solid white', boxShadow: '0 0 50px rgba(0,0,0,0.5)' }}
            >
              <Image
                src={event.imageUrl || event.image || '/logo.svg'}
                alt={event.title}
                className="object-contain w-full h-full"
                fill
                priority
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}