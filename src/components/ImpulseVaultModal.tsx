import React, { useState } from 'react';
import { X, Flame, Plus, Clock, Check, Sparkles, Trash2, ShoppingBag } from 'lucide-react';
import { useBudget } from '../context/BudgetContext';

interface ImpulseVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogExpense: (amount: number, description: string) => void;
}

export const ImpulseVaultModal: React.FC<ImpulseVaultModalProps> = ({
  isOpen,
  onClose,
  onLogExpense,
}) => {
  const { impulseItems, addImpulseItem, resolveImpulseItem, deleteImpulseItem, settings } = useBudget();

  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [priceStr, setPriceStr] = useState('');
  const [coolingHours, setCoolingHours] = useState<number>(48);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const coolingItems = impulseItems.filter(i => i.status === 'cooling');
  const savedItems = impulseItems.filter(i => i.status === 'saved');
  const totalMoneySaved = savedItems.reduce((acc, curr) => acc + curr.price, 0);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(priceStr);
    if (!name.trim() || isNaN(price) || price <= 0) return;

    addImpulseItem({
      name: name.trim(),
      price,
      coolingOffHours: coolingHours,
      notes: notes.trim() || undefined,
    });

    setName('');
    setPriceStr('');
    setNotes('');
    setIsAdding(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#1E293B] w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[88vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center text-xl font-bold">
              🧊
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-1.5">
                Impulse Cooling Vault
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pause 24-48h before purchasing to let dopamine settle
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

        {/* Money saved banner */}
        {totalMoneySaved > 0 && (
          <div className="mt-4 p-3 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/15 to-emerald-500/15 border border-emerald-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🏆</span>
              <div>
                <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  Dopamine Resisted Total
                </div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400">
                  You saved by pausing before purchasing!
                </div>
              </div>
            </div>
            <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
              +{settings.currencySymbol}{totalMoneySaved.toFixed(2)}
            </div>
          </div>
        )}

        {/* Content list */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {coolingItems.length === 0 && !isAdding && (
            <div className="text-center py-8 px-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
              <span className="text-3xl block mb-2">🎉</span>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No active impulse temptations right now!
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Next time you feel the urge to impulse-buy something online, park it here first.
              </p>
            </div>
          )}

          {coolingItems.map(item => (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 shadow-sm transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white text-sm">
                    {item.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-extrabold text-orange-600 dark:text-orange-400 font-mono">
                      {settings.currencySymbol}{item.price.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full font-medium">
                      <Clock className="w-3 h-3" />
                      {item.coolingOffHours}h cooldown
                    </span>
                  </div>
                  {item.notes && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 italic">
                      "{item.notes}"
                    </p>
                  )}
                </div>
                <button
                  onClick={() => deleteImpulseItem(item.id)}
                  className="text-slate-400 hover:text-rose-500 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-700/60">
                <button
                  onClick={() => resolveImpulseItem(item.id, 'saved')}
                  className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Dopamine Passed (Saved ${item.price})
                </button>

                <button
                  onClick={() => {
                    resolveImpulseItem(item.id, 'bought');
                    onLogExpense(item.price, item.name);
                    onClose();
                  }}
                  className="py-2 px-3 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  Still Want It (Buy)
                </button>
              </div>
            </div>
          ))}

          {/* Add form */}
          {isAdding && (
            <form onSubmit={handleAdd} className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
                Park New Impulse Item
              </h4>
              <div>
                <input
                  type="text"
                  required
                  placeholder="Item name (e.g. Mechanical keyboard, Cute mug)"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="Price ($)"
                    value={priceStr}
                    onChange={e => setPriceStr(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <select
                    value={coolingHours}
                    onChange={e => setCoolingHours(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
                  >
                    <option value={24}>Pause 24 Hours</option>
                    <option value={48}>Pause 48 Hours</option>
                    <option value={72}>Pause 72 Hours</option>
                  </select>
                </div>
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Why do I think I need this right now?"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
                />
              </div>
              <div className="flex gap-2 justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-purple-600 text-white font-bold text-xs"
                >
                  Cool Off
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer Add Trigger */}
        {!isAdding && (
          <div className="pt-2">
            <button
              onClick={() => setIsAdding(true)}
              className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Impulse Item to Cooldown
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

