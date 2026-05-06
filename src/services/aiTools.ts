import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

type EventItem = {
  id: string;
  title?: string;
  category?: string;
  location?: string;
  goalAmount?: number;
  donatedAmount?: number;
  attendeesNeeded?: number;
  description?: string;
};

export async function getAllEvents(): Promise<EventItem[]> {
  const snapshot = await getDocs(collection(db, "events"));

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      title: data.title,
      category: data.category,
      location: data.location,
      description: data.description,
      goalAmount: data.needs?.funds?.goal,
      donatedAmount: data.needs?.funds?.current,
      attendeesNeeded: data.needs?.attendees?.goal,
    };
  });
}

export function formatEventList(events: EventItem[], limit = 3) {
  if (!events.length) return "No events found right now.";

  return events
    .slice(0, limit)
    .map((event, index) => {
      const title = event.title || "Untitled event";
      const location = event.location ? ` (${event.location})` : "";
      return `${index + 1}. ${title}${location}`;
    })
    .join("\n");
}

export function getAttendeeGuidance(events: EventItem[]) {
  if (!events.length) {
    return "I couldn't find any events right now, but you can still register by checking the feed and opening any event that interests you.";
  }

  return [
    "You can RSVP by opening an event and hitting the register button.",
    "A good place to start is one of these events:",
    formatEventList(events, 3),
    "If you want, I can also help you decide which one to join."
  ].join("\n");
}

export function getDonationGuidance(events: EventItem[]) {
  if (!events.length) {
    return "You can donate from an event's details page using the donation panel whenever a fundraiser is active.";
  }

  return [
    "You can donate directly from the event details page using the donation panel.",
    "Some active events you may want to support are:",
    formatEventList(events, 3),
    "Open any event and use the donate section to contribute."
  ].join("\n");
}

export function getOrganizeGuidance() {
  return [
    "You can organize an event from the Create section of the platform.",
    "A good event setup usually includes:",
    "1. a clear title",
    "2. location",
    "3. category or cause",
    "4. description of the need",
    "5. attendee or funding goal",
    "Once you create it, others can discover it from the feed."
  ].join("\n");
}

export function getGeneralHelp() {
  const variants = [
    "I can help you discover events, understand how to register, find funding opportunities, and guide you on organizing a new event.",
    "I can help with RSVPs, funding, event discovery, and creating or organizing events.",
    "You can ask me about joining events, donating, organizing relief efforts, or using the platform."
  ];

  return variants[Math.floor(Math.random() * variants.length)];
}

export function getUnknownReply() {
  const variants = [
    "I didn't fully catch that. Ask me about registering, funding, events, or organizing an event.",
    "I'm not sure what you mean yet, but I can help with event discovery, funding, RSVPs, and creating events.",
    "Try asking something like 'How do I donate?', 'Show me events', or 'How do I create an event?'"
  ];

  return variants[Math.floor(Math.random() * variants.length)];
}