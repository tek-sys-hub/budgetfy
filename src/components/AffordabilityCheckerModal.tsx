import React, { useState } from 'react';
import { X, Sparkles, AlertTriangle, CheckCircle, ShieldAlert, Clock, ArrowRight } from 'lucide-react';
import { useBudget } from '../context/BudgetContext';

interface AffordabilityCheckerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogExpense: (amount: number, description: string) => void;
  onSendToImpulseVault: (amount: number, name: string) => void;
}

export const AffordabilityCheckerModal: React.FC<AffordabilityCheckerModalProps> = ({
  isOpen,
  onClose,
  onLogExpense,
  onSendToImpulseVault,
}) => {
  const { settings, safeToSpendTotal, daysUntilPaycheck } = useBudget();
  const [amountStr, setAmountStr] = useState<string>('');
  const [itemName, setItemName] = useState<string>('');

  if (!isOpen) return null;

  const cost = parseFloat(amountStr) || 0;
  const remainingAfterPurchase = safeToSpendTotal - cost;
  const days = Math.max(1, daysUntilPaycheck);
  const remainingPerDayAfter = Math.round((remainingAfterPurchase / days) * 100) / 100;

  // Verdict logic
  let verdict: 'safe' | 'caution' | 'danger' = 'safe';
  let message = '';

  if (remainingAfterPurchase < 0) {
    verdict = 'danger';
    message = `This will eat into your bill cushion or upcoming bills by ${settings.currencySymbol}${Math.abs(remainingAfterPurchase).toFixed(2)}! Better to hold off.`;
  } else if (remainingPerDayAfter < 10) {
    verdict = 'caution';
    message = `You can buy it, but it leaves you with only ${settings.currencySymbol}${remainingPerDayAfter}/day for the next ${days} days.`;
  } else {
    verdict = 'safe';
    message = `Green light! You'll still have ${settings.currencySymbol}${remainingAfterPurchase.toFixed(2)} safe (${settings.currencySymbol}${remainingPerDayAfter}/day) until payday.`;
  }

  const quickAmounts = [15, 30, 60, 100, 200];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#1E293B] w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-lg">
            🤔
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">
              Can I Afford This?
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Instant reality check before buying
            </p>
          </div>
        </div>

        {/* Input Form */}
        <div className="space-y-4 mb-5">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              What do you want to buy? (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Cozy sweater, Dinner with friends, Gadget"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none text-slate-800 dark:text-white text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              How much does it cost?
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">
                {settings.currencySymbol}
              </span>
              <input
                type="number"
                step="any"
                inputMode="decimal"
                autoFocus
                placeholder="0.00"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-purple-500/30 focus:border-purple-500 text-3xl font-extrabold text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Quick presets */}
          <div className="flex flex-wrap gap-2">
            {quickAmounts.map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setAmountStr(amt.toString())}
                className="px-3 py-1 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-slate-700 dark:text-slate-300 transition-colors"
              >
                +{settings.currencySymbol}{amt}
              </button>
            ))}
          </div>
        </div>

        {/* Verdict Box */}
        {cost > 0 && (
          <div
            className={`p-4 rounded-2xl border mb-5 transition-all ${
              verdict === 'safe'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
                : verdict === 'caution'
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-900 dark:text-rose-200'
            }`}
          >
            <div className="flex items-start gap-3">
              {verdict === 'safe' && <CheckCircle className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />}
              {verdict === 'caution' && <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />}
              {verdict === 'danger' && <ShieldAlert className="w-6 h-6 text-rose-500 shrink-0 mt-0.5" />}
              
              <div className="flex-1">
                <div className="font-extrabold text-sm flex items-center justify-between">
                  <span>
                    {verdict === 'safe' && 'SAFE TO BUY! 🛍️'}
                    {verdict === 'caution' && 'TIGHT BUDGET WARNING ⚠️'}
                    {verdict === 'danger' && 'OVER BUDGET! NOT SAFE 🛑'}
                  </span>
                  <span className="text-xs font-mono font-bold">
                    {remainingAfterPurchase >= 0 ? `${settings.currencySymbol}${remainingAfterPurchase.toFixed(2)} left` : `-${settings.currencySymbol}${Math.abs(remainingAfterPurchase).toFixed(2)}`}
                  </span>
                </div>
                <p className="text-xs mt-1 leading-relaxed opacity-90">{message}</p>
                <div className="mt-2 text-[11px] font-semibold opacity-75">
                  Remaining daily allowance: {settings.currencySymbol}{Math.max(0, remainingPerDayAfter)}/day for {days} days
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {cost > 0 && (
          <div className="space-y-2">
            <button
              onClick={() => {
                onSendToImpulseVault(cost, itemName || 'Impulse Wishlist Item');
                onClose();
              }}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <Clock className="w-4 h-4" />
              Put in 24h Cooling Vault (Save Money!)
            </button>

            <button
              onClick={() => {
                onLogExpense(cost, itemName || 'Purchase');
                onClose();
              }}
              className="w-full py-2.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              Log as Expense Now <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {cost === 0 && (
          <p className="text-center text-xs text-slate-400 py-3">
            Enter an amount above to see instant safe spending calculations.
          </p>
        )}
      </div>
    </div>
  );
};

