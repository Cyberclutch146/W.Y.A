'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getEventById, getEventVolunteers, updateVolunteerStatus, EventVolunteer, ADMIN_EMAILS } from '@/services/eventService';
import { CommunityEvent } from '@/types';
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
  const [volunteers, setVolunteers] = useState<EventVolunteer[]>([]); 
  const [loading, setLoading] = useState(true);
  const [checkedInCount, setCheckedInCount] = useState(0);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    const loadData = async () => {
      try {
        const [eventData, volunteerData] = await Promise.all([getEventById(eventId), getEventVolunteers(eventId)]);
        if (eventData?.organizerId !== user.uid && !ADMIN_EMAILS.includes(user.email || '')) {
          toast.error('You do not have permission to access this page.'); router.push('/dashboard'); return;
        }
        setEvent(eventData); setVolunteers(volunteerData); setCheckedInCount(volunteerData.filter(v => v.attended).length);
      } catch (err) { console.error('Failed to load scan data:', err); toast.error('Could not load event data.'); }
      finally { setLoading(false); }
    };
    loadData();
  }, [eventId, user, router]);

  const handleScanSuccess = async (scannedTicketId: string) => {
    const volunteer = volunteers.find(v => v.id === scannedTicketId || (v as any).ticketId === scannedTicketId);
    if (!volunteer) throw new Error(`Ticket "${scannedTicketId}" not found in volunteer roster.`);
    if (volunteer.attended) throw new Error(`${volunteer.userName} is already checked in.`);
    await updateVolunteerStatus(eventId, volunteer.id, true);
    setVolunteers(prev => prev.map(v => v.id === volunteer.id ? { ...v, attended: true } : v));
    setCheckedInCount(prev => prev + 1);
    toast.success(`✅ ${volunteer.userName} checked in!`);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-black border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!event) return null;

  const totalVolunteers = volunteers.length;
  const checkInProgress = totalVolunteers > 0 ? Math.round((checkedInCount / totalVolunteers) * 100) : 0;

  return (
    <main className="flex-1 p-4 md:p-10 max-w-3xl mx-auto w-full pb-28 md:pb-10">
      <button onClick={() => router.push(`/dashboard/event/${eventId}`)} className="flex items-center gap-2 px-4 py-2.5 font-label font-bold text-sm uppercase tracking-wider border-4 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all text-on-surface mb-6" style={{ background: 'var(--color-surface-container-base)' }}>
        <ArrowLeft size={18} /> Back to Event Dashboard
      </button>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 flex items-center justify-center border-4 border-black" style={{ background: 'var(--color-primary-container-base)' }}>
            <QrCode size={22} />
          </div>
          <div>
            <h1 className="text-2xl md:text-4xl font-headline font-black uppercase tracking-tight text-on-surface">QR Check-in</h1>
            <p className="text-on-surface-variant text-sm font-label font-bold uppercase tracking-wider">{event.title}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="p-5 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" style={{ background: 'var(--color-primary-container-base)' }}>
          <div className="flex items-center gap-2 mb-2">
            <Users size={18} />
            <span className="text-[10px] font-label font-black uppercase tracking-wider text-on-surface">Total Volunteers</span>
          </div>
          <p className="text-3xl font-headline font-black text-on-surface">{totalVolunteers}</p>
        </div>
        <div className="p-5 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" style={{ background: 'var(--color-tertiary-container-base)' }}>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={18} />
            <span className="text-[10px] font-label font-black uppercase tracking-wider text-on-surface">Checked In</span>
          </div>
          <p className="text-3xl font-headline font-black text-on-surface">{checkedInCount} <span className="text-sm font-normal text-on-surface-variant">({checkInProgress}%)</span></p>
        </div>
      </div>

      <div className="mb-8">
        <div className="w-full h-4 overflow-hidden border-4 border-black" style={{ background: 'var(--color-surface-container-base)' }}>
          <div className="h-full transition-all duration-1000 ease-out" style={{ width: `${checkInProgress}%`, background: 'var(--color-on-primary-container-base)' }} />
        </div>
      </div>

      <ScannerView eventId={eventId} onScanSuccess={handleScanSuccess} />

      {volunteers.filter(v => v.attended).length > 0 && (
        <div className="mt-8 overflow-hidden border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" style={{ background: 'var(--color-surface-container-lowest-base)' }}>
          <div className="p-5 border-b-4 border-black" style={{ background: 'var(--color-secondary-container-base)' }}>
            <h3 className="font-headline font-black text-base uppercase tracking-tight text-on-surface flex items-center gap-2">
              <CheckCircle size={20} /> Recently Checked In
            </h3>
          </div>
          <div className="divide-y-2 divide-black">
            {volunteers.filter(v => v.attended).slice(0, 10).map(vol => (
              <div key={vol.id} className="flex items-center gap-3 px-5 py-3">
                <div className="w-8 h-8 flex items-center justify-center font-black text-xs border-2 border-black" style={{ background: 'var(--color-primary-container-base)' }}>
                  {vol.userName.charAt(0).toUpperCase()}
                </div>
                <p className="flex-1 text-sm font-body font-bold text-on-surface">{vol.userName}</p>
                <span className="material-symbols-outlined text-lg" style={{ color: 'var(--color-primary-base)', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
