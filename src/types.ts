export type SessionStatus = 'active' | 'paused' | 'completed';

export interface Session {
  id: string;
  title?: string;
  topics: string[];
  goal?: string;
  status: SessionStatus;
  startedAt: number; // Unix timestamp ms
  pausedAt?: number; // Unix timestamp ms
  totalPausedDuration: number; // ms accumulated during pauses
  completedAt?: number; // Unix timestamp ms
  duration: number; // Total active drawing duration in ms
  createdAt: number;
  updatedAt: number;
}

export type ChallengeStatus = 'active' | 'paused' | 'completed';

export interface ChallengeTask {
  id: string;
  title: string;
  notes?: string;
  completed: boolean;
  completedAt?: number;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  duration: string; // '7 days' | '14 days' | '30 days' | 'Custom'
  status: ChallengeStatus;
  accent: string; // Color hex or theme key (e.g. '#f59e0b', '#10b981', '#6366f1', '#ec4899', '#8b5cf6', '#06b6d4')
  dailyGoal?: string;
  tasks: ChallengeTask[];
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
}

export interface Artwork {
  id: string;
  title: string;
  description?: string;
  imageId: string; // IndexedDB key or Data URL fallback
  topics: string[];
  durationMs: number; // drawing time in milliseconds
  date: string; // YYYY-MM-DD
  mood?: string;
  notes?: string;
  sourceSessionId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Insight {
  id: string;
  title: string;
  content: string;
  tags: string[];
  relatedArtworkId?: string;
  relatedChallengeId?: string;
  relatedSessionId?: string;
  createdAt: number;
  updatedAt: number;
}

export type AchievementCategory = 'session' | 'time' | 'challenge' | 'artwork';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // Lucide icon identifier
  category: AchievementCategory;
  condition: string;
  targetValue: number;
  currentValue?: number;
  unlocked: boolean;
  unlockedAt?: number;
}

export type NavigationTab = 
  | 'dashboard'
  | 'session'
  | 'challenges'
  | 'artwork'
  | 'insights'
  | 'achievements'
  | 'topics';

export interface TopicStat {
  topic: string;
  totalTimeMs: number;
  sessionCount: number;
  artworkCount: number;
  lastPracticed?: number;
}
