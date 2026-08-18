import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  isDestructive = true
}) => {
  // Lock body scroll when modal is open
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
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="confirm-modal-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 min-h-screen overflow-y-auto"
        >
          <motion.div
            key="confirm-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
            onClick={onCancel}
          />
          <motion.div
            key="confirm-modal-box"
            initial={{ opacity: 0, scale: 0.94, y: 0 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-md bg-[#181a1f] border border-[#2c2f38] rounded-2xl p-6 md:p-7 shadow-2xl shadow-black/80 my-auto overflow-hidden text-left"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDestructive ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-zinc-100">{title}</h3>
              </div>
              <button
                type="button"
                onClick={onCancel}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-[#22242a] focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
              {message}
            </p>

            <div className="flex items-center justify-end gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={onCancel}
                className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-300 hover:bg-[#22242a] focus:outline-none focus:ring-2 focus:ring-zinc-600 transition-colors cursor-pointer"
              >
                {cancelLabel}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={onConfirm}
                className={`px-4 py-2 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 transition-colors cursor-pointer ${
                  isDestructive
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/20 focus:ring-rose-500'
                    : 'bg-amber-500 hover:bg-amber-400 text-black shadow-md shadow-amber-500/10 focus:ring-amber-500'
                }`}
              >
                {confirmLabel}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modalContent, document.body);
};

