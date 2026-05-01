import { CommunityEvent, UserProfile, ScoredEvent, RecommendationReason } from "@/types";

// ─── Interest-to-Category Mapping ───────────────────────
const INTEREST_CATEGORY_MAP: Record<string, string[]> = {
  coding: ["Hackathon", "Workshop", "Tech Talk", "coding", "programming", "software", "AI", "web"],
  programming: ["Hackathon", "Workshop", "programming", "coding", "software", "development"],
  robotics: ["Hackathon", "Workshop", "Tech Talk", "robotics", "automation", "engineering", "STEM"],
  gaming: ["Gaming", "Workshop", "Hackathon", "gaming", "esports", "game jam"],
  design: ["Workshop", "Cultural Fest", "design", "UI", "UX", "creative", "visual"],
  art: ["Cultural Fest", "Workshop", "art", "creative", "exhibition", "gallery"],
  photography: ["Workshop", "Cultural Fest", "photography", "film", "media"],
  film: ["Cultural Fest", "Workshop", "film", "cinema", "video", "media"],
  music: ["Cultural Fest", "Concert", "music", "performance", "band", "choir"],
  dance: ["Cultural Fest", "Concert", "dance", "performance", "choreography"],
  theatre: ["Cultural Fest", "Concert", "theatre", "drama", "acting", "performance"],
  literature: ["Academic", "Seminar", "literature", "writing", "poetry", "book"],
  sports: ["Sports", "Competition", "sports", "fitness", "game", "tournament"],
  mathematics: ["Academic", "Workshop", "Seminar", "math", "maths", "statistics"],
  science: ["Academic", "Workshop", "Seminar", "Tech Talk", "science", "research", "STEM"],
  debate: ["Academic", "Competition", "Seminar", "debate", "MUN", "public speaking"],
  journalism: ["Academic", "Workshop", "journalism", "media", "writing", "newsletter"],
  entrepreneurship: ["Career Fair", "Workshop", "Seminar", "startup", "entrepreneur", "business", "pitch"],
  "community service": ["Volunteer", "Social", "community", "outreach", "NGO", "charity"],
};

// ─── Department-to-Category Affinity ───────────────────
const DEPT_AFFINITY_MAP: Record<string, string[]> = {
  'Computer Science': ['Hackathon', 'Tech Talk', 'Workshop', 'coding', 'programming', 'AI', 'STEM'],
  'Information Technology': ['Hackathon', 'Tech Talk', 'Workshop', 'web', 'software', 'cloud', 'STEM'],
  'Electronics': ['Workshop', 'robotics', 'STEM', 'hardware', 'embedded', 'circuits'],
  'Mechanical': ['Workshop', 'design', 'engineering', 'manufacturing', 'CAD', 'auto'],
  'Electrical': ['Workshop', 'engineering', 'power', 'renewable', 'STEM'],
  'Civil': ['Workshop', 'design', 'architecture', 'infrastructure', 'surveying'],
  'Business Administration': ['Seminar', 'Career Fair', 'entrepreneurship', 'leadership', 'startup', 'finance', 'marketing'],
  'Arts & Humanities': ['Cultural Fest', 'Concert', 'art', 'theatre', 'music', 'dance', 'literature'],
  'Architecture': ['Workshop', 'design', 'art', 'visual', 'sketching', 'modeling'],
  'Law': ['Seminar', 'debate', 'Academic', 'legal', 'policy', 'ethics'],
  'Medicine': ['Workshop', 'Academic', 'health', 'biology', 'medical', 'research'],
};

// ─── Academic Year Preferences ─────────────────────────
const YEAR_PREFERENCE_MAP: Record<string, string[]> = {
  '1st Year': ['Social', 'Cultural Fest', 'Sports', 'orientation', 'mixer', 'freshers'],
  '2nd Year': ['Workshop', 'Competition', 'Club Meet', 'skill', 'intermediate'],
  '3rd Year': ['Hackathon', 'Workshop', 'Seminar', 'internship', 'advanced', 'project'],
  '4th Year': ['Career Fair', 'Seminar', 'Academic', 'placement', 'job', 'grad', 'alumni'],
  'Postgraduate': ['Seminar', 'Academic', 'Tech Talk', 'research', 'thesis', 'symposium'],
};

// ─── Major Clusters ─────────────────────────────────────
const MAJOR_CLUSTERS: Record<string, string[]> = {
  STEM: ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'Electrical', 'Architecture'],
  MANAGEMENT: ['Business Administration'],
  CREATIVE: ['Arts & Humanities', 'Architecture'],
};

export function getRecommendedEvents(
  profile: UserProfile,
  events: CommunityEvent[],
  maxResults: number = 8
): ScoredEvent[] {
  if (!profile || events.length === 0) return [];

  const normalizedInterests = (profile.interests || []).map((s) => s.toLowerCase().trim());
  const normalizedClubs = (profile.clubs || []).map((c) => c.toLowerCase().trim());
  const registeredIds = new Set(profile.rsvpEventIds || []);
  const savedIds = new Set(profile.savedEventIds || []);
  const dismissedIds = new Set(profile.dismissedEventIds || []);

  const scored: ScoredEvent[] = events
    .filter(event => 
      !registeredIds.has(event.id) && 
      !dismissedIds.has(event.id) &&
      event.status === 'active'
    )
    .map((event) => {
      let score = 0;
      const reasons: RecommendationReason[] = [];
      const matchedInterests: string[] = [];

      const eventCategory = (event.category || '').toLowerCase();
      const eventTitle = (event.title || '').toLowerCase();
      const eventDescription = (event.description || '').toLowerCase();
      const eventClub = (event.clubName || '').toLowerCase();
      const eventTags = (event.tags || []).map(t => t.toLowerCase());
      const eventText = `${eventTitle} ${eventDescription} ${eventCategory} ${eventClub} ${eventTags.join(' ')}`;

      // 1. Interest Matching (Explicit) - 35% Weight
      let interestPoints = 0;
      for (const interest of normalizedInterests) {
        const mappings = INTEREST_CATEGORY_MAP[interest] || [interest];
        let foundMatch = false;
        
        for (const keyword of mappings) {
          const kw = keyword.toLowerCase();
          if (eventCategory === kw) { interestPoints += 20; foundMatch = true; }
          else if (eventTitle.includes(kw)) { interestPoints += 12; foundMatch = true; }
          else if (eventTags.includes(kw)) { interestPoints += 8; foundMatch = true; }
          else if (eventText.includes(kw)) { interestPoints += 5; foundMatch = true; }
        }

        if (foundMatch) {
          matchedInterests.push(interest);
        }
      }
      if (interestPoints > 0) {
        score += interestPoints;
        reasons.push({ type: 'interest', label: `Matches your interest in ${matchedInterests[0]}` });
      }

      // 2. Department & Cluster Affinity - 25% Weight
      if (profile.department) {
        let deptPoints = 0;
        const affinities = DEPT_AFFINITY_MAP[profile.department as string] || [];
        
        // Direct Dept Match
        for (const keyword of affinities) {
          const kw = keyword.toLowerCase();
          if (eventCategory === kw || eventTitle.includes(kw) || eventTags.includes(kw)) {
            deptPoints += 15;
          }
        }

        // Cluster Match (e.g. STEM cluster)
        Object.entries(MAJOR_CLUSTERS).forEach(([cluster, majors]) => {
          if (majors.includes(profile.department as string)) {
            const clusterKeywords = majors.flatMap(m => DEPT_AFFINITY_MAP[m] || []);
            if (clusterKeywords.some(kw => eventText.includes(kw.toLowerCase()))) {
              deptPoints += 5;
            }
          }
        });

        if (deptPoints > 0) {
          score += deptPoints;
          reasons.push({ type: 'department', label: `Popular in ${profile.department}` });
        }
      }

      // 3. Year-Based Preference - 15% Weight
      if (profile.year) {
        const yearPrefs = YEAR_PREFERENCE_MAP[profile.year] || [];
        let yearPoints = 0;
        for (const pref of yearPrefs) {
          if (eventText.includes(pref.toLowerCase())) {
            yearPoints += 12;
          }
        }
        if (yearPoints > 0) {
          score += yearPoints;
          reasons.push({ type: 'history', label: `Recommended for ${profile.year} students` });
        }
      }

      // 4. Club Membership - 15% Weight
      let clubMatch = false;
      if (profile.clubs?.length) {
        for (const club of normalizedClubs) {
          if (eventClub.includes(club) || (event.organizer || '').toLowerCase().includes(club)) {
            score += 25;
            clubMatch = true;
            break;
          }
        }
      }
      if (clubMatch) {
        reasons.push({ type: 'club', label: `From a club you follow` });
      }

      // 5. Social Proof & Popularity - 10% Weight
      const attendees = event.needs?.volunteers?.current || 0;
      if (attendees > 5) {
        const socialBoost = Math.min(15, Math.floor(attendees / 3));
        score += socialBoost;
        if (socialBoost > 10) {
          reasons.push({ type: 'social', label: `Trending on campus` });
        }
      }

      // 6. Recency Boost
      if (event.createdAt) {
        const hoursOld = (Date.now() - event.createdAt.toMillis()) / (1000 * 60 * 60);
        if (hoursOld < 48) {
          score += 10;
          reasons.push({ type: 'urgency', label: `New Discovery` });
        }
      }

      // 7. Saved Event Multiplier
      if (savedIds.has(event.id)) {
        score += 15; // They already saved it, keep it high in recs
      }

      return { event, score, matchedInterests, reasons };
    });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);
}

export function getMatchPercentage(score: number): number {
  // Enhanced curve: 5 points = 40%, 50 points = 85%, 100+ points = 99%
  const percentage = Math.min(99, Math.round(30 + 35 * Math.log10(Math.max(1, score / 3) + 1)));
  return percentage;
}

export async function getAISemanticScore(profile: UserProfile, event: CommunityEvent): Promise<number> {
  // Simulator for AI boost
  return Math.floor(Math.random() * 8);
}
