import { CommunityEvent } from "@/types";

// ─── Interest-to-Category Mapping ───────────────────────
// Maps student interests to campus event categories and related keywords.
// Used by the recommendation engine to surface relevant events.
const INTEREST_CATEGORY_MAP: Record<string, string[]> = {
  // Technology & Computing
  coding: ["Hackathon", "Workshop", "Tech Talk", "coding", "programming", "software", "tech", "developer", "AI", "web"],
  programming: ["Hackathon", "Workshop", "programming", "coding", "tech", "software", "development"],
  robotics: ["Hackathon", "Workshop", "Tech Talk", "robotics", "automation", "engineering", "STEM"],
  gaming: ["Gaming", "Workshop", "Hackathon", "gaming", "esports", "game jam", "game dev"],

  // Design & Arts
  design: ["Workshop", "Cultural Fest", "design", "UI", "UX", "creative", "visual", "graphics"],
  art: ["Cultural Fest", "Workshop", "art", "creative", "exhibition", "gallery", "drawing"],
  photography: ["Workshop", "Cultural Fest", "photography", "film", "media", "visual"],
  film: ["Cultural Fest", "Workshop", "film", "cinema", "video", "media", "photography"],

  // Performance & Culture
  music: ["Cultural Fest", "Concert", "music", "performance", "band", "choir", "instrument"],
  dance: ["Cultural Fest", "Concert", "dance", "performance", "choreography", "cultural"],
  theatre: ["Cultural Fest", "Concert", "theatre", "drama", "acting", "performance", "play"],
  literature: ["Academic", "Seminar", "literature", "writing", "poetry", "book", "reading"],

  // Sports & Fitness
  sports: ["Sports", "Competition", "sports", "fitness", "game", "tournament", "athletics", "match"],

  // Academics & Learning
  mathematics: ["Academic", "Workshop", "Seminar", "math", "maths", "statistics", "olympiad"],
  science: ["Academic", "Workshop", "Seminar", "Tech Talk", "science", "research", "lab", "STEM"],
  debate: ["Academic", "Competition", "Seminar", "debate", "MUN", "public speaking", "discussion", "quiz"],
  journalism: ["Academic", "Workshop", "journalism", "media", "writing", "newsletter", "blog"],

  // Business & Leadership
  entrepreneurship: ["Career Fair", "Workshop", "Seminar", "startup", "entrepreneur", "business", "pitch", "venture"],

  // Community
  "community service": ["Volunteer", "Social", "community", "outreach", "NGO", "charity", "service"],
};

// ─── Scoring Algorithm ──────────────────────────────────

interface ScoredEvent {
  event: CommunityEvent;
  score: number;
  matchedInterests: string[];
}

export function getRecommendedEvents(
  userInterests: string[],
  events: CommunityEvent[],
  maxResults: number = 5,
  userClubs: string[] = []
): ScoredEvent[] {
  if (
    (!userInterests || userInterests.length === 0) &&
    (!userClubs || userClubs.length === 0)
  ) {
    return [];
  }

  if (events.length === 0) return [];

  // Normalize user interests
  const normalizedInterests = userInterests.map((s) => s.toLowerCase().trim());
  const normalizedClubs = userClubs.map((c) => c.toLowerCase().trim());

  const scored: ScoredEvent[] = events.map((event) => {
    let score = 0;
    const matchedInterests: string[] = [];

    const eventCategory = event.category || '';
    const eventTitle = event.title || '';
    const eventDescription = event.description || '';
    const eventClub = (event as any).clubName || '';
    const eventTags = ((event as any).tags || []).join(' ');
    const eventText = `${eventTitle} ${eventDescription} ${eventCategory} ${eventClub} ${eventTags}`.toLowerCase();

    for (const interest of normalizedInterests) {
      let interestScore = 0;

      // Direct category mapping check
      const mappings = INTEREST_CATEGORY_MAP[interest];
      if (mappings) {
        for (const keyword of mappings) {
          const kw = keyword.toLowerCase();
          // Category exact match (highest weight)
          if (eventCategory.toLowerCase() === kw) {
            interestScore += 15;
          }
          // Category partial match
          else if (eventCategory.toLowerCase().includes(kw)) {
            interestScore += 10;
          }
          // Title match
          else if (eventTitle.toLowerCase().includes(kw)) {
            interestScore += 6;
          }
          // Description / tags match
          else if (eventText.includes(kw)) {
            interestScore += 3;
          }
        }
      }

      // Direct interest word match (fallback for unmapped interests)
      if (interestScore === 0) {
        const interestWords = interest.split(/\s+/);
        for (const word of interestWords) {
          if (word.length > 2 && eventText.includes(word)) {
            interestScore += 4;
          }
        }
      }

      if (interestScore > 0) {
        score += interestScore;
        matchedInterests.push(interest);
      }
    }

    // Club membership boost — if the event is by a user's own club, surface it
    for (const club of normalizedClubs) {
      if (eventClub.toLowerCase().includes(club) || eventText.includes(club)) {
        score += 12;
        matchedInterests.push(`🏫 ${club}`);
        break;
      }
    }

    // Urgency boost (e.g. registration deadline approaching)
    if (event.urgency === "high" && score > 0) {
      score += 5;
    }

    // Active event boost
    if (event.status === "active") {
      score += 2;
    }

    // Attendance availability boost — event still has spots
    if (event.needs?.volunteers) {
      const { current, goal } = event.needs.volunteers;
      if (current < goal) {
        score += 3;
        const fillRate = goal > 0 ? current / goal : 1;
        if (fillRate < 0.5) score += 2;
      }
    }

    return { event, score, matchedInterests };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);
}

// ─── Match Percentage ───────────────────────────────────
// Convert raw score to a user-friendly percentage (capped at 99)
export function getMatchPercentage(score: number): number {
  const percentage = Math.min(99, Math.round(40 + 20 * Math.log2(Math.max(1, score))));
  return percentage;
}
