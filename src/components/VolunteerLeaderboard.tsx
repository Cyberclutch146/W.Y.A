'use client';

import { useState, useEffect } from 'react';
import { getEventVolunteers, EventVolunteer } from '@/services/eventService';
import { motion } from 'framer-motion';
import { Users, Verified, Heart, Loader2 } from 'lucide-react';

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
      <div
        className="p-6 flex justify-center items-center min-h-[200px] rounded-2xl"
        style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border)' }}
      >
        <Loader2 size={24} className="animate-spin" style={{ color: 'var(--cp-primary)' }} />
      </div>
    );
  }

  return (
    <div
      className="overflow-hidden rounded-2xl"
      style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border)', boxShadow: 'var(--shadow-md)' }}
    >
      <div
        className="flex items-center gap-3 px-5 py-4"
        style={{ borderBottom: '1px solid var(--cp-border)' }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, var(--cp-secondary), var(--cp-lime))' }}
        >
          <Users size={14} className="text-white" />
        </div>
        <h3 className="font-headline text-base font-bold" style={{ color: 'var(--cp-text-1)' }}>Community Heroes</h3>
      </div>
      
      {volunteers.length === 0 ? (
        <div className="text-center py-10 px-5">
          <Heart size={36} className="mx-auto mb-3 opacity-20" style={{ color: 'var(--cp-text-3)' }} />
          <p className="text-sm font-semibold" style={{ color: 'var(--cp-text-3)' }}>Be the first to step up!</p>
        </div>
      ) : (
        <div>
          {volunteers.slice(0, 5).map((volunteer, index) => (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              key={volunteer.id} 
              className="flex items-center justify-between px-5 py-3 transition-colors"
              style={{
                background: index === 0 ? 'hsl(from var(--cp-primary) h s l / 0.05)' : 'transparent',
                borderBottom: '1px solid var(--cp-border)',
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                  style={{
                    background: index === 0
                      ? 'linear-gradient(135deg, var(--cp-orange), var(--cp-pink))'
                      : 'var(--cp-surface-dim)',
                    color: index === 0 ? 'white' : 'var(--cp-text-2)',
                  }}
                >
                  {index + 1}
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: 'var(--cp-text-1)' }}>{volunteer.userName || 'Anonymous'}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--cp-text-3)' }}>
                    Joined {volunteer.signedUpAt?.seconds ? new Date(volunteer.signedUpAt.seconds * 1000).toLocaleDateString() : 'recently'}
                  </p>
                </div>
              </div>
              <Verified size={15} style={{ color: 'var(--cp-secondary)' }} />
            </motion.div>
          ))}
          {volunteers.length > 5 && (
            <div className="text-center px-5 py-3" style={{ background: 'var(--cp-surface-dim)' }}>
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--cp-text-2)' }}>
                + {volunteers.length - 5} more heroes joined
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
