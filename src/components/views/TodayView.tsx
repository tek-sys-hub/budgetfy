import React, { useState } from 'react';
import { 
  HelpCircle, 
  Check, 
  Trash2, 
  Plus, 
  Coffee, 
  Utensils, 
  Bus, 
  Sparkles,
  Info
} from 'lucide-react';
import { useBudget } from '../../context/BudgetContext';
import { ExpenseBreakdownChart } from '../ExpenseBreakdownChart';

interface TodayViewProps {
  onOpenQuickAdd: () => void;
  onOpenAffordability: () => void;
}

export const TodayView: React.FC<TodayViewProps> = ({
  onOpenQuickAdd,
  onOpenAffordability,
}) => {
  const { 
    settings, 
    paycheckConfig,
    safeToSpendTotal, 
    safeToSpendPerDay,
    daysUntilPaycheck,
    transactions, 
    addTransaction, 
    deleteTransaction,
    helpMode, 
    setHelpMode,
    brainDumpItems,
    addBrainDumpItem,
    toggleBrainDumpItem,
    deleteBrainDumpItem,
    smallThings,
    toggleSmallThing,
    focusMode
  } = useBudget();

  const [brainDumpInput, setBrainDumpInput] = useState('');
  const [showFormulaModal, setShowFormulaModal] = useState(false);
  const [currentOneThingIndex, setCurrentOneThingIndex] = useState(0);

  const ONE_THINGS = [
    { title: "Log anything you spent today", time: "30 sec" },
    { title: "Take 1 item from impulse and pause it", time: "1 min" },
    { title: "Check upcoming bills before next paycheck", time: "45 sec" },
    { title: "Breathe: you're managing money with kindness today", time: "10 sec" },
  ];

  const currentOneThing = ONE_THINGS[currentOneThingIndex % ONE_THINGS.length];

  // Today's transactions
  const todayStr = new Date().toISOString().split('T')[0];
  const todayTransactions = transactions.filter(t => t.date === todayStr);
  const todaySpentTotal = todayTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Remaining safe today
  const dailyTarget = Math.max(0, safeToSpendPerDay);
  const remainingToday = Math.max(0, dailyTarget - todaySpentTotal);
  const dailyPercentSpent = dailyTarget > 0 ? Math.min(100, Math.round((todaySpentTotal / dailyTarget) * 100)) : 0;

  const completedSmallThingsCount = smallThings.filter(s => s.done).length;

  const handleBrainDumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brainDumpInput.trim()) return;
    addBrainDumpItem(brainDumpInput);
    setBrainDumpInput('');
  };

  const handleQuickPresetLog = (desc: string, amount: number) => {
    addTransaction({
      description: desc,
      amount,
      type: 'expense',
      category: desc.includes('Coffee') ? 'Dining Out & Coffee' : desc.includes('Lunch') ? 'Dining Out & Coffee' : 'Transport',
      date: todayStr,
      dopamineTag: 'treat',
    });
  };

  return (
    <div className="space-y-4 pb-24 md:pb-12 max-w-6xl mx-auto">
      {/* 1. Help is on Banner (from screenshot) */}
      {helpMode && (
        <div className="rounded-2xl bg-[#EBE7F2] dark:bg-[#111827] p-3.5 border-l-4 border-[#4A3561] dark:border-indigo-500 flex items-center justify-between gap-3 text-xs text-[#4A3561] dark:text-indigo-200 shadow-2xs animate-fade-in border border-[#DDD7E8] dark:border-[#1E293B]">
          <div className="flex items-center gap-2">
            <span>
              Help is on. Tap any <strong className="font-bold">?</strong> to see what a section does. Turn it off with the purple <strong className="font-bold">?</strong> at the top when you are done.
            </span>
          </div>
          <button
            onClick={() => setHelpMode(false)}
            className="px-3 py-1 rounded-xl bg-white dark:bg-[#1E293B] hover:bg-slate-50 dark:hover:bg-[#283852] border border-[#DDD5E6] dark:border-[#2C3B53] font-semibold text-xs text-[#4A3561] dark:text-slate-100 shadow-2xs shrink-0"
          >
            Got it
          </button>
        </div>
      )}

      {/* 2. RIGHT NOW • ONE THING ONLY Focus Card (from screenshot) */}
      <div className="rounded-2xl sm:rounded-3xl bg-[#241930] dark:bg-[#161F30] text-white p-4 sm:p-5 shadow-sm relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-transparent dark:border-[#24334C]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/10 text-white font-mono text-xs font-bold flex items-center justify-center shrink-0">
            {currentOneThingIndex + 1}
          </div>
          <div>
            <div className="text-[10px] font-bold tracking-widest text-[#B2A4C4] dark:text-indigo-300 uppercase">
              Right now • One thing only
            </div>
            <h2 className="text-base sm:text-lg font-serif font-normal text-white tracking-wide mt-0.5">
              {currentOneThing.title}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          {helpMode && (
            <button
              onClick={() => alert('ADHD Focus Tip: When overwhelmed by big budgets, just complete one tiny step at a time!')}
              className="w-5 h-5 rounded-full bg-white/15 text-white/80 text-[10px] flex items-center justify-center"
            >
              ?
            </button>
          )}

          <span className="px-2.5 py-1 rounded-full bg-white/10 text-[10px] font-mono text-purple-200 dark:text-indigo-200">
            {currentOneThing.time}
          </span>

          <button
            onClick={() => setCurrentOneThingIndex(prev => prev + 1)}
            className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-indigo-600 text-[#241930] dark:text-white hover:bg-purple-50 font-bold text-xs shadow-xs transition-transform active:scale-95"
          >
            Done — next
          </button>
        </div>
      </div>

      {/* 3. Middle Section: SAFE TO SPEND TODAY + THREE SMALL THINGS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* SAFE TO SPEND TODAY Card (8 cols) */}
        <div className="lg:col-span-7 bg-[#EBE7F2] dark:bg-[#111827] rounded-3xl p-6 border border-[#DDD7E8] dark:border-[#1F293D] shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between text-[#5E4E73] dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
              <span className="flex items-center gap-1.5 font-sans">
                Safe to spend today
                {helpMode && (
                  <button 
                    onClick={() => setShowFormulaModal(true)}
                    className="w-4 h-4 rounded-full bg-[#DDD6E8] dark:bg-[#1F293D] text-[#5E4E73] dark:text-slate-300 text-[10px] flex items-center justify-center font-bold"
                  >
                    ?
                  </button>
                )}
              </span>
            </div>

            {/* Giant Serif Number */}
            <div className="my-2">
              <div className="text-5xl sm:text-6xl font-serif text-[#241930] dark:text-slate-100 font-normal tracking-tight">
                {settings.security?.hideBalances ? `${settings.currencySymbol}••••` : `${settings.currencySymbol}${remainingToday.toFixed(2)}`}
              </div>
            </div>

            {/* Explanation text */}
            <p className="text-xs text-[#75668B] dark:text-slate-400 mt-1 font-serif italic">
              of today's starting {settings.security?.hideBalances ? `${settings.currencySymbol}••••` : `${settings.currencySymbol}${dailyTarget.toFixed(2)}`} — {settings.security?.hideBalances ? `${settings.currencySymbol}••••` : `${settings.currencySymbol}${safeToSpendTotal.toFixed(2)}`} has to last to the end of the pay cycle ({daysUntilPaycheck} days left)
            </p>

            <button
              onClick={() => setShowFormulaModal(true)}
              className="text-[11px] text-[#553E70] dark:text-indigo-400 underline font-medium mt-1 inline-block hover:opacity-80"
            >
              How is this worked out?
            </button>

            {/* Daily progress bar */}
            <div className="mt-4">
              <div className="w-full h-1.5 rounded-full bg-[#DDD6E8] dark:bg-[#1F293D] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#4A3561] dark:bg-indigo-500 transition-all duration-500"
                  style={{ width: `${dailyPercentSpent}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-[#8C7D9E] dark:text-slate-400 font-sans mt-1">
                <span>{settings.currencySymbol}{todaySpentTotal.toFixed(2)} spent today</span>
                <span>{settings.currencySymbol}{remainingToday.toFixed(2)} remaining</span>
              </div>
            </div>
          </div>

          {/* Quick preset chips (+ Coffee $4, + Lunch $12, + Bus $6) */}
          <div className="mt-6 pt-4 border-t border-[#DDD6E8]/70 dark:border-[#1F293D] flex flex-wrap gap-2">
            <button
              onClick={() => handleQuickPresetLog('Coffee', 4)}
              className="px-3 py-1.5 rounded-full bg-[#E3DCEB] dark:bg-[#1E293B] hover:bg-[#D9D0E3] dark:hover:bg-[#283852] text-[#3E2F52] dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Coffee className="w-3.5 h-3.5 text-[#5F4E75] dark:text-indigo-400" />
              <span>+ Coffee $4</span>
            </button>

            <button
              onClick={() => handleQuickPresetLog('Lunch', 12)}
              className="px-3 py-1.5 rounded-full bg-[#E3DCEB] dark:bg-[#1E293B] hover:bg-[#D9D0E3] dark:hover:bg-[#283852] text-[#3E2F52] dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Utensils className="w-3.5 h-3.5 text-[#5F4E75] dark:text-indigo-400" />
              <span>+ Lunch $12</span>
            </button>

            <button
              onClick={() => handleQuickPresetLog('Bus', 6)}
              className="px-3 py-1.5 rounded-full bg-[#E3DCEB] dark:bg-[#1E293B] hover:bg-[#D9D0E3] dark:hover:bg-[#283852] text-[#3E2F52] dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Bus className="w-3.5 h-3.5 text-[#5F4E75] dark:text-indigo-400" />
              <span>+ Bus $6</span>
            </button>

            <button
              onClick={onOpenAffordability}
              className="px-3 py-1.5 rounded-full bg-white/70 dark:bg-[#1E293B] hover:bg-white dark:hover:bg-[#283852] text-[#4A3561] dark:text-indigo-300 text-xs font-bold border border-[#DDD6E8] dark:border-[#2C3B53] ml-auto"
            >
              Can I afford this?
            </button>
          </div>
        </div>

        {/* THREE SMALL THINGS Card (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-[#111827] rounded-3xl p-6 border border-[#DDD7E8] dark:border-[#1F293D] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#75668B] dark:text-slate-400 mb-4">
              <span className="flex items-center gap-1.5">
                Three small things
                {helpMode && <span className="w-4 h-4 rounded-full bg-[#EDE8F4] dark:bg-[#1E293B] text-[#75668B] dark:text-slate-300 text-[10px] flex items-center justify-center font-bold">?</span>}
              </span>
              <span className="font-mono text-[11px] text-[#8C7D9E] dark:text-slate-400">
                {completedSmallThingsCount} of {smallThings.length} done
              </span>
            </div>

            {/* Checklist */}
            <div className="space-y-2.5">
              {smallThings.map(item => (
                <div
                  key={item.id}
                  onClick={() => toggleSmallThing(item.id)}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-2 select-none ${
                    item.done
                      ? 'bg-[#F5F2F9] dark:bg-[#162032] border-[#E5DEEE] dark:border-[#223049] text-[#9384A6] dark:text-slate-500 line-through'
                      : 'bg-[#FAF9FC] dark:bg-[#162032] border-[#E8E2F0] dark:border-[#223049] text-[#241930] dark:text-slate-100 hover:border-[#4A3561] dark:hover:border-indigo-500'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-colors ${
                        item.done
                          ? 'bg-[#4A3561] dark:bg-indigo-600 border-[#4A3561] dark:border-indigo-600 text-white'
                          : 'border-[#9E90B0] dark:border-slate-500'
                      }`}
                    >
                      {item.done && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <span className="text-xs font-medium">
                      {item.text}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono text-[#8C7D9E] dark:text-slate-400 shrink-0">
                    {item.timeEstimate}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Italic Motto from screenshot */}
          <div className="mt-6 pt-3 text-right">
            <span className="text-xs font-serif italic text-[#7C6C92] dark:text-slate-400">
              do one, feel better — that's the whole trick
            </span>
          </div>
        </div>
      </div>

      {/* 4. Where Your Expenses Go: Interactive Pie Chart & Trend Graph */}
      <ExpenseBreakdownChart
        transactions={transactions}
        settings={settings}
        onOpenQuickAdd={onOpenQuickAdd}
      />

      {/* 5. Bottom Row: What you logged + BRAIN DUMP */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: What you logged (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#111827] rounded-3xl p-6 border border-[#DDD7E8] dark:border-[#1F293D] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-serif font-bold text-base text-[#241930] dark:text-slate-100">
                What you logged
              </h3>
              <span className="text-[11px] text-[#8C7D9E] dark:text-slate-400 font-mono">
                {todayTransactions.length === 0 ? 'nothing yet' : `${todayTransactions.length} logged`}
              </span>
            </div>
            <p className="text-xs text-[#8C7D9E] dark:text-slate-400 mb-4">
              every spend you log, newest first
            </p>

            {todayTransactions.length === 0 ? (
              <div className="py-8 text-center bg-[#FAF9FC] dark:bg-[#162032] rounded-2xl border border-dashed border-[#DDD7E8] dark:border-[#223049] p-4">
                <p className="font-serif italic text-sm text-[#7D6E93] dark:text-slate-300">
                  nothing logged yet. anything you add lands here, editable.
                </p>
                <button
                  onClick={onOpenQuickAdd}
                  className="mt-3 px-4 py-2 rounded-xl bg-[#241930] dark:bg-indigo-600 hover:bg-[#3B2950] text-white text-xs font-medium shadow-xs transition-transform active:scale-95"
                >
                  Log a spend
                </button>
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {todayTransactions.map(t => (
                  <div
                    key={t.id}
                    className="p-3 rounded-xl bg-[#FAF9FC] dark:bg-[#162032] border border-[#E9E3F1] dark:border-[#223049] flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-[#241930] dark:text-slate-100">
                        {t.description}
                      </span>
                      <span className="text-[10px] text-[#8C7D9E] dark:text-slate-400 ml-2">
                        {t.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#241930] dark:text-slate-100">
                        {settings.currencySymbol}{t.amount.toFixed(2)}
                      </span>
                      <button
                        onClick={() => deleteTransaction(t.id)}
                        className="text-[#9E90B0] dark:text-slate-400 hover:text-rose-500 p-1"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {todayTransactions.length > 0 && (
            <div className="mt-4 pt-3 border-t border-[#ECE6F3] dark:border-[#1F293D] flex justify-end">
              <button
                onClick={onOpenQuickAdd}
                className="px-3.5 py-1.5 rounded-xl bg-[#241930] dark:bg-indigo-600 text-white text-xs font-medium"
              >
                + Log another spend
              </button>
            </div>
          )}
        </div>

        {/* Right: BRAIN DUMP (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-[#111827] rounded-3xl p-6 border border-[#DDD7E8] dark:border-[#1F293D] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#75668B] dark:text-slate-400 mb-3">
              <span className="flex items-center gap-1.5">
                Brain dump
                {helpMode && <span className="w-4 h-4 rounded-full bg-[#EDE8F4] dark:bg-[#1E293B] text-[#75668B] dark:text-slate-300 text-[10px] flex items-center justify-center font-bold">?</span>}
              </span>
            </div>

            {/* Input: Type it, press Enter */}
            <form onSubmit={handleBrainDumpSubmit} className="mb-3">
              <input
                type="text"
                placeholder="Type it, press Enter"
                value={brainDumpInput}
                onChange={e => setBrainDumpInput(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF9FC] dark:bg-[#162032] border border-[#E0D8EA] dark:border-[#223049] text-xs text-[#241930] dark:text-slate-100 focus:outline-none focus:border-[#4A3561] dark:focus:border-indigo-500"
              />
            </form>

            {/* Brain dump list */}
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {brainDumpItems.map(item => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-1.5 px-2.5 rounded-xl bg-[#FAF9FC] dark:bg-[#162032] border border-[#F0EAF5] dark:border-[#223049] text-xs"
                >
                  <div
                    onClick={() => toggleBrainDumpItem(item.id)}
                    className="flex items-center gap-2 cursor-pointer flex-1"
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded-md border flex items-center justify-center text-[8px] ${
                        item.done ? 'bg-[#4A3561] dark:bg-indigo-600 text-white border-[#4A3561] dark:border-indigo-600' : 'border-[#A394B7] dark:border-slate-500'
                      }`}
                    >
                      {item.done && '✓'}
                    </div>
                    <span className={`text-xs ${item.done ? 'line-through text-[#9D8EAF] dark:text-slate-500' : 'text-[#241930] dark:text-slate-100'}`}>
                      {item.text}
                    </span>
                  </div>

                  <button
                    onClick={() => deleteBrainDumpItem(item.id)}
                    className="text-[#9D8EAF] dark:text-slate-500 hover:text-rose-500 p-0.5 ml-1"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Italic footer from screenshot */}
          <div className="mt-4 pt-2">
            <span className="text-xs font-serif italic text-[#7C6C92] dark:text-slate-400">
              Not money... just yours
            </span>
          </div>
        </div>
      </div>

      {/* Formula Modal: "How is this worked out?" */}
      {showFormulaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-[#1E1628] w-full max-w-md rounded-3xl p-6 shadow-2xl border border-[#DDD7E8]">
            <h3 className="text-lg font-serif font-bold text-[#241930] dark:text-white mb-2">
              How Safe-to-Spend is Worked Out
            </h3>
            <p className="text-xs text-[#75668B] dark:text-[#A798BC] mb-4">
              Designed specifically so ADHD brains never have to worry about surprise bills or accidental overdrafts:
            </p>

            <div className="p-4 rounded-2xl bg-[#F5F2F9] dark:bg-[#251A33] border border-[#E0D8EA] space-y-2 text-xs font-mono text-[#241930] dark:text-white">
              <div className="flex justify-between">
                <span>Real Checking Balance:</span>
                <span className="font-bold">{settings.currencySymbol}{paycheckConfig.currentBankBalance.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-rose-500">
                <span>- ADHD Cushion Floor:</span>
                <span>-{settings.currencySymbol}{paycheckConfig.cushionAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-rose-500">
                <span>- Bills Due Before Payday:</span>
                <span>-{settings.currencySymbol}{(paycheckConfig.currentBankBalance - paycheckConfig.cushionAmount - safeToSpendTotal).toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-[#DDD6E8] flex justify-between font-bold text-sm text-[#4A3561] dark:text-purple-300">
                <span>= Safe to Spend Total:</span>
                <span>{settings.currencySymbol}{safeToSpendTotal.toFixed(2)}</span>
              </div>
              <div className="pt-1 flex justify-between text-[11px] text-[#7A6A91]">
                <span>÷ {Math.max(1, daysUntilPaycheck)} days until paycheck:</span>
                <span className="font-bold text-[#4A3561] dark:text-white">
                  = {settings.currencySymbol}{dailyTarget.toFixed(2)}/day
                </span>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowFormulaModal(false)}
                className="px-5 py-2 rounded-xl bg-[#241930] text-white text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

