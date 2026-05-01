'use client';

import { useState, useEffect, Suspense, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { EventCard, CATEGORY_COLORS } from '@/components/EventCard';
import { getEvents } from '@/services/eventService';
import MapWrapper from '@/components/MapWrapper';
import SkillMatchBanner from '@/components/SkillMatchBanner';
import { useAuth } from '@/context/AuthContext';
import { CommunityEvent } from '@/types';
import { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { ArrowUpDown, ChevronDown, SlidersHorizontal, Sparkles, X } from 'lucide-react';
import { isPointInPolygon, getDistanceMiles } from '@/utils/geo';
import { SentinelAlert } from '@/types/sentinel';
import { getRecommendedEvents } from '@/services/recommendationService';

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
  const [alerts, setAlerts] = useState<SentinelAlert[]>([]);
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
        const [eventsResult, alertsResult] = await Promise.all([
          getEvents(PAGE_SIZE),
          fetch('/api/sentinel').then(res => res.ok ? res.json() : [])
        ]);
        setEvents(eventsResult.events);
        setAlerts(alertsResult);
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
        getRecommendedEvents(profile?.skills ?? [], result, result.length, profile?.equipment ?? []).map(({ event }, index) => [event.id, index])
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

    const recommendedEvents = getRecommendedEvents(profile?.interests || profile?.skills || [], events, events.length, profile?.clubs || []);

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
    <div className="flex-1 flex flex-col text-black w-full">
      <main className="flex-1 max-w-7xl mx-auto w-full px-3 py-4 pb-32 sm:px-4 md:p-10 md:pb-10">

        {/* Header */}
        <div className="relative z-30 mb-8 flex flex-col gap-4 animate-fade-in-up lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 border-2 border-black text-xs font-black uppercase tracking-widest mb-3 bg-[#ccdcff]"
              style={{ boxShadow: '2px 2px 0 #000' }}
            >
              <span className="material-symbols-outlined text-sm">explore</span>
              Discovery Feed
            </div>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-black uppercase leading-none">
              Discover &amp; <span className="bg-[#ffd93d] px-2 border-4 border-black">Support</span>
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-black/60 font-medium">
              Find local campus events and support your community.
            </p>
            {searchQuery && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-sm text-black/60 font-medium">Results for</span>
                <span className="border-2 border-black px-3 py-0.5 text-sm font-black bg-[#ffd93d]" style={{ boxShadow: '2px 2px 0 #000' }}>
                  &ldquo;{searchQuery}&rdquo;
                </span>
                {isAIPowered && (
                  <span className="inline-flex items-center gap-1 text-xs font-black border-2 border-black px-2.5 py-1 bg-[#93f59c]" style={{ boxShadow: '2px 2px 0 #000' }}>
                    <Sparkles size={12} />AI-powered
                  </span>
                )}
                <button onClick={() => setSearchQuery('')} className="text-xs font-black border-2 border-black px-2 py-0.5 bg-white hover:bg-red-100 transition-colors ml-1">✕ Clear</button>
              </div>
            )}
          </div>

          <div className="flex w-full flex-col gap-3 lg:w-auto lg:items-end">
            <div className="flex w-full gap-2 sm:flex-wrap sm:items-center lg:justify-end">
              {/* View Toggle */}
              <div className="flex border-2 border-black" style={{ boxShadow: '2px 2px 0 #000' }}>
                {(['list', 'map'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-4 py-2 text-sm font-black uppercase transition-all ${viewMode === mode ? 'bg-black text-white' : 'bg-white text-black hover:bg-[#ffd93d]'}`}
                  >
                    {mode}
                  </button>
                ))}
              </div>

              {/* Location Chip */}
              <div className="flex items-center border-2 border-black px-3 py-2 bg-white flex-1 sm:flex-none sm:max-w-[220px]" style={{ boxShadow: '2px 2px 0 #000' }}>
                <span className="material-symbols-outlined text-sm mr-2 shrink-0">location_on</span>
                <span className="text-xs font-black uppercase truncate" title={userLocation}>{userLocation}</span>
              </div>
            </div>

            <div className="ml-auto flex w-auto items-center gap-2 sm:contents">
              {/* Filter Button */}
              <div className={`relative shrink-0 ${filterMenuOpen ? 'z-50' : 'z-40'}`} ref={filterMenuRef}>
                <button
                  onClick={() => setFilterMenuOpen((open) => !open)}
                  aria-label="Open filters"
                  className={`relative inline-flex h-11 w-11 items-center justify-center border-2 border-black text-sm font-black transition-all sm:h-auto sm:w-auto sm:gap-2 sm:px-4 sm:py-2 uppercase ${filterMenuOpen || activeFilterCount > 0 ? 'bg-black text-white' : 'bg-white text-black hover:bg-[#ffd93d]'}`}
                  style={{ boxShadow: filterMenuOpen || activeFilterCount > 0 ? 'none' : '2px 2px 0 #000' }}
                >
                  <SlidersHorizontal size={16} />
                  <span className="hidden sm:inline">Filters</span>
                  {activeFilterCount > 0 && (
                    <span className="absolute -right-1 -top-1 sm:static inline-flex min-w-5 items-center justify-center border border-white/40 bg-[#ffd93d] text-black px-1 py-0.5 text-[11px] font-black sm:bg-transparent sm:text-white">
                      {activeFilterCount}
                    </span>
                  )}
                  <ChevronDown size={16} className={`hidden transition-transform duration-300 sm:inline ${filterMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {filterMenuOpen && (
                  <div
                    className="fixed inset-x-3 top-20 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-50 overflow-y-auto p-4 md:absolute md:right-0 md:top-full md:bottom-auto md:mt-2 md:w-[min(24rem,calc(100vw-2rem))] md:overflow-hidden md:p-5 border-4 border-black bg-white"
                    style={{ boxShadow: '6px 6px 0 #000' }}
                  >
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <p className="text-base font-black text-black uppercase">Filter Events</p>
                      <button
                        onClick={() => setFilters(DEFAULT_FILTERS)}
                        className="border-2 border-black px-3 py-1 text-xs font-black bg-[#ffd93d] hover:bg-black hover:text-white transition-colors uppercase"
                        style={{ boxShadow: '2px 2px 0 #000' }}
                      >
                        Reset
                      </button>
                    </div>

                    <div className="space-y-3">
                      {/* Urgency */}
                      <div className="border-2 border-black p-3">
                        <span className="mb-2 block text-xs font-black uppercase tracking-wider">Urgency</span>
                        <div className="grid grid-cols-3 gap-2">
                          {[{ value: 'all', label: 'All' }, { value: 'high', label: 'Urgent' }, { value: 'normal', label: 'Normal' }].map((o) => {
                            const active = filters.urgency === o.value;
                            return (
                              <button key={o.value} onClick={() => setFilters((c) => ({ ...c, urgency: o.value as FilterState['urgency'] }))}
                                className={`px-3 py-2 text-xs font-black border-2 border-black uppercase transition-all ${active ? 'bg-black text-white' : 'bg-white text-black hover:bg-[#ffd93d]'}`}>
                                {o.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Need */}
                      <div className="border-2 border-black p-3">
                        <span className="mb-2 block text-xs font-black uppercase tracking-wider">Support Needed</span>
                        <div className="grid grid-cols-2 gap-2">
                          {[{ value: 'all', label: 'Any' }, { value: 'volunteers', label: 'Volunteers' }, { value: 'funds', label: 'Funds' }, { value: 'goods', label: 'Goods' }].map((o) => {
                            const active = filters.need === o.value;
                            return (
                              <button key={o.value} onClick={() => setFilters((c) => ({ ...c, need: o.value as FilterState['need'] }))}
                                className={`px-3 py-2 text-xs font-black border-2 border-black uppercase transition-all ${active ? 'bg-black text-white' : 'bg-white text-black hover:bg-[#ffd93d]'}`}>
                                {o.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Distance */}
                      <div className="border-2 border-black p-3">
                        <span className="mb-2 block text-xs font-black uppercase tracking-wider">Distance</span>
                        <div className="grid grid-cols-2 gap-2">
                          {[{ value: 'all', label: 'Any' }, { value: 'within-5', label: 'Within 5 mi' }, { value: 'within-15', label: 'Within 15 mi' }, { value: 'within-30', label: 'Within 30 mi' }].map((o) => {
                            const active = filters.distance === o.value;
                            return (
                              <button key={o.value} onClick={() => setFilters((c) => ({ ...c, distance: o.value as FilterState['distance'] }))}
                                className={`px-3 py-2 text-xs font-black border-2 border-black uppercase transition-all ${active ? 'bg-black text-white' : 'bg-white text-black hover:bg-[#ffd93d]'}`}>
                                {o.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Category */}
                      <div className="border-2 border-black p-3">
                        <span className="mb-2 block text-xs font-black uppercase tracking-wider">Category</span>
                        <select
                          value={filters.category}
                          onChange={(e) => setFilters((c) => ({ ...c, category: e.target.value }))}
                          className="w-full border-2 border-black px-3 py-2 text-sm font-black bg-white outline-none focus:ring-2 focus:ring-[#ffd93d]"
                        >
                          <option value="all">All categories</option>
                          {categoryOptions.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="mt-4 border-2 border-black p-3 bg-[#ffd93d]/20 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm font-black text-black uppercase">{sortedEvents.length} events match</p>
                      <button
                        onClick={() => setFilterMenuOpen(false)}
                        className="border-2 border-black px-4 py-2 text-sm font-black bg-black text-white hover:bg-[#ffd93d] hover:text-black transition-colors uppercase"
                        style={{ boxShadow: '2px 2px 0 #555' }}
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
                  className={`inline-flex h-11 w-11 items-center justify-center border-2 border-black text-sm font-black transition-all sm:h-auto sm:w-auto sm:gap-2 sm:px-4 sm:py-2 uppercase ${sortMenuOpen ? 'bg-black text-white' : 'bg-white text-black hover:bg-[#ffd93d]'}`}
                  style={{ boxShadow: sortMenuOpen ? 'none' : '2px 2px 0 #000' }}
                >
                  <ArrowUpDown size={16} />
                  <span className="hidden sm:inline">Sort: {sortLabel}</span>
                  <ChevronDown size={16} className={`hidden transition-transform duration-300 sm:inline ${sortMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {sortMenuOpen && (
                  <div
                    className="fixed inset-x-3 top-20 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-50 overflow-y-auto p-4 md:absolute md:right-0 md:top-full md:bottom-auto md:mt-2 md:w-[min(21rem,calc(100vw-2rem))] md:overflow-hidden md:p-5 border-4 border-black bg-white"
                    style={{ boxShadow: '6px 6px 0 #000' }}
                  >
                    <p className="text-base font-black text-black uppercase mb-4">Sort Events</p>
                    <div className="space-y-2">
                      {sortOptions.map((option) => {
                        const active = sortBy === option.value;
                        return (
                          <button
                            key={option.value}
                            onClick={() => { setSortBy(option.value); setSortMenuOpen(false); setSortChanged(true); setTimeout(() => setSortChanged(false), 500); }}
                            className={`w-full border-2 border-black px-4 py-3 text-left transition-all ${active ? 'bg-black text-white' : 'bg-white text-black hover:bg-[#ffd93d]'}`}
                            style={{ boxShadow: active ? 'none' : '2px 2px 0 #000' }}
                          >
                            <div className="text-sm font-black uppercase">{option.label}</div>
                            <div className={`mt-0.5 text-xs font-medium ${active ? 'text-white/70' : 'text-black/50'}`}>{option.description}</div>
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
            <SkillMatchBanner condensed />
          </div>
        ) : null}

        {/* Active Filter Chips */}
        {activeFilters.length > 0 && (
          <section className="mb-8 animate-fade-in-up delay-100">
            <div className="flex flex-wrap items-center gap-2.5">
              {activeFilters.map((filterItem) => {
                const bg = filterItem.key === 'category' ? (CATEGORY_COLORS[filters.category]?.bg || '#ccdcff') : '#ccdcff';
                return (
                <button
                  key={filterItem.key}
                  onClick={() => setFilters((c) => ({ ...c, [filterItem.key]: DEFAULT_FILTERS[filterItem.key] }))}
                  className="flex items-center gap-2 border-2 border-black px-3 py-1.5 text-sm font-black transition-colors uppercase hover:brightness-90 text-black"
                  style={{ boxShadow: '2px 2px 0 #000', backgroundColor: bg.startsWith('var(') ? undefined : bg, ...(bg.startsWith('var(') ? { background: bg } : {}) }}
                >
                  {filterItem.label}
                  <X size={14} />
                </button>
              )})}
              <button onClick={() => setFilters(DEFAULT_FILTERS)} className="text-sm font-black text-black/60 hover:text-black transition-colors border-b-2 border-black/30 uppercase">
                Clear all
              </button>
            </div>
          </section>
        )}

        {/* Events Grid / Map / Loading / Empty */}
        {loading || searchLoading ? (
          <div className="flex flex-col justify-center items-center py-20 gap-3">
            <div className="w-12 h-12 border-4 border-black border-t-[#ffd93d] rounded-full animate-spin" />
            {searchLoading && (
              <p className="text-sm font-black flex items-center gap-2 mt-2 uppercase">
                <Sparkles size={14} />
                Searching with AI...
              </p>
            )}
          </div>
        ) : sortedEvents.length === 0 ? (
          <div className="border-4 border-black p-6 text-center animate-fade-in-up bg-white sm:p-10" style={{ boxShadow: '6px 6px 0 #000' }}>
            <span className="material-symbols-outlined text-4xl mb-4 block">event_busy</span>
            <h3 className="font-black text-xl uppercase mb-2 text-black">No events found</h3>
            <p className="text-black/60 font-medium">No events match this criteria. Be the first to create one!</p>
          </div>
        ) : viewMode === 'map' ? (
          <div
            className="mt-4 h-[min(70vh,32rem)] w-full overflow-hidden border-4 border-black animate-fade-in-up md:h-[600px]"
            style={{ boxShadow: '6px 6px 0 #000' }}
          >
            <MapWrapper events={sortedEvents} alerts={alerts} />
          </div>
        ) : (
          <div className={`grid grid-cols-1 gap-4 min-[560px]:grid-cols-2 sm:gap-6 lg:grid-cols-3 ${sortChanged ? 'animate-cards-reorder' : ''}`}>
            {sortedEvents.map((event, index) => {
              const normalizedEvent = { ...event, imageUrl: event.imageUrl || '/images/event-placeholder.jpg' };
              const intersectingAlerts = alerts.filter((alert: SentinelAlert) => {
                if (!event.lat || !event.lng) return false;
                if (alert.polygon && alert.polygon.length > 0) return isPointInPolygon({ lat: event.lat, lng: event.lng }, alert.polygon);
                else if (alert.coordinates) return getDistanceMiles(event.lat, event.lng, alert.coordinates.lat, alert.coordinates.lng) <= 30;
                return false;
              });
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 30, rotate: -2 }}
                  animate={{ opacity: 1, y: 0, rotate: 0 }}
                  transition={{ delay: index * 0.05, type: "spring", stiffness: 200 }}
                >
                  <EventCard
                    event={normalizedEvent}
                    sentinelAlerts={intersectingAlerts}
                    recommendationPercentage={recommendationData[event.id]?.percentage}
                    matchedInterests={recommendationData[event.id]?.matchedInterests}
                  />
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Load More */}
        {hasMore && !loading && !searchQuery && (
          <div className="mt-12 flex justify-center">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="px-8 py-3 border-2 border-black font-black text-sm uppercase bg-white text-black hover:bg-[#ffd93d] transition-colors disabled:opacity-50 flex items-center gap-2"
              style={{ boxShadow: '3px 3px 0 #000' }}
            >
              {loadingMore ? (
                <><div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />Loading...</>
              ) : 'Load More Events'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
