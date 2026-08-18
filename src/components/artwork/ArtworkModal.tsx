import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Palette, Sparkles, Clock, Calendar } from 'lucide-react';
import { Artwork } from '../../types';
import { useApp } from '../../context/AppContext';
import { ImageUpload } from '../common/ImageUpload';
import { TopicTagInput } from '../common/TopicTagInput';
import { ARTWORK_MOODS } from '../../lib/constants';
import { getArtworkImageUrl } from '../../lib/image-store';

interface ArtworkModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Artwork | null;
  prefill?: Partial<Artwork> | null;
}

export const ArtworkModal: React.FC<ArtworkModalProps> = ({
  isOpen,
  onClose,
  initialData,
  prefill
}) => {
  const { saveArtwork, updateArtwork } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [topics, setTopics] = useState<string[]>(['Anatomy']);
  const [hours, setHours] = useState('0');
  const [minutes, setMinutes] = useState('30');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [mood, setMood] = useState('Satisfied');
  const [notes, setNotes] = useState('');
  const [sourceSessionId, setSourceSessionId] = useState<string | undefined>(undefined);

  const [imageFileOrBlob, setImageFileOrBlob] = useState<File | Blob | string | null>(null);
  const [currentDisplayUrl, setCurrentDisplayUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description || '');
      setTopics(initialData.topics || ['Anatomy']);
      const totalMinutes = Math.floor((initialData.durationMs || 0) / (1000 * 60));
      setHours(String(Math.floor(totalMinutes / 60)));
      setMinutes(String(totalMinutes % 60));
      setDate(initialData.date || new Date().toISOString().split('T')[0]);
      setMood(initialData.mood || 'Satisfied');
      setNotes(initialData.notes || '');
      setSourceSessionId(initialData.sourceSessionId);

      getArtworkImageUrl(initialData.imageId).then(url => {
        setCurrentDisplayUrl(url);
      });
    } else if (prefill) {
      setTitle(prefill.title || 'Session Artwork Result');
      setDescription(prefill.description || '');
      setTopics(prefill.topics && prefill.topics.length > 0 ? prefill.topics : ['Anatomy']);
      const totalMinutes = Math.floor((prefill.durationMs || 0) / (1000 * 60));
      setHours(String(Math.floor(totalMinutes / 60)));
      setMinutes(String(totalMinutes % 60));
      setDate(prefill.date || new Date().toISOString().split('T')[0]);
      setMood(prefill.mood || 'Satisfied');
      setNotes(prefill.notes || '');
      setSourceSessionId(prefill.sourceSessionId);
      setCurrentDisplayUrl(null);
    } else {
      setTitle('');
      setDescription('');
      setTopics(['Anatomy']);
      setHours('0');
      setMinutes('30');
      setDate(new Date().toISOString().split('T')[0]);
      setMood('Satisfied');
      setNotes('');
      setSourceSessionId(undefined);
      setImageFileOrBlob(null);
      setCurrentDisplayUrl(null);
    }
  }, [initialData, prefill, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Require image for new artwork
    if (!initialData && !imageFileOrBlob) {
      setErrorMessage('Please upload an artwork image.');
      return;
    }

    setIsSaving(true);

    try {
      const durationMs = (parseInt(hours || '0', 10) * 60 + parseInt(minutes || '0', 10)) * 60 * 1000;

      if (initialData) {
        // Edit
        await updateArtwork(
          initialData.id,
          {
            title: title.trim() || 'Untitled Artwork',
            description: description.trim() || undefined,
            topics: topics.length > 0 ? topics : ['General Study'],
            durationMs,
            date,
            mood: mood || undefined,
            notes: notes.trim() || undefined,
            sourceSessionId
          },
          imageFileOrBlob || undefined
        );
      } else if (imageFileOrBlob) {
        // Create new
        await saveArtwork(
          {
            title: title.trim() || 'Untitled Artwork',
            description: description.trim() || undefined,
            topics: topics.length > 0 ? topics : ['General Study'],
            durationMs,
            date,
            mood: mood || undefined,
            notes: notes.trim() || undefined,
            sourceSessionId
          },
          imageFileOrBlob
        );
      }

      onClose();
    } catch (err) {
      console.error('Failed to save artwork:', err);
      setErrorMessage('Failed to save artwork. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="artwork-modal-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            id="artwork-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
            onClick={onClose}
          />

          <motion.div
            id="artwork-modal"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full max-w-2xl bg-[#181a1f] border border-[#2c2f38] rounded-2xl p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#242730]">
              <div>
                <span className="text-[11px] font-bold tracking-wider text-amber-500 uppercase">
                  {initialData ? 'Edit Artwork' : 'Artwork Archive'}
                </span>
                <h2 className="text-lg font-bold text-zinc-100">
                  {initialData ? 'Update Artwork Details' : 'Save Artwork to Archive'}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-[#22242a] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Source Session Banner if linked */}
            {sourceSessionId && (
              <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2 text-xs text-amber-300">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Connected to completed Drawing Session. Topics & drawing duration were pre-filled.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {/* Image Upload */}
              <ImageUpload
                currentImageUrl={currentDisplayUrl}
                onImageSelected={file => {
                  setImageFileOrBlob(file);
                  setErrorMessage(null);
                }}
                onRemove={() => {
                  setImageFileOrBlob(null);
                  setCurrentDisplayUrl(null);
                }}
              />

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Artwork Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Master study of expressive hands"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#14151a] border border-[#2c2f38] text-sm text-zinc-100 placeholder-zinc-400 focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Topics */}
              <TopicTagInput
                selectedTopics={topics}
                onChange={setTopics}
                label="Artwork Topics"
              />

              {/* Drawing Time & Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>Drawing Time</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 flex items-center bg-[#14151a] border border-[#2c2f38] rounded-xl px-3 py-1.5 focus-within:border-amber-500">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={hours}
                        onChange={e => setHours(e.target.value)}
                        className="w-full bg-transparent text-sm text-zinc-100 focus:outline-none"
                      />
                      <span className="text-xs text-zinc-400">hrs</span>
                    </div>
                    <div className="flex-1 flex items-center bg-[#14151a] border border-[#2c2f38] rounded-xl px-3 py-1.5 focus-within:border-amber-500">
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={minutes}
                        onChange={e => setMinutes(e.target.value)}
                        className="w-full bg-transparent text-sm text-zinc-100 focus:outline-none"
                      />
                      <span className="text-xs text-zinc-400">mins</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-500" />
                    <span>Creation Date</span>
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#14151a] border border-[#2c2f38] text-xs text-zinc-200 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Mood & Description */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Session Mood / Feeling
                  </label>
                  <select
                    value={mood}
                    onChange={e => setMood(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#14151a] border border-[#2c2f38] text-xs text-zinc-200 focus:border-amber-500 focus:outline-none cursor-pointer"
                  >
                    {ARTWORK_MOODS.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Description <span className="text-zinc-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Short description or medium..."
                    className="w-full px-3.5 py-2 rounded-xl bg-[#14151a] border border-[#2c2f38] text-xs text-zinc-200 placeholder-zinc-400 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Practice Notes & Insights
                </label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={2}
                  placeholder="What worked well? What anatomical/spatial concepts need further work?"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#14151a] border border-[#2c2f38] text-xs text-zinc-200 placeholder-zinc-400 focus:border-amber-500 focus:outline-none resize-none"
                />
              </div>

              {errorMessage && (
                <p className="text-xs text-rose-400 font-medium">{errorMessage}</p>
              )}

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
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition-colors shadow-md shadow-amber-500/10 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : initialData ? 'Update Artwork' : 'Save Artwork'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
