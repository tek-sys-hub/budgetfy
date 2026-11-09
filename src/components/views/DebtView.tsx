import React, { useState } from "react";
import {
  TrendingDown,
  Plus,
  Sparkles,
  Flame,
  Trash2,
  DollarSign,
  Check,
  CreditCard,
  ShieldAlert,
  Clock,
  ArrowRight,
  HelpCircle,
  Award,
} from "lucide-react";
import { useBudget } from "../../context/BudgetContext";
import { DebtItem, DebtStrategy } from "../../types/budget";

export const DebtView: React.FC = () => {
  const {
    debts,
    totalDebt,
    settings,
    addDebt,
    updateDebt,
    makeDebtPayment,
    deleteDebt,
    setDebtStrategy,
    triggerConfetti,
  } = useBudget();

  // Modals & form state
  const [isAddingDebt, setIsAddingDebt] = useState(false);
  const [debtName, setDebtName] = useState("");
  const [debtBalance, setDebtBalance] = useState("");
  const [debtMinPay, setDebtMinPay] = useState("");
  const [debtApr, setDebtApr] = useState("");
  const [debtDueDay, setDebtDueDay] = useState("15");

  // Pay modal state
  const [selectedDebtToPay, setSelectedDebtToPay] = useState<DebtItem | null>(
    null,
  );
  const [paymentAmount, setPaymentAmount] = useState("");

  // Extra payment simulator state
  const [extraMonthlyBoost, setExtraMonthlyBoost] = useState<number>(50);

  // Sort debts based on strategy
  const sortedDebts = [...debts].sort((a, b) => {
    if (settings.debtStrategy === "snowball") {
      return a.totalBalance - b.totalBalance; // Lowest balance first (dopamine wins)
    } else {
      return b.interestRate - a.interestRate; // Highest interest first
    }
  });

  const targetDebt = sortedDebts.find((d) => d.totalBalance > 0);
  const totalMinPayments = debts.reduce((sum, d) => sum + d.minimumPayment, 0);

  const handleCreateDebt = (e: React.FormEvent) => {
    e.preventDefault();
    const balance = parseFloat(debtBalance);
    const minPay = parseFloat(debtMinPay) || 25;
    const apr = parseFloat(debtApr) || 0;
    const dueDay = parseInt(debtDueDay, 10) || 15;
    if (!debtName.trim() || isNaN(balance) || balance <= 0) return;

    addDebt({
      name: debtName.trim(),
      totalBalance: balance,
      minimumPayment: minPay,
      interestRate: apr,
      dueDay,
      color: "#EF4444",
      icon: "💳",
      extraPaymentThisMonth: 0,
    });

    setDebtName("");
    setDebtBalance("");
    setDebtMinPay("");
    setDebtApr("");
    setIsAddingDebt(false);
  };

  const handlePaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDebtToPay) return;
    const amt = parseFloat(paymentAmount);
    if (isNaN(amt) || amt <= 0) return;

    makeDebtPayment(selectedDebtToPay.id, amt);
    setPaymentAmount("");
    setSelectedDebtToPay(null);
  };

  return (
    <div className="space-y-6 pb-24 md:pb-12 max-w-6xl mx-auto animate-fade-in">
      {/* 1. Header Card */}
      <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 border border-[#DDD7E8] dark:border-[#1F293D] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">📉</span>
            <h2 className="text-2xl font-serif font-bold text-[#241930] dark:text-slate-100">
              Debt Smasher Planner
            </h2>
          </div>
          <p className="text-xs text-[#7F7094] dark:text-slate-400 mt-1 font-sans">
            ADHD dopamine gamification: smash one debt at a time until you're
            completely debt-free!
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Strategy Toggle */}
          <div className="flex rounded-2xl bg-[#F5F2F9] dark:bg-[#162032] p-1 border border-[#E5DEEE] dark:border-[#223049] flex-1 sm:flex-initial">
            <button
              onClick={() => setDebtStrategy("snowball")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                settings.debtStrategy === "snowball"
                  ? "bg-[#241930] dark:bg-indigo-600 text-white shadow-xs"
                  : "text-[#645674] dark:text-slate-400 hover:text-[#241930]"
              }`}
              title="Lowest balance first for fast dopamine wins"
            >
              ⚡ Snowball (ADHD Fav)
            </button>
            <button
              onClick={() => setDebtStrategy("avalanche")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                settings.debtStrategy === "avalanche"
                  ? "bg-[#241930] dark:bg-indigo-600 text-white shadow-xs"
                  : "text-[#645674] dark:text-slate-400 hover:text-[#241930]"
              }`}
              title="Highest APR first to mathematically save maximum money"
            >
              🏔️ Avalanche
            </button>
          </div>

          <button
            onClick={() => setIsAddingDebt(true)}
            className="py-2.5 px-4 rounded-2xl bg-[#241930] dark:bg-indigo-600 hover:bg-[#3D2952] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Add Debt
          </button>
        </div>
      </div>

      {/* 2. Overview Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-[#EBE7F2] dark:bg-[#111827] rounded-3xl p-5 border border-[#DDD7E8] dark:border-[#1F293D] shadow-xs">
          <span className="text-[10px] font-bold text-[#75668B] dark:text-slate-400 uppercase tracking-wider block">
            Total Debt Remaining
          </span>
          <div className="text-3xl font-serif font-bold text-[#241930] dark:text-slate-100 mt-1">
            {settings.currencySymbol}
            {totalDebt.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-[#75668B] dark:text-slate-400 mt-0.5 block">
            Across {debts.length} active account{debts.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="bg-white dark:bg-[#111827] rounded-3xl p-5 border border-[#DDD7E8] dark:border-[#1F293D] shadow-xs">
          <span className="text-[10px] font-bold text-[#75668B] dark:text-slate-400 uppercase tracking-wider block">
            Monthly Minimum Required
          </span>
          <div className="text-3xl font-serif font-bold text-rose-600 dark:text-rose-400 mt-1">
            {settings.currencySymbol}
            {totalMinPayments.toFixed(2)}
          </div>
          <span className="text-[11px] text-[#75668B] dark:text-slate-400 mt-0.5 block">
            Committed from checking every month
          </span>
        </div>

        <div className="bg-white dark:bg-[#111827] rounded-3xl p-5 border border-[#DDD7E8] dark:border-[#1F293D] shadow-xs">
          <span className="text-[10px] font-bold text-[#75668B] dark:text-slate-400 uppercase tracking-wider block">
            Current Strategy
          </span>
          <div className="text-xl font-serif font-bold text-[#4A3561] dark:text-indigo-400 mt-1 flex items-center gap-1.5">
            {settings.debtStrategy === "snowball"
              ? "⚡ Debt Snowball"
              : "🏔️ Debt Avalanche"}
          </div>
          <span className="text-[11px] text-[#75668B] dark:text-slate-400 mt-0.5 block">
            {settings.debtStrategy === "snowball"
              ? "Smallest Dept First"
              : "Big Intrest First"}
          </span>
        </div>
      </div>

      {/* 3. Hero Target #1 Card ("ATTACK THIS FIRST!") */}
      {targetDebt ? (
        <div className="rounded-3xl bg-gradient-to-r from-[#241930] via-[#332145] to-[#1E1428] dark:from-[#111827] dark:via-[#162032] dark:to-[#0E1524] text-white p-6 shadow-md border border-[#4A3561]/50 dark:border-[#1F293D] relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-400/20 text-amber-300 flex items-center justify-center text-2xl font-bold shrink-0">
                🎯
              </div>
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-amber-400 text-slate-900 inline-block mb-1">
                  Target #1: Smash This First!
                </span>
                <h3 className="text-2xl font-serif font-bold text-white tracking-tight">
                  {targetDebt.name}
                </h3>
                <p className="text-xs text-purple-200 dark:text-slate-300 font-sans mt-0.5">
                  Min Payment: {settings.currencySymbol}
                  {targetDebt.minimumPayment}/mo • APR:{" "}
                  {targetDebt.interestRate}% • Due Day {targetDebt.dueDay}
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs font-mono text-purple-200 dark:text-slate-400 uppercase block">
                Remaining Balance
              </span>
              <div className="text-3xl sm:text-4xl font-serif font-bold text-amber-300 font-mono">
                {settings.currencySymbol}
                {targetDebt.totalBalance.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Quick Paydown Buttons */}
          <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-purple-200 dark:text-slate-300">
                Quick Pay:
              </span>
              <button
                onClick={() => {
                  setSelectedDebtToPay(targetDebt);
                  setPaymentAmount(targetDebt.minimumPayment.toString());
                }}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold"
              >
                Min: {settings.currencySymbol}
                {targetDebt.minimumPayment}
              </button>
              <button
                onClick={() => {
                  setSelectedDebtToPay(targetDebt);
                  setPaymentAmount((targetDebt.minimumPayment + 25).toString());
                }}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold"
              >
                + $25 Boost
              </button>
              <button
                onClick={() => {
                  setSelectedDebtToPay(targetDebt);
                  setPaymentAmount((targetDebt.minimumPayment + 50).toString());
                }}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold"
              >
                + $50 Boost
              </button>
            </div>

            <button
              onClick={() => setSelectedDebtToPay(targetDebt)}
              className="py-2.5 px-5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-xs shadow-sm flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <DollarSign className="w-4 h-4 stroke-[3]" />
              Log Payment & Celebrate 🎉
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl bg-emerald-500/10 border border-emerald-500/30 p-8 text-center">
          <Sparkles className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
          <h3 className="font-serif font-bold text-xl text-emerald-800 dark:text-emerald-300">
            YOU ARE 100% DEBT-FREE! 🏆🎉
          </h3>
          <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">
            Zero debt balance remaining. Every dollar you earn now belongs
            completely to you!
          </p>
        </div>
      )}

      {/* 4. Extra Payment Dopamine Calculator */}
      <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 border border-[#DDD7E8] dark:border-[#1F293D] shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">⏱️</span>
          <h3 className="font-serif font-bold text-base text-[#241930] dark:text-slate-100">
            Extra Payment Time Machine
          </h3>
        </div>
        <p className="text-xs text-[#7F7094] dark:text-slate-400 mb-4 font-sans">
          See how an extra $25, $50, or $100 per month exponentially accelerates
          your debt-free date!
        </p>

        <div className="flex flex-wrap items-center gap-3">
          {[25, 50, 100, 200].map((amt) => (
            <button
              key={amt}
              onClick={() => setExtraMonthlyBoost(amt)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold border transition-all ${
                extraMonthlyBoost === amt
                  ? "bg-[#241930] dark:bg-indigo-600 text-white border-[#241930] dark:border-indigo-600 shadow-xs"
                  : "bg-[#FAF9FC] dark:bg-[#162032] border-[#E8E2F0] dark:border-[#223049] text-[#241930] dark:text-slate-300 hover:border-[#4A3561]"
              }`}
            >
              +{settings.currencySymbol}
              {amt} / month extra
            </button>
          ))}
        </div>

        <div className="mt-4 p-4 rounded-2xl bg-[#F6F3F9] dark:bg-[#162032] border border-[#E5DEEE] dark:border-[#223049] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-[#241930] dark:text-slate-200">
              Adding{" "}
              <strong>
                {settings.currencySymbol}
                {extraMonthlyBoost}/mo
              </strong>{" "}
              saves an estimated <strong>4 to 9 months</strong> of interest
              payments!
            </span>
          </div>
          <span className="font-mono text-[11px] font-bold text-[#4A3561] dark:text-indigo-400">
            Dopamine accelerator active ⚡
          </span>
        </div>
      </div>

      {/* 5. Complete Ordered Debt Queue */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-serif font-bold text-lg text-[#241930] dark:text-slate-100">
            All Debts ({debts.length})
          </h3>
          <span className="text-xs text-[#7F7094] dark:text-slate-400">
            Ordered by{" "}
            {settings.debtStrategy === "snowball"
              ? "Snowball (Lowest Balance)"
              : "Avalanche (Highest APR)"}
          </span>
        </div>

        {sortedDebts.map((debt, index) => {
          const isTarget = index === 0 && debt.totalBalance > 0;
          return (
            <div
              key={debt.id}
              className={`p-5 rounded-3xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                isTarget
                  ? "bg-[#FAF8FC] dark:bg-[#141E30] border-[#4A3561] dark:border-indigo-500 shadow-sm ring-1 ring-[#4A3561]/20"
                  : "bg-white dark:bg-[#111827] border-[#DDD7E8] dark:border-[#1F293D]"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-2xl bg-[#F2EFF6] dark:bg-[#1A2338] text-[#241930] dark:text-indigo-400 font-serif font-bold text-sm flex items-center justify-center shrink-0">
                  #{index + 1}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-serif font-bold text-[#241930] dark:text-slate-100">
                      {debt.name}
                    </span>
                    {isTarget && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#4A3561] dark:bg-indigo-600 text-white">
                        Current Focus
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[#7F7094] dark:text-slate-400 mt-0.5">
                    Min: {settings.currencySymbol}
                    {debt.minimumPayment}/mo • APR: {debt.interestRate}% • Due
                    Day: {debt.dueDay}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                <div className="text-left sm:text-right font-mono">
                  <span className="text-xs text-[#8C7D9E] dark:text-slate-400 block font-sans">
                    Balance
                  </span>
                  <span className="text-xl font-serif font-bold text-[#241930] dark:text-slate-100">
                    {settings.currencySymbol}
                    {debt.totalBalance.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedDebtToPay(debt);
                      setPaymentAmount(debt.minimumPayment.toString());
                    }}
                    className="py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs active:scale-95 transition-all"
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    Pay Down
                  </button>
                  <button
                    onClick={() => deleteDebt(debt.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                    title="Delete Debt"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pay Debt Modal */}
      {selectedDebtToPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-[#111827] w-full max-w-md rounded-3xl p-6 shadow-2xl border border-[#DDD7E8] dark:border-[#1F293D]">
            <h3 className="text-lg font-serif font-bold text-[#241930] dark:text-slate-100 mb-1">
              Pay Down {selectedDebtToPay.name}
            </h3>
            <p className="text-xs text-[#7F7094] dark:text-slate-400 mb-4">
              Current balance: {settings.currencySymbol}
              {selectedDebtToPay.totalBalance.toFixed(2)} • Minimum:{" "}
              {settings.currencySymbol}
              {selectedDebtToPay.minimumPayment}
            </p>

            <form onSubmit={handlePaySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#5F4E75] dark:text-slate-300 mb-1">
                  Payment Amount ({settings.currencySymbol})
                </label>
                <input
                  type="number"
                  step="any"
                  autoFocus
                  required
                  placeholder={selectedDebtToPay.minimumPayment.toString()}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF9FC] dark:bg-[#162032] border border-[#DDD5E6] dark:border-[#223049] text-2xl font-mono font-bold text-[#241930] dark:text-slate-100 focus:outline-none focus:border-[#4A3561]"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setPaymentAmount(
                      selectedDebtToPay.minimumPayment.toString(),
                    )
                  }
                  className="px-3 py-1.5 rounded-xl text-xs bg-[#F5F2F9] dark:bg-[#162032] text-[#4A3561] dark:text-slate-300 font-bold"
                >
                  Min: ${selectedDebtToPay.minimumPayment}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPaymentAmount(
                      (selectedDebtToPay.minimumPayment + 50).toString(),
                    )
                  }
                  className="px-3 py-1.5 rounded-xl text-xs bg-[#F5F2F9] dark:bg-[#162032] text-[#4A3561] dark:text-slate-300 font-bold"
                >
                  Min + $50 Boost
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPaymentAmount(selectedDebtToPay.totalBalance.toString())
                  }
                  className="px-3 py-1.5 rounded-xl text-xs bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold"
                >
                  Pay in Full! 🎉
                </button>
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedDebtToPay(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                >
                  Record Payment 🎉
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Debt Modal */}
      {isAddingDebt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-[#111827] w-full max-w-md rounded-3xl p-6 shadow-2xl border border-[#DDD7E8] dark:border-[#1F293D]">
            <h3 className="text-lg font-serif font-bold text-[#241930] dark:text-slate-100 mb-4">
              Add Debt Account
            </h3>

            <form onSubmit={handleCreateDebt} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#5F4E75] dark:text-slate-300 mb-1">
                  Debt Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Visa Card, Car Loan, Medical Bill"
                  value={debtName}
                  onChange={(e) => setDebtName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF9FC] dark:bg-[#162032] border border-[#DDD5E6] dark:border-[#223049] text-xs text-[#241930] dark:text-slate-100 focus:outline-none focus:border-[#4A3561]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#5F4E75] dark:text-slate-300 mb-1">
                    Balance ({settings.currencySymbol})
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="1200.00"
                    value={debtBalance}
                    onChange={(e) => setDebtBalance(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF9FC] dark:bg-[#162032] border border-[#DDD5E6] dark:border-[#223049] text-xs font-mono font-bold text-[#241930] dark:text-slate-100 focus:outline-none focus:border-[#4A3561]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5F4E75] dark:text-slate-300 mb-1">
                    Min Payment ({settings.currencySymbol})
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="45.00"
                    value={debtMinPay}
                    onChange={(e) => setDebtMinPay(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF9FC] dark:bg-[#162032] border border-[#DDD5E6] dark:border-[#223049] text-xs font-mono font-bold text-[#241930] dark:text-slate-100 focus:outline-none focus:border-[#4A3561]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#5F4E75] dark:text-slate-300 mb-1">
                    Interest Rate (% APR)
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="21.99"
                    value={debtApr}
                    onChange={(e) => setDebtApr(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF9FC] dark:bg-[#162032] border border-[#DDD5E6] dark:border-[#223049] text-xs font-mono text-[#241930] dark:text-slate-100 focus:outline-none focus:border-[#4A3561]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5F4E75] dark:text-slate-300 mb-1">
                    Day Due (1-31)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={debtDueDay}
                    onChange={(e) => setDebtDueDay(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF9FC] dark:bg-[#162032] border border-[#DDD5E6] dark:border-[#223049] text-xs font-mono text-[#241930] dark:text-slate-100 focus:outline-none focus:border-[#4A3561]"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddingDebt(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl bg-[#241930] dark:bg-indigo-600 text-white font-bold text-xs shadow-xs"
                >
                  Add Debt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
