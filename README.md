# 🧠 BudgetFlow • ADHD-Focused Budget Planner

A mobile-friendly, dopamine-rewarding budgeting web app inspired by the bestselling **Etsy ADHD Budget Planners**. Built with **React 19**, **TypeScript**, and **Tailwind CSS**.

Designed specifically for neurodivergent minds, **BudgetFlow** removes financial guilt, minimizes tracking friction, and solves the #1 question: *"Can I afford to buy this right now?"*

---

## ✨ Why It Works for ADHD Minds

Traditional budgeting apps fail ADHD users because they demand too many form fields, trigger shame when spending deviates from rigid plans, and hide critical information behind menus.

**BudgetFlow is built around ADHD neuroscience:**

1. **Instant "Safe-to-Spend" Engine**:
   - Eliminates mental math and overdraft anxiety.
   - Formula: `Bank Balance - Buffer Floor - Upcoming Bills Due Before Next Payday = Safe to Spend`.
   - Breaks it down into an easy **Daily Safe Allowance** (e.g. *$34.50/day for 6 days until payday*).

2. **Interactive "Can I Afford This?" Simulator**:
   - When tempted to buy something, tap one button, enter the cost, and get an immediate traffic-light verdict:
     - 🟢 **Safe:** Leaves you with $X/day remaining until payday.
     - 🟡 **Caution:** Tightens your daily budget below your comfort threshold.
     - 🔴 **Stop:** Would dip into your upcoming rent or bill money.

3. **Impulse Cooling-Off Vault (24–48h Pause)**:
   - Park impulse temptations in a cooling vault instead of buying immediately.
   - 80% of the time, the dopamine rush fades. When you decide not to buy, hit **"Dopamine Passed!"** to celebrate with confetti and track your total money saved!

4. **1-Tap Quick Add Logger**:
   - Zero tedious form fields.
   - Quick dollar amount presets (+5, +10, +20, +50, +100).
   - Dopamine Mood Tags:
     - 🛡️ **Essential** (Rent, food, medicine)
     - 🎯 **Planned Fun** (Budgeted dining, hobbies)
     - ⚡ **Impulse** (Spontaneous spur-of-the-moment buy)
     - 🩹 **ADHD Tax** (Late return fees, forgotten subscriptions, replaced lost keys)
     - ✨ **Treat** (Conscious dopamine reward)

5. **Digital Spending Envelopes & Sinking Funds**:
   - Visual cash stuffing: Groceries, Fun Money, Coffee, ADHD Tax Cushion, Pets, Self Care.
   - **Guilt-free Envelope Transfers**: Overspent in one envelope? Shift money from another in 2 clicks.

6. **Paycheck Forecasting & Recurring Bills**:
   - Automatic countdown to next payday.
   - Filters bills down to *"Due Before Next Payday"* so you only focus on what matters now.
   - AutoPay badges and dopamine checkmarks when bills are paid.

7. **Debt Smasher (Snowball & Avalanche)**:
   - **Snowball method**: Knocks out the smallest balances first for rapid dopamine momentum.
   - **Avalanche method**: Knocks out highest interest rate debts first to save maximum money.
   - Confetti celebration whenever a debt or savings milestone is reached.

8. **Sensory Customization & Audio**:
   - 🌈 **Dopamine Delight Mode**: High contrast, vibrant sticker colors, and reward badges.
   - 🧘 **Zen Focus Mode**: Calming, low-stimulation, muted tones.
   - 🌙 **Midnight Mode**: Dark mode for late-night planning.
   - Web Audio API synthesizer for tactile clicks and dopamine fanfare (zero external audio files).

9. **Offline-First, Private & Cross-Device Sync**:
   - Works 100% offline via Local-first storage and Service Worker (PWA ready).
   - Zero login required; no third-party tracking.
   - **AES-256 Encrypted Backups**: Passphrase-protected local export.
   - **Direct Sync Code**: Instant transfer between mobile phone and desktop without needing cloud databases.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation
```bash
# Clone or navigate to the project directory
cd budetfy

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your mobile or desktop browser.

### Building for Production
```bash
npm run build
```

---

## 📱 Mobile App (PWA) Installation

BudgetFlow includes full PWA support with `manifest.json` and `sw.js`:
- **iOS Safari**: Tap the **Share** button $\rightarrow$ **Add to Home Screen**.
- **Android Chrome**: Tap the **Three Dots** $\rightarrow$ **Install App / Add to Home screen**.
- **Desktop Chrome / Edge**: Click the install icon in the URL bar.

---

## 📂 Project Architecture

```
budetfy/
├── public/
│   ├── manifest.json       # PWA manifest
│   └── sw.js               # Offline Service Worker cache
├── src/
│   ├── types/
│   │   └── budget.ts       # Full TypeScript data models & settings
│   ├── services/
│   │   ├── sound.ts        # Web Audio API tactile & celebration chimes
│   │   └── storage.ts      # Offline storage, AES-GCM encryption & device sync
│   ├── context/
│   │   └── BudgetContext.tsx # Central store with Safe-to-Spend calculations
│   ├── components/
│   │   ├── Navbar.tsx      # Header with status pills, sound & theme toggles
│   │   ├── BottomNav.tsx   # Mobile 5-tab bar with center + Quick Log button
│   │   ├── QuickAddModal.tsx           # Low-friction dopamine logger
│   │   ├── AffordabilityCheckerModal.tsx # "Can I afford this?" simulator
│   │   ├── ImpulseVaultModal.tsx       # 24-48h cooling-off wishlist
│   │   └── views/
│   │       ├── DashboardView.tsx       # Safe-to-Spend hero & daily allowance
│   │       ├── EnvelopesView.tsx       # Digital envelopes & fund transfers
│   │       ├── BillsView.tsx           # Paycheck forecasting & recurring bills
│   │       ├── GoalsView.tsx           # Visual savings jars & Debt Snowball
│   │       ├── TransactionsView.tsx    # Dopamine tag history & CSV export
│   │       └── SettingsSyncView.tsx    # Backup, AES encryption, device sync
│   ├── App.tsx             # Root layout & view coordinator
│   ├── main.tsx            # App entry point
│   └── index.css           # Tailwind directives & responsive animations
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

