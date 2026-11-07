import React from 'react';
import { 
  LayoutDashboard, 
  Mailbox, 
  Plus, 
  CalendarClock, 
  Target, 
  ReceiptText, 
  Settings 
} from 'lucide-react';

export type TabType = 'dashboard' | 'envelopes' | 'bills' | 'goals-debt' | 'transactions' | 'settings';

interface BottomNavProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  onOpenQuickAdd: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onTabChange,
  onOpenQuickAdd
}) => {
  return (
    <>
      {/* Mobile Fixed Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 pb-safe">
        <div className="flex items-center justify-around h-16 px-2 relative">
          {/* Dashboard */}
          <button
            onClick={() => onTabChange('dashboard')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
              currentTab === 'dashboard' 
                ? 'text-purple-600 dark:text-purple-400 font-bold' 
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Spend</span>
          </button>

          {/* Envelopes */}
          <button
            onClick={() => onTabChange('envelopes')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
              currentTab === 'envelopes' 
                ? 'text-purple-600 dark:text-purple-400 font-bold' 
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Mailbox className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Envelopes</span>
          </button>

          {/* Floating Center Dopamine Quick Add Button */}
          <div className="flex-1 flex justify-center -mt-6">
            <button
              onClick={onOpenQuickAdd}
              className="w-14 h-14 rounded-full bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-500 text-white shadow-xl shadow-purple-600/30 flex items-center justify-center transform active:scale-95 hover:scale-105 transition-all focus:outline-none ring-4 ring-white dark:ring-[#0F172A]"
              aria-label="Quick Add Expense or Income"
            >
              <Plus className="w-7 h-7 stroke-[2.5]" />
            </button>
          </div>

          {/* Bills */}
          <button
            onClick={() => onTabChange('bills')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
              currentTab === 'bills' 
                ? 'text-purple-600 dark:text-purple-400 font-bold' 
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <CalendarClock className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Payday/Bills</span>
          </button>

          {/* Goals & Debt */}
          <button
            onClick={() => onTabChange('goals-debt')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
              currentTab === 'goals-debt' 
                ? 'text-purple-600 dark:text-purple-400 font-bold' 
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Target className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Goals/Debt</span>
          </button>
        </div>
      </nav>

      {/* Desktop / Tablet Top Tab Bar */}
      <div className="hidden md:block bg-white/60 dark:bg-[#1E293B]/60 border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center space-x-1 py-2">
            <button
              onClick={() => onTabChange('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                currentTab === 'dashboard'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Safe-to-Spend
            </button>

            <button
              onClick={() => onTabChange('envelopes')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                currentTab === 'envelopes'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Mailbox className="w-4 h-4" />
              Envelopes
            </button>

            <button
              onClick={() => onTabChange('bills')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                currentTab === 'bills'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <CalendarClock className="w-4 h-4" />
              Paycheck & Bills
            </button>

            <button
              onClick={() => onTabChange('goals-debt')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                currentTab === 'goals-debt'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Target className="w-4 h-4" />
              Savings & Debt
            </button>

            <button
              onClick={() => onTabChange('transactions')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                currentTab === 'transactions'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <ReceiptText className="w-4 h-4" />
              Transactions
            </button>

            <button
              onClick={() => onTabChange('settings')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                currentTab === 'settings'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Settings className="w-4 h-4" />
              Backup & Sync
            </button>
          </div>

          {/* Desktop Quick Add Button */}
          <button
            onClick={onOpenQuickAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-purple-600/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Quick Log
          </button>
        </div>
      </div>
    </>
  );
};

