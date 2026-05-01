'use client';

import { useState, useEffect } from 'react';
import { getEventVolunteers, EventVolunteer } from '@/services/eventService';
import { motion } from 'framer-motion';

export function VolunteerLeaderboard({ eventId }: { eventId: string }) {
  const [volunteers, setVolunteers] = useState<EventVolunteer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVolunteers = async () => {
      try {
        const data = await getEventVolunteers(eventId);
        setVolunteers(data);
      } catch (err) {
        console.error('Failed to fetch volunteers:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchVolunteers();
  }, [eventId]);

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[200px] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" style={{ background: 'var(--color-surface-container-lowest-base)' }}>
        <div className="w-8 h-8 border-4 border-black border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden" style={{ background: 'var(--color-surface-container-lowest-base)' }}>
      <div className="flex items-center gap-3 p-5 border-b-4 border-black" style={{ background: 'var(--color-secondary-container-base)' }}>
        <div className="w-8 h-8 flex items-center justify-center border-2 border-black" style={{ background: 'var(--color-surface-container-lowest-base)' }}>
          <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>group</span>
        </div>
        <h3 className="font-headline text-base font-black uppercase tracking-tight text-on-surface">Community Heroes</h3>
      </div>
      
      {volunteers.length === 0 ? (
        <div className="text-center py-10 px-5 text-on-surface-variant">
          <span className="material-symbols-outlined text-[48px] mb-3 block opacity-40">volunteer_activism</span>
          <p className="font-label font-bold text-sm uppercase tracking-wider">Be the first to step up!</p>
        </div>
      ) : (
        <div className="divide-y-2 divide-black">
          {volunteers.slice(0, 5).map((volunteer, index) => (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              key={volunteer.id} 
              className="flex items-center justify-between p-4 hover:translate-x-[2px] transition-transform"
              style={{ background: index === 0 ? 'var(--color-primary-container-base)' : 'transparent' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 flex items-center justify-center font-headline font-black text-on-surface border-2 border-black"
                  style={{ background: index === 0 ? 'var(--color-tertiary-container-base)' : 'var(--color-surface-container-base)' }}
                >
                  {index + 1}
                </div>
                <div>
                  <p className="font-body font-bold text-on-surface text-sm">{volunteer.userName || 'Anonymous'}</p>
                  <p className="text-[10px] font-label font-bold uppercase tracking-wider text-on-surface-variant">
                    Joined {volunteer.signedUpAt?.seconds ? new Date(volunteer.signedUpAt.seconds * 1000).toLocaleDateString() : 'recently'}
                  </p>
                </div>
              </div>
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1", color: 'var(--color-secondary-base)' }}>verified</span>
            </motion.div>
          ))}
          {volunteers.length > 5 && (
            <div className="text-center p-3" style={{ background: 'var(--color-surface-container-base)' }}>
              <span className="text-[10px] font-label font-black uppercase tracking-wider text-on-surface">
                + {volunteers.length - 5} more heroes joined
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
