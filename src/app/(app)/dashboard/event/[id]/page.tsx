'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getEventById, getEventVolunteers, updateVolunteerStatus, EventVolunteer, deleteEvent, ADMIN_EMAILS, getEventGoodsPledges } from '@/services/eventService';
import { CommunityEvent } from '@/types';
import { ArrowLeft, Users, Download, Calendar, Mail, CheckCircle, Circle, Trash2, Send, Pencil, AlertTriangle, QrCode, Package } from 'lucide-react';
import { toast } from 'sonner';
import PromotionModal from '@/components/PromotionModal';
import { SentinelAlert } from '@/types/sentinel';
import { isPointInPolygon, getDistanceMiles } from '@/utils/geo';

export default function OrganizerEventPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { user } = useAuth();
  const resolvedParams = use(params);
  const eventId = resolvedParams.id;

  const [event, setEvent] = useState<CommunityEvent | null>(null);
  const [volunteers, setVolunteers] = useState<EventVolunteer[]>([]);
  const [alerts, setAlerts] = useState<SentinelAlert[]>([]);
  const [goodsPledges, setGoodsPledges] = useState<Awaited<ReturnType<typeof getEventGoodsPledges>>>([]);
  const [loading, setLoading] = useState(true);
  const [isPromotionModalOpen, setIsPromotionModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'volunteers' | 'goods'>('volunteers');
  const [smsNumber, setSmsNumber] = useState('');
  const [sendingSms, setSendingSms] = useState(false);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    const loadData = async () => {
      try {
        const [eventData, volunteerData, alertsData, pledgesData] = await Promise.all([
          getEventById(eventId), getEventVolunteers(eventId),
          fetch('/api/sentinel').then(r => r.json()).catch(() => []),
          getEventGoodsPledges(eventId)
        ]);
        if (eventData?.organizerId !== user.uid && !ADMIN_EMAILS.includes(user.email || '')) {
          toast.error('You do not have permission to view this event.'); router.push('/dashboard'); return;
        }
        setEvent(eventData); setVolunteers(volunteerData); setAlerts(alertsData); setGoodsPledges(pledgesData);
      } catch (err) { console.error('Failed to load event data:', err); toast.error('Could not load event data.'); }
      finally { setLoading(false); }
    };
    loadData();
  }, [eventId, user, router]);

  const handleToggleAttendance = async (volunteerId: string, currentStatus: boolean | undefined) => {
    try {
      const newStatus = !currentStatus;
      await updateVolunteerStatus(eventId, volunteerId, newStatus);
      setVolunteers(prev => prev.map(v => v.id === volunteerId ? { ...v, attended: newStatus } : v));
      toast.success(`Volunteer marked as ${newStatus ? 'attended' : 'not attended'}.`);
    } catch (error) { console.error('Failed to update attendance:', error); toast.error('Failed to update attendance.'); }
  };

  const handleDeleteEvent = async () => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) return;
    try { await deleteEvent(eventId); toast.success('Event deleted successfully.'); router.push('/dashboard'); }
    catch (error) { console.error('Failed to delete event:', error); toast.error('Failed to delete event.'); }
  };

  const handleSendSms = async () => {
    if (!smsNumber.trim()) { toast.error('Please enter a phone number.'); return; }
    if (!event) { toast.error('Event not loaded.'); return; }
    setSendingSms(true);
    try {
      const res = await fetch('/api/sms', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: smsNumber, message: `Hi! You are invited to join "${event.title}" on CampusPulse. Location: ${event.location}.`, url: window.location.href }) });
      let data: any = {};
      try { data = await res.json(); } catch { data = {}; }
      if (!res.ok) throw new Error(data.error || 'Failed to send SMS.');
      toast.success('SMS sent successfully.'); setSmsNumber('');
    } catch (error) { console.error('Failed to send SMS:', error); toast.error('Failed to send SMS.'); }
    finally { setSendingSms(false); }
  };

  const handleEmailAll = async () => {
    const emails = volunteers.map(v => v.userEmail).filter((email): email is string => Boolean(email));
    if (emails.length === 0) { toast.info('No volunteer emails to send.'); return; }
    const subject = encodeURIComponent(`Update regarding ${event?.title || 'Community Event'}`);
    window.location.href = `mailto:?bcc=${emails.join(',')}&subject=${subject}`;
    try { await navigator.clipboard.writeText(emails.join(', ')); toast.success('Opening mail client (copied emails to clipboard!)'); } catch {}
  };

  const handleExportCSV = () => {
    if (volunteers.length === 0) { toast.info('No volunteers to export.'); return; }
    const headers = ['Name', 'Email/ID', 'Signed Up Date'];
    const rows = volunteers.map(v => [v.userName, v.userEmail || v.userId, v.signedUpAt?.toDate?.()?.toLocaleDateString() || 'N/A']);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.setAttribute('download', `event_${eventId}_volunteers.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
    toast.success('Volunteer list exported successfully.');
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-black border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!event) return null;

  const eventLat = event.lat ?? 0;
  const eventLng = event.lng ?? 0;
  const currentVols = event.needs?.volunteers?.current || 0;
  const goalVols = event.needs?.volunteers?.goal || 1;
  const progress = Math.min(100, Math.round((currentVols / goalVols) * 100));

  const intersectingAlerts = alerts.filter((alert: SentinelAlert) => {
    if (!eventLat || !eventLng) return false;
    if (alert.severity === 'Extreme' && alert.polygon && alert.polygon.length > 2) {
      if (isPointInPolygon({ lat: eventLat, lng: eventLng }, alert.polygon)) return true;
    }
    if (alert.coordinates?.lat && alert.coordinates?.lng) {
      return getDistanceMiles(eventLat, eventLng, alert.coordinates.lat, alert.coordinates.lng) <= 30;
    }
    return false;
  });

  const neoBtn = "flex items-center gap-2 px-4 py-2.5 font-label font-bold text-sm uppercase tracking-wider border-4 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all text-on-surface";

  return (
    <main className="flex-1 p-4 md:p-10 max-w-7xl mx-auto w-full pb-28 md:pb-10">
      <button onClick={() => router.push('/dashboard')} className={`${neoBtn} mb-6`} style={{ background: 'var(--color-surface-container-base)' }}>
        <ArrowLeft size={18} /> Back to Dashboard
      </button>

      <div className="flex flex-col gap-6 mb-10">
        <div>
          <h1 className="text-3xl md:text-5xl font-headline font-black uppercase tracking-tight text-on-surface mb-3 leading-none">{event.title}</h1>
          <p className="text-on-surface-variant flex items-center gap-2 text-sm font-label font-bold uppercase tracking-wider">
            <Calendar size={18} /> {event.eventDate ? new Date(event.eventDate).toLocaleDateString() : (event.createdAt?.toDate?.()?.toLocaleDateString() || 'TBD')} • {event.location}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-4 border-t-4 border-black">
          <button onClick={() => router.push(`/dashboard/event/${eventId}/edit`)} className={neoBtn} style={{ background: 'var(--color-surface-container-base)' }}><Pencil size={16} /> Edit</button>
          <button onClick={() => router.push(`/dashboard/event/${eventId}/scan`)} className={`${neoBtn} shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none`} style={{ background: 'var(--color-primary-container-base)', color: 'var(--color-on-primary-container-base)' }}><QrCode size={16} /> Scan QR</button>
          <button onClick={() => setIsPromotionModalOpen(true)} className={`${neoBtn} shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none`} style={{ background: 'var(--color-secondary-container-base)' }}><Send size={16} /> Promote</button>
          <button onClick={handleEmailAll} className={neoBtn} style={{ background: 'var(--color-surface-container-base)' }}><Mail size={16} /> Email All</button>
          <div className="flex items-center gap-2">
            <input value={smsNumber} onChange={(e) => setSmsNumber(e.target.value)} placeholder="+91XXXXXXXXXX" className="min-w-[190px] border-4 border-black px-4 py-2.5 text-sm outline-none focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all" style={{ background: 'var(--color-surface-container-base)' }} />
            <button onClick={handleSendSms} disabled={sendingSms} className={`${neoBtn} disabled:opacity-60`} style={{ background: 'var(--color-surface-container-base)' }}><Send size={16} /> {sendingSms ? '...' : 'SMS'}</button>
          </div>
          <button onClick={handleExportCSV} className={neoBtn} style={{ background: 'var(--color-surface-container-base)' }}><Download size={16} /> CSV</button>
          <div className="flex-1 min-w-[20px] hidden md:block" />
          <button onClick={handleDeleteEvent} className="flex items-center gap-2 px-4 py-2.5 font-label font-bold text-sm uppercase tracking-wider border-4 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all bg-red-500 text-white"><Trash2 size={16} /> Delete</button>
        </div>
      </div>

      {intersectingAlerts.length > 0 && (
        <div className="mb-8 p-5 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" style={{ background: 'var(--color-tertiary-container-base)' }}>
          <div className="flex items-center gap-2 font-headline font-black uppercase tracking-tight text-on-surface mb-3"><AlertTriangle size={20} /><h3 className="text-lg">Safety Alerts</h3></div>
          <p className="text-sm text-on-surface-variant mb-4">These alerts overlap with your event location. Review and communicate any safety concerns.</p>
          <div className="space-y-3">
            {intersectingAlerts.map(alert => (
              <div key={alert.id} className="flex flex-col sm:flex-row sm:items-start gap-3 p-3 border-2 border-black" style={{ background: 'var(--color-surface-container-base)' }}>
                <span className={`px-2.5 py-1 text-[10px] font-label font-black uppercase tracking-wider whitespace-nowrap w-fit border-2 border-black ${alert.severity === 'Extreme' ? 'bg-red-500 text-white' : alert.severity === 'Severe' ? 'bg-orange-400 text-black' : 'bg-amber-300 text-black'}`}>{alert.severity} • {alert.type}</span>
                <div className="flex-1"><p className="text-sm font-body font-bold text-on-surface mb-0.5">{alert.title}</p><p className="text-xs text-on-surface-variant line-clamp-2">{alert.description}</p></div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-3">
            <button onClick={handleEmailAll} className={neoBtn} style={{ background: 'var(--color-surface-container-lowest-base)' }}><Mail size={16} /> Email Volunteers</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1 space-y-6">
          <div className="p-6 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" style={{ background: 'var(--color-primary-container-base)' }}>
            <h3 className="font-headline font-black text-sm uppercase tracking-tight mb-4 flex items-center gap-2 text-on-surface"><Users size={20} /> Vol. Progress</h3>
            <div className="text-3xl font-headline font-black text-on-surface mb-2">{currentVols} <span className="text-sm font-normal text-on-surface-variant">/ {goalVols}</span></div>
            <div className="w-full h-3 overflow-hidden border-2 border-black" style={{ background: 'var(--color-surface-container-lowest-base)' }}>
              <div className="h-full transition-all duration-1000" style={{ width: `${progress}%`, background: 'var(--color-on-primary-container-base)' }} />
            </div>
          </div>

          <div className="p-6 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" style={{ background: 'var(--color-tertiary-container-base)' }}>
            <h3 className="font-headline font-black text-sm uppercase tracking-tight mb-4 flex items-center gap-2 text-on-surface"><CheckCircle size={20} /> Checked In</h3>
            <div className="text-3xl font-headline font-black text-on-surface mb-2">{volunteers.filter(v => v.attended).length} <span className="text-sm font-normal text-on-surface-variant">/ {volunteers.length}</span></div>
            <div className="w-full h-3 overflow-hidden border-2 border-black" style={{ background: 'var(--color-surface-container-lowest-base)' }}>
              <div className="h-full transition-all duration-1000" style={{ width: `${Math.min(100, Math.round((volunteers.filter(v => v.attended).length / (volunteers.length || 1)) * 100))}%`, background: 'var(--color-on-tertiary-container-base)' }} />
            </div>
          </div>
        </div>

        <div className="md:col-span-3">
          <div className="overflow-hidden border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" style={{ background: 'var(--color-surface-container-lowest-base)' }}>
            <div className="p-4 flex items-center gap-2 border-b-4 border-black" style={{ background: 'var(--color-surface-container-base)' }}>
              <button onClick={() => setActiveTab('volunteers')} className={`flex items-center gap-2 px-4 py-2 text-sm font-label font-black uppercase tracking-wider border-2 border-black transition-all ${activeTab === 'volunteers' ? 'shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] translate-x-[-1px] translate-y-[-1px]' : ''}`} style={activeTab === 'volunteers' ? { background: 'var(--color-primary-container-base)' } : { background: 'var(--color-surface-container-lowest-base)' }}>
                <Users size={15} /> Volunteers <span className="px-1.5 py-0.5 text-xs border border-black ml-1">{volunteers.length}</span>
              </button>
              {event.needs?.goods && event.needs.goods.length > 0 && (
                <button onClick={() => setActiveTab('goods')} className={`flex items-center gap-2 px-4 py-2 text-sm font-label font-black uppercase tracking-wider border-2 border-black transition-all ${activeTab === 'goods' ? 'shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] translate-x-[-1px] translate-y-[-1px]' : ''}`} style={activeTab === 'goods' ? { background: 'var(--color-secondary-container-base)' } : { background: 'var(--color-surface-container-lowest-base)' }}>
                  <Package size={15} /> Goods <span className="px-1.5 py-0.5 text-xs border border-black ml-1">{goodsPledges.length}</span>
                </button>
              )}
            </div>

            {activeTab === 'volunteers' && (
              volunteers.length === 0 ? (
                <div className="p-12 text-center text-on-surface-variant"><Users size={48} className="mx-auto mb-4 opacity-20" /><p className="font-label font-bold uppercase tracking-wider">No volunteers yet.</p></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-[10px] font-label font-black uppercase tracking-wider text-on-surface-variant border-b-2 border-black">
                        <th className="px-6 py-4">Name</th><th className="px-6 py-4">Signed Up</th><th className="px-6 py-4 text-center">Attended</th><th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {volunteers.map(vol => (
                        <tr key={vol.id} className="border-b border-black/20 hover:bg-surface-container/30 transition-colors">
                          <td className="px-6 py-4"><div className="font-body font-bold text-on-surface">{vol.userName}</div><div className="text-[10px] text-on-surface-variant font-mono">{vol.userId.slice(0, 12)}...</div></td>
                          <td className="px-6 py-4 text-sm text-on-surface-variant">{vol.signedUpAt?.toDate?.()?.toLocaleDateString() || 'N/A'}</td>
                          <td className="px-6 py-4 text-center">
                            <button onClick={() => handleToggleAttendance(vol.id, vol.attended)} className={`p-2 border-2 border-black transition-all hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`} style={{ background: vol.attended ? 'var(--color-primary-container-base)' : 'var(--color-surface-container-base)' }} title={vol.attended ? 'Mark as Not Attended' : 'Mark as Attended'}>
                              {vol.attended ? <CheckCircle size={18} /> : <Circle size={18} />}
                            </button>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {vol.userEmail ? (
                              <a href={`mailto:${vol.userEmail}`} className="p-2 border-2 border-black inline-flex hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all" style={{ background: 'var(--color-surface-container-base)' }} title="Contact"><Mail size={16} /></a>
                            ) : (
                              <button onClick={() => toast.info('No email provided.')} className="p-2 border-2 border-black/30 inline-flex cursor-not-allowed opacity-40"><Mail size={16} /></button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}

            {activeTab === 'goods' && (
              goodsPledges.length === 0 ? (
                <div className="p-12 text-center text-on-surface-variant"><Package size={48} className="mx-auto mb-4 opacity-20" /><p className="font-label font-bold uppercase tracking-wider">No pledges yet.</p></div>
              ) : (
                <div className="divide-y-2 divide-black">
                  {goodsPledges.map(pledge => (
                    <div key={pledge.id} className="px-6 py-4 hover:bg-surface-container/30 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div><p className="font-body font-bold text-on-surface">{pledge.userName}</p><p className="text-[10px] font-label font-bold uppercase tracking-wider text-on-surface-variant mt-0.5">{pledge.pledgedAt?.toDate?.()?.toLocaleDateString() || 'Date unknown'}</p></div>
                        <div className="flex flex-wrap gap-1.5 justify-end max-w-[60%]">
                          {pledge.items?.map((item: string) => (
                            <span key={item} className="px-2.5 py-1 text-xs font-label font-bold border-2 border-black" style={{ background: 'var(--color-primary-container-base)' }}>{item}</span>
                          ))}
                          {pledge.otherItems && <span className="px-2.5 py-1 text-xs font-label font-bold border-2 border-black" style={{ background: 'var(--color-tertiary-container-base)' }}>+ {pledge.otherItems}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </div>

      <PromotionModal isOpen={isPromotionModalOpen} onClose={() => setIsPromotionModalOpen(false)} campaignId={eventId} />
    </main>
  );
}
