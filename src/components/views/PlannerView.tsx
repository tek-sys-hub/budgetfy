import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  DollarSign, 
  AlertCircle, 
  CheckCircle,
  Star,
  Plus
} from 'lucide-react';
import { useBudget } from '../../context/BudgetContext';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const PlannerView: React.FC = () => {
  const { 
    activeMonth, 
    setActiveMonth, 
    bills, 
    transactions, 
    paycheckConfig, 
    noSpendDates, 
    settings 
  } = useBudget();

  const [selectedDay, setSelectedDay] = useState<number | null>(new Date().getDate());

  const currentYear = new Date().getFullYear();
  // Get days in active month
  const daysInMonth = new Date(currentYear, activeMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, activeMonth, 1).getDay(); // 0 = Sun

  const prevMonth = () => {
    setActiveMonth((activeMonth + 11) % 12);
  };

  const nextMonth = () => {
    setActiveMonth((activeMonth + 1) % 12);
  };

  // Find pay day in this month
  const payDateObj = new Date(paycheckConfig.nextPayDate + 'T00:00:00');
  const isPayMonth = payDateObj.getMonth() === activeMonth;
  const payDayOfMonth = isPayMonth ? payDateObj.getDate() : null;

  // Selected day details
  const selectedDayStr = `${currentYear}-${String(activeMonth + 1).padStart(2, '0')}-${String(selectedDay || 1).padStart(2, '0')}`;
  const dayTransactions = transactions.filter(t => t.date === selectedDayStr);
  const dayBills = bills.filter(b => b.dueDay === selectedDay);
  const isSelectedNoSpend = (noSpendDates || []).includes(selectedDayStr);

  const totalMonthlyBills = bills.reduce((acc, b) => acc + b.amount, 0);

  return (
    <div className="space-y-6 pb-24 md:pb-12 max-w-6xl mx-auto">
      {/* Month Navigator Header */}
      <div className="bg-white dark:bg-[#1E1628] rounded-3xl p-6 border border-[#DDD7E8] dark:border-[#2C213B] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">📅</span>
            <h2 className="text-2xl font-serif font-bold text-[#241930] dark:text-white">
              {MONTH_NAMES[activeMonth]} {currentYear} Planner
            </h2>
          </div>
          <p className="text-xs text-[#7F7094] dark:text-[#A798BC] mt-1">
            Visual month-at-a-glance: paydays, bill deadlines, and no-spend stars
          </p>
        </div>

        {/* Month Selector Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-2 rounded-xl bg-[#F5F2F9] dark:bg-[#281D35] hover:bg-[#EBE5F3] text-[#241930] dark:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-4 py-1.5 rounded-xl bg-[#241930] text-white font-mono text-xs font-bold">
            {MONTH_NAMES[activeMonth].toUpperCase()}
          </span>
          <button
            onClick={nextMonth}
            className="p-2 rounded-xl bg-[#F5F2F9] dark:bg-[#281D35] hover:bg-[#EBE5F3] text-[#241930] dark:text-white transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Monthly Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-[#1E1628] rounded-2xl p-4 border border-[#DDD7E8] dark:border-[#2C213B]">
          <span className="text-[10px] font-bold text-[#8C7D9E] uppercase tracking-wider block">
            Expected Paycheck
          </span>
          <span className="text-lg font-serif font-bold text-emerald-600 dark:text-emerald-400">
            {settings.currencySymbol}{paycheckConfig.expectedAmount.toFixed(2)}
          </span>
        </div>

        <div className="bg-white dark:bg-[#1E1628] rounded-2xl p-4 border border-[#DDD7E8] dark:border-[#2C213B]">
          <span className="text-[10px] font-bold text-[#8C7D9E] uppercase tracking-wider block">
            Total Monthly Bills
          </span>
          <span className="text-lg font-serif font-bold text-rose-500">
            {settings.currencySymbol}{totalMonthlyBills.toFixed(2)}
          </span>
        </div>

        <div className="bg-white dark:bg-[#1E1628] rounded-2xl p-4 border border-[#DDD7E8] dark:border-[#2C213B]">
          <span className="text-[10px] font-bold text-[#8C7D9E] uppercase tracking-wider block">
            Projected Safe Buffer
          </span>
          <span className="text-lg font-serif font-bold text-[#4A3561] dark:text-purple-300">
            {settings.currencySymbol}{Math.max(0, paycheckConfig.expectedAmount - totalMonthlyBills).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Calendar Grid + Day Details Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Calendar (8 cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-[#1E1628] rounded-3xl p-5 border border-[#DDD7E8] dark:border-[#2C213B] shadow-xs">
          {/* Day of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-[#8C7D9E] uppercase pb-2 mb-2 border-b border-[#ECE6F3] dark:border-[#2D213D]">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {/* Blank leading days */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square opacity-0" />
            ))}

            {/* Days of month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${currentYear}-${String(activeMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isSelected = selectedDay === day;
              const isToday = 
                day === new Date().getDate() && 
                activeMonth === new Date().getMonth() && 
                currentYear === new Date().getFullYear();

              const dayBillsList = bills.filter(b => b.dueDay === day);
              const isPayDay = payDayOfMonth === day;
              const isNoSpend = (noSpendDates || []).includes(dateStr);
              const hasSpend = transactions.some(t => t.date === dateStr && t.type === 'expense');

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`aspect-square p-1 sm:p-1.5 rounded-2xl border flex flex-col justify-between items-start transition-all relative group text-left ${
                    isSelected
                      ? 'border-[#4A3561] bg-[#F2EEF7] dark:bg-[#2C203B] shadow-xs ring-2 ring-[#4A3561]/20 font-bold'
                      : isToday
                      ? 'border-[#8C7D9E] bg-[#FAF9FC] dark:bg-[#1A1223]'
                      : 'border-[#EDE8F4] dark:border-[#2C213D] hover:border-[#8C7D9E] bg-[#FAF9FC] dark:bg-[#181121]'
                  }`}
                >
                  <div className="w-full flex items-center justify-between">
                    <span className={`text-[11px] font-mono ${isToday ? 'px-1.5 py-0.5 rounded-full bg-[#241930] text-white text-[9px]' : 'text-[#241930] dark:text-white'}`}>
                      {day}
                    </span>

                    {/* No Spend Star */}
                    {isNoSpend && (
                      <span className="text-[10px] text-amber-500 leading-none" title="No-Spend Day">
                        ★
                      </span>
                    )}
                  </div>

                  {/* Day Badges */}
                  <div className="w-full space-y-0.5 mt-auto">
                    {isPayDay && (
                      <div className="px-1 py-0.2 rounded-md bg-emerald-500 text-white text-[8px] font-bold truncate">
                        💰 Payday
                      </div>
                    )}
                    {dayBillsList.map(b => (
                      <div key={b.id} className="px-1 py-0.2 rounded-md bg-rose-500/20 text-rose-700 dark:text-rose-300 text-[8px] font-semibold truncate">
                        {b.name}
                      </div>
                    ))}
                    {hasSpend && !isPayDay && dayBillsList.length === 0 && (
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mx-auto" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Details Card (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-[#1E1628] rounded-3xl p-5 border border-[#DDD7E8] dark:border-[#2C213B] shadow-xs flex flex-col justify-between">
          <div>
            <div className="border-b border-[#ECE6F3] dark:border-[#2D213D] pb-3 mb-3">
              <span className="text-[10px] font-bold text-[#8C7D9E] uppercase tracking-wider block">
                Selected Day
              </span>
              <h3 className="font-serif font-bold text-lg text-[#241930] dark:text-white">
                {MONTH_NAMES[activeMonth]} {selectedDay}, {currentYear}
              </h3>
            </div>

            {/* Payday Notice */}
            {payDayOfMonth === selectedDay && (
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-bold mb-3 flex items-center gap-2">
                <span>💰</span>
                <span>Expected Paycheck Deposit: {settings.currencySymbol}{paycheckConfig.expectedAmount.toFixed(2)}</span>
              </div>
            )}

            {/* Bills due on this day */}
            <div className="mb-4">
              <span className="text-xs font-bold text-[#5F4E75] dark:text-[#A798BC] block mb-2">
                Bills Due Today ({dayBills.length})
              </span>
              {dayBills.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No bills due on this date.</p>
              ) : (
                <div className="space-y-1.5">
                  {dayBills.map(b => (
                    <div key={b.id} className="p-2.5 rounded-xl bg-[#FAF9FC] dark:bg-[#181121] border border-[#ECE6F3] dark:border-[#2E223E] flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-[#241930] dark:text-white block">{b.name}</span>
                        <span className="text-[10px] text-[#8C7D9E]">{b.autoPay ? 'AutoPay' : 'Manual'}</span>
                      </div>
                      <span className="font-mono font-bold text-[#241930] dark:text-white">
                        {settings.currencySymbol}{b.amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Transactions on this day */}
            <div>
              <span className="text-xs font-bold text-[#5F4E75] dark:text-[#A798BC] block mb-2">
                Logged Purchases ({dayTransactions.length})
              </span>
              {dayTransactions.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Nothing spent on this date.</p>
              ) : (
                <div className="space-y-1.5">
                  {dayTransactions.map(t => (
                    <div key={t.id} className="p-2 rounded-xl bg-[#FAF9FC] dark:bg-[#181121] border border-[#ECE6F3] dark:border-[#2E223E] flex items-center justify-between text-xs">
                      <span className="font-medium text-[#241930] dark:text-white">{t.description}</span>
                      <span className="font-mono font-bold text-[#241930] dark:text-white">
                        {settings.currencySymbol}{t.amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-[#ECE6F3] dark:border-[#2D213D] mt-4">
            <span className="text-[11px] text-[#8C7D9E] font-serif italic text-center block">
              Consistency over perfection.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

