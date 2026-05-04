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
        <div className="w-12 h-12 rounded-full animate-spin" style={{ border: '3px solid var(--cp-border)', borderTopColor: 'var(--cp-primary)' }} />
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

  return (
    <main className="flex-1 p-4 md:p-10 max-w-7xl mx-auto w-full pb-28 md:pb-10">
      <button onClick={() => router.push('/dashboard')} className="btn-secondary mb-6 flex items-center gap-2">
        <ArrowLeft size={18} /> Back to Dashboard
      </button>

      <div className="flex flex-col gap-6 mb-10">
        <div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-none mb-3" style={{ color: 'var(--cp-text-1)' }}>{event.title}</h1>
          <p className="flex items-center gap-2 text-sm uppercase tracking-wider font-bold" style={{ color: 'var(--cp-text-2)' }}>
            <Calendar size={18} /> {event.eventDate ? new Date(event.eventDate).toLocaleDateString() : (event.createdAt?.toDate?.()?.toLocaleDateString() || 'TBD')} • {event.location}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-dashed" style={{ borderColor: 'var(--cp-border)' }}>
          <button onClick={() => router.push(`/dashboard/event/${eventId}/edit`)} className="btn-secondary flex items-center gap-2"><Pencil size={16} /> Edit</button>
          <button onClick={() => router.push(`/dashboard/event/${eventId}/scan`)} className="btn-primary flex items-center gap-2"><QrCode size={16} /> Scan QR</button>
          <button onClick={() => setIsPromotionModalOpen(true)} className="btn-primary flex items-center gap-2" style={{ background: 'var(--cp-secondary)' }}><Send size={16} /> Promote</button>
          <button onClick={handleEmailAll} className="btn-secondary flex items-center gap-2"><Mail size={16} /> Email All</button>
          <div className="flex items-center gap-2">
            <input value={smsNumber} onChange={(e) => setSmsNumber(e.target.value)} placeholder="+91XXXXXXXXXX" className="min-w-[190px] px-4 py-2.5 text-sm outline-none transition-all" style={{ borderRadius: 'var(--r-md)', border: '1.5px solid var(--cp-border)', background: 'var(--cp-surface)', color: 'var(--cp-text-1)' }} />
            <button onClick={handleSendSms} disabled={sendingSms} className="btn-secondary flex items-center gap-2 disabled:opacity-60"><Send size={16} /> {sendingSms ? '...' : 'SMS'}</button>
          </div>
          <button onClick={handleExportCSV} className="btn-secondary flex items-center gap-2"><Download size={16} /> CSV</button>
          <div className="flex-1 min-w-[20px] hidden md:block" />
          <button onClick={handleDeleteEvent} className="btn-primary flex items-center gap-2" style={{ background: '#ef4444' }}><Trash2 size={16} /> Delete</button>
        </div>
      </div>

      {intersectingAlerts.length > 0 && (
        <div className="mb-8 p-5" style={{ borderRadius: 'var(--r-xl)', background: 'var(--cp-surface-dim)', border: '1.5px solid var(--cp-border)' }}>
          <div className="flex items-center gap-2 font-bold tracking-tight mb-3" style={{ color: 'var(--cp-text-1)' }}><AlertTriangle size={20} /><h3 className="text-lg">Safety Alerts</h3></div>
          <p className="text-sm mb-4" style={{ color: 'var(--cp-text-2)' }}>These alerts overlap with your event location. Review and communicate any safety concerns.</p>
          <div className="space-y-3">
            {intersectingAlerts.map(alert => (
              <div key={alert.id} className="flex flex-col sm:flex-row sm:items-start gap-3 p-3" style={{ borderRadius: 'var(--r-lg)', background: 'var(--cp-surface)', border: '1px solid var(--cp-border)' }}>
                <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap w-fit ${alert.severity === 'Extreme' ? 'bg-red-500 text-white' : alert.severity === 'Severe' ? 'bg-orange-400 text-white' : 'bg-amber-400 text-white'}`} style={{ borderRadius: 'var(--r-full)' }}>{alert.severity} • {alert.type}</span>
                <div className="flex-1"><p className="text-sm font-bold mb-0.5" style={{ color: 'var(--cp-text-1)' }}>{alert.title}</p><p className="text-xs line-clamp-2" style={{ color: 'var(--cp-text-2)' }}>{alert.description}</p></div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-3">
            <button onClick={handleEmailAll} className="btn-secondary flex items-center gap-2"><Mail size={16} /> Email Volunteers</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1 space-y-6">
          <div className="p-6" style={{ borderRadius: 'var(--r-xl)', background: 'var(--cp-primary-light)', border: '1.5px solid var(--cp-border)' }}>
            <h3 className="font-bold text-sm uppercase tracking-tight mb-4 flex items-center gap-2" style={{ color: 'var(--cp-text-1)' }}><Users size={20} /> Vol. Progress</h3>
            <div className="text-3xl font-bold mb-2" style={{ color: 'var(--cp-text-1)' }}>{currentVols} <span className="text-sm font-normal" style={{ color: 'var(--cp-text-2)' }}>/ {goalVols}</span></div>
            <div className="w-full h-2 overflow-hidden" style={{ background: 'var(--cp-surface-dim)', borderRadius: 'var(--r-full)' }}>
              <div className="h-full transition-all duration-1000" style={{ width: `${progress}%`, background: 'var(--cp-primary)', borderRadius: 'var(--r-full)' }} />
            </div>
          </div>

          <div className="p-6" style={{ borderRadius: 'var(--r-xl)', background: 'var(--cp-surface)', border: '1.5px solid var(--cp-border)' }}>
            <h3 className="font-bold text-sm uppercase tracking-tight mb-4 flex items-center gap-2" style={{ color: 'var(--cp-text-1)' }}><CheckCircle size={20} /> Checked In</h3>
            <div className="text-3xl font-bold mb-2" style={{ color: 'var(--cp-text-1)' }}>{volunteers.filter(v => v.attended).length} <span className="text-sm font-normal" style={{ color: 'var(--cp-text-2)' }}>/ {volunteers.length}</span></div>
            <div className="w-full h-2 overflow-hidden" style={{ background: 'var(--cp-surface-dim)', borderRadius: 'var(--r-full)' }}>
              <div className="h-full transition-all duration-1000" style={{ width: `${Math.min(100, Math.round((volunteers.filter(v => v.attended).length / (volunteers.length || 1)) * 100))}%`, background: 'var(--cp-primary)', borderRadius: 'var(--r-full)' }} />
            </div>
          </div>
        </div>

        <div className="md:col-span-3">
          <div className="overflow-hidden" style={{ borderRadius: 'var(--r-xl)', border: '1.5px solid var(--cp-border)', background: 'var(--cp-surface)' }}>
            <div className="p-4 flex items-center gap-2 border-b" style={{ borderColor: 'var(--cp-border)', background: 'var(--cp-surface-dim)' }}>
              <button onClick={() => setActiveTab('volunteers')} className={`flex items-center gap-2 px-4 py-2 text-sm font-bold uppercase tracking-wider transition-all ${activeTab === 'volunteers' ? 'btn-primary' : 'btn-secondary'}`}>
                <Users size={15} /> Volunteers <span className="px-1.5 py-0.5 text-xs ml-1" style={{ borderRadius: 'var(--r-full)', background: 'rgba(0,0,0,0.1)' }}>{volunteers.length}</span>
              </button>
              {event.needs?.goods && event.needs.goods.length > 0 && (
                <button onClick={() => setActiveTab('goods')} className={`flex items-center gap-2 px-4 py-2 text-sm font-bold uppercase tracking-wider transition-all ${activeTab === 'goods' ? 'btn-primary' : 'btn-secondary'}`}>
                  <Package size={15} /> Goods <span className="px-1.5 py-0.5 text-xs ml-1" style={{ borderRadius: 'var(--r-full)', background: 'rgba(0,0,0,0.1)' }}>{goodsPledges.length}</span>
                </button>
              )}
            </div>

            {activeTab === 'volunteers' && (
              volunteers.length === 0 ? (
                <div className="p-12 text-center" style={{ color: 'var(--cp-text-3)' }}><Users size={48} className="mx-auto mb-4 opacity-20" /><p className="font-bold uppercase tracking-wider">No volunteers yet.</p></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-[10px] font-bold uppercase tracking-wider border-b" style={{ color: 'var(--cp-text-2)', borderColor: 'var(--cp-border)' }}>
                        <th className="px-6 py-4">Name</th><th className="px-6 py-4">Signed Up</th><th className="px-6 py-4 text-center">Attended</th><th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {volunteers.map(vol => (
                        <tr key={vol.id} className="border-b transition-colors hover:bg-black/5" style={{ borderColor: 'var(--cp-border)' }}>
                          <td className="px-6 py-4"><div className="font-bold" style={{ color: 'var(--cp-text-1)' }}>{vol.userName}</div><div className="text-[10px] font-mono" style={{ color: 'var(--cp-text-3)' }}>{vol.userId.slice(0, 12)}...</div></td>
                          <td className="px-6 py-4 text-sm" style={{ color: 'var(--cp-text-2)' }}>{vol.signedUpAt?.toDate?.()?.toLocaleDateString() || 'N/A'}</td>
                          <td className="px-6 py-4 text-center">
                            <button onClick={() => handleToggleAttendance(vol.id, vol.attended)} className={`p-2 transition-all hover:scale-105`} style={{ background: vol.attended ? 'var(--cp-primary-light)' : 'transparent', color: vol.attended ? 'var(--cp-primary)' : 'var(--cp-text-3)', borderRadius: 'var(--r-full)', border: vol.attended ? '1.5px solid var(--cp-primary)' : '1.5px solid var(--cp-border)' }} title={vol.attended ? 'Mark as Not Attended' : 'Mark as Attended'}>
                              {vol.attended ? <CheckCircle size={18} /> : <Circle size={18} />}
                            </button>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {vol.userEmail ? (
                              <a href={`mailto:${vol.userEmail}`} className="p-2 inline-flex transition-all hover:scale-105" style={{ borderRadius: 'var(--r-full)', background: 'var(--cp-surface-dim)', border: '1px solid var(--cp-border)', color: 'var(--cp-text-1)' }} title="Contact"><Mail size={16} /></a>
                            ) : (
                              <button onClick={() => toast.info('No email provided.')} className="p-2 inline-flex cursor-not-allowed opacity-40" style={{ borderRadius: 'var(--r-full)', border: '1px solid var(--cp-border)', color: 'var(--cp-text-3)' }}><Mail size={16} /></button>
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
                <div className="p-12 text-center" style={{ color: 'var(--cp-text-3)' }}><Package size={48} className="mx-auto mb-4 opacity-20" /><p className="font-bold uppercase tracking-wider">No pledges yet.</p></div>
              ) : (
                <div className="divide-y" style={{ borderColor: 'var(--cp-border)' }}>
                  {goodsPledges.map(pledge => (
                    <div key={pledge.id} className="px-6 py-4 hover:bg-black/5 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div><p className="font-bold" style={{ color: 'var(--cp-text-1)' }}>{pledge.userName}</p><p className="text-[10px] font-bold uppercase tracking-wider mt-0.5" style={{ color: 'var(--cp-text-2)' }}>{pledge.pledgedAt?.toDate?.()?.toLocaleDateString() || 'Date unknown'}</p></div>
                        <div className="flex flex-wrap gap-1.5 justify-end max-w-[60%]">
                          {pledge.items?.map((item: string) => (
                            <span key={item} className="px-2.5 py-1 text-xs font-bold" style={{ borderRadius: 'var(--r-full)', background: 'var(--cp-primary-light)', color: 'var(--cp-primary)' }}>{item}</span>
                          ))}
                          {pledge.otherItems && <span className="px-2.5 py-1 text-xs font-bold" style={{ borderRadius: 'var(--r-full)', background: 'var(--cp-surface-dim)', color: 'var(--cp-text-1)' }}>+ {pledge.otherItems}</span>}
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
