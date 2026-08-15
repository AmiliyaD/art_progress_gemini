import React, { useMemo } from 'react';
import { Activity, Clock, Calendar, Sparkles } from 'lucide-react';
import { Session } from '../../types';
import { formatDuration, formatShortDuration } from '../../lib/time-utils';

interface ActivityGraphProps {
  sessions: Session[];
}

export const ActivityGraph: React.FC<ActivityGraphProps> = ({ sessions }) => {
  const completedSessions = useMemo(() => {
    return sessions.filter(s => s.status === 'completed' && s.completedAt);
  }, [sessions]);

  // Aggregate drawing time by date for the last 14 days
  const chartData = useMemo(() => {
    const days: { dateStr: string; label: string; durationMs: number; sessionCount: number; topics: string[] }[] = [];
    const now = new Date();

    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
      days.push({
        dateStr,
        label,
        durationMs: 0,
        sessionCount: 0,
        topics: []
      });
    }

    const dayMap = new Map(days.map(d => [d.dateStr, d]));

    completedSessions.forEach(session => {
      if (!session.completedAt) return;
      const sDate = new Date(session.completedAt);
      const sKey = `${sDate.getFullYear()}-${String(sDate.getMonth() + 1).padStart(2, '0')}-${String(sDate.getDate()).padStart(2, '0')}`;
      const entry = dayMap.get(sKey);
      if (entry) {
        entry.durationMs += session.duration || 0;
        entry.sessionCount += 1;
        session.topics.forEach(t => {
          if (!entry.topics.includes(t)) entry.topics.push(t);
        });
      }
    });

    return days;
  }, [completedSessions]);

  const maxDurationMs = useMemo(() => {
    const max = Math.max(...chartData.map(d => d.durationMs));
    return max > 0 ? max : 3600000; // Default 1 hour scale if 0
  }, [chartData]);

  const hasAnyActivity = completedSessions.length > 0;

  return (
    <div
      id="studio-activity-graph"
      className="p-6 rounded-2xl bg-[#14151a] border border-[#22242a] space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">
            Practice Timeline (Last 14 Days)
          </h3>
        </div>
        <span className="text-xs text-zinc-400 font-mono">
          {completedSessions.length} recorded {completedSessions.length === 1 ? 'session' : 'sessions'}
        </span>
      </div>

      {!hasAnyActivity ? (
        <div className="py-10 text-center space-y-2 border border-dashed border-[#262832] rounded-xl bg-[#111216]">
          <Clock className="w-8 h-8 mx-auto text-zinc-600 mb-1" />
          <p className="text-sm font-bold text-zinc-300">No activity yet.</p>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Start your first drawing session to begin your timeline. Real drawing hours will automatically populate here.
          </p>
        </div>
      ) : (
        <div className="space-y-3 pt-2">
          {/* Histogram Bar Visualization */}
          <div className="h-44 flex items-end justify-between gap-1.5 pt-4 px-2">
            {chartData.map((day, idx) => {
              const heightPercent = day.durationMs > 0 ? Math.max(8, Math.round((day.durationMs / maxDurationMs) * 100)) : 0;
              const hasDrawing = day.durationMs > 0;

              return (
                <div
                  key={day.dateStr}
                  className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group relative cursor-pointer"
                >
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-30 pointer-events-none whitespace-nowrap">
                    <div className="px-3 py-2 rounded-xl bg-[#181a20] border border-[#2c2f38] shadow-2xl text-[11px] text-zinc-200 space-y-0.5 text-center">
                      <div className="font-bold text-amber-400">{day.label}</div>
                      <div className="font-mono font-semibold text-zinc-100">{formatShortDuration(day.durationMs)}</div>
                      {day.sessionCount > 0 && (
                        <div className="text-[10px] text-zinc-400">{day.sessionCount} {day.sessionCount === 1 ? 'session' : 'sessions'}</div>
                      )}
                      {day.topics.length > 0 && (
                        <div className="text-[9px] text-amber-300/80 pt-0.5">{day.topics.slice(0, 2).join(', ')}</div>
                      )}
                    </div>
                    <div className="w-2 h-2 bg-[#181a20] rotate-45 -mt-1 border-r border-b border-[#2c2f38]" />
                  </div>

                  {/* Bar */}
                  <div className="w-full max-w-[28px] h-full flex items-end">
                    <div
                      className={`w-full rounded-md transition-all duration-300 ${
                        hasDrawing
                          ? 'bg-gradient-to-t from-amber-600 to-amber-400 group-hover:from-amber-500 group-hover:to-amber-300 shadow-sm shadow-amber-500/20'
                          : 'bg-[#1a1c22] group-hover:bg-[#20232a]'
                      }`}
                      style={{
                        height: hasDrawing ? `${heightPercent}%` : '4px'
                      }}
                    />
                  </div>

                  {/* Date label */}
                  <span className="text-[10px] text-zinc-400 group-hover:text-zinc-300 font-mono">
                    {idx % 2 === 0 ? day.label.split(',')[0].slice(0, 2) : ''}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
