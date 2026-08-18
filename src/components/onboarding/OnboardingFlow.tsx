import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Plus,
  Compass,
  Palette,
  Target,
  User,
  Clock,
  Flame,
  CheckCircle2,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { EXPERIENCE_OPTIONS, SUGGESTED_GOALS } from '../../lib/constants';

interface OnboardingFlowProps {
  onComplete?: () => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const { saveUserProfile } = useApp();

  // Wizard Step (1: Name, 2: Experience, 3: Goals, 4: Complete/Summary)
  const [step, setStep] = useState<number>(1);
  const [direction, setDirection] = useState<number>(1);

  // Form State
  const [name, setName] = useState<string>('');
  const [nameError, setNameError] = useState<string | null>(null);

  const [selectedExperience, setSelectedExperience] = useState<string>('3–5 years');
  const [isCustomExperience, setIsCustomExperience] = useState<boolean>(false);
  const [customExperienceText, setCustomExperienceText] = useState<string>('');

  const [selectedGoals, setSelectedGoals] = useState<string[]>([
    'Improve anatomy',
    'Develop my own style',
    'Draw more consistently'
  ]);
  const [customGoalInput, setCustomGoalInput] = useState<string>('');
  const [isAddingCustomGoal, setIsAddingCustomGoal] = useState<boolean>(false);
  const [customGoalsList, setCustomGoalsList] = useState<string[]>([]);

  // Async save status
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Navigation handlers
  const goToNextStep = () => {
    if (step === 1) {
      if (!name.trim()) {
        setNameError('Please enter your name to personalize your studio.');
        return;
      }
      setNameError(null);
    }
    setDirection(1);
    setStep(prev => Math.min(4, prev + 1));
  };

  const goToPrevStep = () => {
    setDirection(-1);
    setStep(prev => Math.max(1, prev - 1));
  };

  const handleToggleGoal = (goal: string) => {
    setSelectedGoals(prev =>
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
    if (!selectedGoals.includes(clean)) {
      setSelectedGoals(prev => [...prev, clean]);
    }
    setCustomGoalInput('');
    setIsAddingCustomGoal(false);
  };

  const handleFinishOnboarding = async () => {
    if (isSaving) return;
    setIsSaving(true);
    setSaveError(null);

    const finalExperience = isCustomExperience
      ? (customExperienceText.trim() || 'Custom experience')
      : selectedExperience;

    const finalGoals = selectedGoals.length > 0
      ? selectedGoals
      : ['Simply enjoy drawing more'];

    const result = await saveUserProfile({
      name: name.trim() || 'Artist',
      drawingExperience: finalExperience,
      customExperience: isCustomExperience ? customExperienceText.trim() : undefined,
      goals: finalGoals,
      customGoals: customGoalsList
    });

    if (!result.success) {
      setIsSaving(false);
      setSaveError(result.error || 'Failed to save profile to database. Please check your connection and try again.');
      return;
    }

    setIsSaving(false);

    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#d97706', '#fbbf24', '#ffffff', '#10b981']
      });
    } catch {
      // ignore
    }

    if (onComplete) {
      onComplete();
    }
  };

  // Step variants for smooth slide/fade animations
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 30 : -30,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -30 : 30,
      opacity: 0
    })
  };

  const finalDisplayExperience = isCustomExperience
    ? (customExperienceText.trim() || 'Custom journey')
    : selectedExperience;

  return (
    <div
      id="onboarding-flow-container"
      className="min-h-screen w-full bg-[#0e0f12] text-zinc-100 flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden selection:bg-amber-500/30 selection:text-amber-200"
    >
      {/* Subtle Studio Background Ambience */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl" />
        <div className="absolute top-12 right-12 w-80 h-80 bg-zinc-800/20 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(#22242a_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />
      </div>

      {/* Main Studio Card Container */}
      <div className="w-full max-w-2xl z-10 flex flex-col items-center">
        {/* Studio Branding */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-3 mb-8"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/15 text-black font-black text-base">
            <Sparkles className="w-5 h-5 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-wider text-lg text-zinc-100">
                ART<span className="text-amber-500">//</span>PROGRESS
              </span>
            </div>
            <p className="text-[11px] font-semibold text-zinc-500 tracking-wider uppercase">
              Private Art Studio
            </p>
          </div>
        </motion.div>

        {/* Step Progress Indicator */}
        <div className="w-full max-w-md mb-8 px-2">
          <div className="flex items-center justify-between relative">
            {/* Background Line */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-[#22242a] z-0" />
            {/* Active Highlight Line */}
            <motion.div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-amber-500 z-0"
              initial={false}
              animate={{ width: `${((step - 1) / 3) * 100}%` }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            />

            {[1, 2, 3, 4].map(s => {
              const isCompleted = s < step;
              const isCurrent = s === step;

              return (
                <div key={s} className="relative z-10 flex flex-col items-center">
                  <motion.div
                    initial={false}
                    animate={{
                      scale: isCurrent ? 1.15 : 1,
                      backgroundColor: isCurrent ? '#f59e0b' : isCompleted ? '#27272a' : '#181a1f',
                      borderColor: isCurrent ? '#f59e0b' : isCompleted ? '#f59e0b' : '#27272a',
                      color: isCurrent ? '#000000' : isCompleted ? '#f59e0b' : '#71717a'
                    }}
                    transition={{ duration: 0.2 }}
                    className="w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold shadow-md select-none"
                  >
                    {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : s}
                  </motion.div>
                  <span
                    className={`text-[10px] mt-1.5 font-semibold tracking-wider uppercase ${
                      isCurrent ? 'text-amber-400' : isCompleted ? 'text-zinc-400' : 'text-zinc-600'
                    }`}
                  >
                    {s === 1 && 'Name'}
                    {s === 2 && 'Journey'}
                    {s === 3 && 'Goals'}
                    {s === 4 && 'Studio'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Body Card */}
        <div className="w-full bg-[#121316]/95 backdrop-blur-xl border border-[#22242a] rounded-3xl p-6 sm:p-10 shadow-2xl shadow-black/80 relative overflow-hidden min-h-[440px] flex flex-col justify-between">
          <AnimatePresence mode="wait" custom={direction}>
            {/* ========================================================================= */}
            {/* STEP 1 — NAME */}
            {/* ========================================================================= */}
            {step === 1 && (
              <motion.div
                key="step1"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-6 flex-1 flex flex-col justify-between"
              >
                <div className="space-y-3 text-center sm:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
                    <User className="w-3.5 h-3.5" />
                    <span>Personal Setup</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight">
                    What's your name?
                  </h2>
                  <p className="text-sm text-zinc-400">
                    Let's personalize your studio.
                  </p>
                </div>

                <div className="space-y-4 my-auto py-4">
                  <div className="space-y-2">
                    <label htmlFor="onboarding-name-input" className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                      Your name <span className="text-amber-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="onboarding-name-input"
                        type="text"
                        value={name}
                        onChange={e => {
                          setName(e.target.value);
                          if (nameError) setNameError(null);
                        }}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            goToNextStep();
                          }
                        }}
                        placeholder="e.g. Emily"
                        autoFocus
                        maxLength={50}
                        className={`w-full px-4 py-3.5 rounded-2xl bg-[#181a1f] border text-zinc-100 placeholder-zinc-500 text-base font-medium transition-all outline-none ${
                          nameError
                            ? 'border-red-500/60 focus:border-red-500 ring-2 ring-red-500/10'
                            : 'border-[#27272a] focus:border-amber-500 ring-2 ring-transparent focus:ring-amber-500/15'
                        }`}
                      />
                    </div>
                    {nameError && (
                      <p className="text-xs text-red-400 font-medium animate-in fade-in duration-150">
                        {nameError}
                      </p>
                    )}
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed">
                    This is stored entirely on your device in your private workspace.
                  </p>
                </div>

                {/* Step 1 Actions */}
                <div className="flex items-center justify-end pt-4 border-t border-[#22242a]/60">
                  <motion.button
                    id="onboarding-step1-continue"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={goToNextStep}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition-colors shadow-lg shadow-amber-500/15 cursor-pointer"
                  >
                    <span>Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* ========================================================================= */}
            {/* STEP 2 — ART EXPERIENCE */}
            {/* ========================================================================= */}
            {step === 2 && (
              <motion.div
                key="step2"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-6 flex-1 flex flex-col justify-between"
              >
                <div className="space-y-2 text-center sm:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
                    <Compass className="w-3.5 h-3.5" />
                    <span>Art Journey</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight">
                    How long have you been drawing?
                  </h2>
                  <p className="text-sm text-zinc-400">
                    Tell us about your artistic journey.
                  </p>
                </div>

                <div className="space-y-3 my-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {EXPERIENCE_OPTIONS.map(exp => {
                      const isSelected = !isCustomExperience && selectedExperience === exp;
                      return (
                        <button
                          key={exp}
                          type="button"
                          id={`exp-option-${exp.replace(/\s+/g, '-').toLowerCase()}`}
                          onClick={() => {
                            setSelectedExperience(exp);
                            setIsCustomExperience(false);
                          }}
                          className={`p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? 'bg-amber-500/15 border-amber-500/60 text-amber-200 shadow-sm shadow-amber-500/10'
                              : 'bg-[#181a1f] border-[#27272a] text-zinc-300 hover:border-zinc-700 hover:bg-[#20232a]'
                          }`}
                        >
                          <span className="text-sm font-semibold">{exp}</span>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-amber-500 text-black flex items-center justify-center">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}
                        </button>
                      );
                    })}

                    {/* Custom Experience Option */}
                    <button
                      type="button"
                      id="exp-option-custom"
                      onClick={() => setIsCustomExperience(true)}
                      className={`p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                        isCustomExperience
                          ? 'bg-amber-500/15 border-amber-500/60 text-amber-200 shadow-sm shadow-amber-500/10'
                          : 'bg-[#181a1f] border-[#27272a] text-zinc-300 hover:border-zinc-700 hover:bg-[#20232a]'
                      }`}
                    >
                      <span className="text-sm font-semibold">Other / custom</span>
                      {isCustomExperience && (
                        <div className="w-5 h-5 rounded-full bg-amber-500 text-black flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  </div>

                  {/* Custom Experience Input Box */}
                  {isCustomExperience && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="pt-2"
                    >
                      <label htmlFor="custom-experience-input" className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                        Describe your drawing experience
                      </label>
                      <input
                        id="custom-experience-input"
                        type="text"
                        value={customExperienceText}
                        onChange={e => setCustomExperienceText(e.target.value)}
                        placeholder="e.g. Just picked up a pencil this month, or Returning after 15 years"
                        maxLength={80}
                        autoFocus
                        className="w-full px-4 py-3 rounded-xl bg-[#181a1f] border border-amber-500/40 text-zinc-100 placeholder-zinc-500 text-sm font-medium focus:border-amber-500 outline-none ring-2 ring-amber-500/10"
                      />
                    </motion.div>
                  )}
                </div>

                {/* Step 2 Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-[#22242a]/60">
                  <button
                    id="onboarding-step2-back"
                    onClick={goToPrevStep}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl hover:bg-[#181a1f] text-zinc-400 hover:text-zinc-200 text-sm font-semibold transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <motion.button
                    id="onboarding-step2-continue"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={goToNextStep}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition-colors shadow-lg shadow-amber-500/15 cursor-pointer"
                  >
                    <span>Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* ========================================================================= */}
            {/* STEP 3 — GOALS */}
            {/* ========================================================================= */}
            {step === 3 && (
              <motion.div
                key="step3"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-6 flex-1 flex flex-col justify-between"
              >
                <div className="space-y-2 text-center sm:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
                    <Target className="w-3.5 h-3.5" />
                    <span>Aspirations</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight">
                    What are your goals?
                  </h2>
                  <p className="text-sm text-zinc-400">
                    What do you want to achieve with your art? Select all that apply.
                  </p>
                </div>

                {/* Goals Selection Grid */}
                <div className="space-y-3.5 my-2">
                  <div className="max-h-56 overflow-y-auto pr-1 flex flex-wrap gap-2">
                    {SUGGESTED_GOALS.map(goal => {
                      const isSelected = selectedGoals.includes(goal);
                      return (
                        <motion.button
                          key={goal}
                          type="button"
                          id={`goal-chip-${goal.replace(/\s+/g, '-').toLowerCase()}`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleToggleGoal(goal)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border flex items-center gap-1.5 cursor-pointer ${
                            isSelected
                              ? 'bg-amber-500 text-black border-amber-400 font-bold shadow-md shadow-amber-500/20'
                              : 'bg-[#181a1f] border-[#27272a] text-zinc-300 hover:border-zinc-600 hover:bg-[#20232a]'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          <span>{goal}</span>
                        </motion.button>
                      );
                    })}

                    {/* Custom goals created by user */}
                    {customGoalsList.map(cGoal => {
                      const isSelected = selectedGoals.includes(cGoal);
                      return (
                        <motion.button
                          key={cGoal}
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleToggleGoal(cGoal)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border flex items-center gap-1.5 cursor-pointer ${
                            isSelected
                              ? 'bg-amber-500 text-black border-amber-400 font-bold shadow-md shadow-amber-500/20'
                              : 'bg-[#181a1f] border-[#27272a] text-zinc-300 hover:border-zinc-600 hover:bg-[#20232a]'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          <span>{cGoal}</span>
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Add Custom Goal Section */}
                  {isAddingCustomGoal ? (
                    <form onSubmit={handleAddCustomGoal} className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={customGoalInput}
                        onChange={e => setCustomGoalInput(e.target.value)}
                        placeholder="Write your custom goal..."
                        maxLength={60}
                        autoFocus
                        className="flex-1 px-3.5 py-2 rounded-xl bg-[#181a1f] border border-amber-500/40 text-zinc-100 placeholder-zinc-500 text-xs font-medium focus:border-amber-500 outline-none ring-2 ring-amber-500/10"
                      />
                      <button
                        type="submit"
                        className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-colors cursor-pointer"
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingCustomGoal(false);
                          setCustomGoalInput('');
                        }}
                        className="p-2 rounded-xl hover:bg-[#22242a] text-zinc-400 transition-colors cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </form>
                  ) : (
                    <button
                      type="button"
                      id="add-custom-goal-btn"
                      onClick={() => setIsAddingCustomGoal(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-dashed border-zinc-700 hover:border-amber-500/60 text-zinc-400 hover:text-amber-400 text-xs font-medium transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Custom goal</span>
                    </button>
                  )}
                </div>

                {/* Step 3 Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-[#22242a]/60">
                  <button
                    id="onboarding-step3-back"
                    onClick={goToPrevStep}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl hover:bg-[#181a1f] text-zinc-400 hover:text-zinc-200 text-sm font-semibold transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <motion.button
                    id="onboarding-step3-continue"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={goToNextStep}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition-colors shadow-lg shadow-amber-500/15 cursor-pointer"
                  >
                    <span>Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* ========================================================================= */}
            {/* STEP 4 — COMPLETE PROFILE SUMMARY */}
            {/* ========================================================================= */}
            {step === 4 && (
              <motion.div
                key="step4"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-6 flex-1 flex flex-col justify-between"
              >
                <div className="space-y-1 text-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Studio Ready</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-zinc-300 tracking-wider uppercase mt-2">
                    WELCOME TO ART<span className="text-amber-500">//</span>PROGRESS
                  </h2>
                  <h3 className="text-3xl sm:text-4xl font-black text-amber-400 tracking-tight">
                    {name.trim() || 'Artist'}
                  </h3>
                </div>

                {/* Profile Summary Card */}
                <div className="p-5 rounded-2xl bg-[#181a1f] border border-[#27272a] space-y-4 my-2">
                  <div className="flex items-center justify-between pb-3 border-b border-[#22242a]">
                    <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-wider">
                      <Clock className="w-4 h-4 text-amber-500" />
                      <span>Drawing for:</span>
                    </div>
                    <span className="text-sm font-bold text-zinc-100 bg-[#22242a] px-3 py-1 rounded-lg">
                      {finalDisplayExperience}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-wider">
                      <Target className="w-4 h-4 text-amber-500" />
                      <span>Goals:</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                      {selectedGoals.length > 0 ? (
                        selectedGoals.map(g => (
                          <span
                            key={g}
                            className="px-2.5 py-1 rounded-lg bg-[#22242a] border border-amber-500/20 text-amber-300 text-xs font-medium"
                          >
                            {g}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-zinc-500 italic">
                          Simply enjoy drawing more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {saveError && (
                  <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                    <X className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{saveError}</span>
                  </div>
                )}

                <div className="text-center space-y-1">
                  <p className="text-sm font-medium text-zinc-300">
                    Your studio is ready.
                  </p>
                </div>

                {/* Step 4 Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-[#22242a]/60">
                  <button
                    id="onboarding-step4-back"
                    disabled={isSaving}
                    onClick={goToPrevStep}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl hover:bg-[#181a1f] text-zinc-400 hover:text-zinc-200 text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <motion.button
                    id="onboarding-enter-studio-btn"
                    disabled={isSaving}
                    whileHover={isSaving ? {} : { scale: 1.03 }}
                    whileTap={isSaving ? {} : { scale: 0.97 }}
                    onClick={handleFinishOnboarding}
                    className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-extrabold text-sm transition-all shadow-xl shadow-amber-500/20 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        <span>Saving Profile...</span>
                      </>
                    ) : (
                      <>
                        <span>Enter ART//PROGRESS</span>
                        <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
