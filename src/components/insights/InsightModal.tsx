import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, BookOpen, Tag, Link as LinkIcon } from 'lucide-react';
import { Insight } from '../../types';
import { useApp } from '../../context/AppContext';
import { TopicTagInput } from '../common/TopicTagInput';
import { SUGGESTED_TAGS } from '../../lib/constants';

interface InsightModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Insight | null;
}

export const InsightModal: React.FC<InsightModalProps> = ({
  isOpen,
  onClose,
  initialData
}) => {
  const { saveInsight, updateInsight, artworks, challenges, sessions } = useApp();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>(['Technique']);
  const [relatedArtworkId, setRelatedArtworkId] = useState<string>('');
  const [relatedChallengeId, setRelatedChallengeId] = useState<string>('');
  const [relatedSessionId, setRelatedSessionId] = useState<string>('');

  // Lock background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setContent(initialData.content);
      setTags(initialData.tags || ['Technique']);
      setRelatedArtworkId(initialData.relatedArtworkId || '');
      setRelatedChallengeId(initialData.relatedChallengeId || '');
      setRelatedSessionId(initialData.relatedSessionId || '');
    } else {
      setTitle('');
      setContent('');
      setTags(['Technique']);
      setRelatedArtworkId('');
      setRelatedChallengeId('');
      setRelatedSessionId('');
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    if (initialData) {
      updateInsight(initialData.id, {
        title: title.trim(),
        content: content.trim(),
        tags: tags.length > 0 ? tags : ['Note'],
        relatedArtworkId: relatedArtworkId || undefined,
        relatedChallengeId: relatedChallengeId || undefined,
        relatedSessionId: relatedSessionId || undefined
      });
    } else {
      saveInsight({
        title: title.trim(),
        content: content.trim(),
        tags: tags.length > 0 ? tags : ['Note'],
        relatedArtworkId: relatedArtworkId || undefined,
        relatedChallengeId: relatedChallengeId || undefined,
        relatedSessionId: relatedSessionId || undefined
      });
    }

    onClose();
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="insight-modal-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 min-h-screen overflow-y-auto"
        >
          {/* Backdrop with smooth fade & blur */}
          <motion.div
            key="insight-modal-overlay"
            id="insight-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
            onClick={onClose}
          />

          {/* Modal Card */}
          <motion.div
            key="insight-modal-box"
            id="insight-modal"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 6 }}
            transition={{
              duration: 0.28,
              ease: [0.16, 1, 0.3, 1]
            }}
            className="relative z-10 w-full max-w-xl bg-[#181a1f] border border-[#2c2f38] rounded-2xl p-6 md:p-7 shadow-2xl shadow-black/80 my-auto text-left flex flex-col max-h-[90vh] overflow-y-auto overflow-x-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Ambient Accent Glow */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between pb-4 border-b border-[#242730] relative z-10">
              <div>
                <span className="text-[11px] font-bold tracking-wider text-amber-500 uppercase flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  Learning Journal
                </span>
                <h2 className="text-lg font-bold text-zinc-100">
                  {initialData ? 'Edit Learning Insight' : 'Record New Insight'}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-[#22242a] focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4 relative z-10">
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Insight Title <span className="text-amber-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Tendon rhythm on the back of the hand"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#14151a] border border-[#2c2f38] text-sm text-zinc-100 placeholder-zinc-400 focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Insight & Learnings <span className="text-amber-500">*</span>
                </label>
                <textarea
                  required
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  rows={5}
                  placeholder="Write what clicked during practice, anatomical rules to remember, brush techniques, or mindset adjustments..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#14151a] border border-[#2c2f38] text-sm text-zinc-100 placeholder-zinc-400 focus:border-amber-500 focus:outline-none resize-none leading-relaxed"
                />
              </div>

              {/* Tags */}
              <TopicTagInput
                selectedTopics={tags}
                onChange={setTags}
                suggestedList={SUGGESTED_TAGS}
                label="Tags & Categories"
                placeholder="Add tag (e.g. Hands, Lighting)..."
              />

              {/* Optional Relationships */}
              <div className="pt-2 border-t border-[#262832] space-y-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5 text-amber-500" />
                  <span>Connect to Studio Activity <span className="text-zinc-400 font-normal">(Optional)</span></span>
                </span>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  {/* Related Artwork */}
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Related Artwork</label>
                    <select
                      value={relatedArtworkId}
                      onChange={e => setRelatedArtworkId(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-[#14151a] border border-[#2c2f38] text-zinc-200 focus:border-amber-500 focus:outline-none"
                    >
                      <option value="">None</option>
                      {artworks.map(a => (
                        <option key={a.id} value={a.id}>{a.title}</option>
                      ))}
                    </select>
                  </div>

                  {/* Related Challenge */}
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Related Challenge</label>
                    <select
                      value={relatedChallengeId}
                      onChange={e => setRelatedChallengeId(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-[#14151a] border border-[#2c2f38] text-zinc-200 focus:border-amber-500 focus:outline-none"
                    >
                      <option value="">None</option>
                      {challenges.map(c => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                  </div>

                  {/* Related Session */}
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Related Session</label>
                    <select
                      value={relatedSessionId}
                      onChange={e => setRelatedSessionId(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-[#14151a] border border-[#2c2f38] text-zinc-200 focus:border-amber-500 focus:outline-none"
                    >
                      <option value="">None</option>
                      {sessions.filter(s => s.status === 'completed').map(s => (
                        <option key={s.id} value={s.id}>{s.title || s.topics.join(', ')}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#242730] flex items-center justify-end gap-3">
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
                  disabled={!title.trim() || !content.trim()}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition-colors shadow-md shadow-amber-500/10 cursor-pointer disabled:opacity-50"
                >
                  {initialData ? 'Update Insight' : 'Save Insight'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modalContent, document.body);
};

