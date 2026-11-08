import React from 'react';
import { 
  Sun, 
  Mail, 
  Plus, 
  TrendingDown, 
  Menu 
} from 'lucide-react';
import { NavItem } from './Sidebar';

export type TabType = NavItem;

interface BottomNavProps {
  activeNav: NavItem;
  onSelectNav: (item: NavItem) => void;
  onOpenQuickAdd: () => void;
  onOpenMobileSidebar: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeNav,
  onSelectNav,
  onOpenQuickAdd,
  onOpenMobileSidebar
}) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-[#0E1424]/95 backdrop-blur-xl border-t border-[#E8E2F0] dark:border-[#1E293B] pb-[env(safe-area-inset-bottom,0px)] shadow-lg shadow-black/5">
      <div className="flex items-center justify-around h-16 px-1 relative max-w-lg mx-auto">
        {/* 1. Today */}
        <button
          onClick={() => onSelectNav('today')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-95 ${
            activeNav === 'today' 
              ? 'text-[#4A3561] dark:text-indigo-400 font-bold' 
              : 'text-[#8C7D9E] dark:text-slate-400 hover:text-[#4A3561]'
          }`}
        >
          <div className={`p-1 rounded-xl transition-colors ${activeNav === 'today' ? 'bg-[#EDE7F4] dark:bg-indigo-950/60' : ''}`}>
            <Sun className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-sans mt-0.5 tracking-tight">Today</span>
        </button>

        {/* 2. Envelopes */}
        <button
          onClick={() => onSelectNav('envelopes')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-95 ${
            activeNav === 'envelopes' 
              ? 'text-[#4A3561] dark:text-indigo-400 font-bold' 
              : 'text-[#8C7D9E] dark:text-slate-400 hover:text-[#4A3561]'
          }`}
        >
          <div className={`p-1 rounded-xl transition-colors ${activeNav === 'envelopes' ? 'bg-[#EDE7F4] dark:bg-indigo-950/60' : ''}`}>
            <Mail className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-sans mt-0.5 tracking-tight">Envelopes</span>
        </button>

        {/* 3. Floating Center Quick Add Button */}
        <div className="flex-1 flex justify-center -mt-6">
          <button
            onClick={onOpenQuickAdd}
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#241930] via-[#4A3561] to-[#7C3AED] dark:from-indigo-600 dark:via-purple-600 dark:to-pink-500 text-white shadow-xl shadow-purple-900/30 flex items-center justify-center transform active:scale-90 hover:scale-105 transition-all focus:outline-none ring-4 ring-white dark:ring-[#0E1424]"
            aria-label="Log a Spend"
            title="Quick Log Spend"
          >
            <Plus className="w-7 h-7 stroke-[2.5]" />
          </button>
        </div>

        {/* 4. Debt Smasher */}
        <button
          onClick={() => onSelectNav('debt')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-95 ${
            activeNav === 'debt' 
              ? 'text-[#4A3561] dark:text-indigo-400 font-bold' 
              : 'text-[#8C7D9E] dark:text-slate-400 hover:text-[#4A3561]'
          }`}
        >
          <div className={`p-1 rounded-xl transition-colors ${activeNav === 'debt' ? 'bg-[#EDE7F4] dark:bg-indigo-950/60' : ''}`}>
            <TrendingDown className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-sans mt-0.5 tracking-tight">Debt</span>
        </button>

        {/* 5. More Menu Drawer */}
        <button
          onClick={onOpenMobileSidebar}
          className="flex flex-col items-center justify-center flex-1 py-1 text-[#8C7D9E] dark:text-slate-400 hover:text-[#4A3561] transition-all active:scale-95"
        >
          <div className="p-1 rounded-xl">
            <Menu className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-sans mt-0.5 tracking-tight">More</span>
        </button>
      </div>
    </nav>
  );
};
