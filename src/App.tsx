import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { AchievementToast } from './components/common/AchievementToast';
import { NewSessionModal } from './components/session/NewSessionModal';
import { SessionCompleteModal } from './components/session/SessionCompleteModal';
import { ArtworkModal } from './components/artwork/ArtworkModal';
import { DashboardView } from './components/dashboard/DashboardView';
import { SessionView } from './components/session/SessionView';
import { ChallengesView } from './components/challenges/ChallengesView';
import { ArtworkView } from './components/artwork/ArtworkView';
import { InsightsView } from './components/insights/InsightsView';
import { AchievementsView } from './components/achievements/AchievementsView';
import { TopicsView } from './components/topics/TopicsView';

const StudioMainContent: React.FC = () => {
  const {
    currentTab,
    isArtworkModalOpen,
    setIsArtworkModalOpen,
    artworkModalPrefill,
    setArtworkModalPrefill
  } = useApp();

  const renderActiveView = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'session':
        return <SessionView />;
      case 'challenges':
        return <ChallengesView />;
      case 'artwork':
        return <ArtworkView />;
      case 'insights':
        return <InsightsView />;
      case 'achievements':
        return <AchievementsView />;
      case 'topics':
        return <TopicsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0e0f12] text-zinc-100 selection:bg-amber-500/30 selection:text-amber-200">
      {/* Persistent Desktop Sidebar */}
      <Sidebar />

      {/* Main Studio Viewport */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Header />
        <main className="flex-1 pb-16 overflow-y-auto relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="w-full"
            >
              {renderActiveView()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Global Modals & Toast Notifications */}
      <AchievementToast />
      <NewSessionModal />
      <SessionCompleteModal />
      <ArtworkModal
        isOpen={isArtworkModalOpen}
        onClose={() => {
          setIsArtworkModalOpen(false);
          setArtworkModalPrefill(null);
        }}
        prefill={artworkModalPrefill}
      />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <StudioMainContent />
    </AppProvider>
  );
}

export default App;
