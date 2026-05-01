'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CommunityEvent } from '@/types';
import { SentinelAlert } from '@/types/sentinel';

interface EventCardProps {
  event: CommunityEvent;
  featured?: boolean;
  sentinelAlerts?: SentinelAlert[];
  recommendationScore?: number;
  recommendationPercentage?: number;
  matchedInterests?: string[];
  reasons?: { type: string; label: string }[];
  onDismiss?: (eventId: string) => void;
}

// Category → color mapping for brutalist tags
export const CATEGORY_COLORS: Record<string, { bg: string; color: string }> = {
  Music:       { bg: 'var(--pop-hot-pink)',       color: '#000000' },
  Art:         { bg: 'var(--pop-electric-purple)',color: '#000000' },
  Sports:      { bg: 'var(--pop-acid-lime)',      color: '#000000' },
  Tech:        { bg: 'var(--pop-sky-cyan)',       color: '#000000' },
  Cultural:    { bg: 'var(--pop-neon-orange)',    color: '#000000' },
  Networking:  { bg: 'var(--color-primary-container-base)', color: 'var(--color-on-primary-container-base)' },
  Academic:    { bg: 'var(--color-tertiary-container-base)', color: 'var(--color-on-tertiary-container-base)' },
  Party:       { bg: 'var(--pop-hot-pink)',       color: '#000000' },
  Athletics:   { bg: 'var(--pop-acid-lime)',      color: '#000000' },
  default:     { bg: 'var(--color-surface-container-base)', color: 'var(--color-on-surface-base)' },
};

export function EventCard({
  event,
  featured = false,
  sentinelAlerts = [],
  recommendationPercentage,
  matchedInterests = [],
  reasons = [],
  onDismiss,
}: EventCardProps) {
  const hasAlerts = sentinelAlerts.length > 0;
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
    return <div className="h-full min-h-[400px] border-4 border-dashed border-black/20 animate-pulse" />;
  }

  const categoryStyle = CATEGORY_COLORS[event.category as string] ?? CATEGORY_COLORS.default;
  const isUrgent = event.urgency === 'high';

  const badge = (
    <span
      className="inline-flex max-w-full items-center gap-1.5 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] border-2 border-black"
      style={{ background: isUrgent ? 'var(--color-error-container-base)' : categoryStyle.bg, color: isUrgent ? 'var(--color-on-error-container-base)' : categoryStyle.color }}
    >
      <span className="truncate">{isUrgent ? '⚡ Urgent' : event.category}</span>
    </span>
  );

  if (featured) {
    return (
      <article
        className="group overflow-hidden border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-150 hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:scale-[1.01] relative z-10 hover:z-20 animate-border-rainbow"
        style={{ background: 'var(--color-surface-container-lowest-base)' }}
      >
        <div className="relative h-56 overflow-hidden sm:h-64 md:h-72 border-b-4 border-black">
          <Image
            alt={event.title}
            src={event.imageUrl || event.image || '/logo.svg'}
            fill
            className="object-cover transition-transform duration-700 will-change-transform group-hover:scale-105 grayscale contrast-125 group-hover:grayscale-0"
            style={{ transform: 'translateZ(0)' }}
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute bottom-4 left-4 flex flex-wrap gap-2 sm:bottom-6 sm:left-6 items-center">
            {badge}
            {hasAlerts && (
              <span className="inline-flex items-center gap-1 px-3 py-1 text-[11px] font-bold text-white border-2 border-black" style={{ background: 'var(--color-error-base)' }}>
                <span className="material-symbols-outlined text-[12px]">warning</span>
                Alert Zone
              </span>
            )}
            {recommendationPercentage !== undefined && (
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold border-2 border-black animate-pulse-slow"
                style={{ background: 'var(--color-secondary-container-base)', color: 'var(--color-on-secondary-container-base)' }}
              >
                <span className="material-symbols-outlined text-xs">auto_awesome</span>
                <span>{recommendationPercentage}% Match</span>
              </div>
            )}
          </div>
          {reasons.length > 0 && (
            <div className="absolute right-4 top-4 flex flex-col gap-2 z-30">
               {reasons.slice(0, 1).map((reason, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center gap-2 px-3 py-1.5 border-2 border-black w-fit shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                    style={{ 
                      background: reason.type === 'social' ? 'var(--pop-acid-lime)' : 
                                  reason.type === 'urgency' ? 'var(--pop-neon-orange)' :
                                  reason.type === 'interest' ? 'var(--pop-sky-cyan)' :
                                  'var(--pop-electric-purple)',
                      color: '#000000'
                    }}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {reason.type === 'social' ? 'trending_up' : 
                       reason.type === 'urgency' ? 'alarm' :
                       reason.type === 'interest' ? 'favorite' :
                       'auto_awesome'}
                    </span>
                    <span className="text-[11px] font-black uppercase tracking-tight">{reason.label}</span>
                  </div>
                ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 px-5 pb-5 pt-5 sm:gap-5 sm:px-7 sm:pb-7 sm:pt-6">
          <div className="flex flex-wrap items-center gap-2 text-sm text-on-surface-variant sm:gap-3">
            <span className="font-bold text-on-surface font-label uppercase">{event.organizer}</span>
            <span className="opacity-40">•</span>
            <span>{event.distance}</span>
          </div>
          <div className="space-y-3">
            <h3 className="text-xl font-bold leading-tight font-headline uppercase tracking-tight text-on-surface sm:text-2xl md:text-3xl">{event.title}</h3>
            <p className="line-clamp-3 text-sm leading-relaxed text-on-surface-variant">{event.description}</p>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      className="group flex h-full flex-col overflow-hidden border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-150 hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:scale-[1.02] relative z-10 hover:z-20"
      style={{ background: 'var(--color-surface-container-lowest-base)' }}
    >
      <div className="relative h-40 overflow-hidden min-[430px]:h-44 sm:h-56 border-b-4 border-black">
        <Image
          src={event.imageUrl || event.image || '/logo.svg'}
          alt={event.title}
          fill
          className="object-cover transition-transform duration-500 will-change-transform group-hover:scale-105 grayscale contrast-125 group-hover:grayscale-0"
          style={{ transform: 'translateZ(0)' }}
        />
        <div className="absolute left-3 right-14 top-3 sm:left-4 sm:top-4">{badge}</div>
        
        {onDismiss && (
          <button 
            onClick={handleDismiss}
            className="absolute right-3 top-3 w-8 h-8 flex items-center justify-center border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-[var(--color-error-container-base)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all z-30"
            title="Not interested"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        )}

        {hasAlerts && (
          <div className="absolute right-3 top-14 sm:right-4 sm:top-16">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-white border-2 border-black" style={{ background: 'var(--color-error-base)' }}>
              <span className="material-symbols-outlined text-[11px]">warning</span>
              Alert
            </span>
          </div>
        )}
      </div>

      <div className="relative flex flex-1 flex-col gap-3 px-4 pb-4 pt-4 sm:gap-4 sm:px-5 sm:pb-5 sm:pt-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="min-w-0 flex flex-wrap items-center gap-2 text-sm text-on-surface-variant sm:gap-3">
            <span className="font-bold text-on-surface font-label uppercase">{event.organizer}</span>
            <span className="opacity-40">•</span>
            <span>{event.distance}</span>
          </div>
          {recommendationPercentage !== undefined && (
            <div
              className="inline-flex w-fit items-center gap-1.5 px-3 py-1 text-xs font-bold border-2 border-black animate-pulse-slow"
              style={{ background: 'var(--color-secondary-container-base)', color: 'var(--color-on-secondary-container-base)' }}
            >
              <span className="material-symbols-outlined text-xs">auto_awesome</span>
              <span>{recommendationPercentage}% Match</span>
            </div>
          )}
        </div>

        {reasons.length > 0 && (
          <div className="flex flex-col gap-1.5">
            {reasons.slice(0, 1).map((reason, idx) => (
              <div 
                key={idx}
                className="flex items-center gap-2 px-3 py-1.5 border-2 border-black w-fit animate-in fade-in slide-in-from-left-2 duration-500"
                style={{ 
                  background: reason.type === 'social' ? 'var(--pop-acid-lime)' : 
                              reason.type === 'urgency' ? 'var(--pop-neon-orange)' :
                              reason.type === 'interest' ? 'var(--pop-sky-cyan)' :
                              'var(--pop-electric-purple)',
                  color: '#000000'
                }}
              >
                <span className="material-symbols-outlined text-[14px]">
                  {reason.type === 'social' ? 'trending_up' : 
                   reason.type === 'urgency' ? 'alarm' :
                   reason.type === 'interest' ? 'favorite' :
                   'auto_awesome'}
                </span>
                <span className="text-[10px] font-black uppercase tracking-tight leading-none">{reason.label}</span>
              </div>
            ))}
          </div>
        )}

        {matchedInterests.length > 0 && reasons.length === 0 && (
          <div className="flex flex-wrap gap-1.5">
            {matchedInterests.slice(0, 3).map((interest) => (
              <span
                key={interest}
                className="px-2.5 py-1 text-[11px] font-bold border-2 border-black font-label uppercase"
                style={{ background: 'var(--color-tertiary-container-base)', color: 'var(--color-on-tertiary-container-base)' }}
              >
                {interest}
              </span>
            ))}
            {matchedInterests.length > 3 && (
              <span
                className="px-2.5 py-1 text-[11px] font-bold border-2 border-black font-label uppercase"
                style={{ background: 'var(--color-surface-container-base)', color: 'var(--color-on-surface-base)' }}
              >
                +{matchedInterests.length - 3} more
              </span>
            )}
          </div>
        )}

        <div className="flex-1 space-y-2">
          <h3 ref={titleRef} className="text-lg font-bold leading-tight tracking-tight text-on-surface font-headline uppercase sm:text-xl">{event.title}</h3>
          <p
            className="overflow-hidden text-sm leading-relaxed text-on-surface-variant"
            style={{ display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: descriptionLineClamp }}
          >
            {event.description}
          </p>
        </div>

        {/* Progress + Needs row */}
        <div className="grid gap-2.5 sm:grid-cols-2">
          <div
            className="p-3 text-sm text-on-surface-variant border-2 border-black"
            style={{ background: 'var(--color-surface-container-base)' }}
          >
            <div className="mb-2 text-xs font-bold uppercase tracking-wider text-on-surface font-label">Hype Progress</div>
            <div className="h-3 w-full overflow-hidden border-2 border-black" style={{ background: 'var(--color-surface-container-high-base)' }}>
              <div className="h-full transition-all duration-700 ease-out" style={{ width: `${event.progress}%`, background: 'var(--color-primary-container-base)' }} />
            </div>
            <div className="mt-1.5 text-xs font-bold font-label">{event.progress ?? 0}%</div>
          </div>
          <div
            className="p-3 text-sm text-on-surface-variant border-2 border-black"
            style={{ background: 'var(--color-surface-container-base)' }}
          >
            <div className="mb-2 text-xs font-bold uppercase tracking-wider text-on-surface font-label">Needs</div>
            <div className="flex flex-wrap gap-1.5">
              {event.needs?.goods && <span className="px-2.5 py-0.5 text-[11px] font-bold border-2 border-black font-label uppercase" style={{ background: 'var(--color-primary-container-base)', color: 'var(--color-on-primary-container-base)' }}>Goods</span>}
              {event.needs?.volunteers && <span className="px-2.5 py-0.5 text-[11px] font-bold border-2 border-black font-label uppercase" style={{ background: 'var(--color-secondary-container-base)', color: 'var(--color-on-secondary-container-base)' }}>Crew</span>}
              {event.needs?.funds && <span className="px-2.5 py-0.5 text-[11px] font-bold border-2 border-black font-label uppercase" style={{ background: 'var(--color-tertiary-container-base)', color: 'var(--color-on-tertiary-container-base)' }}>Funds</span>}
              {!event.needs && <span className="px-2.5 py-0.5 text-[11px] font-bold font-label uppercase text-on-surface-variant">Review</span>}
            </div>
          </div>
        </div>

        <Link
          href={`/event/${event.id}`}
          className="inline-flex w-full items-center justify-center px-6 py-3 text-sm font-bold font-label uppercase tracking-wider border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-[0.97]"
          style={{ background: 'var(--color-primary-container-base)', color: 'var(--color-on-primary-container-base)' }}
        >
          View Details →
        </Link>
      </div>
    </article>
  );
}
