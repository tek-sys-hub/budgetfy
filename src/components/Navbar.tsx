import React from 'react';
import { 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Moon, 
  Sun, 
  HelpCircle,
  ShieldCheck,
  Calendar,
  Flame
} from 'lucide-react';
import { useBudget } from '../context/BudgetContext';

interface NavbarProps {
  onOpenAffordability: () => void;
  onOpenImpulse: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAffordability, onOpenImpulse }) => {
  const { 
    settings, 
    updateSettings, 
    safeToSpendTotal, 
    safeToSpendPerDay,
    daysUntilPaycheck,
    impulseItems 
  } = useBudget();

  const activeImpulseCount = impulseItems.filter(i => i.status === 'cooling').length;

  const toggleSound = () => {
    updateSettings({ soundEnabled: !settings.soundEnabled });
  };

  const toggleTheme = () => {
    const next = settings.themeMode === 'dark' ? 'vibrant' : settings.themeMode === 'vibrant' ? 'zen' : 'dark';
    updateSettings({ themeMode: next });
  };

  return (
    <header className="sticky top-0 z-30 bg-white/85 dark:bg-[#0F172A]/85 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Logo / App Name */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 flex items-center justify-center shadow-md shadow-purple-500/20 text-white font-black text-xl">
            ✨
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-purple-700 via-pink-600 to-indigo-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                BudgetFlow
              </span>
              <span className="hidden sm:inline-block text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300">
                ADHD Focus
              </span>
            </div>
            <p className="hidden sm:block text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Etsy Inspired • Low-Friction & Dopamine-Friendly
            </p>
          </div>
        </div>

        {/* Top Quick Status Badges */}
        <div className="hidden md:flex items-center gap-3">
          {/* Safe To Spend per day pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200/70 dark:border-purple-800/50">
            <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <div className="text-xs">
              <span className="text-slate-500 dark:text-slate-400">Safe/day: </span>
              <span className="font-bold text-purple-700 dark:text-purple-300">
                {settings.currencySymbol}{Math.max(0, safeToSpendPerDay)}
              </span>
            </div>
          </div>

          {/* Payday Countdown */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-800/50">
            <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
              {daysUntilPaycheck === 0 ? 'Payday Today! 🎉' : `${daysUntilPaycheck}d to Payday`}
            </span>
          </div>

          {/* Interactive Affordability Calculator trigger */}
          <button
            onClick={onOpenAffordability}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 text-xs font-bold transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            title="Can I buy this right now?"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            Can I afford this?
          </button>
        </div>

        {/* Right side controls: Impulse vault, Sound, Theme */}
        <div className="flex items-center gap-2">
          {/* Impulse cooling button */}
          <button
            onClick={onOpenImpulse}
            className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Impulse Purchase Pause Vault"
          >
            <Flame className={`w-5 h-5 ${activeImpulseCount > 0 ? 'text-orange-500 animate-pulse' : ''}`} />
            {activeImpulseCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-orange-500 text-white text-[10px] font-black flex items-center justify-center">
                {activeImpulseCount}
              </span>
            )}
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={settings.soundEnabled ? 'Mute Dopamine Sounds' : 'Enable Dopamine Sounds'}
          >
            {settings.soundEnabled ? (
              <Volume2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            ) : (
              <VolumeX className="w-5 h-5 text-slate-400" />
            )}
          </button>

          {/* Theme switcher */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs"
            title={`Current: ${settings.themeMode} mode (Click to cycle)`}
          >
            {settings.themeMode === 'dark' ? (
              <Moon className="w-5 h-5 text-indigo-400" />
            ) : settings.themeMode === 'zen' ? (
              <Sparkles className="w-5 h-5 text-teal-600" />
            ) : (
              <Sun className="w-5 h-5 text-amber-500" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

