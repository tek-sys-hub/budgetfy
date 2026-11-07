import React, { useState } from 'react';
import { Plus, ArrowLeftRight, Edit2, Trash2, Mailbox, Sparkles, Check } from 'lucide-react';
import { useBudget } from '../../context/BudgetContext';
import { Envelope } from '../../types/budget';

export const EnvelopesView: React.FC = () => {
  const { 
    envelopes, 
    addEnvelope, 
    updateEnvelope, 
    deleteEnvelope, 
    transferEnvelopeFunds,
    settings 
  } = useBudget();

  const [isAdding, setIsAdding] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);

  // New Envelope Form State
  const [newEnvName, setNewEnvName] = useState('');
  const [newEnvIcon, setNewEnvIcon] = useState('🛍️');
  const [newEnvAllocated, setNewEnvAllocated] = useState('');
  const [newEnvColor, setNewEnvColor] = useState('#8B5CF6');
  const [newEnvType, setNewEnvType] = useState<Envelope['categoryType']>('wants');

  // Transfer Form State
  const [fromEnvId, setFromEnvId] = useState(envelopes[0]?.id || '');
  const [toEnvId, setToEnvId] = useState(envelopes[1]?.id || '');
  const [transferAmount, setTransferAmount] = useState('');

  const emojiOptions = ['🛒', '☕', '🎮', '🛡️', '🐾', '✨', '⛽', '🍔', '👗', '💊', '📚', '🎁', '🏖️', '🍿'];
  const colorOptions = ['#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#0EA5E9', '#14B8A6'];

  const totalBudgeted = envelopes.reduce((acc, e) => acc + e.allocatedAmount, 0);
  const totalSpent = envelopes.reduce((acc, e) => acc + (e.spentAmount || 0), 0);
  const totalRemaining = Math.max(0, totalBudgeted - totalSpent);

  const handleCreateEnvelope = (e: React.FormEvent) => {
    e.preventDefault();
    const allocated = parseFloat(newEnvAllocated);
    if (!newEnvName.trim() || isNaN(allocated) || allocated < 0) return;

    addEnvelope({
      name: newEnvName.trim(),
      icon: newEnvIcon,
      allocatedAmount: allocated,
      color: newEnvColor,
      categoryType: newEnvType,
    });

    setNewEnvName('');
    setNewEnvAllocated('');
    setIsAdding(false);
  };

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(transferAmount);
    if (isNaN(amt) || amt <= 0 || fromEnvId === toEnvId) return;

    transferEnvelopeFunds(fromEnvId, toEnvId, amt);
    setTransferAmount('');
    setIsTransferring(false);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Top Header Card */}
      <div className="rounded-3xl bg-white dark:bg-[#1E293B] p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">✉️</span>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white">
              Digital Spending Envelopes
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Inspired by physical cash stuffing: give every dollar a home!
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setIsTransferring(true)}
            className="flex-1 sm:flex-initial py-2.5 px-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-purple-100 transition-colors"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            Transfer Funds
          </button>

          <button
            onClick={() => setIsAdding(true)}
            className="flex-1 sm:flex-initial py-2.5 px-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            New Envelope
          </button>
        </div>
      </div>

      {/* Overview Stats Bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 text-center">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Allocated
          </span>
          <span className="text-base sm:text-lg font-black font-mono text-slate-800 dark:text-white">
            {settings.currencySymbol}{totalBudgeted.toFixed(2)}
          </span>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 text-center">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Spent so Far
          </span>
          <span className="text-base sm:text-lg font-black font-mono text-purple-600 dark:text-purple-400">
            {settings.currencySymbol}{totalSpent.toFixed(2)}
          </span>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 text-center">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Left to Spend
          </span>
          <span className="text-base sm:text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">
            {settings.currencySymbol}{totalRemaining.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Envelopes Grid */}
      {envelopes.length === 0 ? (
        <div className="bg-white dark:bg-[#111827] rounded-3xl p-10 border border-[#DDD7E8] dark:border-[#1F293D] text-center shadow-xs">
          <div className="w-16 h-16 rounded-3xl bg-purple-100 dark:bg-purple-950/50 text-[#4A3561] dark:text-purple-300 flex items-center justify-center text-3xl mx-auto mb-4">
            ✉️
          </div>
          <h3 className="font-serif font-bold text-xl text-[#241930] dark:text-slate-100 mb-1">
            No spending envelopes created yet
          </h3>
          <p className="text-xs text-[#7F7094] dark:text-slate-400 max-w-md mx-auto mb-5 leading-relaxed">
            Envelopes give every dollar a dedicated purpose (e.g. Groceries, Coffee Treats, Fun & Dopamine). Tap below to create your first envelope!
          </p>
          <button
            onClick={() => setIsAdding(true)}
            className="py-2.5 px-6 rounded-2xl bg-[#241930] dark:bg-indigo-600 hover:bg-[#3D2952] text-white font-bold text-xs inline-flex items-center gap-2 shadow-xs transition-transform active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Create First Envelope
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {envelopes.map(env => {
          const spent = env.spentAmount || 0;
          const remaining = Math.max(0, env.allocatedAmount - spent);
          const percent = Math.min(100, Math.round((spent / (env.allocatedAmount || 1)) * 100));
          const isOver = spent > env.allocatedAmount;

          return (
            <div
              key={env.id}
              className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden group transition-all hover:shadow-md"
            >
              {/* Category tag */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{env.icon}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {env.categoryType}
                  </span>
                  <button
                    onClick={() => deleteEnvelope(env.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition-opacity"
                    title="Delete Envelope"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Title & Balances */}
              <h3 className="font-bold text-slate-800 dark:text-white text-base">
                {env.name}
              </h3>

              <div className="flex items-baseline justify-between mt-2 font-mono">
                <div>
                  <span className="text-xs text-slate-400 block font-sans">Remaining:</span>
                  <span className={`text-xl font-extrabold ${isOver ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>
                    {settings.currencySymbol}{remaining.toFixed(2)}
                  </span>
                </div>
                <div className="text-right text-xs text-slate-400 font-sans">
                  <span>Spent: </span>
                  <span className="font-mono font-semibold text-slate-600 dark:text-slate-300">
                    {settings.currencySymbol}{spent.toFixed(2)} / {settings.currencySymbol}{env.allocatedAmount}
                  </span>
                </div>
              </div>

              {/* Visual Envelope Progress Bar */}
              <div className="mt-4">
                <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOver 
                        ? 'bg-rose-500' 
                        : percent > 85 
                        ? 'bg-amber-500' 
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, percent)}%`, backgroundColor: !isOver && percent <= 85 ? env.color : undefined }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium mt-1">
                  <span>{percent}% spent</span>
                  <span>{isOver ? `Over by ${settings.currencySymbol}${(spent - env.allocatedAmount).toFixed(2)}` : `${100 - percent}% left`}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Add Envelope Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#1E293B] w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-black text-slate-800 dark:text-white mb-4">
              Create New Envelope
            </h3>

            <form onSubmit={handleCreateEnvelope} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Envelope Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pet Care, Hobbies, Thrift Store"
                  value={newEnvName}
                  onChange={e => setNewEnvName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-purple-500 text-sm text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Budget per Paycheck ({settings.currencySymbol})
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="150.00"
                  value={newEnvAllocated}
                  onChange={e => setNewEnvAllocated(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-purple-500 text-sm text-slate-800 dark:text-white font-mono"
                />
              </div>

              {/* Icon Picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Pick an Icon
                </label>
                <div className="flex flex-wrap gap-2">
                  {emojiOptions.map(em => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setNewEnvIcon(em)}
                      className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all ${
                        newEnvIcon === em ? 'bg-purple-200 dark:bg-purple-900 ring-2 ring-purple-500 scale-110' : 'bg-slate-100 dark:bg-slate-800 hover:scale-105'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Type
                </label>
                <select
                  value={newEnvType}
                  onChange={e => setNewEnvType(e.target.value as Envelope['categoryType'])}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-purple-500 text-sm text-slate-800 dark:text-white"
                >
                  <option value="needs">Needs (Essential living)</option>
                  <option value="wants">Wants (Dopamine & Fun)</option>
                  <option value="buffer">Buffer (ADHD cushion)</option>
                  <option value="savings">Savings / Sinking fund</option>
                </select>
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl bg-purple-600 text-white font-bold text-xs shadow-md shadow-purple-600/30"
                >
                  Save Envelope
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Funds Modal */}
      {isTransferring && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#1E293B] w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-black text-slate-800 dark:text-white mb-2">
              Move Funds Between Envelopes
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Overspent in one area? Shift money from another envelope with zero shame.
            </p>

            <form onSubmit={handleTransfer} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  From Envelope (Source)
                </label>
                <select
                  value={fromEnvId}
                  onChange={e => setFromEnvId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-purple-500 text-sm text-slate-800 dark:text-white"
                >
                  {envelopes.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.icon} {e.name} ({settings.currencySymbol}{Math.max(0, e.allocatedAmount - (e.spentAmount || 0))} left)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  To Envelope (Destination)
                </label>
                <select
                  value={toEnvId}
                  onChange={e => setToEnvId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-purple-500 text-sm text-slate-800 dark:text-white"
                >
                  {envelopes.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.icon} {e.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Transfer Amount ({settings.currencySymbol})
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="20.00"
                  value={transferAmount}
                  onChange={e => setTransferAmount(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-purple-500 text-sm text-slate-800 dark:text-white font-mono"
                />
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setIsTransferring(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl bg-purple-600 text-white font-bold text-xs shadow-md shadow-purple-600/30"
                >
                  Transfer Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

