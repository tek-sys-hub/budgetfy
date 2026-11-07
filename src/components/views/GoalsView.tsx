import React, { useState } from 'react';
import { 
  Target, 
  CreditCard, 
  Plus, 
  Sparkles, 
  Award, 
  TrendingDown, 
  CheckCircle, 
  Trash2,
  DollarSign,
  Flame,
  ArrowRight
} from 'lucide-react';
import { useBudget } from '../../context/BudgetContext';
import { SavingsGoal, DebtItem, DebtStrategy } from '../../types/budget';

export const GoalsView: React.FC = () => {
  const { 
    goals, 
    debts, 
    totalSaved, 
    totalDebt, 
    settings, 
    addGoal, 
    contributeToGoal, 
    deleteGoal,
    addDebt,
    makeDebtPayment,
    deleteDebt,
    setDebtStrategy,
    triggerConfetti 
  } = useBudget();

  const [activeSection, setActiveSection] = useState<'savings' | 'debt'>('savings');

  // Savings Goal modals
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalIcon, setGoalIcon] = useState('🛡️');
  const [goalColor, setGoalColor] = useState('#10B981');
  const [goalDate, setGoalDate] = useState('');

  // Contribute modal
  const [contributingGoal, setContributingGoal] = useState<SavingsGoal | null>(null);
  const [contribAmount, setContribAmount] = useState('');

  // Debt modals
  const [isAddingDebt, setIsAddingDebt] = useState(false);
  const [debtName, setDebtName] = useState('');
  const [debtBalance, setDebtBalance] = useState('');
  const [debtMinPay, setDebtMinPay] = useState('');
  const [debtApr, setDebtApr] = useState('');
  const [debtDueDay, setDebtDueDay] = useState('15');

  // Pay debt modal
  const [payingDebt, setPayingDebt] = useState<DebtItem | null>(null);
  const [debtPaymentAmount, setDebtPaymentAmount] = useState('');

  const emojiChoices = ['🛡️', '✈️', '🎨', '💻', '🚗', '💍', '🏡', '🏕️', '🎸', '🎁', '🏖️', '🎮'];

  // Sort Debts according to chosen strategy
  const sortedDebts = [...debts].sort((a, b) => {
    if (settings.debtStrategy === 'snowball') {
      return a.totalBalance - b.totalBalance; // Lowest balance first (dopamine quick wins)
    } else {
      return b.interestRate - a.interestRate; // Highest interest rate first (math efficiency)
    }
  });

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(goalTarget);
    if (!goalName.trim() || isNaN(target) || target <= 0) return;

    addGoal({
      name: goalName.trim(),
      targetAmount: target,
      targetDate: goalDate || undefined,
      icon: goalIcon,
      color: goalColor,
      category: 'Savings',
    });

    setGoalName('');
    setGoalTarget('');
    setIsAddingGoal(false);
  };

  const handleContribute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contributingGoal) return;
    const amt = parseFloat(contribAmount);
    if (isNaN(amt) || amt <= 0) return;

    contributeToGoal(contributingGoal.id, amt);
    setContribAmount('');
    setContributingGoal(null);
  };

  const handleCreateDebt = (e: React.FormEvent) => {
    e.preventDefault();
    const balance = parseFloat(debtBalance);
    const minPay = parseFloat(debtMinPay) || 25;
    const apr = parseFloat(debtApr) || 0;
    const dueDay = parseInt(debtDueDay, 10) || 15;
    if (!debtName.trim() || isNaN(balance) || balance <= 0) return;

    addDebt({
      name: debtName.trim(),
      totalBalance: balance,
      minimumPayment: minPay,
      interestRate: apr,
      dueDay,
      color: '#EF4444',
      icon: '💳',
      extraPaymentThisMonth: 0,
    });

    setDebtName('');
    setDebtBalance('');
    setDebtMinPay('');
    setDebtApr('');
    setIsAddingDebt(false);
  };

  const handlePayDebt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingDebt) return;
    const amt = parseFloat(debtPaymentAmount);
    if (isNaN(amt) || amt <= 0) return;

    makeDebtPayment(payingDebt.id, amt);
    setDebtPaymentAmount('');
    setPayingDebt(null);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Top Section Switcher */}
      <div className="rounded-3xl bg-white dark:bg-[#1E293B] p-2 border border-slate-200/80 dark:border-slate-800 shadow-sm flex">
        <button
          onClick={() => setActiveSection('savings')}
          className={`flex-1 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            activeSection === 'savings'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Savings Goals ({settings.currencySymbol}{totalSaved.toFixed(0)})</span>
        </button>

        <button
          onClick={() => setActiveSection('debt')}
          className={`flex-1 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            activeSection === 'debt'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Debt Snowball ({settings.currencySymbol}{totalDebt.toFixed(0)})</span>
        </button>
      </div>

      {/* ================= SAVINGS GOALS SECTION ================= */}
      {activeSection === 'savings' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🍯</span>
                <h2 className="text-xl font-black text-slate-800 dark:text-white">
                  Visual Savings Jars
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                ADHD friendly visual progress meters: watch your cushion grow!
              </p>
            </div>

            <button
              onClick={() => setIsAddingGoal(true)}
              className="py-2.5 px-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-600/20 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              New Savings Goal
            </button>
          </div>

          {/* Goal Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {goals.map(goal => {
              const percent = Math.min(100, Math.round((goal.currentAmount / (goal.targetAmount || 1)) * 100));
              const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
              const isCompleted = goal.currentAmount >= goal.targetAmount;

              return (
                <div
                  key={goal.id}
                  className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all"
                >
                  <div>
                    {/* Header with icon and delete */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-2xl shadow-inner">
                        {goal.icon}
                      </div>
                      <div className="flex items-center gap-2">
                        {isCompleted ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> Reached!
                          </span>
                        ) : (
                          <span className="text-xs font-mono font-bold text-slate-400">
                            {percent}%
                          </span>
                        )}
                        <button
                          onClick={() => deleteGoal(goal.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-extrabold text-base text-slate-800 dark:text-white">
                      {goal.name}
                    </h3>
                    {goal.targetDate && (
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Target: {goal.targetDate}
                      </span>
                    )}

                    {/* Numbers */}
                    <div className="my-3 flex items-baseline justify-between font-mono">
                      <span className="text-2xl font-black text-slate-900 dark:text-white">
                        {settings.currencySymbol}{goal.currentAmount.toFixed(0)}
                      </span>
                      <span className="text-xs text-slate-400">
                        of {settings.currencySymbol}{goal.targetAmount.toFixed(0)}
                      </span>
                    </div>

                    {/* Progress Bar with Milestone Markers */}
                    <div className="relative my-2">
                      <div className="w-full h-3.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-emerald-500 transition-all duration-700"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      {/* 25%, 50%, 75% markers */}
                      <div className="flex justify-between text-[9px] text-slate-400 font-bold px-1 mt-1">
                        <span>0%</span>
                        <span>25%</span>
                        <span>50%</span>
                        <span>75%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 mt-2">
                    <button
                      onClick={() => setContributingGoal(goal)}
                      className="w-full py-2.5 rounded-2xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/30 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Funds to Jar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= DEBT MANAGEMENT SECTION ================= */}
      {activeSection === 'debt' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🔥</span>
                <h2 className="text-xl font-black text-slate-800 dark:text-white">
                  Debt Smasher Planner
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Gamify your debt payoff with the Snowball method (fast dopamine wins!)
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Strategy selector */}
              <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-800 p-1">
                <button
                  onClick={() => setDebtStrategy('snowball')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                    settings.debtStrategy === 'snowball'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                  title="Lowest balance first for fast dopamine momentum"
                >
                  ⚡ Snowball
                </button>
                <button
                  onClick={() => setDebtStrategy('avalanche')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                    settings.debtStrategy === 'avalanche'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                  title="Highest interest rate first to minimize interest cost"
                >
                  🏔️ Avalanche
                </button>
              </div>

              <button
                onClick={() => setIsAddingDebt(true)}
                className="py-2.5 px-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-600/20 active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                Add Debt
              </button>
            </div>
          </div>

          {/* Debt Items List */}
          <div className="space-y-3">
            {sortedDebts.map((debt, index) => {
              const isTargetOne = index === 0 && debt.totalBalance > 0;

              return (
                <div
                  key={debt.id}
                  className={`p-5 rounded-3xl border transition-all ${
                    isTargetOne
                      ? 'bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-amber-500/10 border-purple-400 dark:border-purple-600 shadow-md ring-2 ring-purple-500/30'
                      : 'bg-white dark:bg-[#1E293B] border-slate-200/80 dark:border-slate-800 shadow-sm'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl shrink-0">
                        {debt.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-extrabold text-slate-900 dark:text-white">
                            {debt.name}
                          </span>
                          {isTargetOne && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-gradient-to-r from-purple-600 to-pink-600 text-white animate-pulse">
                              🎯 Target #1: Smash This First!
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          Min payment: {settings.currencySymbol}{debt.minimumPayment}/mo • APR: {debt.interestRate}% • Due Day: {debt.dueDay}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="text-left sm:text-right font-mono">
                        <span className="text-xs text-slate-400 block font-sans">Remaining Balance</span>
                        <span className="text-xl font-black text-rose-600 dark:text-rose-400">
                          {settings.currencySymbol}{debt.totalBalance.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setPayingDebt(debt)}
                          className="py-2.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                        >
                          <DollarSign className="w-3.5 h-3.5" />
                          Pay Down
                        </button>
                        <button
                          onClick={() => deleteDebt(debt.id)}
                          className="p-2 text-slate-400 hover:text-rose-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Contribute to Goal Modal */}
      {contributingGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#1E293B] w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-black text-slate-800 dark:text-white mb-2">
              Deposit to {contributingGoal.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Currently saved: {settings.currencySymbol}{contributingGoal.currentAmount} / {settings.currencySymbol}{contributingGoal.targetAmount}
            </p>

            <form onSubmit={handleContribute} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Deposit Amount ({settings.currencySymbol})
                </label>
                <input
                  type="number"
                  step="any"
                  autoFocus
                  required
                  placeholder="50.00"
                  value={contribAmount}
                  onChange={e => setContribAmount(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-purple-500 text-2xl font-black text-slate-800 dark:text-white font-mono"
                />
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setContributingGoal(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl bg-purple-600 text-white font-bold text-xs shadow-md shadow-purple-600/30"
                >
                  Deposit Now 🍯
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pay Debt Modal */}
      {payingDebt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#1E293B] w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-black text-slate-800 dark:text-white mb-2">
              Make Payment on {payingDebt.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Balance: {settings.currencySymbol}{payingDebt.totalBalance.toFixed(2)} • Minimum: {settings.currencySymbol}{payingDebt.minimumPayment}
            </p>

            <form onSubmit={handlePayDebt} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Payment Amount ({settings.currencySymbol})
                </label>
                <input
                  type="number"
                  step="any"
                  autoFocus
                  required
                  placeholder={payingDebt.minimumPayment.toString()}
                  value={debtPaymentAmount}
                  onChange={e => setDebtPaymentAmount(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-purple-500 text-2xl font-black text-slate-800 dark:text-white font-mono"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDebtPaymentAmount(payingDebt.minimumPayment.toString())}
                  className="px-3 py-1.5 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 font-semibold"
                >
                  Min: ${payingDebt.minimumPayment}
                </button>
                <button
                  type="button"
                  onClick={() => setDebtPaymentAmount((payingDebt.minimumPayment + 50).toString())}
                  className="px-3 py-1.5 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 font-semibold"
                >
                  Min + $50 Boost
                </button>
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setPayingDebt(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-600/30"
                >
                  Record Payment 🎉
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Goal Modal */}
      {isAddingGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#1E293B] w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-black text-slate-800 dark:text-white mb-4">
              Add Savings Goal
            </h3>

            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Goal Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vacation, New Laptop, Rainy Day"
                  value={goalName}
                  onChange={e => setGoalName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-purple-500 text-sm text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Target Amount ({settings.currencySymbol})
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="1000.00"
                  value={goalTarget}
                  onChange={e => setGoalTarget(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-purple-500 text-sm text-slate-800 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Pick an Icon
                </label>
                <div className="flex flex-wrap gap-2">
                  {emojiChoices.map(em => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setGoalIcon(em)}
                      className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all ${
                        goalIcon === em ? 'bg-purple-200 dark:bg-purple-900 ring-2 ring-purple-500 scale-110' : 'bg-slate-100 dark:bg-slate-800 hover:scale-105'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Target Date (Optional)
                </label>
                <input
                  type="date"
                  value={goalDate}
                  onChange={e => setGoalDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-purple-500 text-sm text-slate-800 dark:text-white"
                />
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddingGoal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl bg-purple-600 text-white font-bold text-xs shadow-md shadow-purple-600/30"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Debt Modal */}
      {isAddingDebt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#1E293B] w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-black text-slate-800 dark:text-white mb-4">
              Track a Loan or Debt
            </h3>

            <form onSubmit={handleCreateDebt} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Debt Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Visa Card, Car Loan, Medical Bill"
                  value={debtName}
                  onChange={e => setDebtName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-purple-500 text-sm text-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Balance ({settings.currencySymbol})
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="1200.00"
                    value={debtBalance}
                    onChange={e => setDebtBalance(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-purple-500 text-sm text-slate-800 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Min Payment ({settings.currencySymbol})
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="45.00"
                    value={debtMinPay}
                    onChange={e => setDebtMinPay(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-purple-500 text-sm text-slate-800 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Interest Rate (% APR)
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="21.99"
                    value={debtApr}
                    onChange={e => setDebtApr(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-purple-500 text-sm text-slate-800 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Day Due (1-31)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={debtDueDay}
                    onChange={e => setDebtDueDay(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-purple-500 text-sm text-slate-800 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddingDebt(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl bg-purple-600 text-white font-bold text-xs shadow-md shadow-purple-600/30"
                >
                  Add Debt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

