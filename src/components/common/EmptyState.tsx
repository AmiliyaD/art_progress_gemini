import React from 'react';
import { motion } from 'motion/react';
import { LucideIcon, Plus } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  id?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  id = 'empty-state-container'
}) => {
  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="p-10 rounded-2xl bg-[#14151a] border border-[#22242a] flex flex-col items-center justify-center text-center max-w-lg mx-auto my-8"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 350, damping: 22, delay: 0.05 }}
        className="w-14 h-14 rounded-2xl bg-[#1c1e24] border border-[#2c2f38] flex items-center justify-center text-amber-500/80 mb-4 shadow-inner"
      >
        <Icon className="w-7 h-7 stroke-[1.75]" />
      </motion.div>

      <h3 className="text-base font-bold text-zinc-200 mb-1.5">{title}</h3>
      <p className="text-sm text-zinc-400 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>

      {actionLabel && onAction && (
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onAction}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm transition-colors shadow-md shadow-amber-500/10 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>{actionLabel}</span>
        </motion.button>
      )}
    </motion.div>
  );
};
