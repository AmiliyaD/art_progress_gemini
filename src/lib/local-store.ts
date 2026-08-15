import { Session, Challenge, Artwork, Insight, Achievement } from '../types';
import { INITIAL_CHALLENGES } from './seed-data';
import { INITIAL_ACHIEVEMENTS } from './achievements';

const STORAGE_KEYS = {
  SESSIONS: 'artprogress.sessions.v1',
  ACTIVE_SESSION: 'artprogress.active_session.v1',
  CHALLENGES: 'artprogress.challenges.v1',
  ARTWORKS: 'artprogress.artworks.v1',
  INSIGHTS: 'artprogress.insights.v1',
  ACHIEVEMENTS: 'artprogress.achievements.v1',
} as const;

function safeGetItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`Failed to parse localStorage key "${key}":`, err);
    return fallback;
  }
}

function safeSetItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed to write to localStorage key "${key}":`, err);
  }
}

// ---------------- Sessions ----------------
export function loadStoredSessions(): Session[] {
  return safeGetItem<Session[]>(STORAGE_KEYS.SESSIONS, []);
}

export function saveStoredSessions(sessions: Session[]): void {
  safeSetItem(STORAGE_KEYS.SESSIONS, sessions);
}

export function loadStoredActiveSession(): Session | null {
  return safeGetItem<Session | null>(STORAGE_KEYS.ACTIVE_SESSION, null);
}

export function saveStoredActiveSession(session: Session | null): void {
  if (session) {
    safeSetItem(STORAGE_KEYS.ACTIVE_SESSION, session);
  } else {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
  }
}

// ---------------- Challenges ----------------
export function loadStoredChallenges(): Challenge[] {
  const loaded = safeGetItem<Challenge[] | null>(STORAGE_KEYS.CHALLENGES, null);
  if (!loaded || !Array.isArray(loaded) || loaded.length === 0) {
    // Initialize with starter editable templates (0% progress)
    saveStoredChallenges(INITIAL_CHALLENGES);
    return INITIAL_CHALLENGES;
  }
  return loaded;
}

export function saveStoredChallenges(challenges: Challenge[]): void {
  safeSetItem(STORAGE_KEYS.CHALLENGES, challenges);
}

// ---------------- Artworks ----------------
export function loadStoredArtworks(): Artwork[] {
  return safeGetItem<Artwork[]>(STORAGE_KEYS.ARTWORKS, []);
}

export function saveStoredArtworks(artworks: Artwork[]): void {
  safeSetItem(STORAGE_KEYS.ARTWORKS, artworks);
}

// ---------------- Insights ----------------
export function loadStoredInsights(): Insight[] {
  return safeGetItem<Insight[]>(STORAGE_KEYS.INSIGHTS, []);
}

export function saveStoredInsights(insights: Insight[]): void {
  safeSetItem(STORAGE_KEYS.INSIGHTS, insights);
}

// ---------------- Achievements ----------------
export function loadStoredAchievements(): Achievement[] {
  const stored = safeGetItem<Achievement[] | null>(STORAGE_KEYS.ACHIEVEMENTS, null);
  if (!stored || !Array.isArray(stored) || stored.length === 0) {
    saveStoredAchievements(INITIAL_ACHIEVEMENTS);
    return INITIAL_ACHIEVEMENTS;
  }

  // Merge with any newly added initial achievement schema if needed
  const existingMap = new Map(stored.map(a => [a.id, a]));
  const merged = INITIAL_ACHIEVEMENTS.map(initial => {
    const existing = existingMap.get(initial.id);
    if (existing) {
      return {
        ...initial,
        unlocked: existing.unlocked,
        unlockedAt: existing.unlockedAt,
        currentValue: existing.currentValue
      };
    }
    return initial;
  });

  return merged;
}

export function saveStoredAchievements(achievements: Achievement[]): void {
  safeSetItem(STORAGE_KEYS.ACHIEVEMENTS, achievements);
}

// Helper to clear or export/import data if needed
export function clearAllStudioData(): void {
  Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
}
