import React, { useState } from 'react';
import { X, Check, Sparkles, Tag, Smile, AlertCircle } from 'lucide-react';
import { useBudget } from '../context/BudgetContext';
import { DopamineTag, TransactionType } from '../types/budget';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAmount?: number;
  initialDescription?: string;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  initialAmount,
  initialDescription,
}) => {
  const { envelopes, addTransaction, settings } = useBudget();

  const [type, setType] = useState<TransactionType>('expense');
  const [amountStr, setAmountStr] = useState<string>(initialAmount ? initialAmount.toString() : '');
  const [description, setDescription] = useState<string>(initialDescription || '');
  const [envelopeId, setEnvelopeId] = useState<string>(envelopes[0]?.id || '');
  const [dopamineTag, setDopamineTag] = useState<DopamineTag>('planned');
  const [notes, setNotes] = useState<string>('');

  if (!isOpen) return null;

  const quickPresets = [
    { label: 'Coffee', icon: '☕', defaultEnv: 'Dining Out & Coffee', tag: 'treat' as DopamineTag },
    { label: 'Groceries', icon: '🛒', defaultEnv: 'Groceries & Snacks', tag: 'essential' as DopamineTag },
    { label: 'Fast Food', icon: '🍔', defaultEnv: 'Dining Out & Coffee', tag: 'impulse' as DopamineTag },
    { label: 'Amazon', icon: '📦', defaultEnv: 'Fun & Dopamine Treats', tag: 'impulse' as DopamineTag },
    { label: 'ADHD Tax', icon: '🩹', defaultEnv: 'ADHD Tax Buffer', tag: 'adhd_tax' as DopamineTag },
    { label: 'Self Care', icon: '✨', defaultEnv: 'Self Care & Health', tag: 'treat' as DopamineTag },
  ];

  const quickAmounts = [5, 10, 20, 50, 100];

  const handleSelectPreset = (p: typeof quickPresets[0]) => {
    setDescription(p.label);
    setDopamineTag(p.tag);
    const matchedEnv = envelopes.find(e => e.name.toLowerCase().includes(p.label.toLowerCase()) || e.name === p.defaultEnv);
    if (matchedEnv) {
      setEnvelopeId(matchedEnv.id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(amountStr);
    if (!amount || isNaN(amount) || amount <= 0) return;

    const selectedEnv = envelopes.find(e => e.id === envelopeId);

    addTransaction({
      description: description.trim() || (type === 'income' ? 'Income' : 'General Expense'),
      amount: Math.round(amount * 100) / 100,
      type,
      category: selectedEnv ? selectedEnv.name : (type === 'income' ? 'Paycheck' : 'General'),
      envelopeId: type === 'expense' ? envelopeId : undefined,
      date: new Date().toISOString().split('T')[0],
      dopamineTag,
      notes: notes.trim() || undefined,
    });

    // Reset and close
    setAmountStr('');
    setDescription('');
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#1E293B] w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <div>
              <h2 className="text-xl font-black text-slate-800 dark:text-white">
                Quick Log
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Low friction, zero shame! 💜
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Type Toggle: Expense / Income */}
        <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-800 p-1 mb-4">
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              type === 'expense'
                ? 'bg-white dark:bg-slate-700 text-purple-700 dark:text-purple-300 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            💸 Expense
          </button>
          <button
            type="button"
            onClick={() => setType('income')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              type === 'income'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-300 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            💰 Income / Payday
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Big Amount Input */}
          <div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-3xl font-extrabold text-purple-600 dark:text-purple-400">
                {settings.currencySymbol}
              </span>
              <input
                type="number"
                step="any"
                inputMode="decimal"
                autoFocus
                required
                placeholder="0.00"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-purple-500/20 focus:border-purple-600 text-3xl font-extrabold text-slate-900 dark:text-white focus:outline-none tracking-tight"
              />
            </div>
            {/* Quick Amount Add Pills */}
            <div className="flex gap-2 mt-2 overflow-x-auto pb-1 scrollbar-none">
              {quickAmounts.map(amt => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => {
                    const current = parseFloat(amountStr) || 0;
                    setAmountStr((current + amt).toString());
                  }}
                  className="px-3 py-1 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-slate-700 dark:text-slate-300 transition-colors shrink-0"
                >
                  +{settings.currencySymbol}{amt}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setAmountStr('')}
                className="px-2.5 py-1 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors shrink-0"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
              Quick Tap
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {quickPresets.map(p => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => handleSelectPreset(p)}
                  className={`p-2 rounded-2xl border text-center transition-all ${
                    description === p.label
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-bold shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="text-xl mb-0.5">{p.icon}</div>
                  <div className="text-[11px] truncate">{p.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Description
            </label>
            <input
              type="text"
              placeholder="e.g. Afternoon coffee, Target run, Gas"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-purple-500 text-sm text-slate-800 dark:text-white focus:outline-none"
            />
          </div>

          {/* Envelope Selector (for expenses) */}
          {type === 'expense' && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Take from Envelope:
              </label>
              <select
                value={envelopeId}
                onChange={(e) => setEnvelopeId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-purple-500 text-sm text-slate-800 dark:text-white focus:outline-none"
              >
                {envelopes.map(env => {
                  const remaining = Math.max(0, env.allocatedAmount - (env.spentAmount || 0));
                  return (
                    <option key={env.id} value={env.id}>
                      {env.icon} {env.name} ({settings.currencySymbol}{remaining} left)
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          {/* Dopamine Tag (ADHD Psychology Focus) */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              How did this spend feel?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDopamineTag('essential')}
                className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all ${
                  dopamineTag === 'essential'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <span>🛡️</span> Essential
              </button>

              <button
                type="button"
                onClick={() => setDopamineTag('planned')}
                className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all ${
                  dopamineTag === 'planned'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <span>🎯</span> Planned Fun
              </button>

              <button
                type="button"
                onClick={() => setDopamineTag('impulse')}
                className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all ${
                  dopamineTag === 'impulse'
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <span>⚡</span> Impulse
              </button>

              <button
                type="button"
                onClick={() => setDopamineTag('adhd_tax')}
                className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all ${
                  dopamineTag === 'adhd_tax'
                    ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <span>🩹</span> ADHD Tax
              </button>

              <button
                type="button"
                onClick={() => setDopamineTag('treat')}
                className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all ${
                  dopamineTag === 'treat'
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-bold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <span>✨</span> Treat
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={!amountStr || parseFloat(amountStr) <= 0}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-base shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="w-5 h-5 stroke-[3]" />
              Save ({settings.currencySymbol}{amountStr || '0.00'})
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

