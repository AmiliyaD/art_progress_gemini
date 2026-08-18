import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Trophy, Plus, Search, Filter, Sparkles, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Challenge } from '../../types';
import { ChallengeCard } from './ChallengeCard';
import { ChallengeDetail } from './ChallengeDetail';
import { ChallengeModal } from './ChallengeModal';
import { EmptyState } from '../common/EmptyState';

export const ChallengesView: React.FC = () => {
  const {
    challenges,
    selectedChallengeId,
    navigateTo,
    createChallenge,
    updateChallenge
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'paused'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [challengeToEdit, setChallengeToEdit] = useState<Challenge | null>(null);

  // Filter challenges
  const filteredChallenges = useMemo(() => {
    return challenges.filter(c => {
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'completed' && (c.status === 'completed' || (c.tasks?.length > 0 && c.tasks.every(t => t.completed)))) ||
        (statusFilter === 'active' && c.status === 'active' && !(c.tasks?.length > 0 && c.tasks.every(t => t.completed))) ||
        (statusFilter === 'paused' && c.status === 'paused');

      const matchSearch =
        !searchQuery ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchStatus && matchSearch;
    });
  }, [challenges, statusFilter, searchQuery]);

  // If a specific challenge is selected, show detail view
  if (selectedChallengeId) {
    return (
      <ChallengeDetail
        challengeId={selectedChallengeId}
        onBack={() => navigateTo('challenges', { challengeId: undefined })}
        onEditChallenge={c => setChallengeToEdit(c)}
      />
    );
  }

  return (
    <div id="challenges-view-page" className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#22242a]"
      >
        <div>
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <span>Drawing Challenges</span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#1e2028] text-zinc-400">
              {challenges.length}
            </span>
          </h2>
          <p className="text-xs text-zinc-400">
            Structured daily drawing commitments to build disciplined art habits
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.15 }}
          id="create-challenge-btn"
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-colors shadow-md shadow-amber-500/10 cursor-pointer self-start sm:self-auto select-none"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>+ New Challenge</span>
        </motion.button>
      </motion.div>

      {/* Filter Tabs & Search */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#14151a] border border-[#22242a] w-full sm:w-auto">
          {(['all', 'active', 'completed', 'paused'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                statusFilter === tab
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search challenges..."
            className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#14151a] border border-[#262832] text-xs text-zinc-200 placeholder-zinc-400 focus:border-amber-500 focus:outline-none"
          />
        </div>
      </motion.div>

      {/* Grid of Challenges */}
      {filteredChallenges.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="No challenges found."
          description={
            searchQuery
              ? 'No challenges match your search terms.'
              : 'Create a custom drawing challenge to practice with deliberate daily focus.'
          }
          actionLabel="Create Challenge"
          onAction={() => setIsCreateModalOpen(true)}
        />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredChallenges.map(challenge => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              onClick={() => navigateTo('challenges', { challengeId: challenge.id })}
            />
          ))}
        </motion.div>
      )}

      {/* Create / Edit Challenge Modal */}
      <ChallengeModal
        isOpen={isCreateModalOpen || Boolean(challengeToEdit)}
        onClose={() => {
          setIsCreateModalOpen(false);
          setChallengeToEdit(null);
        }}
        initialData={challengeToEdit}
        onSave={data => {
          if (challengeToEdit) {
            updateChallenge(challengeToEdit.id, data);
          } else {
            createChallenge(data);
          }
          setIsCreateModalOpen(false);
          setChallengeToEdit(null);
        }}
      />
    </div>
  );
};
