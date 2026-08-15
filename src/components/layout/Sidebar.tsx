import React from 'react';
import { motion } from 'motion/react';
import {
  LayoutDashboard,
  PlayCircle,
  Trophy,
  Palette,
  BookOpen,
  Award,
  Sparkles,
  Layers,
  Pause,
  Plus
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NavigationTab } from '../../types';
import { formatDuration } from '../../lib/time-utils';

export const Sidebar: React.FC = () => {
  const {
    currentTab,
    navigateTo,
    activeSession,
    currentElapsedMs,
    setIsNewSessionModalOpen,
    drawingStreak
  } = useApp();

  const navItems: { id: NavigationTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'session', label: 'Session Studio', icon: PlayCircle },
    { id: 'challenges', label: 'Challenges', icon: Trophy },
    { id: 'artwork', label: 'Artwork Archive', icon: Palette },
    { id: 'insights', label: 'Insights & Journal', icon: BookOpen },
    { id: 'achievements', label: 'Achievements', icon: Award },
    { id: 'topics', label: 'Practice Topics', icon: Layers }
  ];

  return (
    <aside
      id="main-sidebar"
      className="w-64 bg-[#121316] border-r border-[#22242a] flex flex-col justify-between h-screen sticky top-0 shrink-0 select-none z-30"
    >
      {/* Brand Header */}
      <div className="p-6 border-b border-[#22242a]/60">
        <div
          onClick={() => navigateTo('dashboard')}
          className="flex items-center gap-3 cursor-pointer group"
          id="brand-logo-button"
        >
          <motion.div
            whileHover={{ scale: 1.05, rotate: 3 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/10 text-black font-extrabold text-sm tracking-tighter"
          >
            <Sparkles className="w-5 h-5 text-black" />
          </motion.div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-wider text-base text-zinc-100 group-hover:text-amber-400 transition-colors">
                ART<span className="text-amber-500">//</span>PROGRESS
              </span>
            </div>
            <p className="text-[11px] font-medium text-zinc-500 tracking-wide uppercase">
              Personal Art Studio
            </p>
          </div>
        </div>

        {/* Quick Start Session Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.15 }}
          id="sidebar-new-session-button"
          onClick={() => {
            if (activeSession) {
              navigateTo('session');
            } else {
              setIsNewSessionModalOpen(true);
            }
          }}
          className="mt-5 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm transition-colors shadow-md shadow-amber-500/10 cursor-pointer"
        >
          {activeSession ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-black"></span>
              </span>
              <span>Active Session</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 text-black stroke-[2.5]" />
              <span>Start Session</span>
            </>
          )}
        </motion.button>
      </div>

      {/* Navigation List */}
      <nav id="sidebar-nav-list" className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 py-1 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
          Workspace
        </div>

        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <motion.button
              key={item.id}
              id={`nav-link-${item.id}`}
              onClick={() => navigateTo(item.id)}
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer text-left relative ${
                isActive
                  ? 'bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/20 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#181a1f] border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-amber-400' : 'text-zinc-500'}`} />
              <span className="flex-1">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Active Session Sticky Pill / Footer */}
      <div className="p-4 border-t border-[#22242a]/60 space-y-3 bg-[#0e0f12]/40">
        {activeSession ? (
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.15 }}
            onClick={() => navigateTo('session')}
            id="sidebar-active-session-widget"
            className="p-3 rounded-xl bg-[#181a1f] border border-amber-500/30 hover:border-amber-500/60 transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${activeSession.status === 'paused' ? 'bg-zinc-500' : 'bg-amber-400'} opacity-75`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${activeSession.status === 'paused' ? 'bg-zinc-400' : 'bg-amber-400'}`}></span>
                </span>
                <span className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider">
                  {activeSession.status === 'paused' ? 'Paused' : 'Recording'}
                </span>
              </div>
              <span className="font-mono text-xs font-semibold text-amber-400">
                {formatDuration(currentElapsedMs)}
              </span>
            </div>

            <p className="text-xs text-zinc-400 truncate font-medium">
              {activeSession.title || activeSession.topics.join(', ')}
            </p>
          </motion.div>
        ) : (
          <div className="px-3 py-2 rounded-xl bg-[#181a1f]/60 border border-[#22242a] flex items-center justify-between text-xs text-zinc-400">
            <span className="text-zinc-400">Streak</span>
            <div className="flex items-center gap-1.5 font-semibold text-amber-400">
              <span>{drawingStreak} {drawingStreak === 1 ? 'day' : 'days'}</span>
            </div>
          </div>
        )}

        <div className="text-[11px] text-zinc-400 text-center font-medium">
          Local-First Creative Storage
        </div>
      </div>
    </aside>
  );
};
