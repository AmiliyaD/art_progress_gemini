import { Challenge } from '../types';

export const INITIAL_CHALLENGES: Challenge[] = [
  {
    id: 'challenge-hands-30',
    title: '30 Days of Hands',
    description: 'Master hand anatomy, finger foreshortening, and expressive gestures with one focused study per day.',
    startDate: new Date().toISOString().split('T')[0],
    duration: '30 days',
    status: 'active',
    accent: '#f59e0b', // Amber Gold
    dailyGoal: 'Practice drawing hands from unusual angles every day.',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    tasks: [
      { id: 'h-1', title: 'Day 01 — Relaxed open palm & proportions', completed: false },
      { id: 'h-2', title: 'Day 02 — Closed fist & knuckle alignment', completed: false },
      { id: 'h-3', title: 'Day 03 — Side profile hand with thumb joint', completed: false },
      { id: 'h-4', title: 'Day 04 — Foreshortened fingers pointing forward', completed: false },
      { id: 'h-5', title: 'Day 05 — Hand gripping a cylindrical object', completed: false },
      { id: 'h-6', title: 'Day 06 — Hand holding a pen/brush in dynamic grip', completed: false },
      { id: 'h-7', title: 'Day 07 — Pinched fingers (precision grip)', completed: false },
      { id: 'h-8', title: 'Day 08 — Resting flat hand on table surface', completed: false },
      { id: 'h-9', title: 'Day 09 — Expressive pointing gesture', completed: false },
      { id: 'h-10', title: 'Day 10 — Clenched tense hand in struggle', completed: false },
      { id: 'h-11', title: 'Day 11 — Hand viewed directly from the wrist angle', completed: false },
      { id: 'h-12', title: 'Day 12 — Back of hand showing tendon structure', completed: false },
      { id: 'h-13', title: 'Day 13 — Interlocked fingers / prayer hands', completed: false },
      { id: 'h-14', title: 'Day 14 — Hand resting on chin/face gesture', completed: false },
      { id: 'h-15', title: 'Day 15 — Cupped hand holding water/sphere', completed: false },
      { id: 'h-16', title: 'Day 16 — Elderly hand with pronounced knuckle forms', completed: false },
      { id: 'h-17', title: 'Day 17 — Graceful dancer fingers / soft extension', completed: false },
      { id: 'h-18', title: 'Day 18 — Hand holding smartphone or thin rectangular device', completed: false },
      { id: 'h-19', title: 'Day 19 — Dramatic top-down perspective hand', completed: false },
      { id: 'h-20', title: 'Day 20 — Dynamic foreshortened palm reaching forward', completed: false },
      { id: 'h-21', title: 'Day 21 — Hand pulling a rope or strap', completed: false },
      { id: 'h-22', title: 'Day 22 — Peace sign / V-gesture with clean spacing', completed: false },
      { id: 'h-23', title: 'Day 23 — Snapping fingers action frame', completed: false },
      { id: 'h-24', title: 'Day 24 — Two hands interacting / gentle touch', completed: false },
      { id: 'h-25', title: 'Day 25 — Hand holding a coffee cup by handle', completed: false },
      { id: 'h-26', title: 'Day 26 — High contrast light & shadow study on knuckles', completed: false },
      { id: 'h-27', title: 'Day 27 — Glove or wrapped hand forms', completed: false },
      { id: 'h-28', title: 'Day 28 — 60-second quick gesture hands (5 poses)', completed: false },
      { id: 'h-29', title: 'Day 29 — Stylized hand construction with clean planes', completed: false },
      { id: 'h-30', title: 'Day 30 — Fully rendered master hand study with lighting', completed: false }
    ]
  },
  {
    id: 'challenge-portraits-14',
    title: '14 Days of Portraits',
    description: 'Construct solid head planes, accurate facial features, and capture lighting mood.',
    startDate: new Date().toISOString().split('T')[0],
    duration: '14 days',
    status: 'active',
    accent: '#6366f1', // Studio Indigo
    dailyGoal: 'Study one facial construction fundamental each day.',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    tasks: [
      { id: 'p-1', title: 'Day 01 — Loomis method head sphere and jaw planes', completed: false },
      { id: 'p-2', title: 'Day 02 — Three-quarter view head construction', completed: false },
      { id: 'p-3', title: 'Day 03 — Eye anatomy, eyelids & orbital socket volumes', completed: false },
      { id: 'p-4', title: 'Day 04 — Nose bridge, septum, and nostril planar shapes', completed: false },
      { id: 'p-5', title: 'Day 05 — Lip curvature, dental curve & philtrum', completed: false },
      { id: 'p-6', title: 'Day 06 — Ear structure, helix & antihelix placement', completed: false },
      { id: 'p-7', title: 'Day 07 — Extreme tilt: Head viewed from above (bird’s eye)', completed: false },
      { id: 'p-8', title: 'Day 08 — Extreme tilt: Head viewed from below (worm’s eye)', completed: false },
      { id: 'p-9', title: 'Day 09 — Dramatic chiaroscuro lighting on head', completed: false },
      { id: 'p-10', title: 'Day 10 — Hair rhythm, major masses, and scalp hairline', completed: false },
      { id: 'p-11', title: 'Day 11 — Expressive emotional portrait (Joy / Intensity)', completed: false },
      { id: 'p-12', title: 'Day 12 — Age study: Wrinkle flow & skin elasticity', completed: false },
      { id: 'p-13', title: 'Day 13 — Side profile with neck and trapezius connection', completed: false },
      { id: 'p-14', title: 'Day 14 — Fully rendered master portrait study', completed: false }
    ]
  },
  {
    id: 'challenge-perspective-7',
    title: '7 Days of Perspective',
    description: 'Ground your environments, spatial volumes, and structural compositions with perspective fundamentals.',
    startDate: new Date().toISOString().split('T')[0],
    duration: '7 days',
    status: 'active',
    accent: '#10b981', // Emerald Sage
    dailyGoal: 'Build spatial depth and horizon awareness.',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    tasks: [
      { id: 'persp-1', title: 'Day 01 — 1-Point perspective interior room & furniture grids', completed: false },
      { id: 'persp-2', title: 'Day 02 — 2-Point perspective architectural corner and street view', completed: false },
      { id: 'persp-3', title: 'Day 03 — 3-Point dramatic skyscraper or towering building', completed: false },
      { id: 'persp-4', title: 'Day 04 — Ellipses in perspective: Cylinders, wheels & arches', completed: false },
      { id: 'persp-5', title: 'Day 05 — Dynamic bird’s eye overview of a courtyard', completed: false },
      { id: 'persp-6', title: 'Day 06 — Dramatic worm’s eye view with character silhouettes', completed: false },
      { id: 'persp-7', title: 'Day 07 — Complex multi-object fantasy or sci-fi environment', completed: false }
    ]
  }
];
