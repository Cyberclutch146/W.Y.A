'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CommunityEvent } from '@/types';

import { motion } from 'framer-motion';
import { Sparkles, AlertTriangle, MapPin, X } from 'lucide-react';

interface EventCardProps {
  event: CommunityEvent;
  featured?: boolean;

  recommendationScore?: number;
  recommendationPercentage?: number;
  matchedInterests?: string[];
  reasons?: { type: string; label: string }[];
  onDismiss?: (eventId: string) => void;
}

// Category → dopamine color mapping using CSS variables
export const CATEGORY_COLORS: Record<string, { bg: string; color: string; border: string; glow: string }> = {
  Music:      { bg: 'hsl(330 100% 65% / 0.12)', color: 'var(--cp-pink)',   border: 'hsl(330 100% 65% / 0.3)', glow: 'hsl(330 100% 65% / 0.15)' },
  Art:        { bg: 'hsl(270 100% 70% / 0.12)', color: 'var(--cp-violet)', border: 'hsl(270 100% 70% / 0.3)', glow: 'hsl(270 100% 70% / 0.15)' },
  Sports:     { bg: 'hsl(80 100% 55% / 0.12)',  color: 'var(--cp-lime)',   border: 'hsl(80 100% 55% / 0.3)',  glow: 'hsl(80 100% 55% / 0.15)'  },
  Tech:       { bg: 'hsl(185 100% 55% / 0.12)', color: 'var(--cp-cyan)',   border: 'hsl(185 100% 55% / 0.3)', glow: 'hsl(185 100% 55% / 0.15)' },
  Cultural:   { bg: 'hsl(25 100% 62% / 0.12)',  color: 'var(--cp-orange)', border: 'hsl(25 100% 62% / 0.3)',  glow: 'hsl(25 100% 62% / 0.15)'  },
  Networking: { bg: 'hsl(258 90% 63% / 0.12)',  color: 'var(--cp-primary)',border: 'hsl(258 90% 63% / 0.3)',  glow: 'hsl(258 90% 63% / 0.15)'  },
  Academic:   { bg: 'hsl(210 90% 60% / 0.12)',  color: 'hsl(210,90%,55%)',border: 'hsl(210 90% 60% / 0.3)',  glow: 'hsl(210 90% 60% / 0.15)'  },
  Party:      { bg: 'hsl(330 100% 65% / 0.12)', color: 'var(--cp-pink)',   border: 'hsl(330 100% 65% / 0.3)', glow: 'hsl(330 100% 65% / 0.15)' },
  Athletics:  { bg: 'hsl(80 100% 55% / 0.12)',  color: 'var(--cp-lime)',   border: 'hsl(80 100% 55% / 0.3)',  glow: 'hsl(80 100% 55% / 0.15)'  },
  default:    { bg: 'var(--cp-surface-dim)',     color: 'var(--cp-text-2)', border: 'var(--cp-border)',          glow: 'transparent'               },
};

const REASON_ICON: Record<string, string> = {
  social: '📈',
  urgency: '⚡',
  interest: '❤️',
  ai: '✨',
  default: '✨',
};

export function EventCard({
  event,
  featured = false,

  recommendationPercentage,
  matchedInterests = [],
  reasons = [],
  onDismiss,
}: EventCardProps) {
  const hasAlerts = false;
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const [descriptionLineClamp, setDescriptionLineClamp] = useState(featured ? 3 : 2);
  const [isDismissing, setIsDismissing] = useState(false);

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDismissing(true);
    setTimeout(() => onDismiss?.(event.id), 300);
  };

  useEffect(() => {
    if (featured || !titleRef.current) return;
    const titleElement = titleRef.current;
    const updateDescriptionClamp = () => {
      const computedStyle = window.getComputedStyle(titleElement);
      const lineHeight = Number.parseFloat(computedStyle.lineHeight);
      if (!Number.isFinite(lineHeight) || lineHeight <= 0) { setDescriptionLineClamp(2); return; }
      const titleLines = Math.max(1, Math.round(titleElement.getBoundingClientRect().height / lineHeight));
      setDescriptionLineClamp(Math.max(1, 4 - titleLines));
    };
    updateDescriptionClamp();
    const resizeObserver = new ResizeObserver(updateDescriptionClamp);
    resizeObserver.observe(titleElement);
    return () => { resizeObserver.disconnect(); };
  }, [event.title, featured]);

  if (isDismissing) {
    return (
      <div
        className="h-full min-h-[380px] flex items-center justify-center animate-pulse"
        style={{
          borderRadius: 'var(--r-2xl)',
          border: '1.5px dashed var(--cp-border)',
          background: 'var(--cp-surface-dim)',
        }}
      >
        <span style={{ color: 'var(--cp-text-3)', fontSize: '0.875rem', fontWeight: 500 }}>Dismissing…</span>
      </div>
    );
  }

  const cat = event.category as string;
  const categoryStyle = CATEGORY_COLORS[cat] ?? CATEGORY_COLORS.default;
  const isUrgent = event.urgency === 'high';
  const progress = event.progress ?? 0;

  // ── Category / Urgency Badge ──
  const badge = isUrgent ? (
    <span
      className="pill-tag flex items-center gap-1.5 px-3 py-1 bg-destructive/10 text-destructive border-destructive/30"
    >
      <AlertTriangle size={11} strokeWidth={2.5} />
      URGENT
    </span>
  ) : (
    <span
      className="pill-tag"
      style={{
        background: categoryStyle.bg,
        color: categoryStyle.color,
        border: `1px solid ${categoryStyle.border}`,
      }}
    >
      {cat?.toUpperCase() || 'EVENT'}
    </span>
  );

  // ═══════════════════════════════════════
  //  FEATURED VARIANT
  // ═══════════════════════════════════════
  if (featured) {
    return (
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="group relative overflow-hidden card-elevated"
        style={{
          background: 'var(--cp-surface)',
          transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLElement;
          el.style.transform = 'translateY(-6px) scale(1.005)';
          el.style.boxShadow = `0 32px 64px -12px hsl(from var(--cp-primary) h s l / 0.15)`;
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLElement;
          el.style.transform = 'translateY(0) scale(1)';
          el.style.boxShadow = 'var(--shadow-xl)';
        }}
      >
        {/* Shine effect */}
        <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden rounded-xl">
          <div className="absolute inset-0 bg-white/20 -translate-x-[200%] skew-x-[-20deg] group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out" />
        </div>
        {/* Gradient shimmer overlay */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500"
          style={{ background: `radial-gradient(ellipse at 60% 0%, ${categoryStyle.glow}, transparent 60%)` }}
        />

        {/* Image */}
        <div className="relative h-64 sm:h-72 md:h-80 overflow-hidden">
          <Image
            alt={event.title}
            src={event.imageUrl || event.image || '/logo.svg'}
            fill
            className="object-cover transition-transform duration-700 will-change-transform group-hover:scale-105"
            style={{ transform: 'translateZ(0)' }}
          />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to top, var(--cp-surface) 0%, transparent 60%)' }}
          />

          {/* Badges row */}
          <div className="absolute bottom-5 left-5 flex flex-wrap gap-2 items-center z-10">
            {badge}
            {hasAlerts && (
              <span
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold"
                style={{
                  borderRadius: 'var(--r-full)',
                  background: 'hsl(0 84% 60% / 0.15)',
                  color: 'hsl(0,84%,60%)',
                  border: '1px solid hsl(0 84% 60% / 0.4)',
                }}
              >
                <AlertTriangle size={11} /> Alert Zone
              </span>
            )}
            {recommendationPercentage !== undefined && (
              <span
                className="pill-tag"
                style={{
                  background: 'hsl(258 90% 63% / 0.15)',
                  color: 'var(--cp-primary)',
                  border: '1px solid hsl(258 90% 63% / 0.35)',
                }}
              >
                <Sparkles size={11} className="fill-current" /> {recommendationPercentage}% Match
              </span>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="relative flex flex-col gap-4 p-6 sm:p-8 z-10">
          <div className="flex flex-wrap items-center gap-3 text-sm" style={{ color: 'var(--cp-text-3)' }}>
            <span className="font-semibold" style={{ color: 'var(--cp-text-1)' }}>{event.organizer}</span>
            <span
              className="h-1 w-1 rounded-full"
              style={{ background: 'var(--cp-border)' }}
            />
            {event.distance && (
              <span className="inline-flex items-center gap-1">
                <MapPin size={12} style={{ color: 'var(--cp-text-3)' }} />
                {event.distance}
              </span>
            )}
          </div>

          <div className="space-y-2">
            <h3
              className="font-headline font-bold tracking-tight"
              style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', color: 'var(--cp-text-1)', lineHeight: 1.15 }}
            >
              {event.title}
            </h3>
            <p
              className="leading-relaxed line-clamp-3"
              style={{ fontSize: '0.9375rem', color: 'var(--cp-text-2)' }}
            >
              {event.description}
            </p>
          </div>

          {/* Progress bar */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--cp-text-3)' }}>Energy Level</span>
              <span className="text-xs font-black" style={{ color: categoryStyle.color }}>{progress}%</span>
            </div>
            <div
              className="h-2 w-full overflow-hidden"
              style={{ borderRadius: 'var(--r-full)', background: 'var(--cp-surface-dim)', border: '1px solid var(--cp-border)' }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
                className="h-full relative overflow-hidden"
                style={{
                  background: `linear-gradient(90deg, ${categoryStyle.color}, var(--cp-primary))`,
                }}
              >
                <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)] -translate-x-full animate-[shimmer_2s_infinite]" />
              </motion.div>
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between">
            <Link
              href={`/event/${event.id}`}
              className="btn-primary"
            >
              View Details
            </Link>
          </div>
        </div>
      </motion.article>
    );
  }

  // ═══════════════════════════════════════
  //  STANDARD CARD VARIANT
  // ═══════════════════════════════════════
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="group relative flex h-full flex-col overflow-hidden"
      style={{
        borderRadius: 'var(--r-2xl)',
        border: '1.5px solid var(--cp-border)',
        background: 'var(--cp-surface)',
        boxShadow: 'var(--shadow-sm)',
        transition: 'box-shadow 0.3s ease, transform 0.3s ease, border-color 0.3s ease',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.transform = 'translateY(-4px)';
        el.style.boxShadow = `var(--shadow-md)`;
        el.style.borderColor = categoryStyle.border;
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.transform = 'translateY(0)';
        el.style.boxShadow = 'var(--shadow-sm)';
        el.style.borderColor = 'var(--cp-border)';
      }}
    >
      {/* Subtle category glow on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500"
        style={{ background: `radial-gradient(ellipse at 70% -10%, ${categoryStyle.glow}, transparent 55%)` }}
      />

      {/* Image */}
      <div className="relative h-48 overflow-hidden shrink-0" style={{ borderRadius: 'var(--r-2xl) var(--r-2xl) 0 0' }}>
        <Image
          src={event.imageUrl || event.image || '/logo.svg'}
          alt={event.title}
          fill
          className="object-cover transition-transform duration-700 will-change-transform group-hover:scale-105"
          style={{ transform: 'translateZ(0)' }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, var(--cp-surface) 5%, transparent 55%)' }}
        />

        {/* Category badge — top left */}
        <div className="absolute left-4 top-4 z-10">{badge}</div>

        {/* Dismiss button */}
        {onDismiss && (
          <button
            onClick={handleDismiss}
            className="absolute right-4 top-4 h-8 w-8 flex items-center justify-center z-20 transition-all hover:scale-110"
            title="Not interested"
            style={{
              borderRadius: 'var(--r-full)',
              background: 'var(--glass-bg)',
              border: '1px solid var(--glass-border)',
              color: 'var(--cp-text-2)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <X size={14} />
          </button>
        )}

        {/* Alert badge */}
        {hasAlerts && (
          <div className="absolute right-4 top-4 z-10" style={{ top: onDismiss ? '3rem' : '1rem' }}>
            <span
              className="pill-tag"
              style={{
                background: 'hsl(0 84% 60% / 0.15)',
                color: 'hsl(0,84%,60%)',
                border: '1px solid hsl(0 84% 60% / 0.4)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <AlertTriangle size={11} strokeWidth={2.5} /> Alert
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="relative flex flex-1 flex-col gap-3 p-5 z-10">

        {/* Organizer row */}
        <div className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-1.5 text-sm min-w-0">
            <span className="font-semibold truncate" style={{ color: 'var(--cp-text-1)' }}>{event.organizer}</span>
            {event.distance && (
              <>
                <span className="h-1 w-1 rounded-full shrink-0" style={{ background: 'var(--cp-border)' }} />
                <span className="inline-flex items-center gap-0.5 text-xs" style={{ color: 'var(--cp-text-3)' }}>
                  <MapPin size={11} /> {event.distance}
                </span>
              </>
            )}
          </div>

          {/* Recommendation % */}
          {recommendationPercentage !== undefined && (
            <span
              className="pill-tag"
              style={{
                background: 'hsl(258 90% 63% / 0.12)',
                color: 'var(--cp-primary)',
                border: '1px solid hsl(258 90% 63% / 0.3)',
              }}
            >
              <Sparkles size={11} className="fill-current" /> {recommendationPercentage}% Match
            </span>
          )}
        </div>

        {/* Reasons */}
        {reasons.length > 0 && (
          <div className="flex flex-col gap-1.5">
            {reasons.slice(0, 1).map((reason, idx) => (
              <div
                key={idx}
                className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 w-fit"
                style={{
                  borderRadius: 'var(--r-full)',
                  background: 'var(--cp-surface-dim)',
                  border: '1px solid var(--cp-border)',
                  color: 'var(--cp-text-2)',
                }}
              >
                <span>{REASON_ICON[reason.type] ?? REASON_ICON.default}</span>
                {reason.label}
              </div>
            ))}
          </div>
        )}

        {/* Matched interests */}
        {matchedInterests.length > 0 && reasons.length === 0 && (
          <div className="flex flex-wrap gap-1.5">
            {matchedInterests.slice(0, 3).map((interest) => (
              <span
                key={interest}
                className="text-[10px] font-bold px-2 py-0.5"
                style={{
                  borderRadius: 'var(--r-full)',
                  background: 'hsl(185 100% 55% / 0.12)',
                  color: 'var(--cp-cyan)',
                  border: '1px solid hsl(185 100% 55% / 0.35)',
                }}
              >
                {interest}
              </span>
            ))}
            {matchedInterests.length > 3 && (
              <span
                className="text-[10px] font-medium px-2 py-0.5"
                style={{
                  borderRadius: 'var(--r-full)',
                  background: 'var(--cp-surface-dim)',
                  color: 'var(--cp-text-3)',
                }}
              >
                +{matchedInterests.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Title + Description */}
        <div className="flex-1 space-y-1.5">
          <h3
            ref={titleRef}
            className="font-headline font-bold tracking-tight"
            style={{ fontSize: '1.0625rem', lineHeight: 1.25, color: 'var(--cp-text-1)' }}
          >
            {event.title}
          </h3>
          <p
            className="overflow-hidden text-sm leading-relaxed"
            style={{
              color: 'var(--cp-text-2)',
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: descriptionLineClamp,
            }}
          >
            {event.description}
          </p>
        </div>

        {/* Progress + Needs */}
        <div className="grid grid-cols-2 gap-2 mt-1">
          {/* Hype Progress */}
          <div
            className="p-3"
            style={{
              borderRadius: 'var(--r-lg)',
              background: 'var(--cp-surface-dim)',
              border: '1px solid var(--cp-border)',
            }}
          >
            <div className="text-[10px] font-semibold mb-1.5" style={{ color: 'var(--cp-text-3)' }}>Hype Progress</div>
            <div
              className="h-1.5 w-full overflow-hidden mb-1"
              style={{ borderRadius: 'var(--r-full)', background: 'var(--cp-border)' }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                className="h-full"
                style={{
                  borderRadius: 'var(--r-full)',
                  background: `linear-gradient(90deg, ${categoryStyle.color}, var(--cp-primary))`,
                }}
              />
            </div>
            <div className="text-xs font-bold" style={{ color: 'var(--cp-text-1)' }}>{progress}%</div>
          </div>

          {/* Needs */}
          <div
            className="p-3"
            style={{
              borderRadius: 'var(--r-lg)',
              background: 'var(--cp-surface-dim)',
              border: '1px solid var(--cp-border)',
            }}
          >
            <div className="text-[10px] font-semibold mb-1.5" style={{ color: 'var(--cp-text-3)' }}>Needs</div>
            <div className="flex flex-wrap gap-1">
              {event.needs?.goods   && <span className="pill-tag px-1.5 py-0.5" style={{ background: 'hsl(25 100% 62% / 0.15)', color: 'var(--cp-orange)', border: '1px solid hsl(25 100% 62% / 0.3)' }}>Goods</span>}
              {event.needs?.volunteers && <span className="pill-tag px-1.5 py-0.5" style={{ background: 'hsl(160 70% 44% / 0.15)', color: 'var(--cp-secondary)', border: '1px solid hsl(160 70% 44% / 0.3)' }}>Crew</span>}
              {event.needs?.funds   && <span className="pill-tag px-1.5 py-0.5" style={{ background: 'hsl(258 90% 63% / 0.15)', color: 'var(--cp-primary)', border: '1px solid hsl(258 90% 63% / 0.3)' }}>Funds</span>}
              {!event.needs         && <span className="text-[10px]" style={{ color: 'var(--cp-text-3)' }}>Review</span>}
            </div>
          </div>
        </div>

        {/* CTA */}
        <Link
          href={`/event/${event.id}`}
          className="mt-3 group/btn relative overflow-hidden inline-flex w-full items-center justify-center font-bold text-sm py-3 transition-all duration-300"
          style={{
            borderRadius: 'var(--r-xl)',
            background: 'var(--cp-surface-dim)',
            color: 'var(--cp-text-1)',
            border: '1.5px solid var(--cp-border)',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLElement;
            el.style.borderColor = categoryStyle.color;
            el.style.transform = 'scale(1.02)';
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLElement;
            el.style.borderColor = 'var(--cp-border)';
            el.style.transform = 'scale(1)';
          }}
        >
          <div 
            className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"
            style={{ background: `linear-gradient(135deg, ${categoryStyle.color}, var(--cp-primary))` }}
          />
          <span className="relative z-10 group-hover/btn:text-white transition-colors duration-300">
            View Details →
          </span>
        </Link>
      </div>
    </motion.article>
  );
}
