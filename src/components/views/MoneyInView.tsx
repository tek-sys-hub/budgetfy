import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  HelpCircle, 
  CheckCircle2, 
  Trash2, 
  Command, 
  Calendar, 
  DollarSign, 
  Sparkles,
  ArrowDownLeft,
  Clock,
  Check,
  Tag,
  Gift,
  RotateCcw,
  Briefcase,
  Award,
  ShoppingBag,
  Receipt,
  X
} from 'lucide-react';
import { useBudget } from '../../context/BudgetContext';
import { ExtraIncomeItem, IncomeStatus } from '../../types/budget';

interface MoneyInViewProps {
  onOpenQuickActions?: () => void;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Refund': <RotateCcw className="w-3.5 h-3.5 text-blue-500" />,
  'Gift': <Gift className="w-3.5 h-3.5 text-pink-500" />,
  'Side Gig': <Briefcase className="w-3.5 h-3.5 text-emerald-500" />,
  'Bonus': <Award className="w-3.5 h-3.5 text-amber-500" />,
  'Sale': <ShoppingBag className="w-3.5 h-3.5 text-purple-500" />,
  'Reimbursement': <Receipt className="w-3.5 h-3.5 text-teal-500" />,
  'Paycheck': <DollarSign className="w-3.5 h-3.5 text-indigo-500" />,
  'Other': <Sparkles className="w-3.5 h-3.5 text-purple-400" />,
};

export const MoneyInView: React.FC<MoneyInViewProps> = ({ onOpenQuickActions }) => {
  const { 
    extraIncomes, 
    transactions,
    addExtraIncome, 
    deleteExtraIncome, 
    markExtraIncomeAsArrived,
    paycheckConfig,
    settings 
  } = useBudget();

  const [activeTab, setActiveTab] = useState<'all' | 'arrived' | 'expected' | 'later'>('all');
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Form State
  const [formName, setFormName] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formStatus, setFormStatus] = useState<IncomeStatus>('arrived');
  const [formDate, setFormDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [formCategory, setFormCategory] = useState('Side Gig');
  const [formNotes, setFormNotes] = useState('');

  // Current Month String (e.g. "November 2026")
  const currentMonthDate = useMemo(() => new Date(), []);
  const currentMonthYearStr = useMemo(() => {
    return currentMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  }, [currentMonthDate]);

  const currentYear = currentMonthDate.getFullYear();
  const currentMonth = currentMonthDate.getMonth(); // 0-indexed

  // Calculate: Arrived This Month
  // 1. Extra incomes with status === 'arrived' in this month
  // 2. Regular transactions with type === 'income' in this month
  const arrivedThisMonthTotal = useMemo(() => {
    const extraArrived = (extraIncomes || []).filter(item => {
      if (item.status !== 'arrived') return false;
      const d = new Date(item.expectedDate);
      return !isNaN(d.getTime()) && d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    }).reduce((sum, item) => sum + (item.amount || 0), 0);

    // Also include any income transactions from this month that aren't already linked to extraIncomes
    const linkedTxIds = new Set(
      (extraIncomes || [])
        .filter(item => item.transactionId)
        .map(item => item.transactionId)
    );

    const txIncomes = (transactions || []).filter(tx => {
      if (tx.type !== 'income' || linkedTxIds.has(tx.id)) return false;
      const d = new Date(tx.date);
      return !isNaN(d.getTime()) && d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    }).reduce((sum, tx) => sum + (tx.amount || 0), 0);

    return extraArrived + txIncomes;
  }, [extraIncomes, transactions, currentYear, currentMonth]);

  // Calculate: Still to come (expected before month ends)
  const stillToComeItems = useMemo(() => {
    return (extraIncomes || []).filter(item => {
      if (item.status === 'expected') return true;
      if (item.status === 'later') return false;
      // If it's marked as expected or falls within this month
      const d = new Date(item.expectedDate);
      return !isNaN(d.getTime()) && d.getFullYear() === currentYear && d.getMonth() === currentMonth && item.status !== 'arrived';
    });
  }, [extraIncomes, currentYear, currentMonth]);

  const stillToComeTotal = useMemo(() => {
    return stillToComeItems.reduce((sum, item) => sum + (item.amount || 0), 0);
  }, [stillToComeItems]);

  // Calculate: Later (after month ends)
  const laterItems = useMemo(() => {
    return (extraIncomes || []).filter(item => {
      if (item.status === 'later') return true;
      const d = new Date(item.expectedDate);
      if (isNaN(d.getTime())) return false;
      const isFutureMonth = (d.getFullYear() > currentYear) || (d.getFullYear() === currentYear && d.getMonth() > currentMonth);
      return isFutureMonth && item.status !== 'arrived';
    });
  }, [extraIncomes, currentYear, currentMonth]);

  const laterTotal = useMemo(() => {
    return laterItems.reduce((sum, item) => sum + (item.amount || 0), 0);
  }, [laterItems]);

  const arrivedCount = useMemo(() => {
    return (extraIncomes || []).filter(i => i.status === 'arrived').length;
  }, [extraIncomes]);

  const filteredItems = useMemo(() => {
    if (activeTab === 'all') return extraIncomes || [];
    if (activeTab === 'arrived') return (extraIncomes || []).filter(i => i.status === 'arrived');
    if (activeTab === 'expected') return stillToComeItems;
    if (activeTab === 'later') return laterItems;
    return extraIncomes || [];
  }, [activeTab, extraIncomes, stillToComeItems, laterItems]);

  const formatAmount = (val: number) => {
    if (settings.security?.hideBalances) {
      return `${settings.currencySymbol}••••`;
    }
    return `${settings.currencySymbol}${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleOpenRecordModal = (prefillStatus: IncomeStatus = 'arrived', prefillCategory: string = 'Side Gig') => {
    setFormName('');
    setFormAmount('');
    setFormStatus(prefillStatus);
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormCategory(prefillCategory);
    setFormNotes('');
    setIsRecordModalOpen(true);
  };

  const handleSubmitRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(formAmount);
    if (!formName.trim() || isNaN(amountNum) || amountNum <= 0) return;

    addExtraIncome({
      name: formName.trim(),
      amount: amountNum,
      expectedDate: formDate,
      status: formStatus,
      category: formCategory,
      notes: formNotes.trim() ? formNotes.trim() : undefined,
    });

    setIsRecordModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* 1. Header Area matching user image exactly */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-1">
        <div>
          <span className="text-[11px] font-bold tracking-widest text-purple-900/60 dark:text-purple-300/70 uppercase">
            MONEY IN
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <h1 className="text-2xl sm:text-3xl font-serif font-normal text-[#241930] dark:text-[#EDE8F5] tracking-tight">
              Everything else that turned up
            </h1>
            <button
              onClick={() => setShowHelpModal(true)}
              className="text-[#6B5E7B] dark:text-[#A89CB8] hover:text-[#241930] dark:hover:text-white transition rounded-full p-0.5 focus:outline-hidden"
              title="What is Money In?"
            >
              <HelpCircle className="w-4 h-4 opacity-70 hover:opacity-100" />
            </button>
          </div>
          <p className="text-xs text-[#6B5E7B] dark:text-[#9487A5] mt-0.5">
            {extraIncomes?.length === 0 ? 'nothing put down yet' : `${extraIncomes.length} extra income source${extraIncomes.length > 1 ? 's' : ''} logged`}
          </p>
        </div>

        {/* Right header buttons */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
          {onOpenQuickActions && (
            <button
              onClick={onOpenQuickActions}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-[#241930] dark:text-[#E2D9F3] bg-white/80 dark:bg-[#1A202C]/80 border border-[#E4DFEC] dark:border-[#2D3748] hover:bg-white dark:hover:bg-[#1A202C] shadow-2xs transition active:scale-95"
            >
              <Command className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>Quick actions</span>
              <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 text-[10px] font-mono rounded-md bg-[#EDE9F2] dark:bg-slate-700 text-[#4A3561] dark:text-purple-300">
                Ctrl K
              </kbd>
            </button>
          )}

          <button
            onClick={() => setShowHelpModal(true)}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-white/80 dark:bg-[#1A202C]/80 border border-[#E4DFEC] dark:border-[#2D3748] text-[#4A3561] dark:text-purple-300 hover:bg-[#EDE9F2] dark:hover:bg-[#2D3748] transition text-xs font-semibold shadow-2xs"
            title="Help & Info"
          >
            ?
          </button>

          <button
            onClick={() => handleOpenRecordModal('arrived')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-white bg-[#4A3561] hover:bg-[#3D2B50] dark:bg-purple-700 dark:hover:bg-purple-600 shadow-sm transition active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Record money in</span>
          </button>
        </div>
      </div>

      {/* 2. Main Soft-Mint Pastel Summary Card (Exact Match to User Image) */}
      <div className="rounded-2xl sm:rounded-3xl bg-[#DDEEE4]/90 dark:bg-[#122219]/90 border border-[#CDE3D5] dark:border-[#1F3D2C] p-5 sm:p-7 shadow-xs relative overflow-hidden transition-all">
        {/* Top Row: ARRIVED THIS MONTH + Date */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400"></span>
            <span className="text-xs font-bold tracking-wider text-[#264A38] dark:text-[#96DEB7] uppercase">
              ARRIVED THIS MONTH
            </span>
            <button 
              onClick={() => setShowHelpModal(true)}
              className="text-[#3F6B55] dark:text-[#78B395] hover:text-[#1B3627] dark:hover:text-white transition"
              title="Income received in the current calendar month"
            >
              <HelpCircle className="w-3.5 h-3.5 opacity-80" />
            </button>
          </div>
          <span className="text-xs sm:text-sm font-medium text-[#4D6D5D] dark:text-[#88B8A0]">
            {currentMonthYearStr}
          </span>
        </div>

        {/* Big Amount */}
        <div className="mt-2.5 mb-1">
          <span className="font-serif text-4xl sm:text-5xl font-light text-[#1B3627] dark:text-[#E2F7ED] tracking-tight">
            {formatAmount(arrivedThisMonthTotal)}
          </span>
        </div>

        {/* Subtitle */}
        <p className="font-serif italic text-xs sm:text-sm text-[#4A6E5C] dark:text-[#8DBAA3]">
          Add a refund, gift or side income whenever it turns up.
        </p>

        {/* Subtle Horizontal Divider */}
        <div className="h-px bg-[#CEE4D7] dark:bg-[#1E3B2C] my-5" />

        {/* Bottom Split Row: Still to come & Later */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* Left: Still to come */}
          <div className="rounded-xl sm:rounded-2xl p-4 sm:p-5 bg-[#EAF5EF]/90 dark:bg-[#0E1C15]/90 border border-[#D5EADB] dark:border-[#183123] transition">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400"></span>
                <span className="text-xs font-medium text-[#264A38] dark:text-[#96DEB7]">
                  Still to come
                </span>
              </div>
              {stillToComeItems.length > 0 && (
                <button
                  onClick={() => setActiveTab('expected')}
                  className="text-[10px] font-medium text-emerald-700 dark:text-emerald-300 hover:underline"
                >
                  View ({stillToComeItems.length})
                </button>
              )}
            </div>

            <div className="mt-1.5 mb-0.5">
              <span className="font-serif text-2xl sm:text-3xl text-[#1B3627] dark:text-[#E2F7ED] font-normal tracking-tight">
                {formatAmount(stillToComeTotal)}
              </span>
            </div>

            <p className="text-[11px] sm:text-xs text-[#527765] dark:text-[#78A990]">
              {stillToComeTotal === 0 
                ? 'no extra money before the month ends' 
                : `${stillToComeItems.length} deposit${stillToComeItems.length > 1 ? 's' : ''} expected before the month ends`}
            </p>
          </div>

          {/* Right: Later (Lilac / Soft Lavender box) */}
          <div className="rounded-xl sm:rounded-2xl p-4 sm:p-5 bg-[#EDE7F6]/90 dark:bg-[#181224]/90 border border-[#DDD4EE] dark:border-[#2D2144] transition">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-purple-600 dark:bg-purple-400"></span>
                <span className="text-xs font-medium text-[#4A3561] dark:text-[#D1B8EC]">
                  Later
                </span>
              </div>
              {laterItems.length > 0 && (
                <button
                  onClick={() => setActiveTab('later')}
                  className="text-[10px] font-medium text-purple-700 dark:text-purple-300 hover:underline"
                >
                  View ({laterItems.length})
                </button>
              )}
            </div>

            <div className="mt-1.5 mb-0.5">
              <span className="font-serif text-2xl sm:text-3xl text-[#321F4A] dark:text-[#F1EAF8] font-normal tracking-tight">
                {formatAmount(laterTotal)}
              </span>
            </div>

            <p className="text-[11px] sm:text-xs text-[#6B5A81] dark:text-[#A798BC]">
              {laterTotal === 0 
                ? 'no extra money after the month ends' 
                : `${laterItems.length} deposit${laterItems.length > 1 ? 's' : ''} expected in future months`}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Filter Tabs & Quick Action Badges */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1 p-1 bg-[#EDE9F2]/70 dark:bg-[#1A202C]/70 rounded-xl border border-[#E4DFEC] dark:border-[#2D3748] text-xs font-medium overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-white dark:bg-purple-800 text-[#241930] dark:text-white shadow-2xs font-semibold'
                : 'text-[#6B5E7B] dark:text-[#9487A5] hover:text-[#241930] dark:hover:text-white'
            }`}
          >
            All Items ({extraIncomes?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('arrived')}
            className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
              activeTab === 'arrived'
                ? 'bg-white dark:bg-purple-800 text-[#241930] dark:text-white shadow-2xs font-semibold'
                : 'text-[#6B5E7B] dark:text-[#9487A5] hover:text-[#241930] dark:hover:text-white'
            }`}
          >
            Arrived ({arrivedCount})
          </button>
          <button
            onClick={() => setActiveTab('expected')}
            className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
              activeTab === 'expected'
                ? 'bg-white dark:bg-purple-800 text-[#241930] dark:text-white shadow-2xs font-semibold'
                : 'text-[#6B5E7B] dark:text-[#9487A5] hover:text-[#241930] dark:hover:text-white'
            }`}
          >
            Still to come ({stillToComeItems.length})
          </button>
          <button
            onClick={() => setActiveTab('later')}
            className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
              activeTab === 'later'
                ? 'bg-white dark:bg-purple-800 text-[#241930] dark:text-white shadow-2xs font-semibold'
                : 'text-[#6B5E7B] dark:text-[#9487A5] hover:text-[#241930] dark:hover:text-white'
            }`}
          >
            Later ({laterItems.length})
          </button>
        </div>

        {/* Quick Add Presets */}
        <div className="flex items-center gap-1.5 text-xs text-[#6B5E7B] dark:text-[#9487A5] flex-wrap">
          <span className="text-[11px] font-semibold text-purple-900/60 dark:text-purple-300/70 uppercase">
            Quick Log:
          </span>
          <button
            onClick={() => handleOpenRecordModal('arrived', 'Refund')}
            className="px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition active:scale-95"
          >
            + Refund
          </button>
          <button
            onClick={() => handleOpenRecordModal('arrived', 'Gift')}
            className="px-2.5 py-1 rounded-full bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-800 hover:bg-pink-100 dark:hover:bg-pink-900/40 transition active:scale-95"
          >
            + Gift
          </button>
          <button
            onClick={() => handleOpenRecordModal('expected', 'Side Gig')}
            className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition active:scale-95"
          >
            + Side Gig
          </button>
        </div>
      </div>

      {/* 4. Extra Income List or Empty State */}
      {filteredItems.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-[#E4DFEC] dark:border-[#2D3748] p-8 sm:p-12 text-center bg-white/40 dark:bg-[#121620]/40">
          <div className="w-12 h-12 rounded-full bg-[#EDE9F2] dark:bg-purple-950/60 text-[#4A3561] dark:text-purple-300 flex items-center justify-center mx-auto mb-3">
            <ArrowDownLeft className="w-6 h-6" />
          </div>
          <h3 className="text-base font-serif font-medium text-[#241930] dark:text-[#EDE8F5]">
            No extra money recorded here yet
          </h3>
          <p className="text-xs text-[#6B5E7B] dark:text-[#9487A5] max-w-md mx-auto mt-1 mb-5">
            Did you get an unexpected tax refund, a birthday gift, cash from selling something, or freelance payout? Record it here without messing up your routine paycheck.
          </p>
          <button
            onClick={() => handleOpenRecordModal('arrived')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#4A3561] hover:bg-[#3D2B50] dark:bg-purple-700 dark:hover:bg-purple-600 shadow-sm transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Record your first extra money</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredItems.map(item => {
            const isArrived = item.status === 'arrived';
            const isExpected = item.status === 'expected';
            const isLater = item.status === 'later';

            return (
              <div
                key={item.id}
                className="group rounded-2xl bg-white dark:bg-[#151B28] border border-[#E4DFEC] dark:border-[#253046] p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs hover:shadow-xs transition"
              >
                {/* Left details */}
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#FAF8FC] dark:bg-[#1D2538] border border-[#EDE9F2] dark:border-[#2A374F] flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                    {CATEGORY_ICONS[item.category] || <Sparkles className="w-4 h-4 text-purple-500" />}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-semibold text-[#241930] dark:text-[#EDE8F5] truncate">
                        {item.name}
                      </h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#EDE9F2] dark:bg-[#20293D] text-[#4A3561] dark:text-purple-300">
                        {item.category}
                      </span>
                      {isArrived && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3 h-3" /> Arrived
                        </span>
                      )}
                      {isExpected && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          <Clock className="w-3 h-3" /> Still to come
                        </span>
                      )}
                      {isLater && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                          <Calendar className="w-3 h-3" /> Later
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[#6B5E7B] dark:text-[#9487A5] mt-1">
                      <span>{item.expectedDate}</span>
                      {item.notes && (
                        <>
                          <span>•</span>
                          <span className="italic truncate max-w-xs">{item.notes}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Amount & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-[#EDE9F2] dark:border-[#20293D]">
                  <div className="text-left sm:text-right">
                    <span className="font-serif text-lg sm:text-xl font-medium text-[#1E382B] dark:text-[#A8E0C4]">
                      +{formatAmount(item.amount)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Mark as Arrived 1-click button if still pending */}
                    {!isArrived && (
                      <button
                        onClick={() => markExtraIncomeAsArrived(item.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition active:scale-95"
                        title="Mark as arrived now (deposits to your checking balance!)"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Mark Arrived</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        if (confirm(`Delete "${item.name}"?`)) {
                          deleteExtraIncome(item.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-[#6B5E7B] hover:text-rose-600 dark:text-[#9487A5] dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition opacity-80 group-hover:opacity-100"
                      title="Delete entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Primary Paycheck Schedule Integration Card */}
      <div className="rounded-2xl bg-white/70 dark:bg-[#151B28]/70 border border-[#E4DFEC] dark:border-[#253046] p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold">
              💵
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#241930] dark:text-[#EDE8F5]">
                Primary Regular Paycheck
              </h4>
              <p className="text-xs text-[#6B5E7B] dark:text-[#9487A5]">
                Next deposit: <span className="font-medium text-[#241930] dark:text-purple-300">{formatAmount(paycheckConfig.expectedAmount)}</span> on <span className="font-medium">{paycheckConfig.nextPayDate}</span> ({paycheckConfig.frequency})
              </p>
            </div>
          </div>

          <div className="text-xs text-[#6B5E7B] dark:text-[#9487A5]">
            Managed in <span className="font-semibold text-purple-700 dark:text-purple-300">Planner & Settings</span>
          </div>
        </div>
      </div>

      {/* 6. Record Money In Modal */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-[#151B28] border border-[#E4DFEC] dark:border-[#253046] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold tracking-wider text-purple-600 dark:text-purple-400 uppercase">
                  RECORD EXTRA MONEY
                </span>
                <h3 className="text-lg font-serif font-semibold text-[#241930] dark:text-[#EDE8F5]">
                  Everything else that turned up
                </h3>
              </div>
              <button
                onClick={() => setIsRecordModalOpen(false)}
                className="p-1 rounded-lg text-[#6B5E7B] hover:text-[#241930] dark:text-[#9487A5] dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitRecord} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#6B5E7B] dark:text-[#9487A5] mb-1">
                  What is it?
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tax refund, Birthday cash, Sold bicycle"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E4DFEC] dark:border-[#2D3748] bg-[#FAF8FC] dark:bg-[#0E131E] text-sm text-[#241930] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#6B5E7B] dark:text-[#9487A5] mb-1">
                  Amount ({settings.currencySymbol})
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-sm text-[#6B5E7B] dark:text-[#9487A5]">
                    {settings.currencySymbol}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="0.00"
                    value={formAmount}
                    onChange={e => setFormAmount(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-[#E4DFEC] dark:border-[#2D3748] bg-[#FAF8FC] dark:bg-[#0E131E] text-base font-semibold text-[#241930] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#6B5E7B] dark:text-[#9487A5] mb-1.5">
                  When is it arriving?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormStatus('arrived')}
                    className={`p-2.5 rounded-xl border text-left transition flex flex-col items-start ${
                      formStatus === 'arrived'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                        : 'border-[#E4DFEC] dark:border-[#2D3748] bg-[#FAF8FC] dark:bg-[#0E131E] text-[#6B5E7B] dark:text-[#9487A5]'
                    }`}
                  >
                    <span className="text-xs font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Arrived
                    </span>
                    <span className="text-[10px] opacity-80 mt-0.5">In account now</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormStatus('expected')}
                    className={`p-2.5 rounded-xl border text-left transition flex flex-col items-start ${
                      formStatus === 'expected'
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 ring-2 ring-amber-500/20'
                        : 'border-[#E4DFEC] dark:border-[#2D3748] bg-[#FAF8FC] dark:bg-[#0E131E] text-[#6B5E7B] dark:text-[#9487A5]'
                    }`}
                  >
                    <span className="text-xs font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span> Still to come
                    </span>
                    <span className="text-[10px] opacity-80 mt-0.5">This month</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormStatus('later')}
                    className={`p-2.5 rounded-xl border text-left transition flex flex-col items-start ${
                      formStatus === 'later'
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 ring-2 ring-purple-500/20'
                        : 'border-[#E4DFEC] dark:border-[#2D3748] bg-[#FAF8FC] dark:bg-[#0E131E] text-[#6B5E7B] dark:text-[#9487A5]'
                    }`}
                  >
                    <span className="text-xs font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-purple-500"></span> Later
                    </span>
                    <span className="text-[10px] opacity-80 mt-0.5">Next month+</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#6B5E7B] dark:text-[#9487A5] mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={e => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E4DFEC] dark:border-[#2D3748] bg-[#FAF8FC] dark:bg-[#0E131E] text-xs text-[#241930] dark:text-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#6B5E7B] dark:text-[#9487A5] mb-1">
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E4DFEC] dark:border-[#2D3748] bg-[#FAF8FC] dark:bg-[#0E131E] text-xs text-[#241930] dark:text-white focus:outline-hidden"
                  >
                    <option value="Refund">🔄 Refund</option>
                    <option value="Gift">🎁 Gift</option>
                    <option value="Side Gig">💼 Side Gig</option>
                    <option value="Bonus">🌟 Bonus</option>
                    <option value="Sale">🏷️ Sale</option>
                    <option value="Reimbursement">💳 Reimbursement</option>
                    <option value="Paycheck">💵 Paycheck</option>
                    <option value="Other">✨ Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#6B5E7B] dark:text-[#9487A5] mb-1">
                  Notes (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. From Aunt Susan, or FB Marketplace buyer"
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E4DFEC] dark:border-[#2D3748] bg-[#FAF8FC] dark:bg-[#0E131E] text-xs text-[#241930] dark:text-white focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRecordModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-[#6B5E7B] hover:text-[#241930] dark:text-[#9487A5] dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-[#4A3561] hover:bg-[#3D2B50] dark:bg-purple-700 dark:hover:bg-purple-600 shadow-sm transition active:scale-95"
                >
                  Save Money In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Help & Explanation Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-[#151B28] border border-[#E4DFEC] dark:border-[#253046] p-6 shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-serif font-bold text-[#241930] dark:text-[#EDE8F5]">
                About "Money In" (Everything else that turned up)
              </h3>
              <button
                onClick={() => setShowHelpModal(false)}
                className="p-1 rounded-lg text-[#6B5E7B] hover:text-[#241930] dark:text-[#9487A5] dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#6B5E7B] dark:text-[#9487A5] leading-relaxed">
              In traditional budgeting, unexpected windfalls (a $50 gift, a $120 tax refund, or $80 from selling an old coat) often get lost or accidentally absorbed into impulse spending.
            </p>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200">
                <span className="font-bold">• Arrived this month:</span> Extra money that has already landed in your hands or bank account. Marking it arrived immediately adds it to your checking balance.
              </div>
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200">
                <span className="font-bold">• Still to come:</span> Expected funds before this month closes (e.g. an unpaid invoice or pending transfer). Click "Mark Arrived" when it hits!
              </div>
              <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-200">
                <span className="font-bold">• Later:</span> Anticipated income for upcoming months.
              </div>
            </div>

            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full mt-3 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#4A3561] hover:bg-[#3D2B50] dark:bg-purple-700 dark:hover:bg-purple-600 transition"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

