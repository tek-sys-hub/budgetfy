import React, { useState, useMemo } from 'react';
import { 
  HelpCircle, 
  Command, 
  Check, 
  X,
  Target,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useBudget } from '../../context/BudgetContext';
import { sound } from '../../services/sound';

interface MilestonesViewProps {
  onOpenQuickActions?: () => void;
  onNavigateToGoals?: () => void;
}

type MilestoneStatus = 'reached' | 'not_yet' | 'not_counted';

interface MilestoneItem {
  id: string;
  title: string;
  subtext: string;
  autoStatus: MilestoneStatus;
  status: MilestoneStatus;
  progressPercent?: number; // 0 to 100 for live progress bar
  isGoal?: boolean;
  isManuallyMarked?: boolean;
}

export const MilestonesView: React.FC<MilestonesViewProps> = ({ 
  onOpenQuickActions,
  onNavigateToGoals 
}) => {
  const { 
    transactions, 
    goals, 
    paycheckConfig,
    settings,
    extraIncomes,
    triggerConfetti 
  } = useBudget();

  const [activeFilter, setActiveFilter] = useState<'all' | 'reached' | 'not_yet'>('all');
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Manual mark state persisted in localStorage
  const [manualMarked, setManualMarked] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('budgetfy_manual_milestones');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const toggleMarkMilestone = (id: string, autoReached: boolean) => {
    if (autoReached) return;
    const isCurrentlyMarked = manualMarked.includes(id);
    let updated: string[];
    if (isCurrentlyMarked) {
      updated = manualMarked.filter(x => x !== id);
      sound.playTap();
    } else {
      updated = [...manualMarked, id];
      sound.playSuccess();
      triggerConfetti();
    }
    setManualMarked(updated);
    try {
      localStorage.setItem('budgetfy_manual_milestones', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save manual milestones', e);
    }
  };

  // --- STEP 1: Set your name & starting checking balance ---
  const profileConfiguredMilestone = useMemo((): MilestoneItem => {
    const hasName = Boolean(settings.userName && settings.userName.trim().length > 0);
    const hasBalance = paycheckConfig.currentBankBalance > 0;
    const autoReached = hasName || hasBalance;
    const isManual = manualMarked.includes('m-profile-set');
    const autoStatus: MilestoneStatus = autoReached ? 'reached' : 'not_yet';
    const status: MilestoneStatus = isManual ? 'reached' : autoStatus;

    let subtext = 'Set your name and checking balance in Settings';
    if (autoReached || isManual) {
      if (hasName && hasBalance) {
        subtext = `Configured for ${settings.userName} · ${settings.currencySymbol}${paycheckConfig.currentBankBalance.toFixed(2)} balance`;
      } else if (hasName) {
        subtext = `Profile personalized for ${settings.userName}`;
      } else if (hasBalance) {
        subtext = `Starting balance initialized at ${settings.currencySymbol}${paycheckConfig.currentBankBalance.toFixed(2)}`;
      } else {
        subtext = 'Marked reached by you ⭐';
      }
    }

    return {
      id: 'm-profile-set',
      title: 'Set up your name & checking balance',
      subtext,
      autoStatus,
      status,
      isManuallyMarked: isManual && !autoReached
    };
  }, [settings.userName, settings.currencySymbol, paycheckConfig.currentBankBalance, manualMarked]);

  // --- STEP 2: First spend written down ---
  const expenseTransactions = useMemo(() => {
    return (transactions || [])
      .filter(t => t.type === 'expense')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [transactions]);

  const firstSpendMilestone = useMemo((): MilestoneItem => {
    const hasSpend = expenseTransactions.length > 0;
    const isManual = manualMarked.includes('m-first-spend');
    const autoStatus: MilestoneStatus = hasSpend ? 'reached' : 'not_yet';
    const status: MilestoneStatus = isManual ? 'reached' : autoStatus;

    if (hasSpend) {
      const firstTx = expenseTransactions[0];
      const firstDate = new Date(firstTx.date);
      const dateLabel = !isNaN(firstDate.getTime()) 
        ? firstDate.toLocaleDateString('default', { weekday: 'short', day: 'numeric', month: 'short' })
        : firstTx.date;
      return {
        id: 'm-first-spend',
        title: 'First spend written down',
        subtext: `${dateLabel} · ${settings.currencySymbol}${firstTx.amount.toFixed(2)} (${firstTx.description || firstTx.category})`,
        autoStatus,
        status,
        isManuallyMarked: isManual && !hasSpend
      };
    }

    return {
      id: 'm-first-spend',
      title: 'First spend written down',
      subtext: isManual ? 'Marked reached by you ⭐' : 'Log an expense to record your first spend',
      autoStatus,
      status,
      progressPercent: 0,
      isManuallyMarked: isManual
    };
  }, [expenseTransactions, settings.currencySymbol, manualMarked]);

  // --- STEP 3: Connect paycheck & income schedule ---
  const paycheckScheduleMilestone = useMemo((): MilestoneItem => {
    const hasPaycheck = paycheckConfig.expectedAmount > 0;
    const hasIncomeTx = (transactions || []).some(t => t.type === 'income');
    const hasExtraIncome = (extraIncomes || []).length > 0;
    const autoReached = hasPaycheck || hasIncomeTx || hasExtraIncome;
    const isManual = manualMarked.includes('m-paycheck-set');
    const autoStatus: MilestoneStatus = autoReached ? 'reached' : 'not_yet';
    const status: MilestoneStatus = isManual ? 'reached' : autoStatus;

    let subtext = 'Set your expected paycheck in Planner or record money in';
    if (autoReached || isManual) {
      if (hasPaycheck) {
        subtext = `${settings.currencySymbol}${paycheckConfig.expectedAmount.toFixed(2)} deposit · on ${paycheckConfig.nextPayDate} (${paycheckConfig.frequency})`;
      } else if (hasIncomeTx || hasExtraIncome) {
        subtext = 'Income stream recorded and connected to your balance';
      } else {
        subtext = 'Marked reached by you ⭐';
      }
    }

    return {
      id: 'm-paycheck-set',
      title: 'Paycheck schedule & income set',
      subtext,
      autoStatus,
      status,
      isManuallyMarked: isManual && !autoReached
    };
  }, [paycheckConfig, transactions, extraIncomes, settings.currencySymbol, manualMarked]);

  // --- DYNAMIC GOAL MILESTONES ---
  // Every goal created in the site becomes a milestone!
  // Whenever money is added to that goal, the milestone updates in real time with a live progress bar.
  const dynamicGoalMilestones = useMemo((): MilestoneItem[] => {
    return (goals || []).map(goal => {
      const autoReached = goal.targetAmount > 0 && goal.currentAmount >= goal.targetAmount;
      const isManual = manualMarked.includes(`m-goal-${goal.id}`);
      const autoStatus: MilestoneStatus = autoReached ? 'reached' : 'not_yet';
      const status: MilestoneStatus = isManual ? 'reached' : autoStatus;
      const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
      const percent = goal.targetAmount > 0 
        ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) 
        : 0;

      let subtext = '';
      if (autoReached || isManual) {
        subtext = isManual && !autoReached 
          ? 'Marked reached by you ⭐' 
          : `Goal reached in full! ${settings.currencySymbol}${goal.currentAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })} of ${settings.currencySymbol}${goal.targetAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })} 🎉`;
      } else {
        subtext = `${settings.currencySymbol}${remaining.toLocaleString(undefined, { maximumFractionDigits: 0 })} to go · ${settings.currencySymbol}${goal.currentAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })} of ${settings.currencySymbol}${goal.targetAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
      }

      return {
        id: `m-goal-${goal.id}`,
        title: `Goal: ${goal.name}`,
        subtext,
        autoStatus,
        status,
        progressPercent: percent,
        isGoal: true,
        isManuallyMarked: isManual && !autoReached
      };
    });
  }, [goals, settings.currencySymbol, manualMarked]);

  // Combined Milestones List: 3 Core Setup Steps + Active Goals
  const allMilestones: MilestoneItem[] = useMemo(() => [
    profileConfiguredMilestone,
    firstSpendMilestone,
    paycheckScheduleMilestone,
    ...dynamicGoalMilestones
  ], [
    profileConfiguredMilestone,
    firstSpendMilestone,
    paycheckScheduleMilestone,
    dynamicGoalMilestones
  ]);

  // Summary counts
  const reachedCount = allMilestones.filter(m => m.status === 'reached').length;
  const notYetCount = allMilestones.filter(m => m.status === 'not_yet').length;
  const totalCount = allMilestones.length;

  // Filtered view
  const filteredMilestones = useMemo(() => {
    if (activeFilter === 'reached') return allMilestones.filter(m => m.status === 'reached');
    if (activeFilter === 'not_yet') return allMilestones.filter(m => m.status === 'not_yet');
    return allMilestones;
  }, [activeFilter, allMilestones]);

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16 pt-2">
      {/* 1. Header Area */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 pb-1">
        <div>
          <span className="text-[11px] font-bold tracking-widest text-[#6B5E7B] dark:text-[#A89CB8] uppercase">
            MILESTONES
          </span>
          <div className="flex items-center gap-2 mt-1">
            <h1 className="text-2xl sm:text-3xl font-serif font-normal text-[#241930] dark:text-[#EDE8F5] tracking-tight">
              Things that already happened
            </h1>
            <button
              onClick={() => setShowHelpModal(true)}
              className="text-[#6B5E7B] dark:text-[#A89CB8] hover:text-[#241930] dark:hover:text-white transition rounded-full p-0.5 focus:outline-hidden"
              title="What are Milestones?"
            >
              <HelpCircle className="w-4 h-4 opacity-70 hover:opacity-100" />
            </button>
          </div>
          <p className="text-xs sm:text-sm text-[#6B5E7B] dark:text-[#9487A5] mt-1 font-serif italic">
            worked out from what is already in the file
          </p>
        </div>

        {/* Right header buttons & filters */}
        <div className="flex items-center gap-2.5 self-stretch sm:self-auto justify-end flex-wrap">
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

          {/* Filter Pills */}
          <div className="flex items-center gap-1 p-1 bg-white/80 dark:bg-[#1A202C]/80 border border-[#E4DFEC] dark:border-[#2D3748] rounded-xl text-xs shadow-2xs">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition text-xs font-medium ${
                activeFilter === 'all'
                  ? 'bg-[#EDE9F2] dark:bg-purple-900/60 text-[#241930] dark:text-white font-semibold'
                  : 'text-[#6B5E7B] dark:text-[#9487A5] hover:text-[#241930]'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveFilter('reached')}
              className={`px-3 py-1.5 rounded-lg transition text-xs font-medium ${
                activeFilter === 'reached'
                  ? 'bg-[#EDE9F2] dark:bg-purple-900/60 text-[#241930] dark:text-white font-semibold'
                  : 'text-[#6B5E7B] dark:text-[#9487A5] hover:text-[#241930]'
              }`}
            >
              Reached
            </button>
            <button
              onClick={() => setActiveFilter('not_yet')}
              className={`px-3 py-1.5 rounded-lg transition text-xs font-medium ${
                activeFilter === 'not_yet'
                  ? 'bg-[#EDE9F2] dark:bg-purple-900/60 text-[#241930] dark:text-white font-semibold'
                  : 'text-[#6B5E7B] dark:text-[#9487A5] hover:text-[#241930]'
              }`}
            >
              Not yet
            </button>
          </div>
        </div>
      </div>

      {/* 2. Upper Card: "REACHED SO FAR" */}
      <div className="rounded-2xl sm:rounded-3xl bg-[#DDEEE4]/90 dark:bg-[#122219]/90 border border-[#CDE3D5] dark:border-[#1F3D2C] p-6 sm:p-8 md:p-9 shadow-xs relative overflow-hidden transition-all">
        {/* Top Split Row */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold tracking-wider text-[#264A38] dark:text-[#96DEB7] uppercase">
                REACHED SO FAR
              </span>
              <button
                onClick={() => setShowHelpModal(true)}
                className="text-[#3F6B55] dark:text-[#78B395] hover:text-[#1B3627] dark:hover:text-white transition"
              >
                <HelpCircle className="w-3.5 h-3.5 opacity-80" />
              </button>
            </div>

            <div className="mt-2 font-serif">
              <span className="text-3xl sm:text-4xl font-normal text-[#1B3627] dark:text-[#E2F7ED]">
                {reachedCount}
              </span>
              <span className="text-sm sm:text-base font-serif text-[#4A6E5C] dark:text-[#8DBAA3] ml-2">
                of {totalCount}
              </span>
            </div>

            <p className="font-serif italic text-xs sm:text-sm text-[#4A6E5C] dark:text-[#8DBAA3] mt-1.5">
              once reached, they stay reached
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs sm:text-sm text-[#4D6D5D] dark:text-[#88B8A0] font-medium">
              {notYetCount} still to reach
            </span>
          </div>
        </div>

        {/* Dynamic Segmented Progress Bar (Reflects all real achievements + goals) */}
        <div className="mt-7 mb-4">
          <div className="w-full h-3.5 sm:h-4 rounded-full overflow-hidden flex bg-white/30 dark:bg-black/20 p-0.5">
            {allMilestones.map((m) => {
              const bgClass = m.status === 'reached'
                ? 'bg-[#264D38] dark:bg-[#346B4E]' // reached (dark green)
                : 'bg-[#C86D5B] dark:bg-[#D67C6A]'; // not yet (coral/terracotta)

              return (
                <div
                  key={m.id}
                  className={`flex-1 h-full ${bgClass} border-r border-[#DDEEE4] dark:border-[#122219] last:border-r-0 first:rounded-l-full last:rounded-r-full transition-all duration-300`}
                  title={`${m.title} (${m.status})`}
                />
              );
            })}
          </div>
        </div>

        {/* Legend under the bar */}
        <div className="flex items-center gap-5 text-xs font-serif text-[#4A6E5C] dark:text-[#8DBAA3] pt-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#264D38] dark:bg-[#346B4E]"></span>
            <span>reached {reachedCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C86D5B] dark:bg-[#D67C6A]"></span>
            <span>still to reach {notYetCount}</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[#5A7C6B] dark:text-[#8DBAA3] ml-auto">
            <span>3 core setup steps + {goals.length} goal{goals.length === 1 ? '' : 's'}</span>
          </div>
        </div>
      </div>

      {/* 3. Lower Card: "Every milestone" */}
      <div className="rounded-2xl sm:rounded-3xl bg-white/90 dark:bg-[#141B26]/90 border border-[#E4DFEC] dark:border-[#222E40] p-6 sm:p-8 md:p-9 shadow-xs transition-all space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#EDE9F2] dark:border-[#20293D]">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-serif font-medium text-[#241930] dark:text-[#EDE8F5]">
              Every milestone
            </h2>
            <button
              onClick={() => setShowHelpModal(true)}
              className="text-[#6B5E7B] dark:text-[#A89CB8] hover:text-[#241930] dark:hover:text-white transition"
            >
              <HelpCircle className="w-3.5 h-3.5 opacity-80" />
            </button>
          </div>

          <span className="text-xs text-[#6B5E7B] dark:text-[#9487A5] font-medium">
            all {totalCount}
          </span>
        </div>

        {/* List of Milestones */}
        <div className="divide-y divide-[#EDE9F2] dark:divide-[#20293D]">
          {filteredMilestones.map(m => {
            const isReached = m.status === 'reached';
            const isNotYet = m.status === 'not_yet';
            const isAutoReached = m.autoStatus === 'reached';

            return (
              <div 
                key={m.id} 
                className="py-5 sm:py-6 first:pt-2 last:pb-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 group transition"
              >
                {/* Left side: Clickable Icon + Title + Subtext + Live Goal Progress Bar */}
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  {/* Status Indicator Circle - Tap to toggle Mark It */}
                  <button
                    type="button"
                    onClick={() => toggleMarkMilestone(m.id, isAutoReached)}
                    disabled={isAutoReached}
                    className={`mt-0.5 shrink-0 transition-transform active:scale-90 ${
                      !isAutoReached ? 'cursor-pointer hover:scale-110' : 'cursor-default'
                    }`}
                    title={
                      isAutoReached 
                        ? 'Automatically verified from your budget data' 
                        : isReached 
                          ? 'Click to unmark' 
                          : 'Click to mark as reached'
                    }
                  >
                    {isReached && (
                      <div className="w-5.5 h-5.5 rounded-full bg-[#264D38] text-white flex items-center justify-center shadow-xs">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                    {isNotYet && (
                      <div className="w-5.5 h-5.5 rounded-full border border-purple-400 dark:border-purple-500 bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center hover:bg-purple-100">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-600 dark:bg-purple-400" />
                      </div>
                    )}
                  </button>

                  {/* Title and details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-medium text-[#241930] dark:text-[#EDE8F5]">
                        {m.title}
                      </h3>
                      {m.isGoal && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#EDE7F6] dark:bg-[#201A2F] text-[#4A3561] dark:text-[#D1B8EC]">
                          Savings Goal
                        </span>
                      )}
                    </div>
                    
                    <p className="text-xs sm:text-sm text-[#6B5E7B] dark:text-[#9487A5] font-serif mt-1">
                      {m.subtext}
                    </p>

                    {/* Real-time Progress Bar for In-Progress Goals or Steps */}
                    {isNotYet && m.progressPercent !== undefined && (
                      <div className="w-full max-w-xs sm:max-w-sm mt-2.5 space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-medium text-[#6B5E7B] dark:text-[#9487A5]">
                          <span>Goal progress</span>
                          <span className="font-semibold text-purple-700 dark:text-purple-300">{m.progressPercent}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-[#EDE7F6] dark:bg-[#221B2E] overflow-hidden p-0.5">
                          <div 
                            className="h-full rounded-full bg-[#5B4373] dark:bg-purple-500 transition-all duration-500 ease-out"
                            style={{ width: `${m.progressPercent}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Completed Goal Milestone Visual Indicator */}
                    {isReached && m.isGoal && (
                      <div className="w-full max-w-xs sm:max-w-sm mt-2.5 space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                          <span>100% Completed</span>
                          <span>🎉</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-emerald-100 dark:bg-emerald-950/40 overflow-hidden p-0.5">
                          <div className="h-full rounded-full bg-[#264D38] dark:bg-[#346B4E] w-full" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right side: Pill Status Badge + "Mark It" Action Option */}
                <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0 pt-1 sm:pt-0">
                  {/* When reached */}
                  {isReached && (
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#E1EFE7] dark:bg-[#12231A] text-[#264A38] dark:text-[#96DEB7] flex items-center gap-1 shadow-2xs">
                        <Check className="w-3 h-3 stroke-[2.5]" />
                        <span>reached</span>
                      </span>

                      {/* If manually marked by user, show quick option to unmark */}
                      {m.isManuallyMarked && (
                        <button
                          onClick={() => toggleMarkMilestone(m.id, false)}
                          className="text-[11px] text-[#7F7094] hover:text-rose-500 underline transition px-1"
                          title="Unmark milestone"
                        >
                          Unmark
                        </button>
                      )}
                    </div>
                  )}

                  {/* When not yet reached */}
                  {isNotYet && (
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#EDE7F6] dark:bg-[#201A2F] text-[#4A3561] dark:text-[#D1B8EC]">
                        not yet
                      </span>

                      {/* "Mark it" Button */}
                      <button
                        onClick={() => toggleMarkMilestone(m.id, false)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium text-[#4A3561] dark:text-purple-300 bg-white/90 dark:bg-[#1E1928] border border-[#DDD4EE] dark:border-[#382B4E] hover:bg-[#EDE7F6] dark:hover:bg-[#2D223F] transition active:scale-95 shadow-2xs"
                        title="Mark this milestone as reached"
                      >
                        <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />
                        <span>Mark it</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* If user has 0 goals yet, provide a friendly prompt to add a goal */}
        {goals.length === 0 && (
          <div className="p-4 rounded-2xl bg-[#FAF8FC] dark:bg-[#181E2B] border border-[#E4DFEC] dark:border-[#253046] flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-[#6B5E7B] dark:text-[#A89CB8]">
              <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Add a savings goal to automatically track its money progress here!</span>
            </div>
            {onNavigateToGoals && (
              <button
                onClick={onNavigateToGoals}
                className="inline-flex items-center gap-1 font-semibold text-purple-700 dark:text-purple-300 hover:underline shrink-0"
              >
                <span>Go to Goals</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Footer Explanation Note */}
        <div className="pt-6 border-t border-[#EDE9F2] dark:border-[#20293D]">
          <p className="text-xs text-[#7F7094] dark:text-[#A798BC] font-serif italic">
            every milestone is directly tied to your real setup steps and savings goals
          </p>
        </div>
      </div>

      {/* 4. Help & Info Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-[#151B28] border border-[#E4DFEC] dark:border-[#253046] p-6 shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-serif font-bold text-[#241930] dark:text-[#EDE8F5]">
                About "Things that already happened"
              </h3>
              <button
                onClick={() => setShowHelpModal(false)}
                className="p-1 rounded-lg text-[#6B5E7B] hover:text-[#241930] dark:text-[#9487A5] dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#6B5E7B] dark:text-[#9487A5] leading-relaxed">
              Every milestone here is directly tied to concrete achievements you make on the site:
            </p>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-[#E1EFE7] dark:bg-[#12231A] text-[#264A38] dark:text-[#96DEB7]">
                <span className="font-bold">• 3 Core Setup Steps:</span> Setting your name/balance, logging your first spend, and connecting your paycheck schedule.
              </div>
              <div className="p-3 rounded-xl bg-[#EDE7F6] dark:bg-[#1E172B] text-[#4A3561] dark:text-[#D1B8EC]">
                <span className="font-bold">• Real-Time Goals Progress:</span> Every savings goal you add appears here automatically. Whenever you add money into a goal, its progress bar increases step-by-step!
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
