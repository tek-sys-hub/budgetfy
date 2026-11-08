import React, { useState, useMemo } from 'react';
import { PieChart as PieIcon, BarChart3, TrendingUp, Calendar, Tag, Sparkles } from 'lucide-react';
import { Transaction, UserSettings } from '../types/budget';

interface ExpenseBreakdownChartProps {
  transactions: Transaction[];
  settings: UserSettings;
  onOpenQuickAdd?: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Dining Out & Coffee': '#F59E0B',
  'Coffee': '#D97706',
  'Groceries & Snacks': '#10B981',
  'Groceries': '#10B981',
  'Fun & Dopamine Treats': '#EC4899',
  'Treats': '#EC4899',
  'Impulse': '#F43F5E',
  'Bills & Utilities': '#6366F1',
  'Bills': '#6366F1',
  'Transport & Gas': '#0EA5E9',
  'Transport': '#0EA5E9',
  'Housing & Rent': '#8B5CF6',
  'Health & Meds': '#14B8A6',
  'ADHD Tax': '#EF4444',
  'General': '#A855F7',
};

const PALETTE = [
  '#8B5CF6', '#EC4899', '#3B82F6', '#10B981', 
  '#F59E0B', '#F43F5E', '#06B6D4', '#84CC16',
  '#A855F7', '#6366F1', '#14B8A6', '#EAB308'
];

export const ExpenseBreakdownChart: React.FC<ExpenseBreakdownChartProps> = ({
  transactions,
  settings,
  onOpenQuickAdd,
}) => {
  const [timeScope, setTimeScope] = useState<'today' | 'cycle'>('today');
  const [graphMode, setGraphMode] = useState<'bars' | 'trend'>('bars');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  // Filter expenses by selected timeScope
  const expenseTransactions = useMemo(() => {
    return (transactions || []).filter(t => {
      if (t.type !== 'expense') return false;
      if (timeScope === 'today') {
        return t.date === todayStr;
      }
      return true; // Cycle / all recent expenses
    });
  }, [transactions, timeScope, todayStr]);

  // Aggregate by Category
  const categoryData = useMemo(() => {
    const map = new Map<string, { amount: number; count: number }>();
    expenseTransactions.forEach(t => {
      const cat = t.category || 'General';
      const prev = map.get(cat) || { amount: 0, count: 0 };
      map.set(cat, {
        amount: prev.amount + t.amount,
        count: prev.count + 1,
      });
    });

    const total = Array.from(map.values()).reduce((sum, v) => sum + v.amount, 0);

    const list = Array.from(map.entries())
      .map(([name, data], idx) => ({
        name,
        amount: data.amount,
        count: data.count,
        percent: total > 0 ? (data.amount / total) * 100 : 0,
        color: CATEGORY_COLORS[name] || PALETTE[idx % PALETTE.length],
      }))
      .sort((a, b) => b.amount - a.amount);

    return { list, total };
  }, [expenseTransactions]);

  // 7-day trend data for graph
  const last7DaysTrend = useMemo(() => {
    const days: { dateStr: string; dayLabel: string; total: number }[] = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const iso = d.toISOString().split('T')[0];
      const dayLabel = i === 0 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' });

      const dayTotal = (transactions || [])
        .filter(t => t.type === 'expense' && t.date === iso)
        .reduce((sum, t) => sum + t.amount, 0);

      days.push({
        dateStr: iso,
        dayLabel,
        total: dayTotal,
      });
    }

    const max = Math.max(1, ...days.map(d => d.total));
    return { days, max };
  }, [transactions]);

  // Donut chart math
  const RADIUS = 54;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

  let currentOffset = 0;
  const segments = categoryData.list.map(cat => {
    const strokeDash = (cat.percent / 100) * CIRCUMFERENCE;
    const strokeDasharray = `${strokeDash} ${CIRCUMFERENCE - strokeDash}`;
    const strokeDashoffset = -currentOffset;
    currentOffset += strokeDash;

    return {
      ...cat,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  const selectedCategoryObj = activeCategory 
    ? categoryData.list.find(c => c.name === activeCategory) 
    : null;

  return (
    <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 border border-[#DDD7E8] dark:border-[#1F293D] shadow-xs space-y-5 animate-fade-in">
      {/* Header with scope toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#ECE6F3] dark:border-[#1F293D]">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-[#4A3561] dark:text-indigo-400 flex items-center justify-center font-bold">
            <PieIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-base text-[#241930] dark:text-slate-100 flex items-center gap-2">
              Where Your Money Is Going
            </h3>
            <span className="text-xs text-[#7F7094] dark:text-slate-400">
              Interactive visual breakdown of actual expenses by category & trend
            </span>
          </div>
        </div>

        {/* Scope and Graph Controls */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Time Scope Toggle */}
          <div className="flex rounded-xl bg-[#FAF9FC] dark:bg-[#162032] border border-[#DDD5E6] dark:border-[#223049] p-0.5 text-xs font-semibold">
            <button
              onClick={() => setTimeScope('today')}
              className={`px-3 py-1 rounded-lg transition-all ${
                timeScope === 'today'
                  ? 'bg-[#241930] dark:bg-indigo-600 text-white shadow-xs'
                  : 'text-[#6C5D80] dark:text-slate-400 hover:text-[#241930]'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setTimeScope('cycle')}
              className={`px-3 py-1 rounded-lg transition-all ${
                timeScope === 'cycle'
                  ? 'bg-[#241930] dark:bg-indigo-600 text-white shadow-xs'
                  : 'text-[#6C5D80] dark:text-slate-400 hover:text-[#241930]'
              }`}
            >
              This Cycle
            </button>
          </div>

          {/* Graph View Toggle */}
          <div className="flex rounded-xl bg-[#FAF9FC] dark:bg-[#162032] border border-[#DDD5E6] dark:border-[#223049] p-0.5 text-xs font-semibold">
            <button
              onClick={() => setGraphMode('bars')}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
                graphMode === 'bars'
                  ? 'bg-[#4A3561] dark:bg-slate-700 text-white shadow-xs'
                  : 'text-[#6C5D80] dark:text-slate-400'
              }`}
              title="Category Breakdown"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Categories</span>
            </button>
            <button
              onClick={() => setGraphMode('trend')}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
                graphMode === 'trend'
                  ? 'bg-[#4A3561] dark:bg-slate-700 text-white shadow-xs'
                  : 'text-[#6C5D80] dark:text-slate-400'
              }`}
              title="7-Day Trend Graph"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">7-Day Trend</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Visuals: Donut Pie Chart + Accompanying Graph */}
      {categoryData.total === 0 ? (
        <div className="py-10 text-center bg-[#FAF9FC] dark:bg-[#162032] rounded-3xl border border-dashed border-[#DDD7E8] dark:border-[#223049] p-6">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-[#4A3561] dark:text-indigo-400 flex items-center justify-center text-2xl mx-auto mb-2">
            📊
          </div>
          <h4 className="font-serif font-bold text-base text-[#241930] dark:text-slate-100">
            No expenses logged {timeScope === 'today' ? 'today' : 'in this cycle'} yet
          </h4>
          <p className="text-xs text-[#7F7094] dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Once you log any spend (coffee, groceries, bills, or treats), this interactive pie chart and trend graph will reveal exactly where your money goes.
          </p>
          {onOpenQuickAdd && (
            <button
              onClick={onOpenQuickAdd}
              className="mt-4 py-2 px-5 rounded-2xl bg-[#241930] dark:bg-indigo-600 hover:bg-[#3D2952] text-white font-bold text-xs shadow-xs transition-transform active:scale-95"
            >
              + Log a Spend Now
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* 1. Left: Interactive Donut Pie Chart (5 cols) */}
          <div className="md:col-span-5 flex flex-col items-center justify-center relative">
            <div className="relative w-52 h-52 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
                {/* Background Track */}
                <circle
                  cx="70"
                  cy="70"
                  r={RADIUS}
                  className="stroke-[#ECE6F3] dark:stroke-[#1F293D]"
                  strokeWidth="18"
                  fill="transparent"
                />

                {/* Donut Slices */}
                {segments.map((seg) => {
                  const isHovered = activeCategory === seg.name;
                  return (
                    <circle
                      key={seg.name}
                      cx="70"
                      cy="70"
                      r={RADIUS}
                      fill="transparent"
                      stroke={seg.color}
                      strokeWidth={isHovered ? 22 : 18}
                      strokeDasharray={seg.strokeDasharray}
                      strokeDashoffset={seg.strokeDashoffset}
                      className="cursor-pointer transition-all duration-300 hover:opacity-90"
                      onMouseEnter={() => setActiveCategory(seg.name)}
                      onMouseLeave={() => setActiveCategory(null)}
                      onClick={() => setActiveCategory(prev => prev === seg.name ? null : seg.name)}
                    />
                  );
                })}
              </svg>

              {/* Center Tooltip Information */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 pointer-events-none">
                {selectedCategoryObj ? (
                  <div className="animate-fade-in">
                    <span 
                      className="text-[10px] font-bold uppercase tracking-wider block truncate max-w-[110px]"
                      style={{ color: selectedCategoryObj.color }}
                    >
                      {selectedCategoryObj.name}
                    </span>
                    <span className="text-xl font-serif font-bold text-[#241930] dark:text-slate-100 font-mono block">
                      {settings.currencySymbol}{selectedCategoryObj.amount.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-[#7F7094] dark:text-slate-400 font-semibold font-mono">
                      {selectedCategoryObj.percent.toFixed(1)}% • {selectedCategoryObj.count} logs
                    </span>
                  </div>
                ) : (
                  <div>
                    <span className="text-[10px] font-bold text-[#8C7D9E] dark:text-slate-400 uppercase tracking-wider block">
                      {timeScope === 'today' ? "Today's Spent" : 'Cycle Total'}
                    </span>
                    <span className="text-2xl font-serif font-bold text-[#241930] dark:text-slate-100 font-mono block">
                      {settings.currencySymbol}{categoryData.total.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-[#7F7094] dark:text-slate-400 font-medium">
                      {expenseTransactions.length} {expenseTransactions.length === 1 ? 'transaction' : 'transactions'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <span className="text-[10px] text-[#8C7D9E] dark:text-slate-400 mt-2 font-medium">
              Tap or hover slices to inspect categories
            </span>
          </div>

          {/* 2. Right: Accompanying Graph View (7 cols) */}
          <div className="md:col-span-7 bg-[#FAF9FC] dark:bg-[#162032] p-5 rounded-2xl border border-[#ECE6F3] dark:border-[#223049] flex flex-col justify-between">
            {graphMode === 'bars' ? (
              /* A: Category Distribution Bar Graph */
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-[#4A3561] dark:text-slate-300">
                  <span>Category Breakdown</span>
                  <span className="font-mono text-[11px] text-[#8C7D9E] dark:text-slate-400">
                    {categoryData.list.length} {categoryData.list.length === 1 ? 'category' : 'categories'}
                  </span>
                </div>

                <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
                  {categoryData.list.map(cat => {
                    const isSelected = activeCategory === cat.name;
                    return (
                      <div
                        key={cat.name}
                        onMouseEnter={() => setActiveCategory(cat.name)}
                        onMouseLeave={() => setActiveCategory(null)}
                        className={`p-2 rounded-xl transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-purple-100/70 dark:bg-purple-950/40 ring-1 ring-purple-400/50' 
                            : 'hover:bg-white/60 dark:hover:bg-[#1E293B]'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs mb-1">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: cat.color }}
                            />
                            <span className="font-semibold text-[#241930] dark:text-slate-200">
                              {cat.name}
                            </span>
                          </div>
                          <div className="font-mono text-xs text-[#241930] dark:text-slate-200 font-bold">
                            {settings.currencySymbol}{cat.amount.toFixed(2)}
                            <span className="text-[10px] text-[#8C7D9E] dark:text-slate-400 ml-1.5 font-normal">
                              ({cat.percent.toFixed(0)}%)
                            </span>
                          </div>
                        </div>

                        {/* Bar */}
                        <div className="w-full h-2 rounded-full bg-[#EAE4F2] dark:bg-[#1F293D] overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.max(4, cat.percent)}%`,
                              backgroundColor: cat.color,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* B: 7-Day Trend Graph */
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-[#4A3561] dark:text-slate-300">
                  <span>Last 7 Days Spending Trend</span>
                  <span className="font-mono text-[11px] text-[#8C7D9E] dark:text-slate-400">
                    Peak: {settings.currencySymbol}{last7DaysTrend.max.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-end justify-between gap-2 h-40 pt-4 px-2">
                  {last7DaysTrend.days.map((d) => {
                    const heightPercent = last7DaysTrend.max > 0 ? (d.total / last7DaysTrend.max) * 100 : 0;
                    const isToday = d.dateStr === todayStr;

                    return (
                      <div key={d.dateStr} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                        <span className="text-[9px] font-mono text-[#8C7D9E] dark:text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          {settings.currencySymbol}{d.total.toFixed(0)}
                        </span>
                        
                        <div className="w-full max-w-[28px] h-full flex items-end">
                          <div
                            className={`w-full rounded-t-lg transition-all duration-500 ${
                              isToday
                                ? 'bg-gradient-to-t from-purple-600 to-pink-500 shadow-sm'
                                : d.total > 0
                                ? 'bg-[#4A3561] dark:bg-indigo-500'
                                : 'bg-[#EAE4F2] dark:bg-[#1F293D]'
                            }`}
                            style={{ height: `${Math.max(6, heightPercent)}%` }}
                            title={`${d.dayLabel} (${d.dateStr}): ${settings.currencySymbol}${d.total.toFixed(2)}`}
                          />
                        </div>

                        <span className={`text-[10px] font-semibold mt-1 ${isToday ? 'text-purple-700 dark:text-pink-400 font-bold' : 'text-[#8C7D9E] dark:text-slate-400'}`}>
                          {d.dayLabel}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

