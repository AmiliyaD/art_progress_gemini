import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Sparkles, Plus, Timer } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDuration, formatShortDuration, formatLongDuration } from '../../lib/time-utils';

export const SessionCompleteModal: React.FC = () => {
  const {
    completedSessionForModal,
    setCompletedSessionForModal,
    setIsArtworkModalOpen,
    setArtworkModalPrefill
  } = useApp();

  // Dismiss with Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && completedSessionForModal) {
        e.preventDefault();
        setCompletedSessionForModal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [completedSessionForModal, setCompletedSessionForModal]);

  const handleAddArtwork = () => {
    if (!completedSessionForModal) return;
    // Format session completion date as YYYY-MM-DD
    const completedDate = new Date(completedSessionForModal.completedAt || Date.now());
    const dateStr = `${completedDate.getFullYear()}-${String(completedDate.getMonth() + 1).padStart(2, '0')}-${String(completedDate.getDate()).padStart(2, '0')}`;

    const isTimed = completedSessionForModal.sessionType === 'timed';
    const timeLimit = completedSessionForModal.timeLimit || 0;

    const defaultTitle = isTimed
      ? (completedSessionForModal.title ? `${completedSessionForModal.title} — Timed Study` : `Timed Study (${formatShortDuration(timeLimit)})`)
      : (completedSessionForModal.title ? `${completedSessionForModal.title} — Result` : 'Session Artwork Study');

    let notes = '';
    if (isTimed) {
      notes += `Timed Drawing Session (${formatShortDuration(timeLimit)} limit). `;
    }
    if (completedSessionForModal.goal) {
      notes += `Practice Goal: ${completedSessionForModal.goal}`;
    }

    setArtworkModalPrefill({
      title: defaultTitle,
      topics: [...completedSessionForModal.topics],
      durationMs: completedSessionForModal.duration,
      date: dateStr,
      sourceSessionId: completedSessionForModal.id,
      notes: notes.trim() || undefined
    });

    setCompletedSessionForModal(null);
    setIsArtworkModalOpen(true);
  };

  const handleNothingToAdd = () => {
    setCompletedSessionForModal(null);
  };

  const isTimed = completedSessionForModal?.sessionType === 'timed';
  const isExpired = completedSessionForModal?.status === 'expired';
  const timeLimit = completedSessionForModal?.timeLimit || 0;

  return (
    <AnimatePresence>
      {completedSessionForModal && (
        <motion.div
          key="session-complete-modal-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop with smooth blur */}
          <motion.div
            key="session-complete-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
            onClick={handleNothingToAdd}
          />

          <motion.div
            key="session-complete-modal"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
            className={`relative z-10 w-full max-w-md bg-[#181a1f] border-2 rounded-3xl p-7 md:p-8 shadow-2xl text-center overflow-hidden ${
              isTimed && isExpired
                ? 'border-rose-500/60 shadow-rose-500/15'
                : 'border-amber-500/40 shadow-amber-500/10'
            }`}
          >
            {/* Ambient Background Glow (Decorative - pointer-events-none) */}
            <div
              className={`absolute top-0 left-1/2 -translate-x-1/2 -mt-16 w-48 h-48 rounded-full blur-3xl pointer-events-none ${
                isTimed && isExpired ? 'bg-rose-500/20 animate-pulse' : 'bg-amber-500/15'
              }`}
            />

            <motion.div
              initial={{ scale: 0.7, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 350, damping: 20, delay: 0.05 }}
              className={`w-16 h-16 rounded-2xl flex items-center justify-center text-black mx-auto mb-4 shadow-lg relative z-10 ${
                isTimed && isExpired
                  ? 'bg-gradient-to-br from-rose-400 to-rose-600 shadow-rose-500/25 text-white'
                  : 'bg-gradient-to-br from-amber-400 to-amber-600 shadow-amber-500/25'
              }`}
            >
              {isTimed ? <Timer className="w-8 h-8 stroke-[2.2]" /> : <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />}
            </motion.div>

            <div className={`flex items-center justify-center gap-1.5 text-xs font-extrabold tracking-widest uppercase mb-1 relative z-10 ${
              isTimed && isExpired ? 'text-rose-400' : 'text-amber-400'
            }`}>
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {isTimed
                  ? isExpired
                    ? "Time's Up · Session Finished"
                    : 'Timed Session Complete'
                  : 'Session Complete'}
              </span>
            </div>

            <h2 className="text-3xl font-black font-mono text-zinc-100 mb-1 relative z-10">
              {formatDuration(completedSessionForModal.duration)}
            </h2>

            {isTimed && timeLimit > 0 && (
              <p className={`text-xs font-mono mb-2 relative z-10 ${
                isExpired ? 'text-rose-400 font-bold' : 'text-amber-400/90'
              }`}>
                {isExpired
                  ? `Full ${formatLongDuration(timeLimit)} deadline reached`
                  : `${formatShortDuration(timeLimit)} time limit`}
              </p>
            )}

            {/* Practice Topics */}
            <div className="text-xs text-zinc-400 font-medium mb-6 relative z-10">
              <span className="text-zinc-400">Practice: </span>
              <span className="text-zinc-200 font-semibold">
                {completedSessionForModal.topics.join(' · ')}
              </span>
            </div>

            {/* Prompt Card */}
            <div className="p-4 rounded-2xl bg-[#121316] border border-[#262832] mb-6 text-left relative z-10">
              <p className="text-sm font-semibold text-zinc-200 mb-1">
                Did you create an artwork during this session?
              </p>
              <p className="text-xs text-zinc-400 leading-relaxed">
                You can archive your finished sketch or study now, or simply record this practice time without artwork.
              </p>
            </div>

            {/* Action Choices */}
            <div className="space-y-3 relative z-10">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.12 }}
                id="session-complete-add-artwork-btn"
                type="button"
                onClick={handleAddArtwork}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition-colors shadow-lg shadow-amber-500/15 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer select-none"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>+ Add artwork result</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.12 }}
                id="session-complete-skip-artwork-btn"
                type="button"
                onClick={handleNothingToAdd}
                className="w-full px-5 py-2.5 rounded-xl bg-transparent hover:bg-[#22242a] text-zinc-400 hover:text-zinc-200 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-zinc-600 transition-colors cursor-pointer select-none"
              >
                Nothing to add
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
