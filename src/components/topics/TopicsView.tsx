import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Layers, Clock, PlayCircle, Palette, Search, Plus, Calendar, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatShortDuration, formatDate } from '../../lib/time-utils';
import { EmptyState } from '../common/EmptyState';

export const TopicsView: React.FC = () => {
  const { topicStats, setIsNewSessionModalOpen, navigateTo } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTopics = useMemo(() => {
    return topicStats.filter(t => t.topic.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [topicStats, searchQuery]);

  return (
    <div id="topics-view-page" className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#22242a]"
      >
        <div>
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <span>Practice Topics & Disciplines</span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#1e2028] text-zinc-400">
              {topicStats.length}
            </span>
          </h2>
          <p className="text-xs text-zinc-400">
            Transparent tracking of real time invested across your chosen drawing subjects and artistic fundamentals
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.15 }}
          onClick={() => setIsNewSessionModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-colors shadow-md shadow-amber-500/10 cursor-pointer self-start sm:self-auto select-none"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Practice Topic</span>
        </motion.button>
      </motion.div>

      {/* Search */}
      {topicStats.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center justify-between gap-4"
        >
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search practice topics..."
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#14151a] border border-[#262832] text-xs text-zinc-200 placeholder-zinc-400 focus:border-amber-500 focus:outline-none"
            />
          </div>
        </motion.div>
      )}

      {/* Topics Grid */}
      {topicStats.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No topic practice recorded yet."
          description="Start a drawing session or archive an artwork with topics like Anatomy, Hands, or Perspective to track your discipline breakdown."
          actionLabel="Start Drawing Session"
          onAction={() => setIsNewSessionModalOpen(true)}
        />
      ) : filteredTopics.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-[#14151a] border border-[#22242a] text-zinc-400 text-sm">
          No topics match your search query.
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {filteredTopics.map(stat => (
            <motion.div
              key={stat.topic}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.18 }}
              id={`topic-stat-card-${stat.topic}`}
              className="p-6 rounded-2xl bg-[#14151a] hover:bg-[#181a21] border border-[#22242a] hover:border-zinc-700/60 transition-colors flex flex-col justify-between group shadow-lg shadow-black/15"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
                    {stat.topic}
                  </span>
                  {stat.lastPracticed ? (
                    <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-zinc-400" />
                      <span>{formatDate(stat.lastPracticed)}</span>
                    </span>
                  ) : null}
                </div>

                <div className="pt-2">
                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-0.5">
                    Accumulated Practice
                  </span>
                  <div className="font-mono text-2xl font-black text-zinc-100">
                    {formatShortDuration(stat.totalTimeMs)}
                  </div>
                </div>
              </div>

              {/* Metric Breakdown */}
              <div className="pt-4 mt-4 border-t border-[#20222a] grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2 text-zinc-300 bg-[#191b22] p-2.5 rounded-xl border border-[#262832]">
                  <PlayCircle className="w-4 h-4 text-amber-500 shrink-0" />
                  <div>
                    <span className="font-bold text-zinc-200 font-mono">{stat.sessionCount}</span>
                    <span className="text-[11px] text-zinc-400 block">{stat.sessionCount === 1 ? 'session' : 'sessions'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-zinc-300 bg-[#191b22] p-2.5 rounded-xl border border-[#262832]">
                  <Palette className="w-4 h-4 text-amber-500 shrink-0" />
                  <div>
                    <span className="font-bold text-zinc-200 font-mono">{stat.artworkCount}</span>
                    <span className="text-[11px] text-zinc-400 block">{stat.artworkCount === 1 ? 'artwork' : 'artworks'}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};
