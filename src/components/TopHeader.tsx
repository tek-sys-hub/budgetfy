import React from 'react';
import { Menu, Command, Sun, Moon, Eye, EyeOff, Lock, Shield } from 'lucide-react';
import { useBudget } from '../context/BudgetContext';

interface TopHeaderProps {
  onOpenMobileSidebar: () => void;
  onOpenQuickAdd: () => void;
  onOpenQuickActions: () => void;
  onLockApp?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onOpenMobileSidebar,
  onOpenQuickAdd,
  onOpenQuickActions,
  onLockApp,
}) => {
  const { helpMode, setHelpMode, settings, updateSettings } = useBudget();

  const isDark = settings.themeMode === 'dark';
  const toggleTheme = () => {
    updateSettings({ themeMode: isDark ? 'light' : 'dark' });
  };

  const isMasked = Boolean(settings.security?.hideBalances);
  const toggleHideBalances = () => {
    updateSettings({
      security: {
        pinLockEnabled: settings.security?.pinLockEnabled ?? false,
        pinHash: settings.security?.pinHash,
        biometricsEnabled: settings.security?.biometricsEnabled ?? false,
        autoLockMinutes: settings.security?.autoLockMinutes ?? 5,
        hideBalances: !isMasked,
      }
    });
  };

  // Determine greeting based on current hour
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  // Format today's date like "SATURDAY, 7 NOVEMBER"
  const now = new Date();
  const dateFormatted = now.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).toUpperCase();

  return (
    <header className="px-4 sm:px-8 pt-6 pb-2">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Date and Greeting */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileSidebar}
            className="md:hidden p-2 rounded-xl bg-white dark:bg-[#20182A] border border-[#E2DCE8] dark:border-[#2F243E] text-[#241930] dark:text-white"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="text-[11px] font-bold tracking-widest text-[#7D6E8E] dark:text-[#A798B8] uppercase font-sans">
              {dateFormatted}
            </div>
            <h1 className="text-2xl sm:text-4xl font-serif font-normal text-[#241930] dark:text-white tracking-tight">
              {greeting}{settings.userName?.trim() ? `, ${settings.userName.trim()}` : ''}
            </h1>
            <p className="text-xs text-[#877899] dark:text-[#9B8CAE] font-medium mt-0.5">
              budgetfy • ADHD Budget Planner
            </p>
          </div>
        </div>

        {/* Top Right Controls (Privacy eye, Lock, Quick actions, Help, Theme) */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Privacy Shield Toggle (Mask/Hide Dollar Balances) */}
          <button
            onClick={toggleHideBalances}
            className={`p-2 rounded-xl border text-xs font-semibold transition-all shadow-xs active:scale-95 flex items-center gap-1.5 ${
              isMasked
                ? 'bg-purple-100 dark:bg-purple-950/70 border-purple-300 dark:border-purple-800 text-purple-700 dark:text-purple-300 font-bold'
                : 'bg-white/80 dark:bg-[#221A2D] border-[#DDD5E6] dark:border-[#382C48] text-[#6E5E82] dark:text-[#C5B8D8] hover:bg-white'
            }`}
            title={isMasked ? 'Privacy Mask ON: Balances Hidden (Tap to show)' : 'Privacy Mask OFF: Tap to hide balances'}
          >
            {isMasked ? <EyeOff className="w-4 h-4 text-purple-600 dark:text-purple-400" /> : <Eye className="w-4 h-4" />}
            <span className="hidden sm:inline text-[11px]">{isMasked ? 'Hidden' : 'Peek'}</span>
          </button>

          {/* Lock App Now Button (if PIN lock is enabled) */}
          {settings.security?.pinLockEnabled && onLockApp && (
            <button
              onClick={onLockApp}
              className="p-2 rounded-xl bg-white/80 dark:bg-[#221A2D] border border-[#DDD5E6] dark:border-[#382C48] text-[#6E5E82] dark:text-[#C5B8D8] hover:bg-white transition-all shadow-xs active:scale-95"
              title="Lock budgetfy now"
            >
              <Lock className="w-4 h-4 text-[#4A3561] dark:text-indigo-400" />
            </button>
          )}

          {/* Quick actions Ctrl K */}
          <button
            onClick={onOpenQuickActions}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/80 dark:bg-[#221A2D] border border-[#DDD5E6] dark:border-[#382C48] text-xs font-semibold text-[#544566] dark:text-[#C5B8D8] hover:bg-white transition-all shadow-xs"
          >
            <Command className="w-3.5 h-3.5" />
            <span>Quick actions</span>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-[#EFEAF4] dark:bg-[#1A1323] rounded-md text-[#78698A]">
              Ctrl K
            </kbd>
          </button>

          {/* Help Toggle ? */}
          <button
            onClick={() => setHelpMode(prev => !prev)}
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              helpMode
                ? 'bg-[#4A3561] text-white shadow-sm ring-2 ring-[#4A3561]/30'
                : 'bg-white/80 dark:bg-[#221A2D] border border-[#DDD5E6] text-[#6E5E82] hover:text-[#241930]'
            }`}
            title="Toggle help tooltips"
          >
            ?
          </button>

          {/* Light / Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all duration-200 select-none shadow-xs active:scale-95 ${
              isDark
                ? 'bg-[#161F30] border-[#2A374F] text-[#93C5FD] hover:bg-[#1E293B]'
                : 'bg-white/90 border-[#DDD5E6] text-[#544566] hover:bg-white'
            }`}
            title={`Switch to ${isDark ? 'Soft Pastel (Light)' : 'Modern Dark Night'}`}
          >
            {isDark ? (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400/20" />
                <span className="text-slate-200">Dark night</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
                <span className="text-[#4B3B60]">Soft pastel</span>
              </>
            )}

            {/* Mini toggle pill */}
            <div
              className={`w-7 h-3.5 flex items-center rounded-full p-0.5 transition-colors duration-200 ml-1 ${
                isDark ? 'bg-indigo-600 justify-end' : 'bg-[#DDD5E6] justify-start'
              }`}
            >
              <div className="bg-white w-2.5 h-2.5 rounded-full shadow-xs" />
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
