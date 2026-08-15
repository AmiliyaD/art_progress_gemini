import React from 'react';
import { Trophy, CheckCircle2, PauseCircle, Calendar, Target, ArrowRight } from 'lucide-react';
import { Challenge } from '../../types';

interface ChallengeCardProps {
  challenge: Challenge;
  onClick: () => void;
}

export const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge, onClick }) => {
  const totalTasks = challenge.tasks?.length || 0;
  const completedTasks = challenge.tasks?.filter(t => t.completed).length || 0;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const isCompleted = challenge.status === 'completed' || (totalTasks > 0 && completedTasks === totalTasks);

  return (
    <div
      id={`challenge-card-${challenge.id}`}
      onClick={onClick}
      className="p-6 rounded-2xl bg-[#14151a] hover:bg-[#181a21] border border-[#22242a] hover:border-zinc-700/60 transition-all duration-200 cursor-pointer flex flex-col justify-between group relative overflow-hidden shadow-lg shadow-black/20"
    >
      {/* Top Accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-1 transition-all group-hover:h-1.5"
        style={{ backgroundColor: challenge.accent || '#f59e0b' }}
      />

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span
            className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider"
            style={{
              backgroundColor: `${challenge.accent || '#f59e0b'}15`,
              color: challenge.accent || '#f59e0b',
              border: `1px solid ${challenge.accent || '#f59e0b'}30`
            }}
          >
            {challenge.duration}
          </span>

          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
            isCompleted
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : challenge.status === 'paused'
              ? 'bg-zinc-700/40 text-zinc-400 border border-zinc-700'
              : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
          }`}>
            {isCompleted ? (
              <>
                <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />
                <span>Completed</span>
              </>
            ) : challenge.status === 'paused' ? (
              <>
                <PauseCircle className="w-3 h-3" />
                <span>Paused</span>
              </>
            ) : (
              <span>Active</span>
            )}
          </span>
        </div>

        <h3 className="text-base font-bold text-zinc-100 group-hover:text-amber-400 transition-colors leading-snug">
          {challenge.title}
        </h3>

        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
          {challenge.description}
        </p>

        {challenge.dailyGoal && (
          <div className="flex items-center gap-1.5 text-xs text-zinc-300 font-medium">
            <Target className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="truncate italic">{challenge.dailyGoal}</span>
          </div>
        )}
      </div>

      {/* Real Progress Bar */}
      <div className="pt-5 mt-4 border-t border-[#20222a] space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-400 font-medium">Progress</span>
          <div className="flex items-center gap-1.5">
            <span className="font-mono font-bold text-zinc-200">
              {completedTasks} / {totalTasks}
            </span>
            <span className="font-mono text-zinc-400">({progressPercent}%)</span>
          </div>
        </div>

        <div className="w-full h-2 rounded-full bg-[#1e2028] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300 ease-out"
            style={{
              width: `${progressPercent}%`,
              backgroundColor: challenge.accent || '#f59e0b'
            }}
          />
        </div>

        <div className="flex items-center justify-between pt-1 text-[11px] text-zinc-400">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-zinc-400" />
            <span>Started {challenge.startDate}</span>
          </span>
          <span className="flex items-center gap-1 text-zinc-400 group-hover:text-amber-400 transition-colors font-medium">
            <span>View Tasks</span>
            <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </div>
  );
};
