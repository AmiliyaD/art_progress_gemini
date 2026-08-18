import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  User,
  Clock,
  Target,
  Check,
  Plus,
  Save
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { EXPERIENCE_OPTIONS, SUGGESTED_GOALS } from '../../lib/constants';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
  const { userProfile, updateUserProfile } = useApp();

  const [name, setName] = useState<string>('');
  const [nameError, setNameError] = useState<string | null>(null);

  const [selectedExperience, setSelectedExperience] = useState<string>('3–5 years');
  const [isCustomExperience, setIsCustomExperience] = useState<boolean>(false);
  const [customExperienceText, setCustomExperienceText] = useState<string>('');

  const [goals, setGoals] = useState<string[]>([]);
  const [customGoalInput, setCustomGoalInput] = useState<string>('');
  const [isAddingCustomGoal, setIsAddingCustomGoal] = useState<boolean>(false);
  const [customGoalsList, setCustomGoalsList] = useState<string[]>([]);

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Synchronize state when modal opens
  useEffect(() => {
    if (userProfile && isOpen) {
      setName(userProfile.name || '');
      setNameError(null);
      setSaveError(null);

      const isKnown = (EXPERIENCE_OPTIONS as readonly string[]).includes(userProfile.drawingExperience);
      if (isKnown) {
        setSelectedExperience(userProfile.drawingExperience);
        setIsCustomExperience(false);
        setCustomExperienceText('');
      } else {
        setIsCustomExperience(true);
        setCustomExperienceText(userProfile.customExperience || userProfile.drawingExperience || '');
      }

      setGoals(userProfile.goals || []);
      setCustomGoalsList(userProfile.customGoals || []);
    }
  }, [userProfile, isOpen]);

  const handleToggleGoal = (goal: string) => {
    setGoals(prev =>
      prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]
    );
  };

  const handleAddCustomGoal = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = customGoalInput.trim();
    if (!clean) return;

    if (!customGoalsList.includes(clean)) {
      setCustomGoalsList(prev => [...prev, clean]);
    }
    if (!goals.includes(clean)) {
      setGoals(prev => [...prev, clean]);
    }
    setCustomGoalInput('');
    setIsAddingCustomGoal(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError('Name cannot be empty.');
      return;
    }

    if (isSaving) return;
    setIsSaving(true);
    setSaveError(null);

    const finalExperience = isCustomExperience
      ? (customExperienceText.trim() || 'Custom experience')
      : selectedExperience;

    const finalGoals = goals.length > 0
      ? goals
      : ['Simply enjoy drawing more'];

    const result = await updateUserProfile({
      name: name.trim(),
      drawingExperience: finalExperience,
      customExperience: isCustomExperience ? customExperienceText.trim() : undefined,
      goals: finalGoals,
      customGoals: customGoalsList
    });

    if (!result.success) {
      setIsSaving(false);
      setSaveError(result.error || 'Failed to save changes to database. Please try again.');
      return;
    }

    setIsSaving(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="edit-profile-modal-backdrop"
          id="edit-profile-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-xl bg-[#14151a] border border-[#27272a] rounded-3xl p-6 sm:p-8 shadow-2xl relative my-8"
            onClick={e => e.stopPropagation()}
          >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#22242a]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-100">Edit Studio Profile</h3>
                <p className="text-xs text-zinc-400">Update your artist identity and practice goals.</p>
              </div>
            </div>

            <button
              onClick={onClose}
              id="edit-profile-close-btn"
              className="p-2 rounded-xl hover:bg-[#1f2128] text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-6 pt-5">
            {/* 1. Name */}
            <div className="space-y-2">
              <label htmlFor="edit-profile-name" className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                Your Name <span className="text-amber-500">*</span>
              </label>
              <input
                id="edit-profile-name"
                type="text"
                value={name}
                onChange={e => {
                  setName(e.target.value);
                  if (nameError) setNameError(null);
                }}
                maxLength={50}
                placeholder="e.g. Emily"
                className={`w-full px-4 py-2.5 rounded-xl bg-[#181a1f] border text-zinc-100 placeholder-zinc-500 text-sm font-medium transition-all outline-none ${
                  nameError
                    ? 'border-red-500/60 ring-2 ring-red-500/10'
                    : 'border-[#27272a] focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15'
                }`}
              />
              {nameError && (
                <p className="text-xs text-red-400 font-medium">{nameError}</p>
              )}
            </div>

            {/* 2. Drawing Experience */}
            <div className="space-y-2.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                Drawing Experience
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {EXPERIENCE_OPTIONS.map(exp => {
                  const isSelected = !isCustomExperience && selectedExperience === exp;
                  return (
                    <button
                      key={exp}
                      type="button"
                      onClick={() => {
                        setSelectedExperience(exp);
                        setIsCustomExperience(false);
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-500 text-amber-300'
                          : 'bg-[#181a1f] border-[#27272a] text-zinc-300 hover:border-zinc-700'
                      }`}
                    >
                      <span className="truncate">{exp}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 stroke-[2.5]" />}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setIsCustomExperience(true)}
                  className={`p-2.5 rounded-xl border text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                    isCustomExperience
                      ? 'bg-amber-500/15 border-amber-500 text-amber-300'
                      : 'bg-[#181a1f] border-[#27272a] text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  <span className="truncate">Custom</span>
                  {isCustomExperience && <Check className="w-3.5 h-3.5 text-amber-400 stroke-[2.5]" />}
                </button>
              </div>

              {isCustomExperience && (
                <input
                  type="text"
                  value={customExperienceText}
                  onChange={e => setCustomExperienceText(e.target.value)}
                  placeholder="e.g. 8 years digital, returning after break..."
                  maxLength={80}
                  className="w-full mt-2 px-3.5 py-2 rounded-xl bg-[#181a1f] border border-amber-500/40 text-zinc-100 text-xs focus:border-amber-500 outline-none"
                />
              )}
            </div>

            {/* 3. Artistic Goals */}
            <div className="space-y-2.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                Practice Goals ({goals.length} selected)
              </label>

              <div className="max-h-48 overflow-y-auto pr-1 flex flex-wrap gap-1.5">
                {SUGGESTED_GOALS.map(goal => {
                  const isSelected = goals.includes(goal);
                  return (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => handleToggleGoal(goal)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border flex items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500 text-black border-amber-400 font-bold'
                          : 'bg-[#181a1f] border-[#27272a] text-zinc-400 hover:text-zinc-200 hover:border-zinc-600'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      <span>{goal}</span>
                    </button>
                  );
                })}

                {customGoalsList.map(cGoal => {
                  const isSelected = goals.includes(cGoal);
                  return (
                    <button
                      key={cGoal}
                      type="button"
                      onClick={() => handleToggleGoal(cGoal)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border flex items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500 text-black border-amber-400 font-bold'
                          : 'bg-[#181a1f] border-[#27272a] text-zinc-400 hover:text-zinc-200 hover:border-zinc-600'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      <span>{cGoal}</span>
                    </button>
                  );
                })}
              </div>

              {/* Add Custom Goal */}
              {isAddingCustomGoal ? (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={customGoalInput}
                    onChange={e => setCustomGoalInput(e.target.value)}
                    placeholder="Type custom goal..."
                    maxLength={60}
                    autoFocus
                    className="flex-1 px-3 py-1.5 rounded-xl bg-[#181a1f] border border-amber-500/40 text-zinc-100 text-xs focus:border-amber-500 outline-none"
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomGoal();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleAddCustomGoal()}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-colors cursor-pointer"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingCustomGoal(false);
                      setCustomGoalInput('');
                    }}
                    className="p-1.5 rounded-xl hover:bg-[#22242a] text-zinc-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAddingCustomGoal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border border-dashed border-zinc-700 hover:border-amber-500 text-zinc-400 hover:text-amber-400 text-xs font-medium transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add custom goal</span>
                </button>
              )}
            </div>

            {/* Error message */}
            {saveError && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <X className="w-4 h-4 text-red-400 shrink-0" />
                <span>{saveError}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#22242a]">
              <button
                type="button"
                disabled={isSaving}
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl hover:bg-[#1f2128] text-zinc-400 hover:text-zinc-200 text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                id="edit-profile-save-btn"
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition-colors shadow-lg shadow-amber-500/15 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 stroke-[2.5]" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
      )}
    </AnimatePresence>
  );
};
