'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getEventById, getEventRSVPs, updateRSVPStatus, ADMIN_EMAILS } from '@/services/eventService';
import { CommunityEvent, EventRSVP } from '@/types';
import { ArrowLeft, Users, CheckCircle, QrCode } from 'lucide-react';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';

const ScannerView = dynamic(() => import('@/components/ScannerView'), { ssr: false });

export default function ScanPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { user } = useAuth();
  const resolvedParams = use(params);
  const eventId = resolvedParams.id;

  const [event, setEvent] = useState<CommunityEvent | null>(null);
  const [attendees, setAttendees] = useState<EventRSVP[]>([]); 
  const [loading, setLoading] = useState(true);
  const [checkedInCount, setCheckedInCount] = useState(0);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    const loadData = async () => {
      try {
        // Try to load from cache first for immediate feedback
        const cachedData = localStorage.getItem(`wya_attendees_${eventId}`);
        if (cachedData) {
          const parsed = JSON.parse(cachedData);
          setAttendees(parsed);
          setCheckedInCount(parsed.filter((v: any) => v.status === 'attended').length);
          setLoading(false);
        }

        const [eventData, attendeeData] = await Promise.all([getEventById(eventId), getEventRSVPs(eventId)]);
        if (eventData?.organizerId !== user.uid && !ADMIN_EMAILS.includes(user.email || '')) {
          toast.error('You do not have permission to access this page.'); router.push('/dashboard'); return;
        }
        
        setEvent(eventData); 
        setAttendees(attendeeData); 
        setCheckedInCount(attendeeData.filter(v => v.status === 'attended').length);
        
        // Update cache
        localStorage.setItem(`wya_attendees_${eventId}`, JSON.stringify(attendeeData));
      } catch (err) { 
        console.error('Failed to load scan data:', err); 
        toast.error('Could not load event data.'); 
      }
      finally { setLoading(false); }
    };
    loadData();
  }, [eventId, user, router]);

  const handleScanSuccess = async (scannedTicketId: string) => {
    const attendee = attendees.find(v => v.id === scannedTicketId || v.ticketId === scannedTicketId);
    if (!attendee) throw new Error(`Ticket "${scannedTicketId}" not found in attendee roster.`);
    if (attendee.status === 'attended') throw new Error(`${attendee.userName} is already checked in.`);
    await updateRSVPStatus(eventId, attendee.id, 'attended');
    
    const updatedAttendees = attendees.map(v => v.id === attendee.id ? { ...v, status: 'attended' as const } : v);
    setAttendees(updatedAttendees);
    setCheckedInCount(prev => prev + 1);
    
    // Update cache
    localStorage.setItem(`wya_attendees_${eventId}`, JSON.stringify(updatedAttendees));
    
    toast.success(`✅ ${attendee.userName} checked in!`);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 rounded-full animate-spin" style={{ border: '3px solid var(--cp-border)', borderTopColor: 'var(--cp-primary)' }} />
      </div>
    );
  }

  if (!event) return null;

  const totalAttendees = attendees.length;
  const goingAttendees = attendees.filter(v => v.status === 'going' || v.status === 'attended').length;
  const checkInProgress = totalAttendees > 0 ? Math.round((checkedInCount / totalAttendees) * 100) : 0;
  const churnCount = goingAttendees - checkedInCount;
  const isOffline = typeof window !== 'undefined' && !navigator.onLine;

  return (
    <main className="flex-1 p-4 md:p-10 max-w-3xl mx-auto w-full pb-28 md:pb-10">
      <button onClick={() => router.push(`/dashboard/event/${eventId}`)} className="btn-secondary mb-6">
        <ArrowLeft size={16} /> Back to Event Dashboard
      </button>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-10 h-10 flex items-center justify-center rounded-xl"
            style={{ background: 'linear-gradient(135deg, var(--cp-primary), var(--cp-violet))' }}
          >
            <QrCode size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-4xl font-headline font-bold tracking-tight" style={{ color: 'var(--cp-text-1)' }}>QR Check-in</h1>
            <p className="text-sm font-semibold" style={{ color: 'var(--cp-text-3)' }}>{event.title}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div
          className="p-5 rounded-xl"
          style={{ background: 'var(--cp-surface)', border: '1.5px solid var(--cp-border)', boxShadow: 'var(--shadow-sm)' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Users size={16} style={{ color: 'var(--cp-primary)' }} />
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--cp-text-2)' }}>Total Attendees</span>
          </div>
          <p className="text-3xl font-headline font-bold" style={{ color: 'var(--cp-text-1)' }}>{totalAttendees}</p>
        </div>
        <div
          className="p-5 rounded-xl"
          style={{ background: 'var(--cp-surface)', border: '1.5px solid var(--cp-border)', boxShadow: 'var(--shadow-sm)' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={16} style={{ color: 'hsl(140 70% 45%)' }} />
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--cp-text-2)' }}>Checked In</span>
          </div>
          <p className="text-3xl font-headline font-bold" style={{ color: 'var(--cp-text-1)' }}>{checkedInCount} <span className="text-sm font-normal" style={{ color: 'var(--cp-text-3)' }}>({checkInProgress}%)</span></p>
        </div>
      </div>

      {/* Organizer Insights: Churn & Connectivity */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div
          className="p-4 rounded-xl"
          style={{ background: 'hsl(350 80% 60% / 0.05)', border: '1px dashed hsl(350 80% 60% / 0.3)' }}
        >
          <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'hsl(350 80% 60%)' }}>RSVP Churn</p>
          <p className="text-xl font-headline font-bold" style={{ color: 'var(--cp-text-1)' }}>{churnCount} <span className="text-xs font-normal opacity-70">missing</span></p>
        </div>
        <div
          className="p-4 rounded-xl flex items-center justify-between"
          style={{ background: isOffline ? 'hsl(45 90% 50% / 0.1)' : 'hsl(140 70% 45% / 0.05)', border: `1px solid ${isOffline ? 'hsl(45 90% 50% / 0.3)' : 'hsl(140 70% 45% / 0.2)'}` }}
        >
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: isOffline ? 'hsl(45 90% 50%)' : 'hsl(140 70% 45%)' }}>Status</p>
            <p className="text-xs font-bold" style={{ color: 'var(--cp-text-1)' }}>{isOffline ? 'Offline Mode' : 'Live Syncing'}</p>
          </div>
          <div className={`w-2 h-2 rounded-full ${isOffline ? 'animate-pulse' : ''}`} style={{ background: isOffline ? 'hsl(45 90% 50%)' : 'hsl(140 70% 45%)' }} />
        </div>
      </div>



      <div className="mb-8">
        <div className="flex justify-between items-end mb-2">
          <p className="text-xs font-bold uppercase tracking-widest opacity-60">Event Reach</p>
          <p className="text-xs font-black">{Math.round(checkInProgress)}% Capacity</p>
        </div>
        <div
          className="w-full h-3 overflow-hidden rounded-full"
          style={{ background: 'var(--cp-surface-dim)', border: '1px solid var(--cp-border)' }}
        >
          <div
            className="h-full transition-all duration-1000 ease-out rounded-full"
            style={{ width: `${checkInProgress}%`, background: 'var(--cp-primary)' }}
          />
        </div>
      </div>

      <ScannerView eventId={eventId} onScanSuccess={handleScanSuccess} />

      {attendees.filter(v => v.status === 'attended').length > 0 && (
        <div
          className="mt-8 overflow-hidden rounded-2xl"
          style={{ background: 'var(--cp-surface)', border: '1.5px solid var(--cp-border)', boxShadow: 'var(--shadow-md)' }}
        >
          <div className="p-5" style={{ borderBottom: '1px solid var(--cp-border)', background: 'hsl(140 70% 45% / 0.06)' }}>
            <h3 className="font-headline font-bold text-base tracking-tight flex items-center gap-2" style={{ color: 'var(--cp-text-1)' }}>
              <CheckCircle size={18} style={{ color: 'hsl(140 70% 45%)' }} /> Recently Checked In
            </h3>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--cp-border)' }}>
            {attendees.filter(v => v.status === 'attended').slice(0, 10).map(vol => (
              <div key={vol.id} className="flex items-center gap-3 px-5 py-3">
                <div
                  className="w-8 h-8 flex items-center justify-center font-bold text-xs text-white rounded-lg"
                  style={{ background: 'linear-gradient(135deg, var(--cp-primary), var(--cp-violet))' }}
                >
                  {vol.userName.charAt(0).toUpperCase()}
                </div>
                <p className="flex-1 text-sm font-semibold" style={{ color: 'var(--cp-text-1)' }}>{vol.userName}</p>
                <CheckCircle size={18} style={{ color: 'hsl(140 70% 45%)' }} />
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
