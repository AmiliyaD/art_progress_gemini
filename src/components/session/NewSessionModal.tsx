import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Play, Clock, Timer, Sparkles, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SessionType } from '../../types';
import { TopicTagInput } from '../common/TopicTagInput';
import { formatLongDuration } from '../../lib/time-utils';

const DURATION_PRESETS = [
  { label: '5 min', minutes: 5 },
  { label: '10 min', minutes: 10 },
  { label: '15 min', minutes: 15 },
  { label: '20 min', minutes: 20 },
  { label: '30 min', minutes: 30 },
  { label: '45 min', minutes: 45 },
  { label: '60 min', minutes: 60 },
  { label: '90 min', minutes: 90 },
  { label: '120 min', minutes: 120 },
];

export const NewSessionModal: React.FC = () => {
  const { isNewSessionModalOpen, setIsNewSessionModalOpen, startSession, navigateTo } = useApp();

  const [sessionType, setSessionType] = useState<SessionType>('free');
  const [selectedMinutes, setSelectedMinutes] = useState<number>(30);
  const [customMinutesInput, setCustomMinutesInput] = useState<string>('30');
  const [title, setTitle] = useState('');
  const [topics, setTopics] = useState<string[]>(['Anatomy']);
  const [goal, setGoal] = useState('');

  const handleSelectPreset = (minutes: number) => {
    setSelectedMinutes(minutes);
    setCustomMinutesInput(String(minutes));
  };

  const handleCustomMinutesChange = (val: string) => {
    setCustomMinutesInput(val);
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed > 0) {
      setSelectedMinutes(Math.min(parsed, 720)); // Cap at 12 hours max
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const durationMinutes = Math.max(1, selectedMinutes || 30);
    const timeLimitMs = durationMinutes * 60 * 1000;

    const newSession = startSession({
      title: title.trim() || undefined,
      topics: topics.length > 0 ? topics : ['General Practice'],
      goal: goal.trim() || undefined,
      sessionType,
      timeLimit: sessionType === 'timed' ? timeLimitMs : undefined
    });
    setIsNewSessionModalOpen(false);
    navigateTo('session', { sessionId: newSession.id });
  };

  return (
    <AnimatePresence>
      {isNewSessionModalOpen && (
        <motion.div
          key="new-session-modal-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop with smooth blur */}
          <motion.div
            key="new-session-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
            onClick={() => setIsNewSessionModalOpen(false)}
          />

          <motion.div
            key="new-session-modal"
            layout
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 12 }}
            transition={{
              opacity: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
              scale: { duration: 0.34, ease: [0.22, 1, 0.36, 1] },
              y: { duration: 0.34, ease: [0.22, 1, 0.36, 1] },
              layout: { duration: 0.36, ease: [0.22, 1, 0.36, 1] }
            }}
            className="relative z-10 w-full max-w-lg bg-[#181a1f] border border-[#2c2f38] rounded-2xl p-6 shadow-2xl shadow-black/60 flex flex-col max-h-[90vh] overflow-y-auto"
          >
            {/* Ambient Accent Glow (Decorative - pointer-events-none) */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between pb-4 border-b border-[#242730] relative z-10">
              <div>
                <span className="text-[11px] font-bold tracking-wider text-amber-500 uppercase flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Drawing Session
                </span>
                <h2 className="text-lg font-bold text-zinc-100">Start New Practice Session</h2>
              </div>
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                transition={{ type: "spring", stiffness: 450, damping: 25 }}
                type="button"
                onClick={() => setIsNewSessionModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-[#22242a] focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            <motion.form
              layout
              transition={{ layout: { duration: 0.36, ease: [0.22, 1, 0.36, 1] } }}
              onSubmit={handleSubmit}
              className="mt-5 space-y-5 relative z-10"
            >
              {/* Session Type Selection Tabs with Fluid Sliding Indicator */}
              <motion.div layout transition={{ layout: { duration: 0.36, ease: [0.22, 1, 0.36, 1] } }}>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                  Session Type
                </label>
                <div className="grid grid-cols-2 gap-2 p-1.5 bg-[#121317] border border-[#262832] rounded-xl relative">
                  <button
                    type="button"
                    onClick={() => setSessionType('free')}
                    className={`relative z-10 flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-left transition-colors duration-200 cursor-pointer select-none ${
                      sessionType === 'free'
                        ? 'text-amber-300 font-semibold'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Clock className={`w-4 h-4 shrink-0 transition-colors duration-200 ${sessionType === 'free' ? 'text-amber-400' : 'text-zinc-400'}`} />
                    <div>
                      <div className="text-xs font-bold leading-snug">Free Session</div>
                      <div className="text-[10px] text-zinc-400 leading-tight">Open-ended drawing</div>
                    </div>

                    {sessionType === 'free' && (
                      <motion.div
                        layoutId="activeSessionTabIndicator"
                        className="absolute inset-0 bg-[#222530] border border-amber-500/35 rounded-lg -z-10 shadow-sm"
                        transition={{ type: "spring", stiffness: 400, damping: 28, mass: 0.7 }}
                      />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSessionType('timed')}
                    className={`relative z-10 flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-left transition-colors duration-200 cursor-pointer select-none ${
                      sessionType === 'timed'
                        ? 'text-amber-300 font-semibold'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Timer className={`w-4 h-4 shrink-0 transition-colors duration-200 ${sessionType === 'timed' ? 'text-amber-400' : 'text-zinc-400'}`} />
                    <div>
                      <div className="text-xs font-bold leading-snug">Timed Session</div>
                      <div className="text-[10px] text-zinc-400 leading-tight">Strict countdown limit</div>
                    </div>

                    {sessionType === 'timed' && (
                      <motion.div
                        layoutId="activeSessionTabIndicator"
                        className="absolute inset-0 bg-[#222530] border border-amber-500/35 rounded-lg -z-10 shadow-sm"
                        transition={{ type: "spring", stiffness: 400, damping: 28, mass: 0.7 }}
                      />
                    )}
                  </button>
                </div>
              </motion.div>

              {/* Animated Timed Session Duration Configuration */}
              <AnimatePresence initial={false}>
                {sessionType === 'timed' && (
                  <motion.div
                    key="timed-config-panel"
                    layout
                    initial={{ opacity: 0, height: 0, scale: 0.98, y: -6 }}
                    animate={{ opacity: 1, height: 'auto', scale: 1, y: 0 }}
                    exit={{
                      opacity: 0,
                      height: 0,
                      scale: 0.97,
                      y: -6,
                      transition: {
                        opacity: { duration: 0.18 },
                        height: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
                        scale: { duration: 0.28, ease: [0.22, 1, 0.36, 1] }
                      }
                    }}
                    transition={{
                      opacity: { duration: 0.26 },
                      height: { duration: 0.34, ease: [0.22, 1, 0.36, 1] },
                      scale: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
                      layout: { duration: 0.34, ease: [0.22, 1, 0.36, 1] }
                    }}
                    className="p-4 rounded-xl bg-[#121419] border border-amber-500/25 space-y-3.5 overflow-hidden shadow-inner"
                  >
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                        <Timer className="w-3.5 h-3.5" />
                        <span>Target Duration</span>
                      </label>
                      <motion.span
                        key={selectedMinutes}
                        initial={{ opacity: 0, y: -3 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-xs font-bold font-mono text-amber-300"
                      >
                        {formatLongDuration((selectedMinutes || 30) * 60 * 1000)}
                      </motion.span>
                    </div>

                    {/* Presets Grid */}
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                      {DURATION_PRESETS.map(preset => {
                        const isSelected = selectedMinutes === preset.minutes;
                        return (
                          <motion.button
                            key={preset.minutes}
                            type="button"
                            whileHover={{ scale: 1.04, y: -1 }}
                            whileTap={{ scale: 0.96 }}
                            transition={{ type: "spring", stiffness: 450, damping: 25 }}
                            onClick={() => handleSelectPreset(preset.minutes)}
                            className={`relative py-2 px-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer select-none text-center ${
                              isSelected
                                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20 font-bold'
                                : 'bg-[#181a20] text-zinc-300 hover:bg-[#22242c] hover:text-white border border-[#2a2d38]'
                            }`}
                          >
                            {preset.label}
                          </motion.button>
                        );
                      })}
                    </div>

                    {/* Custom Input */}
                    <div className="flex items-center gap-2.5 pt-1.5 border-t border-[#22242c]">
                      <span className="text-xs text-zinc-400 font-medium shrink-0">Custom (min):</span>
                      <input
                        type="number"
                        min="1"
                        max="720"
                        value={customMinutesInput}
                        onChange={e => handleCustomMinutesChange(e.target.value)}
                        className="w-24 px-2.5 py-1.5 rounded-lg bg-[#181a20] border border-[#2c2f38] text-xs font-mono font-bold text-amber-300 focus:border-amber-500 focus:outline-none transition-colors"
                      />
                      <span className="text-[11px] text-zinc-400 italic">
                        Strict countdown — session automatically completes at 00:00.
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Title & Goals */}
              <motion.div
                layout
                transition={{ layout: { duration: 0.36, ease: [0.22, 1, 0.36, 1] } }}
                className="space-y-3"
              >
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Session Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. 30min Gesture Study, Portrait Color Exploration..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#121316] border border-[#262832] text-sm text-zinc-100 placeholder-zinc-400 focus:border-amber-500 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Practice Intention / Goal (Optional)
                  </label>
                  <input
                    type="text"
                    value={goal}
                    onChange={e => setGoal(e.target.value)}
                    placeholder="e.g. Focus on loose confident lines, limit brushstrokes..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#121316] border border-[#262832] text-sm text-zinc-100 placeholder-zinc-400 focus:border-amber-500 focus:outline-none transition-colors"
                  />
                </div>
              </motion.div>

              {/* Practice Topics */}
              <motion.div
                layout
                transition={{ layout: { duration: 0.36, ease: [0.22, 1, 0.36, 1] } }}
              >
                <TopicTagInput
                  selectedTopics={topics}
                  onChange={setTopics}
                  label="Practice Topics (Select or add custom)"
                />
              </motion.div>

              {/* Submit Buttons */}
              <motion.div
                layout
                transition={{ layout: { duration: 0.36, ease: [0.22, 1, 0.36, 1] } }}
                className="flex items-center justify-end gap-3 pt-4 border-t border-[#242730]"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.12 }}
                  type="button"
                  onClick={() => setIsNewSessionModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-[#22242a] focus:outline-none transition-colors cursor-pointer"
                >
                  Cancel
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.12 }}
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm shadow-lg shadow-amber-500/20 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-black stroke-none" />
                  <span>Start {sessionType === 'timed' ? 'Timed' : 'Free'} Session</span>
                </motion.button>
              </motion.div>
            </motion.form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
