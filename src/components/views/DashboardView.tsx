import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  Calendar, 
  HelpCircle, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  AlertCircle,
  RefreshCw,
  Wallet,
  Clock,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { useBudget } from '../../context/BudgetContext';
import { TabType } from '../BottomNav';

interface DashboardViewProps {
  onOpenQuickAdd: () => void;
  onOpenAffordability: () => void;
  onOpenImpulse: () => void;
  onNavigateTab: (tab: TabType) => void;
}

const ADHD_AFFIRMATIONS = [
  "You're not bad with money, you just needed a system built for your brain. 🧠✨",
  "Progress over perfection. Tracking even one expense today is a massive win! 🏆",
  "Spent a little extra? That's okay! We adjust the envelopes and keep moving. No shame. 💜",
  "Money is just energy and a tool. You are in control of today's choices. 🌱",
  "Impulse urges are normal. Putting things on pause gives your brain superpowers! ⚡",
  "Small daily habits compound into massive financial peace of mind. 🌈",
];

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenQuickAdd,
  onOpenAffordability,
  onOpenImpulse,
  onNavigateTab,
}) => {
  const { 
    settings, 
    paycheckConfig, 
    envelopes, 
    bills, 
    safeToSpendTotal, 
    safeToSpendPerDay, 
    daysUntilPaycheck,
    upcomingBillsBeforePaycheck,
    upcomingBillsSum,
    transactions,
    impulseItems,
    toggleBillPaid
  } = useBudget();

  const [affirmationIndex, setAffirmationIndex] = useState(0);

  const nextAffirmation = () => {
    setAffirmationIndex((prev) => (prev + 1) % ADHD_AFFIRMATIONS.length);
  };

  const activeImpulses = impulseItems.filter(i => i.status === 'cooling');
  const recentTransactions = transactions.slice(0, 5);

  const getDopamineBadge = (tag?: string) => {
    switch (tag) {
      case 'essential':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">🛡️ Need</span>;
      case 'planned':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">🎯 Planned</span>;
      case 'impulse':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">⚡ Impulse</span>;
      case 'adhd_tax':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">🩹 ADHD Tax</span>;
      case 'treat':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">✨ Treat</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Compassionate Affirmation Banner */}
      {settings.shameFreeAffirmations && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-indigo-500/10 dark:from-purple-950/40 dark:to-pink-950/30 p-3.5 border border-purple-200/60 dark:border-purple-800/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-xs font-semibold text-purple-900 dark:text-purple-200">
            <span className="text-base">💜</span>
            <span>{ADHD_AFFIRMATIONS[affirmationIndex]}</span>
          </div>
          <button
            onClick={nextAffirmation}
            className="p-1 rounded-lg text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-purple-200/50 transition-colors shrink-0"
            title="Next Affirmation"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Hero: Safe to Spend Dashboard Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-700 via-indigo-700 to-slate-900 text-white p-6 sm:p-8 shadow-xl shadow-purple-900/20">
        {/* Glow decoration */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-pink-500/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-purple-400/20 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold tracking-wide uppercase flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Safe-to-Spend Right Now
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-semibold flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-300" />
                {daysUntilPaycheck === 0 ? 'Payday today!' : `${daysUntilPaycheck} days until paycheck`}
              </span>
            </div>
          </div>

          {/* Main Huge Number */}
          <div className="my-2">
            <div className="text-4xl sm:text-6xl font-black tracking-tight font-mono">
              {settings.currencySymbol}{safeToSpendTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-purple-200 text-xs mt-1 font-medium">
              After reserving buffer cushion & upcoming bills before next payday
            </p>
          </div>

          {/* Daily Allowance & Quick Affordability Button */}
          <div className="mt-6 pt-5 border-t border-white/15 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 flex items-center justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-purple-200 font-bold block">
                  Daily Safe Allowance
                </span>
                <span className="text-2xl font-black font-mono text-emerald-300">
                  {settings.currencySymbol}{Math.max(0, safeToSpendPerDay).toFixed(2)}
                  <span className="text-xs font-normal text-purple-200"> / day</span>
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-purple-200 block">Remaining</span>
                <span className="text-xs font-bold text-white">{daysUntilPaycheck} days</span>
              </div>
            </div>

            <button
              onClick={onOpenAffordability}
              className="w-full py-3.5 px-4 rounded-2xl bg-white text-purple-900 hover:bg-purple-50 font-extrabold text-sm shadow-md flex items-center justify-center gap-2 transition-transform transform active:scale-95"
            >
              <HelpCircle className="w-4 h-4 text-purple-700" />
              Can I afford to buy something?
            </button>
          </div>

          {/* Account Breakdown Chips */}
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <div className="px-3 py-1.5 rounded-xl bg-black/20 backdrop-blur-sm flex items-center gap-1.5">
              <span className="text-purple-300">Bank Balance:</span>
              <span className="font-bold font-mono">{settings.currencySymbol}{paycheckConfig.currentBankBalance.toFixed(2)}</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-black/20 backdrop-blur-sm flex items-center gap-1.5">
              <span className="text-purple-300">ADHD Cushion Buffer:</span>
              <span className="font-bold font-mono">-{settings.currencySymbol}{paycheckConfig.cushionAmount.toFixed(2)}</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-black/20 backdrop-blur-sm flex items-center gap-1.5">
              <span className="text-purple-300">Upcoming Bills:</span>
              <span className="font-bold font-mono">-{settings.currencySymbol}{upcomingBillsSum.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Impulse Vault Quick Pill (if any active) */}
      {activeImpulses.length > 0 && (
        <div 
          onClick={onOpenImpulse}
          className="cursor-pointer p-4 rounded-2xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/10 border border-orange-300 dark:border-orange-800 flex items-center justify-between hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl animate-pulse">🧊</span>
            <div>
              <div className="text-sm font-bold text-slate-800 dark:text-white">
                {activeImpulses.length} item{activeImpulses.length > 1 ? 's' : ''} in your Impulse Cooling Vault
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Tap to check if the dopamine wore off and save money!
              </div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-orange-500" />
        </div>
      )}

      {/* Grid: Envelopes Quick View + Upcoming Bills */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending Envelopes Mini-Card */}
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">✉️</span>
              <h3 className="font-extrabold text-base text-slate-800 dark:text-white">
                Spending Envelopes
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('envelopes')}
              className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-0.5"
            >
              View All <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3.5">
            {envelopes.slice(0, 4).map(env => {
              const spent = env.spentAmount || 0;
              const remaining = Math.max(0, env.allocatedAmount - spent);
              const percent = Math.min(100, Math.round((spent / (env.allocatedAmount || 1)) * 100));
              const isOver = spent > env.allocatedAmount;

              return (
                <div key={env.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                      <span>{env.icon}</span>
                      <span>{env.name}</span>
                    </span>
                    <span className={`font-mono font-bold ${isOver ? 'text-rose-500' : 'text-slate-600 dark:text-slate-300'}`}>
                      {settings.currencySymbol}{remaining.toFixed(2)} left
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isOver 
                          ? 'bg-rose-500' 
                          : percent > 85 
                          ? 'bg-amber-500' 
                          : 'bg-gradient-to-r from-purple-500 to-indigo-500'
                      }`}
                      style={{ width: `${Math.min(100, percent)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bills Due Before Next Payday */}
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">📅</span>
              <div>
                <h3 className="font-extrabold text-base text-slate-800 dark:text-white">
                  Bills Due Before Payday
                </h3>
                <span className="text-[11px] text-slate-400">
                  Total upcoming: {settings.currencySymbol}{upcomingBillsSum.toFixed(2)}
                </span>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('bills')}
              className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-0.5"
            >
              All Bills <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {upcomingBillsBeforePaycheck.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
              All clear! No bills due before your next paycheck.
            </div>
          ) : (
            <div className="space-y-2.5">
              {upcomingBillsBeforePaycheck.slice(0, 4).map(bill => (
                <div
                  key={bill.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800"
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleBillPaid(bill.id)}
                      className="w-6 h-6 rounded-lg border-2 border-slate-300 dark:border-slate-600 flex items-center justify-center hover:border-emerald-500 transition-colors"
                      title="Mark Paid"
                    >
                      {bill.isPaidThisCycle && <span className="text-emerald-500 text-sm">✓</span>}
                    </button>
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-white">
                        {bill.name}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Due Day {bill.dueDay} • {bill.autoPay ? 'Auto-Pay ON' : 'Manual'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-extrabold font-mono text-slate-800 dark:text-white">
                      {settings.currencySymbol}{bill.amount.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions List */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🧾</span>
            <h3 className="font-extrabold text-base text-slate-800 dark:text-white">
              Recent Spends & Income
            </h3>
          </div>
          <button
            onClick={() => onNavigateTab('transactions')}
            className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-0.5"
          >
            Full History <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <p className="text-center py-6 text-xs text-slate-400">
            No transactions logged yet. Tap the + button to quick add!
          </p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentTransactions.map(tx => (
              <div key={tx.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-2xl flex items-center justify-center text-sm font-bold ${
                      tx.type === 'income'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                    }`}
                  >
                    {tx.type === 'income' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-2">
                      <span>{tx.description}</span>
                      {getDopamineBadge(tx.dopamineTag)}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {tx.category} • {tx.date}
                    </div>
                  </div>
                </div>
                <div className="text-right font-mono font-bold text-xs">
                  <span className={tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-white'}>
                    {tx.type === 'income' ? '+' : '-'}{settings.currencySymbol}{tx.amount.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

