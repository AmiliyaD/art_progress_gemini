import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Check } from 'lucide-react';
import { SUGGESTED_TOPICS } from '../../lib/constants';

interface TopicTagInputProps {
  selectedTopics: string[];
  onChange: (topics: string[]) => void;
  suggestedList?: string[];
  label?: string;
  placeholder?: string;
}

export const TopicTagInput: React.FC<TopicTagInputProps> = ({
  selectedTopics,
  onChange,
  suggestedList = SUGGESTED_TOPICS,
  label = 'Practice Topics',
  placeholder = 'Add custom topic...'
}) => {
  const [customInput, setCustomInput] = useState('');

  const toggleTopic = (topic: string) => {
    if (selectedTopics.includes(topic)) {
      onChange(selectedTopics.filter(t => t !== topic));
    } else {
      onChange([...selectedTopics, topic]);
    }
  };

  const handleAddCustom = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    const clean = customInput.trim();
    if (!clean) return;

    if (!selectedTopics.some(t => t.toLowerCase() === clean.toLowerCase())) {
      onChange([...selectedTopics, clean]);
    }
    setCustomInput('');
  };

  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
          {label}
        </label>
      )}

      {/* Selected Topics Chips */}
      <div className="flex flex-wrap gap-2 min-h-[32px]">
        <AnimatePresence>
          {selectedTopics.map(topic => (
            <motion.span
              key={topic}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-medium"
            >
              <span>{topic}</span>
              <button
                type="button"
                onClick={() => toggleTopic(topic)}
                className="p-0.5 hover:bg-amber-500/30 rounded text-amber-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.span>
          ))}
        </AnimatePresence>
        {selectedTopics.length === 0 && (
          <span className="text-xs text-zinc-400 italic py-1">
            No topics selected yet. Pick from suggestions or type your own.
          </span>
        )}
      </div>

      {/* Custom Topic Input */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={customInput}
          onChange={e => setCustomInput(e.target.value)}
          onKeyDown={handleAddCustom}
          placeholder={placeholder}
          className="flex-1 px-3.5 py-2 rounded-xl bg-[#14151a] border border-[#2c2f38] text-sm text-zinc-100 placeholder-zinc-400 focus:border-amber-500 focus:outline-none transition-colors"
        />
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={handleAddCustom}
          disabled={!customInput.trim()}
          className="px-3 py-2 rounded-xl bg-[#22242a] hover:bg-amber-500 hover:text-black text-zinc-300 text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add</span>
        </motion.button>
      </div>

      {/* Suggested Quick Pick Chips */}
      <div className="space-y-1.5 pt-1">
        <span className="text-[11px] font-medium text-zinc-400">Suggested:</span>
        <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto overflow-x-hidden pr-1">
          {suggestedList.map(topic => {
            const isSelected = selectedTopics.includes(topic);
            return (
              <motion.button
                key={topic}
                type="button"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => toggleTopic(topic)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                  isSelected
                    ? 'bg-amber-500 text-black font-semibold shadow-sm'
                    : 'bg-[#181a1f] hover:bg-[#242731] text-zinc-400 hover:text-zinc-200 border border-[#2a2d36]'
                }`}
              >
                {isSelected && <Check className="w-3 h-3 stroke-[2.5]" />}
                <span>{topic}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
