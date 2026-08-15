import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trophy, Sparkles } from 'lucide-react';
import { Challenge } from '../../types';
import { ACCENT_COLORS } from '../../lib/constants';

interface ChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    title: string;
    description: string;
    startDate: string;
    endDate?: string;
    duration: string;
    accent: string;
    dailyGoal?: string;
  }) => void;
  initialData?: Challenge | null;
}

export const ChallengeModal: React.FC<ChallengeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [duration, setDuration] = useState('30 days');
  const [accent, setAccent] = useState('#f59e0b');
  const [dailyGoal, setDailyGoal] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description);
      setStartDate(initialData.startDate || new Date().toISOString().split('T')[0]);
      setDuration(initialData.duration || '30 days');
      setAccent(initialData.accent || '#f59e0b');
      setDailyGoal(initialData.dailyGoal || '');
    } else {
      setTitle('');
      setDescription('');
      setStartDate(new Date().toISOString().split('T')[0]);
      setDuration('30 days');
      setAccent('#f59e0b');
      setDailyGoal('');
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      description: description.trim(),
      startDate,
      duration,
      accent,
      dailyGoal: dailyGoal.trim() || undefined
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            id="challenge-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            onClick={onClose}
          />

          <motion.div
            id="challenge-modal"
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-lg bg-[#181a1f] border border-[#2c2f38] rounded-2xl p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#242730]">
              <div>
                <span className="text-[11px] font-bold tracking-wider text-amber-500 uppercase">
                  {initialData ? 'Edit Challenge' : 'New Challenge'}
                </span>
                <h2 className="text-lg font-bold text-zinc-100">
                  {initialData ? 'Update Challenge Details' : 'Create Drawing Challenge'}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-[#22242a] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {/* Challenge Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Challenge Name <span className="text-amber-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. 30 Days of Hands"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#14151a] border border-[#2c2f38] text-sm text-zinc-100 placeholder-zinc-400 focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={2}
                  placeholder="e.g. Practice drawing hands from different angles every day."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#14151a] border border-[#2c2f38] text-sm text-zinc-100 placeholder-zinc-400 focus:border-amber-500 focus:outline-none resize-none"
                />
              </div>

              {/* Start Date & Duration */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#14151a] border border-[#2c2f38] text-xs text-zinc-200 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Duration
                  </label>
                  <select
                    value={duration}
                    onChange={e => setDuration(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#14151a] border border-[#2c2f38] text-xs text-zinc-200 focus:border-amber-500 focus:outline-none cursor-pointer"
                  >
                    <option value="7 days">7 Days</option>
                    <option value="14 days">14 Days</option>
                    <option value="30 days">30 Days</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>
              </div>

              {/* Accent Color Picker */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Accent Theme Color
                </label>
                <div className="flex items-center gap-2">
                  {ACCENT_COLORS.map(color => (
                    <motion.button
                      key={color.hex}
                      type="button"
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setAccent(color.hex)}
                      className={`w-7 h-7 rounded-full transition-all cursor-pointer flex items-center justify-center ${
                        accent === color.hex ? 'ring-2 ring-white ring-offset-2 ring-offset-[#181a1f] scale-110' : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Daily Goal */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Daily Goal / Guideline <span className="text-zinc-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={dailyGoal}
                  onChange={e => setDailyGoal(e.target.value)}
                  placeholder="e.g. Draw for at least 20 minutes each day"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#14151a] border border-[#2c2f38] text-sm text-zinc-100 placeholder-zinc-400 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-[#242730] flex items-center justify-end gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-400 hover:text-zinc-200 hover:bg-[#22242a] transition-colors cursor-pointer"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={!title.trim()}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition-colors shadow-md shadow-amber-500/10 cursor-pointer disabled:opacity-50"
                >
                  {initialData ? 'Update Challenge' : 'Create Challenge'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
