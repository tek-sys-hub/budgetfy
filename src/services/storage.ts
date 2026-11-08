import { AppData, UserSettings, SecuritySettings, PaycheckConfig, Envelope, RecurringBill, SavingsGoal, DebtItem, Transaction, ImpulseItem, SavingsChallenge, BrainDumpItem, SmallThingItem, ExtraIncomeItem } from '../types/budget';

const STORAGE_KEY = 'budgetfy_user_data_v2';

export const DEFAULT_SECURITY_SETTINGS: SecuritySettings = {
  pinLockEnabled: false,
  pinHash: undefined,
  biometricsEnabled: false,
  hideBalances: false,
  autoLockMinutes: 5,
};

export const INITIAL_PAYCHECK_CONFIG: PaycheckConfig = {
  nextPayDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  frequency: 'biweekly',
  expectedAmount: 0,
  currentBankBalance: 0,
  cushionAmount: 0,
};

export const INITIAL_SETTINGS: UserSettings = {
  userName: '',
  currency: 'USD',
  currencySymbol: '$',
  themeMode: 'light',
  soundEnabled: true,
  hapticsEnabled: true,
  shameFreeAffirmations: true,
  debtStrategy: 'snowball',
  lastBackupDate: undefined,
  security: DEFAULT_SECURITY_SETTINGS,
};

export const INITIAL_ENVELOPES: Envelope[] = [];
export const INITIAL_BILLS: RecurringBill[] = [];
export const INITIAL_GOALS: SavingsGoal[] = [];
export const INITIAL_DEBTS: DebtItem[] = [];
export const INITIAL_TRANSACTIONS: Transaction[] = [];
export const INITIAL_IMPULSE_ITEMS: ImpulseItem[] = [];
export const INITIAL_CHALLENGES: SavingsChallenge[] = [];
export const INITIAL_BRAIN_DUMP: BrainDumpItem[] = [];
export const INITIAL_EXTRA_INCOMES: ExtraIncomeItem[] = [];

export const INITIAL_SMALL_THINGS: SmallThingItem[] = [
  { id: 'st-1', text: 'Set your name & checking balance in Settings', timeEstimate: '1 min', done: false },
  { id: 'st-2', text: 'Log anything you spent today', timeEstimate: '30 sec', done: false },
  { id: 'st-3', text: 'Keep today under safe-to-spend', timeEstimate: '—', done: false },
];

export const DEFAULT_APP_DATA: AppData = {
  version: 2,
  lastUpdated: new Date().toISOString(),
  activeMonth: new Date().getMonth(),
  settings: INITIAL_SETTINGS,
  paycheckConfig: INITIAL_PAYCHECK_CONFIG,
  envelopes: INITIAL_ENVELOPES,
  bills: INITIAL_BILLS,
  goals: INITIAL_GOALS,
  debts: INITIAL_DEBTS,
  transactions: INITIAL_TRANSACTIONS,
  impulseItems: INITIAL_IMPULSE_ITEMS,
  challenges: INITIAL_CHALLENGES,
  noSpendDates: [],
  brainDumpItems: INITIAL_BRAIN_DUMP,
  smallThings: INITIAL_SMALL_THINGS,
  extraIncomes: INITIAL_EXTRA_INCOMES,
};

// Storage helper
export const StorageService = {
  loadData(): AppData {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        this.saveData(DEFAULT_APP_DATA);
        return DEFAULT_APP_DATA;
      }
      const parsed = JSON.parse(raw);
      // Ensure merged with defaults in case of missing keys
      return {
        ...DEFAULT_APP_DATA,
        ...parsed,
        settings: {
          ...DEFAULT_APP_DATA.settings,
          ...(parsed.settings || {}),
          security: {
            ...DEFAULT_SECURITY_SETTINGS,
            ...(parsed.settings?.security || {})
          }
        },
        paycheckConfig: { ...DEFAULT_APP_DATA.paycheckConfig, ...(parsed.paycheckConfig || {}) },
        envelopes: parsed.envelopes ?? [],
        bills: parsed.bills ?? [],
        goals: parsed.goals ?? [],
        debts: parsed.debts ?? [],
        transactions: parsed.transactions ?? [],
        impulseItems: parsed.impulseItems ?? [],
        challenges: parsed.challenges ?? [],
        noSpendDates: parsed.noSpendDates ?? [],
        brainDumpItems: parsed.brainDumpItems ?? [],
        smallThings: parsed.smallThings ?? DEFAULT_APP_DATA.smallThings,
        extraIncomes: parsed.extraIncomes ?? [],
        activeMonth: parsed.activeMonth !== undefined ? parsed.activeMonth : DEFAULT_APP_DATA.activeMonth,
      };
    } catch (err) {
      console.error('Failed to load budget data from storage, returning default', err);
      return DEFAULT_APP_DATA;
    }
  },

  saveData(data: AppData): void {
    try {
      data.lastUpdated = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.error('Failed to save data to localStorage', err);
    }
  },

  // Export JSON file
  exportBackupFile(data: AppData): void {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `budgetfy_Backup_${dateStr}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  },

  // Encrypted export using Web Crypto AES-GCM
  async exportEncryptedBackup(data: AppData, passphrase: string): Promise<Blob> {
    const enc = new TextEncoder();
    const pwUtf8 = enc.encode(passphrase);
    const pwHash = await crypto.subtle.digest('SHA-256', pwUtf8);

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await crypto.subtle.importKey(
      'raw',
      pwHash,
      { name: 'AES-GCM' },
      false,
      ['encrypt']
    );

    const dataUtf8 = enc.encode(JSON.stringify(data));
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      dataUtf8
    );

    const bundle = {
      version: 1,
      encrypted: true,
      iv: Array.from(iv),
      cipherText: Array.from(new Uint8Array(encrypted)),
      date: new Date().toISOString(),
    };

    return new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
  },

  // Decrypt backup
  async decryptBackup(fileText: string, passphrase: string): Promise<AppData> {
    const bundle = JSON.parse(fileText);
    if (!bundle.encrypted || !bundle.cipherText || !bundle.iv) {
      throw new Error('Not a valid encrypted backup');
    }

    const enc = new TextEncoder();
    const pwUtf8 = enc.encode(passphrase);
    const pwHash = await crypto.subtle.digest('SHA-256', pwUtf8);

    const key = await crypto.subtle.importKey(
      'raw',
      pwHash,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );

    const iv = new Uint8Array(bundle.iv);
    const cipherText = new Uint8Array(bundle.cipherText);

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      cipherText
    );

    const dec = new TextDecoder();
    return JSON.parse(dec.decode(decrypted)) as AppData;
  },

  // Device sync code generator (compact Base64 string for quick sharing between phone & laptop)
  generateSyncCode(data: AppData): string {
    const compact = JSON.stringify(data);
    return btoa(encodeURIComponent(compact));
  },

  parseSyncCode(code: string): AppData {
    const raw = decodeURIComponent(atob(code.trim()));
    return JSON.parse(raw) as AppData;
  },

  resetAll(): AppData {
    localStorage.removeItem(STORAGE_KEY);
    this.saveData(DEFAULT_APP_DATA);
    return DEFAULT_APP_DATA;
  }
};

