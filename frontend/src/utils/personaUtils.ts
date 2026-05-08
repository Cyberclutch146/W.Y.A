import { UserProfile } from '@/types';

export type Archetype = {
  name: string;
  description: string;
  icon: string;
  color: string;
};

const ARCHETYPES: Record<string, Archetype> = {
  'Tech Hustler': {
    name: 'Tech Hustler',
    description: 'Always at the forefront of innovation, building the future one line of code at a time.',
    icon: '🚀',
    color: 'var(--cp-primary)'
  },
  'Arts Enthusiast': {
    name: 'Arts Enthusiast',
    description: 'A creative soul who finds beauty in expression and storytelling.',
    icon: '🎨',
    color: 'var(--cp-pink)'
  },
  'Social Butterfly': {
    name: 'Social Butterfly',
    description: 'The life of the party, bringing people together and creating connections.',
    icon: '🦋',
    color: 'var(--cp-secondary)'
  },
  'Impact Driver': {
    name: 'Impact Driver',
    description: 'Dedicated to making a difference and driving positive change in the community.',
    icon: '🛡️',
    color: 'var(--cp-lime)'
  },
  'Knowledge Seeker': {
    name: 'Knowledge Seeker',
    description: 'Curious and analytical, always looking to learn and share new insights.',
    icon: '📚',
    color: 'var(--cp-violet)'
  },
  'Default': {
    name: 'Explorer',
    description: 'Discovering the pulse of the campus and finding your niche.',
    icon: '🧭',
    color: 'var(--cp-text-3)'
  }
};

const INTEREST_MAP: Record<string, string> = {
  'coding': 'Tech Hustler',
  'ai': 'Tech Hustler',
  'webdev': 'Tech Hustler',
  'design': 'Arts Enthusiast',
  'music': 'Arts Enthusiast',
  'painting': 'Arts Enthusiast',
  'volunteering': 'Impact Driver',
  'charity': 'Impact Driver',
  'environment': 'Impact Driver',
  'networking': 'Social Butterfly',
  'parties': 'Social Butterfly',
  'events': 'Social Butterfly',
  'reading': 'Knowledge Seeker',
  'science': 'Knowledge Seeker',
  'history': 'Knowledge Seeker'
};

export function getInterestArchetype(profile: UserProfile | null): Archetype {
  if (!profile || !profile.interests || profile.interests.length === 0) {
    return ARCHETYPES['Default'];
  }

  const counts: Record<string, number> = {};
  profile.interests.forEach(interest => {
    const archetype = INTEREST_MAP[interest.toLowerCase()];
    if (archetype) {
      counts[archetype] = (counts[archetype] || 0) + 1;
    }
  });

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  if (sorted.length > 0) {
    return ARCHETYPES[sorted[0][0]];
  }

  return ARCHETYPES['Default'];
}
