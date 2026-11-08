import React from 'react';
import { 
  Sun, 
  Calendar, 
  FileText, 
  ArrowDownLeft, 
  Target, 
  TrendingDown, 
  Mail, 
  Flag, 
  Settings, 
  X,
  ShieldCheck
} from 'lucide-react';

export type NavItem = 
  | 'today' 
  | 'planner' 
  | 'bills' 
  | 'money-in' 
  | 'goals' 
  | 'debt' 
  | 'envelopes' 
  | 'milestones' 
  | 'transactions'
  | 'settings';

interface SidebarProps {
  activeNav: NavItem;
  onSelectNav: (item: NavItem) => void;
  onOpenQuickAdd: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeNav,
  onSelectNav,
  mobileOpen,
  onCloseMobile,
}) => {
  const navItems: { id: NavItem; label: string; icon: React.ReactNode }[] = [
    { id: 'today', label: 'Today', icon: <Sun className="w-4 h-4" /> },
    { id: 'planner', label: 'Planner', icon: <Calendar className="w-4 h-4" /> },
    { id: 'bills', label: 'Bills', icon: <FileText className="w-4 h-4" /> },
    { id: 'money-in', label: 'Money in', icon: <ArrowDownLeft className="w-4 h-4" /> },
    { id: 'goals', label: 'Goals', icon: <Target className="w-4 h-4" /> },
    { id: 'debt', label: 'Debt', icon: <TrendingDown className="w-4 h-4" /> },
    { id: 'envelopes', label: 'Envelopes', icon: <Mail className="w-4 h-4" /> },
    { id: 'milestones', label: 'Milestones', icon: <Flag className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-xs md:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#F2EFF6] dark:bg-[#0E1424] border-r border-[#E2DCE9] dark:border-[#1E293B] p-4 flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Logo & Close */}
          <div className="flex items-center justify-between px-2 pt-2 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#241930] dark:bg-[#6366F1] text-white flex items-center justify-center font-serif font-black text-sm shadow-sm">
                b
              </div>
              <div>
                <span className="font-serif tracking-tight text-lg font-bold text-[#241930] dark:text-slate-100 block leading-none">
                  budgetfy
                </span>
                <span className="text-[10px] text-[#847496] dark:text-slate-400 font-medium tracking-wide block mt-0.5">
                  ADHD Budget & Planner
                </span>
              </div>
            </div>

            <button
              onClick={onCloseMobile}
              className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-1">
            {navItems.map(item => {
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectNav(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-2xl text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? 'bg-white dark:bg-[#1A2338] text-[#241930] dark:text-slate-100 shadow-sm font-bold'
                      : 'text-[#645674] dark:text-slate-400 hover:text-[#241930] dark:hover:text-slate-100 hover:bg-[#EAE4F1] dark:hover:bg-[#141C2D]'
                  }`}
                >
                  <span className={isActive ? 'text-[#241930] dark:text-indigo-400' : 'text-[#847496] dark:text-slate-500'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer info: Offline & Safe */}
        <div className="mt-4 pt-3 border-t border-[#E5DFEC] dark:border-[#1E293B] px-2 text-center">
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#86759B] dark:text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="font-medium">100% Offline & Private</span>
          </div>
          <span className="text-[10px] text-[#A697BB] dark:text-slate-500 block mt-0.5">
            budgetfy v1.0 • Low Friction
          </span>
        </div>
      </aside>
    </>
  );
};

