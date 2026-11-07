import React, { useState } from 'react';
import { 
  ReceiptText, 
  Search, 
  Download, 
  Trash2, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter,
  AlertCircle
} from 'lucide-react';
import { useBudget } from '../../context/BudgetContext';
import { DopamineTag } from '../../types/budget';

export const TransactionsView: React.FC = () => {
  const { transactions, deleteTransaction, settings } = useBudget();

  const [search, setSearch] = useState('');
  const [filterTag, setFilterTag] = useState<string>('all');
  const [filterType, setFilterType] = useState<'all' | 'expense' | 'income'>('all');

  const filtered = transactions.filter(tx => {
    const matchesSearch = 
      tx.description.toLowerCase().includes(search.toLowerCase()) ||
      tx.category.toLowerCase().includes(search.toLowerCase()) ||
      (tx.notes && tx.notes.toLowerCase().includes(search.toLowerCase()));

    const matchesTag = filterTag === 'all' || tx.dopamineTag === filterTag;
    const matchesType = filterType === 'all' || tx.type === filterType;

    return matchesSearch && matchesTag && matchesType;
  });

  // Calculate ADHD Tax sum
  const adhdTaxTotal = transactions
    .filter(t => t.dopamineTag === 'adhd_tax')
    .reduce((sum, t) => sum + t.amount, 0);

  const impulseTotal = transactions
    .filter(t => t.dopamineTag === 'impulse')
    .reduce((sum, t) => sum + t.amount, 0);

  // Export to CSV
  const exportCSV = () => {
    const headers = ['Date', 'Description', 'Category', 'Type', 'Amount', 'Tag', 'Notes'];
    const rows = transactions.map(t => [
      t.date,
      `"${t.description.replace(/"/g, '""')}"`,
      `"${t.category.replace(/"/g, '""')}"`,
      t.type,
      t.amount,
      t.dopamineTag || '',
      `"${(t.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BudgetFlow_Transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const getDopamineBadge = (tag?: string) => {
    switch (tag) {
      case 'essential':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">🛡️ Need</span>;
      case 'planned':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">🎯 Planned</span>;
      case 'impulse':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">⚡ Impulse</span>;
      case 'adhd_tax':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">🩹 ADHD Tax</span>;
      case 'treat':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">✨ Treat</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header Card */}
      <div className="rounded-3xl bg-white dark:bg-[#1E293B] p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🧾</span>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white">
              Transaction History
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track dopamine patterns, conscious spending, and ADHD buffers
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="py-2.5 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Dopamine Insights Pill Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-300 dark:border-rose-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🩹</span>
            <div>
              <div className="text-xs font-bold text-rose-900 dark:text-rose-300">
                ADHD Tax Buffer Spent
              </div>
              <div className="text-[11px] text-rose-700 dark:text-rose-400">
                Late fees, forgotten subs, replacement items
              </div>
            </div>
          </div>
          <div className="text-lg font-black font-mono text-rose-600 dark:text-rose-400">
            {settings.currencySymbol}{adhdTaxTotal.toFixed(2)}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-300 dark:border-amber-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">⚡</span>
            <div>
              <div className="text-xs font-bold text-amber-900 dark:text-amber-300">
                Impulse Purchases
              </div>
              <div className="text-[11px] text-amber-700 dark:text-amber-400">
                Spontaneous dopamine boosts
              </div>
            </div>
          </div>
          <div className="text-lg font-black font-mono text-amber-600 dark:text-amber-400">
            {settings.currencySymbol}{impulseTotal.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-purple-500 text-xs text-slate-800 dark:text-white"
          />
        </div>

        {/* Tag Filters */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {['all', 'essential', 'planned', 'impulse', 'adhd_tax', 'treat'].map(tag => (
            <button
              key={tag}
              onClick={() => setFilterTag(tag)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                filterTag === tag
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {tag === 'all' && 'All Types'}
              {tag === 'essential' && '🛡️ Essential'}
              {tag === 'planned' && '🎯 Planned'}
              {tag === 'impulse' && '⚡ Impulse'}
              {tag === 'adhd_tax' && '🩹 ADHD Tax'}
              {tag === 'treat' && '✨ Treats'}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No matching transactions found.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map(tx => (
              <div key={tx.id} className="py-3.5 flex items-center justify-between gap-3 group">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center text-base font-bold shrink-0 ${
                      tx.type === 'income'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                    }`}
                  >
                    {tx.type === 'income' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-slate-800 dark:text-white">
                        {tx.description}
                      </span>
                      {getDopamineBadge(tx.dopamineTag)}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {tx.category} • {tx.date}
                      {tx.notes && <span className="italic ml-2">"{tx.notes}"</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right font-mono font-bold text-sm">
                    <span className={tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-white'}>
                      {tx.type === 'income' ? '+' : '-'}{settings.currencySymbol}{tx.amount.toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={() => deleteTransaction(tx.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-rose-500 transition-opacity"
                    title="Delete and refund"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

