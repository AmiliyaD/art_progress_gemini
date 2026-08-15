import React, { useState, useMemo } from 'react';
import {
  PlayCircle,
  Plus,
  Clock,
  Calendar,
  Layers,
  Palette,
  Trash2,
  Search,
  CheckCircle2,
  Sparkles,
  Filter
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ActiveSessionCard } from './ActiveSessionCard';
import { EmptyState } from '../common/EmptyState';
import { ConfirmModal } from '../common/ConfirmModal';
import { formatDuration, formatShortDuration, formatDateTime } from '../../lib/time-utils';

export const SessionView: React.FC = () => {
  const {
    activeSession,
    sessions,
    artworks,
    setIsNewSessionModalOpen,
    deleteSession,
    navigateTo
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopicFilter, setSelectedTopicFilter] = useState<string>('all');
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);

  // Extract unique topics from history
  const allTopics = useMemo(() => {
    const set = new Set<string>();
    sessions.forEach(s => s.topics.forEach(t => set.add(t)));
    return Array.from(set);
  }, [sessions]);

  // Completed sessions list
  const completedSessions = useMemo(() => {
    return sessions.filter(s => s.status === 'completed');
  }, [sessions]);

  // Filtered sessions
  const filteredSessions = useMemo(() => {
    return completedSessions.filter(s => {
      const matchSearch =
        !searchQuery ||
        (s.title && s.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (s.goal && s.goal.toLowerCase().includes(searchQuery.toLowerCase())) ||
        s.topics.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchTopic =
        selectedTopicFilter === 'all' || s.topics.includes(selectedTopicFilter);

      return matchSearch && matchTopic;
    });
  }, [completedSessions, searchQuery, selectedTopicFilter]);

  // Check if session has linked artworks
  const getLinkedArtworks = (sessionId: string) => {
    return artworks.filter(a => a.sourceSessionId === sessionId);
  };

  return (
    <div id="session-view-page" className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Top Banner / Active Session or Start New Session Prompt */}
      {activeSession ? (
        <section id="active-session-section">
          <ActiveSessionCard />
        </section>
      ) : (
        <section
          id="no-active-session-banner"
          className="p-8 rounded-2xl bg-[#14151a] border border-[#22242a] flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="space-y-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-zinc-400 text-xs font-semibold uppercase tracking-wider">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>Session Studio</span>
            </div>
            <h2 className="text-xl font-bold text-zinc-100">Ready to practice drawing?</h2>
            <p className="text-sm text-zinc-400 max-w-md">
              Start a live session to track your drawing time, select topics, and optionally archive artwork results.
            </p>
          </div>

          <button
            id="session-view-start-btn"
            onClick={() => setIsNewSessionModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-black font-bold text-sm transition-all shadow-lg shadow-amber-500/15 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Start New Session</span>
          </button>
        </section>
      )}

      {/* Session History Header & Filters */}
      <section id="session-history-section" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#22242a]">
          <div>
            <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <span>Session History</span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#1e2028] text-zinc-400">
                {completedSessions.length}
              </span>
            </h3>
            <p className="text-xs text-zinc-400">
              Chronological log of your real drawing sessions
            </p>
          </div>

          {/* Search & Topic Filter */}
          {completedSessions.length > 0 && (
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search sessions..."
                  className="pl-8 pr-3 py-1.5 rounded-xl bg-[#14151a] border border-[#262832] text-xs text-zinc-200 placeholder-zinc-400 focus:border-amber-500 focus:outline-none w-44 md:w-56"
                />
              </div>

              {allTopics.length > 0 && (
                <select
                  value={selectedTopicFilter}
                  onChange={e => setSelectedTopicFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-[#14151a] border border-[#262832] text-xs text-zinc-300 focus:border-amber-500 focus:outline-none cursor-pointer"
                >
                  <option value="all">All Topics</option>
                  {allTopics.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              )}
            </div>
          )}
        </div>

        {/* Sessions List */}
        {completedSessions.length === 0 ? (
          <EmptyState
            icon={PlayCircle}
            title="No sessions yet."
            description="Start your first drawing session to begin recording your creative practice time and topics."
            actionLabel="Start First Session"
            onAction={() => setIsNewSessionModalOpen(true)}
          />
        ) : filteredSessions.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-[#14151a] border border-[#22242a] text-zinc-400 text-sm">
            No drawing sessions match your search or filter.
          </div>
        ) : (
          <div className="grid gap-3">
            {filteredSessions.map(session => {
              const linkedArtworks = getLinkedArtworks(session.id);

              return (
                <div
                  key={session.id}
                  id={`session-row-${session.id}`}
                  className="p-5 rounded-2xl bg-[#14151a] hover:bg-[#181a20] border border-[#22242a] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h4 className="text-sm font-bold text-zinc-200">
                        {session.title || 'Drawing Practice Session'}
                      </h4>
                      <span className="text-xs text-zinc-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-zinc-400" />
                        <span>{formatDateTime(session.completedAt || session.startedAt)}</span>
                      </span>
                    </div>

                    {session.goal && (
                      <p className="text-xs text-zinc-400 italic">
                        Goal: {session.goal}
                      </p>
                    )}

                    {/* Topics */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {session.topics.map(t => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded-md bg-[#1f222a] border border-[#2c303c] text-zinc-300 text-[11px] font-medium"
                        >
                          {t}
                        </span>
                      ))}

                      {/* Linked Artworks Badge */}
                      {linkedArtworks.length > 0 && (
                        <button
                          onClick={() => navigateTo('artwork', { artworkId: linkedArtworks[0].id })}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-semibold hover:bg-amber-500/25 transition-colors cursor-pointer"
                        >
                          <Palette className="w-3 h-3" />
                          <span>{linkedArtworks.length} {linkedArtworks.length === 1 ? 'Artwork' : 'Artworks'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Duration & Delete Action */}
                  <div className="flex items-center gap-4 self-end md:self-center">
                    <div className="text-right">
                      <span className="font-mono text-base font-black text-amber-400 tabular-nums">
                        {formatDuration(session.duration)}
                      </span>
                      <span className="text-[10px] block text-zinc-400 font-medium">
                        ({formatShortDuration(session.duration)})
                      </span>
                    </div>

                    <button
                      onClick={() => setSessionToDelete(session.id)}
                      className="p-2 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                      title="Delete session"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={Boolean(sessionToDelete)}
        title="Delete Drawing Session"
        message="Are you sure you want to delete this recorded session? This will remove this drawing time from your total statistics."
        confirmLabel="Delete Session"
        onConfirm={() => {
          if (sessionToDelete) {
            deleteSession(sessionToDelete);
            setSessionToDelete(null);
          }
        }}
        onCancel={() => setSessionToDelete(null)}
      />
    </div>
  );
};
