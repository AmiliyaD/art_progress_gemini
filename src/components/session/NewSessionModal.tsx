import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Play, Target } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TopicTagInput } from '../common/TopicTagInput';

export const NewSessionModal: React.FC = () => {
  const { isNewSessionModalOpen, setIsNewSessionModalOpen, startSession, navigateTo } = useApp();

  const [title, setTitle] = useState('');
  const [topics, setTopics] = useState<string[]>(['Anatomy']);
  const [goal, setGoal] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startSession({
      title: title.trim() || undefined,
      topics: topics.length > 0 ? topics : ['General Practice'],
      goal: goal.trim() || undefined
    });
    setIsNewSessionModalOpen(false);
    navigateTo('session');
  };

  return (
    <AnimatePresence>
      {isNewSessionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            id="new-session-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setIsNewSessionModalOpen(false)}
          />

          <motion.div
            id="new-session-modal"
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-lg bg-[#181a1f] border border-[#2c2f38] rounded-2xl p-6 shadow-2xl shadow-black/60 flex flex-col max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#242730]">
              <div>
                <span className="text-[11px] font-bold tracking-wider text-amber-500 uppercase">
                  Drawing Session
                </span>
                <h2 className="text-lg font-bold text-zinc-100">Start New Practice Session</h2>
              </div>
              <button
                onClick={() => setIsNewSessionModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-[#22242a] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-5">
              {/* Session Title */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Session Title <span className="text-zinc-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Dynamic hand foreshortening study"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#14151a] border border-[#2c2f38] text-sm text-zinc-100 placeholder-zinc-400 focus:border-amber-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Practice Topics */}
              <TopicTagInput
                selectedTopics={topics}
                onChange={setTopics}
                label="Practice Topics"
                placeholder="Add topic (e.g. Hands, Anatomy, Gesture)..."
              />

              {/* Optional Session Goal */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-amber-500" />
                  <span>Session Goal <span className="text-zinc-400 font-normal">(Optional)</span></span>
                </label>
                <textarea
                  value={goal}
                  onChange={e => setGoal(e.target.value)}
                  rows={2}
                  placeholder="e.g. Practice drawing hands from unusual angles and focus on 3D knuckle planes."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#14151a] border border-[#2c2f38] text-sm text-zinc-100 placeholder-zinc-400 focus:border-amber-500 focus:outline-none transition-colors resize-none"
                />
              </div>

              <div className="pt-3 border-t border-[#242730] flex items-center justify-end gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setIsNewSessionModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-zinc-200 hover:bg-[#22242a] transition-colors cursor-pointer"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition-colors shadow-md shadow-amber-500/10 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-black stroke-none" />
                  <span>Start Session</span>
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
