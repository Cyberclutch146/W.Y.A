'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getEvents } from '@/services/eventService';
import { getRecommendedEvents } from '@/services/recommendationService';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface InterestMatchBannerProps {
  condensed?: boolean;
}

export default function InterestMatchBanner({ condensed = false }: InterestMatchBannerProps) {
  const { user, profile } = useAuth();
  const [hasRecommendations, setHasRecommendations] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!profile?.interests || profile.interests.length === 0) {
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
  }, [profile?.interests, profile?.campusZone]);

  if (loading || !user) return null;

  // No interests set — show clean CTA
  if (!profile?.interests || profile.interests.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={condensed ? 'mb-6' : 'mb-10'}
      >
        <div
          className="relative group overflow-hidden p-6 md:p-8 rounded-[24px] border transition-all duration-500 flex flex-col md:flex-row items-center justify-between gap-6"
          style={{
            background: 'var(--cp-surface)',
            borderColor: 'var(--cp-border)',
            boxShadow: '0 4px 24px -4px rgba(0,0,0,0.05)',
          }}
        >
           {/* Subtle ambient glow */}
           <div 
            className="absolute right-0 top-0 w-1/2 h-full opacity-30 pointer-events-none"
            style={{ 
              background: 'radial-gradient(circle at 100% 0%, var(--cp-primary-light), transparent 70%)',
            }}
          />

          <div className="relative flex flex-col md:flex-row items-center md:items-start gap-5 text-center md:text-left z-10">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
              style={{ 
                background: 'var(--cp-surface-dim)',
                border: '1px solid var(--cp-border)',
                color: 'var(--cp-text-1)'
              }}
            >
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="font-bold text-lg md:text-xl tracking-tight mb-1.5" style={{ color: 'var(--cp-text-1)' }}>
                Unlock Personalized Matches
              </h3>
              <p className="text-sm leading-relaxed max-w-md" style={{ color: 'var(--cp-text-2)' }}>
                Add your interests and passions to see a curated feed of events that perfectly match your vibe.
              </p>
            </div>
          </div>
          
          <Link
            href="/profile"
            className="relative z-10 flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all hover:scale-105 active:scale-95"
            style={{
              background: 'var(--cp-primary)',
              color: '#fff',
              boxShadow: '0 4px 12px hsl(from var(--cp-primary) h s l / 0.3)'
            }}
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
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={condensed ? 'mb-6' : 'mb-10'}
    >
      <div
        className="relative group overflow-hidden p-6 md:p-8 rounded-[24px] border transition-all duration-500"
        style={{
          background: 'var(--cp-surface)',
          borderColor: 'var(--cp-border)',
          boxShadow: '0 8px 32px -8px rgba(0,0,0,0.08)',
        }}
      >
        {/* Sleek, sophisticated gradient overlays */}
        <div 
          className="absolute right-0 top-0 w-[40%] h-[150%] opacity-20 group-hover:opacity-30 transition-opacity duration-700 pointer-events-none"
          style={{ 
            background: 'radial-gradient(ellipse at top right, var(--cp-secondary), transparent 70%)',
            transform: 'translateY(-20%)'
          }}
        />
        <div 
          className="absolute left-0 bottom-0 w-[40%] h-[150%] opacity-10 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none"
          style={{ 
            background: 'radial-gradient(ellipse at bottom left, var(--cp-primary), transparent 70%)',
            transform: 'translateY(20%)'
          }}
        />

        <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6 z-10">
          
          <div className="relative shrink-0">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm"
              style={{ 
                background: 'linear-gradient(135deg, var(--cp-surface-dim), var(--cp-surface))',
                border: '1px solid var(--cp-border)'
              }}
            >
              <Sparkles size={24} style={{ color: 'var(--cp-secondary)' }} />
            </div>
            {/* Subtle pulse ring */}
            <div className="absolute inset-0 rounded-2xl border border-[var(--cp-secondary)] opacity-0 group-hover:opacity-30 group-hover:animate-ping" />
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2.5">
              <h3 className="font-bold text-xl md:text-2xl tracking-tight" style={{ color: 'var(--cp-text-1)' }}>
                Recommended for You
              </h3>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase" 
                style={{ 
                  background: 'hsl(from var(--cp-secondary) h s l / 0.1)', 
                  color: 'var(--cp-secondary)',
                  border: '1px solid hsl(from var(--cp-secondary) h s l / 0.2)'
                }}>
                Personalized
              </span>
            </div>
            
            <p className="text-sm md:text-base leading-relaxed max-w-2xl" style={{ color: 'var(--cp-text-2)' }}>
              Curated events based on your interest in{' '}
              <span className="inline-flex flex-wrap gap-1.5 mt-1 md:mt-0 items-center">
                {profile.interests.slice(0, 3).map((interest, i) => (
                  <span key={interest} className="px-2 py-0.5 rounded-md text-xs font-semibold" style={{ background: 'var(--cp-surface-dim)', color: 'var(--cp-text-1)', border: '1px solid var(--cp-border)' }}>
                    {interest}
                  </span>
                ))}
                {profile.interests.length > 3 && (
                  <span className="text-xs font-medium opacity-60 ml-1">
                    +{profile.interests.length - 3} more
                  </span>
                )}
              </span>
            </p>
          </div>

          <div className="shrink-0 flex items-center mt-4 md:mt-0">
             <Link 
              href="/dashboard" 
              className="group/btn relative overflow-hidden flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all hover:scale-105 active:scale-95"
              style={{ 
                background: 'var(--cp-text-1)', 
                color: 'var(--cp-surface)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
            >
              <span className="relative z-10">See Your Feed</span>
              <ArrowRight size={16} className="relative z-10 group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
