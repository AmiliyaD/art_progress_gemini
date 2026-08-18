import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Plus, Search, Filter, Tag } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Insight } from '../../types';
import { InsightCard } from './InsightCard';
import { InsightModal } from './InsightModal';
import { ConfirmModal } from '../common/ConfirmModal';
import { EmptyState } from '../common/EmptyState';

export const InsightsView: React.FC = () => {
  const { insights, deleteInsight } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [insightToEdit, setInsightToEdit] = useState<Insight | null>(null);
  const [insightToDelete, setInsightToDelete] = useState<Insight | null>(null);

  // Extract unique tags
  const allTags = useMemo(() => {
    const set = new Set<string>();
    insights.forEach(i => i.tags.forEach(t => set.add(t)));
    return Array.from(set);
  }, [insights]);

  // Filter insights
  const filteredInsights = useMemo(() => {
    return insights.filter(i => {
      const matchSearch =
        !searchQuery ||
        i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchTag =
        selectedTag === 'all' || i.tags.includes(selectedTag);

      return matchSearch && matchTag;
    });
  }, [insights, searchQuery, selectedTag]);

  return (
    <div id="insights-view-page" className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.48, delay: 0.04, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#22242a]"
      >
        <div>
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <span>Learning Insights & Journal</span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#1e2028] text-zinc-400">
              {insights.length}
            </span>
          </h2>
          <p className="text-xs text-zinc-400">
            Document breakthroughs, technical notes, anatomical rules, and creative mindsets
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.15 }}
          id="add-insight-btn"
          onClick={() => {
            setInsightToEdit(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-colors shadow-md shadow-amber-500/10 cursor-pointer self-start sm:self-auto select-none"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>+ New Insight</span>
        </motion.button>
      </motion.div>

      {/* Search & Tag Filter */}
      {insights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.48, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col md:flex-row items-center justify-between gap-4"
        >
          {/* Tag Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 w-full md:w-auto">
            <button
              onClick={() => setSelectedTag('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedTag === 'all'
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  : 'bg-[#14151a] hover:bg-[#1c1e26] text-zinc-400 border border-[#22242a]'
              }`}
            >
              All Notes ({insights.length})
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedTag === tag
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    : 'bg-[#14151a] hover:bg-[#1c1e26] text-zinc-400 border border-[#22242a]'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search title, content, or tags..."
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#14151a] border border-[#262832] text-xs text-zinc-200 placeholder-zinc-400 focus:border-amber-500 focus:outline-none"
            />
          </div>
        </motion.div>
      )}

      {/* Grid of Insights */}
      {insights.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No insights yet."
          description="Record key lessons, anatomical realizations, or creative techniques discovered during your practice."
          actionLabel="Write First Insight"
          onAction={() => {
            setInsightToEdit(null);
            setIsModalOpen(true);
          }}
        />
      ) : filteredInsights.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-[#14151a] border border-[#22242a] text-zinc-400 text-sm">
          No insights match your search query or tag filter.
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.48, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredInsights.map(insight => (
            <InsightCard
              key={insight.id}
              insight={insight}
              onEdit={() => {
                setInsightToEdit(insight);
                setIsModalOpen(true);
              }}
              onDelete={() => setInsightToDelete(insight)}
            />
          ))}
        </motion.div>
      )}

      {/* Create / Edit Modal */}
      <InsightModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setInsightToEdit(null);
        }}
        initialData={insightToEdit}
      />

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={Boolean(insightToDelete)}
        title="Delete this insight?"
        message={`Are you sure you want to delete "${insightToDelete?.title}"?`}
        confirmLabel="Delete Insight"
        onConfirm={() => {
          if (insightToDelete) {
            deleteInsight(insightToDelete.id);
            setInsightToDelete(null);
          }
        }}
        onCancel={() => setInsightToDelete(null)}
      />
    </div>
  );
};
