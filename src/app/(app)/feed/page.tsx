'use client';

import { useState, useEffect, Suspense, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { EventCard, CATEGORY_COLORS } from '@/components/EventCard';
import { getEvents } from '@/services/eventService';
import MapWrapper from '@/components/MapWrapper';
import InterestMatchBanner from '@/components/InterestMatchBanner';
import { useAuth } from '@/context/AuthContext';
import { CommunityEvent } from '@/types';
import { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { ArrowUpDown, ChevronDown, SlidersHorizontal, Sparkles, X, Compass, MapPin, CalendarOff, Search } from 'lucide-react';
import { isPointInPolygon, getDistanceMiles } from '@/utils/geo';
import { getRecommendedEvents } from '@/services/recommendationService';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const PAGE_SIZE = 12;

type FilterState = {
  urgency: 'all' | 'high' | 'normal';
  need: 'all' | 'volunteers' | 'funds' | 'goods';
  distance: 'all' | 'within-5' | 'within-15' | 'within-30';
  category: string;
};

type SortOption = 'recommended' | 'recent' | 'urgent' | 'nearest';

const DEFAULT_FILTERS: FilterState = {
  urgency: 'all',
  need: 'all',
  distance: 'all',
  category: 'all',
};

function parseDistanceMiles(distance: string | undefined) {
  if (!distance) return null;
  const numericDistance = Number.parseFloat(distance.replace(/[^0-9.]/g, ''));
  return Number.isFinite(numericDistance) ? numericDistance : null;
}

function getEventTimestamp(event: CommunityEvent) {
  const createdAt = event.createdAt;

  if (createdAt && typeof createdAt === 'object' && 'toDate' in createdAt && typeof createdAt.toDate === 'function') {
    return createdAt.toDate().getTime();
  }

  if (event.eventDate) {
    const eventDate = new Date(event.eventDate).getTime();
    if (Number.isFinite(eventDate)) return eventDate;
  }

  return 0;
}

export default function FeedPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center h-[3.5rem]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>}>
      <FeedContent />
    </Suspense>
  );
}

function FeedContent() {
  const { profile } = useAuth();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(urlQuery);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [userLocation, setUserLocation] = useState('Detecting location...');
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [sortBy, setSortBy] = useState<SortOption>('recommended');
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [sortChanged, setSortChanged] = useState(false); // Animation trigger for sort change
  const [bannerHiding, setBannerHiding] = useState(false); // Track banner disappear animation
  const prevSortRef = useRef<SortOption>('recommended');
  const prevSearchRef = useRef<string>('');
  const filterMenuRef = useRef<HTMLDivElement | null>(null);
  const sortMenuRef = useRef<HTMLDivElement | null>(null);

  // Semantic search state
  const [semanticResults, setSemanticResults] = useState<string[] | null>(null);
  const [isAIPowered, setIsAIPowered] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchCacheRef = useRef<Map<string, { results: string[]; isAIPowered: boolean }>>(new Map());
  const abortControllerRef = useRef<AbortController | null>(null);
  const rateLimitExpiresRef = useRef<number>(0);

  // Sync from URL when it changes (e.g. user searches from navbar)
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setSearchQuery(urlQuery);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [urlQuery]);

  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const lastDocRef = useRef<QueryDocumentSnapshot<DocumentData> | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target as Node)) {
        setFilterMenuOpen(false);
      }
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target as Node)) {
        setSortMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=en`);
            const data = await response.json();
            const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || 'Current Location';
            const state = data.address?.state || '';
            setUserLocation(state ? `${city}, ${state}` : city);
          } catch {
            setUserLocation('Location unavailable');
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          setUserLocation('Location access denied');
        }
      );
    } else {
      const frame = window.requestAnimationFrame(() => {
        setUserLocation('Location not supported');
      });

      return () => window.cancelAnimationFrame(frame);
    }
  }, []);

  useEffect(() => {
    const fetchEventsAndAlerts = async () => {
      try {
        const eventsResult = await getEvents(PAGE_SIZE);
        setEvents(eventsResult.events);
        lastDocRef.current = eventsResult.lastDoc;
        setHasMore(eventsResult.hasMore);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEventsAndAlerts();
  }, []);

  // Track banner visibility changes with animation
  useEffect(() => {
    const shouldShowBanner = sortBy === 'recommended' && !searchQuery;
    const wasBannerVisible = prevSortRef.current === 'recommended' && !prevSearchRef.current;

    if (wasBannerVisible && !shouldShowBanner) {
      // Banner is hiding - trigger disappear animation
      setBannerHiding(true);
      const timeout = setTimeout(() => setBannerHiding(false), 350);
      return () => clearTimeout(timeout);
    }

    prevSortRef.current = sortBy;
    prevSearchRef.current = searchQuery;
  }, [sortBy, searchQuery]);

  // Semantic search effect with debounce
  const performSemanticSearch = useCallback(async (query: string) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      setSemanticResults(null);
      setIsAIPowered(false);
      setSearchLoading(false);
      return;
    }

    // Check if we are temporarily rate limited
    if (Date.now() < rateLimitExpiresRef.current) {
      setSemanticResults(null);
      setIsAIPowered(false);
      setSearchLoading(false);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    // Check cache
    if (searchCacheRef.current.has(trimmedQuery)) {
      const cachedData = searchCacheRef.current.get(trimmedQuery);
      if (cachedData) {
        setSemanticResults(cachedData.results);
        setIsAIPowered(cachedData.isAIPowered);
        setSearchLoading(false);
        return;
      }
    }

    setSearchLoading(true);
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: trimmedQuery }),
        signal: abortControllerRef.current.signal,
      });

      const data = await response.json();
      
      if (response.status === 429) {
        // Disable AI search for 1 minute
        rateLimitExpiresRef.current = Date.now() + 60000;
        setSemanticResults(null);
        setIsAIPowered(false);
      } else if (data.success) {
        setSemanticResults(data.results);
        setIsAIPowered(data.isAIPowered);
        // Cache result
        searchCacheRef.current.set(trimmedQuery, {
          results: data.results,
          isAIPowered: data.isAIPowered,
        });
      } else {
        // Fallback: clear semantic results and use client-side filtering
        setSemanticResults(null);
        setIsAIPowered(false);
      }
    } catch (error) {
      if ((error as any).name === 'AbortError') {
        // Request was aborted, do not clear loading or update state
        return;
      }
      console.error('Semantic search failed:', error);
      setSemanticResults(null);
      setIsAIPowered(false);
    } finally {
      if (abortControllerRef.current && !abortControllerRef.current.signal.aborted) {
        setSearchLoading(false);
      }
    }
  }, []);

  // Debounced search trigger
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        performSemanticSearch(searchQuery);
      }, 800);
    } else {
      const frame = window.requestAnimationFrame(() => {
        setSemanticResults(null);
        setIsAIPowered(false);
        setSearchLoading(false);
      });

      return () => {
        window.cancelAnimationFrame(frame);
      };
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, performSemanticSearch]);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const result = await getEvents(PAGE_SIZE, lastDocRef.current);
      setEvents(prev => [...prev, ...result.events]);
      lastDocRef.current = result.lastDoc;
      setHasMore(result.hasMore);
    } catch (error) {
      console.error("Failed to load more events:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  const categoryOptions = Array.from(
    new Set(events.map((event) => event.category).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b));

  // Smart filtering: use semantic results if available, otherwise fallback to client-side
  const filteredEvents = (() => {
    let result = events;

    // If semantic search returned results, reorder by those IDs
    if (semanticResults && searchQuery.trim()) {
      const idOrder = new Map(semanticResults.map((id, index) => [id, index]));
      result = events
        .filter(e => idOrder.has(e.id))
        .sort((a, b) => (idOrder.get(a.id) ?? 999) - (idOrder.get(b.id) ?? 999));
    } else if (searchQuery.trim() && !semanticResults) {
      // Fallback to client-side keyword search
      const q = searchQuery.toLowerCase();
      result = events.filter(e =>
        e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q)
      );
    }

    if (filters.urgency !== 'all') {
      result = result.filter((event) => event.urgency === filters.urgency);
    }

    if (filters.need !== 'all') {
      result = result.filter((event) => {
        if (filters.need === 'volunteers') return Boolean(event.needs?.volunteers?.goal);
        if (filters.need === 'funds') return Boolean(event.needs?.funds?.goal);
        if (filters.need === 'goods') return Boolean(event.needs?.goods?.length);
        return true;
      });
    }

    if (filters.distance !== 'all') {
      const maxDistance = filters.distance === 'within-5'
        ? 5
        : filters.distance === 'within-15'
          ? 15
          : 30;

      result = result.filter((event) => {
        const distanceMiles = parseDistanceMiles(event.distance);
        return distanceMiles !== null && distanceMiles <= maxDistance;
      });
    }

    if (filters.category !== 'all') {
      result = result.filter((event) => event.category === filters.category);
    }

    return result;
  })();

  const sortedEvents = (() => {
    const result = [...filteredEvents];

    if (sortBy === 'recommended') {
      const recommendedOrder = new Map(
        getRecommendedEvents(profile as any, result, result.length).map(({ event }, index) => [event.id, index])
      );

      return result.sort((a, b) => {
        const aRank = recommendedOrder.get(a.id);
        const bRank = recommendedOrder.get(b.id);

        if (aRank !== undefined && bRank !== undefined) return aRank - bRank;
        if (aRank !== undefined) return -1;
        if (bRank !== undefined) return 1;

        const aTime = getEventTimestamp(a);
        const bTime = getEventTimestamp(b);
        return bTime - aTime;
      });
    }

    if (sortBy === 'recent') {
      return result.sort((a, b) => getEventTimestamp(b) - getEventTimestamp(a));
    }

    if (sortBy === 'urgent') {
      return result.sort((a, b) => {
        if (a.urgency === b.urgency) return getEventTimestamp(b) - getEventTimestamp(a);
        return a.urgency === 'high' ? -1 : 1;
      });
    }

    return result.sort((a, b) => {
      const aDistance = parseDistanceMiles(a.distance);
      const bDistance = parseDistanceMiles(b.distance);

      if (aDistance === null && bDistance === null) return getEventTimestamp(b) - getEventTimestamp(a);
      if (aDistance === null) return 1;
      if (bDistance === null) return -1;

      return aDistance - bDistance;
    });
  })();

  const activeFilters = [
    filters.urgency !== 'all' ? {
      key: 'urgency' as const,
      label: filters.urgency === 'high' ? 'Urgent' : 'Normal urgency',
    } : null,
    filters.need !== 'all' ? {
      key: 'need' as const,
      label: filters.need === 'goods'
        ? 'Needs goods'
        : filters.need === 'funds'
          ? 'Needs funds'
          : 'Needs volunteers',
    } : null,
    filters.distance !== 'all' ? {
      key: 'distance' as const,
      label: filters.distance === 'within-5'
        ? 'Within 5 miles'
        : filters.distance === 'within-15'
          ? 'Within 15 miles'
          : 'Within 30 miles',
    } : null,
    filters.category !== 'all' ? {
      key: 'category' as const,
      label: filters.category,
    } : null,
  ].filter(Boolean) as Array<{ key: keyof FilterState; label: string }>;

  const activeFilterCount = activeFilters.length;
  const sortLabel = sortBy === 'recommended'
    ? 'Recommended'
    : sortBy === 'recent'
      ? 'Recent'
      : sortBy === 'urgent'
        ? 'Urgent first'
        : 'Nearest';

  const sortOptions: Array<{ value: SortOption; label: string; description: string }> = [
    { value: 'recommended', label: 'Recommended', description: 'Best matches based on your profile skills.' },
    { value: 'recent', label: 'Recent', description: 'Newest event posts first.' },
    { value: 'urgent', label: 'Urgent first', description: 'High-urgency events rise to the top.' },
    { value: 'nearest', label: 'Nearest', description: 'Events with the shortest listed distance first.' },
  ];

  const recommendationData = (() => {
    if (sortBy !== 'recommended' || (!profile?.skills && !profile?.interests) || events.length === 0) {
      return {};
    }

    const recommendedEvents = getRecommendedEvents(profile as any, events, events.length);

    if (recommendedEvents.length === 0) {
      return {};
    }

    const maxScore = Math.max(...recommendedEvents.map((recommendation) => recommendation.score), 1);
    const data: Record<string, { score: number; matchedInterests: string[]; percentage: number }> = {};

    recommendedEvents.forEach((recommendation) => {
      data[recommendation.event.id] = {
        score: recommendation.score,
        matchedInterests: recommendation.matchedInterests,
        percentage: Math.round((recommendation.score / maxScore) * 100),
      };
    });

    return data;
  })();

  return (
    <div className="flex-1 flex flex-col w-full" style={{ color: 'var(--cp-text-1)' }}>
      <main className="flex-1 max-w-7xl mx-auto w-full px-3 py-4 pb-32 sm:px-4 md:p-10 md:pb-10">

        {/* Header */}
        <div className="relative z-30 mb-8 flex flex-col gap-4 animate-fade-in-up lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="pill-tag mb-3" style={{ background: 'var(--cp-primary-light)', color: 'var(--cp-primary)', border: '1px solid hsl(from var(--cp-primary) h s l / 0.2)' }}>
              <Compass size={14} />
              Discovery Feed
            </div>
            <h2 className="font-headline font-bold tracking-tight text-on-surface" style={{ fontSize: 'clamp(1.75rem, 5vw, 2.75rem)', lineHeight: 1.1 }}>
              Discover &{' '}
              <span className="premium-gradient-text">Support</span>
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed" style={{ color: 'var(--cp-text-2)' }}>
              Find local campus events and support your community.
            </p>
            {searchQuery && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium" style={{ color: 'var(--cp-text-3)' }}>Results for</span>
                <span className="px-3 py-0.5 text-sm font-bold" style={{ borderRadius: 'var(--r-full)', background: 'var(--cp-gold-light)', color: 'var(--cp-text-1)', border: '1px solid hsl(from var(--cp-gold) h s l / 0.3)' }}>
                  &ldquo;{searchQuery}&rdquo;
                </span>
                {isAIPowered && (
                  <span className="pill-tag" style={{ background: 'var(--cp-secondary-light)', color: 'var(--cp-secondary)', border: '1px solid hsl(from var(--cp-secondary) h s l / 0.2)' }}>
                    <Sparkles size={12} />AI-powered
                  </span>
                )}
                <button onClick={() => setSearchQuery('')} className="text-xs font-bold px-3 py-1 transition-all hover:bg-surface-variant" style={{ borderRadius: 'var(--r-full)', background: 'var(--cp-surface-dim)', color: 'var(--cp-text-2)', border: '1px solid var(--cp-border)' }}>✕ Clear</button>
              </div>
            )}
          </div>

          <div className="flex w-full flex-col gap-3 lg:w-auto lg:items-end">
            <div className="flex w-full gap-2 sm:flex-wrap sm:items-center lg:justify-end">
              {/* View Toggle */}
              <div className="flex p-1 gap-1 relative" style={{ borderRadius: 'var(--r-full)', border: '1px solid var(--cp-border)', background: 'var(--cp-surface-dim)' }}>
                {(['list', 'map'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className="px-5 py-1.5 text-xs font-bold transition-all relative z-10"
                    style={{
                      color: viewMode === mode ? 'var(--cp-primary)' : 'var(--cp-text-3)',
                    }}
                  >
                    {viewMode === mode && (
                      <motion.div
                        layoutId="activeView"
                        className="absolute inset-0 z-[-1]"
                        style={{
                          borderRadius: 'var(--r-full)',
                          background: 'var(--cp-surface)',
                          boxShadow: 'var(--shadow-sm)',
                        }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    {mode === 'list' ? 'List View' : 'Map View'}
                  </button>
                ))}
              </div>

              {/* Location Chip */}
              <div className="flex items-center px-3 py-2 flex-1 sm:flex-none sm:max-w-[220px]" style={{ borderRadius: 'var(--r-full)', border: '1px solid var(--cp-border)', background: 'var(--cp-surface)' }}>
                <MapPin size={14} className="mr-2 shrink-0" style={{ color: 'var(--cp-accent)' }} />
                <span className="text-xs font-bold truncate text-on-surface" title={userLocation}>{userLocation}</span>
              </div>
            </div>

            <div className="flex w-full items-center gap-2 lg:justify-end">
              {/* Search Bar */}
              <div className="relative flex-1 lg:flex-none lg:w-64 group">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-primary" style={{ color: 'var(--cp-text-3)' }} />
                <input
                  type="text"
                  placeholder="Search events, skills, or causes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm font-medium transition-all"
                  style={{ 
                    borderRadius: 'var(--r-full)', 
                    border: '1.5px solid var(--cp-border)', 
                    background: 'var(--cp-surface)',
                    color: 'var(--cp-text-1)',
                    boxShadow: 'var(--shadow-xs)'
                  }}
                />
              </div>
              {/* Filter Button */}
              <div className={`relative shrink-0 ${filterMenuOpen ? 'z-50' : 'z-40'}`} ref={filterMenuRef}>
                <button
                  onClick={() => setFilterMenuOpen((open) => !open)}
                  aria-label="Open filters"
                  className="relative inline-flex h-11 w-11 items-center justify-center text-sm font-bold transition-all sm:h-auto sm:w-auto sm:gap-2 sm:px-4 sm:py-2 hover:scale-105"
                  style={{
                    borderRadius: 'var(--r-full)',
                    background: filterMenuOpen || activeFilterCount > 0 ? 'var(--cp-primary)' : 'var(--cp-surface)',
                    color: filterMenuOpen || activeFilterCount > 0 ? '#fff' : 'var(--cp-text-1)',
                    border: `1px solid ${filterMenuOpen || activeFilterCount > 0 ? 'var(--cp-primary)' : 'var(--cp-border)'}`,
                    boxShadow: filterMenuOpen || activeFilterCount > 0 ? 'var(--shadow-md)' : 'var(--shadow-xs)',
                  }}
                >
                  <SlidersHorizontal size={16} />
                  <span className="hidden sm:inline">Filters</span>
                  {activeFilterCount > 0 && (
                    <span className="absolute -right-1 -top-1 sm:static inline-flex min-w-5 items-center justify-center px-1.5 py-0.5 text-[10px] font-bold" style={{ borderRadius: 'var(--r-full)', background: 'var(--cp-gold)', color: 'var(--cp-text-1)', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                      {activeFilterCount}
                    </span>
                  )}
                  <ChevronDown size={16} className={`hidden transition-transform duration-300 sm:inline ${filterMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {filterMenuOpen && (
                  <div
                    className="fixed inset-x-3 top-20 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-50 overflow-y-auto p-4 md:absolute md:right-0 md:top-full md:bottom-auto md:mt-2 md:w-[min(24rem,calc(100vw-2rem))] md:overflow-hidden md:p-5"
                    style={{ borderRadius: 'var(--r-xl)', border: '1px solid var(--cp-border)', background: 'var(--cp-surface)', boxShadow: 'var(--shadow-xl)' }}
                  >
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <p className="text-base font-bold" style={{ color: 'var(--cp-text-1)' }}>Filter Events</p>
                      <button
                        onClick={() => setFilters(DEFAULT_FILTERS)}
                        className="px-3 py-1 text-xs font-bold transition-colors"
                        style={{ borderRadius: 'var(--r-full)', background: 'var(--cp-gold-light)', color: 'var(--cp-text-1)', border: '1px solid var(--cp-gold)' }}
                      >
                        Reset
                      </button>
                    </div>

                    <div className="space-y-3">
                      {/* Urgency */}
                      <div className="p-3" style={{ borderRadius: 'var(--r-lg)', border: '1px solid var(--cp-border)' }}>
                        <span className="mb-2 block text-[10px] font-bold tracking-tight" style={{ color: 'var(--cp-text-3)' }}>Urgency</span>
                        <div className="grid grid-cols-3 gap-1 p-1 bg-surface-variant/30" style={{ borderRadius: 'var(--r-lg)', background: 'var(--cp-surface-dim)' }}>
                          {[{ value: 'all', label: 'All' }, { value: 'high', label: 'Urgent' }, { value: 'normal', label: 'Normal' }].map((o) => {
                            const active = filters.urgency === o.value;
                            return (
                              <button key={o.value} onClick={() => setFilters((c) => ({ ...c, urgency: o.value as FilterState['urgency'] }))}
                                className="px-3 py-2 text-xs font-bold transition-all relative z-10"
                                style={{ color: active ? '#fff' : 'var(--cp-text-2)' }}>
                                {active && (
                                  <motion.div
                                    layoutId="urgencyFilter"
                                    className="absolute inset-0 z-[-1]"
                                    style={{ borderRadius: 'var(--r-md)', background: 'var(--cp-primary)', boxShadow: 'var(--shadow-sm)' }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                  />
                                )}
                                {o.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Need */}
                      <div className="p-3" style={{ borderRadius: 'var(--r-lg)', border: '1px solid var(--cp-border)' }}>
                        <span className="mb-2 block text-[10px] font-bold tracking-tight" style={{ color: 'var(--cp-text-3)' }}>Support Needed</span>
                        <div className="grid grid-cols-2 gap-1 p-1" style={{ borderRadius: 'var(--r-lg)', background: 'var(--cp-surface-dim)' }}>
                          {[{ value: 'all', label: 'Any' }, { value: 'volunteers', label: 'Volunteers' }, { value: 'funds', label: 'Funds' }, { value: 'goods', label: 'Goods' }].map((o) => {
                            const active = filters.need === o.value;
                            return (
                              <button key={o.value} onClick={() => setFilters((c) => ({ ...c, need: o.value as FilterState['need'] }))}
                                className="px-3 py-2 text-xs font-bold transition-all relative z-10"
                                style={{ color: active ? '#fff' : 'var(--cp-text-2)' }}>
                                {active && (
                                  <motion.div
                                    layoutId="needFilter"
                                    className="absolute inset-0 z-[-1]"
                                    style={{ borderRadius: 'var(--r-md)', background: 'var(--cp-primary)', boxShadow: 'var(--shadow-sm)' }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                  />
                                )}
                                {o.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Distance */}
                      <div className="p-3" style={{ borderRadius: 'var(--r-lg)', border: '1px solid var(--cp-border)' }}>
                        <span className="mb-2 block text-[10px] font-bold tracking-tight" style={{ color: 'var(--cp-text-3)' }}>Distance</span>
                        <div className="grid grid-cols-2 gap-1 p-1" style={{ borderRadius: 'var(--r-lg)', background: 'var(--cp-surface-dim)' }}>
                          {[{ value: 'all', label: 'Any' }, { value: 'within-5', label: 'Within 5 mi' }, { value: 'within-15', label: 'Within 15 mi' }, { value: 'within-30', label: 'Within 30 mi' }].map((o) => {
                            const active = filters.distance === o.value;
                            return (
                              <button key={o.value} onClick={() => setFilters((c) => ({ ...c, distance: o.value as FilterState['distance'] }))}
                                className="px-3 py-2 text-xs font-bold transition-all relative z-10"
                                style={{ color: active ? '#fff' : 'var(--cp-text-2)' }}>
                                {active && (
                                  <motion.div
                                    layoutId="distanceFilter"
                                    className="absolute inset-0 z-[-1]"
                                    style={{ borderRadius: 'var(--r-md)', background: 'var(--cp-primary)', boxShadow: 'var(--shadow-sm)' }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                  />
                                )}
                                {o.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Category */}
                      <div className="p-3" style={{ borderRadius: 'var(--r-lg)', border: '1px solid var(--cp-border)' }}>
                        <span className="mb-3 block text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--cp-text-3)' }}>Filter by Category</span>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => setFilters((c) => ({ ...c, category: 'all' }))}
                            className="px-4 py-2 text-xs font-bold transition-all hover:scale-105 active:scale-95"
                            style={{ 
                              borderRadius: 'var(--r-full)', 
                              background: filters.category === 'all' ? 'var(--cp-primary)' : 'var(--cp-surface-dim)',
                              color: filters.category === 'all' ? '#fff' : 'var(--cp-text-2)',
                              border: `1px solid ${filters.category === 'all' ? 'var(--cp-primary)' : 'var(--cp-border)'}`,
                              boxShadow: filters.category === 'all' ? 'var(--shadow-sm)' : 'none'
                            }}
                          >
                            All Categories
                          </button>
                          {categoryOptions.map((cat) => {
                            const active = filters.category === cat;
                            const colors = CATEGORY_COLORS[cat] || CATEGORY_COLORS.default;
                            return (
                              <button
                                key={cat}
                                onClick={() => setFilters((c) => ({ ...c, category: cat }))}
                                className="px-4 py-2 text-xs font-bold transition-all hover:scale-105 active:scale-95"
                                style={{ 
                                  borderRadius: 'var(--r-full)', 
                                  background: active ? colors.bg : 'var(--cp-surface-dim)',
                                  color: active ? colors.color : 'var(--cp-text-2)',
                                  border: `1px solid ${active ? colors.border : 'var(--cp-border)'}`,
                                  boxShadow: active ? 'var(--shadow-sm)' : 'none'
                                }}
                              >
                                {cat}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 p-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between" style={{ borderRadius: 'var(--r-lg)', background: 'var(--cp-primary-light)', border: '1px solid hsl(from var(--cp-primary) h s l / 0.1)' }}>
                      <p className="text-sm font-bold" style={{ color: 'var(--cp-text-1)' }}>{sortedEvents.length} events match</p>
                      <button
                        onClick={() => setFilterMenuOpen(false)}
                        className="btn-primary text-sm"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Sort Button */}
              <div className={`relative shrink-0 ${filterMenuOpen ? 'z-30' : 'z-40'}`} ref={sortMenuRef}>
                <button
                  onClick={() => setSortMenuOpen((open) => !open)}
                  aria-label={`Sort: ${sortLabel}`}
                  className="inline-flex h-11 w-11 items-center justify-center text-sm font-bold transition-all sm:h-auto sm:w-auto sm:gap-2 sm:px-4 sm:py-2 hover:scale-105"
                  style={{
                    borderRadius: 'var(--r-full)',
                    background: sortMenuOpen ? 'var(--cp-primary)' : 'var(--cp-surface)',
                    color: sortMenuOpen ? '#fff' : 'var(--cp-text-1)',
                    border: `1px solid ${sortMenuOpen ? 'var(--cp-primary)' : 'var(--cp-border)'}`,
                    boxShadow: sortMenuOpen ? 'var(--shadow-md)' : 'var(--shadow-xs)',
                  }}
                >
                  <ArrowUpDown size={16} />
                  <span className="hidden sm:inline">Sort: {sortLabel}</span>
                  <ChevronDown size={16} className={`hidden transition-transform duration-300 sm:inline ${sortMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {sortMenuOpen && (
                  <div
                    className="fixed inset-x-3 top-20 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-50 overflow-y-auto p-4 md:absolute md:right-0 md:top-full md:bottom-auto md:mt-2 md:w-[min(21rem,calc(100vw-2rem))] md:overflow-hidden md:p-5"
                    style={{ borderRadius: 'var(--r-xl)', border: '1px solid var(--cp-border)', background: 'var(--cp-surface)', boxShadow: 'var(--shadow-xl)' }}
                  >
                    <p className="text-base font-bold mb-4" style={{ color: 'var(--cp-text-1)' }}>Sort Events</p>
                    <div className="space-y-2">
                      {sortOptions.map((option) => {
                        const active = sortBy === option.value;
                        return (
                          <button
                            key={option.value}
                            onClick={() => { setSortBy(option.value); setSortMenuOpen(false); setSortChanged(true); setTimeout(() => setSortChanged(false), 500); }}
                            className="w-full px-4 py-3 text-left transition-all"
                            style={{
                              borderRadius: 'var(--r-lg)',
                              background: active ? 'var(--cp-primary)' : 'var(--cp-surface-dim)',
                              color: active ? '#fff' : 'var(--cp-text-1)',
                              border: `1px solid ${active ? 'var(--cp-primary)' : 'var(--cp-border)'}`,
                            }}
                          >
                            <div className="text-sm font-bold">{option.label}</div>
                            <div className="mt-0.5 text-xs" style={{ opacity: 0.7 }}>{option.description}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Skill Match Banner */}
        {(sortBy === 'recommended' && !searchQuery) || bannerHiding ? (
          <div className={bannerHiding ? 'animate-slide-up' : 'animate-slide-down'}>
            <InterestMatchBanner condensed />
          </div>
        ) : null}

        {/* Active Filter Chips */}
        {activeFilters.length > 0 && (
          <section className="mb-8 animate-fade-in-up delay-100">
            <div className="flex flex-wrap items-center gap-2.5">
              {activeFilters.map((filterItem) => {
                const catColors = filterItem.key === 'category' ? (CATEGORY_COLORS[filters.category] ?? CATEGORY_COLORS.default) : null;
                return (
                  <button
                    key={filterItem.key}
                    onClick={() => setFilters((c) => ({ ...c, [filterItem.key]: DEFAULT_FILTERS[filterItem.key] }))}
                    className="pill-tag transition-all hover:scale-105 active:scale-95"
                    style={{ background: catColors ? catColors.bg : 'var(--cp-primary-light)', color: catColors ? catColors.color : 'var(--cp-primary)', border: `1px solid ${catColors ? catColors.border : 'hsl(from var(--cp-primary) h s l / 0.2)'}` }}
                  >
                    {filterItem.label}
                    <X size={14} />
                  </button>
                );
              })}
              <button onClick={() => setFilters(DEFAULT_FILTERS)} className="text-sm font-bold transition-colors" style={{ color: 'var(--cp-text-3)', borderBottom: '1px solid var(--cp-border)' }}>
                Clear all
              </button>
            </div>
          </section>
        )}

        {/* Events Grid / Map / Loading / Empty */}
        {loading || searchLoading ? (
          <div className="flex flex-col justify-center items-center py-20 gap-3">
            <div className="w-12 h-12 rounded-full animate-spin" style={{ border: '3px solid var(--cp-border)', borderTopColor: 'var(--cp-primary)' }} />
            {searchLoading && (
              <p className="text-sm font-bold flex items-center gap-2 mt-2" style={{ color: 'var(--cp-primary)' }}>
                <Sparkles size={14} />
                Searching with AI…
              </p>
            )}
          </div>
        ) : sortedEvents.length === 0 ? (
          <div className="card-base p-6 text-center animate-fade-in-up sm:p-10" style={{ boxShadow: 'var(--shadow-md)' }}>
            <CalendarOff size={36} className="mb-4 mx-auto" style={{ color: 'var(--cp-text-3)' }} />
            <h3 className="font-bold text-xl mb-2 text-on-surface">No events found</h3>
            <p className="text-on-surface-variant">No events match this criteria. Be the first to create one!</p>
          </div>
        ) : viewMode === 'map' ? (
          <div
            className="mt-4 h-[min(70vh,32rem)] w-full overflow-hidden animate-fade-in-up md:h-[600px] card-base"
            style={{ boxShadow: 'var(--shadow-lg)' }}
          >
            <MapWrapper events={sortedEvents} />
          </div>
        ) : (
          <div className={`grid grid-cols-1 gap-4 min-[560px]:grid-cols-2 sm:gap-6 lg:grid-cols-3 ${sortChanged ? 'animate-cards-reorder' : ''}`}>
            <ErrorBoundary>
              {sortedEvents.map((event, index) => {
                const normalizedEvent = { ...event, imageUrl: event.imageUrl || '/images/event-placeholder.jpg' };
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <EventCard
                      event={normalizedEvent}
                      recommendationPercentage={recommendationData[event.id]?.percentage}
                      matchedInterests={recommendationData[event.id]?.matchedInterests}
                    />
                  </motion.div>
                );
              })}
            </ErrorBoundary>
          </div>
        )}

        {/* Load More */}
        {hasMore && !loading && !searchQuery && (
          <div className="mt-12 flex justify-center">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="px-8 py-3 font-bold text-sm uppercase transition-all disabled:opacity-50 flex items-center gap-2"
              style={{ borderRadius: 'var(--r-full)', background: 'var(--cp-surface)', color: 'var(--cp-text-1)', border: '1.5px solid var(--cp-border)', boxShadow: 'var(--shadow-sm)' }}
            >
              {loadingMore ? (
                <><div className="w-4 h-4 rounded-full animate-spin" style={{ border: '2px solid var(--cp-border)', borderTopColor: 'var(--cp-primary)' }} />Loading…</>
              ) : 'Load More Events'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
