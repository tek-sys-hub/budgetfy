import React, { useState, useEffect } from 'react';
import { BudgetProvider, useBudget } from './context/BudgetContext';
import { Sidebar, NavItem } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { BottomNav } from './components/BottomNav';
import { TodayView } from './components/views/TodayView';
import { PlannerView } from './components/views/PlannerView';
import { EnvelopesView } from './components/views/EnvelopesView';
import { BillsView } from './components/views/BillsView';
import { MoneyInView } from './components/views/MoneyInView';
import { GoalsView } from './components/views/GoalsView';
import { DebtView } from './components/views/DebtView';
import { TransactionsView } from './components/views/TransactionsView';
import { SettingsSyncView } from './components/views/SettingsSyncView';
import { MilestonesView } from './components/views/MilestonesView';
import { QuickAddModal } from './components/QuickAddModal';
import { AffordabilityCheckerModal } from './components/AffordabilityCheckerModal';
import { ImpulseVaultModal } from './components/ImpulseVaultModal';
import { QuickActionsModal } from './components/QuickActionsModal';
const AppContent: React.FC = () => {
  const { addImpulseItem } = useBudget();
  const [activeNav, setActiveNav] = useState<NavItem>('today');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Modals
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddInitialAmount, setQuickAddInitialAmount] = useState<number | undefined>(undefined);
  const [quickAddInitialDesc, setQuickAddInitialDesc] = useState<string | undefined>(undefined);

  const [isAffordabilityOpen, setIsAffordabilityOpen] = useState(false);
  const [isImpulseVaultOpen, setIsImpulseVaultOpen] = useState(false);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);

  // Global keyboard shortcut Ctrl/Cmd + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsQuickActionsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOpenQuickAddWithDetails = (amount: number, description: string) => {
    setQuickAddInitialAmount(amount);
    setQuickAddInitialDesc(description);
    setIsQuickAddOpen(true);
  };

  const handleSendToImpulseVault = (amount: number, name: string) => {
    addImpulseItem({
      name,
      price: amount,
      coolingOffHours: 48,
      notes: 'Paused from Affordability Simulator to avoid impulse spending',
    });
    setIsImpulseVaultOpen(true);
  };

  const renderActiveView = () => {
    switch (activeNav) {
      case 'today':
        return (
          <TodayView
            onOpenQuickAdd={() => {
              setQuickAddInitialAmount(undefined);
              setQuickAddInitialDesc(undefined);
              setIsQuickAddOpen(true);
            }}
            onOpenAffordability={() => setIsAffordabilityOpen(true)}
          />
        );
      case 'planner':
        return <PlannerView />;
      case 'bills':
        return <BillsView />;
      case 'money-in':
        return <MoneyInView onOpenQuickActions={() => setIsQuickActionsOpen(true)} />;
      case 'goals':
        return <GoalsView onOpenQuickActions={() => setIsQuickActionsOpen(true)} />;
      case 'debt':
        return <DebtView />;
      case 'envelopes':
        return <EnvelopesView />;
      case 'milestones':
        return (
          <MilestonesView 
            onOpenQuickActions={() => setIsQuickActionsOpen(true)} 
            onNavigateToGoals={() => setActiveNav('goals')} 
          />
        );
      case 'transactions':
        return <TransactionsView />;
      case 'settings':
        return <SettingsSyncView />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8FC] dark:bg-[#0B0F19] text-[#241930] dark:text-[#F1F5F9] font-sans flex antialiased selection:bg-[#4A3561] selection:text-white transition-colors duration-200">
      {/* 1. Left Fixed Sidebar */}
      <Sidebar
        activeNav={activeNav}
        onSelectNav={setActiveNav}
        onOpenQuickAdd={() => {
          setQuickAddInitialAmount(undefined);
          setQuickAddInitialDesc(undefined);
          setIsQuickAddOpen(true);
        }}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* 2. Main Center Content Pane (Full width without right calendar tabs) */}
      <div className="flex-1 md:ml-64 min-w-0 flex flex-col min-h-screen">
        {/* Top Header */}
        <TopHeader
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onOpenQuickAdd={() => {
            setQuickAddInitialAmount(undefined);
            setQuickAddInitialDesc(undefined);
            setIsQuickAddOpen(true);
          }}
          onOpenQuickActions={() => setIsQuickActionsOpen(true)}
        />

        {/* View Content */}
        <main className="flex-1 px-3 sm:px-8 py-2 pb-24 md:pb-8">
          {renderActiveView()}
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <BottomNav
          activeNav={activeNav}
          onSelectNav={setActiveNav}
          onOpenQuickAdd={() => {
            setQuickAddInitialAmount(undefined);
            setQuickAddInitialDesc(undefined);
            setIsQuickAddOpen(true);
          }}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
        />
      </div>

      {/* Modals */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        initialAmount={quickAddInitialAmount}
        initialDescription={quickAddInitialDesc}
      />

      <AffordabilityCheckerModal
        isOpen={isAffordabilityOpen}
        onClose={() => setIsAffordabilityOpen(false)}
        onLogExpense={(amount, description) => {
          handleOpenQuickAddWithDetails(amount, description);
        }}
        onSendToImpulseVault={handleSendToImpulseVault}
      />

      <ImpulseVaultModal
        isOpen={isImpulseVaultOpen}
        onClose={() => setIsImpulseVaultOpen(false)}
        onLogExpense={(amount, description) => {
          handleOpenQuickAddWithDetails(amount, description);
        }}
      />

      <QuickActionsModal
        isOpen={isQuickActionsOpen}
        onClose={() => setIsQuickActionsOpen(false)}
        onNavigate={(nav) => setActiveNav(nav)}
        onOpenQuickAdd={() => {
          setQuickAddInitialAmount(undefined);
          setQuickAddInitialDesc(undefined);
          setIsQuickAddOpen(true);
        }}
        onOpenAffordability={() => setIsAffordabilityOpen(true)}
        onOpenImpulse={() => setIsImpulseVaultOpen(true)}
      />
    </div>
  );
};

export function App() {
  return (
    <BudgetProvider>
      <AppContent />
    </BudgetProvider>
  );
}

export default App;
