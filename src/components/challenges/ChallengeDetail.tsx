import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Target,
  CheckCircle2,
  PauseCircle,
  PlayCircle,
  Plus,
  Edit2,
  Trash2,
  Sparkles,
  Flame,
  Check,
  X,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Challenge, ChallengeTask } from '../../types';
import { ConfirmModal } from '../common/ConfirmModal';

interface ChallengeDetailProps {
  challengeId: string;
  onBack: () => void;
  onEditChallenge: (challenge: Challenge) => void;
}

export const ChallengeDetail: React.FC<ChallengeDetailProps> = ({
  challengeId,
  onBack,
  onEditChallenge
}) => {
  const {
    challenges,
    toggleChallengeTask,
    addChallengeTask,
    updateChallengeTask,
    deleteChallengeTask,
    updateChallenge,
    deleteChallenge
  } = useApp();

  const challenge = useMemo(() => {
    return challenges.find(c => c.id === challengeId);
  }, [challenges, challengeId]);

  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskNotes, setNewTaskNotes] = useState('');

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState('');
  const [editTaskNotes, setEditTaskNotes] = useState('');

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  if (!challenge) {
    return (
      <div className="p-8 text-center">
        <p className="text-zinc-400 mb-4">Challenge not found.</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-amber-500 text-black font-semibold rounded-xl text-sm"
        >
          Back to Challenges
        </button>
      </div>
    );
  }

  const totalTasks = challenge.tasks?.length || 0;
  const completedTasks = challenge.tasks?.filter(t => t.completed).length || 0;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const isCompleted = challenge.status === 'completed' || (totalTasks > 0 && completedTasks === totalTasks);

  // Calculate real task completion streak (consecutive completed tasks with completedAt)
  const taskStreak = useMemo(() => {
    const completedTimestamps = challenge.tasks
      .filter(t => t.completed && t.completedAt)
      .map(t => t.completedAt as number)
      .sort((a, b) => b - a);

    if (completedTimestamps.length === 0) return 0;

    const dates = new Set<string>();
    completedTimestamps.forEach(ts => {
      const d = new Date(ts);
      dates.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
    });

    return dates.size;
  }, [challenge.tasks]);

  const handleAddTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    addChallengeTask(challenge.id, {
      title: newTaskTitle.trim(),
      notes: newTaskNotes.trim() || undefined
    });
    setNewTaskTitle('');
    setNewTaskNotes('');
    setIsAddingTask(false);
  };

  const handleSaveEditTask = (taskId: string) => {
    if (!editTaskTitle.trim()) return;
    updateChallengeTask(challenge.id, taskId, {
      title: editTaskTitle.trim(),
      notes: editTaskNotes.trim() || undefined
    });
    setEditingTaskId(null);
  };

  const startEditTask = (task: ChallengeTask) => {
    setEditingTaskId(task.id);
    setEditTaskTitle(task.title);
    setEditTaskNotes(task.notes || '');
  };

  const toggleStatus = () => {
    if (challenge.status === 'paused') {
      updateChallenge(challenge.id, { status: 'active' });
    } else if (challenge.status === 'active') {
      updateChallenge(challenge.id, { status: 'paused' });
    }
  };

  return (
    <div id="challenge-detail-page" className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Challenges</span>
        </button>

        <div className="flex items-center gap-2">
          {challenge.status !== 'completed' && (
            <button
              onClick={toggleStatus}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#181a20] hover:bg-[#20232c] border border-[#2c303c] text-zinc-300 text-xs font-medium transition-colors cursor-pointer"
            >
              {challenge.status === 'paused' ? (
                <>
                  <PlayCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Resume Challenge</span>
                </>
              ) : (
                <>
                  <PauseCircle className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Pause Challenge</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={() => onEditChallenge(challenge)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#181a20] hover:bg-[#20232c] border border-[#2c303c] text-zinc-300 text-xs font-medium transition-colors cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Edit Challenge</span>
          </button>

          <button
            onClick={() => setIsDeleteConfirmOpen(true)}
            className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors cursor-pointer"
            title="Delete Challenge"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hero Detail Banner */}
      <div
        className="p-8 rounded-3xl bg-[#14151a] border border-[#22242a] relative overflow-hidden shadow-2xl space-y-6"
        style={{
          borderTop: `4px solid ${challenge.accent || '#f59e0b'}`
        }}
      >
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span
                className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider"
                style={{
                  backgroundColor: `${challenge.accent || '#f59e0b'}20`,
                  color: challenge.accent || '#f59e0b',
                  border: `1px solid ${challenge.accent || '#f59e0b'}40`
                }}
              >
                {challenge.duration}
              </span>

              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                isCompleted
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : challenge.status === 'paused'
                  ? 'bg-zinc-700/40 text-zinc-400 border border-zinc-700'
                  : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
              }`}>
                {isCompleted ? 'Completed' : challenge.status === 'paused' ? 'Paused' : 'Active'}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-100 tracking-tight">
              {challenge.title}
            </h1>

            <p className="text-sm text-zinc-300 leading-relaxed">
              {challenge.description}
            </p>

            {challenge.dailyGoal && (
              <div className="flex items-center gap-2 pt-2 text-sm text-amber-300/90 font-medium">
                <Target className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Daily Focus: {challenge.dailyGoal}</span>
              </div>
            )}
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3 shrink-0">
            <div className="p-4 rounded-2xl bg-[#181a20] border border-[#282b35] text-center min-w-[120px]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                Completed
              </span>
              <span className="font-mono text-2xl font-black text-zinc-100">
                {completedTasks} / {totalTasks}
              </span>
              <span className="text-[11px] text-zinc-400 block mt-0.5 font-mono">
                {progressPercent}%
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#181a20] border border-[#282b35] text-center min-w-[120px]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                Activity Days
              </span>
              <div className="flex items-center justify-center gap-1 font-mono text-2xl font-black text-amber-400">
                <Flame className="w-5 h-5 text-amber-500" />
                <span>{taskStreak}</span>
              </div>
              <span className="text-[11px] text-zinc-400 block mt-0.5">
                {taskStreak === 1 ? '1 active day' : `${taskStreak} active days`}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-zinc-400">Challenge Completion</span>
            <span className="font-mono text-zinc-200">{progressPercent}% Completed</span>
          </div>
          <div className="w-full h-3 rounded-full bg-[#1c1e25] overflow-hidden p-0.5 border border-[#282b35]">
            <div
              className="h-full rounded-full transition-all duration-300 ease-out"
              style={{
                width: `${progressPercent}%`,
                backgroundColor: challenge.accent || '#f59e0b'
              }}
            />
          </div>
        </div>
      </div>

      {/* Task Checklist Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#22242a]">
          <div>
            <h3 className="text-base font-bold text-zinc-100">
              Task Checklist ({completedTasks}/{totalTasks})
            </h3>
            <p className="text-xs text-zinc-400">
              Check off tasks as you complete your daily drawing studies
            </p>
          </div>

          {!isAddingTask && (
            <button
              onClick={() => setIsAddingTask(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all cursor-pointer shadow-md shadow-amber-500/10"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>+ Add Task</span>
            </button>
          )}
        </div>

        {/* Add Task Form */}
        {isAddingTask && (
          <form
            onSubmit={handleAddTaskSubmit}
            className="p-4 rounded-2xl bg-[#181a20] border border-amber-500/30 space-y-3 animate-in fade-in"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Add New Challenge Task
              </span>
              <button
                type="button"
                onClick={() => setIsAddingTask(false)}
                className="text-zinc-400 hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <input
              type="text"
              value={newTaskTitle}
              onChange={e => setNewTaskTitle(e.target.value)}
              placeholder="e.g. Day 31 — Dynamic Gesture & Contour"
              className="w-full px-3.5 py-2 rounded-xl bg-[#121316] border border-[#2c2f38] text-sm text-zinc-100 placeholder-zinc-400 focus:border-amber-500 focus:outline-none"
              autoFocus
            />

            <input
              type="text"
              value={newTaskNotes}
              onChange={e => setNewTaskNotes(e.target.value)}
              placeholder="Optional notes or technique focus..."
              className="w-full px-3.5 py-2 rounded-xl bg-[#121316] border border-[#2c2f38] text-xs text-zinc-300 placeholder-zinc-400 focus:border-amber-500 focus:outline-none"
            />

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAddingTask(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:bg-[#22242a]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newTaskTitle.trim()}
                className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all disabled:opacity-50"
              >
                Save Task
              </button>
            </div>
          </form>
        )}

        {/* Task Items */}
        {totalTasks === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-[#14151a] border border-[#22242a] text-zinc-400 text-sm">
            No tasks in this challenge yet. Click "+ Add Task" to create one.
          </div>
        ) : (
          <div className="grid gap-2">
            {challenge.tasks.map((task, index) => {
              const isEditing = editingTaskId === task.id;

              if (isEditing) {
                return (
                  <div
                    key={task.id}
                    className="p-4 rounded-xl bg-[#181a20] border border-amber-500/40 space-y-2"
                  >
                    <input
                      type="text"
                      value={editTaskTitle}
                      onChange={e => setEditTaskTitle(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#121316] border border-[#2c2f38] text-sm text-zinc-100 focus:border-amber-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={editTaskNotes}
                      onChange={e => setEditTaskNotes(e.target.value)}
                      placeholder="Task notes..."
                      className="w-full px-3 py-1.5 rounded-lg bg-[#121316] border border-[#2c2f38] text-xs text-zinc-300 focus:border-amber-500 focus:outline-none"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingTaskId(null)}
                        className="px-3 py-1 rounded-md text-xs text-zinc-400 hover:bg-[#22242a]"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveEditTask(task.id)}
                        className="px-3 py-1 rounded-md bg-amber-500 text-black text-xs font-bold"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={task.id}
                  id={`task-item-${task.id}`}
                  className={`p-3.5 px-4 rounded-xl border transition-all flex items-start justify-between gap-3 group ${
                    task.completed
                      ? 'bg-[#141519]/70 border-[#20222a] text-zinc-400'
                      : 'bg-[#16181f] hover:bg-[#1a1c24] border-[#262832] text-zinc-200'
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1">
                    {/* Custom Accessible Checkbox */}
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={task.completed}
                      onClick={() => toggleChallengeTask(challenge.id, task.id)}
                      className={`mt-0.5 w-5 h-5 rounded-lg flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                        task.completed
                          ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20 scale-100'
                          : 'border-2 border-zinc-600 hover:border-amber-400 bg-[#121316]'
                      }`}
                    >
                      {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>

                    <div className="space-y-0.5 flex-1">
                      <p
                        onClick={() => toggleChallengeTask(challenge.id, task.id)}
                        className={`text-sm font-semibold cursor-pointer select-none transition-all ${
                          task.completed ? 'line-through text-zinc-500' : 'text-zinc-200'
                        }`}
                      >
                        {task.title}
                      </p>

                      {task.notes && (
                        <p className="text-xs text-zinc-400 leading-normal">
                          {task.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Edit & Delete Action icons */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => startEditTask(task)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-[#22242a] transition-colors cursor-pointer"
                      title="Edit task"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setTaskToDelete(task.id)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Delete task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Delete Challenge Confirm Modal */}
      <ConfirmModal
        isOpen={isDeleteConfirmOpen}
        title="Delete this challenge?"
        message="This will permanently remove the challenge and its progress from your art studio."
        confirmLabel="Delete challenge"
        onConfirm={() => {
          deleteChallenge(challenge.id);
          setIsDeleteConfirmOpen(false);
          onBack();
        }}
        onCancel={() => setIsDeleteConfirmOpen(false)}
      />

      {/* Delete Task Confirm Modal */}
      <ConfirmModal
        isOpen={Boolean(taskToDelete)}
        title="Delete Task"
        message="Are you sure you want to remove this task from the challenge?"
        confirmLabel="Delete Task"
        onConfirm={() => {
          if (taskToDelete) {
            deleteChallengeTask(challenge.id, taskToDelete);
            setTaskToDelete(null);
          }
        }}
        onCancel={() => setTaskToDelete(null)}
      />
    </div>
  );
};
