import React from 'react';
import { motion } from 'motion/react';
import {
  PlayCircle,
  Pause,
  CheckCircle2,
  Clock,
  Target,
  Timer,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  formatDuration,
  formatDateTime,
  formatShortDuration,
  getRemainingSessionTime
} from '../../lib/time-utils';

interface ActiveSessionCardProps {
  compact?: boolean;
}

export const ActiveSessionCard: React.FC<ActiveSessionCardProps> = ({ compact = false }) => {
  const {
    activeSession,
    currentElapsedMs,
    pauseSession,
    resumeSession,
    requestFinishSession
  } = useApp();

  if (!activeSession) return null;

  const isTimed = activeSession.sessionType === 'timed';
  const isPaused = activeSession.status === 'paused';
  const timeLimit = activeSession.timeLimit || 0;

  // For timed sessions, calculate remaining time directly from timestamp
  const remainingMs = isTimed ? getRemainingSessionTime(activeSession) : 0;
  const isTimeCritical = isTimed && remainingMs < 60000; // Less than 1 minute remaining

  // Progress percentage (0% to 100%)
  const progressPercent = isTimed && timeLimit > 0
    ? Math.min(100, Math.max(0, (currentElapsedMs / timeLimit) * 100))
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.985 }}
      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      id="active-session-card"
      className={`p-6 md:p-8 rounded-2xl bg-gradient-to-b from-[#181a20] to-[#121316] border-2 shadow-2xl relative overflow-hidden transition-all ${
        isTimed
          ? isTimeCritical
            ? 'border-rose-500/60 shadow-rose-500/10'
            : 'border-amber-500/50 shadow-amber-500/10'
          : 'border-amber-500/40 shadow-amber-500/5'
      }`}
    >
      {/* Subtle background glow (Decorative - pointer-events-none) */}
      <div
        className={`absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full blur-3xl pointer-events-none ${
          isTimed
            ? isTimeCritical
              ? 'bg-rose-500/15'
              : 'bg-amber-500/15'
            : 'bg-amber-500/10'
        }`}
      />

      {/* Progress Bar for Timed Session (pointer-events-none) */}
      {isTimed && timeLimit > 0 && (
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#252834] pointer-events-none">
          <div
            className={`h-full transition-all duration-300 ${
              isTimeCritical ? 'bg-rose-500' : 'bg-amber-500'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isTimed
                    ? isTimeCritical
                      ? 'bg-rose-400'
                      : 'bg-amber-400'
                    : isPaused
                    ? 'bg-zinc-500'
                    : 'bg-amber-400'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-3 w-3 ${
                  isTimed
                    ? isTimeCritical
                      ? 'bg-rose-400'
                      : 'bg-amber-400'
                    : isPaused
                    ? 'bg-zinc-400'
                    : 'bg-amber-400'
                }`}
              />
            </span>
            <span
              className={`text-xs font-extrabold tracking-widest uppercase ${
                isTimed
                  ? isTimeCritical
                    ? 'text-rose-400'
                    : 'text-amber-400'
                  : isPaused
                  ? 'text-zinc-400'
                  : 'text-amber-400'
              }`}
            >
              {isTimed
                ? `Timed Session (${formatShortDuration(timeLimit)} Limit)`
                : isPaused
                ? 'Session Paused'
                : 'Active Drawing Session'}
            </span>

            {isTimed && (
              <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                Hard Deadline
              </span>
            )}

            <span className="text-xs text-zinc-400 font-medium">
              Started {formatDateTime(activeSession.startedAt)}
            </span>
          </div>

          <h3 className="text-xl md:text-2xl font-extrabold text-zinc-100 tracking-tight">
            {activeSession.title || (isTimed ? 'Timed Drawing Session' : 'Focused Practice Session')}
          </h3>

          {/* Topics */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {activeSession.topics.map(topic => (
              <span
                key={topic}
                className="px-3 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold"
              >
                {topic}
              </span>
            ))}
          </div>

          {/* Goal */}
          {activeSession.goal && (
            <div className="flex items-start gap-2 pt-1 text-sm text-zinc-300">
              <Target className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="italic">{activeSession.goal}</p>
            </div>
          )}
        </div>

        {/* Live Timer Display & Actions */}
        <div className="flex flex-col items-start md:items-end gap-4 shrink-0 relative z-20">
          <div className="text-left md:text-right">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
              {isTimed ? 'Time Remaining' : 'Elapsed Practice Time'}
            </span>
            <div
              className={`font-mono text-4xl md:text-5xl font-black tracking-tight tabular-nums drop-shadow-md ${
                isTimed
                  ? isTimeCritical
                    ? 'text-rose-400 animate-pulse'
                    : 'text-amber-400'
                  : 'text-amber-400'
              }`}
            >
              {isTimed ? formatDuration(remainingMs) : formatDuration(currentElapsedMs)}
            </div>
            {isTimed && (
              <span className="text-[11px] text-zinc-400 font-mono block mt-1">
                {formatDuration(currentElapsedMs)} elapsed of {formatShortDuration(timeLimit)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {!isTimed && (
              <>
                {isPaused ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.12 }}
                    id="active-card-resume-btn"
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      resumeSession();
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition-colors shadow-lg shadow-amber-500/15 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer select-none"
                  >
                    <PlayCircle className="w-4 h-4 fill-black stroke-none" />
                    <span>Resume Session</span>
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.12 }}
                    id="active-card-pause-btn"
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      pauseSession();
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#22242c] hover:bg-[#2c303a] text-zinc-200 font-semibold text-sm border border-[#383d4a] transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-500 cursor-pointer select-none"
                  >
                    <Pause className="w-4 h-4" />
                    <span>Pause</span>
                  </motion.button>
                )}
              </>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.12 }}
              id="active-card-finish-btn"
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                requestFinishSession();
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-black font-bold text-sm transition-colors shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer select-none ${
                isTimed
                  ? 'bg-amber-500 hover:bg-amber-400 shadow-amber-500/20'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 shadow-amber-500/20'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              <span>Finish Session</span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
