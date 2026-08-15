import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Session,
  Challenge,
  ChallengeTask,
  Artwork,
  Insight,
  Achievement,
  NavigationTab,
  TopicStat
} from '../types';
import {
  loadStoredSessions,
  saveStoredSessions,
  loadStoredActiveSession,
  saveStoredActiveSession,
  loadStoredChallenges,
  saveStoredChallenges,
  loadStoredArtworks,
  saveStoredArtworks,
  loadStoredInsights,
  saveStoredInsights,
  loadStoredAchievements,
  saveStoredAchievements
} from '../lib/local-store';
import { saveArtworkImage, deleteArtworkImage } from '../lib/image-store';
import { getElapsedSessionTime, calculateDrawingStreak } from '../lib/time-utils';
import { evaluateAchievements } from '../lib/achievements';

interface AppContextType {
  // Navigation & View
  currentTab: NavigationTab;
  selectedChallengeId: string | null;
  selectedArtworkId: string | null;
  selectedInsightId: string | null;
  navigateTo: (tab: NavigationTab, params?: { challengeId?: string; artworkId?: string; insightId?: string }) => void;

  // Session State & Actions
  sessions: Session[];
  activeSession: Session | null;
  currentElapsedMs: number;
  completedSessionForModal: Session | null;
  setCompletedSessionForModal: (session: Session | null) => void;
  startSession: (params: { title?: string; topics: string[]; goal?: string }) => Session;
  pauseSession: () => void;
  resumeSession: () => void;
  finishSession: () => Session | null;
  deleteSession: (id: string) => void;

  // Challenge State & Actions
  challenges: Challenge[];
  createChallenge: (data: {
    title: string;
    description: string;
    startDate: string;
    endDate?: string;
    duration: string;
    accent: string;
    dailyGoal?: string;
    tasks?: { title: string; notes?: string }[];
  }) => Challenge;
  updateChallenge: (id: string, updates: Partial<Challenge>) => void;
  deleteChallenge: (id: string) => void;
  toggleChallengeTask: (challengeId: string, taskId: string) => void;
  addChallengeTask: (challengeId: string, task: { title: string; notes?: string }) => void;
  updateChallengeTask: (challengeId: string, taskId: string, updates: Partial<ChallengeTask>) => void;
  deleteChallengeTask: (challengeId: string, taskId: string) => void;

  // Artwork State & Actions
  artworks: Artwork[];
  saveArtwork: (
    data: Omit<Artwork, 'id' | 'createdAt' | 'updatedAt' | 'imageId'>,
    imageSource: Blob | File | string
  ) => Promise<Artwork>;
  updateArtwork: (
    id: string,
    updates: Partial<Omit<Artwork, 'id' | 'createdAt' | 'updatedAt' | 'imageId'>>,
    newImageSource?: Blob | File | string
  ) => Promise<void>;
  deleteArtwork: (id: string) => Promise<void>;

  // Insight State & Actions
  insights: Insight[];
  saveInsight: (data: Omit<Insight, 'id' | 'createdAt' | 'updatedAt'>) => Insight;
  updateInsight: (id: string, updates: Partial<Insight>) => void;
  deleteInsight: (id: string) => void;

  // Achievement State & Toast
  achievements: Achievement[];
  recentlyUnlockedAchievement: Achievement | null;
  dismissAchievementToast: () => void;

  // Computed Real Stats
  totalDrawingTimeMs: number;
  totalCompletedSessionsCount: number;
  drawingStreak: number;
  topicStats: TopicStat[];
  activeChallengesCount: number;
  completedChallengesCount: number;

  // Flow Modals State
  isNewSessionModalOpen: boolean;
  setIsNewSessionModalOpen: (open: boolean) => void;
  isArtworkModalOpen: boolean;
  setIsArtworkModalOpen: (open: boolean) => void;
  artworkModalPrefill: Partial<Artwork> | null;
  setArtworkModalPrefill: (data: Partial<Artwork> | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation State
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(null);
  const [selectedArtworkId, setSelectedArtworkId] = useState<string | null>(null);
  const [selectedInsightId, setSelectedInsightId] = useState<string | null>(null);

  // Entities State
  const [sessions, setSessions] = useState<Session[]>(() => loadStoredSessions());
  const [activeSession, setActiveSession] = useState<Session | null>(() => loadStoredActiveSession());
  const [challenges, setChallenges] = useState<Challenge[]>(() => loadStoredChallenges());
  const [artworks, setArtworks] = useState<Artwork[]>(() => loadStoredArtworks());
  const [insights, setInsights] = useState<Insight[]>(() => loadStoredInsights());
  const [achievements, setAchievements] = useState<Achievement[]>(() => loadStoredAchievements());

  // Modal / Flow State
  const [isNewSessionModalOpen, setIsNewSessionModalOpen] = useState<boolean>(false);
  const [isArtworkModalOpen, setIsArtworkModalOpen] = useState<boolean>(false);
  const [artworkModalPrefill, setArtworkModalPrefill] = useState<Partial<Artwork> | null>(null);
  const [completedSessionForModal, setCompletedSessionForModal] = useState<Session | null>(null);

  // Live Timer State
  const [currentElapsedMs, setCurrentElapsedMs] = useState<number>(0);
  const [recentlyUnlockedAchievement, setRecentlyUnlockedAchievement] = useState<Achievement | null>(null);

  // Update storage whenever entities change
  useEffect(() => {
    saveStoredSessions(sessions);
  }, [sessions]);

  useEffect(() => {
    saveStoredActiveSession(activeSession);
  }, [activeSession]);

  useEffect(() => {
    saveStoredChallenges(challenges);
  }, [challenges]);

  useEffect(() => {
    saveStoredArtworks(artworks);
  }, [artworks]);

  useEffect(() => {
    saveStoredInsights(insights);
  }, [insights]);

  useEffect(() => {
    saveStoredAchievements(achievements);
  }, [achievements]);

  // Live Timer calculation loop with high precision timestamp delta
  useEffect(() => {
    if (!activeSession) {
      setCurrentElapsedMs(0);
      return;
    }

    const updateTimer = () => {
      const elapsed = getElapsedSessionTime(activeSession, Date.now());
      setCurrentElapsedMs(elapsed);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 250);
    return () => clearInterval(interval);
  }, [activeSession]);

  // Computed Real Stats
  const totalDrawingTimeMs = useMemo(() => {
    return sessions
      .filter(s => s.status === 'completed')
      .reduce((acc, s) => acc + (s.duration || 0), 0);
  }, [sessions]);

  const totalCompletedSessionsCount = useMemo(() => {
    return sessions.filter(s => s.status === 'completed').length;
  }, [sessions]);

  const drawingStreak = useMemo(() => {
    return calculateDrawingStreak(sessions);
  }, [sessions]);

  const activeChallengesCount = useMemo(() => {
    return challenges.filter(c => c.status === 'active').length;
  }, [challenges]);

  const completedChallengesCount = useMemo(() => {
    return challenges.filter(c => c.status === 'completed').length;
  }, [challenges]);

  // Computed Topic Practice Statistics
  const topicStats = useMemo(() => {
    const map = new Map<string, { totalTimeMs: number; sessionCount: number; artworkCount: number; lastPracticed: number }>();

    // From completed sessions
    sessions.filter(s => s.status === 'completed').forEach(s => {
      const durationPerTopic = s.topics.length > 0 ? (s.duration || 0) / s.topics.length : 0;
      s.topics.forEach(topic => {
        const clean = topic.trim();
        if (!clean) return;
        const current = map.get(clean) || { totalTimeMs: 0, sessionCount: 0, artworkCount: 0, lastPracticed: 0 };
        current.totalTimeMs += durationPerTopic;
        current.sessionCount += 1;
        if (s.completedAt && s.completedAt > current.lastPracticed) {
          current.lastPracticed = s.completedAt;
        }
        map.set(clean, current);
      });
    });

    // From artworks
    artworks.forEach(art => {
      art.topics.forEach(topic => {
        const clean = topic.trim();
        if (!clean) return;
        const current = map.get(clean) || { totalTimeMs: 0, sessionCount: 0, artworkCount: 0, lastPracticed: 0 };
        current.artworkCount += 1;
        const artTime = new Date(art.date).getTime();
        if (!isNaN(artTime) && artTime > current.lastPracticed) {
          current.lastPracticed = artTime;
        }
        map.set(clean, current);
      });
    });

    const result: TopicStat[] = [];
    map.forEach((value, topic) => {
      result.push({
        topic,
        ...value
      });
    });

    return result.sort((a, b) => b.totalTimeMs - a.totalTimeMs);
  }, [sessions, artworks]);

  // Trigger achievement evaluation
  const triggerAchievementCheck = useCallback((
    currentSessions: Session[],
    currentArtworks: Artwork[],
    currentChallenges: Challenge[]
  ) => {
    const totalTime = currentSessions
      .filter(s => s.status === 'completed')
      .reduce((sum, s) => sum + (s.duration || 0), 0);

    setAchievements(prev => {
      const { updatedAchievements, newlyUnlocked } = evaluateAchievements(prev, {
        sessions: currentSessions,
        artworks: currentArtworks,
        challenges: currentChallenges,
        totalDrawingTimeMs: totalTime
      });

      if (newlyUnlocked.length > 0) {
        // Show first newly unlocked achievement in toast & confetti
        const first = newlyUnlocked[0];
        setRecentlyUnlockedAchievement(first);
        try {
          confetti({
            particleCount: 75,
            spread: 60,
            origin: { y: 0.8 },
            colors: ['#f59e0b', '#d97706', '#fbbf24', '#ffffff', '#6366f1']
          });
        } catch {
          // ignore if canvas unavailable
        }
      }

      return updatedAchievements;
    });
  }, []);

  const dismissAchievementToast = useCallback(() => {
    setRecentlyUnlockedAchievement(null);
  }, []);

  // Navigation Function
  const navigateTo = useCallback((tab: NavigationTab, params?: { challengeId?: string; artworkId?: string; insightId?: string }) => {
    setCurrentTab(tab);
    if (params?.challengeId !== undefined) setSelectedChallengeId(params.challengeId);
    if (params?.artworkId !== undefined) setSelectedArtworkId(params.artworkId);
    if (params?.insightId !== undefined) setSelectedInsightId(params.insightId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // ---------------- Session Handlers ----------------
  const startSession = useCallback((params: { title?: string; topics: string[]; goal?: string }): Session => {
    const now = Date.now();
    const newSession: Session = {
      id: `session-${now}-${Math.random().toString(36).substring(2, 7)}`,
      title: params.title?.trim() || undefined,
      topics: params.topics.length > 0 ? params.topics : ['General Practice'],
      goal: params.goal?.trim() || undefined,
      status: 'active',
      startedAt: now,
      totalPausedDuration: 0,
      duration: 0,
      createdAt: now,
      updatedAt: now
    };

    setActiveSession(newSession);
    setCurrentElapsedMs(0);
    setIsNewSessionModalOpen(false);
    return newSession;
  }, []);

  const pauseSession = useCallback(() => {
    if (!activeSession || activeSession.status !== 'active') return;
    const now = Date.now();
    const updated: Session = {
      ...activeSession,
      status: 'paused',
      pausedAt: now,
      updatedAt: now
    };
    setActiveSession(updated);
  }, [activeSession]);

  const resumeSession = useCallback(() => {
    if (!activeSession || activeSession.status !== 'paused') return;
    const now = Date.now();
    const pauseDelta = activeSession.pausedAt ? Math.max(0, now - activeSession.pausedAt) : 0;
    const updated: Session = {
      ...activeSession,
      status: 'active',
      pausedAt: undefined,
      totalPausedDuration: (activeSession.totalPausedDuration || 0) + pauseDelta,
      updatedAt: now
    };
    setActiveSession(updated);
  }, [activeSession]);

  const finishSession = useCallback((): Session | null => {
    if (!activeSession) return null;
    const now = Date.now();
    const finalDuration = getElapsedSessionTime(activeSession, now);

    const completedSession: Session = {
      ...activeSession,
      status: 'completed',
      completedAt: now,
      duration: finalDuration,
      updatedAt: now
    };

    const newSessions = [completedSession, ...sessions.filter(s => s.id !== completedSession.id)];
    setSessions(newSessions);
    setActiveSession(null);
    setCurrentElapsedMs(0);

    // Open completion modal
    setCompletedSessionForModal(completedSession);

    // Check achievements
    triggerAchievementCheck(newSessions, artworks, challenges);

    return completedSession;
  }, [activeSession, sessions, artworks, challenges, triggerAchievementCheck]);

  const deleteSession = useCallback((id: string) => {
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    if (activeSession?.id === id) {
      setActiveSession(null);
      setCurrentElapsedMs(0);
    }
  }, [sessions, activeSession]);

  // ---------------- Challenge Handlers ----------------
  const createChallenge = useCallback((data: {
    title: string;
    description: string;
    startDate: string;
    endDate?: string;
    duration: string;
    accent: string;
    dailyGoal?: string;
    tasks?: { title: string; notes?: string }[];
  }): Challenge => {
    const now = Date.now();
    const newTasks: ChallengeTask[] = (data.tasks || []).map((t, idx) => ({
      id: `task-${now}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
      title: t.title,
      notes: t.notes,
      completed: false
    }));

    // If no custom tasks provided, auto-create numbered days based on duration
    if (newTasks.length === 0) {
      let daysCount = 7;
      if (data.duration === '14 days') daysCount = 14;
      else if (data.duration === '30 days') daysCount = 30;
      else if (data.duration === 'custom') daysCount = 10;

      for (let i = 1; i <= daysCount; i++) {
        newTasks.push({
          id: `task-${now}-${i}`,
          title: `Day ${String(i).padStart(2, '0')} — Focused Practice`,
          completed: false
        });
      }
    }

    const newChallenge: Challenge = {
      id: `challenge-${now}-${Math.random().toString(36).substring(2, 7)}`,
      title: data.title.trim(),
      description: data.description.trim(),
      startDate: data.startDate,
      endDate: data.endDate,
      duration: data.duration,
      status: 'active',
      accent: data.accent || '#f59e0b',
      dailyGoal: data.dailyGoal?.trim(),
      tasks: newTasks,
      createdAt: now,
      updatedAt: now
    };

    const next = [newChallenge, ...challenges];
    setChallenges(next);
    return newChallenge;
  }, [challenges]);

  const updateChallenge = useCallback((id: string, updates: Partial<Challenge>) => {
    setChallenges(prev => {
      const next = prev.map(c => (c.id === id ? { ...c, ...updates, updatedAt: Date.now() } : c));
      triggerAchievementCheck(sessions, artworks, next);
      return next;
    });
  }, [sessions, artworks, triggerAchievementCheck]);

  const deleteChallenge = useCallback((id: string) => {
    setChallenges(prev => prev.filter(c => c.id !== id));
    if (selectedChallengeId === id) {
      setSelectedChallengeId(null);
      setCurrentTab('challenges');
    }
  }, [selectedChallengeId]);

  const toggleChallengeTask = useCallback((challengeId: string, taskId: string) => {
    setChallenges(prev => {
      const next = prev.map(ch => {
        if (ch.id !== challengeId) return ch;

        const updatedTasks = ch.tasks.map(t => {
          if (t.id !== taskId) return t;
          const nextCompleted = !t.completed;
          return {
            ...t,
            completed: nextCompleted,
            completedAt: nextCompleted ? Date.now() : undefined
          };
        });

        const allCompleted = updatedTasks.length > 0 && updatedTasks.every(t => t.completed);
        const wasAlreadyCompleted = ch.status === 'completed';

        let newStatus = ch.status;
        let completedAt = ch.completedAt;

        if (allCompleted && !wasAlreadyCompleted) {
          newStatus = 'completed';
          completedAt = Date.now();
          try {
            confetti({
              particleCount: 90,
              spread: 70,
              origin: { y: 0.6 },
              colors: [ch.accent || '#f59e0b', '#fbbf24', '#10b981', '#ffffff']
            });
          } catch {
            // ignore
          }
        } else if (!allCompleted && wasAlreadyCompleted) {
          newStatus = 'active';
          completedAt = undefined;
        }

        return {
          ...ch,
          tasks: updatedTasks,
          status: newStatus,
          completedAt,
          updatedAt: Date.now()
        };
      });

      triggerAchievementCheck(sessions, artworks, next);
      return next;
    });
  }, [sessions, artworks, triggerAchievementCheck]);

  const addChallengeTask = useCallback((challengeId: string, task: { title: string; notes?: string }) => {
    const now = Date.now();
    const newTask: ChallengeTask = {
      id: `task-${now}-${Math.random().toString(36).substring(2, 6)}`,
      title: task.title.trim(),
      notes: task.notes?.trim(),
      completed: false
    };

    setChallenges(prev => prev.map(ch => {
      if (ch.id !== challengeId) return ch;
      const tasks = [...ch.tasks, newTask];
      return {
        ...ch,
        tasks,
        status: ch.status === 'completed' ? 'active' : ch.status, // reopen if new task added
        updatedAt: now
      };
    }));
  }, []);

  const updateChallengeTask = useCallback((challengeId: string, taskId: string, updates: Partial<ChallengeTask>) => {
    setChallenges(prev => prev.map(ch => {
      if (ch.id !== challengeId) return ch;
      return {
        ...ch,
        tasks: ch.tasks.map(t => (t.id === taskId ? { ...t, ...updates } : t)),
        updatedAt: Date.now()
      };
    }));
  }, []);

  const deleteChallengeTask = useCallback((challengeId: string, taskId: string) => {
    setChallenges(prev => prev.map(ch => {
      if (ch.id !== challengeId) return ch;
      const remainingTasks = ch.tasks.filter(t => t.id !== taskId);
      const allDone = remainingTasks.length > 0 && remainingTasks.every(t => t.completed);
      return {
        ...ch,
        tasks: remainingTasks,
        status: allDone ? 'completed' : ch.status,
        updatedAt: Date.now()
      };
    }));
  }, []);

  // ---------------- Artwork Handlers ----------------
  const saveArtwork = useCallback(async (
    data: Omit<Artwork, 'id' | 'createdAt' | 'updatedAt' | 'imageId'>,
    imageSource: Blob | File | string
  ): Promise<Artwork> => {
    const now = Date.now();
    const artworkId = `art-${now}-${Math.random().toString(36).substring(2, 7)}`;
    const imageId = `img-${artworkId}`;

    // Store in IndexedDB
    await saveArtworkImage(imageId, imageSource);

    const newArtwork: Artwork = {
      ...data,
      id: artworkId,
      imageId,
      title: data.title.trim() || 'Untitled Artwork',
      topics: data.topics.length > 0 ? data.topics : ['General Study'],
      createdAt: now,
      updatedAt: now
    };

    const next = [newArtwork, ...artworks];
    setArtworks(next);
    triggerAchievementCheck(sessions, next, challenges);
    return newArtwork;
  }, [artworks, sessions, challenges, triggerAchievementCheck]);

  const updateArtwork = useCallback(async (
    id: string,
    updates: Partial<Omit<Artwork, 'id' | 'createdAt' | 'updatedAt' | 'imageId'>>,
    newImageSource?: Blob | File | string
  ): Promise<void> => {
    const existing = artworks.find(a => a.id === id);
    if (!existing) return;

    if (newImageSource) {
      await saveArtworkImage(existing.imageId, newImageSource);
    }

    const updatedArtworks = artworks.map(a => {
      if (a.id !== id) return a;
      return {
        ...a,
        ...updates,
        updatedAt: Date.now()
      };
    });

    setArtworks(updatedArtworks);
    triggerAchievementCheck(sessions, updatedArtworks, challenges);
  }, [artworks, sessions, challenges, triggerAchievementCheck]);

  const deleteArtwork = useCallback(async (id: string): Promise<void> => {
    const existing = artworks.find(a => a.id === id);
    if (existing) {
      await deleteArtworkImage(existing.imageId);
    }
    setArtworks(prev => prev.filter(a => a.id !== id));
    if (selectedArtworkId === id) {
      setSelectedArtworkId(null);
    }
  }, [artworks, selectedArtworkId]);

  // ---------------- Insight Handlers ----------------
  const saveInsight = useCallback((data: Omit<Insight, 'id' | 'createdAt' | 'updatedAt'>): Insight => {
    const now = Date.now();
    const newInsight: Insight = {
      ...data,
      id: `insight-${now}-${Math.random().toString(36).substring(2, 7)}`,
      title: data.title.trim() || 'Untitled Insight',
      content: data.content.trim(),
      tags: data.tags.length > 0 ? data.tags : ['Practice Note'],
      createdAt: now,
      updatedAt: now
    };

    setInsights(prev => [newInsight, ...prev]);
    return newInsight;
  }, []);

  const updateInsight = useCallback((id: string, updates: Partial<Insight>) => {
    setInsights(prev => prev.map(ins => (ins.id === id ? { ...ins, ...updates, updatedAt: Date.now() } : ins)));
  }, []);

  const deleteInsight = useCallback((id: string) => {
    setInsights(prev => prev.filter(ins => ins.id !== id));
    if (selectedInsightId === id) {
      setSelectedInsightId(null);
    }
  }, [selectedInsightId]);

  const value = useMemo<AppContextType>(() => ({
    currentTab,
    selectedChallengeId,
    selectedArtworkId,
    selectedInsightId,
    navigateTo,

    sessions,
    activeSession,
    currentElapsedMs,
    completedSessionForModal,
    setCompletedSessionForModal,
    startSession,
    pauseSession,
    resumeSession,
    finishSession,
    deleteSession,

    challenges,
    createChallenge,
    updateChallenge,
    deleteChallenge,
    toggleChallengeTask,
    addChallengeTask,
    updateChallengeTask,
    deleteChallengeTask,

    artworks,
    saveArtwork,
    updateArtwork,
    deleteArtwork,

    insights,
    saveInsight,
    updateInsight,
    deleteInsight,

    achievements,
    recentlyUnlockedAchievement,
    dismissAchievementToast,

    totalDrawingTimeMs,
    totalCompletedSessionsCount,
    drawingStreak,
    topicStats,
    activeChallengesCount,
    completedChallengesCount,

    isNewSessionModalOpen,
    setIsNewSessionModalOpen,
    isArtworkModalOpen,
    setIsArtworkModalOpen,
    artworkModalPrefill,
    setArtworkModalPrefill
  }), [
    currentTab,
    selectedChallengeId,
    selectedArtworkId,
    selectedInsightId,
    navigateTo,
    sessions,
    activeSession,
    currentElapsedMs,
    completedSessionForModal,
    startSession,
    pauseSession,
    resumeSession,
    finishSession,
    deleteSession,
    challenges,
    createChallenge,
    updateChallenge,
    deleteChallenge,
    toggleChallengeTask,
    addChallengeTask,
    updateChallengeTask,
    deleteChallengeTask,
    artworks,
    saveArtwork,
    updateArtwork,
    deleteArtwork,
    insights,
    saveInsight,
    updateInsight,
    deleteInsight,
    achievements,
    recentlyUnlockedAchievement,
    dismissAchievementToast,
    totalDrawingTimeMs,
    totalCompletedSessionsCount,
    drawingStreak,
    topicStats,
    activeChallengesCount,
    completedChallengesCount,
    isNewSessionModalOpen,
    isArtworkModalOpen,
    artworkModalPrefill
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
