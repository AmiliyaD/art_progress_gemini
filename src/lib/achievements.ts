import { Achievement, Session, Artwork, Challenge } from '../types';

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  // Session Achievements
  {
    id: 'ach-session-1',
    title: 'First Session',
    description: 'Complete 1 drawing session in the studio.',
    icon: 'PlayCircle',
    category: 'session',
    condition: 'Complete 1 drawing session',
    targetValue: 1,
    unlocked: false
  },
  {
    id: 'ach-session-5',
    title: 'Getting Started',
    description: 'Complete 5 drawing sessions.',
    icon: 'Flame',
    category: 'session',
    condition: 'Complete 5 drawing sessions',
    targetValue: 5,
    unlocked: false
  },
  {
    id: 'ach-session-10',
    title: 'Dedicated',
    description: 'Complete 10 drawing sessions.',
    icon: 'Zap',
    category: 'session',
    condition: 'Complete 10 drawing sessions',
    targetValue: 10,
    unlocked: false
  },

  // Time Achievements
  {
    id: 'ach-time-1',
    title: 'First Hour',
    description: 'Accumulate 1 hour of active drawing practice.',
    icon: 'Clock',
    category: 'time',
    condition: 'Accumulate 1 hour of drawing time',
    targetValue: 1 * 60 * 60 * 1000, // 1 hour in ms
    unlocked: false
  },
  {
    id: 'ach-time-10',
    title: '10 Hours',
    description: 'Accumulate 10 hours of focused art practice.',
    icon: 'Hourglass',
    category: 'time',
    condition: 'Accumulate 10 hours of drawing time',
    targetValue: 10 * 60 * 60 * 1000, // 10 hours in ms
    unlocked: false
  },
  {
    id: 'ach-time-50',
    title: '50 Hours',
    description: 'Accumulate 50 hours of creative mastery.',
    icon: 'Compass',
    category: 'time',
    condition: 'Accumulate 50 hours of drawing time',
    targetValue: 50 * 60 * 60 * 1000, // 50 hours in ms
    unlocked: false
  },
  {
    id: 'ach-time-100',
    title: '100 Hours',
    description: 'Accumulate 100 hours of disciplined craft.',
    icon: 'Crown',
    category: 'time',
    condition: 'Accumulate 100 hours of drawing time',
    targetValue: 100 * 60 * 60 * 1000, // 100 hours in ms
    unlocked: false
  },

  // Challenge Achievements
  {
    id: 'ach-challenge-1',
    title: 'Challenge Accepted',
    description: 'Complete all tasks in 1 drawing challenge.',
    icon: 'Award',
    category: 'challenge',
    condition: 'Complete 1 challenge',
    targetValue: 1,
    unlocked: false
  },
  {
    id: 'ach-challenge-5',
    title: 'Challenge Veteran',
    description: 'Complete 5 full drawing challenges.',
    icon: 'ShieldCheck',
    category: 'challenge',
    condition: 'Complete 5 challenges',
    targetValue: 5,
    unlocked: false
  },
  {
    id: 'ach-challenge-10',
    title: 'Challenge Master',
    description: 'Complete 10 drawing challenges.',
    icon: 'Trophy',
    category: 'challenge',
    condition: 'Complete 10 challenges',
    targetValue: 10,
    unlocked: false
  },
  {
    id: 'ach-challenge-30days',
    title: '30-Day Commitment',
    description: 'Complete a major challenge containing at least 30 tasks.',
    icon: 'Target',
    category: 'challenge',
    condition: 'Complete a challenge with at least 30 tasks',
    targetValue: 30,
    unlocked: false
  },

  // Artwork Achievements
  {
    id: 'ach-artwork-1',
    title: 'First Artwork',
    description: 'Save 1 artwork to your studio archive.',
    icon: 'Palette',
    category: 'artwork',
    condition: 'Save 1 artwork',
    targetValue: 1,
    unlocked: false
  },
  {
    id: 'ach-artwork-10',
    title: 'Art Archive',
    description: 'Save 10 artworks to your studio gallery.',
    icon: 'Layers',
    category: 'artwork',
    condition: 'Save 10 artworks',
    targetValue: 10,
    unlocked: false
  }
];

export interface EvaluationInput {
  sessions: Session[];
  artworks: Artwork[];
  challenges: Challenge[];
  totalDrawingTimeMs: number;
}

/**
 * Centralized achievement evaluation.
 * Evaluates real conditions from real user data and identifies newly unlocked achievements.
 */
export function evaluateAchievements(
  currentAchievements: Achievement[],
  data: EvaluationInput
): { updatedAchievements: Achievement[]; newlyUnlocked: Achievement[] } {
  const completedSessions = data.sessions.filter(s => s.status === 'completed' || s.status === 'expired');
  const sessionCount = completedSessions.length;
  const totalDrawingTime = data.totalDrawingTimeMs;
  const artworkCount = data.artworks.length;
  const completedChallenges = data.challenges.filter(c => c.status === 'completed');
  const completedChallengeCount = completedChallenges.length;
  const hasCompleted30DayChallenge = completedChallenges.some(c => (c.tasks?.length || 0) >= 30);

  const newlyUnlocked: Achievement[] = [];
  const now = Date.now();

  const updatedAchievements = currentAchievements.map(ach => {
    let currentValue = 0;
    let shouldUnlock = false;

    switch (ach.id) {
      case 'ach-session-1':
        currentValue = sessionCount;
        shouldUnlock = sessionCount >= 1;
        break;
      case 'ach-session-5':
        currentValue = sessionCount;
        shouldUnlock = sessionCount >= 5;
        break;
      case 'ach-session-10':
        currentValue = sessionCount;
        shouldUnlock = sessionCount >= 10;
        break;

      case 'ach-time-1':
        currentValue = totalDrawingTime;
        shouldUnlock = totalDrawingTime >= 1 * 60 * 60 * 1000;
        break;
      case 'ach-time-10':
        currentValue = totalDrawingTime;
        shouldUnlock = totalDrawingTime >= 10 * 60 * 60 * 1000;
        break;
      case 'ach-time-50':
        currentValue = totalDrawingTime;
        shouldUnlock = totalDrawingTime >= 50 * 60 * 60 * 1000;
        break;
      case 'ach-time-100':
        currentValue = totalDrawingTime;
        shouldUnlock = totalDrawingTime >= 100 * 60 * 60 * 1000;
        break;

      case 'ach-challenge-1':
        currentValue = completedChallengeCount;
        shouldUnlock = completedChallengeCount >= 1;
        break;
      case 'ach-challenge-5':
        currentValue = completedChallengeCount;
        shouldUnlock = completedChallengeCount >= 5;
        break;
      case 'ach-challenge-10':
        currentValue = completedChallengeCount;
        shouldUnlock = completedChallengeCount >= 10;
        break;
      case 'ach-challenge-30days':
        currentValue = hasCompleted30DayChallenge ? 30 : 0;
        shouldUnlock = hasCompleted30DayChallenge;
        break;

      case 'ach-artwork-1':
        currentValue = artworkCount;
        shouldUnlock = artworkCount >= 1;
        break;
      case 'ach-artwork-10':
        currentValue = artworkCount;
        shouldUnlock = artworkCount >= 10;
        break;

      default:
        break;
    }

    if (!ach.unlocked && shouldUnlock) {
      const unlockedAch: Achievement = {
        ...ach,
        unlocked: true,
        unlockedAt: now,
        currentValue
      };
      newlyUnlocked.push(unlockedAch);
      return unlockedAch;
    }

    return {
      ...ach,
      currentValue
    };
  });

  return { updatedAchievements, newlyUnlocked };
}
