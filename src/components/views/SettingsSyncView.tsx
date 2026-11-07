import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Download, 
  Upload, 
  Key, 
  Smartphone, 
  Copy, 
  Check, 
  RefreshCw, 
  Volume2, 
  Moon, 
  Sparkles, 
  HeartHandshake,
  DollarSign,
  User,
  Calendar,
  CreditCard,
  Sun,
  ShieldCheck,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import QRCode from 'qrcode';
import { useBudget } from '../../context/BudgetContext';
import { StorageService } from '../../services/storage';
import { IndexedDBService, db } from '../../services/db';
import { AppData, Frequency, DebtStrategy } from '../../types/budget';

export const SettingsSyncView: React.FC = () => {
  const { 
    data, 
    settings, 
    paycheckConfig, 
    updatePaycheckConfig, 
    updateSettings, 
    importData, 
    resetAllData 
  } = useBudget();

  // User Profile & Paycheck details
  const [userName, setUserName] = useState(settings.userName || '');
  const [expectedIncome, setExpectedIncome] = useState(paycheckConfig.expectedAmount.toString());
  const [frequency, setFrequency] = useState<Frequency>(paycheckConfig.frequency);
  const [nextPayDate, setNextPayDate] = useState(paycheckConfig.nextPayDate);

  // Bank & Cushion edit states
  const [bankBalance, setBankBalance] = useState(paycheckConfig.currentBankBalance.toString());
  const [cushionAmount, setCushionAmount] = useState(paycheckConfig.cushionAmount.toString());

  // Encryption passphrase states
  const [passphrase, setPassphrase] = useState('');
  const [isEncryptedExportOpen, setIsEncryptedExportOpen] = useState(false);
  const [isDecryptOpen, setIsDecryptOpen] = useState(false);
  const [decryptPassphrase, setDecryptPassphrase] = useState('');
  const [pendingEncryptedFile, setPendingEncryptedFile] = useState<string | null>(null);

  // Device Sync Code states
  const [syncCode, setSyncCode] = useState('');
  const [inputSyncCode, setInputSyncCode] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  // Live IndexedDB stats
  const [storageEstimate, setStorageEstimate] = useState<{ usedBytes: number; quotaBytes: number; usedPercent: number }>({
    usedBytes: 0,
    quotaBytes: 1000000000,
    usedPercent: 0
  });
  const [tableCounts, setTableCounts] = useState<Record<string, number>>({});
  const [dbPingStatus, setDbPingStatus] = useState<string | null>(null);
  const [inspectingTable, setInspectingTable] = useState<{ name: string; data: unknown[] } | null>(null);

  // Sync state when settings or config changes externally
  useEffect(() => {
    setUserName(settings.userName || '');
  }, [settings.userName]);

  useEffect(() => {
    setBankBalance(paycheckConfig.currentBankBalance.toString());
    setCushionAmount(paycheckConfig.cushionAmount.toString());
    setExpectedIncome(paycheckConfig.expectedAmount.toString());
    setFrequency(paycheckConfig.frequency);
    setNextPayDate(paycheckConfig.nextPayDate);
  }, [paycheckConfig]);

  useEffect(() => {
    IndexedDBService.getStorageEstimate().then(setStorageEstimate);
    IndexedDBService.getRecordCounts().then(setTableCounts);
  }, [data]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const income = parseFloat(expectedIncome);
    updateSettings({ userName: userName.trim() });
    updatePaycheckConfig({
      expectedAmount: isNaN(income) ? 0 : Math.max(0, income),
      frequency,
      nextPayDate: nextPayDate || new Date().toISOString().split('T')[0],
    });
    setSyncStatus('Profile and paycheck schedule saved! ✨');
    setTimeout(() => setSyncStatus(null), 3500);
  };

  const handleSaveFinancialBasics = (e: React.FormEvent) => {
    e.preventDefault();
    const balance = parseFloat(bankBalance);
    const cushion = parseFloat(cushionAmount);
    if (isNaN(balance) || isNaN(cushion)) return;

    updatePaycheckConfig({
      currentBankBalance: Math.max(0, balance),
      cushionAmount: Math.max(0, cushion),
    });
    setSyncStatus('Checking balance and cushion buffer saved! ✨');
    setTimeout(() => setSyncStatus(null), 3500);
  };

  const handleTestDbPing = async () => {
    const start = performance.now();
    try {
      const testKey = 'ping_test_' + Date.now();
      await db.meta.put({ key: testKey, value: 'ok' });
      await db.meta.get(testKey);
      await db.meta.delete(testKey);
      const duration = Math.round(performance.now() - start);
      setDbPingStatus(`✅ IndexedDB Operational (${duration}ms latency) • Read/Write Verified!`);
      setTimeout(() => setDbPingStatus(null), 5000);
    } catch (err) {
      setDbPingStatus(`❌ IndexedDB Error: ${String(err)}`);
    }
  };

  const handleInspectTable = async (tableName: string) => {
    try {
      let records: unknown[] = [];
      if (tableName === 'transactions') records = await db.transactions.toArray();
      else if (tableName === 'debts') records = await db.debts.toArray();
      else if (tableName === 'envelopes') records = await db.envelopes.toArray();
      else if (tableName === 'bills') records = await db.bills.toArray();
      else if (tableName === 'goals') records = await db.goals.toArray();
      else if (tableName === 'challenges') records = await db.challenges.toArray();
      else if (tableName === 'brainDump') records = await db.brainDump.toArray();
      setInspectingTable({ name: tableName, data: records });
    } catch (err) {
      alert('Failed to inspect table: ' + String(err));
    }
  };

  // Plain JSON Backup from IndexedDB
  const handleExportPlain = () => {
    StorageService.exportBackupFile(data);
  };

  // Encrypted Backup
  const handleExportEncrypted = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passphrase.trim()) return;

    try {
      const blob = await StorageService.exportEncryptedBackup(data, passphrase);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `budgetfy_IndexedDB_Encrypted_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setPassphrase('');
      setIsEncryptedExportOpen(false);
      setSyncStatus('Encrypted backup created successfully! 🔒');
      setTimeout(() => setSyncStatus(null), 3000);
    } catch (err) {
      alert('Encryption failed: ' + String(err));
    }
  };

  // Restore File Upload into IndexedDB
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        if (parsed.encrypted) {
          setPendingEncryptedFile(text);
          setIsDecryptOpen(true);
        } else {
          importData(parsed as AppData);
          await IndexedDBService.saveCompleteData(parsed as AppData);
          setSyncStatus('Database restored into IndexedDB successfully! 🎉');
          setTimeout(() => setSyncStatus(null), 3000);
        }
      } catch {
        alert('Invalid backup file. Could not parse JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleDecryptAndImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingEncryptedFile || !decryptPassphrase) return;

    try {
      const decrypted = await StorageService.decryptBackup(pendingEncryptedFile, decryptPassphrase);
      importData(decrypted);
      await IndexedDBService.saveCompleteData(decrypted);
      setIsDecryptOpen(false);
      setPendingEncryptedFile(null);
      setDecryptPassphrase('');
      setSyncStatus('Encrypted backup unlocked and written to IndexedDB! 🎉');
      setTimeout(() => setSyncStatus(null), 3000);
    } catch {
      alert('Decryption failed! Please check your password.');
    }
  };

  // Generate Device Sync Code & QR Code
  const handleGenerateSyncCode = async () => {
    try {
      const code = StorageService.generateSyncCode(data);
      setSyncCode(code);
      const url = await QRCode.toDataURL(code, { 
        width: 220, 
        margin: 2, 
        color: { dark: '#241930', light: '#FFFFFF' } 
      });
      setQrDataUrl(url);
    } catch {
      alert('Failed to generate sync code');
    }
  };

  const handleCopySyncCode = () => {
    if (!syncCode) return;
    navigator.clipboard.writeText(syncCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Import Device Sync Code
  const handleImportSyncCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputSyncCode.trim()) return;

    try {
      const parsed = StorageService.parseSyncCode(inputSyncCode);
      importData(parsed);
      await IndexedDBService.saveCompleteData(parsed);
      setInputSyncCode('');
      setSyncStatus('Synced data from your other device into IndexedDB! 🎉');
      setTimeout(() => setSyncStatus(null), 3000);
    } catch {
      alert('Invalid sync code. Please check that you copied the complete string.');
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-6 pb-24 md:pb-12 max-w-6xl mx-auto animate-fade-in">
      {/* Title Card */}
      <div className="rounded-3xl bg-white dark:bg-[#111827] p-6 border border-[#DDD7E8] dark:border-[#1F293D] shadow-xs flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚙️</span>
            <h2 className="text-2xl font-serif font-bold text-[#241930] dark:text-slate-100">
              Settings & Personal Details
            </h2>
          </div>
          <p className="text-xs text-[#7F7094] dark:text-slate-400 mt-1">
            Configure your personal profile, finances, ADHD preferences, and local-first IndexedDB database
          </p>
        </div>
      </div>

      {syncStatus && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-500" />
          <span>{syncStatus}</span>
        </div>
      )}

      {/* 1. Personal Profile & Paycheck Schedule */}
      <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 border border-[#DDD7E8] dark:border-[#1F293D] shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-[#ECE6F3] dark:border-[#1F293D]">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-[#4A3561] dark:text-indigo-400 flex items-center justify-center font-bold">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-base text-[#241930] dark:text-slate-100">
              Your Profile & Paycheck Schedule
            </h3>
            <span className="text-xs text-[#7F7094] dark:text-slate-400">
              Personalize greetings and configure your regular paycheck cycle
            </span>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* User Name */}
            <div>
              <label className="block text-xs font-semibold text-[#5F4E75] dark:text-slate-300 mb-1">
                Your Name / Preferred Nickname
              </label>
              <input
                type="text"
                placeholder="e.g. Alex"
                value={userName}
                onChange={e => setUserName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF9FC] dark:bg-[#162032] border border-[#DDD5E6] dark:border-[#223049] text-sm font-semibold text-[#241930] dark:text-slate-100 focus:outline-none focus:border-[#4A3561]"
              />
              <span className="text-[10px] text-[#7F7094] dark:text-slate-400 mt-1 block">
                Shown in the top greeting: "Good morning/afternoon/evening, {userName || '...'}"
              </span>
            </div>

            {/* Expected Paycheck Amount */}
            <div>
              <label className="block text-xs font-semibold text-[#5F4E75] dark:text-slate-300 mb-1">
                Typical Take-Home Paycheck ({settings.currencySymbol})
              </label>
              <input
                type="number"
                step="any"
                placeholder="e.g. 2500.00"
                value={expectedIncome}
                onChange={e => setExpectedIncome(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF9FC] dark:bg-[#162032] border border-[#DDD5E6] dark:border-[#223049] text-sm font-bold font-mono text-[#241930] dark:text-slate-100 focus:outline-none focus:border-[#4A3561]"
              />
              <span className="text-[10px] text-[#7F7094] dark:text-slate-400 mt-1 block">
                Used in paycheck forecasting and envelope replenishment
              </span>
            </div>

            {/* Pay Frequency */}
            <div>
              <label className="block text-xs font-semibold text-[#5F4E75] dark:text-slate-300 mb-1">
                Paycheck Frequency
              </label>
              <select
                value={frequency}
                onChange={e => setFrequency(e.target.value as Frequency)}
                className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF9FC] dark:bg-[#162032] border border-[#DDD5E6] dark:border-[#223049] text-xs font-bold text-[#241930] dark:text-slate-100 focus:outline-none"
              >
                <option value="weekly">Weekly (Every 7 days)</option>
                <option value="biweekly">Bi-Weekly (Every 2 weeks / 14 days)</option>
                <option value="semimonthly">Semi-Monthly (Twice a month, e.g. 1st & 15th)</option>
                <option value="monthly">Monthly (Once per month)</option>
              </select>
              <span className="text-[10px] text-[#7F7094] dark:text-slate-400 mt-1 block">
                Controls cycle bill filtering and Safe-to-Spend cadence
              </span>
            </div>

            {/* Next Pay Date */}
            <div>
              <label className="block text-xs font-semibold text-[#5F4E75] dark:text-slate-300 mb-1">
                Next Paycheck Date
              </label>
              <input
                type="date"
                required
                value={nextPayDate}
                onChange={e => setNextPayDate(e.target.value)}
                className="w-full px-4 py-2 rounded-2xl bg-[#FAF9FC] dark:bg-[#162032] border border-[#DDD5E6] dark:border-[#223049] text-xs font-semibold text-[#241930] dark:text-slate-100 focus:outline-none focus:border-[#4A3561]"
              />
              <span className="text-[10px] text-[#7F7094] dark:text-slate-400 mt-1 block">
                Safe-to-Spend calculates daily allowance from today until this date
              </span>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="py-2.5 px-5 rounded-2xl bg-[#241930] dark:bg-indigo-600 hover:bg-[#3D2952] text-white font-bold text-xs shadow-xs transition-all active:scale-95"
            >
              Save Profile & Paycheck
            </button>
          </div>
        </form>
      </div>

      {/* 2. Checking Balance & Cushion Buffer */}
      <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 border border-[#DDD7E8] dark:border-[#1F293D] shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-[#ECE6F3] dark:border-[#1F293D]">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-base text-[#241930] dark:text-slate-100">
              Checking Account & ADHD Cushion Floor
            </h3>
            <span className="text-xs text-[#7F7094] dark:text-slate-400">
              Set your actual checking balance and the protected cushion buffer
            </span>
          </div>
        </div>

        <form onSubmit={handleSaveFinancialBasics} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#5F4E75] dark:text-slate-300 mb-1">
                Real Checking Balance ({settings.currencySymbol})
              </label>
              <input
                type="number"
                step="any"
                required
                value={bankBalance}
                onChange={e => setBankBalance(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF9FC] dark:bg-[#162032] border border-[#DDD5E6] dark:border-[#223049] text-base font-bold font-mono text-[#241930] dark:text-slate-100 focus:outline-none focus:border-[#4A3561]"
              />
              <span className="text-[10px] text-[#7F7094] dark:text-slate-400 mt-1 block">
                Total money in your bank account right now
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5F4E75] dark:text-slate-300 mb-1">
                ADHD Cushion Floor ({settings.currencySymbol})
              </label>
              <input
                type="number"
                step="any"
                required
                value={cushionAmount}
                onChange={e => setCushionAmount(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF9FC] dark:bg-[#162032] border border-[#DDD5E6] dark:border-[#223049] text-base font-bold font-mono text-[#4A3561] dark:text-indigo-400 focus:outline-none focus:border-[#4A3561]"
              />
              <span className="text-[10px] text-[#7F7094] dark:text-slate-400 mt-1 block">
                Safe-to-Spend treats this floor as $0 to protect you from unexpected overdrafts
              </span>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="py-2.5 px-5 rounded-2xl bg-[#241930] dark:bg-indigo-600 hover:bg-[#3D2952] text-white font-bold text-xs shadow-xs transition-all active:scale-95"
            >
              Save Balances
            </button>
          </div>
        </form>
      </div>

      {/* 3. Sensory, ADHD & Strategy Personalization */}
      <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 border border-[#DDD7E8] dark:border-[#1F293D] shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-[#ECE6F3] dark:border-[#1F293D]">
          <div className="w-10 h-10 rounded-2xl bg-pink-500/10 text-pink-500 flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-base text-[#241930] dark:text-slate-100">
              Sensory, ADHD & Debt Strategy
            </h3>
            <span className="text-xs text-[#7F7094] dark:text-slate-400">
              Customize tactile feedback, aesthetics, affirmations, and debt payoff methodology
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Currency */}
          <div>
            <label className="block text-xs font-semibold text-[#5F4E75] dark:text-slate-300 mb-1.5">
              Currency
            </label>
            <select
              value={settings.currencySymbol}
              onChange={e => updateSettings({ currencySymbol: e.target.value })}
              className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF9FC] dark:bg-[#162032] border border-[#DDD5E6] dark:border-[#223049] text-xs font-bold text-[#241930] dark:text-slate-100 focus:outline-none"
            >
              <option value="$">$ USD / CAD / AUD (Dollar)</option>
              <option value="€">€ EUR (Euro)</option>
              <option value="£">£ GBP (Pound)</option>
              <option value="¥">¥ JPY / CNY (Yen/Yuan)</option>
              <option value="₹">₹ INR (Rupee)</option>
              <option value="CHF">CHF (Swiss Franc)</option>
            </select>
          </div>

          {/* Theme Mode */}
          <div>
            <label className="block text-xs font-semibold text-[#5F4E75] dark:text-slate-300 mb-1.5">
              Theme Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => updateSettings({ themeMode: 'light' })}
                className={`py-2 px-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  settings.themeMode !== 'dark'
                    ? 'border-[#4A3561] bg-[#F5F2F9] text-[#4A3561] font-bold shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <span>☀️ Soft Pastel</span>
              </button>
              <button
                type="button"
                onClick={() => updateSettings({ themeMode: 'dark' })}
                className={`py-2 px-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  settings.themeMode === 'dark'
                    ? 'border-indigo-500 bg-indigo-950/60 text-indigo-300 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <span>🌙 Dark Night</span>
              </button>
            </div>
          </div>

          {/* Debt Strategy */}
          <div>
            <label className="block text-xs font-semibold text-[#5F4E75] dark:text-slate-300 mb-1.5">
              Debt Payoff Strategy
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => updateSettings({ debtStrategy: 'snowball' })}
                className={`py-2 px-2.5 rounded-2xl border text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${
                  settings.debtStrategy === 'snowball'
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
                title="Smallest balance first — fast dopamine wins"
              >
                <span>⚡ Snowball</span>
              </button>
              <button
                type="button"
                onClick={() => updateSettings({ debtStrategy: 'avalanche' })}
                className={`py-2 px-2.5 rounded-2xl border text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${
                  settings.debtStrategy === 'avalanche'
                    ? 'border-indigo-500 bg-indigo-950/50 text-indigo-300 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
                title="Highest interest APR first — saves maximum money"
              >
                <span>🏔️ Avalanche</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sensory Toggles */}
        <div className="pt-3 border-t border-[#ECE6F3] dark:border-[#1F293D] space-y-3">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-xs font-semibold text-[#241930] dark:text-slate-300 flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-purple-500" />
              Tactile Sound Effects & Celebration Chimes
            </span>
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={e => updateSettings({ soundEnabled: e.target.checked })}
              className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-xs font-semibold text-[#241930] dark:text-slate-300 flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-pink-500" />
              Compassionate, Shame-Free ADHD Affirmations
            </span>
            <input
              type="checkbox"
              checked={settings.shameFreeAffirmations}
              onChange={e => updateSettings({ shameFreeAffirmations: e.target.checked })}
              className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
            />
          </label>
        </div>
      </div>

      {/* 4. IndexedDB Database Status & Health Monitor */}
      <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 border border-[#DDD7E8] dark:border-[#1F293D] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#ECE6F3] dark:border-[#1F293D]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-base text-[#241930] dark:text-slate-100">
                  IndexedDB Engine (Local-First)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                  ● Connected
                </span>
              </div>
              <span className="text-xs text-[#7F7094] dark:text-slate-400">
                Database: <code className="font-mono text-purple-700 dark:text-indigo-400 font-bold">budgetfy_db</code> (Dexie v4)
              </span>
            </div>
          </div>

          <div className="text-right font-mono text-xs text-[#7F7094] dark:text-slate-400 hidden sm:block">
            <span>Storage: </span>
            <strong className="text-[#241930] dark:text-slate-200">{formatBytes(storageEstimate.usedBytes)}</strong>
          </div>
        </div>

        {/* Live Table Records Grid */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#7F7094] dark:text-slate-400 uppercase tracking-wider block">
              IndexedDB Tables (Tap any table to inspect raw records)
            </span>
            <button
              onClick={handleTestDbPing}
              className="text-[11px] font-bold text-[#4A3561] dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Test DB Ping
            </button>
          </div>

          {dbPingStatus && (
            <div className="mb-2 p-2.5 rounded-xl bg-purple-50 dark:bg-[#1E293B] border border-purple-200 dark:border-indigo-800 text-xs font-mono text-purple-900 dark:text-indigo-200 font-bold animate-fade-in">
              {dbPingStatus}
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <button
              onClick={() => handleInspectTable('transactions')}
              className="p-3 rounded-2xl bg-[#FAF9FC] dark:bg-[#162032] border border-[#ECE6F3] dark:border-[#223049] hover:border-[#4A3561] dark:hover:border-indigo-500 text-left transition-all"
            >
              <span className="text-[10px] font-bold text-[#8C7D9E] dark:text-slate-400 uppercase block">Transactions</span>
              <span className="text-lg font-serif font-bold text-[#241930] dark:text-slate-100 font-mono">
                {tableCounts.transactions ?? data.transactions.length} records
              </span>
              <span className="text-[9px] text-[#4A3561] dark:text-indigo-400 block mt-1 font-semibold">Inspect table →</span>
            </button>

            <button
              onClick={() => handleInspectTable('debts')}
              className="p-3 rounded-2xl bg-[#FAF9FC] dark:bg-[#162032] border border-[#ECE6F3] dark:border-[#223049] hover:border-[#4A3561] dark:hover:border-indigo-500 text-left transition-all"
            >
              <span className="text-[10px] font-bold text-[#8C7D9E] dark:text-slate-400 uppercase block">Debts</span>
              <span className="text-lg font-serif font-bold text-rose-600 dark:text-rose-400 font-mono">
                {tableCounts.debts ?? data.debts.length} records
              </span>
              <span className="text-[9px] text-rose-600 dark:text-rose-400 block mt-1 font-semibold">Inspect table →</span>
            </button>

            <button
              onClick={() => handleInspectTable('envelopes')}
              className="p-3 rounded-2xl bg-[#FAF9FC] dark:bg-[#162032] border border-[#ECE6F3] dark:border-[#223049] hover:border-[#4A3561] dark:hover:border-indigo-500 text-left transition-all"
            >
              <span className="text-[10px] font-bold text-[#8C7D9E] dark:text-slate-400 uppercase block">Envelopes</span>
              <span className="text-lg font-serif font-bold text-[#4A3561] dark:text-indigo-400 font-mono">
                {tableCounts.envelopes ?? data.envelopes.length} records
              </span>
              <span className="text-[9px] text-[#4A3561] dark:text-indigo-400 block mt-1 font-semibold">Inspect table →</span>
            </button>

            <button
              onClick={() => handleInspectTable('bills')}
              className="p-3 rounded-2xl bg-[#FAF9FC] dark:bg-[#162032] border border-[#ECE6F3] dark:border-[#223049] hover:border-[#4A3561] dark:hover:border-indigo-500 text-left transition-all"
            >
              <span className="text-[10px] font-bold text-[#8C7D9E] dark:text-slate-400 uppercase block">Bills</span>
              <span className="text-lg font-serif font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                {tableCounts.bills ?? data.bills.length} records
              </span>
              <span className="text-[9px] text-emerald-600 dark:text-emerald-400 block mt-1 font-semibold">Inspect table →</span>
            </button>
          </div>
        </div>

        {/* Database Operations */}
        <div className="pt-3 border-t border-[#ECE6F3] dark:border-[#1F293D] flex flex-wrap gap-2.5">
          <button
            onClick={handleExportPlain}
            className="py-2.5 px-4 rounded-2xl bg-[#F5F2F9] dark:bg-[#162032] hover:bg-[#EBE5F3] dark:hover:bg-[#1E293B] text-[#241930] dark:text-slate-200 border border-[#DDD7E8] dark:border-[#223049] text-xs font-bold flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4 text-purple-600 dark:text-indigo-400" />
            Export IndexedDB JSON
          </button>

          <button
            onClick={() => setIsEncryptedExportOpen(true)}
            className="py-2.5 px-4 rounded-2xl bg-[#F5F2F9] dark:bg-[#162032] hover:bg-[#EBE5F3] dark:hover:bg-[#1E293B] text-[#241930] dark:text-slate-200 border border-[#DDD7E8] dark:border-[#223049] text-xs font-bold flex items-center gap-2 transition-colors"
          >
            <Key className="w-4 h-4 text-amber-500" />
            Export AES-256 Encrypted
          </button>

          <label className="py-2.5 px-4 rounded-2xl bg-[#F5F2F9] dark:bg-[#162032] hover:bg-[#EBE5F3] dark:hover:bg-[#1E293B] text-[#241930] dark:text-slate-200 border border-[#DDD7E8] dark:border-[#223049] text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer">
            <Upload className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Restore / Import File</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* 5. Device Sync: Mirror IndexedDB via QR Code or String */}
      <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 border border-[#DDD7E8] dark:border-[#1F293D] shadow-xs space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Smartphone className="w-5 h-5 text-purple-600 dark:text-indigo-400" />
          <h3 className="font-serif font-bold text-base text-[#241930] dark:text-slate-100">
            Sync IndexedDB Between Phone & Computer
          </h3>
        </div>
        <p className="text-xs text-[#7F7094] dark:text-slate-400">
          Transfer your complete budget database instantly between devices using a direct sync code or QR code without servers.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Share to other device */}
          <div className="p-4 rounded-2xl bg-[#FAF9FC] dark:bg-[#162032] border border-[#ECE6F3] dark:border-[#223049] space-y-3">
            <span className="text-xs font-bold text-[#241930] dark:text-slate-200 block">
              1. Generate Sync Code from this Device
            </span>
            <button
              onClick={handleGenerateSyncCode}
              className="py-2.5 px-4 rounded-2xl bg-[#241930] dark:bg-indigo-600 hover:bg-[#3D2952] text-white font-bold text-xs w-full transition-all shadow-xs"
            >
              Generate Device Sync Code & QR
            </button>
            {syncCode && (
              <div className="space-y-2">
                {qrDataUrl && (
                  <div className="flex flex-col items-center justify-center p-3 bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800">
                    <img src={qrDataUrl} alt="Device Sync QR Code" className="w-36 h-36 rounded-lg" />
                    <span className="text-[10px] text-slate-400 mt-1">Scan with phone camera to sync</span>
                  </div>
                )}
                <textarea
                  readOnly
                  rows={3}
                  value={syncCode}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-[10px] font-mono break-all text-slate-600 dark:text-slate-300"
                />
                <button
                  onClick={handleCopySyncCode}
                  className="py-2 px-3 rounded-xl bg-[#ECE6F2] hover:bg-[#E0D7E8] dark:bg-[#1E293B] text-[#241930] dark:text-slate-200 font-bold text-xs w-full flex items-center justify-center gap-1.5"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {isCopied ? 'Copied to Clipboard!' : 'Copy Code'}
                </button>
              </div>
            )}
          </div>

          {/* Receive from other device */}
          <div className="p-4 rounded-2xl bg-[#FAF9FC] dark:bg-[#162032] border border-[#ECE6F3] dark:border-[#223049] space-y-3">
            <span className="text-xs font-bold text-[#241930] dark:text-slate-200 block">
              2. Load on Other Device
            </span>
            <form onSubmit={handleImportSyncCode} className="space-y-2">
              <textarea
                placeholder="Paste the sync code here from your other device..."
                rows={4}
                value={inputSyncCode}
                onChange={e => setInputSyncCode(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-[10px] font-mono break-all text-slate-800 dark:text-slate-200"
              />
              <button
                type="submit"
                disabled={!inputSyncCode.trim()}
                className="py-2.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs w-full disabled:opacity-50 transition-all shadow-xs"
              >
                Restore to IndexedDB
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* 6. Clear / Reset IndexedDB */}
      <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 border border-[#DDD7E8] dark:border-[#1F293D] shadow-xs flex items-center justify-between">
        <div>
          <span className="font-serif font-bold text-sm text-[#241930] dark:text-slate-100 block">
            Clear Database & Start Fresh
          </span>
          <span className="text-xs text-[#7F7094] dark:text-slate-400">
            Wipes local IndexedDB and resets everything to a clean slate
          </span>
        </div>

        <button
          onClick={async () => {
            if (confirm('Are you sure you want to clear your local database and start completely fresh? All entries will be cleared.')) {
              resetAllData();
              await IndexedDBService.populateDefaults();
              setSyncStatus('Database cleared and reset to fresh state!');
              setTimeout(() => setSyncStatus(null), 3000);
            }
          }}
          className="py-2 px-4 rounded-xl border border-rose-300 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold transition-colors"
        >
          Clear All Records
        </button>
      </div>

      {/* Encrypted Export Passphrase Modal */}
      {isEncryptedExportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-[#111827] w-full max-w-md rounded-3xl p-6 shadow-2xl border border-[#DDD7E8] dark:border-[#1F293D]">
            <h3 className="text-lg font-serif font-bold text-[#241930] dark:text-slate-100 mb-2">
              Encrypt IndexedDB Backup
            </h3>
            <p className="text-xs text-[#7F7094] dark:text-slate-400 mb-4">
              Enter a secret passphrase. The file will be encrypted using AES-256 and cannot be decrypted without this key.
            </p>

            <form onSubmit={handleExportEncrypted} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#5F4E75] dark:text-slate-300 mb-1">
                  Passphrase
                </label>
                <input
                  type="password"
                  required
                  autoFocus
                  placeholder="Choose a strong password"
                  value={passphrase}
                  onChange={e => setPassphrase(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF9FC] dark:bg-[#162032] border border-[#DDD5E6] dark:border-[#223049] text-xs text-[#241930] dark:text-slate-100"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsEncryptedExportOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl bg-[#241930] dark:bg-indigo-600 text-white font-bold text-xs"
                >
                  Encrypt & Download
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Decrypt File Modal */}
      {isDecryptOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-[#111827] w-full max-w-md rounded-3xl p-6 shadow-2xl border border-[#DDD7E8] dark:border-[#1F293D]">
            <h3 className="text-lg font-serif font-bold text-[#241930] dark:text-slate-100 mb-2">
              Encrypted Backup Detected
            </h3>
            <p className="text-xs text-[#7F7094] dark:text-slate-400 mb-4">
              Enter the passphrase you used when creating this backup:
            </p>

            <form onSubmit={handleDecryptAndImport} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#5F4E75] dark:text-slate-300 mb-1">
                  Passphrase
                </label>
                <input
                  type="password"
                  required
                  autoFocus
                  placeholder="Enter your secret passphrase"
                  value={decryptPassphrase}
                  onChange={e => setDecryptPassphrase(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF9FC] dark:bg-[#162032] border border-[#DDD5E6] dark:border-[#223049] text-xs text-[#241930] dark:text-slate-100"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsDecryptOpen(false);
                    setPendingEncryptedFile(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl bg-emerald-600 text-white font-bold text-xs"
                >
                  Unlock & Write to IndexedDB
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table Inspector Modal */}
      {inspectingTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-[#111827] w-full max-w-2xl rounded-3xl p-6 shadow-2xl border border-[#DDD7E8] dark:border-[#1F293D] max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#ECE6F3] dark:border-[#1F293D]">
              <div>
                <h3 className="text-lg font-serif font-bold text-[#241930] dark:text-slate-100 flex items-center gap-2">
                  <Database className="w-5 h-5 text-indigo-500" />
                  IndexedDB Table: <code className="font-mono text-purple-700 dark:text-indigo-400">{inspectingTable.name}</code>
                </h3>
                <span className="text-xs text-[#7F7094] dark:text-slate-400">
                  {inspectingTable.data.length} records currently stored in browser IndexedDB
                </span>
              </div>
              <button
                onClick={() => setInspectingTable(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3">
              <pre className="p-4 rounded-2xl bg-[#FAF9FC] dark:bg-[#0B0F19] border border-[#ECE6F3] dark:border-[#1E293B] text-[11px] font-mono text-[#241930] dark:text-slate-200 overflow-x-auto leading-relaxed">
                {JSON.stringify(inspectingTable.data, null, 2)}
              </pre>
            </div>

            <div className="pt-3 border-t border-[#ECE6F3] dark:border-[#1F293D] flex justify-end">
              <button
                onClick={() => setInspectingTable(null)}
                className="px-5 py-2 rounded-xl bg-[#241930] dark:bg-indigo-600 text-white font-bold text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
