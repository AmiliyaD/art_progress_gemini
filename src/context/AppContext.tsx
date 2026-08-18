import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { User, Session as SupabaseAuthSession } from '@supabase/supabase-js';
import {
  Session,
  SessionType,
  Challenge,
  ChallengeTask,
  Artwork,
  Insight,
  Achievement,
  NavigationTab,
  TopicStat,
  UserProfile
} from '../types';
import {
  loadStoredUserProfile,
  saveStoredUserProfile,
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
import { getElapsedSessionTime, calculateDrawingStreak, isSessionFinished } from '../lib/time-utils';
import { evaluateAchievements } from '../lib/achievements';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  getRemoteUserProfile,
  upsertRemoteUserProfile,
  getRemoteSessions,
  upsertRemoteSession,
  deleteRemoteSession,
  getRemoteChallenges,
  upsertRemoteChallenge,
  deleteRemoteChallenge,
  getRemoteArtworks,
  upsertRemoteArtwork,
  deleteRemoteArtwork,
  uploadArtworkToStorage,
  deleteArtworkFromStorage,
  getRemoteInsights,
  upsertRemoteInsight,
  deleteRemoteInsight,
  getRemoteAchievements,
  upsertRemoteAchievements,
  checkLocalDataToMigrate,
  migrateLocalDataToSupabase,
  MigrationStatus
} from '../lib/supabase-service';

export type CloudSyncStatus = 'synced' | 'syncing' | 'offline' | 'local';

interface AppContextType {
  // Supabase Auth & Cloud Sync
  authUser: User | null;
  authSession: SupabaseAuthSession | null;
  isAuthLoading: boolean;
  isSupabaseActive: boolean;
  cloudSyncStatus: CloudSyncStatus;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;

  // Migration from LocalStorage
  isMigrationModalOpen: boolean;
  setIsMigrationModalOpen: (open: boolean) => void;
  migrationStatus: MigrationStatus | null;
  performMigration: (onProgress?: (step: string, percent: number) => void) => Promise<{ success: boolean; error?: string }>;

  // User Profile & Onboarding
  userProfile: UserProfile | null;
  isOnboardingComplete: boolean;
  saveUserProfile: (profile: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'> | UserProfile) => Promise<{ success: boolean; error?: string; profile?: UserProfile; warning?: string }>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean; error?: string; profile?: UserProfile; warning?: string }>;
  resetProfile: () => void;
  isEditProfileModalOpen: boolean;
  setIsEditProfileModalOpen: (open: boolean) => void;

  // Navigation & View
  currentTab: NavigationTab;
  selectedSessionId: string | null;
  setSelectedSessionId: (id: string | null) => void;
  selectedChallengeId: string | null;
  selectedArtworkId: string | null;
  selectedInsightId: string | null;
  navigateTo: (tab: NavigationTab, params?: { sessionId?: string; challengeId?: string; artworkId?: string; insightId?: string }) => void;

  // Session State & Actions
  sessions: Session[];
  activeSession: Session | null;
  currentElapsedMs: number;
  completedSessionForModal: Session | null;
  setCompletedSessionForModal: (session: Session | null) => void;
  isFinishConfirmModalOpen: boolean;
  setIsFinishConfirmModalOpen: (open: boolean) => void;
  requestFinishSession: () => void;
  cancelFinishSession: () => void;
  confirmFinishSession: () => Session | null;
  startSession: (params: {
    title?: string;
    topics: string[];
    goal?: string;
    sessionType?: SessionType;
    timeLimit?: number;
  }) => Session;
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
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(null);
  const [selectedArtworkId, setSelectedArtworkId] = useState<string | null>(null);
  const [selectedInsightId, setSelectedInsightId] = useState<string | null>(null);

  // Supabase Auth State
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authSession, setAuthSession] = useState<SupabaseAuthSession | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<CloudSyncStatus>('local');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Migration State
  const [isMigrationModalOpen, setIsMigrationModalOpen] = useState<boolean>(false);
  const [migrationStatus, setMigrationStatus] = useState<MigrationStatus | null>(null);

  // Entities State (Synchronized between Supabase and local cache)
  const [sessions, setSessions] = useState<Session[]>(() => loadStoredSessions());
  const [activeSession, setActiveSession] = useState<Session | null>(() => loadStoredActiveSession());
  const [challenges, setChallenges] = useState<Challenge[]>(() => loadStoredChallenges());
  const [artworks, setArtworks] = useState<Artwork[]>(() => loadStoredArtworks());
  const [insights, setInsights] = useState<Insight[]>(() => loadStoredInsights());
  const [achievements, setAchievements] = useState<Achievement[]>(() => loadStoredAchievements());
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => loadStoredUserProfile());

  // Modal / Flow State
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState<boolean>(false);
  const [isNewSessionModalOpen, setIsNewSessionModalOpen] = useState<boolean>(false);
  const [isFinishConfirmModalOpen, setIsFinishConfirmModalOpen] = useState<boolean>(false);
  const [isArtworkModalOpen, setIsArtworkModalOpen] = useState<boolean>(false);
  const [artworkModalPrefill, setArtworkModalPrefill] = useState<Partial<Artwork> | null>(null);
  const [completedSessionForModal, setCompletedSessionForModal] = useState<Session | null>(null);

  // Live Timer State
  const [currentElapsedMs, setCurrentElapsedMs] = useState<number>(0);
  const [recentlyUnlockedAchievement, setRecentlyUnlockedAchievement] = useState<Achievement | null>(null);

  const isSupabaseActive = isSupabaseConfigured();

  // --------------------------------------------------------------------------
  // AUTHENTICATION & INITIAL CLOUD SYNC
  // --------------------------------------------------------------------------

  // Sync state from remote database on authentication
  const loadRemoteDataForUser = useCallback(async (user: User) => {
    setCloudSyncStatus('syncing');
    try {
      // 1. Fetch remote user profile
      const remoteProfile = await getRemoteUserProfile(user.id);
      if (remoteProfile) {
        setUserProfile(remoteProfile);
        saveStoredUserProfile(remoteProfile);
      } else {
        // If no remote profile exists in Supabase yet, check if there is an existing local profile to migrate
        const localProfile = loadStoredUserProfile();
        if (localProfile && localProfile.name && localProfile.name.trim().length > 0) {
          try {
            const migrated = await upsertRemoteUserProfile(user.id, {
              ...localProfile,
              id: user.id
            });
            if (migrated) {
              setUserProfile(migrated);
              saveStoredUserProfile(migrated);
            }
          } catch (e) {
            console.warn('Could not auto-migrate local profile to Supabase:', e);
          }
        }
      }

      // 2. Fetch remote sessions
      const remoteSessions = await getRemoteSessions(user.id);
      if (remoteSessions.length > 0) {
        setSessions(remoteSessions);
      }

      // 3. Fetch remote challenges
      const remoteChallenges = await getRemoteChallenges(user.id);
      if (remoteChallenges.length > 0) {
        setChallenges(remoteChallenges);
      }

      // 4. Fetch remote artworks
      const remoteArtworks = await getRemoteArtworks(user.id);
      if (remoteArtworks.length > 0) {
        setArtworks(remoteArtworks);
      }

      // 5. Fetch remote insights
      const remoteInsights = await getRemoteInsights(user.id);
      if (remoteInsights.length > 0) {
        setInsights(remoteInsights);
      }

      // 6. Fetch remote achievements
      const baseAch = loadStoredAchievements();
      const remoteAchievements = await getRemoteAchievements(user.id, baseAch);
      setAchievements(remoteAchievements);

      setCloudSyncStatus('synced');

      // Check if user is newly registered and has local data to migrate
      const isRemoteEmpty =
        !remoteProfile &&
        remoteSessions.length === 0 &&
        remoteArtworks.length === 0 &&
        remoteChallenges.length === 0;

      if (isRemoteEmpty) {
        const localStatus = checkLocalDataToMigrate();
        if (localStatus.hasLocalData) {
          setMigrationStatus(localStatus);
          setIsMigrationModalOpen(true);
        }
      }
    } catch (err) {
      console.warn('Error fetching remote data from Supabase:', err);
      setCloudSyncStatus('offline');
    }
  }, []);

  // Initialize Supabase Auth state listener
  useEffect(() => {
    if (!isSupabaseActive || !supabase) {
      setIsAuthLoading(false);
      setCloudSyncStatus('local');
      return;
    }

    // Get current session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.warn('Supabase getSession error:', error);
      }
      setAuthSession(session);
      setAuthUser(session?.user || null);
      setIsAuthLoading(false);

      if (session?.user) {
        loadRemoteDataForUser(session.user);
      } else {
        setCloudSyncStatus('local');
      }
    });

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setAuthSession(session);
      setAuthUser(session?.user || null);

      if (session?.user) {
        loadRemoteDataForUser(session.user);
      } else {
        setCloudSyncStatus('local');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isSupabaseActive, loadRemoteDataForUser]);

  // Auth Operations
  const signIn = useCallback(async (email: string, password: string): Promise<{ error?: string }> => {
    if (!isSupabaseConfigured() || !supabase) {
      return { error: 'Supabase is not configured yet. Please check your project settings.' };
    }
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };
      return {};
    } catch (err: any) {
      return { error: err?.message || 'Failed to sign in' };
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, name: string): Promise<{ error?: string }> => {
    if (!isSupabaseConfigured() || !supabase) {
      return { error: 'Supabase is not configured yet. Please check your project settings.' };
    }
    try {
      const trimmedName = name.trim();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name: trimmedName }
        }
      });
      if (error) return { error: error.message };

      if (data.user) {
        // Build initial profile incorporating any existing local responses or defaults
        const existingLocal = userProfile || loadStoredUserProfile();
        const initialProfile: UserProfile = {
          id: data.user.id,
          name: trimmedName,
          drawingExperience: existingLocal?.drawingExperience || '3–5 years',
          customExperience: existingLocal?.customExperience,
          goals: existingLocal?.goals && existingLocal.goals.length > 0
            ? existingLocal.goals
            : ['Improve anatomy', 'Develop my own style', 'Draw more consistently'],
          customGoals: existingLocal?.customGoals || [],
          createdAt: Date.now(),
          updatedAt: Date.now()
        };

        try {
          const saved = await upsertRemoteUserProfile(data.user.id, initialProfile);
          if (saved) {
            setUserProfile(saved);
            saveStoredUserProfile(saved);
          }
        } catch (profileErr) {
          console.error('Error creating profile row in Supabase during signUp:', profileErr);
        }
      }
      return {};
    } catch (err: any) {
      return { error: err?.message || 'Failed to sign up' };
    }
  }, [userProfile]);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setAuthUser(null);
    setAuthSession(null);
    setUserProfile(null);
    setCloudSyncStatus('local');
  }, []);

  // One-time LocalStorage Migration
  const performMigration = useCallback(async (
    onProgress?: (step: string, percent: number) => void
  ): Promise<{ success: boolean; error?: string }> => {
    if (!authUser) {
      return { success: false, error: 'User is not authenticated' };
    }

    const res = await migrateLocalDataToSupabase(authUser.id, onProgress);
    if (res.success) {
      // Reload cloud data
      await loadRemoteDataForUser(authUser);
    }
    return res;
  }, [authUser, loadRemoteDataForUser]);

  // Keep local cache up-to-date for fast offline access
  useEffect(() => {
    saveStoredUserProfile(userProfile);
  }, [userProfile]);

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

  // Computed Real Stats
  const totalDrawingTimeMs = useMemo(() => {
    return sessions
      .filter(s => isSessionFinished(s.status))
      .reduce((acc, s) => acc + (s.duration || 0), 0);
  }, [sessions]);

  const totalCompletedSessionsCount = useMemo(() => {
    return sessions.filter(s => isSessionFinished(s.status)).length;
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

    // From completed and expired sessions
    sessions.filter(s => isSessionFinished(s.status)).forEach(s => {
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

  // Trigger achievement evaluation & sync to Supabase
  const triggerAchievementCheck = useCallback((
    currentSessions: Session[],
    currentArtworks: Artwork[],
    currentChallenges: Challenge[]
  ) => {
    const totalTime = currentSessions
      .filter(s => isSessionFinished(s.status))
      .reduce((sum, s) => sum + (s.duration || 0), 0);

    setAchievements(prev => {
      const { updatedAchievements, newlyUnlocked } = evaluateAchievements(prev, {
        sessions: currentSessions,
        artworks: currentArtworks,
        challenges: currentChallenges,
        totalDrawingTimeMs: totalTime
      });

      if (newlyUnlocked.length > 0) {
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
          // ignore
        }
      }

      // Sync achievements to Supabase if authenticated
      if (authUser) {
        upsertRemoteAchievements(authUser.id, updatedAchievements);
      }

      return updatedAchievements;
    });
  }, [authUser]);

  const dismissAchievementToast = useCallback(() => {
    setRecentlyUnlockedAchievement(null);
  }, []);

  // Navigation Function
  const navigateTo = useCallback((tab: NavigationTab, params?: { sessionId?: string; challengeId?: string; artworkId?: string; insightId?: string }) => {
    setCurrentTab(tab);
    if (params?.sessionId !== undefined) setSelectedSessionId(params.sessionId);
    if (params?.challengeId !== undefined) setSelectedChallengeId(params.challengeId);
    if (params?.artworkId !== undefined) setSelectedArtworkId(params.artworkId);
    if (params?.insightId !== undefined) setSelectedInsightId(params.insightId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Handler when a timed session reaches 00:00 (strict hard deadline)
  const expireTimedSession = useCallback((targetSession: Session) => {
    setIsFinishConfirmModalOpen(false);
    const now = Date.now();
    const finalDuration = targetSession.timeLimit || getElapsedSessionTime(targetSession, now);

    const expiredSession: Session = {
      ...targetSession,
      status: 'expired',
      completedAt: now,
      duration: finalDuration,
      updatedAt: now
    };

    setSessions(prev => {
      const next = [expiredSession, ...prev.filter(s => s.id !== expiredSession.id)];
      // Check achievements
      triggerAchievementCheck(next, artworks, challenges);
      return next;
    });

    setActiveSession(null);
    setCurrentElapsedMs(0);
    setCompletedSessionForModal(expiredSession);

    if (authUser) {
      upsertRemoteSession(authUser.id, expiredSession);
    }
  }, [artworks, challenges, authUser, triggerAchievementCheck]);

  // Live Timer loop with strict timestamp evaluation
  useEffect(() => {
    if (!activeSession) {
      setCurrentElapsedMs(0);
      return;
    }

    const updateTimer = () => {
      const now = Date.now();

      // Check if timed session reached its hard expiration time
      if (activeSession.sessionType === 'timed') {
        const expiresAt = activeSession.expiresAt || (activeSession.startedAt + (activeSession.timeLimit || 0));
        if (now >= expiresAt) {
          expireTimedSession(activeSession);
          return;
        }
      }

      const elapsed = getElapsedSessionTime(activeSession, now);
      setCurrentElapsedMs(elapsed);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 250);
    return () => clearInterval(interval);
  }, [activeSession, expireTimedSession]);

  // --------------------------------------------------------------------------
  // SESSIONS HANDLERS
  // --------------------------------------------------------------------------
  const startSession = useCallback((params: {
    title?: string;
    topics: string[];
    goal?: string;
    sessionType?: SessionType;
    timeLimit?: number;
  }): Session => {
    const now = Date.now();
    const sessionType: SessionType = params.sessionType || 'free';
    const timeLimit = sessionType === 'timed' ? (params.timeLimit || 30 * 60 * 1000) : undefined;
    const expiresAt = sessionType === 'timed' && timeLimit ? (now + timeLimit) : undefined;

    const newSession: Session = {
      id: `session-${now}-${Math.random().toString(36).substring(2, 7)}`,
      title: params.title?.trim() || undefined,
      topics: params.topics.length > 0 ? params.topics : ['General Practice'],
      goal: params.goal?.trim() || undefined,
      sessionType,
      timeLimit,
      expiresAt,
      status: 'active',
      startedAt: now,
      totalPausedDuration: 0,
      duration: 0,
      createdAt: now,
      updatedAt: now
    };

    setActiveSession(newSession);
    setSelectedSessionId(newSession.id);
    saveStoredActiveSession(newSession);
    setCurrentElapsedMs(0);
    setIsNewSessionModalOpen(false);
    return newSession;
  }, []);

  const pauseSession = useCallback(() => {
    if (!activeSession || activeSession.status !== 'active') return;
    // Timed sessions cannot be paused to prevent bypassing the strict time limit
    if (activeSession.sessionType === 'timed') return;

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
    if (activeSession.sessionType === 'timed') return;

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
    let finalDuration = getElapsedSessionTime(activeSession, now);
    let status: 'completed' | 'expired' = 'completed';

    if (activeSession.sessionType === 'timed' && activeSession.timeLimit) {
      if (now >= (activeSession.expiresAt || (activeSession.startedAt + activeSession.timeLimit))) {
        finalDuration = activeSession.timeLimit;
        status = 'expired';
      } else {
        finalDuration = Math.min(finalDuration, activeSession.timeLimit);
      }
    }

    const completedSession: Session = {
      ...activeSession,
      status,
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

    // Sync to Supabase
    if (authUser) {
      upsertRemoteSession(authUser.id, completedSession);
    }

    // Check achievements
    triggerAchievementCheck(newSessions, artworks, challenges);

    return completedSession;
  }, [activeSession, sessions, artworks, challenges, authUser, triggerAchievementCheck]);

  const requestFinishSession = useCallback(() => {
    if (!activeSession) return;
    setIsFinishConfirmModalOpen(true);
  }, [activeSession]);

  const cancelFinishSession = useCallback(() => {
    setIsFinishConfirmModalOpen(false);
  }, []);

  const confirmFinishSession = useCallback((): Session | null => {
    setIsFinishConfirmModalOpen(false);
    return finishSession();
  }, [finishSession]);

  const deleteSession = useCallback((id: string) => {
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    if (activeSession?.id === id) {
      setActiveSession(null);
      setCurrentElapsedMs(0);
    }
    if (authUser) {
      deleteRemoteSession(authUser.id, id);
    }
  }, [sessions, activeSession, authUser]);

  // --------------------------------------------------------------------------
  // CHALLENGES HANDLERS
  // --------------------------------------------------------------------------
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

    if (authUser) {
      upsertRemoteChallenge(authUser.id, newChallenge);
    }

    return newChallenge;
  }, [challenges, authUser]);

  const updateChallenge = useCallback((id: string, updates: Partial<Challenge>) => {
    setChallenges(prev => {
      const next = prev.map(c => {
        if (c.id !== id) return c;
        const updated = { ...c, ...updates, updatedAt: Date.now() };
        if (authUser) {
          upsertRemoteChallenge(authUser.id, updated);
        }
        return updated;
      });
      triggerAchievementCheck(sessions, artworks, next);
      return next;
    });
  }, [sessions, artworks, authUser, triggerAchievementCheck]);

  const deleteChallenge = useCallback((id: string) => {
    setChallenges(prev => prev.filter(c => c.id !== id));
    if (selectedChallengeId === id) {
      setSelectedChallengeId(null);
      setCurrentTab('challenges');
    }
    if (authUser) {
      deleteRemoteChallenge(authUser.id, id);
    }
  }, [selectedChallengeId, authUser]);

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

        const updatedChallenge: Challenge = {
          ...ch,
          tasks: updatedTasks,
          status: newStatus,
          completedAt,
          updatedAt: Date.now()
        };

        if (authUser) {
          upsertRemoteChallenge(authUser.id, updatedChallenge);
        }

        return updatedChallenge;
      });

      triggerAchievementCheck(sessions, artworks, next);
      return next;
    });
  }, [sessions, artworks, authUser, triggerAchievementCheck]);

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
      const updated: Challenge = {
        ...ch,
        tasks,
        status: ch.status === 'completed' ? 'active' : ch.status,
        updatedAt: now
      };
      if (authUser) {
        upsertRemoteChallenge(authUser.id, updated);
      }
      return updated;
    }));
  }, [authUser]);

  const updateChallengeTask = useCallback((challengeId: string, taskId: string, updates: Partial<ChallengeTask>) => {
    setChallenges(prev => prev.map(ch => {
      if (ch.id !== challengeId) return ch;
      const updated: Challenge = {
        ...ch,
        tasks: ch.tasks.map(t => (t.id === taskId ? { ...t, ...updates } : t)),
        updatedAt: Date.now()
      };
      if (authUser) {
        upsertRemoteChallenge(authUser.id, updated);
      }
      return updated;
    }));
  }, [authUser]);

  const deleteChallengeTask = useCallback((challengeId: string, taskId: string) => {
    setChallenges(prev => prev.map(ch => {
      if (ch.id !== challengeId) return ch;
      const remainingTasks = ch.tasks.filter(t => t.id !== taskId);
      const allDone = remainingTasks.length > 0 && remainingTasks.every(t => t.completed);
      const updated: Challenge = {
        ...ch,
        tasks: remainingTasks,
        status: allDone ? 'completed' : ch.status,
        updatedAt: Date.now()
      };
      if (authUser) {
        upsertRemoteChallenge(authUser.id, updated);
      }
      return updated;
    }));
  }, [authUser]);

  // --------------------------------------------------------------------------
  // ARTWORKS HANDLERS
  // --------------------------------------------------------------------------
  const saveArtwork = useCallback(async (
    data: Omit<Artwork, 'id' | 'createdAt' | 'updatedAt' | 'imageId'>,
    imageSource: Blob | File | string
  ): Promise<Artwork> => {
    const now = Date.now();
    const artworkId = `art-${now}-${Math.random().toString(36).substring(2, 7)}`;
    const imageId = `img-${artworkId}`;

    // 1. Cache in local IndexedDB for instant UI responsiveness
    await saveArtworkImage(imageId, imageSource);

    let finalImageUrl = imageId;
    let storagePath: string | undefined;

    // 2. Upload to Supabase Storage if authenticated
    if (authUser) {
      const storageResult = await uploadArtworkToStorage(authUser.id, artworkId, imageSource);
      if (storageResult) {
        finalImageUrl = storageResult.signedUrl || storageResult.publicUrl;
        storagePath = storageResult.storagePath;
      }
    }

    const newArtwork: Artwork = {
      ...data,
      id: artworkId,
      imageId: finalImageUrl,
      storagePath,
      title: data.title.trim() || 'Untitled Artwork',
      topics: data.topics.length > 0 ? data.topics : ['General Study'],
      createdAt: now,
      updatedAt: now
    };

    const next = [newArtwork, ...artworks];
    setArtworks(next);

    // 3. Save to Supabase PostgreSQL
    if (authUser) {
      await upsertRemoteArtwork(authUser.id, newArtwork, storagePath);
    }

    triggerAchievementCheck(sessions, next, challenges);
    return newArtwork;
  }, [artworks, sessions, challenges, authUser, triggerAchievementCheck]);

  const updateArtwork = useCallback(async (
    id: string,
    updates: Partial<Omit<Artwork, 'id' | 'createdAt' | 'updatedAt' | 'imageId'>>,
    newImageSource?: Blob | File | string
  ): Promise<void> => {
    const existing = artworks.find(a => a.id === id);
    if (!existing) return;

    let finalImageUrl = existing.imageId;
    let storagePath: string | undefined = existing.storagePath;

    if (newImageSource) {
      await saveArtworkImage(existing.id, newImageSource);
      if (authUser) {
        const storageResult = await uploadArtworkToStorage(authUser.id, id, newImageSource);
        if (storageResult) {
          finalImageUrl = storageResult.signedUrl || storageResult.publicUrl;
          storagePath = storageResult.storagePath;
        }
      }
    }

    const updatedArtworks = artworks.map(a => {
      if (a.id !== id) return a;
      return {
        ...a,
        ...updates,
        imageId: finalImageUrl,
        storagePath,
        updatedAt: Date.now()
      };
    });

    setArtworks(updatedArtworks);

    const target = updatedArtworks.find(a => a.id === id);
    if (target && authUser) {
      await upsertRemoteArtwork(authUser.id, target, storagePath);
    }

    triggerAchievementCheck(sessions, updatedArtworks, challenges);
  }, [artworks, sessions, challenges, authUser, triggerAchievementCheck]);

  const deleteArtwork = useCallback(async (id: string): Promise<void> => {
    const existing = artworks.find(a => a.id === id);
    if (existing) {
      await deleteArtworkImage(existing.imageId);
    }
    setArtworks(prev => prev.filter(a => a.id !== id));
    if (selectedArtworkId === id) {
      setSelectedArtworkId(null);
    }
    if (authUser) {
      await deleteRemoteArtwork(authUser.id, id);
    }
  }, [artworks, selectedArtworkId, authUser]);

  // --------------------------------------------------------------------------
  // INSIGHTS HANDLERS
  // --------------------------------------------------------------------------
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

    if (authUser) {
      upsertRemoteInsight(authUser.id, newInsight);
    }

    return newInsight;
  }, [authUser]);

  const updateInsight = useCallback((id: string, updates: Partial<Insight>) => {
    setInsights(prev => prev.map(ins => {
      if (ins.id !== id) return ins;
      const updated = { ...ins, ...updates, updatedAt: Date.now() };
      if (authUser) {
        upsertRemoteInsight(authUser.id, updated);
      }
      return updated;
    }));
  }, [authUser]);

  const deleteInsight = useCallback((id: string) => {
    setInsights(prev => prev.filter(ins => ins.id !== id));
    if (selectedInsightId === id) {
      setSelectedInsightId(null);
    }
    if (authUser) {
      deleteRemoteInsight(authUser.id, id);
    }
  }, [selectedInsightId, authUser]);

  // --------------------------------------------------------------------------
  // USER PROFILE HANDLERS
  // --------------------------------------------------------------------------
  const saveUserProfile = useCallback(async (
    profileData: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'> | UserProfile
  ): Promise<{ success: boolean; error?: string; profile?: UserProfile; warning?: string }> => {
    const now = Date.now();
    const isFull = 'id' in profileData && profileData.id;
    const currentUserId = authUser ? authUser.id : (isFull ? profileData.id : `profile-${now}-${Math.random().toString(36).substring(2, 7)}`);

    const finalProfile: UserProfile = {
      id: currentUserId,
      name: profileData.name.trim(),
      drawingExperience: profileData.drawingExperience || '3–5 years',
      customExperience: profileData.customExperience?.trim() || undefined,
      goals: profileData.goals || [],
      customGoals: profileData.customGoals || [],
      createdAt: isFull ? profileData.createdAt : now,
      updatedAt: now
    };

    // Always update local state immediately so user is never blocked
    setUserProfile(finalProfile);
    saveStoredUserProfile(finalProfile);

    if (authUser) {
      try {
        const remoteSaved = await upsertRemoteUserProfile(authUser.id, finalProfile);
        if (remoteSaved) {
          setUserProfile(remoteSaved);
          saveStoredUserProfile(remoteSaved);
          return { success: true, profile: remoteSaved };
        }
      } catch (err: any) {
        console.warn('Supabase remote profile sync note:', err?.message || err);
        return {
          success: true,
          profile: finalProfile,
          warning: err?.message || 'Profile saved locally. Cloud sync pending database schema setup.'
        };
      }
    }

    return { success: true, profile: finalProfile };
  }, [authUser]);

  const updateUserProfile = useCallback(async (
    updates: Partial<UserProfile>
  ): Promise<{ success: boolean; error?: string; profile?: UserProfile; warning?: string }> => {
    if (!userProfile) {
      return { success: false, error: 'No active profile found to update.' };
    }
    const updated: UserProfile = {
      ...userProfile,
      ...updates,
      name: updates.name !== undefined ? updates.name.trim() : userProfile.name,
      updatedAt: Date.now()
    };

    // Always update local state immediately
    setUserProfile(updated);
    saveStoredUserProfile(updated);

    if (authUser) {
      try {
        const remoteSaved = await upsertRemoteUserProfile(authUser.id, updated);
        if (remoteSaved) {
          setUserProfile(remoteSaved);
          saveStoredUserProfile(remoteSaved);
          return { success: true, profile: remoteSaved };
        }
      } catch (err: any) {
        console.warn('Supabase profile update sync note:', err?.message || err);
        return {
          success: true,
          profile: updated,
          warning: err?.message || 'Profile updated locally. Cloud sync pending database schema setup.'
        };
      }
    }

    return { success: true, profile: updated };
  }, [authUser, userProfile]);

  const resetProfile = useCallback(() => {
    setUserProfile(null);
  }, []);

  const isOnboardingComplete = useMemo(() => {
    return Boolean(userProfile && userProfile.name && userProfile.name.trim().length > 0);
  }, [userProfile]);

  const value = useMemo<AppContextType>(() => ({
    // Auth & Cloud Sync
    authUser,
    authSession,
    isAuthLoading,
    isSupabaseActive,
    cloudSyncStatus,
    isAuthModalOpen,
    setIsAuthModalOpen,
    signIn,
    signUp,
    signOut,

    // LocalStorage Migration
    isMigrationModalOpen,
    setIsMigrationModalOpen,
    migrationStatus,
    performMigration,

    // User Profile
    userProfile,
    isOnboardingComplete,
    saveUserProfile,
    updateUserProfile,
    resetProfile,
    isEditProfileModalOpen,
    setIsEditProfileModalOpen,

    currentTab,
    selectedSessionId,
    setSelectedSessionId,
    selectedChallengeId,
    selectedArtworkId,
    selectedInsightId,
    navigateTo,

    sessions,
    activeSession,
    currentElapsedMs,
    completedSessionForModal,
    setCompletedSessionForModal,
    isFinishConfirmModalOpen,
    setIsFinishConfirmModalOpen,
    requestFinishSession,
    cancelFinishSession,
    confirmFinishSession,
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
    authUser,
    authSession,
    isAuthLoading,
    isSupabaseActive,
    cloudSyncStatus,
    isAuthModalOpen,
    signIn,
    signUp,
    signOut,
    isMigrationModalOpen,
    migrationStatus,
    performMigration,
    userProfile,
    isOnboardingComplete,
    saveUserProfile,
    updateUserProfile,
    resetProfile,
    isEditProfileModalOpen,
    currentTab,
    selectedSessionId,
    selectedChallengeId,
    selectedArtworkId,
    selectedInsightId,
    navigateTo,
    sessions,
    activeSession,
    currentElapsedMs,
    completedSessionForModal,
    setCompletedSessionForModal,
    isFinishConfirmModalOpen,
    setIsFinishConfirmModalOpen,
    requestFinishSession,
    cancelFinishSession,
    confirmFinishSession,
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
