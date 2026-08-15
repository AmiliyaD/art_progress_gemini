import React, { useMemo } from 'react';
import {
  PlayCircle,
  Clock,
  Flame,
  Trophy,
  Palette,
  BookOpen,
  Award,
  Plus,
  ArrowRight,
  Sparkles,
  Calendar,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ActiveSessionCard } from '../session/ActiveSessionCard';
import { ActivityGraph } from './ActivityGraph';
import { ChallengeCard } from '../challenges/ChallengeCard';
import { ArtworkCard } from '../artwork/ArtworkCard';
import { InsightCard } from '../insights/InsightCard';
import { formatShortDuration, formatDate } from '../../lib/time-utils';

export const DashboardView: React.FC = () => {
  const {
    activeSession,
    sessions,
    challenges,
    artworks,
    insights,
    achievements,
    totalDrawingTimeMs,
    totalCompletedSessionsCount,
    drawingStreak,
    navigateTo,
    setIsNewSessionModalOpen,
    setIsArtworkModalOpen,
    setArtworkModalPrefill,
    saveInsight
  } = useApp();

  // Active challenges list (max 3 for dashboard)
  const activeChallenges = useMemo(() => {
    return challenges.filter(c => c.status === 'active').slice(0, 3);
  }, [challenges]);

  // Recent artworks (max 4)
  const recentArtworks = useMemo(() => {
    return artworks.slice(0, 4);
  }, [artworks]);

  // Latest insight (1)
  const latestInsight = useMemo(() => {
    return insights.length > 0 ? insights[0] : null;
  }, [insights]);

  // Recently unlocked achievements (unlocked only)
  const recentUnlockedAchievements = useMemo(() => {
    return achievements
      .filter(a => a.unlocked && a.unlockedAt)
      .sort((a, b) => (b.unlockedAt || 0) - (a.unlockedAt || 0))
      .slice(0, 3);
  }, [achievements]);

  return (
    <div id="dashboard-view-page" className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* 1. CURRENT SESSION SECTION */}
      <section id="dashboard-session-section">
        {activeSession ? (
          <ActiveSessionCard />
        ) : (
          <div
            id="dashboard-no-active-session"
            className="p-6 md:p-8 rounded-2xl bg-[#14151a] border border-[#22242a] flex flex-col md:flex-row items-center justify-between gap-6"
          >
            <div className="space-y-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-bold uppercase tracking-widest text-zinc-400">
                <span className="w-2 h-2 rounded-full bg-zinc-600" />
                <span>No active session</span>
              </div>
              <h2 className="text-xl font-bold text-zinc-100">Ready for today's drawing practice?</h2>
              <p className="text-xs text-zinc-400 max-w-md">
                Launch a live timer to record your drawing time, specify practice topics, and track artistic discipline.
              </p>
            </div>

            <button
              id="dashboard-start-session-btn"
              onClick={() => setIsNewSessionModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-black font-bold text-sm transition-all shadow-lg shadow-amber-500/15 cursor-pointer shrink-0"
            >
              <PlayCircle className="w-4 h-4 fill-black stroke-none" />
              <span>Start new session</span>
            </button>
          </div>
        )}
      </section>

      {/* 2. REAL METRIC TILES */}
      <section id="dashboard-metrics-grid" className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Drawing Time */}
        <div className="p-5 rounded-2xl bg-[#14151a] border border-[#22242a] space-y-1.5">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Drawing Time</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="font-mono text-2xl md:text-3xl font-black text-zinc-100">
            {formatShortDuration(totalDrawingTimeMs)}
          </div>
          <span className="text-[11px] text-zinc-400 block font-medium">
            Accurate drawing logs
          </span>
        </div>

        {/* Total Sessions */}
        <div className="p-5 rounded-2xl bg-[#14151a] border border-[#22242a] space-y-1.5">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Sessions</span>
            <PlayCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="font-mono text-2xl md:text-3xl font-black text-zinc-100">
            {totalCompletedSessionsCount} <span className="text-sm font-sans font-normal text-zinc-400">{totalCompletedSessionsCount === 1 ? 'session' : 'sessions'}</span>
          </div>
          <span className="text-[11px] text-zinc-400 block font-medium">
            Completed in studio
          </span>
        </div>

        {/* Current Streak */}
        <div className="p-5 rounded-2xl bg-[#14151a] border border-[#22242a] space-y-1.5">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-bold uppercase tracking-wider">Current Streak</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="font-mono text-2xl md:text-3xl font-black text-amber-400 flex items-center gap-1.5">
            <span>{drawingStreak}</span>
            <span className="text-sm font-sans font-normal text-zinc-400">{drawingStreak === 1 ? 'day' : 'days'}</span>
          </div>
          <span className="text-[11px] text-zinc-400 block font-medium">
            Consecutive practice
          </span>
        </div>

        {/* Total Artworks */}
        <div className="p-5 rounded-2xl bg-[#14151a] border border-[#22242a] space-y-1.5">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-bold uppercase tracking-wider">Archived Artworks</span>
            <Palette className="w-4 h-4 text-amber-500" />
          </div>
          <div className="font-mono text-2xl md:text-3xl font-black text-zinc-100">
            {artworks.length} <span className="text-sm font-sans font-normal text-zinc-400">{artworks.length === 1 ? 'piece' : 'pieces'}</span>
          </div>
          <span className="text-[11px] text-zinc-400 block font-medium">
            Saved studies & works
          </span>
        </div>
      </section>

      {/* 3. ACTIVITY GRAPH TIMELINE */}
      <section id="dashboard-activity-section">
        <ActivityGraph sessions={sessions} />
      </section>

      {/* 4. ACTIVE CHALLENGES & RECENT ACHIEVEMENTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Challenges (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#22242a]">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <h3 className="text-base font-bold text-zinc-100">
                Active Challenges
              </h3>
            </div>
            <button
              onClick={() => navigateTo('challenges')}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>View All Challenges</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {activeChallenges.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-[#14151a] border border-[#22242a] space-y-3">
              <p className="text-sm font-bold text-zinc-300">No active challenges.</p>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Create a drawing challenge to guide your daily practice and test your artistic endurance.
              </p>
              <button
                onClick={() => navigateTo('challenges')}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all cursor-pointer"
              >
                Explore Challenges
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeChallenges.map(challenge => (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  onClick={() => navigateTo('challenges', { challengeId: challenge.id })}
                />
              ))}
            </div>
          )}
        </div>

        {/* Recent Achievements (1 col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#22242a]">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <h3 className="text-base font-bold text-zinc-100">
                Recent Achievements
              </h3>
            </div>
            <button
              onClick={() => navigateTo('achievements')}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>All ({achievements.filter(a => a.unlocked).length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentUnlockedAchievements.length === 0 ? (
            <div className="p-6 text-center rounded-2xl bg-[#14151a] border border-[#22242a] space-y-2">
              <Award className="w-6 h-6 mx-auto text-zinc-600 mb-1" />
              <p className="text-xs font-bold text-zinc-300">No achievements unlocked yet.</p>
              <p className="text-[11px] text-zinc-400">
                Complete your first drawing session or challenge to unlock your first milestone.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentUnlockedAchievements.map(ach => (
                <div
                  key={ach.id}
                  onClick={() => navigateTo('achievements')}
                  className="p-4 rounded-xl bg-[#14151a] hover:bg-[#181a20] border border-amber-500/30 transition-all cursor-pointer flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black shrink-0 shadow-md shadow-amber-500/20 font-bold">
                    <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-zinc-100 truncate">{ach.title}</h4>
                    <p className="text-[11px] text-zinc-400 truncate">{ach.description}</p>
                    <span className="text-[10px] text-amber-400/80 font-mono block mt-0.5">
                      Unlocked {formatDate(ach.unlockedAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 5. RECENT ARTWORK & LATEST INSIGHT ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Artwork (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#22242a]">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-amber-500" />
              <h3 className="text-base font-bold text-zinc-100">
                Recent Artwork
              </h3>
            </div>
            <button
              onClick={() => navigateTo('artwork')}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>View Gallery</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentArtworks.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-[#14151a] border border-[#22242a] space-y-3">
              <Palette className="w-8 h-8 mx-auto text-zinc-600 mb-1" />
              <p className="text-sm font-bold text-zinc-300">No artworks yet.</p>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Upload your drawings or save sketches directly upon completing a drawing session.
              </p>
              <button
                onClick={() => {
                  setArtworkModalPrefill(null);
                  setIsArtworkModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all cursor-pointer"
              >
                Add artwork
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {recentArtworks.map(art => (
                <ArtworkCard
                  key={art.id}
                  artwork={art}
                  onOpen={() => navigateTo('artwork', { artworkId: art.id })}
                  onEdit={() => navigateTo('artwork', { artworkId: art.id })}
                  onDelete={() => navigateTo('artwork')}
                />
              ))}
            </div>
          )}
        </div>

        {/* Latest Insight (1 col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#22242a]">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-500" />
              <h3 className="text-base font-bold text-zinc-100">
                Latest Insight
              </h3>
            </div>
            <button
              onClick={() => navigateTo('insights')}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Journal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {!latestInsight ? (
            <div className="p-6 text-center rounded-2xl bg-[#14151a] border border-[#22242a] space-y-3">
              <BookOpen className="w-6 h-6 mx-auto text-zinc-600 mb-1" />
              <p className="text-xs font-bold text-zinc-300">No insights yet.</p>
              <p className="text-[11px] text-zinc-400">
                Record personal artistic realizations, anatomical tips, and technical learnings.
              </p>
              <button
                onClick={() => navigateTo('insights')}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all cursor-pointer"
              >
                Write an insight
              </button>
            </div>
          ) : (
            <InsightCard
              insight={latestInsight}
              onEdit={() => navigateTo('insights')}
              onDelete={() => navigateTo('insights')}
            />
          )}
        </div>
      </div>
    </div>
  );
};
