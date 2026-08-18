import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Award,
  Trophy,
  PlayCircle,
  Flame,
  Clock,
  Hourglass,
  Compass,
  Crown,
  ShieldCheck,
  Target,
  Palette,
  Layers,
  Lock,
  CheckCircle2,
  Sparkles,
  Zap
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Achievement, AchievementCategory } from '../../types';
import { formatDate, formatShortDuration } from '../../lib/time-utils';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  PlayCircle,
  Flame,
  Zap,
  Clock,
  Hourglass,
  Compass,
  Crown,
  Award,
  ShieldCheck,
  Trophy,
  Target,
  Palette,
  Layers
};

export const AchievementsView: React.FC = () => {
  const { achievements, totalDrawingTimeMs, totalCompletedSessionsCount, artworks, challenges } = useApp();
  const [categoryFilter, setCategoryFilter] = useState<AchievementCategory | 'all'>('all');

  const unlockedCount = useMemo(() => {
    return achievements.filter(a => a.unlocked).length;
  }, [achievements]);

  const totalCount = achievements.length;
  const progressPercent = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  const filteredAchievements = useMemo(() => {
    return achievements.filter(a => {
      if (categoryFilter === 'all') return true;
      return a.category === categoryFilter;
    });
  }, [achievements, categoryFilter]);

  // Helper to format progress text for locked achievements using real data
  const getProgressDisplay = (ach: Achievement) => {
    if (ach.unlocked) return null;

    if (ach.category === 'time') {
      const currentHours = Math.floor(totalDrawingTimeMs / (1000 * 60 * 60));
      const targetHours = Math.floor(ach.targetValue / (1000 * 60 * 60));
      return `${formatShortDuration(totalDrawingTimeMs)} / ${targetHours}h`;
    }

    if (ach.category === 'session') {
      return `${totalCompletedSessionsCount} / ${ach.targetValue} completed`;
    }

    if (ach.category === 'challenge') {
      if (ach.id === 'ach-challenge-30days') {
        const has30 = challenges.some(c => c.status === 'completed' && (c.tasks?.length || 0) >= 30);
        return has30 ? 'Completed' : '0 / 1 completed (30-day challenge)';
      }
      const completedChallenges = challenges.filter(c => c.status === 'completed').length;
      return `${completedChallenges} / ${ach.targetValue} completed`;
    }

    if (ach.category === 'artwork') {
      return `${artworks.length} / ${ach.targetValue} saved`;
    }

    return null;
  };

  return (
    <div id="achievements-view-page" className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Header & Mastery Banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.48, delay: 0.04, ease: [0.16, 1, 0.3, 1] }}
        className="p-8 rounded-3xl bg-gradient-to-br from-[#181a20] via-[#14151a] to-[#101115] border border-[#22242a] relative overflow-hidden shadow-2xl space-y-6"
      >
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-amber-400">
              <Sparkles className="w-4 h-4" />
              <span>Studio Milestones</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-100 tracking-tight">
              Achievements & Mastery
            </h1>
            <p className="text-sm text-zinc-400 max-w-xl leading-relaxed">
              Earn real studio milestones as you complete drawing sessions, accumulate drawing hours, conquer challenges, and build your artwork archive.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#181a20] border border-[#282b35] text-center min-w-[180px] shrink-0">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1">
              Unlocked
            </span>
            <div className="flex items-center justify-center gap-1.5 font-mono text-3xl font-black text-amber-400">
              <span>{unlockedCount}</span>
              <span className="text-zinc-500 text-xl font-normal">/ {totalCount}</span>
            </div>
            <span className="text-xs text-zinc-400 block mt-1 font-mono">
              {progressPercent}% Complete
            </span>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="space-y-2 pt-2">
          <div className="w-full h-2.5 rounded-full bg-[#1e2028] overflow-hidden p-0.5 border border-[#282b35]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </motion.div>

      {/* Category Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.48, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center gap-1.5 p-1 rounded-xl bg-[#14151a] border border-[#22242a] w-full sm:w-auto overflow-x-auto"
      >
        {[
          { id: 'all', label: 'All Milestones' },
          { id: 'session', label: 'Sessions' },
          { id: 'time', label: 'Drawing Time' },
          { id: 'challenge', label: 'Challenges' },
          { id: 'artwork', label: 'Artworks' }
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setCategoryFilter(cat.id as AchievementCategory | 'all')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              categoryFilter === cat.id
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </motion.div>

      {/* Grid of Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.48, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        {filteredAchievements.map(ach => {
          const Icon = ICON_MAP[ach.icon] || Award;
          const progressDisplay = getProgressDisplay(ach);

          return (
            <div
              key={ach.id}
              id={`achievement-card-${ach.id}`}
              className={`p-6 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                ach.unlocked
                  ? 'bg-[#181a20] border-amber-500/30 shadow-lg shadow-amber-500/5'
                  : 'bg-[#14151a] border-[#22242a] opacity-80 hover:opacity-100'
              }`}
            >
              {/* Subtle gold glow if unlocked */}
              {ach.unlocked && (
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
              )}

              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                      ach.unlocked
                        ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-black shadow-md shadow-amber-500/20'
                        : 'bg-[#1e2026] text-zinc-500 border border-[#2a2d36]'
                    }`}
                  >
                    <Icon className="w-6 h-6 stroke-[2]" />
                  </div>

                  {ach.unlocked ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />
                      <span>Unlocked</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-[#1e2028] border border-[#282b35] text-zinc-400 text-[11px] font-medium flex items-center gap-1">
                      <Lock className="w-3 h-3 text-zinc-400" />
                      <span>Locked</span>
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <h3 className={`text-base font-bold ${ach.unlocked ? 'text-zinc-100' : 'text-zinc-300'}`}>
                    {ach.title}
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {ach.description}
                  </p>
                </div>
              </div>

              {/* Progress or Unlock Date footer */}
              <div className="pt-4 mt-4 border-t border-[#20222a] text-xs">
                {ach.unlocked ? (
                  <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                    <span>Unlocked on</span>
                    <span className="font-medium text-amber-400/90">{formatDate(ach.unlockedAt)}</span>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-400">Real Progress</span>
                      <span className="font-mono text-zinc-300 font-semibold">{progressDisplay}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
};
