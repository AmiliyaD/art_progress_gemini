import React from 'react';
import {
  PlayCircle,
  Pause,
  CheckCircle2,
  Clock,
  Target,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDuration, formatDateTime } from '../../lib/time-utils';

interface ActiveSessionCardProps {
  compact?: boolean;
}

export const ActiveSessionCard: React.FC<ActiveSessionCardProps> = ({ compact = false }) => {
  const {
    activeSession,
    currentElapsedMs,
    pauseSession,
    resumeSession,
    finishSession
  } = useApp();

  if (!activeSession) return null;

  const isPaused = activeSession.status === 'paused';

  return (
    <div
      id="active-session-card"
      className="p-6 md:p-8 rounded-2xl bg-gradient-to-b from-[#181a20] to-[#121316] border-2 border-amber-500/40 shadow-2xl shadow-amber-500/5 relative overflow-hidden"
    >
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                  isPaused ? 'bg-zinc-500' : 'bg-amber-400'
                } opacity-75`}
              />
              <span
                className={`relative inline-flex rounded-full h-3 w-3 ${
                  isPaused ? 'bg-zinc-400' : 'bg-amber-400'
                }`}
              />
            </span>
            <span className="text-xs font-extrabold tracking-widest uppercase text-amber-400">
              {isPaused ? 'Session Paused' : 'Active Drawing Session'}
            </span>
            <span className="text-xs text-zinc-400 font-medium">
              Started {formatDateTime(activeSession.startedAt)}
            </span>
          </div>

          <h3 className="text-xl md:text-2xl font-extrabold text-zinc-100 tracking-tight">
            {activeSession.title || 'Focused Practice Session'}
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
        <div className="flex flex-col items-start md:items-end gap-4 shrink-0">
          <div className="text-left md:text-right">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
              Elapsed Practice Time
            </span>
            <div className="font-mono text-4xl md:text-5xl font-black tracking-tight text-amber-400 tabular-nums drop-shadow-md">
              {formatDuration(currentElapsedMs)}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isPaused ? (
              <button
                id="active-card-resume-btn"
                onClick={resumeSession}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition-all shadow-lg shadow-amber-500/15 cursor-pointer active:scale-[0.98]"
              >
                <PlayCircle className="w-4 h-4 fill-black stroke-none" />
                <span>Resume Session</span>
              </button>
            ) : (
              <button
                id="active-card-pause-btn"
                onClick={pauseSession}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#22242c] hover:bg-[#2c303a] text-zinc-200 font-semibold text-sm border border-[#383d4a] transition-all cursor-pointer"
              >
                <Pause className="w-4 h-4" />
                <span>Pause</span>
              </button>
            )}

            <button
              id="active-card-finish-btn"
              onClick={finishSession}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-sm transition-all shadow-lg shadow-amber-500/20 cursor-pointer active:scale-[0.98]"
            >
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              <span>Finish Session</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
