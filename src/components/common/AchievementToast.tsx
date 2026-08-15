import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Award, Trophy, PlayCircle, Flame, Clock, Hourglass, Compass, Crown, ShieldCheck, Target, Palette, Layers, X, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Award,
  Trophy,
  PlayCircle,
  Flame,
  Clock,
  Hourglass,
  Compass,
  Crown,
  ShieldCheck,
  Target,
  Palette,
  Layers
};

export const AchievementToast: React.FC = () => {
  const { recentlyUnlockedAchievement, dismissAchievementToast } = useApp();

  return (
    <AnimatePresence>
      {recentlyUnlockedAchievement && (() => {
        const Icon = ICON_MAP[recentlyUnlockedAchievement.icon] || Award;
        return (
          <motion.div
            id="achievement-unlock-toast"
            initial={{ opacity: 0, y: 30, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="fixed bottom-6 right-6 z-50 max-w-md w-full"
          >
            <div className="p-4 rounded-2xl bg-[#181a1f] border-2 border-amber-500/40 shadow-2xl shadow-amber-500/20 flex items-start gap-4 relative overflow-hidden backdrop-blur-xl">
              {/* Glow effect */}
              <div className="absolute top-0 right-0 -mr-10 -mt-10 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

              <motion.div
                initial={{ scale: 0.7, rotate: -15 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 18, delay: 0.05 }}
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black shrink-0 shadow-lg shadow-amber-500/20"
              >
                <Icon className="w-6 h-6 stroke-[2.5]" />
              </motion.div>

              <div className="flex-1 pr-6">
                <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold tracking-wider uppercase mb-0.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Achievement Unlocked</span>
                </div>
                <h4 className="text-base font-bold text-zinc-100 mb-1">
                  {recentlyUnlockedAchievement.title}
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {recentlyUnlockedAchievement.description}
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={dismissAchievementToast}
                className="absolute top-3 right-3 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-[#22242a] transition-colors cursor-pointer"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        );
      })()}
    </AnimatePresence>
  );
};
