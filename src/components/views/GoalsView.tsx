import React, { useState, useMemo } from 'react';
import { 
  Target, 
  Plus, 
  HelpCircle, 
  RotateCcw, 
  Command, 
  Calendar, 
  DollarSign, 
  Sparkles,
  Edit3,
  Trash2,
  X,
  Check,
  CheckCircle2
} from 'lucide-react';
import { useBudget } from '../../context/BudgetContext';
import { SavingsGoal } from '../../types/budget';

interface GoalsViewProps {
  onOpenQuickActions?: () => void;
}

interface LastAction {
  goalId: string;
  amount: number;
  previousAmount: number;
}

export const GoalsView: React.FC<GoalsViewProps> = ({ onOpenQuickActions }) => {
  const { 
    goals, 
    totalSaved, 
    settings, 
    addGoal, 
    updateGoal,
    contributeToGoal, 
    deleteGoal,
    triggerConfetti 
  } = useBudget();

  // Modals & UI States
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [lastAction, setLastAction] = useState<LastAction | null>(null);

  // Per-goal inline contribute state: { [goalId]: { amount: string, date: string, keepOutOfSafe: boolean } }
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [inlineInputs, setInlineInputs] = useState<Record<string, { amount: string; date: string; keepOutOfSafe: boolean }>>({});

  // Add Goal Form State
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [newGoalInitial, setNewGoalInitial] = useState('');
  const [newGoalDate, setNewGoalDate] = useState('');
  const [newGoalMonthly, setNewGoalMonthly] = useState('');
  const [newGoalIcon, setNewGoalIcon] = useState('🎯');

  // Edit Goal Form State
  const [editName, setEditName] = useState('');
  const [editTarget, setEditTarget] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editMonthly, setEditMonthly] = useState('');

  // Calculations
  const totalTarget = useMemo(() => {
    return goals.reduce((sum, g) => sum + (g.targetAmount || 0), 0);
  }, [goals]);

  const totalMonthlySavings = useMemo(() => {
    return goals.reduce((sum, g) => sum + (g.monthlyContribution || (g.targetAmount ? Math.max(1, Math.round(g.targetAmount / 12)) : 1)), 0);
  }, [goals]);

  const overallPercentage = useMemo(() => {
    if (totalTarget <= 0) return 0;
    return Math.min(100, Math.round((totalSaved / totalTarget) * 100));
  }, [totalSaved, totalTarget]);

  const stillToFind = useMemo(() => {
    return Math.max(0, totalTarget - totalSaved);
  }, [totalTarget, totalSaved]);

  const stillGoingCount = useMemo(() => {
    return goals.filter(g => g.currentAmount < g.targetAmount).length;
  }, [goals]);

  // Primary goal for circular display (first active or highest priority)
  const primaryGoal = useMemo(() => {
    if (goals.length === 0) return null;
    return goals.find(g => g.currentAmount < g.targetAmount) || goals[0];
  }, [goals]);

  const primaryGoalPercent = useMemo(() => {
    if (!primaryGoal || primaryGoal.targetAmount <= 0) return 0;
    return Math.min(100, Math.round((primaryGoal.currentAmount / primaryGoal.targetAmount) * 100));
  }, [primaryGoal]);

  // Nearest date goal
  const nearestDateGoal = useMemo(() => {
    const goalsWithDate = goals.filter(g => g.targetDate);
    if (goalsWithDate.length === 0) return null;
    return [...goalsWithDate].sort((a, b) => new Date(a.targetDate!).getTime() - new Date(b.targetDate!).getTime())[0];
  }, [goals]);

  const formattedNearestDate = useMemo(() => {
    if (!nearestDateGoal?.targetDate) return 'No date set';
    const d = new Date(nearestDateGoal.targetDate);
    if (isNaN(d.getTime())) return nearestDateGoal.targetDate;
    return d.toLocaleString('default', { month: 'short', year: 'numeric' });
  }, [nearestDateGoal]);

  const formatAmount = (val: number, options?: { showDecimals?: boolean }) => {
    if (settings.security?.hideBalances) {
      return `${settings.currencySymbol}••••`;
    }
    const opts = options?.showDecimals ? { minimumFractionDigits: 2, maximumFractionDigits: 2 } : { maximumFractionDigits: 0 };
    return `${settings.currencySymbol}${val.toLocaleString(undefined, opts)}`;
  };

  const formatTargetMonthYear = (dateStr?: string) => {
    if (!dateStr) return 'Flexible';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString('default', { month: 'short', year: 'numeric' });
  };

  // Get inline state for a goal
  const getGoalInput = (goalId: string) => {
    return inlineInputs[goalId] || { amount: '', date: todayStr, keepOutOfSafe: true };
  };

  const updateGoalInput = (goalId: string, partial: Partial<{ amount: string; date: string; keepOutOfSafe: boolean }>) => {
    setInlineInputs(prev => ({
      ...prev,
      [goalId]: {
        ...getGoalInput(goalId),
        ...partial
      }
    }));
  };

  // Handle inline "Add it" contribution
  const handleInlineContribute = (goal: SavingsGoal) => {
    const input = getGoalInput(goal.id);
    const amt = parseFloat(input.amount);
    if (isNaN(amt) || amt <= 0) return;

    setLastAction({
      goalId: goal.id,
      amount: amt,
      previousAmount: goal.currentAmount
    });

    contributeToGoal(goal.id, amt, {
      date: input.date || todayStr,
      excludeFromSafeToSpend: input.keepOutOfSafe
    });

    // Reset amount
    updateGoalInput(goal.id, { amount: '' });
  };

  // Handle Undo
  const handleUndo = () => {
    if (!lastAction) return;
    const goal = goals.find(g => g.id === lastAction.goalId);
    if (!goal) return;

    updateGoal(goal.id, {
      currentAmount: Math.max(0, lastAction.previousAmount),
      contributionsCount: Math.max(0, (goal.contributionsCount || 1) - 1),
      isCompleted: lastAction.previousAmount >= goal.targetAmount
    });

    setLastAction(null);
  };

  // Create Goal
  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(newGoalTarget);
    if (!newGoalName.trim() || isNaN(target) || target <= 0) return;

    const initial = parseFloat(newGoalInitial) || 0;
    const monthly = parseFloat(newGoalMonthly) || Math.max(1, Math.round(target / 12));

    addGoal({
      name: newGoalName.trim(),
      targetAmount: target,
      currentAmount: initial,
      targetDate: newGoalDate || undefined,
      monthlyContribution: monthly,
      contributionsCount: initial > 0 ? 1 : 0,
      icon: newGoalIcon || '🎯',
      color: '#10B981',
      category: 'Savings',
      isCompleted: initial >= target
    });

    setNewGoalName('');
    setNewGoalTarget('');
    setNewGoalInitial('');
    setNewGoalDate('');
    setNewGoalMonthly('');
    setIsAddingGoal(false);
  };

  // Start Edit
  const handleStartEdit = (goal: SavingsGoal) => {
    setEditingGoal(goal);
    setEditName(goal.name);
    setEditTarget(goal.targetAmount.toString());
    setEditDate(goal.targetDate || '');
    setEditMonthly(goal.monthlyContribution?.toString() || '');
  };

  // Save Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGoal) return;
    const target = parseFloat(editTarget);
    if (!editName.trim() || isNaN(target) || target <= 0) return;

    const monthly = parseFloat(editMonthly) || undefined;

    updateGoal(editingGoal.id, {
      name: editName.trim(),
      targetAmount: target,
      targetDate: editDate || undefined,
      monthlyContribution: monthly,
      isCompleted: editingGoal.currentAmount >= target
    });

    setEditingGoal(null);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* 1. Header (Exact Match to User Image) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-1">
        <div>
          <span className="text-[11px] font-bold tracking-widest text-[#6B5E7B] dark:text-[#A89CB8] uppercase">
            GOALS
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <h1 className="text-2xl sm:text-3xl font-serif font-normal text-[#241930] dark:text-[#EDE8F5] tracking-tight">
              What you are saving for
            </h1>
            <button
              onClick={() => setShowHelpModal(true)}
              className="text-[#6B5E7B] dark:text-[#A89CB8] hover:text-[#241930] dark:hover:text-white transition rounded-full p-0.5 focus:outline-hidden"
              title="What is What You Are Saving For?"
            >
              <HelpCircle className="w-4 h-4 opacity-70 hover:opacity-100" />
            </button>
          </div>
          <p className="text-xs text-[#6B5E7B] dark:text-[#9487A5] mt-0.5 font-serif italic">
            {goals.length === 0 
              ? 'no goals put down yet' 
              : `${goals.length} goal${goals.length === 1 ? '' : 's'} • ${formatAmount(totalMonthlySavings)} a month`}
          </p>
        </div>

        {/* Right header buttons */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end flex-wrap">
          {onOpenQuickActions && (
            <button
              onClick={onOpenQuickActions}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-[#241930] dark:text-[#E2D9F3] bg-white/80 dark:bg-[#1A202C]/80 border border-[#E4DFEC] dark:border-[#2D3748] hover:bg-white dark:hover:bg-[#1A202C] shadow-2xs transition active:scale-95"
            >
              <Command className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>Quick actions</span>
              <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 text-[10px] font-mono rounded-md bg-[#EDE9F2] dark:bg-slate-700 text-[#4A3561] dark:text-purple-300">
                Ctrl K
              </kbd>
            </button>
          )}

          <button
            onClick={() => setShowHelpModal(true)}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-white/80 dark:bg-[#1A202C]/80 border border-[#E4DFEC] dark:border-[#2D3748] text-[#4A3561] dark:text-purple-300 hover:bg-[#EDE9F2] dark:hover:bg-[#2D3748] transition text-xs font-semibold shadow-2xs"
            title="Help & Info"
          >
            ?
          </button>

          {lastAction && (
            <button
              onClick={handleUndo}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-[#4A3561] dark:text-purple-300 bg-white/80 dark:bg-[#1A202C]/80 border border-[#E4DFEC] dark:border-[#2D3748] hover:bg-[#EDE9F2] dark:hover:bg-[#2D3748] transition active:scale-95 shadow-2xs"
              title="Undo last deposit"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Undo</span>
            </button>
          )}

          <button
            onClick={() => setIsAddingGoal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-white bg-[#4A3561] hover:bg-[#3D2B50] dark:bg-purple-700 dark:hover:bg-purple-600 shadow-sm transition active:scale-95 shrink-0"
          >
            <Target className="w-4 h-4" />
            <span>Add a goal</span>
          </button>
        </div>
      </div>

      {/* 2. Upper Card: "PUT AWAY SO FAR" (Exact Match to User Image) */}
      <div className="rounded-2xl sm:rounded-3xl bg-white/90 dark:bg-[#141B26]/90 border border-[#E4DFEC] dark:border-[#222E40] p-5 sm:p-7 shadow-xs relative overflow-hidden transition-all">
        {/* Top Split Row: Label/Subtext on Left, Big Amount on Right */}
        <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold tracking-wider text-[#6B5E7B] dark:text-[#A89CB8] uppercase">
                PUT AWAY SO FAR
              </span>
              <button
                onClick={() => setShowHelpModal(true)}
                className="text-[#6B5E7B] dark:text-[#A89CB8] hover:text-[#241930] dark:hover:text-white transition"
              >
                <HelpCircle className="w-3.5 h-3.5 opacity-80" />
              </button>
            </div>
            <p className="font-serif italic text-xs sm:text-sm text-[#6B5E7B] dark:text-[#9487A5] mt-1">
              {goals.length === 0 
                ? '0 goals • $0 in all' 
                : `${goals.length} goal${goals.length === 1 ? '' : 's'} • ${formatAmount(totalTarget)} in all`}
            </p>
          </div>

          <div className="text-left sm:text-right">
            <div className="font-serif text-3xl sm:text-4xl font-normal text-[#241930] dark:text-[#EDE8F5] tracking-tight">
              {formatAmount(totalSaved, { showDecimals: true })}
            </div>
            <div className="mt-1">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E1EFE7] dark:bg-[#12231A] text-[#264A38] dark:text-[#96DEB7]">
                {overallPercentage}% complete
              </span>
            </div>
          </div>
        </div>

        {/* Center: Radial Progress Gauge */}
        <div className="my-6 flex flex-col items-center justify-center">
          <div className="relative w-24 h-24 flex items-center justify-center">
            {/* SVG Donut Circle */}
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              {/* Background ring */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-[#EFEBF5] dark:text-[#232030]"
              />
              {/* Progress ring */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - (primaryGoalPercent || overallPercentage) / 100)}`}
                className="text-[#4A8B6F] dark:text-[#52A383] transition-all duration-700 ease-out"
              />
            </svg>

            {/* Percentage text inside circle */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-serif text-lg font-bold text-[#241930] dark:text-[#EDE8F5]">
                {primaryGoalPercent || overallPercentage}%
              </span>
            </div>
          </div>

          {/* Label under gauge */}
          <div className="text-center mt-2">
            <h4 className="text-xs sm:text-sm font-semibold text-[#241930] dark:text-[#EDE8F5]">
              {primaryGoal?.name || 'No active goal'}
            </h4>
            <p className="text-[11px] text-[#6B5E7B] dark:text-[#9487A5] font-serif">
              {primaryGoal 
                ? `${formatAmount(primaryGoal.currentAmount)} of ${formatAmount(primaryGoal.targetAmount)}`
                : '$0 of $0'}
            </p>
          </div>
        </div>

        {/* Bottom Split Row: Still to find & Nearest date (Lilac boxes) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* Left: Still to find */}
          <div className="rounded-xl sm:rounded-2xl p-4 sm:p-5 bg-[#EDE7F6]/90 dark:bg-[#1B1428]/90 border border-[#DDD4EE] dark:border-[#2D2144] transition">
            <span className="text-xs font-medium text-[#6B5E7B] dark:text-[#A89CB8]">
              Still to find
            </span>

            <div className="mt-1 mb-0.5">
              <span className="font-serif text-2xl sm:text-3xl text-[#241930] dark:text-[#EDE8F5] font-normal tracking-tight">
                {formatAmount(stillToFind)}
              </span>
            </div>

            <p className="text-[11px] sm:text-xs text-[#6B5E7B] dark:text-[#A89CB8]">
              {stillGoingCount === 0 
                ? 'all goals completed!' 
                : `${stillGoingCount} still going`}
            </p>
          </div>

          {/* Right: Nearest date */}
          <div className="rounded-xl sm:rounded-2xl p-4 sm:p-5 bg-[#EDE7F6]/90 dark:bg-[#1B1428]/90 border border-[#DDD4EE] dark:border-[#2D2144] transition">
            <span className="text-xs font-medium text-[#6B5E7B] dark:text-[#A89CB8]">
              Nearest date
            </span>

            <div className="mt-1 mb-0.5">
              <span className="font-serif text-2xl sm:text-3xl text-[#241930] dark:text-[#EDE8F5] font-normal tracking-tight truncate block">
                {formattedNearestDate}
              </span>
            </div>

            <p className="text-[11px] sm:text-xs text-[#6B5E7B] dark:text-[#A89CB8] truncate">
              {nearestDateGoal?.name || 'No deadline specified'}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Lower Card: "Every goal" (Exact Match to User Image) */}
      <div className="rounded-2xl sm:rounded-3xl bg-white/90 dark:bg-[#141B26]/90 border border-[#E4DFEC] dark:border-[#222E40] p-5 sm:p-7 shadow-xs transition-all space-y-6">
        {/* Card Header: Every goal + Count */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <h2 className="text-base sm:text-lg font-serif font-medium text-[#241930] dark:text-[#EDE8F5]">
              Every goal
            </h2>
            <button
              onClick={() => setShowHelpModal(true)}
              className="text-[#6B5E7B] dark:text-[#A89CB8] hover:text-[#241930] dark:hover:text-white transition"
            >
              <HelpCircle className="w-3.5 h-3.5 opacity-80" />
            </button>
          </div>

          <span className="text-xs text-[#6B5E7B] dark:text-[#9487A5]">
            {goals.length} goal{goals.length === 1 ? '' : 's'}
          </span>
        </div>

        {/* Goals List */}
        {goals.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-[#E4DFEC] dark:border-[#2D3748] p-8 text-center bg-[#FAF8FC]/50 dark:bg-[#0E131E]/50">
            <div className="w-12 h-12 rounded-full bg-[#EDE9F2] dark:bg-purple-950/60 text-[#4A3561] dark:text-purple-300 flex items-center justify-center mx-auto mb-3">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-base font-serif font-medium text-[#241930] dark:text-[#EDE8F5]">
              No savings goals put down yet
            </h3>
            <p className="text-xs text-[#6B5E7B] dark:text-[#9487A5] max-w-sm mx-auto mt-1 mb-5">
              Dreaming of a rainy-day cushion, a cozy vacation, or a new computer? Give your money a clear target so your future self can thank you.
            </p>
            <button
              onClick={() => setIsAddingGoal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#4A3561] hover:bg-[#3D2B50] dark:bg-purple-700 dark:hover:bg-purple-600 shadow-sm transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add your first goal</span>
            </button>
          </div>
        ) : (
          <div className="space-y-6 divide-y divide-[#EDE9F2] dark:divide-[#20293D]">
            {goals.map(goal => {
              const percent = goal.targetAmount > 0 
                ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) 
                : 0;
              const isCompleted = percent >= 100;
              const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

              // Calculate monthly payments left
              const monthlyRate = goal.monthlyContribution || (goal.targetAmount ? Math.max(1, Math.round(goal.targetAmount / 12)) : 1);
              const paymentsLeft = Math.ceil(remaining / monthlyRate);

              const inlineState = getGoalInput(goal.id);

              return (
                <div key={goal.id} className="pt-6 first:pt-0 space-y-4">
                  {/* Goal Header: Dot + Name & Status Pill */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${isCompleted ? 'bg-purple-500' : 'bg-emerald-600 dark:bg-emerald-400'}`}></span>
                      <h3 className="text-base font-medium text-[#241930] dark:text-[#EDE8F5]">
                        {goal.name}
                      </h3>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#EDE7F6] dark:bg-[#201A2F] text-[#4A3561] dark:text-[#D1B8EC]">
                      {isCompleted ? 'reached 🎉' : 'on the way'}
                    </span>
                  </div>

                  {/* Amounts & Percentage row */}
                  <div className="flex items-baseline justify-between">
                    <div className="flex items-baseline gap-1.5 font-serif">
                      <span className="text-2xl sm:text-3xl text-[#241930] dark:text-[#EDE8F5] font-normal">
                        {formatAmount(goal.currentAmount)}
                      </span>
                      <span className="text-sm sm:text-base text-[#6B5E7B] dark:text-[#9487A5]">
                        of {formatAmount(goal.targetAmount)}
                      </span>
                    </div>

                    <span className="font-serif text-2xl sm:text-3xl text-[#241930] dark:text-[#EDE8F5]">
                      {percent}%
                    </span>
                  </div>

                  {/* Progress Bar (Rounded thick bar matching image) */}
                  <div className="w-full h-3 sm:h-3.5 rounded-full bg-[#EDE7F6] dark:bg-[#1F192C] overflow-hidden p-0.5">
                    <div
                      className="h-full rounded-full bg-[#4A8B6F] dark:bg-[#52A383] transition-all duration-500 ease-out"
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  {/* 3 Metrics: REACHES | LEFT | EACH MONTH */}
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <div>
                      <span className="block text-[10px] font-bold tracking-wider text-[#6B5E7B] dark:text-[#9487A5] uppercase">
                        REACHES
                      </span>
                      <span className="text-xs sm:text-sm font-medium text-[#241930] dark:text-[#EDE8F5]">
                        {formatTargetMonthYear(goal.targetDate)}
                      </span>
                      <span className="block text-[10px] text-[#6B5E7B] dark:text-[#9487A5]">
                        {remaining === 0 ? 'Goal reached' : `${paymentsLeft} payment${paymentsLeft === 1 ? '' : 's'}`}
                      </span>
                    </div>

                    <div>
                      <span className="block text-[10px] font-bold tracking-wider text-[#6B5E7B] dark:text-[#9487A5] uppercase">
                        LEFT
                      </span>
                      <span className="font-serif text-xs sm:text-sm font-medium text-[#241930] dark:text-[#EDE8F5]">
                        {formatAmount(remaining)}
                      </span>
                    </div>

                    <div>
                      <span className="block text-[10px] font-bold tracking-wider text-[#6B5E7B] dark:text-[#9487A5] uppercase">
                        EACH MONTH
                      </span>
                      <span className="font-serif text-xs sm:text-sm font-medium text-[#241930] dark:text-[#EDE8F5]">
                        {formatAmount(monthlyRate)}
                      </span>
                    </div>
                  </div>

                  {/* Inline Action Controls (Put in, Date, Add it, Checkbox, Edit, Remove) */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
                    <div className="flex items-center gap-1.5 bg-[#FAF8FC] dark:bg-[#0E131E] px-2.5 py-1.5 rounded-xl border border-[#E4DFEC] dark:border-[#2D3748]">
                      <span className="text-[#6B5E7B] dark:text-[#9487A5]">Put in</span>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={inlineState.amount}
                        onChange={e => updateGoalInput(goal.id, { amount: e.target.value })}
                        className="w-20 bg-transparent text-[#241930] dark:text-white font-medium focus:outline-hidden"
                      />
                    </div>

                    <div className="flex items-center bg-[#FAF8FC] dark:bg-[#0E131E] px-2.5 py-1.5 rounded-xl border border-[#E4DFEC] dark:border-[#2D3748]">
                      <input
                        type="date"
                        value={inlineState.date}
                        onChange={e => updateGoalInput(goal.id, { date: e.target.value })}
                        className="bg-transparent text-[#241930] dark:text-white text-xs focus:outline-hidden"
                      />
                    </div>

                    <button
                      onClick={() => handleInlineContribute(goal)}
                      className="px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-[#5B4373] hover:bg-[#48335D] dark:bg-purple-700 dark:hover:bg-purple-600 transition active:scale-95 shadow-2xs"
                    >
                      Add it
                    </button>

                    <label className="flex items-center gap-1.5 text-[11px] text-[#6B5E7B] dark:text-[#9487A5] cursor-pointer ml-1">
                      <input
                        type="checkbox"
                        checked={inlineState.keepOutOfSafe}
                        onChange={e => updateGoalInput(goal.id, { keepOutOfSafe: e.target.checked })}
                        className="rounded border-[#E4DFEC] text-[#5B4373] focus:ring-purple-500"
                      />
                      <span>Keep this out of safe to spend</span>
                    </label>

                    <div className="ml-auto flex items-center gap-1.5">
                      <button
                        onClick={() => handleStartEdit(goal)}
                        className="px-3 py-1.5 rounded-xl bg-[#FAF8FC] dark:bg-[#0E131E] border border-[#E4DFEC] dark:border-[#2D3748] text-[#6B5E7B] hover:text-[#241930] dark:text-[#9487A5] dark:hover:text-white transition"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Remove goal "${goal.name}"?`)) {
                            deleteGoal(goal.id);
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#FAF8FC] dark:bg-[#0E131E] border border-[#E4DFEC] dark:border-[#2D3748] text-[#6B5E7B] hover:text-rose-600 dark:text-[#9487A5] dark:hover:text-rose-400 transition"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* Bottom Pill: Added so far */}
                  <div>
                    <span className="inline-block px-3 py-1 rounded-full text-[11px] bg-[#FAF8FC] dark:bg-[#0E131E] border border-[#E4DFEC] dark:border-[#2D3748] text-[#6B5E7B] dark:text-[#9487A5]">
                      Added so far • {goal.contributionsCount || (goal.currentAmount > 0 ? 1 : 0)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Add Goal Modal */}
      {isAddingGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-[#151B28] border border-[#E4DFEC] dark:border-[#253046] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold tracking-wider text-purple-600 dark:text-purple-400 uppercase">
                  NEW SAVINGS GOAL
                </span>
                <h3 className="text-lg font-serif font-semibold text-[#241930] dark:text-[#EDE8F5]">
                  What are you saving for?
                </h3>
              </div>
              <button
                onClick={() => setIsAddingGoal(false)}
                className="p-1 rounded-lg text-[#6B5E7B] hover:text-[#241930] dark:text-[#9487A5] dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#6B5E7B] dark:text-[#9487A5] mb-1">
                  Goal Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Emergency Fund, New Laptop, Japan Trip"
                  value={newGoalName}
                  onChange={e => setNewGoalName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E4DFEC] dark:border-[#2D3748] bg-[#FAF8FC] dark:bg-[#0E131E] text-sm text-[#241930] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#6B5E7B] dark:text-[#9487A5] mb-1">
                    Target Amount ({settings.currencySymbol})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    placeholder="411.00"
                    value={newGoalTarget}
                    onChange={e => setNewGoalTarget(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E4DFEC] dark:border-[#2D3748] bg-[#FAF8FC] dark:bg-[#0E131E] text-sm font-semibold text-[#241930] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#6B5E7B] dark:text-[#9487A5] mb-1">
                    Already Saved ({settings.currencySymbol})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="110.00"
                    value={newGoalInitial}
                    onChange={e => setNewGoalInitial(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E4DFEC] dark:border-[#2D3748] bg-[#FAF8FC] dark:bg-[#0E131E] text-sm text-[#241930] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#6B5E7B] dark:text-[#9487A5] mb-1">
                    Target Reach Date
                  </label>
                  <input
                    type="date"
                    value={newGoalDate}
                    onChange={e => setNewGoalDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E4DFEC] dark:border-[#2D3748] bg-[#FAF8FC] dark:bg-[#0E131E] text-xs text-[#241930] dark:text-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#6B5E7B] dark:text-[#9487A5] mb-1">
                    Monthly Planned ({settings.currencySymbol})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="1.00"
                    value={newGoalMonthly}
                    onChange={e => setNewGoalMonthly(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E4DFEC] dark:border-[#2D3748] bg-[#FAF8FC] dark:bg-[#0E131E] text-xs text-[#241930] dark:text-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingGoal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-[#6B5E7B] hover:text-[#241930] dark:text-[#9487A5] dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-[#4A3561] hover:bg-[#3D2B50] dark:bg-purple-700 dark:hover:bg-purple-600 shadow-sm transition active:scale-95"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Edit Goal Modal */}
      {editingGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-[#151B28] border border-[#E4DFEC] dark:border-[#253046] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold tracking-wider text-purple-600 dark:text-purple-400 uppercase">
                  EDIT GOAL
                </span>
                <h3 className="text-lg font-serif font-semibold text-[#241930] dark:text-[#EDE8F5]">
                  Update {editingGoal.name}
                </h3>
              </div>
              <button
                onClick={() => setEditingGoal(null)}
                className="p-1 rounded-lg text-[#6B5E7B] hover:text-[#241930] dark:text-[#9487A5] dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#6B5E7B] dark:text-[#9487A5] mb-1">
                  Goal Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E4DFEC] dark:border-[#2D3748] bg-[#FAF8FC] dark:bg-[#0E131E] text-sm text-[#241930] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#6B5E7B] dark:text-[#9487A5] mb-1">
                  Target Amount ({settings.currencySymbol})
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  value={editTarget}
                  onChange={e => setEditTarget(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E4DFEC] dark:border-[#2D3748] bg-[#FAF8FC] dark:bg-[#0E131E] text-sm font-semibold text-[#241930] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#6B5E7B] dark:text-[#9487A5] mb-1">
                    Target Reach Date
                  </label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={e => setEditDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E4DFEC] dark:border-[#2D3748] bg-[#FAF8FC] dark:bg-[#0E131E] text-xs text-[#241930] dark:text-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#6B5E7B] dark:text-[#9487A5] mb-1">
                    Monthly Planned ({settings.currencySymbol})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editMonthly}
                    onChange={e => setEditMonthly(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E4DFEC] dark:border-[#2D3748] bg-[#FAF8FC] dark:bg-[#0E131E] text-xs text-[#241930] dark:text-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingGoal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-[#6B5E7B] hover:text-[#241930] dark:text-[#9487A5] dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-[#4A3561] hover:bg-[#3D2B50] dark:bg-purple-700 dark:hover:bg-purple-600 shadow-sm transition active:scale-95"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Help & Info Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-[#151B28] border border-[#E4DFEC] dark:border-[#253046] p-6 shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-serif font-bold text-[#241930] dark:text-[#EDE8F5]">
                About "What you are saving for"
              </h3>
              <button
                onClick={() => setShowHelpModal(false)}
                className="p-1 rounded-lg text-[#6B5E7B] hover:text-[#241930] dark:text-[#9487A5] dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#6B5E7B] dark:text-[#9487A5] leading-relaxed">
              This space lets you visually partition your savings into concrete, tangible milestones without emotional overwhelm.
            </p>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-[#EDE7F6] dark:bg-[#1E172B] border border-[#DDD4EE] dark:border-[#2D2144] text-[#4A3561] dark:text-[#D1B8EC]">
                <span className="font-bold">• Put in & Add it:</span> Deposit any amount into a goal at any time. Checking "Keep this out of safe to spend" ensures these savings won't show up in your daily safe spending allowance.
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200">
                <span className="font-bold">• Reaches & Payments:</span> Automatically projects when each goal will be completely funded based on your planned monthly pace.
              </div>
            </div>

            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full mt-3 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#4A3561] hover:bg-[#3D2B50] dark:bg-purple-700 dark:hover:bg-purple-600 transition"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
