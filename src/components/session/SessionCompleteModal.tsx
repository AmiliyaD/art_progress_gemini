import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Sparkles, Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDuration } from '../../lib/time-utils';

export const SessionCompleteModal: React.FC = () => {
  const {
    completedSessionForModal,
    setCompletedSessionForModal,
    setIsArtworkModalOpen,
    setArtworkModalPrefill
  } = useApp();

  const handleAddArtwork = () => {
    if (!completedSessionForModal) return;
    // Format session completion date as YYYY-MM-DD
    const completedDate = new Date(completedSessionForModal.completedAt || Date.now());
    const dateStr = `${completedDate.getFullYear()}-${String(completedDate.getMonth() + 1).padStart(2, '0')}-${String(completedDate.getDate()).padStart(2, '0')}`;

    setArtworkModalPrefill({
      title: completedSessionForModal.title ? `${completedSessionForModal.title} — Result` : 'Session Artwork Study',
      topics: [...completedSessionForModal.topics],
      durationMs: completedSessionForModal.duration,
      date: dateStr,
      sourceSessionId: completedSessionForModal.id,
      notes: completedSessionForModal.goal ? `Practice Goal: ${completedSessionForModal.goal}` : undefined
    });

    setCompletedSessionForModal(null);
    setIsArtworkModalOpen(true);
  };

  const handleNothingToAdd = () => {
    setCompletedSessionForModal(null);
  };

  return (
    <AnimatePresence>
      {completedSessionForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            id="session-complete-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
            onClick={handleNothingToAdd}
          />

          <motion.div
            id="session-complete-modal"
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-md bg-[#181a1f] border-2 border-amber-500/40 rounded-3xl p-8 shadow-2xl shadow-amber-500/10 text-center overflow-hidden"
          >
            {/* Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-16 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

            <motion.div
              initial={{ scale: 0.7, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 350, damping: 20, delay: 0.05 }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black mx-auto mb-5 shadow-lg shadow-amber-500/25"
            >
              <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
            </motion.div>

            <div className="flex items-center justify-center gap-1.5 text-amber-400 text-xs font-extrabold tracking-widest uppercase mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Session Complete</span>
            </div>

            <h2 className="text-3xl font-black font-mono text-zinc-100 mb-2">
              {formatDuration(completedSessionForModal.duration)}
            </h2>

            {/* Practice Topics */}
            <div className="text-xs text-zinc-400 font-medium mb-6">
              <span className="text-zinc-400">Practice: </span>
              <span className="text-zinc-200 font-semibold">
                {completedSessionForModal.topics.join(' · ')}
              </span>
            </div>

            {/* Prompt */}
            <div className="p-4 rounded-2xl bg-[#121316] border border-[#262832] mb-6 text-left">
              <p className="text-sm font-semibold text-zinc-200 mb-1">
                Did you create an artwork during this session?
              </p>
              <p className="text-xs text-zinc-400 leading-relaxed">
                You can archive your finished sketch or study now, or simply record this practice time without artwork.
              </p>
            </div>

            {/* Action Choices */}
            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                id="session-complete-add-artwork-btn"
                onClick={handleAddArtwork}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition-colors shadow-lg shadow-amber-500/15 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>+ Add artwork result</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                id="session-complete-skip-artwork-btn"
                onClick={handleNothingToAdd}
                className="w-full px-5 py-2.5 rounded-xl bg-transparent hover:bg-[#22242a] text-zinc-400 hover:text-zinc-200 font-semibold text-xs transition-colors cursor-pointer"
              >
                Nothing to add
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
