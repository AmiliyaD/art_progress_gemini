import React from 'react';
import { motion } from 'motion/react';
import {
  User,
  Clock,
  Target,
  Calendar,
  Edit3,
  Sparkles,
  Palette,
  PlayCircle,
  Flame,
  Trophy,
  Award,
  BookOpen,
  Layers,
  RotateCcw,
  CheckCircle2,
  Cloud,
  ShieldCheck,
  LogOut,
  UploadCloud,
  Database,
  Lock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatShortDuration, formatDate } from '../../lib/time-utils';

export const ProfileView: React.FC = () => {
  const {
    userProfile,
    setIsEditProfileModalOpen,
    resetProfile,
    totalDrawingTimeMs,
    totalCompletedSessionsCount,
    drawingStreak,
    artworks,
    challenges,
    achievements,
    authUser,
    signOut,
    setIsAuthModalOpen,
    setIsMigrationModalOpen,
    cloudSyncStatus
  } = useApp();

  const memberSince = userProfile?.createdAt
    ? formatDate(userProfile.createdAt)
    : 'Recently';

  const userGoals = userProfile?.goals && userProfile.goals.length > 0
    ? userProfile.goals
    : ['Simply enjoy drawing more'];

  const experience = userProfile?.customExperience || userProfile?.drawingExperience || 'Practicing Artist';

  const completedChallenges = challenges.filter(c => c.status === 'completed').length;
  const unlockedAchievements = achievements.filter(a => a.unlocked).length;

  return (
    <div id="profile-view-page" className="p-8 max-w-5xl mx-auto space-y-8">
      {/* 1. Profile Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        className="relative rounded-3xl bg-[#14151a] border border-[#22242a] p-6 sm:p-8 overflow-hidden shadow-lg shadow-black/20"
      >
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          {/* Avatar & Primary Info */}
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 via-amber-600 to-amber-800 p-[2px] shadow-xl shadow-amber-500/10">
              <div className="w-full h-full bg-[#14151a] rounded-[22px] flex items-center justify-center text-2xl font-black text-amber-400">
                {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : 'A'}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                  Artist Studio Profile
                </span>
                {authUser && (
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Cloud Synced</span>
                  </span>
                )}
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight">
                {userProfile?.name || 'Artist'}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>Drawing for <span className="text-zinc-200 font-semibold">{experience}</span></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-500" />
                  <span>Studio member since <span className="text-zinc-200 font-semibold">{memberSince}</span></span>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Profile CTA Button */}
          <div className="flex items-center gap-2.5">
            <motion.button
              id="profile-edit-btn"
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.15 }}
              onClick={() => setIsEditProfileModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-colors shadow-lg shadow-amber-500/15 cursor-pointer shrink-0 select-none"
            >
              <Edit3 className="w-4 h-4 stroke-[2.5]" />
              <span>Edit Profile</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* 2. Practice Goals Section */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
        className="p-6 sm:p-8 rounded-3xl bg-[#14151a] border border-[#22242a] space-y-4 shadow-lg shadow-black/10"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#22242a]">
          <div className="flex items-center gap-2.5">
            <Target className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-zinc-100">
              Artistic & Practice Goals
            </h3>
          </div>
          <button
            onClick={() => setIsEditProfileModalOpen(true)}
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
          >
            Manage Goals
          </button>
        </div>

        <div className="flex flex-wrap gap-2.5 pt-1">
          {userGoals.map((goal, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#181a1f] border border-amber-500/20 text-zinc-200 text-xs font-semibold shadow-sm"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>{goal}</span>
            </div>
          ))}
        </div>
      </motion.section>

      {/* 3. Studio Lifetime Statistics Grid */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-4"
      >
        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 px-1">
          Studio Lifetime Stats
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3.5">
          {/* Total Practice Time */}
          <div className="p-4 rounded-2xl bg-[#14151a] border border-[#22242a] space-y-1">
            <Clock className="w-4 h-4 text-amber-500" />
            <div className="font-mono text-xl font-bold text-zinc-100">
              {formatShortDuration(totalDrawingTimeMs)}
            </div>
            <span className="text-[10px] text-zinc-400 uppercase font-semibold block">
              Total Time
            </span>
          </div>

          {/* Sessions */}
          <div className="p-4 rounded-2xl bg-[#14151a] border border-[#22242a] space-y-1">
            <PlayCircle className="w-4 h-4 text-amber-500" />
            <div className="font-mono text-xl font-bold text-zinc-100">
              {totalCompletedSessionsCount}
            </div>
            <span className="text-[10px] text-zinc-400 uppercase font-semibold block">
              Sessions
            </span>
          </div>

          {/* Streak */}
          <div className="p-4 rounded-2xl bg-[#14151a] border border-[#22242a] space-y-1">
            <Flame className="w-4 h-4 text-amber-500" />
            <div className="font-mono text-xl font-bold text-amber-400">
              {drawingStreak} {drawingStreak === 1 ? 'day' : 'days'}
            </div>
            <span className="text-[10px] text-zinc-400 uppercase font-semibold block">
              Streak
            </span>
          </div>

          {/* Artworks */}
          <div className="p-4 rounded-2xl bg-[#14151a] border border-[#22242a] space-y-1">
            <Palette className="w-4 h-4 text-amber-500" />
            <div className="font-mono text-xl font-bold text-zinc-100">
              {artworks.length}
            </div>
            <span className="text-[10px] text-zinc-400 uppercase font-semibold block">
              Artworks
            </span>
          </div>

          {/* Completed Challenges */}
          <div className="p-4 rounded-2xl bg-[#14151a] border border-[#22242a] space-y-1">
            <Trophy className="w-4 h-4 text-amber-500" />
            <div className="font-mono text-xl font-bold text-zinc-100">
              {completedChallenges}
            </div>
            <span className="text-[10px] text-zinc-400 uppercase font-semibold block">
              Challenges
            </span>
          </div>

          {/* Achievements */}
          <div className="p-4 rounded-2xl bg-[#14151a] border border-[#22242a] space-y-1">
            <Award className="w-4 h-4 text-amber-500" />
            <div className="font-mono text-xl font-bold text-zinc-100">
              {unlockedAchievements}
            </div>
            <span className="text-[10px] text-zinc-400 uppercase font-semibold block">
              Milestones
            </span>
          </div>
        </div>
      </motion.section>

      {/* 4. Supabase Cloud Database & Storage Sync */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="p-6 sm:p-8 rounded-3xl bg-[#14151a] border border-[#22242a] space-y-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#22242a]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-amber-500" />
              <h4 className="text-base font-bold text-zinc-100">
                Supabase PostgreSQL & Cloud Storage
              </h4>
            </div>
            <p className="text-xs text-zinc-400">
              Your primary persistent database with Row Level Security and encrypted cloud backup.
            </p>
          </div>

          {authUser ? (
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => setIsMigrationModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors cursor-pointer select-none"
              >
                <UploadCloud className="w-3.5 h-3.5 text-amber-400" />
                <span>Import Local Data</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => signOut()}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold transition-colors cursor-pointer select-none"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </motion.button>
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-colors shadow-lg shadow-amber-500/15 cursor-pointer select-none"
            >
              <Cloud className="w-4 h-4" />
              <span>Connect Supabase Account</span>
            </motion.button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
          <div className="p-4 rounded-2xl bg-[#181a1f] border border-[#22242a] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-zinc-300">Auth Identity</span>
              {authUser ? (
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-amber-500/60" />
              )}
            </div>
            <p className="text-zinc-400 font-mono text-[11px] truncate">
              {authUser ? authUser.email : 'Local Guest Mode'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#181a1f] border border-[#22242a] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-zinc-300">Database Tables</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <p className="text-zinc-400 text-[11px]">
              PostgreSQL (Profiles, Sessions, Artworks, Challenges, Insights)
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#181a1f] border border-[#22242a] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-zinc-300">Storage Bucket</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <p className="text-zinc-400 text-[11px]">
              Supabase Storage Bucket: <code className="text-amber-400 font-mono">artworks</code>
            </p>
          </div>
        </div>
      </motion.section>

      {/* 5. Studio Data & Local Workspace Info */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="p-6 rounded-3xl bg-[#14151a] border border-[#22242a] space-y-4"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#22242a]">
          <div className="space-y-0.5">
            <h4 className="text-sm font-bold text-zinc-200">Local Cache & Device Backup</h4>
            <p className="text-xs text-zinc-400">High-speed offline cache preserves your workflow when network is disconnected.</p>
          </div>

          <button
            type="button"
            id="profile-reset-onboarding-btn"
            onClick={() => {
              if (window.confirm('Would you like to run the onboarding wizard again to adjust your profile setup?')) {
                resetProfile();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-zinc-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Re-run Onboarding</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-zinc-400">
          <div className="p-3.5 rounded-xl bg-[#181a1f] border border-[#22242a]">
            <span className="font-bold text-zinc-300 block mb-1">Dual-Storage Engine</span>
            Supabase Cloud acts as primary with zero-latency local caching.
          </div>
          <div className="p-3.5 rounded-xl bg-[#181a1f] border border-[#22242a]">
            <span className="font-bold text-zinc-300 block mb-1">IndexedDB Canvas Blobs</span>
            High-resolution artwork bitmaps cached for immediate preview.
          </div>
          <div className="p-3.5 rounded-xl bg-[#181a1f] border border-[#22242a]">
            <span className="font-bold text-zinc-300 block mb-1">Row Level Security</span>
            Each artist retains absolute ownership and isolation of their drawings.
          </div>
        </div>
      </motion.section>
    </div>
  );
};
