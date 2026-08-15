import React from 'react';
import { motion } from 'motion/react';
import {
  PlayCircle,
  Pause,
  CheckCircle2,
  Flame,
  Clock,
  Plus
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDuration, formatShortDuration } from '../../lib/time-utils';

export const Header: React.FC = () => {
  const {
    currentTab,
    activeSession,
    currentElapsedMs,
    pauseSession,
    resumeSession,
    finishSession,
    setIsNewSessionModalOpen,
    navigateTo,
    totalDrawingTimeMs,
    drawingStreak
  } = useApp();

  const getTitle = () => {
    switch (currentTab) {
      case 'dashboard':
        return 'Studio Dashboard';
      case 'session':
        return 'Drawing Session';
      case 'challenges':
        return 'Drawing Challenges';
      case 'artwork':
        return 'Artwork Archive';
      case 'insights':
        return 'Insights & Learning Journal';
      case 'achievements':
        return 'Achievements & Milestones';
      case 'topics':
        return 'Practice Topics Analytics';
      default:
        return 'Studio';
    }
  };

  return (
    <header
      id="studio-header"
      className="h-16 px-8 bg-[#121316]/80 backdrop-blur-md border-b border-[#22242a] flex items-center justify-between sticky top-0 z-20"
    >
      {/* Title & Path */}
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold text-zinc-100 tracking-tight">
          {getTitle()}
        </h1>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Real Stats Quick Overview */}
        <div className="hidden md:flex items-center gap-4 px-3.5 py-1.5 rounded-xl bg-[#181a1f] border border-[#22242a] text-xs">
          <div className="flex items-center gap-1.5 text-zinc-300">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-zinc-400">Total:</span>
            <span className="font-semibold text-zinc-200">{formatShortDuration(totalDrawingTimeMs)}</span>
          </div>
          <div className="w-[1px] h-3.5 bg-zinc-700/60" />
          <div className="flex items-center gap-1.5 text-zinc-300">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-zinc-400">Streak:</span>
            <span className="font-semibold text-amber-400">{drawingStreak} {drawingStreak === 1 ? 'day' : 'days'}</span>
          </div>
        </div>

        {/* Topbar Active Session Quick Controls if active */}
        {activeSession ? (
          <div className="flex items-center gap-2 bg-[#181a1f] border border-amber-500/30 rounded-xl p-1 px-3">
            <button
              onClick={() => navigateTo('session')}
              className="flex items-center gap-2 text-left cursor-pointer hover:opacity-80 transition-opacity"
              title="Open session view"
            >
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="font-mono text-xs font-bold text-amber-400">
                {formatDuration(currentElapsedMs)}
              </span>
            </button>

            <div className="w-[1px] h-4 bg-zinc-700 mx-1" />

            {activeSession.status === 'active' ? (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.12 }}
                id="header-pause-button"
                onClick={pauseSession}
                className="p-1.5 rounded-lg hover:bg-[#22242a] text-zinc-300 hover:text-amber-400 transition-colors cursor-pointer"
                title="Pause Session"
              >
                <Pause className="w-3.5 h-3.5" />
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.12 }}
                id="header-resume-button"
                onClick={resumeSession}
                className="p-1.5 rounded-lg hover:bg-[#22242a] text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
                title="Resume Session"
              >
                <PlayCircle className="w-3.5 h-3.5" />
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.12 }}
              id="header-finish-button"
              onClick={finishSession}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-400 hover:text-amber-300 text-xs font-semibold transition-colors cursor-pointer"
              title="Finish Session"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Finish</span>
            </motion.button>
          </div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.12 }}
            id="header-start-session-button"
            onClick={() => setIsNewSessionModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition-colors shadow-md shadow-amber-500/10 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>New Session</span>
          </motion.button>
        )}
      </div>
    </header>
  );
};
