export type Frequency = 'weekly' | 'biweekly' | 'semimonthly' | 'monthly';

export type TransactionType = 'expense' | 'income';

export type DopamineTag = 
  | 'essential'      // Rent, groceries, medicine
  | 'planned'        // Planned fun, dining out
  | 'impulse'        // Spur of the moment
  | 'adhd_tax'       // Late fee, forgotten subscription, replaced lost item
  | 'treat';         // Conscious reward

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  envelopeId?: string;
  date: string; // ISO YYYY-MM-DD
  time?: string;
  dopamineTag?: DopamineTag;
  notes?: string;
  isRecurring?: boolean;
}

export interface RecurringBill {
  id: string;
  name: string;
  amount: number;
  dueDay: number; // 1-31
  category: string;
  envelopeId?: string;
  frequency: Frequency;
  autoPay: boolean;
  isPaidThisCycle: boolean;
  notes?: string;
  url?: string;
}

export interface Envelope {
  id: string;
  name: string;
  icon: string;
  allocatedAmount: number; // Budgeted per pay period
  spentAmount?: number;     // Computed from transactions
  color: string;
  categoryType: 'needs' | 'wants' | 'savings' | 'buffer';
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string;
  icon: string;
  color: string;
  category: string;
  isCompleted?: boolean;
}

export interface DebtItem {
  id: string;
  name: string;
  totalBalance: number;
  minimumPayment: number;
  interestRate: number; // percentage, e.g. 19.99
  dueDay: number;
  color: string;
  icon: string;
  extraPaymentThisMonth?: number;
}

export type DebtStrategy = 'snowball' | 'avalanche';

export interface SavingsChallenge {
  id: string;
  name: string;
  icon: string;
  totalTarget: number;
  stepValue: number; // e.g. $25 per bubble/sticker
  totalSteps: number;
  completedSteps: number; // e.g. 8 of 20
  color: string;
}

export interface PaycheckConfig {
  nextPayDate: string; // ISO YYYY-MM-DD
  frequency: Frequency;
  expectedAmount: number;
  currentBankBalance: number;
  cushionAmount: number; // Emergency / ADHD buffer floor (don't touch)
}

export interface ImpulseItem {
  id: string;
  name: string;
  price: number;
  addedDate: string; // ISO YYYY-MM-DD
  coolingOffHours: number; // e.g. 24, 48, 72 hours
  url?: string;
  notes?: string;
  status: 'cooling' | 'bought' | 'saved'; // saved = decided not to buy (saved money!)
}

export type ThemeMode = 'light' | 'dark' | 'vibrant' | 'zen';

export interface UserSettings {
  userName?: string;
  currency: string;
  currencySymbol: string;
  themeMode: ThemeMode;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  shameFreeAffirmations: boolean;
  debtStrategy: DebtStrategy;
  lastBackupDate?: string;
}

export interface BrainDumpItem {
  id: string;
  text: string;
  done: boolean;
  createdAt: string;
}

export interface SmallThingItem {
  id: string;
  text: string;
  timeEstimate: string;
  done: boolean;
}

export interface AppData {
  version: number;
  lastUpdated: string;
  activeMonth?: number; // 0-11
  settings: UserSettings;
  paycheckConfig: PaycheckConfig;
  envelopes: Envelope[];
  bills: RecurringBill[];
  goals: SavingsGoal[];
  debts: DebtItem[];
  transactions: Transaction[];
  impulseItems: ImpulseItem[];
  challenges?: SavingsChallenge[];
  noSpendDates?: string[]; // array of ISO YYYY-MM-DD
  brainDumpItems?: BrainDumpItem[];
  smallThings?: SmallThingItem[];
}

