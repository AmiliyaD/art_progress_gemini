import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Timer, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  formatDuration,
  getRemainingSessionTime
} from '../../lib/time-utils';

export const FinishSessionModal: React.FC = () => {
  const {
    activeSession,
    currentElapsedMs,
    isFinishConfirmModalOpen,
    cancelFinishSession,
    confirmFinishSession
  } = useApp();

  // Close on Escape key without ending session
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFinishConfirmModalOpen) {
        e.preventDefault();
        cancelFinishSession();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFinishConfirmModalOpen, cancelFinishSession]);

  const isTimed = activeSession?.sessionType === 'timed';
  const remainingMs = isTimed && activeSession ? getRemainingSessionTime(activeSession) : 0;

  return (
    <AnimatePresence>
      {isFinishConfirmModalOpen && activeSession && (
        <motion.div
          key="finish-session-confirm-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop with smooth blur & fade */}
          <motion.div
            key="finish-session-confirm-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
            onClick={cancelFinishSession}
          />

          {/* Confirmation Box */}
          <motion.div
            key="finish-session-confirm-dialog"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full max-w-md bg-[#181a1f] border border-[#2c2f38] rounded-2xl p-6 md:p-7 shadow-2xl shadow-black/80 overflow-hidden"
          >
            {/* Ambient Accent Glow (Decorative - pointer-events-none) */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-start justify-between mb-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  {isTimed ? (
                    <Timer className="w-5 h-5 stroke-[2.2]" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-zinc-100 tracking-tight">
                    Finish session?
                  </h3>
                  <span className="text-xs text-zinc-400">
                    {isTimed ? 'Timed Drawing Session' : 'Free Drawing Session'}
                  </span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.12 }}
                id="finish-confirm-close-x-btn"
                type="button"
                onClick={cancelFinishSession}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-[#22242a] focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-colors cursor-pointer"
                title="Cancel"
                aria-label="Cancel and close dialog"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Core Confirmation Message */}
            <p className="text-sm text-zinc-300 leading-relaxed mb-4 relative z-10">
              Are you sure you want to finish this session?
            </p>

            {/* Session Live Status Pill */}
            <div className="p-3.5 rounded-xl bg-[#121316] border border-[#242730] flex items-center justify-between mb-6 relative z-10">
              <div className="space-y-0.5">
                <div className="text-xs font-semibold text-zinc-200 truncate max-w-[200px]">
                  {activeSession.title || 'Focused Practice Session'}
                </div>
                <div className="text-[11px] text-zinc-400">
                  {activeSession.topics.slice(0, 2).join(' · ')}
                  {activeSession.topics.length > 2 ? ` +${activeSession.topics.length - 2}` : ''}
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold block">
                  {isTimed ? 'Remaining' : 'Elapsed'}
                </span>
                <span className="font-mono text-sm font-black text-amber-400 tabular-nums">
                  {isTimed ? formatDuration(remainingMs) : formatDuration(currentElapsedMs)}
                </span>
              </div>
            </div>

            {/* Action Buttons: Cancel vs Finish Session */}
            <div className="flex items-center justify-end gap-3 relative z-10">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.12 }}
                id="finish-session-cancel-btn"
                type="button"
                onClick={cancelFinishSession}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-zinc-300 hover:text-zinc-100 hover:bg-[#22242a] border border-transparent hover:border-[#323642] focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all cursor-pointer select-none"
              >
                Cancel
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.12 }}
                id="finish-session-confirm-btn"
                type="button"
                onClick={() => {
                  confirmFinishSession();
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition-all shadow-lg shadow-amber-500/20 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer select-none"
              >
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                <span>Finish Session</span>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
