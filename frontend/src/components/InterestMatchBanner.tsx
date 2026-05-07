'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getEvents } from '@/services/eventService';
import { getRecommendedEvents } from '@/services/recommendationService';
import { useEventsCache } from '@/context/EventsCacheContext';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface InterestMatchBannerProps {
  condensed?: boolean;
}

export default function InterestMatchBanner({ condensed = false }: InterestMatchBannerProps) {
  const { user, profile } = useAuth();
  const { events: cachedEvents, loading: cacheLoading } = useEventsCache();
  const [hasRecommendations, setHasRecommendations] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = () => {
      if (!profile?.interests || profile.interests.length === 0) {
        setLoading(false);
        return;
      }

      if (cacheLoading) return;

      try {
        const recommended = getRecommendedEvents(profile as any, cachedEvents, 3);
        setHasRecommendations(recommended.length > 0);
      } catch (error) {
        console.error('Failed to calculate recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [profile?.interests, profile?.campusZone, cachedEvents, cacheLoading]);

  if (loading || !user) return null;

  // No interests set — show clean CTA
  if (!profile?.interests || profile.interests.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={condensed ? 'mb-6' : 'mb-8'}
      >
        <div
          className="flex flex-col items-start justify-between gap-4 p-5 sm:p-6 md:flex-row md:items-center rounded-2xl"
          style={{
            background: 'hsl(from var(--cp-orange) h s l / 0.06)',
            border: '1px solid hsl(from var(--cp-orange) h s l / 0.2)',
          }}
        >
          <div className="flex items-start gap-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg, var(--cp-orange), var(--cp-pink))' }}
            >
              <Sparkles size={18} className="text-white" />
            </div>
            <div>
              <h3 className="font-headline font-bold text-base" style={{ color: 'var(--cp-text-1)' }}>Unlock Personalized Matches</h3>
              <p className="text-sm mt-1" style={{ color: 'var(--cp-text-2)' }}>Add interests to your profile to see events that match your vibe.</p>
            </div>
          </div>
          <Link
            href="/profile"
            className="btn-primary w-full md:w-auto justify-center py-3 text-sm"
          >
            Add Interests
            <ArrowRight size={16} />
          </Link>
        </div>
      </motion.div>
    );
  }

  if (!hasRecommendations) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={condensed ? 'mb-6' : 'mb-8'}
    >
      <div
        className="flex flex-col items-start justify-between gap-4 p-5 sm:p-6 md:flex-row md:items-center rounded-2xl"
        style={{
          background: 'hsl(from var(--cp-secondary) h s l / 0.06)',
          border: '1px solid hsl(from var(--cp-secondary) h s l / 0.2)',
        }}
      >
        <div className="flex items-start gap-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, var(--cp-secondary), var(--cp-lime))' }}
          >
            <Sparkles size={18} className="text-white" />
          </div>
          <div>
            <h3 className="font-headline font-bold text-base" style={{ color: 'var(--cp-text-1)' }}>Recommended for You</h3>
            <p className="text-sm mt-1" style={{ color: 'var(--cp-text-2)' }}>
              We found event matches based on <span className="font-bold" style={{ color: 'var(--cp-text-1)' }}>{profile.interests.slice(0, 2).join(', ')}</span>
              {profile.interests.length > 2 ? ` and ${profile.interests.length - 2} more` : ''}.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
