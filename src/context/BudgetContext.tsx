import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { 
  AppData, 
  PaycheckConfig, 
  Envelope, 
  RecurringBill, 
  SavingsGoal, 
  DebtItem, 
  Transaction, 
  ImpulseItem, 
  UserSettings, 
  DebtStrategy,
  ThemeMode,
  SavingsChallenge 
} from '../types/budget';
import { StorageService } from '../services/storage';
import { IndexedDBService } from '../services/db';
import { sound } from '../services/sound';

interface BudgetContextType {
  data: AppData;
  settings: UserSettings;
  paycheckConfig: PaycheckConfig;
  envelopes: Envelope[];
  bills: RecurringBill[];
  goals: SavingsGoal[];
  debts: DebtItem[];
  transactions: Transaction[];
  impulseItems: ImpulseItem[];
  challenges: SavingsChallenge[];
  noSpendDates: string[];
  brainDumpItems: { id: string; text: string; done: boolean; createdAt: string }[];
  smallThings: { id: string; text: string; timeEstimate: string; done: boolean }[];
  activeMonth: number;
  helpMode: boolean;
  focusMode: boolean;

  // Computed metrics
  daysUntilPaycheck: number;
  upcomingBillsBeforePaycheck: RecurringBill[];
  upcomingBillsSum: number;
  safeToSpendTotal: number;
  safeToSpendPerDay: number;
  totalDebt: number;
  totalSaved: number;
  monthlyBillsTotal: number;

  // Actions
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  addEnvelope: (envelope: Omit<Envelope, 'id' | 'spentAmount'>) => void;
  updateEnvelope: (id: string, updates: Partial<Envelope>) => void;
  deleteEnvelope: (id: string) => void;
  transferEnvelopeFunds: (fromEnvelopeId: string, toEnvelopeId: string, amount: number) => void;

  addBill: (bill: Omit<RecurringBill, 'id'>) => void;
  updateBill: (id: string, updates: Partial<RecurringBill>) => void;
  deleteBill: (id: string) => void;
  toggleBillPaid: (id: string) => void;

  addGoal: (goal: Omit<SavingsGoal, 'id' | 'currentAmount'>) => void;
  contributeToGoal: (id: string, amount: number) => void;
  deleteGoal: (id: string) => void;

  addDebt: (debt: Omit<DebtItem, 'id'>) => void;
  updateDebt: (id: string, updates: Partial<DebtItem>) => void;
  makeDebtPayment: (id: string, amount: number) => void;
  deleteDebt: (id: string) => void;
  setDebtStrategy: (strategy: DebtStrategy) => void;

  addImpulseItem: (item: Omit<ImpulseItem, 'id' | 'status' | 'addedDate'>) => void;
  resolveImpulseItem: (id: string, decision: 'bought' | 'saved') => void;
  deleteImpulseItem: (id: string) => void;

  toggleChallengeStep: (challengeId: string) => void;
  addChallenge: (challenge: Omit<SavingsChallenge, 'id' | 'completedSteps'>) => void;
  toggleNoSpendToday: () => void;

  addBrainDumpItem: (text: string) => void;
  toggleBrainDumpItem: (id: string) => void;
  deleteBrainDumpItem: (id: string) => void;
  toggleSmallThing: (id: string) => void;
  setActiveMonth: (monthIndex: number) => void;
  setHelpMode: (on: boolean | ((prev: boolean) => boolean)) => void;
  setFocusMode: (on: boolean | ((prev: boolean) => boolean)) => void;

  updatePaycheckConfig: (config: Partial<PaycheckConfig>) => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
  setThemeMode: (mode: ThemeMode) => void;

  importData: (newData: AppData) => void;
  resetAllData: () => void;
  triggerConfetti: () => void;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export const BudgetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<AppData>(() => StorageService.loadData());
  const [helpMode, setHelpMode] = useState<boolean>(true);
  const [focusMode, setFocusMode] = useState<boolean>(false);

  // Save changes to storage & IndexedDB whenever data state changes
  useEffect(() => {
    StorageService.saveData(data);
    IndexedDBService.saveCompleteData(data);
  }, [data]);

  // Load from IndexedDB on initial mount if available
  useEffect(() => {
    IndexedDBService.loadCompleteData().then(dbData => {
      if (dbData) {
        setData(dbData);
      }
    });
  }, []);

  // Keep sound enabled state in sync
  useEffect(() => {
    sound.setEnabled(data.settings.soundEnabled);
  }, [data.settings.soundEnabled]);

  // Handle HTML dark mode class
  useEffect(() => {
    const root = document.documentElement;
    if (data.settings.themeMode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [data.settings.themeMode]);

  const triggerConfetti = () => {
    sound.playCelebration();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#8B5CF6', '#10B981', '#F59E0B', '#EC4899', '#0EA5E9']
    });
  };

  // ADHD Days Until Paycheck calculation
  const daysUntilPaycheck = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const payDate = new Date(data.paycheckConfig.nextPayDate + 'T00:00:00');
    const diffTime = payDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }, [data.paycheckConfig.nextPayDate]);

  // Bills that are unpaid and due before next paycheck
  const { upcomingBillsBeforePaycheck, upcomingBillsSum } = useMemo(() => {
    const today = new Date();
    const currentDay = today.getDate();
    const payDate = new Date(data.paycheckConfig.nextPayDate + 'T00:00:00');
    const payDay = payDate.getDate();

    // Determine if bill dueDay falls within the window [currentDay, payDay] or crossing month boundary
    const upcoming = data.bills.filter(bill => {
      if (bill.isPaidThisCycle) return false;

      if (daysUntilPaycheck <= 0) return true;

      // Simple due date check in current billing span
      if (payDate.getMonth() === today.getMonth()) {
        return bill.dueDay >= currentDay && bill.dueDay <= payDay;
      } else {
        // Spans across month boundary (e.g. today is 28th, pay date is 5th)
        return bill.dueDay >= currentDay || bill.dueDay <= payDay;
      }
    });

    const sum = upcoming.reduce((acc, b) => acc + b.amount, 0);
    return { upcomingBillsBeforePaycheck: upcoming, upcomingBillsSum: sum };
  }, [data.bills, data.paycheckConfig.nextPayDate, daysUntilPaycheck]);

  // Calculate Safe-To-Spend
  // Formula: Bank Balance - Cushion Buffer - Upcoming Unpaid Bills
  const safeToSpendTotal = useMemo(() => {
    const balance = data.paycheckConfig.currentBankBalance;
    const cushion = data.paycheckConfig.cushionAmount;
    const safe = balance - cushion - upcomingBillsSum;
    return Math.round(safe * 100) / 100;
  }, [data.paycheckConfig.currentBankBalance, data.paycheckConfig.cushionAmount, upcomingBillsSum]);

  const safeToSpendPerDay = useMemo(() => {
    const days = Math.max(1, daysUntilPaycheck);
    return Math.round((safeToSpendTotal / days) * 100) / 100;
  }, [safeToSpendTotal, daysUntilPaycheck]);

  const totalDebt = useMemo(() => {
    return data.debts.reduce((sum, d) => sum + d.totalBalance, 0);
  }, [data.debts]);

  const totalSaved = useMemo(() => {
    return data.goals.reduce((sum, g) => sum + g.currentAmount, 0);
  }, [data.goals]);

  const monthlyBillsTotal = useMemo(() => {
    return data.bills.reduce((sum, b) => sum + b.amount, 0);
  }, [data.bills]);

  // Transaction Actions
  const addTransaction = (txData: Omit<Transaction, 'id'>) => {
    sound.playSuccess();
    const newTx: Transaction = {
      ...txData,
      id: 'tx-' + Date.now(),
    };

    setData(prev => {
      // Adjust bank balance
      let newBalance = prev.paycheckConfig.currentBankBalance;
      if (newTx.type === 'expense') {
        newBalance -= newTx.amount;
      } else {
        newBalance += newTx.amount;
      }

      // Adjust envelope spent amount if assigned
      let updatedEnvelopes = prev.envelopes;
      if (newTx.envelopeId && newTx.type === 'expense') {
        updatedEnvelopes = prev.envelopes.map(env => 
          env.id === newTx.envelopeId 
            ? { ...env, spentAmount: (env.spentAmount || 0) + newTx.amount }
            : env
        );
      }

      return {
        ...prev,
        transactions: [newTx, ...prev.transactions],
        paycheckConfig: {
          ...prev.paycheckConfig,
          currentBankBalance: Math.round(newBalance * 100) / 100
        },
        envelopes: updatedEnvelopes
      };
    });
  };

  const deleteTransaction = (id: string) => {
    sound.playTap();
    setData(prev => {
      const tx = prev.transactions.find(t => t.id === id);
      if (!tx) return prev;

      // Revert bank balance
      let revertedBalance = prev.paycheckConfig.currentBankBalance;
      if (tx.type === 'expense') {
        revertedBalance += tx.amount;
      } else {
        revertedBalance -= tx.amount;
      }

      // Revert envelope if applicable
      let updatedEnvelopes = prev.envelopes;
      if (tx.envelopeId && tx.type === 'expense') {
        updatedEnvelopes = prev.envelopes.map(env => 
          env.id === tx.envelopeId 
            ? { ...env, spentAmount: Math.max(0, (env.spentAmount || 0) - tx.amount) }
            : env
        );
      }

      return {
        ...prev,
        transactions: prev.transactions.filter(t => t.id !== id),
        paycheckConfig: {
          ...prev.paycheckConfig,
          currentBankBalance: Math.round(revertedBalance * 100) / 100
        },
        envelopes: updatedEnvelopes
      };
    });
  };

  // Envelope Actions
  const addEnvelope = (envelope: Omit<Envelope, 'id' | 'spentAmount'>) => {
    sound.playSuccess();
    const newEnv: Envelope = {
      ...envelope,
      id: 'env-' + Date.now(),
      spentAmount: 0
    };
    setData(prev => ({
      ...prev,
      envelopes: [...prev.envelopes, newEnv]
    }));
  };

  const updateEnvelope = (id: string, updates: Partial<Envelope>) => {
    sound.playTap();
    setData(prev => ({
      ...prev,
      envelopes: prev.envelopes.map(e => e.id === id ? { ...e, ...updates } : e)
    }));
  };

  const deleteEnvelope = (id: string) => {
    sound.playTap();
    setData(prev => ({
      ...prev,
      envelopes: prev.envelopes.filter(e => e.id !== id)
    }));
  };

  const transferEnvelopeFunds = (fromId: string, toId: string, amount: number) => {
    if (amount <= 0) return;
    sound.playSuccess();
    setData(prev => {
      return {
        ...prev,
        envelopes: prev.envelopes.map(env => {
          if (env.id === fromId) {
            return { ...env, allocatedAmount: Math.max(0, env.allocatedAmount - amount) };
          }
          if (env.id === toId) {
            return { ...env, allocatedAmount: env.allocatedAmount + amount };
          }
          return env;
        })
      };
    });
  };

  // Bill Actions
  const addBill = (bill: Omit<RecurringBill, 'id'>) => {
    sound.playSuccess();
    const newBill: RecurringBill = {
      ...bill,
      id: 'bill-' + Date.now()
    };
    setData(prev => ({
      ...prev,
      bills: [...prev.bills, newBill]
    }));
  };

  const updateBill = (id: string, updates: Partial<RecurringBill>) => {
    sound.playTap();
    setData(prev => ({
      ...prev,
      bills: prev.bills.map(b => b.id === id ? { ...b, ...updates } : b)
    }));
  };

  const deleteBill = (id: string) => {
    sound.playTap();
    setData(prev => ({
      ...prev,
      bills: prev.bills.filter(b => b.id !== id)
    }));
  };

  const toggleBillPaid = (id: string) => {
    setData(prev => {
      const bill = prev.bills.find(b => b.id === id);
      if (!bill) return prev;

      const nextStatus = !bill.isPaidThisCycle;
      if (nextStatus) {
        sound.playSuccess();
      } else {
        sound.playTap();
      }

      return {
        ...prev,
        bills: prev.bills.map(b => b.id === id ? { ...b, isPaidThisCycle: nextStatus } : b)
      };
    });
  };

  // Goal Actions
  const addGoal = (goal: Omit<SavingsGoal, 'id' | 'currentAmount'>) => {
    sound.playSuccess();
    const newGoal: SavingsGoal = {
      ...goal,
      id: 'goal-' + Date.now(),
      currentAmount: 0,
      isCompleted: false
    };
    setData(prev => ({
      ...prev,
      goals: [...prev.goals, newGoal]
    }));
  };

  const contributeToGoal = (id: string, amount: number) => {
    if (amount <= 0) return;
    setData(prev => {
      const goal = prev.goals.find(g => g.id === id);
      if (!goal) return prev;

      const nextAmount = goal.currentAmount + amount;
      const isComplete = nextAmount >= goal.targetAmount;

      if (isComplete && !goal.isCompleted) {
        triggerConfetti();
      } else {
        sound.playSuccess();
      }

      // Also deduct from bank balance as an expense or goal allocation
      return {
        ...prev,
        paycheckConfig: {
          ...prev.paycheckConfig,
          currentBankBalance: Math.max(0, prev.paycheckConfig.currentBankBalance - amount)
        },
        goals: prev.goals.map(g => g.id === id ? { 
          ...g, 
          currentAmount: nextAmount,
          isCompleted: isComplete 
        } : g),
        transactions: [
          {
            id: 'tx-goal-' + Date.now(),
            description: `Deposit to Goal: ${goal.name}`,
            amount: amount,
            type: 'expense',
            category: 'Savings',
            date: new Date().toISOString().split('T')[0],
            dopamineTag: 'planned',
            notes: 'Visual goal progress +1'
          },
          ...prev.transactions
        ]
      };
    });
  };

  const deleteGoal = (id: string) => {
    sound.playTap();
    setData(prev => ({
      ...prev,
      goals: prev.goals.filter(g => g.id !== id)
    }));
  };

  // Debt Actions
  const addDebt = (debt: Omit<DebtItem, 'id'>) => {
    sound.playSuccess();
    const newDebt: DebtItem = {
      ...debt,
      id: 'debt-' + Date.now()
    };
    setData(prev => ({
      ...prev,
      debts: [...prev.debts, newDebt]
    }));
  };

  const updateDebt = (id: string, updates: Partial<DebtItem>) => {
    sound.playTap();
    setData(prev => ({
      ...prev,
      debts: prev.debts.map(d => d.id === id ? { ...d, ...updates } : d)
    }));
  };

  const makeDebtPayment = (id: string, amount: number) => {
    if (amount <= 0) return;
    setData(prev => {
      const debt = prev.debts.find(d => d.id === id);
      if (!debt) return prev;

      const remaining = Math.max(0, debt.totalBalance - amount);
      if (remaining === 0) {
        triggerConfetti();
      } else {
        sound.playSuccess();
      }

      return {
        ...prev,
        paycheckConfig: {
          ...prev.paycheckConfig,
          currentBankBalance: Math.max(0, prev.paycheckConfig.currentBankBalance - amount)
        },
        debts: prev.debts.map(d => d.id === id ? { ...d, totalBalance: remaining } : d),
        transactions: [
          {
            id: 'tx-debt-' + Date.now(),
            description: `Payment towards ${debt.name}`,
            amount: amount,
            type: 'expense',
            category: 'Debt Repayment',
            date: new Date().toISOString().split('T')[0],
            dopamineTag: 'planned',
            notes: remaining === 0 ? 'PAID OFF! 🎉🎉' : `Remaining: $${remaining}`
          },
          ...prev.transactions
        ]
      };
    });
  };

  const deleteDebt = (id: string) => {
    sound.playTap();
    setData(prev => ({
      ...prev,
      debts: prev.debts.filter(d => d.id !== id)
    }));
  };

  const setDebtStrategy = (strategy: DebtStrategy) => {
    sound.playTap();
    setData(prev => ({
      ...prev,
      settings: { ...prev.settings, debtStrategy: strategy }
    }));
  };

  // Impulse Items (Cooling-off vault)
  const addImpulseItem = (item: Omit<ImpulseItem, 'id' | 'status' | 'addedDate'>) => {
    sound.playSuccess();
    const newItem: ImpulseItem = {
      ...item,
      id: 'imp-' + Date.now(),
      addedDate: new Date().toISOString().split('T')[0],
      status: 'cooling'
    };
    setData(prev => ({
      ...prev,
      impulseItems: [newItem, ...prev.impulseItems]
    }));
  };

  const resolveImpulseItem = (id: string, decision: 'bought' | 'saved') => {
    setData(prev => {
      const item = prev.impulseItems.find(i => i.id === id);
      if (!item) return prev;

      if (decision === 'saved') {
        triggerConfetti(); // Celebrated saving money from impulse!
      } else {
        sound.playSuccess();
      }

      return {
        ...prev,
        impulseItems: prev.impulseItems.map(i => i.id === id ? { ...i, status: decision } : i)
      };
    });
  };

  const deleteImpulseItem = (id: string) => {
    sound.playTap();
    setData(prev => ({
      ...prev,
      impulseItems: prev.impulseItems.filter(i => i.id !== id)
    }));
  };

  // Brain Dump Actions
  const addBrainDumpItem = (text: string) => {
    if (!text.trim()) return;
    sound.playTap();
    const newItem = {
      id: 'bd-' + Date.now(),
      text: text.trim(),
      done: false,
      createdAt: new Date().toISOString()
    };
    setData(prev => ({
      ...prev,
      brainDumpItems: [newItem, ...(prev.brainDumpItems || [])]
    }));
  };

  const toggleBrainDumpItem = (id: string) => {
    sound.playTap();
    setData(prev => ({
      ...prev,
      brainDumpItems: (prev.brainDumpItems || []).map(item =>
        item.id === id ? { ...item, done: !item.done } : item
      )
    }));
  };

  const deleteBrainDumpItem = (id: string) => {
    sound.playTap();
    setData(prev => ({
      ...prev,
      brainDumpItems: (prev.brainDumpItems || []).filter(item => item.id !== id)
    }));
  };

  // Small Things Actions
  const toggleSmallThing = (id: string) => {
    sound.playSuccess();
    setData(prev => {
      const updated = (prev.smallThings || []).map(item =>
        item.id === id ? { ...item, done: !item.done } : item
      );
      // If all 3 done, celebration!
      if (updated.length > 0 && updated.every(item => item.done)) {
        triggerConfetti();
      }
      return {
        ...prev,
        smallThings: updated
      };
    });
  };

  const setActiveMonth = (monthIndex: number) => {
    sound.playTap();
    setData(prev => ({
      ...prev,
      activeMonth: monthIndex
    }));
  };

  // Savings Challenges
  const toggleChallengeStep = (challengeId: string) => {
    setData(prev => {
      const chal = (prev.challenges || []).find(c => c.id === challengeId);
      if (!chal) return prev;
      const nextSteps = chal.completedSteps >= chal.totalSteps ? 0 : chal.completedSteps + 1;
      if (nextSteps === chal.totalSteps) {
        triggerConfetti();
      } else {
        sound.playSuccess();
      }
      return {
        ...prev,
        challenges: (prev.challenges || []).map(c =>
          c.id === challengeId ? { ...c, completedSteps: nextSteps } : c
        )
      };
    });
  };

  const addChallenge = (challenge: Omit<SavingsChallenge, 'id' | 'completedSteps'>) => {
    sound.playSuccess();
    const newChal: SavingsChallenge = {
      ...challenge,
      id: 'chal-' + Date.now(),
      completedSteps: 0
    };
    setData(prev => ({
      ...prev,
      challenges: [...(prev.challenges || []), newChal]
    }));
  };

  const toggleNoSpendToday = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    setData(prev => {
      const dates = prev.noSpendDates || [];
      const exists = dates.includes(todayStr);
      if (!exists) {
        triggerConfetti();
        return { ...prev, noSpendDates: [...dates, todayStr] };
      } else {
        sound.playTap();
        return { ...prev, noSpendDates: dates.filter(d => d !== todayStr) };
      }
    });
  };

  // General Settings & Config
  const updatePaycheckConfig = (config: Partial<PaycheckConfig>) => {
    sound.playTap();
    setData(prev => ({
      ...prev,
      paycheckConfig: { ...prev.paycheckConfig, ...config }
    }));
  };

  const updateSettings = (settings: Partial<UserSettings>) => {
    sound.playTap();
    setData(prev => ({
      ...prev,
      settings: { ...prev.settings, ...settings }
    }));
  };

  const setThemeMode = (mode: ThemeMode) => {
    updateSettings({ themeMode: mode });
  };

  const importData = (newData: AppData) => {
    setData(newData);
    triggerConfetti();
  };

  const resetAllData = () => {
    const res = StorageService.resetAll();
    setData(res);
  };

  return (
    <BudgetContext.Provider
      value={{
        data,
        settings: data.settings,
        paycheckConfig: data.paycheckConfig,
        envelopes: data.envelopes,
        bills: data.bills,
        goals: data.goals,
        debts: data.debts,
        transactions: data.transactions,
        impulseItems: data.impulseItems,
        challenges: data.challenges || [],
        noSpendDates: data.noSpendDates || [],
        brainDumpItems: data.brainDumpItems || [],
        smallThings: data.smallThings || [],
        activeMonth: data.activeMonth !== undefined ? data.activeMonth : new Date().getMonth(),
        helpMode,
        focusMode,

        daysUntilPaycheck,
        upcomingBillsBeforePaycheck,
        upcomingBillsSum,
        safeToSpendTotal,
        safeToSpendPerDay,
        totalDebt,
        totalSaved,
        monthlyBillsTotal,

        addTransaction,
        deleteTransaction,
        addEnvelope,
        updateEnvelope,
        deleteEnvelope,
        transferEnvelopeFunds,

        addBill,
        updateBill,
        deleteBill,
        toggleBillPaid,

        addGoal,
        contributeToGoal,
        deleteGoal,

        addDebt,
        updateDebt,
        makeDebtPayment,
        deleteDebt,
        setDebtStrategy,

        addImpulseItem,
        resolveImpulseItem,
        deleteImpulseItem,

        toggleChallengeStep,
        addChallenge,
        toggleNoSpendToday,

        addBrainDumpItem,
        toggleBrainDumpItem,
        deleteBrainDumpItem,
        toggleSmallThing,
        setActiveMonth,
        setHelpMode,
        setFocusMode,

        updatePaycheckConfig,
        updateSettings,
        setThemeMode,

        importData,
        resetAllData,
        triggerConfetti,
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
};

