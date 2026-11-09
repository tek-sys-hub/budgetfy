import Dexie, { type EntityTable } from 'dexie';
import { 
  Transaction, 
  Envelope, 
  RecurringBill, 
  DebtItem, 
  SavingsGoal, 
  SavingsChallenge, 
  ImpulseItem, 
  BrainDumpItem,
  AppData,
  UserSettings,
  PaycheckConfig,
  ExtraIncomeItem,
  CalendarNote
} from '../types/budget';
import { DEFAULT_APP_DATA } from './storage';

export interface MetaItem {
  key: string;
  value: unknown;
}

// Dexie IndexedDB Database Definition
export class BudgetfyDatabase extends Dexie {
  transactions!: EntityTable<Transaction, 'id'>;
  envelopes!: EntityTable<Envelope, 'id'>;
  bills!: EntityTable<RecurringBill, 'id'>;
  debts!: EntityTable<DebtItem, 'id'>;
  goals!: EntityTable<SavingsGoal, 'id'>;
  challenges!: EntityTable<SavingsChallenge, 'id'>;
  impulseItems!: EntityTable<ImpulseItem, 'id'>;
  brainDump!: EntityTable<BrainDumpItem, 'id'>;
  meta!: EntityTable<MetaItem, 'key'>;

  constructor() {
    super('budgetfy_db');
    this.version(1).stores({
      transactions: 'id, date, type, category, dopamineTag',
      envelopes: 'id, name, categoryType',
      bills: 'id, dueDay, isPaidThisCycle, autoPay',
      debts: 'id, totalBalance, interestRate, dueDay',
      goals: 'id, targetAmount, currentAmount',
      challenges: 'id, totalTarget, completedSteps',
      impulseItems: 'id, status, addedDate',
      brainDump: 'id, done, createdAt',
      meta: 'key',
    });
  }
}

export const db = new BudgetfyDatabase();

// IndexedDB Helper Functions
export const IndexedDBService = {
  // Check if DB is initialized, if not populate with initial sample data
  async ensureInitialized(): Promise<void> {
    try {
      const metaCount = await db.meta.count();
      if (metaCount === 0) {
        await this.populateDefaults();
      }
    } catch (err) {
      console.warn('IndexedDB initialization check note:', err);
    }
  },

  async populateDefaults(): Promise<void> {
    await db.transaction('rw', [
      db.transactions,
      db.envelopes,
      db.bills,
      db.debts,
      db.goals,
      db.challenges,
      db.impulseItems,
      db.brainDump,
      db.meta
    ], async () => {
      // Clear existing
      await Promise.all([
        db.transactions.clear(),
        db.envelopes.clear(),
        db.bills.clear(),
        db.debts.clear(),
        db.goals.clear(),
        db.challenges.clear(),
        db.impulseItems.clear(),
        db.brainDump.clear(),
        db.meta.clear()
      ]);

      // Bulk add
      if (DEFAULT_APP_DATA.transactions?.length) {
        await db.transactions.bulkAdd(DEFAULT_APP_DATA.transactions);
      }
      if (DEFAULT_APP_DATA.envelopes?.length) {
        await db.envelopes.bulkAdd(DEFAULT_APP_DATA.envelopes);
      }
      if (DEFAULT_APP_DATA.bills?.length) {
        await db.bills.bulkAdd(DEFAULT_APP_DATA.bills);
      }
      if (DEFAULT_APP_DATA.debts?.length) {
        await db.debts.bulkAdd(DEFAULT_APP_DATA.debts);
      }
      if (DEFAULT_APP_DATA.goals?.length) {
        await db.goals.bulkAdd(DEFAULT_APP_DATA.goals);
      }
      if (DEFAULT_APP_DATA.challenges?.length) {
        await db.challenges.bulkAdd(DEFAULT_APP_DATA.challenges);
      }
      if (DEFAULT_APP_DATA.impulseItems?.length) {
        await db.impulseItems.bulkAdd(DEFAULT_APP_DATA.impulseItems);
      }
      if (DEFAULT_APP_DATA.brainDumpItems?.length) {
        await db.brainDump.bulkAdd(DEFAULT_APP_DATA.brainDumpItems);
      }

      await db.meta.bulkAdd([
        { key: 'settings', value: DEFAULT_APP_DATA.settings },
        { key: 'paycheckConfig', value: DEFAULT_APP_DATA.paycheckConfig },
        { key: 'noSpendDates', value: DEFAULT_APP_DATA.noSpendDates },
        { key: 'smallThings', value: DEFAULT_APP_DATA.smallThings },
        { key: 'extraIncomes', value: DEFAULT_APP_DATA.extraIncomes },
        { key: 'calendarNotes', value: DEFAULT_APP_DATA.calendarNotes },
        { key: 'activeMonth', value: DEFAULT_APP_DATA.activeMonth },
        { key: 'version', value: DEFAULT_APP_DATA.version },
        { key: 'lastUpdated', value: new Date().toISOString() }
      ]);
    });
  },

  // Load complete data from IndexedDB into memory
  async loadCompleteData(): Promise<AppData | null> {
    try {
      await this.ensureInitialized();
      const [
        transactions,
        envelopes,
        bills,
        debts,
        goals,
        challenges,
        impulseItems,
        brainDumpItems,
        metaEntries
      ] = await Promise.all([
        db.transactions.toArray(),
        db.envelopes.toArray(),
        db.bills.toArray(),
        db.debts.toArray(),
        db.goals.toArray(),
        db.challenges.toArray(),
        db.impulseItems.toArray(),
        db.brainDump.toArray(),
        db.meta.toArray()
      ]);

      const metaMap = new Map<string, unknown>();
      metaEntries.forEach(item => metaMap.set(item.key, item.value));

      return {
        version: (metaMap.get('version') as number) || 2,
        lastUpdated: (metaMap.get('lastUpdated') as string) || new Date().toISOString(),
        settings: (metaMap.get('settings') as UserSettings) || DEFAULT_APP_DATA.settings,
        paycheckConfig: (metaMap.get('paycheckConfig') as PaycheckConfig) || DEFAULT_APP_DATA.paycheckConfig,
        envelopes: envelopes || [],
        bills: bills || [],
        debts: debts || [],
        goals: goals || [],
        challenges: challenges || [],
        impulseItems: impulseItems || [],
        transactions: transactions || [],
        brainDumpItems: brainDumpItems || [],
        smallThings: (metaMap.get('smallThings') as AppData['smallThings']) || DEFAULT_APP_DATA.smallThings,
        extraIncomes: (metaMap.get('extraIncomes') as ExtraIncomeItem[]) || [],
        calendarNotes: (metaMap.get('calendarNotes') as CalendarNote[]) || [],
        noSpendDates: (metaMap.get('noSpendDates') as string[]) || [],
        activeMonth: (metaMap.get('activeMonth') as number) ?? DEFAULT_APP_DATA.activeMonth
      };
    } catch (err) {
      console.error('Failed to load from IndexedDB, fallback to storage', err);
      return null;
    }
  },

  // Save complete state to IndexedDB
  async saveCompleteData(data: AppData): Promise<void> {
    try {
      await db.transaction('rw', [
        db.transactions,
        db.envelopes,
        db.bills,
        db.debts,
        db.goals,
        db.challenges,
        db.impulseItems,
        db.brainDump,
        db.meta
      ], async () => {
        // Clear old tables
        await Promise.all([
          db.transactions.clear(),
          db.envelopes.clear(),
          db.bills.clear(),
          db.debts.clear(),
          db.goals.clear(),
          db.challenges.clear(),
          db.impulseItems.clear(),
          db.brainDump.clear(),
          db.meta.clear()
        ]);

        // Bulk insert new
        if (data.transactions?.length) await db.transactions.bulkAdd(data.transactions);
        if (data.envelopes?.length) await db.envelopes.bulkAdd(data.envelopes);
        if (data.bills?.length) await db.bills.bulkAdd(data.bills);
        if (data.debts?.length) await db.debts.bulkAdd(data.debts);
        if (data.goals?.length) await db.goals.bulkAdd(data.goals);
        if (data.challenges?.length) await db.challenges.bulkAdd(data.challenges);
        if (data.impulseItems?.length) await db.impulseItems.bulkAdd(data.impulseItems);
        if (data.brainDumpItems?.length) await db.brainDump.bulkAdd(data.brainDumpItems);

        await db.meta.bulkAdd([
          { key: 'settings', value: data.settings },
          { key: 'paycheckConfig', value: data.paycheckConfig },
          { key: 'noSpendDates', value: data.noSpendDates },
          { key: 'smallThings', value: data.smallThings },
          { key: 'extraIncomes', value: data.extraIncomes || [] },
          { key: 'calendarNotes', value: data.calendarNotes || [] },
          { key: 'activeMonth', value: data.activeMonth },
          { key: 'version', value: data.version },
          { key: 'lastUpdated', value: new Date().toISOString() }
        ]);
      });
    } catch (err) {
      console.error('Error saving to IndexedDB', err);
    }
  },

  // Storage estimation monitor
  async getStorageEstimate(): Promise<{ usedBytes: number; quotaBytes: number; usedPercent: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const est = await navigator.storage.estimate();
        const used = est.usage || 0;
        const quota = est.quota || 1;
        return {
          usedBytes: used,
          quotaBytes: quota,
          usedPercent: Math.min(100, Math.round((used / quota) * 100))
        };
      } catch {
        // Fallback
      }
    }
    return { usedBytes: 150000, quotaBytes: 1000000000, usedPercent: 1 };
  },

  // Count records across all IndexedDB stores
  async getRecordCounts(): Promise<Record<string, number>> {
    try {
      const [
        txCount,
        envCount,
        billCount,
        debtCount,
        goalCount,
        chalCount,
        impCount,
        bdCount
      ] = await Promise.all([
        db.transactions.count(),
        db.envelopes.count(),
        db.bills.count(),
        db.debts.count(),
        db.goals.count(),
        db.challenges.count(),
        db.impulseItems.count(),
        db.brainDump.count()
      ]);

      return {
        transactions: txCount,
        envelopes: envCount,
        bills: billCount,
        debts: debtCount,
        goals: goalCount,
        challenges: chalCount,
        impulseItems: impCount,
        brainDump: bdCount
      };
    } catch {
      return {};
    }
  }
};

