import { Session } from '../types';

/**
 * Calculates accurate elapsed active drawing duration for a session using timestamps.
 * Prevents timer drift even if the browser tab is idle or backgrounded.
 */
export function getElapsedSessionTime(session: Session | null, now: number = Date.now()): number {
  if (!session) return 0;

  if (session.status === 'completed') {
    return session.duration || 0;
  }

  if (session.status === 'paused') {
    // If paused, elapsed time is from startedAt until pausedAt, minus all previous paused duration
    const pauseTime = session.pausedAt || now;
    return Math.max(0, pauseTime - session.startedAt - (session.totalPausedDuration || 0));
  }

  // Active state: elapsed time from startedAt to now, minus all paused durations
  return Math.max(0, now - session.startedAt - (session.totalPausedDuration || 0));
}

/**
 * Format milliseconds into HH:MM:SS or MM:SS
 */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Format milliseconds into human readable short hours and minutes, e.g. "12h 34m" or "0h 0m"
 */
export function formatShortDuration(ms: number): string {
  if (!ms || ms <= 0) return '0h 0m';

  const totalMinutes = Math.floor(ms / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

/**
 * Format milliseconds into standard display, e.g. "1 hr 45 min" or "24 min"
 */
export function formatLongDuration(ms: number): string {
  if (!ms || ms <= 0) return '0 min';

  const totalMinutes = Math.floor(ms / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0 && minutes > 0) {
    return `${hours} hr ${minutes} min`;
  }
  if (hours > 0) {
    return `${hours} hr`;
  }
  return `${minutes} min`;
}

/**
 * Format timestamp or ISO string to standard date
 */
export function formatDate(timestampOrDateStr: number | string | undefined): string {
  if (!timestampOrDateStr) return '';
  const date = new Date(timestampOrDateStr);
  if (isNaN(date.getTime())) return String(timestampOrDateStr);

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
}

/**
 * Format timestamp to relative or time string, e.g. "Today, 4:20 PM" or "Aug 14, 2:30 PM"
 */
export function formatDateTime(timestamp: number): string {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(date);
}

/**
 * Calculate the user's active drawing streak in days based on completed sessions.
 * Real streak only: calculated from actual completed drawing session dates.
 */
export function calculateDrawingStreak(completedSessions: Session[]): number {
  if (!completedSessions || completedSessions.length === 0) return 0;

  // Extract unique practice days in local date string 'YYYY-MM-DD'
  const sessionDates = new Set<string>();

  for (const session of completedSessions) {
    if (session.status === 'completed' && session.completedAt) {
      const date = new Date(session.completedAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      sessionDates.add(key);
    }
  }

  if (sessionDates.size === 0) return 0;

  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

  // If user practiced neither today nor yesterday, streak is 0
  let checkDate = new Date(today);
  if (!sessionDates.has(todayKey)) {
    if (!sessionDates.has(yesterdayKey)) {
      return 0;
    }
    // Started counting from yesterday
    checkDate = yesterday;
  }

  let streak = 0;
  while (true) {
    const key = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
    if (sessionDates.has(key)) {
      streak++;
      // Move 1 day back
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}
