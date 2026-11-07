import React, { useState, useEffect } from 'react';
import { 
  Search, 
  X, 
  Sun, 
  Calendar, 
  FileText, 
  Target, 
  TrendingDown, 
  Mail, 
  HelpCircle, 
  Clock, 
  Download,
  Plus
} from 'lucide-react';
import { NavItem } from './Sidebar';

interface QuickActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (item: NavItem) => void;
  onOpenQuickAdd: () => void;
  onOpenAffordability: () => void;
  onOpenImpulse: () => void;
}

export const QuickActionsModal: React.FC<QuickActionsModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onOpenQuickAdd,
  onOpenAffordability,
  onOpenImpulse,
}) => {
  const [search, setSearch] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Toggle handled outside or if already open
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const actions = [
    {
      label: 'Log a Spend',
      desc: 'Quick 1-tap expense or income logger',
      icon: <Plus className="w-4 h-4 text-purple-600" />,
      action: () => { onClose(); onOpenQuickAdd(); }
    },
    {
      label: 'Can I Afford This?',
      desc: 'Check if you have enough safe-to-spend balance',
      icon: <HelpCircle className="w-4 h-4 text-amber-500" />,
      action: () => { onClose(); onOpenAffordability(); }
    },
    {
      label: 'Impulse Cooling Vault',
      desc: 'Pause purchase 24-48 hours before buying',
      icon: <Clock className="w-4 h-4 text-orange-500" />,
      action: () => { onClose(); onOpenImpulse(); }
    },
    {
      label: 'Go to Today',
      desc: 'Daily safe-to-spend dashboard & three small things',
      icon: <Sun className="w-4 h-4 text-yellow-500" />,
      action: () => { onClose(); onNavigate('today'); }
    },
    {
      label: 'Go to Spending Envelopes',
      desc: 'Digital cash envelopes & sinking funds',
      icon: <Mail className="w-4 h-4 text-emerald-500" />,
      action: () => { onClose(); onNavigate('envelopes'); }
    },
    {
      label: 'Go to Bills & Payday',
      desc: 'Paycheck forecasting and recurring bills',
      icon: <FileText className="w-4 h-4 text-blue-500" />,
      action: () => { onClose(); onNavigate('bills'); }
    },
    {
      label: 'Go to Savings & Challenges',
      desc: 'Visual jars and interactive color-in trackers',
      icon: <Target className="w-4 h-4 text-indigo-500" />,
      action: () => { onClose(); onNavigate('goals'); }
    },
    {
      label: 'Go to Debt Smasher',
      desc: 'Snowball & Avalanche payoff planner',
      icon: <TrendingDown className="w-4 h-4 text-rose-500" />,
      action: () => { onClose(); onNavigate('debt'); }
    },
  ];

  const filtered = actions.filter(a => 
    a.label.toLowerCase().includes(search.toLowerCase()) ||
    a.desc.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-[#1E1628] w-full max-w-lg rounded-3xl p-4 shadow-2xl border border-[#DDD7E8] dark:border-[#2C213B]">
        {/* Search Input */}
        <div className="relative mb-3">
          <Search className="w-4 h-4 text-[#8C7D9E] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            autoFocus
            placeholder="Type a command or search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-10 py-3 rounded-2xl bg-[#FAF9FC] dark:bg-[#181121] border border-[#DDD5E6] dark:border-[#382C48] text-xs text-[#241930] dark:text-white focus:outline-none focus:border-[#4A3561]"
          />
          <button
            onClick={onClose}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#8C7D9E] hover:text-[#241930]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action list */}
        <div className="space-y-1 max-h-80 overflow-y-auto">
          {filtered.map(item => (
            <button
              key={item.label}
              onClick={item.action}
              className="w-full p-2.5 rounded-2xl hover:bg-[#F2EFF6] dark:hover:bg-[#281E35] flex items-center gap-3 text-left transition-colors"
            >
              <div className="w-8 h-8 rounded-xl bg-[#FAF9FC] dark:bg-[#1A1223] border border-[#E5DEEE] dark:border-[#332545] flex items-center justify-center shrink-0">
                {item.icon}
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold text-[#241930] dark:text-white">
                  {item.label}
                </div>
                <div className="text-[11px] text-[#8C7D9E]">
                  {item.desc}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

