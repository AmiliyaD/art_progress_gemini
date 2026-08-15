import React, { useState, useMemo } from 'react';
import { Palette, Plus, Search, Filter, Sparkles, SlidersHorizontal } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Artwork } from '../../types';
import { ArtworkCard } from './ArtworkCard';
import { ArtworkModal } from './ArtworkModal';
import { ArtworkDetailModal } from './ArtworkDetailModal';
import { ConfirmModal } from '../common/ConfirmModal';
import { EmptyState } from '../common/EmptyState';

export const ArtworkView: React.FC = () => {
  const {
    artworks,
    selectedArtworkId,
    navigateTo,
    deleteArtwork,
    isArtworkModalOpen,
    setIsArtworkModalOpen,
    artworkModalPrefill,
    setArtworkModalPrefill
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [artworkToEdit, setArtworkToEdit] = useState<Artwork | null>(null);
  const [artworkToDelete, setArtworkToDelete] = useState<Artwork | null>(null);
  const [previewArtworkId, setPreviewArtworkId] = useState<string | null>(selectedArtworkId);

  // Extract unique topics from artworks
  const allArtworkTopics = useMemo(() => {
    const set = new Set<string>();
    artworks.forEach(a => a.topics.forEach(t => set.add(t)));
    return Array.from(set);
  }, [artworks]);

  // Filter artworks
  const filteredArtworks = useMemo(() => {
    return artworks.filter(a => {
      const matchSearch =
        !searchQuery ||
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.description && a.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        a.topics.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (a.notes && a.notes.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchTopic =
        selectedTopic === 'all' || a.topics.includes(selectedTopic);

      return matchSearch && matchTopic;
    });
  }, [artworks, searchQuery, selectedTopic]);

  const handleOpenDetail = (artwork: Artwork) => {
    setPreviewArtworkId(artwork.id);
  };

  const handleStartAdd = () => {
    setArtworkToEdit(null);
    setArtworkModalPrefill(null);
    setIsArtworkModalOpen(true);
  };

  return (
    <div id="artwork-view-page" className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#22242a]">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <span>Artwork Archive</span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#1e2028] text-zinc-400">
              {artworks.length}
            </span>
          </h2>
          <p className="text-xs text-zinc-400">
            Personal gallery of completed studies, sketches, and finished masterworks
          </p>
        </div>

        <button
          id="add-artwork-btn"
          onClick={handleStartAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-black font-bold text-xs transition-all shadow-md shadow-amber-500/10 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>+ Add Artwork</span>
        </button>
      </div>

      {/* Search & Topic Filters */}
      {artworks.length > 0 && (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Topic Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 w-full md:w-auto">
            <button
              onClick={() => setSelectedTopic('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedTopic === 'all'
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  : 'bg-[#14151a] hover:bg-[#1c1e26] text-zinc-400 border border-[#22242a]'
              }`}
            >
              All Works ({artworks.length})
            </button>
            {allArtworkTopics.map(topic => (
              <button
                key={topic}
                onClick={() => setSelectedTopic(topic)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedTopic === topic
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    : 'bg-[#14151a] hover:bg-[#1c1e26] text-zinc-400 border border-[#22242a]'
                }`}
              >
                {topic}
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
              placeholder="Search by title, medium, notes..."
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#14151a] border border-[#262832] text-xs text-zinc-200 placeholder-zinc-400 focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Grid of Artworks */}
      {artworks.length === 0 ? (
        <EmptyState
          icon={Palette}
          title="No artworks yet."
          description="Upload your first artwork or save a result directly from a completed drawing session."
          actionLabel="Add Artwork"
          onAction={handleStartAdd}
        />
      ) : filteredArtworks.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-[#14151a] border border-[#22242a] text-zinc-400 text-sm">
          No artworks match your search query or topic filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredArtworks.map(artwork => (
            <ArtworkCard
              key={artwork.id}
              artwork={artwork}
              onOpen={() => handleOpenDetail(artwork)}
              onEdit={() => {
                setArtworkToEdit(artwork);
                setIsArtworkModalOpen(true);
              }}
              onDelete={() => setArtworkToDelete(artwork)}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Artwork Modal */}
      <ArtworkModal
        isOpen={isArtworkModalOpen || Boolean(artworkToEdit)}
        onClose={() => {
          setIsArtworkModalOpen(false);
          setArtworkToEdit(null);
          setArtworkModalPrefill(null);
        }}
        initialData={artworkToEdit}
        prefill={artworkModalPrefill}
      />

      {/* Artwork High-Res Detail Viewer */}
      {previewArtworkId && (
        <ArtworkDetailModal
          artworkId={previewArtworkId}
          onClose={() => {
            setPreviewArtworkId(null);
            navigateTo('artwork', { artworkId: undefined });
          }}
          onEdit={artwork => {
            setPreviewArtworkId(null);
            setArtworkToEdit(artwork);
            setIsArtworkModalOpen(true);
          }}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={Boolean(artworkToDelete)}
        title="Delete Artwork"
        message={`Are you sure you want to delete "${artworkToDelete?.title}"? This cannot be undone.`}
        confirmLabel="Delete Artwork"
        onConfirm={async () => {
          if (artworkToDelete) {
            await deleteArtwork(artworkToDelete.id);
            setArtworkToDelete(null);
          }
        }}
        onCancel={() => setArtworkToDelete(null)}
      />
    </div>
  );
};
