// ─── Mock Data for W.Y.A (Where You At) ───────────────────────────
// Used for UI previews, Storybook, and fallback rendering.
// In production, all data is fetched from Firestore.

export interface User {
  id: string;
  name: string;
  role: string;
  avatar: string;
  eventsAttended: number;
  xp: number;
}

export interface Needs {
  volunteers?: { current: number; goal: number };
  funds?: { current: number; goal: number };
  goods?: string[];
}

export interface Event {
  id: string;
  title: string;
  organizer: string;
  clubName?: string;
  location: string;
  distance: string;
  description: string;
  urgency: 'high' | 'normal';
  image: string;
  needs: Needs;
  progress: number;
  category: string;
  tags?: string[];
  eventDate?: string;
}

export interface Message {
  id: string;
  eventId: string;
  userId: string;
  text: string;
  timestamp: string;
}

export const currentUser: User = {
  id: 'u1',
  name: 'Aarav Mehta',
  role: 'Student',
  avatar: 'https://images.unsplash.com/photo-1529665253569-6d01c0eaf7d3?q=80&w=2685&auto=format&fit=crop',
  eventsAttended: 12,
  xp: 840,
};

export const mockEvents: Event[] = [
  {
    id: 'e1',
    title: 'Inter-College Hackathon 2025',
    organizer: 'IEEE RCCIIT',
    clubName: 'IEEE Student Branch',
    location: 'Seminar Hall, Block C',
    distance: 'On Campus',
    description: '36-hour hackathon open to all departments. Build something that solves a real campus problem. Solo or team up to 4. Prizes for Top 3 teams plus special sponsor awards.',
    urgency: 'high',
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=2670&auto=format&fit=crop',
    needs: {
      volunteers: { current: 28, goal: 60 },
    },
    progress: 46,
    category: 'Hackathon',
    tags: ['open to all', 'registration required', 'prizes'],
    eventDate: '2025-08-10',
  },
  {
    id: 'e2',
    title: 'Figma to Code: UI/UX Workshop',
    organizer: 'Google Developer Student Club',
    clubName: 'GDSC RCCIIT',
    location: 'CS Lab 2, Block A',
    distance: 'On Campus',
    description: 'Learn the end-to-end product design pipeline. We\'ll start in Figma, prototype an app, and hand off to a React implementation. Laptops required.',
    urgency: 'normal',
    image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=2671&auto=format&fit=crop',
    needs: {
      volunteers: { current: 12, goal: 40 },
    },
    progress: 30,
    category: 'Workshop',
    tags: ['bring laptop', 'open to all'],
    eventDate: '2025-07-22',
  },
  {
    id: 'e3',
    title: 'Tarang 2025 — Annual Cultural Fest',
    organizer: 'Students\' Union, RCCIIT',
    clubName: 'Cultural Committee',
    location: 'Open Air Stage, Main Campus',
    distance: 'On Campus',
    description: 'Three days of music, dance, drama, fashion, and art. Participate in individual or group events across 20+ categories. Open for all colleges.',
    urgency: 'normal',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2670&auto=format&fit=crop',
    needs: {
      volunteers: { current: 40, goal: 80 },
      funds: { current: 12000, goal: 30000 },
    },
    progress: 50,
    category: 'Cultural Fest',
    tags: ['inter-college', 'performances', 'prizes'],
    eventDate: '2025-09-05',
  },
  {
    id: 'e4',
    title: 'Campus Placement Prep Seminar',
    organizer: 'Training & Placement Cell',
    location: 'Auditorium, Block B',
    distance: 'On Campus',
    description: 'Comprehensive placement prep covering resume building, aptitude strategies, group discussions, and mock technical interviews. Mandatory for final-year students.',
    urgency: 'high',
    image: 'https://images.unsplash.com/photo-1554774853-719586f82d77?q=80&w=2670&auto=format&fit=crop',
    needs: {
      volunteers: { current: 5, goal: 10 },
    },
    progress: 50,
    category: 'Career Fair',
    tags: ['final year', 'free', 'registration required'],
    eventDate: '2025-07-18',
  },
  {
    id: 'e5',
    title: 'Mental Wellness Week',
    organizer: 'W.Y.A Student Welfare',
    location: 'Student Activity Centre',
    distance: 'On Campus',
    description: 'A week-long initiative including mindfulness sessions, peer support groups, creative therapy workshops, and a closing open-mic night. All sessions are free and confidential.',
    urgency: 'normal',
    image: '',
    needs: {
      volunteers: { current: 3, goal: 15 },
    },
    progress: 20,
    category: 'Social',
    tags: ['open to all', 'free', 'wellbeing'],
    eventDate: '2025-08-01',
  },
];

export const mockMessages: Message[] = [
  { id: 'm1', eventId: 'e1', userId: 'u2', text: 'Do we need to submit a project idea beforehand?', timestamp: '10:30 AM' },
  { id: 'm2', eventId: 'e1', userId: 'u3', text: 'Yes, idea form closes 48 hours before the event!', timestamp: '10:35 AM' },
  { id: 'm3', eventId: 'e1', userId: 'u1', text: 'Thanks for clarifying! Submitting ours now.', timestamp: '10:38 AM' },
];
