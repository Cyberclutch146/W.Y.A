'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getEvents } from '@/services/eventService';
import { getRecommendedEvents } from '@/services/recommendationService';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface SkillMatchBannerProps {
  condensed?: boolean;
}

export default function SkillMatchBanner({ condensed = false }: SkillMatchBannerProps) {
  const { user, profile } = useAuth();
  const [hasRecommendations, setHasRecommendations] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!profile?.skills || profile.skills.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const result = await getEvents(50);
        const recommended = getRecommendedEvents(profile as any, result.events, 3);
        setHasRecommendations(recommended.length > 0);
      } catch (error) {
        console.error('Failed to fetch recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [profile?.skills, profile?.equipment]);

  if (loading || !user) return null;

  // No skills set — show clean CTA
  if (!profile?.skills || profile.skills.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={condensed ? 'mb-6' : 'mb-8'}
      >
        <div
          className="flex flex-col items-start justify-between gap-4 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-5 sm:p-6 md:flex-row md:items-center"
          style={{ background: 'var(--color-tertiary-container-base)' }}
        >
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 flex items-center justify-center shrink-0 border-4 border-black"
              style={{ background: 'var(--color-surface-container-lowest-base)' }}
            >
              <Sparkles size={22} className="text-on-surface" />
            </div>
            <div>
              <h3 className="font-headline font-black text-base uppercase tracking-tight text-on-surface">Unlock Personalized Matches</h3>
              <p className="text-sm text-on-surface-variant mt-1">Add skills to your profile to see events that need your exact expertise.</p>
            </div>
          </div>
          <Link
            href="/profile"
            className="flex w-full items-center justify-center gap-2 px-6 py-3 text-sm font-label font-black uppercase tracking-wider border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-150 md:w-auto"
            style={{ background: 'var(--color-primary-container-base)', color: 'var(--color-on-primary-container-base)' }}
          >
            Add Skills
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
        className="flex flex-col items-start justify-between gap-4 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-5 sm:p-6 md:flex-row md:items-center"
        style={{ background: 'var(--color-secondary-container-base)' }}
      >
        <div className="flex items-start gap-4">
          <div
            className="w-12 h-12 flex items-center justify-center shrink-0 border-4 border-black"
            style={{ background: 'var(--color-surface-container-lowest-base)' }}
          >
            <Sparkles size={18} className="text-on-surface" />
          </div>
          <div>
            <h3 className="font-headline font-black text-base uppercase tracking-tight text-on-surface">Recommended for You</h3>
            <p className="text-sm text-on-surface-variant mt-1">
              We found event matches based on <span className="font-bold text-on-surface">{profile.skills.slice(0, 2).join(', ')}</span>
              {profile.skills.length > 2 ? ` and ${profile.skills.length - 2} more` : ''}.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
