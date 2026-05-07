'use client';

/**
 * EventsCacheContext
 *
 * Provides a shared, TTL-based cache for the events list so that navigating
 * between Home, Feed, and Search pages doesn't trigger redundant Firestore reads.
 *
 * Pre-warms immediately on mount — events start loading before auth resolves.
 * Cache TTL: 60 seconds. Force-refresh available via fetchEvents(true).
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  ReactNode,
} from 'react';
import { getEvents } from '@/services/eventService';
import { CommunityEvent } from '@/types';
import { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';

const CACHE_TTL_MS = 60_000; // 1 minute

interface EventsCacheState {
  events: CommunityEvent[];
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
  loading: boolean;
  /** Fetch events, using cache if still fresh. Pass true to force a network refetch. */
  fetchEvents: (forceRefresh?: boolean) => Promise<CommunityEvent[]>;
  /** Append the next page to the cache. */
  fetchNextPage: () => Promise<void>;
}

const EventsCacheContext = createContext<EventsCacheState | null>(null);

export function EventsCacheProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const lastFetchRef = useRef<number>(0);
  const inflightRef = useRef<Promise<CommunityEvent[]> | null>(null);

  const fetchEvents = useCallback(
    async (forceRefresh = false): Promise<CommunityEvent[]> => {
      // Return cached data if still fresh and not forced
      if (
        !forceRefresh &&
        events.length > 0 &&
        Date.now() - lastFetchRef.current < CACHE_TTL_MS
      ) {
        return events;
      }

      // Deduplicate simultaneous calls (e.g. Home + Feed mount at the same time)
      if (inflightRef.current) return inflightRef.current;

      setLoading(true);
      const promise = getEvents()
        .then(result => {
          setEvents(result.events);
          setLastDoc(result.lastDoc);
          setHasMore(result.hasMore);
          lastFetchRef.current = Date.now();
          return result.events;
        })
        .finally(() => {
          setLoading(false);
          inflightRef.current = null;
        });

      inflightRef.current = promise;
      return promise;
    },
    [events]
  );

  // ── Pre-warm: start fetching events immediately on mount ──
  // Runs in parallel with Firebase auth resolution — events are ready (or nearly ready)
  // by the time the page actually renders and calls fetchEvents().
  useEffect(() => {
    fetchEvents().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchNextPage = useCallback(async () => {
    if (!hasMore || !lastDoc || loading) return;
    setLoading(true);
    try {
      const result = await getEvents(12, lastDoc);
      setEvents(prev => [...prev, ...result.events]);
      setLastDoc(result.lastDoc);
      setHasMore(result.hasMore);
    } catch (err) {
      console.error('Failed to fetch next page of events:', err);
    } finally {
      setLoading(false);
    }
  }, [hasMore, lastDoc, loading]);

  return (
    <EventsCacheContext.Provider
      value={{ events, lastDoc, hasMore, loading, fetchEvents, fetchNextPage }}
    >
      {children}
    </EventsCacheContext.Provider>
  );
}

export function useEventsCache(): EventsCacheState {
  const ctx = useContext(EventsCacheContext);
  if (!ctx) {
    throw new Error('useEventsCache must be used within an <EventsCacheProvider>');
  }
  return ctx;
}
