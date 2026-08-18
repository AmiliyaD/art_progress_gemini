import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Calendar,
  Clock,
  Palette,
  Edit2,
  Trash2,
  Sparkles,
  ArrowRight,
  Smile,
  FileText
} from 'lucide-react';
import { Artwork } from '../../types';
import { useApp } from '../../context/AppContext';
import { getArtworkImageUrl } from '../../lib/image-store';
import { formatShortDuration, formatDate } from '../../lib/time-utils';
import { ConfirmModal } from '../common/ConfirmModal';

interface ArtworkDetailModalProps {
  artworkId: string | null;
  onClose: () => void;
  onEdit: (artwork: Artwork) => void;
}

export const ArtworkDetailModal: React.FC<ArtworkDetailModalProps> = ({
  artworkId,
  onClose,
  onEdit
}) => {
  const { artworks, sessions, deleteArtwork, navigateTo } = useApp();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const artwork = artworks.find(a => a.id === artworkId);
  const linkedSession = artwork?.sourceSessionId
    ? sessions.find(s => s.id === artwork.sourceSessionId)
    : null;

  // Lock body scroll when modal is open
  useEffect(() => {
    if (artwork) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [artwork]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && artwork && !isDeleteConfirmOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [artwork, isDeleteConfirmOpen, onClose]);

  useEffect(() => {
    if (artwork) {
      getArtworkImageUrl(artwork.imageId).then(url => {
        setImageUrl(url);
      });
    } else {
      setImageUrl(null);
    }
  }, [artwork]);

  const modalContent = (
    <AnimatePresence>
      {artwork && (
        <motion.div
          key="artwork-detail-modal-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 min-h-screen overflow-y-auto"
        >
          <motion.div
            key="artwork-detail-modal-overlay"
            id="artwork-detail-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
            onClick={onClose}
          />

          <motion.div
            key="artwork-detail-modal-box"
            id="artwork-detail-modal"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 6 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-4xl bg-[#14151a] border border-[#2c2f38] rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh] my-auto text-left"
            onClick={e => e.stopPropagation()}
          >
            {/* Large Image Preview Left */}
            <div className="w-full md:w-3/5 bg-[#08090b] flex items-center justify-center p-4 relative min-h-[300px] overflow-hidden">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={artwork.title}
                  className="max-h-[80vh] w-full object-contain rounded-xl"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-zinc-600">
                  <Palette className="w-12 h-12 mb-2" />
                  <span className="text-xs">No image available</span>
                </div>
              )}
            </div>

            {/* Info & Details Right */}
            <div className="w-full md:w-2/5 p-6 flex flex-col justify-between overflow-y-auto bg-[#181a20] border-t md:border-t-0 md:border-l border-[#242730] space-y-6">
              <div className="space-y-4">
                {/* Top Close & Actions */}
                <div className="flex items-center justify-between pb-2 border-b border-[#262832]">
                  <span className="text-[11px] font-bold tracking-wider text-amber-500 uppercase">
                    Artwork Detail
                  </span>
                  <div className="flex items-center gap-1">
                    <motion.button
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => onEdit(artwork)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-[#22242a] transition-colors cursor-pointer"
                      title="Edit Artwork"
                    >
                      <Edit2 className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => setIsDeleteConfirmOpen(true)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Delete Artwork"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={onClose}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-[#22242a] transition-colors cursor-pointer ml-1"
                    >
                      <X className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>

                {/* Title & Description */}
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-zinc-100 leading-tight">
                    {artwork.title}
                  </h2>
                  {artwork.description && (
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {artwork.description}
                    </p>
                  )}
                </div>

                {/* Meta Tags */}
                <div className="grid grid-cols-2 gap-3 py-2 border-y border-[#262832] text-xs">
                  <div className="flex items-center gap-2 text-zinc-300">
                    <Calendar className="w-3.5 h-3.5 text-amber-500" />
                    <span>{formatDate(artwork.date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-300">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>{formatShortDuration(artwork.durationMs)}</span>
                  </div>
                  {artwork.mood && (
                    <div className="flex items-center gap-2 text-zinc-300 col-span-2">
                      <Smile className="w-3.5 h-3.5 text-amber-500" />
                      <span>Mood: <strong className="text-zinc-200 font-semibold">{artwork.mood}</strong></span>
                    </div>
                  )}
                </div>

                {/* Topics */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                    Practice Topics
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {artwork.topics.map(t => (
                      <span
                        key={t}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                {artwork.notes && (
                  <div className="space-y-1 p-3 rounded-xl bg-[#14151a] border border-[#262832]">
                    <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                      Artist Notes
                    </span>
                    <p className="text-xs text-zinc-300 leading-relaxed italic">
                      "{artwork.notes}"
                    </p>
                  </div>
                )}

                {/* Linked Session Info */}
                {artwork.sourceSessionId && (
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Created From Drawing Session</span>
                    </div>
                    {linkedSession ? (
                      <div className="text-xs text-zinc-300 space-y-1">
                        <p className="font-semibold text-zinc-200">
                          {linkedSession.title || 'Practice Session'}
                        </p>
                        <p className="text-zinc-400 text-[11px]">
                          Duration: {formatShortDuration(linkedSession.duration)} · {linkedSession.topics.join(', ')}
                        </p>
                        <button
                          onClick={() => {
                            onClose();
                            navigateTo('session');
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:text-amber-300 transition-colors pt-1 cursor-pointer"
                        >
                          <span>View in Session History</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <p className="text-[11px] text-zinc-400">
                        Session record linked: #{artwork.sourceSessionId.substring(0, 12)}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-[#262832] flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-[#22242a] hover:bg-[#2c3038] text-zinc-200 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Close
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Delete Confirmation */}
          <ConfirmModal
            isOpen={isDeleteConfirmOpen}
            title="Delete Artwork"
            message="Are you sure you want to delete this artwork? The image and record will be permanently removed from your studio archive."
            confirmLabel="Delete Artwork"
            onConfirm={async () => {
              await deleteArtwork(artwork.id);
              setIsDeleteConfirmOpen(false);
              onClose();
            }}
            onCancel={() => setIsDeleteConfirmOpen(false)}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modalContent, document.body);
};
