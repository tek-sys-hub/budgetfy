import React, { useState, useMemo } from 'react';
import { 
  CalendarClock, 
  Plus, 
  Check, 
  AlertCircle, 
  CheckCircle2, 
  Trash2, 
  ExternalLink,
  CreditCard,
  DollarSign
} from 'lucide-react';
import { useBudget } from '../../context/BudgetContext';
import { RecurringBill, Frequency } from '../../types/budget';

export const BillsView: React.FC = () => {
  const { 
    bills, 
    paycheckConfig, 
    daysUntilPaycheck, 
    upcomingBillsBeforePaycheck, 
    upcomingBillsSum, 
    monthlyBillsTotal,
    toggleBillPaid, 
    addBill, 
    deleteBill,
    updatePaycheckConfig,
    settings 
  } = useBudget();

  const [filterMode, setFilterMode] = useState<'upcoming' | 'all'>('upcoming');
  const [isAddingBill, setIsAddingBill] = useState(false);
  const [isEditingPaycheck, setIsEditingPaycheck] = useState(false);

  // New Bill Form
  const [billName, setBillName] = useState('');
  const [billAmount, setBillAmount] = useState('');
  const [billDueDay, setBillDueDay] = useState('1');
  const [billCategory, setBillCategory] = useState('Housing');
  const [billAutoPay, setBillAutoPay] = useState(true);

  // Paycheck edit form
  const [nextPayDate, setNextPayDate] = useState(paycheckConfig.nextPayDate);
  const [expectedPay, setExpectedPay] = useState(paycheckConfig.expectedAmount.toString());
  const [frequency, setFrequency] = useState<Frequency>(paycheckConfig.frequency);

  const displayedBills = useMemo(() => {
    const list = filterMode === 'upcoming' ? upcomingBillsBeforePaycheck : bills;
    const currentDay = new Date().getDate();
    return [...list].sort((a, b) => {
      // 1. Unpaid bills appear first
      if (a.isPaidThisCycle !== b.isPaidThisCycle) {
        return a.isPaidThisCycle ? 1 : -1;
      }
      // 2. Chronological order by closest upcoming due date
      const diffA = (a.dueDay - currentDay + 31) % 31;
      const diffB = (b.dueDay - currentDay + 31) % 31;
      return diffA - diffB;
    });
  }, [filterMode, upcomingBillsBeforePaycheck, bills]);
  const totalPaidCount = bills.filter(b => b.isPaidThisCycle).length;

  const handleCreateBill = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(billAmount);
    const day = parseInt(billDueDay, 10);
    if (!billName.trim() || isNaN(amount) || amount <= 0 || isNaN(day)) return;

    addBill({
      name: billName.trim(),
      amount,
      dueDay: day,
      category: billCategory,
      frequency: 'monthly',
      autoPay: billAutoPay,
      isPaidThisCycle: false,
    });

    setBillName('');
    setBillAmount('');
    setIsAddingBill(false);
  };

  const handleUpdatePaycheck = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(expectedPay);
    if (isNaN(amt) || amt <= 0) return;

    updatePaycheckConfig({
      nextPayDate,
      expectedAmount: amt,
      frequency,
    });
    setIsEditingPaycheck(false);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Top Paycheck Forecasting Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-indigo-700 via-purple-700 to-slate-900 text-white p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="px-3 py-1 rounded-full bg-white/15 text-xs font-bold uppercase tracking-wider">
              Paycheck Forecasting
            </span>
            <h2 className="text-2xl sm:text-3xl font-black mt-2 font-mono">
              {daysUntilPaycheck === 0 ? 'Payday is TODAY! 💰' : `${daysUntilPaycheck} Days to Payday`}
            </h2>
            <p className="text-purple-200 text-xs mt-1">
              Next expected deposit: {settings.currencySymbol}{paycheckConfig.expectedAmount.toFixed(2)} on {paycheckConfig.nextPayDate}
            </p>
          </div>

          <button
            onClick={() => setIsEditingPaycheck(true)}
            className="py-2.5 px-4 rounded-2xl bg-white text-indigo-900 font-extrabold text-xs shadow-md hover:bg-purple-50 transition-all active:scale-95"
          >
            Adjust Payday Schedule
          </button>
        </div>

        {/* Quick Projection Chips */}
        <div className="mt-5 pt-4 border-t border-white/15 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3">
            <span className="text-[10px] uppercase font-bold text-purple-200 block">Bills Due Before Payday</span>
            <span className="text-base font-extrabold font-mono text-amber-300">
              {settings.currencySymbol}{upcomingBillsSum.toFixed(2)}
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3">
            <span className="text-[10px] uppercase font-bold text-purple-200 block">Total Monthly Bills</span>
            <span className="text-base font-extrabold font-mono text-white">
              {settings.currencySymbol}{monthlyBillsTotal.toFixed(2)}
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 col-span-2 sm:col-span-1">
            <span className="text-[10px] uppercase font-bold text-purple-200 block">Cycle Bills Paid</span>
            <span className="text-base font-extrabold font-mono text-emerald-300">
              {totalPaidCount} / {bills.length} bills
            </span>
          </div>
        </div>
      </div>

      {/* Bill Controls Header */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Filter Toggle */}
        <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-800 p-1 w-full sm:w-auto">
          <button
            onClick={() => setFilterMode('upcoming')}
            className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              filterMode === 'upcoming'
                ? 'bg-white dark:bg-slate-700 text-purple-700 dark:text-purple-300 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            Due Before Payday ({upcomingBillsBeforePaycheck.length})
          </button>
          <button
            onClick={() => setFilterMode('all')}
            className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              filterMode === 'all'
                ? 'bg-white dark:bg-slate-700 text-purple-700 dark:text-purple-300 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            All Monthly Bills ({bills.length})
          </button>
        </div>

        {/* Add Bill Button */}
        <button
          onClick={() => setIsAddingBill(true)}
          className="w-full sm:w-auto py-2.5 px-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          Add Recurring Bill
        </button>
      </div>

      {/* Bills List */}
      <div className="space-y-3">
        {displayedBills.length === 0 ? (
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-8 border border-slate-200 dark:border-slate-800 text-center text-slate-400">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
              No bills found in this view!
            </p>
            <p className="text-xs text-slate-400 mt-1">
              You're all caught up for this paycheck cycle.
            </p>
          </div>
        ) : (
          displayedBills.map(bill => (
            <div
              key={bill.id}
              className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                bill.isPaidThisCycle
                  ? 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/50 dark:border-slate-800/50 opacity-75'
                  : 'bg-white dark:bg-[#1E293B] border-slate-200/80 dark:border-slate-800 shadow-sm'
              }`}
            >
              {/* Paid Checkbox */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleBillPaid(bill.id)}
                  className={`w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all ${
                    bill.isPaidThisCycle
                      ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
                      : 'border-slate-300 dark:border-slate-600 hover:border-purple-500'
                  }`}
                  title={bill.isPaidThisCycle ? 'Mark as Unpaid' : 'Mark as Paid'}
                >
                  {bill.isPaidThisCycle && <Check className="w-4 h-4 stroke-[3]" />}
                </button>

                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${bill.isPaidThisCycle ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                      {bill.name}
                    </span>
                    {bill.autoPay && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300">
                        AutoPay
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Due Day {bill.dueDay} of month • {bill.category}
                  </div>
                </div>
              </div>

              {/* Amount & Actions */}
              <div className="flex items-center gap-3">
                <div className="text-right font-mono">
                  <div className={`text-base font-black ${bill.isPaidThisCycle ? 'text-slate-400 line-through' : 'text-slate-900 dark:text-white'}`}>
                    {settings.currencySymbol}{bill.amount.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {bill.isPaidThisCycle ? 'Paid' : 'Unpaid'}
                  </div>
                </div>

                <button
                  onClick={() => deleteBill(bill.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                  title="Delete bill"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Bill Modal */}
      {isAddingBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#1E293B] w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-black text-slate-800 dark:text-white mb-4">
              Add Recurring Bill
            </h3>

            <form onSubmit={handleCreateBill} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Bill Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Electric, Netflix, Car Payment"
                  value={billName}
                  onChange={e => setBillName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-purple-500 text-sm text-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Amount ({settings.currencySymbol})
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="85.00"
                    value={billAmount}
                    onChange={e => setBillAmount(e.target.value)}
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
                    required
                    value={billDueDay}
                    onChange={e => setBillDueDay(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-purple-500 text-sm text-slate-800 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={billCategory}
                  onChange={e => setBillCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-purple-500 text-sm text-slate-800 dark:text-white"
                >
                  <option value="Housing">Housing / Rent</option>
                  <option value="Utilities">Utilities & Phone</option>
                  <option value="Transport">Car & Transport</option>
                  <option value="Entertainment">Subscriptions & Media</option>
                  <option value="Health">Health & Insurance</option>
                  <option value="Debt">Loan / Credit Card</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="autoPayCheckbox"
                  checked={billAutoPay}
                  onChange={e => setBillAutoPay(e.target.checked)}
                  className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="autoPayCheckbox" className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                  Set to AutoPay (Paid automatically from bank)
                </label>
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddingBill(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl bg-purple-600 text-white font-bold text-xs shadow-md shadow-purple-600/30"
                >
                  Save Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Paycheck Schedule Modal */}
      {isEditingPaycheck && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#1E293B] w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-black text-slate-800 dark:text-white mb-4">
              Configure Payday Schedule
            </h3>

            <form onSubmit={handleUpdatePaycheck} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Next Payday Date
                </label>
                <input
                  type="date"
                  required
                  value={nextPayDate}
                  onChange={e => setNextPayDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-purple-500 text-sm text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Expected Paycheck Amount ({settings.currencySymbol})
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={expectedPay}
                  onChange={e => setExpectedPay(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-purple-500 text-sm text-slate-800 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Pay Frequency
                </label>
                <select
                  value={frequency}
                  onChange={e => setFrequency(e.target.value as Frequency)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-purple-500 text-sm text-slate-800 dark:text-white"
                >
                  <option value="weekly">Every Week</option>
                  <option value="biweekly">Every 2 Weeks (Bi-Weekly)</option>
                  <option value="semimonthly">Twice a Month (e.g. 1st & 15th)</option>
                  <option value="monthly">Once a Month</option>
                </select>
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditingPaycheck(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl bg-purple-600 text-white font-bold text-xs shadow-md shadow-purple-600/30"
                >
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

