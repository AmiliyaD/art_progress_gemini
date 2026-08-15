import React from 'react';
import { Calendar, Edit2, Trash2, Tag, Palette, Trophy, PlayCircle } from 'lucide-react';
import { Insight } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../lib/time-utils';

interface InsightCardProps {
  insight: Insight;
  onEdit: () => void;
  onDelete: () => void;
}

export const InsightCard: React.FC<InsightCardProps> = ({
  insight,
  onEdit,
  onDelete
}) => {
  const { artworks, challenges, sessions, navigateTo } = useApp();

  const linkedArtwork = insight.relatedArtworkId
    ? artworks.find(a => a.id === insight.relatedArtworkId)
    : null;

  const linkedChallenge = insight.relatedChallengeId
    ? challenges.find(c => c.id === insight.relatedChallengeId)
    : null;

  const linkedSession = insight.relatedSessionId
    ? sessions.find(s => s.id === insight.relatedSessionId)
    : null;

  return (
    <div
      id={`insight-card-${insight.id}`}
      className="p-6 rounded-2xl bg-[#14151a] hover:bg-[#181a21] border border-[#22242a] hover:border-zinc-700/60 transition-all duration-200 flex flex-col justify-between group shadow-lg shadow-black/15"
    >
      <div className="space-y-3">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-bold text-zinc-100 group-hover:text-amber-400 transition-colors leading-snug">
            {insight.title}
          </h3>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button
              onClick={onEdit}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-[#22242a] transition-colors cursor-pointer"
              title="Edit insight"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
              title="Delete insight"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <p className="text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed">
          {insight.content}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {insight.tags.map(tag => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-md bg-[#1f222a] border border-[#2c303c] text-amber-300/90 text-[11px] font-medium"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Footer Meta & Relationships */}
      <div className="pt-4 mt-4 border-t border-[#20222a] space-y-2 text-xs">
        {/* Connected Badges if any */}
        {(linkedArtwork || linkedChallenge || linkedSession) && (
          <div className="flex flex-wrap items-center gap-1.5">
            {linkedArtwork && (
              <button
                onClick={() => navigateTo('artwork', { artworkId: linkedArtwork.id })}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[10px] font-semibold hover:bg-amber-500/20 transition-colors"
              >
                <Palette className="w-3 h-3" />
                <span className="truncate max-w-[120px]">{linkedArtwork.title}</span>
              </button>
            )}
            {linkedChallenge && (
              <button
                onClick={() => navigateTo('challenges', { challengeId: linkedChallenge.id })}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-[10px] font-semibold hover:bg-indigo-500/20 transition-colors"
              >
                <Trophy className="w-3 h-3" />
                <span className="truncate max-w-[120px]">{linkedChallenge.title}</span>
              </button>
            )}
            {linkedSession && (
              <button
                onClick={() => navigateTo('session')}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold hover:bg-emerald-500/20 transition-colors"
              >
                <PlayCircle className="w-3 h-3" />
                <span>Session #{linkedSession.id.substring(8, 14)}</span>
              </button>
            )}
          </div>
        )}

        <div className="flex items-center justify-between text-zinc-400 text-[11px]">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-zinc-400" />
            <span>{formatDate(insight.createdAt)}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
