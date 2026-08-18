import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CloudUpload, CheckCircle2, AlertCircle, Loader2, Sparkles, Database, Layers, Clock, Palette } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const MigrationModal: React.FC = () => {
  const {
    isMigrationModalOpen,
    setIsMigrationModalOpen,
    migrationStatus,
    performMigration
  } = useApp();

  const [migrating, setMigrating] = useState(false);
  const [progressStep, setProgressStep] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [migrationDone, setMigrationDone] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleStartMigration = async () => {
    setMigrating(true);
    setErrorMessage(null);

    const result = await performMigration((step, percent) => {
      setProgressStep(step);
      setProgressPercent(percent);
    });

    setMigrating(false);
    if (result.success) {
      setMigrationDone(true);
      setTimeout(() => {
        setIsMigrationModalOpen(false);
      }, 2000);
    } else {
      setErrorMessage(result.error || 'Failed to complete cloud migration.');
    }
  };

  const handleSkip = () => {
    setIsMigrationModalOpen(false);
  };

  const showModal = isMigrationModalOpen && Boolean(migrationStatus?.hasLocalData);

  return (
    <AnimatePresence>
      {showModal && migrationStatus && (
        <motion.div
          key="migration-modal-wrapper"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
            onClick={handleSkip}
          />

          {/* Modal Window */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-10 p-6 sm:p-7"
          >
            <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-amber-400 to-indigo-500" />

            <div className="pt-5">
              {/* Icon & Title */}
              <div className="flex items-center gap-3.5 mb-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                  <CloudUpload className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-amber-500 font-semibold">
                    Local Data Detected
                  </span>
                  <h3 className="text-lg font-bold text-zinc-100">
                    Import your existing ART//PROGRESS data?
                  </h3>
                </div>
              </div>

              <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                We found your personal drawing records and artworks stored locally on this device. Would you like to upload them to your private Supabase Cloud Studio?
              </p>

              {/* Discovered Local Data Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
                <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/60 flex flex-col items-center text-center">
                  <Clock className="w-4 h-4 text-amber-400 mb-1" />
                  <span className="text-base font-semibold text-zinc-100">
                    {migrationStatus.localSessionCount}
                  </span>
                  <span className="text-[11px] text-zinc-500">Sessions</span>
                </div>

                <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/60 flex flex-col items-center text-center">
                  <Palette className="w-4 h-4 text-emerald-400 mb-1" />
                  <span className="text-base font-semibold text-zinc-100">
                    {migrationStatus.localArtworkCount}
                  </span>
                  <span className="text-[11px] text-zinc-500">Artworks</span>
                </div>

                <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/60 flex flex-col items-center text-center">
                  <Layers className="w-4 h-4 text-indigo-400 mb-1" />
                  <span className="text-base font-semibold text-zinc-100">
                    {migrationStatus.localChallengeCount}
                  </span>
                  <span className="text-[11px] text-zinc-500">Challenges</span>
                </div>

                <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/60 flex flex-col items-center text-center">
                  <Database className="w-4 h-4 text-purple-400 mb-1" />
                  <span className="text-base font-semibold text-zinc-100">
                    {migrationStatus.localInsightCount}
                  </span>
                  <span className="text-[11px] text-zinc-500">Insights</span>
                </div>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="p-3.5 mb-5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Migration Progress Bar */}
              {migrating && (
                <div className="mb-6 p-4 rounded-xl bg-zinc-950/80 border border-zinc-800">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-medium text-zinc-300 flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                      {progressStep || 'Preparing data transfer...'}
                    </span>
                    <span className="font-mono text-amber-400 font-semibold">{progressPercent}%</span>
                  </div>
                  <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-300 rounded-full"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Migration Success Confirmation */}
              {migrationDone && (
                <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>All local drawings, sessions, and milestones have been safely synced to Supabase!</span>
                </div>
              )}

              {/* Actions */}
              {!migrationDone && (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSkip}
                    disabled={migrating}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 font-medium text-sm transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Skip for Now
                  </button>
                  <button
                    type="button"
                    onClick={handleStartMigration}
                    disabled={migrating}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-sm shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {migrating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Syncing...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Import Data</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
