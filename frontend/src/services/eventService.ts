import { db } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, orderBy, runTransaction, where, limit, startAfter, documentId, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { CommunityEvent, CommunityEventCreate, EventRSVP } from '@/types';
import { createNotification } from './notificationService';

const EVENTS_COLLECTION = 'events';
export const ADMIN_EMAILS = [
  'ece2024033@rcciit.org.in',
  'blazingswagata@gmail.com',
  'sagotogdg@gmail.com',
  'dasanuvab38@gmail.com',
  'debadree.sekhar.das@gmail.com',
  'dhritimansiva2@gmail.com',
];

// ─── Paginated fetch ────────────────────────────────────
export interface PaginatedEvents {
  events: CommunityEvent[];
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
}

export const getEvents = async (
  pageSize: number = 50,
  lastDoc: QueryDocumentSnapshot<DocumentData> | null = null
): Promise<PaginatedEvents> => {
  try {
    const eventsRef = collection(db, EVENTS_COLLECTION);
    let q = query(eventsRef, orderBy('createdAt', 'desc'), limit(pageSize));
    if (lastDoc) {
      q = query(eventsRef, orderBy('createdAt', 'desc'), startAfter(lastDoc), limit(pageSize));
    }
    const snapshot = await getDocs(q);
    
    const events = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as CommunityEvent[];

    return {
      events,
      lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
      hasMore: snapshot.docs.length === pageSize
    };
  } catch (error) {
    console.error('Failed to fetch events from Firebase:', error);
    throw error;
  }
};

// ─── Single event ───────────────────────────────────────
export const getEventById = async (eventId: string): Promise<CommunityEvent | null> => {
  try {
    const eventRef = doc(db, EVENTS_COLLECTION, eventId);
    const snapshot = await getDoc(eventRef);
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() } as CommunityEvent;
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch event by id:', error);
    return null;
  }
};

// ─── Events by organizer (for Dashboard) ────────────────
export const getEventsByOrganizer = async (userId: string): Promise<CommunityEvent[]> => {
  try {
    const eventsRef = collection(db, EVENTS_COLLECTION);
    const q = query(eventsRef, where('organizerId', '==', userId));
    const snapshot = await getDocs(q);
    
    const events = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as CommunityEvent[];

    // Sort locally by createdAt descending to avoid needing a composite index
    return events.sort((a, b) => {
      const timeA = (a.createdAt as any)?.toMillis ? (a.createdAt as any).toMillis() : (a.createdAt ? new Date(a.createdAt as any).getTime() : 0);
      const timeB = (b.createdAt as any)?.toMillis ? (b.createdAt as any).toMillis() : (b.createdAt ? new Date(b.createdAt as any).getTime() : 0);
      return timeB - timeA;
    });
  } catch (error) {
    console.error('Failed to fetch events by organizer:', error);
    return [];
  }
};

// ─── Geocoding Helper ────────────────────────────────────
export const geocodeLocation = async (address: string): Promise<{lat: number, lng: number} | null> => {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`, {
      headers: {
        'User-Agent': 'CommunityManagementApp/1.0'
      }
    });
    const data = await response.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon) // Nominatim returns 'lon' instead of 'lng'
      };
    }
  } catch (error) {
    console.error('Geocoding error:', error);
  }
  return null;
};

// ─── Create ─────────────────────────────────────────────
export const createEvent = async (data: CommunityEventCreate): Promise<string> => {
  try {
    const response = await fetch('/api/events/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(`${result.error || 'Failed to create event'}${result.details ? ` | Details: ${result.details}` : ''}`);
    }

    return result.eventId;
  } catch (error: unknown) {
    console.error('Failed to create event:', error);
    throw error;
  }
};

// ─── Update ─────────────────────────────────────────────
export const updateEvent = async (eventId: string, data: Partial<CommunityEventCreate>): Promise<void> => {
  try {
    const response = await fetch('/api/events/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ eventId, updates: data }),
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(`${result.error || 'Failed to update event'}${result.details ? ` | Details: ${result.details}` : ''}`);
    }
  } catch (error) {
    console.error('Failed to update event:', error);
    throw error;
  }
};


// ─── Delete ─────────────────────────────────────────────
export const deleteEvent = async (eventId: string): Promise<void> => {
  try {
    const response = await fetch('/api/events/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ eventId }),
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(`${result.error || 'Failed to delete event'}${result.details ? ` | Details: ${result.details}` : ''}`);
    }
  } catch (error) {
    console.error('Failed to delete event:', error);
    throw error;
  }
};

// ─── Donation (transactional) ───────────────────────────
export const updateDonation = async (eventId: string, amount: number): Promise<void> => {
  const response = await fetch('/api/events/donate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ eventId, amount }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to update donation');
  }
};

// ─── Event RSVP / Signup (transactional via API) ─────────────
export const addEventRSVP = async (eventId: string, userId: string, userName: string, userEmail: string = '', ticketId: string = '', status: 'interested' | 'going' = 'going'): Promise<void> => {
  try {
    const response = await fetch('/api/events/join', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventId,
        userId,
        userName,
        userEmail,
        ticketId,
        status
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to sign up for event');
    }

    // ── Fire notifications (best-effort, don't block the flow) ──
    try {
      const event = await getEventById(eventId);
        if (event) {
          // Notify the attendee
          await createNotification(userId, {
            title: `You're registered for "${event.title}"!`,
            body: ticketId
              ? `Your ticket ID is ${ticketId}. See you there!`
              : 'You\'re all set — see you at the event!',
            path: `/event/${eventId}`,
            type: 'event_join',
            tone: 'success',
          });

          // Notify the organizer
          if (event.organizerId && event.organizerId !== userId) {
            await createNotification(event.organizerId, {
              title: `New attendee: ${userName}`,
              body: `${userName} just registered for "${event.title}".`,
              path: `/dashboard/event/${eventId}`,
              type: 'event_join',
              tone: 'info',
            });
          }
        }
    } catch (notifError) {
      console.warn('Non-critical: notification dispatch failed', notifError);
    }
  } catch (error) {
    console.error('API /events/join Error:', error);
    throw error;
  }
};

// ─── Attendee Fetching ──────────────────────────────────

export const getEventRSVPs = async (eventId: string): Promise<EventRSVP[]> => {
  const rsvpRef = collection(db, `${EVENTS_COLLECTION}/${eventId}/rsvps`);
  const snapshot = await getDocs(query(rsvpRef, orderBy('signedUpAt', 'desc')));
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as EventRSVP[];
};

export const getUserRSVP = async (eventId: string, userId: string) => {
  try {
    const rsvpRef = doc(db, `${EVENTS_COLLECTION}/${eventId}/rsvps`, userId);
    const snap = await getDoc(rsvpRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as EventRSVP;
    }
    return null;
  } catch (error) {
    console.error('Failed to get user RSVP:', error);
    return null;
  }
};

export const updateRSVPStatus = async (eventId: string, rsvpId: string, status: 'interested' | 'going' | 'attended'): Promise<void> => {
  const response = await fetch('/api/events/scan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ eventId, rsvpId, status }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to update RSVP status');
  }
};

export const getRegisteredEvents = async (userId: string): Promise<CommunityEvent[]> => {
  const registrationsRef = collection(db, `users/${userId}/registrations`);
  const snapshot = await getDocs(registrationsRef);
  const eventIds = snapshot.docs.map(doc => doc.id);
  
  if (eventIds.length === 0) return [];
  
  // Fetch in batches of 30 (Firestore 'in' query limit)
  const events: CommunityEvent[] = [];
  for (let i = 0; i < eventIds.length; i += 30) {
    const chunk = eventIds.slice(i, i + 30);
    const eventsRef = collection(db, EVENTS_COLLECTION);
    const q = query(eventsRef, where(documentId(), 'in', chunk));
    const eventsSnapshot = await getDocs(q);
    eventsSnapshot.docs.forEach(doc => {
      events.push({ id: doc.id, ...doc.data() } as CommunityEvent);
    });
  }
  
  return events;
};

// ─── Bulk Coordinate Backfill ────────────────────────────
export const backfillEventCoordinates = async (): Promise<{ total: number, updated: number, failed: number }> => {
  const eventsRef = collection(db, EVENTS_COLLECTION);
  const snapshot = await getDocs(eventsRef);
  let updated = 0;
  let failed = 0;
  
  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    if (data.lat === undefined || data.lng === undefined) {
      if (data.location) {
        // Respect Nominatim limits by waiting ~1.5s per request
        await new Promise(resolve => setTimeout(resolve, 1500));
        const coords = await geocodeLocation(data.location);
        if (coords) {
          await updateDoc(docSnap.ref, { lat: coords.lat, lng: coords.lng });
          updated++;
        } else {
          failed++;
        }
      }
    }
  }
  
  return { total: snapshot.docs.length, updated, failed };
};

// ─── Goods Pledges ──────────────────────────────────────
export const pledgeGoods = async (
  eventId: string,
  userId: string,
  userName: string,
  items: string[],
  otherItems: string
): Promise<void> => {
  const response = await fetch('/api/events/pledge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ eventId, userId, userName, items, otherItems }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to pledge goods');
  }

  // ── Fire notifications (best-effort) ──
  try {
    const event = await getEventById(eventId);
    if (event) {
      const allItems = [...items, ...(otherItems ? [otherItems] : [])];
      const itemSummary = allItems.slice(0, 3).join(', ') + (allItems.length > 3 ? ` +${allItems.length - 3} more` : '');

      // Notify the attendee
      await createNotification(userId, {
        title: `Pledge confirmed for "${event.title}"`,
        body: `You're bringing: ${itemSummary}. Thank you!`,
        path: `/event/${eventId}`,
        type: 'goods_pledge',
        tone: 'success',
      });

      // Notify the organizer
      if (event.organizerId && event.organizerId !== userId) {
        await createNotification(event.organizerId, {
          title: `New goods pledge from ${userName}`,
          body: `${userName} is bringing: ${itemSummary} to "${event.title}".`,
          path: `/dashboard/event/${eventId}`,
          type: 'goods_pledge',
          tone: 'info',
        });
      }
    }
  } catch (notifError) {
    console.warn('Non-critical: notification dispatch failed', notifError);
  }
};

export const getUserPledge = async (eventId: string, userId: string) => {
  const pledgeRef = doc(db, `${EVENTS_COLLECTION}/${eventId}/goodsPledges`, userId);
  const snap = await getDoc(pledgeRef);
  if (snap.exists()) {
    return { id: snap.id, ...snap.data() };
  }
  return null;
};

export const getEventGoodsPledges = async (eventId: string) => {
  const pledgesRef = collection(db, `${EVENTS_COLLECTION}/${eventId}/goodsPledges`);
  const snapshot = await getDocs(query(pledgesRef, orderBy('pledgedAt', 'desc')));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Array<{
    id: string;
    userId: string;
    userName: string;
    items: string[];
    otherItems: string;
    pledgedAt: any;
  }>;
};
