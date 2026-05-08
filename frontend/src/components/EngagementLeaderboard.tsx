'use client';

import { useState, useEffect } from 'react';
import { getEventRSVPs } from '@/services/eventService';
import { EventRSVP } from '@/types';
import { motion } from 'framer-motion';
import { Users, Verified, Heart, Loader2, Trophy, Crown } from 'lucide-react';

export function EngagementLeaderboard({ eventId }: { eventId: string }) {
  const [attendees, setAttendees] = useState<EventRSVP[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendees = async () => {
      try {
        const data = await getEventRSVPs(eventId);
        setAttendees(data);
      } catch (err) {
        console.error('Failed to fetch attendees:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendees();
  }, [eventId]);

  if (loading) {
    return (
      <div
        className="p-10 flex flex-col justify-center items-center gap-3 rounded-[32px]"
        style={{ background: 'var(--cp-surface)', border: '4px solid var(--cp-border)', boxShadow: '8px 8px 0px var(--cp-secondary)' }}
      >
        <Loader2 size={32} className="animate-spin text-[var(--cp-secondary)]" />
        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Loading Heroes...</p>
      </div>
    );
  }

  return (
    <div
      className="overflow-hidden rounded-[32px] group"
      style={{ 
        background: 'var(--cp-surface)', 
        border: '4px solid var(--cp-border)', 
        boxShadow: '8px 8px 0px var(--cp-secondary)' 
      }}
    >
      <div
        className="flex items-center justify-between px-6 py-5 bg-[var(--cp-secondary)]/5 border-b-4 border-[var(--cp-border)]"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center border-2 border-[var(--cp-border)] shadow-[3px 3px 0px_var(--cp-border)]"
            style={{ background: 'white' }}
          >
            <Trophy size={18} className="text-[var(--cp-secondary)]" />
          </div>
          <div>
            <h3 className="font-headline text-lg font-black uppercase tracking-tight" style={{ color: 'var(--cp-text-1)' }}>
              Top Heroes
            </h3>
            <p className="text-[9px] font-black uppercase tracking-widest opacity-50" style={{ color: 'var(--cp-text-1)' }}>
              Community Impact
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border-2 border-[var(--cp-border)] shadow-[2px 2px 0px_var(--cp-border)]">
          <Users size={12} className="text-[var(--cp-secondary)]" />
          <span className="text-[10px] font-black">{attendees.length}</span>
        </div>
      </div>
      
      {attendees.length === 0 ? (
        <div className="text-center py-12 px-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-300 flex items-center justify-center">
            <Heart size={24} className="opacity-20" />
          </div>
          <p className="text-sm font-black uppercase tracking-widest opacity-40" style={{ color: 'var(--cp-text-1)' }}>
            No heroes yet.<br/>Be the first?
          </p>
        </div>
      ) : (
        <div className="divide-y-2 divide-[var(--cp-border)]">
          {attendees.slice(0, 5).map((attendee, index) => (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              key={attendee.id} 
              className="flex items-center justify-between px-6 py-4 transition-all hover:bg-[var(--cp-secondary)]/5 relative group/item"
            >
              <div className="flex items-center gap-4 relative z-10">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black border-2 border-[var(--cp-border)] transition-transform group-hover/item:-rotate-6"
                  style={{
                    background: index === 0
                      ? 'var(--cp-secondary)'
                      : index === 1 ? 'var(--cp-orange)' : 'white',
                    color: index < 2 ? 'white' : 'var(--cp-text-1)',
                    boxShadow: index < 2 ? '3px 3px 0px rgba(0,0,0,0.1)' : '3px 3px 0px var(--cp-border)',
                  }}
                >
                  {index === 0 ? <Crown size={16} /> : index + 1}
                </div>
                <div>
                  <p className="font-black text-sm uppercase tracking-tight" style={{ color: 'var(--cp-text-1)' }}>
                    {attendee.userName || 'Anonymous Hero'}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-40" style={{ color: 'var(--cp-text-1)' }}>
                      Joined {attendee.signedUpAt?.seconds ? new Date(attendee.signedUpAt.seconds * 1000).toLocaleDateString() : 'Now'}
                    </p>
                    {attendee.status === 'going' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--cp-secondary)] animate-pulse" />
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Verified size={18} className="text-[var(--cp-secondary)] drop-shadow-sm" />
              </div>
            </motion.div>
          ))}
          {attendees.length > 5 && (
            <div className="px-6 py-4 bg-gray-50/50 text-center">
              <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
                + {attendees.length - 5} More Community Members
              </span>
            </div>
          )}
        </div>
      )}
      
      {/* Decorative dots in bottom right */}
      <div className="absolute bottom-2 right-2 flex gap-1 opacity-10 group-hover:opacity-30 transition-opacity">
        {[1,2,3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-current" />)}
      </div>
    </div>
  );
}
