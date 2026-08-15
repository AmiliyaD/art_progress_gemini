import React, { useState, useEffect } from 'react';
import { Palette, Clock, Calendar, Edit2, Trash2, Maximize2, Sparkles } from 'lucide-react';
import { Artwork } from '../../types';
import { getArtworkImageUrl } from '../../lib/image-store';
import { formatShortDuration, formatDate } from '../../lib/time-utils';

interface ArtworkCardProps {
  artwork: Artwork;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const ArtworkCard: React.FC<ArtworkCardProps> = ({
  artwork,
  onOpen,
  onEdit,
  onDelete
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    getArtworkImageUrl(artwork.imageId).then(url => {
      if (isMounted && url) {
        setImageUrl(url);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [artwork.imageId]);

  return (
    <div
      id={`artwork-card-${artwork.id}`}
      className="group rounded-2xl bg-[#14151a] hover:bg-[#181a21] border border-[#22242a] hover:border-zinc-700/60 transition-all duration-200 overflow-hidden flex flex-col shadow-lg shadow-black/20"
    >
      {/* Thumbnail Area */}
      <div
        onClick={onOpen}
        className="relative w-full aspect-[4/3] bg-[#0a0b0d] overflow-hidden cursor-pointer flex items-center justify-center"
      >
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={artwork.title}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-zinc-600 p-4 text-center">
            <Palette className="w-8 h-8 mb-1.5 text-zinc-700" />
            <span className="text-xs text-zinc-500 font-medium">Artwork Study</span>
          </div>
        )}

        {/* Hover overlay with quick actions */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              onOpen();
            }}
            className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold shadow-lg transition-transform active:scale-95 cursor-pointer"
            title="Open Details"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-2.5 rounded-xl bg-[#20222a] hover:bg-[#2c303c] text-zinc-200 shadow-lg transition-transform active:scale-95 cursor-pointer"
            title="Edit Artwork"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-2.5 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white shadow-lg transition-transform active:scale-95 cursor-pointer"
            title="Delete Artwork"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Mood Badge */}
        {artwork.mood && (
          <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-amber-300 text-[10px] font-medium border border-amber-500/20">
            {artwork.mood}
          </span>
        )}

        {/* Session origin badge */}
        {artwork.sourceSessionId && (
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-amber-500/90 text-black text-[10px] font-extrabold flex items-center gap-1 shadow-sm">
            <Sparkles className="w-3 h-3" />
            <span>Session</span>
          </span>
        )}
      </div>

      {/* Info Area */}
      <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
        <div className="space-y-1">
          <h3
            onClick={onOpen}
            className="text-sm font-bold text-zinc-100 group-hover:text-amber-400 transition-colors line-clamp-1 cursor-pointer"
          >
            {artwork.title}
          </h3>

          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-zinc-400" />
              <span>{formatDate(artwork.date)}</span>
            </span>

            {artwork.durationMs > 0 && (
              <span className="flex items-center gap-1 font-mono text-zinc-300">
                <Clock className="w-3 h-3 text-amber-500" />
                <span>{formatShortDuration(artwork.durationMs)}</span>
              </span>
            )}
          </div>
        </div>

        {/* Topics Chips */}
        <div className="flex flex-wrap gap-1 pt-1">
          {artwork.topics.slice(0, 3).map(topic => (
            <span
              key={topic}
              className="px-2 py-0.5 rounded bg-[#1c1e25] border border-[#282b35] text-zinc-300 text-[10px] font-medium"
            >
              {topic}
            </span>
          ))}
          {artwork.topics.length > 3 && (
            <span className="px-1.5 py-0.5 rounded bg-[#1c1e25] text-zinc-400 text-[10px]">
              +{artwork.topics.length - 3}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
