import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  DollarSign, 
  AlertCircle, 
  CheckCircle,
  Check,
  Star,
  Plus,
  StickyNote,
  Trash2,
  Edit2,
  CheckSquare,
  Clock,
  Sparkles,
  Tag,
  X
} from 'lucide-react';
import { useBudget } from '../../context/BudgetContext';
import { CalendarNoteCategory } from '../../types/budget';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const CATEGORY_CONFIG: Record<CalendarNoteCategory, { label: string; icon: string; bg: string; text: string; border: string }> = {
  reminder: { 
    label: 'Reminder', 
    icon: '📝', 
    bg: 'bg-amber-50 dark:bg-amber-950/40', 
    text: 'text-amber-800 dark:text-amber-300', 
    border: 'border-amber-200 dark:border-amber-800/60' 
  },
  event: { 
    label: 'Event', 
    icon: '🌿', 
    bg: 'bg-emerald-50 dark:bg-emerald-950/40', 
    text: 'text-emerald-800 dark:text-emerald-300', 
    border: 'border-emerald-200 dark:border-emerald-800/60' 
  },
  todo: { 
    label: 'To-Do', 
    icon: '✅', 
    bg: 'bg-purple-50 dark:bg-purple-950/40', 
    text: 'text-purple-800 dark:text-purple-300', 
    border: 'border-purple-200 dark:border-purple-800/60' 
  },
  urgent: { 
    label: 'Urgent', 
    icon: '⚡', 
    bg: 'bg-rose-50 dark:bg-rose-950/40', 
    text: 'text-rose-800 dark:text-rose-300', 
    border: 'border-rose-200 dark:border-rose-800/60' 
  },
  money: { 
    label: 'Money', 
    icon: '💰', 
    bg: 'bg-blue-50 dark:bg-blue-950/40', 
    text: 'text-blue-800 dark:text-blue-300', 
    border: 'border-blue-200 dark:border-blue-800/60' 
  },
};

export const PlannerView: React.FC = () => {
  const { 
    activeMonth, 
    setActiveMonth, 
    bills, 
    transactions, 
    paycheckConfig, 
    noSpendDates, 
    settings,
    calendarNotes,
    addCalendarNote,
    updateCalendarNote,
    deleteCalendarNote,
    toggleCalendarNote,
    triggerConfetti
  } = useBudget();

  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDate());
  
  // Note Form State
  const [noteText, setNoteText] = useState('');
  const [noteCategory, setNoteCategory] = useState<CalendarNoteCategory>('reminder');
  const [isAddingNote, setIsAddingNote] = useState(false);

  // Note Inline Editing State
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [editingCategory, setEditingCategory] = useState<CalendarNoteCategory>('reminder');

  // Quick Modal State (e.g. from calendar grid "+" button)
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDay, setModalDay] = useState<number>(new Date().getDate());
  const [modalText, setModalText] = useState('');
  const [modalCategory, setModalCategory] = useState<CalendarNoteCategory>('reminder');

  const currentYear = new Date().getFullYear();
  // Get days in active month
  const daysInMonth = new Date(currentYear, activeMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, activeMonth, 1).getDay(); // 0 = Sun

  const prevMonth = () => {
    setActiveMonth((activeMonth + 11) % 12);
  };

  const nextMonth = () => {
    setActiveMonth((activeMonth + 1) % 12);
  };

  // Find pay day in this month
  const payDateObj = new Date(paycheckConfig.nextPayDate + 'T00:00:00');
  const isPayMonth = payDateObj.getMonth() === activeMonth;
  const payDayOfMonth = isPayMonth ? payDateObj.getDate() : null;

  // Selected day details
  const selectedDayStr = `${currentYear}-${String(activeMonth + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
  const dayTransactions = transactions.filter(t => t.date === selectedDayStr);
  const dayBills = bills.filter(b => b.dueDay === selectedDay);
  const isSelectedNoSpend = (noSpendDates || []).includes(selectedDayStr);
  
  // Notes for selected day
  const dayNotes = (calendarNotes || []).filter(n => n.date === selectedDayStr);

  // Month-wide notes count
  const monthPrefix = `${currentYear}-${String(activeMonth + 1).padStart(2, '0')}`;
  const monthNotes = (calendarNotes || []).filter(n => n.date.startsWith(monthPrefix));

  const totalMonthlyBills = bills.reduce((acc, b) => acc + b.amount, 0);

  const handleAddNote = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!noteText.trim()) return;

    addCalendarNote({
      date: selectedDayStr,
      text: noteText.trim(),
      category: noteCategory,
      completed: false,
    });

    setNoteText('');
    setIsAddingNote(false);
  };

  const handleSaveModalNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalText.trim()) return;

    const targetDateStr = `${currentYear}-${String(activeMonth + 1).padStart(2, '0')}-${String(modalDay).padStart(2, '0')}`;
    addCalendarNote({
      date: targetDateStr,
      text: modalText.trim(),
      category: modalCategory,
      completed: false,
    });

    setModalText('');
    setModalOpen(false);
    setSelectedDay(modalDay);
  };

  const startEditing = (note: { id: string; text: string; category?: CalendarNoteCategory }) => {
    setEditingNoteId(note.id);
    setEditingText(note.text);
    setEditingCategory(note.category || 'reminder');
  };

  const saveEditing = (id: string) => {
    if (!editingText.trim()) return;
    updateCalendarNote(id, {
      text: editingText.trim(),
      category: editingCategory,
    });
    setEditingNoteId(null);
  };

  const handleToggleNote = (id: string, currentlyCompleted?: boolean) => {
    toggleCalendarNote(id);
    if (!currentlyCompleted) {
      // Small celebratory confetti if marking as done
      triggerConfetti();
    }
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      activeMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    );
  };

  return (
    <div className="space-y-6 pb-24 md:pb-12 max-w-6xl mx-auto">
      {/* Month Navigator Header */}
      <div className="bg-white dark:bg-[#1E1628] rounded-3xl p-6 border border-[#DDD7E8] dark:border-[#2C213B] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">📅</span>
            <h2 className="text-2xl font-serif font-bold text-[#241930] dark:text-white">
              {MONTH_NAMES[activeMonth]} {currentYear} Planner
            </h2>
          </div>
          <p className="text-xs text-[#7F7094] dark:text-[#A798BC] mt-1">
            Visual month-at-a-glance: paydays, bill deadlines, and daily notes & reminders
          </p>
        </div>

        {/* Month Selector Buttons & Quick Note button */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              setModalDay(selectedDay);
              setModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-[#EDE7F4] dark:bg-[#2C203B] hover:bg-[#E3DCED] text-[#4A3561] dark:text-purple-300 font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs active:scale-95"
            title="Add note to calendar"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Note</span>
          </button>

          <div className="flex items-center gap-1.5 bg-[#FAF9FC] dark:bg-[#181121] p-1 rounded-2xl border border-[#EDE8F4] dark:border-[#2C213D]">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-xl hover:bg-[#EBE5F3] dark:hover:bg-[#281D35] text-[#241930] dark:text-white transition-colors"
              title="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 rounded-xl bg-[#241930] text-white font-mono text-xs font-bold tracking-wider">
              {MONTH_NAMES[activeMonth].toUpperCase()}
            </span>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-xl hover:bg-[#EBE5F3] dark:hover:bg-[#281D35] text-[#241930] dark:text-white transition-colors"
              title="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Monthly Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-[#1E1628] rounded-2xl p-4 border border-[#DDD7E8] dark:border-[#2C213B]">
          <span className="text-[10px] font-bold text-[#8C7D9E] uppercase tracking-wider block">
            Expected Paycheck
          </span>
          <span className="text-lg font-serif font-bold text-emerald-600 dark:text-emerald-400">
            {settings.currencySymbol}{paycheckConfig.expectedAmount.toFixed(2)}
          </span>
        </div>

        <div className="bg-white dark:bg-[#1E1628] rounded-2xl p-4 border border-[#DDD7E8] dark:border-[#2C213B]">
          <span className="text-[10px] font-bold text-[#8C7D9E] uppercase tracking-wider block">
            Total Monthly Bills
          </span>
          <span className="text-lg font-serif font-bold text-rose-500">
            {settings.currencySymbol}{totalMonthlyBills.toFixed(2)}
          </span>
        </div>

        <div className="bg-white dark:bg-[#1E1628] rounded-2xl p-4 border border-[#DDD7E8] dark:border-[#2C213B]">
          <span className="text-[10px] font-bold text-[#8C7D9E] uppercase tracking-wider block">
            Projected Safe Buffer
          </span>
          <span className="text-lg font-serif font-bold text-[#4A3561] dark:text-purple-300">
            {settings.currencySymbol}{Math.max(0, paycheckConfig.expectedAmount - totalMonthlyBills).toFixed(2)}
          </span>
        </div>

        <div className="bg-white dark:bg-[#1E1628] rounded-2xl p-4 border border-[#DDD7E8] dark:border-[#2C213B]">
          <span className="text-[10px] font-bold text-[#8C7D9E] uppercase tracking-wider block">
            Notes This Month
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-lg font-serif font-bold text-[#241930] dark:text-white">
              {monthNotes.length}
            </span>
            <span className="text-xs text-[#8C7D9E]">
              ({monthNotes.filter(n => n.completed).length} done)
            </span>
          </div>
        </div>
      </div>

      {/* Calendar Grid + Day Details Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Calendar (8 cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-[#1E1628] rounded-3xl p-5 border border-[#DDD7E8] dark:border-[#2C213B] shadow-xs">
          {/* Day of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-[#8C7D9E] uppercase pb-2 mb-2 border-b border-[#ECE6F3] dark:border-[#2D213D]">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {/* Blank leading days */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[72px] sm:min-h-[88px] opacity-0" />
            ))}

            {/* Days of month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${currentYear}-${String(activeMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isSelected = selectedDay === day;
              const dayIsToday = isToday(day);

              const dayBillsList = bills.filter(b => b.dueDay === day);
              const isPayDay = payDayOfMonth === day;
              const isNoSpend = (noSpendDates || []).includes(dateStr);
              const cellNotes = (calendarNotes || []).filter(n => n.date === dateStr);

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`min-h-[76px] sm:min-h-[92px] p-1.5 rounded-2xl border flex flex-col justify-between items-start transition-all relative group cursor-pointer text-left select-none ${
                    isSelected
                      ? 'border-[#4A3561] bg-[#F2EEF7] dark:bg-[#2C203B] shadow-xs ring-2 ring-[#4A3561]/25 font-bold'
                      : dayIsToday
                      ? 'border-[#8C7D9E] bg-[#FAF9FC] dark:bg-[#1A1223] ring-1 ring-purple-400/30'
                      : 'border-[#EDE8F4] dark:border-[#2C213D] hover:border-[#8C7D9E] bg-[#FAF9FC] dark:bg-[#181121]'
                  }`}
                >
                  {/* Top Bar inside cell: Day Number + Quick Add Button + No Spend */}
                  <div className="w-full flex items-center justify-between">
                    <span className={`text-[11px] font-mono leading-none ${
                      dayIsToday 
                        ? 'px-1.5 py-0.5 rounded-full bg-[#241930] text-white text-[9px] font-bold' 
                        : isSelected 
                        ? 'text-[#4A3561] dark:text-purple-300 font-bold' 
                        : 'text-[#241930] dark:text-white'
                    }`}>
                      {day}
                    </span>

                    <div className="flex items-center gap-1">
                      {/* No Spend Star */}
                      {isNoSpend && (
                        <span className="text-[10px] text-amber-500 leading-none" title="No-Spend Day">
                          ★
                        </span>
                      )}

                      {/* Hover '+' quick note trigger */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setModalDay(day);
                          setModalOpen(true);
                        }}
                        className="opacity-0 group-hover:opacity-100 hover:bg-[#4A3561] hover:text-white text-[#8C7D9E] p-0.5 rounded-md transition-all"
                        title={`Add note to day ${day}`}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Day Badges Stack: Payday -> Bills -> Notes */}
                  <div className="w-full space-y-0.5 mt-auto pt-1">
                    {/* Payday Badge */}
                    {isPayDay && (
                      <div className="px-1 py-0.5 rounded-md bg-emerald-500 text-white text-[8px] font-bold truncate flex items-center gap-0.5 shadow-2xs">
                        <span>💰</span>
                        <span className="truncate">Payday</span>
                      </div>
                    )}

                    {/* Bills Badges */}
                    {dayBillsList.slice(0, 1).map(b => (
                      <div key={b.id} className="px-1 py-0.5 rounded-md bg-rose-500/20 text-rose-700 dark:text-rose-300 text-[8px] font-semibold truncate border border-rose-300/40">
                        {b.name}
                      </div>
                    ))}

                    {/* Calendar Notes Badges */}
                    {cellNotes.slice(0, isPayDay || dayBillsList.length > 0 ? 1 : 2).map(n => {
                      const cfg = CATEGORY_CONFIG[n.category || 'reminder'];
                      return (
                        <div 
                          key={n.id} 
                          title={n.text}
                          className={`px-1 py-0.5 rounded-md ${cfg.bg} ${cfg.text} border ${cfg.border} text-[8px] font-medium truncate flex items-center gap-0.5 ${
                            n.completed ? 'line-through opacity-50' : ''
                          }`}
                        >
                          <span className="text-[7px] shrink-0">{cfg.icon}</span>
                          <span className="truncate">{n.text}</span>
                        </div>
                      );
                    })}

                    {/* Overflow badge if multiple notes/bills */}
                    {(cellNotes.length > (isPayDay || dayBillsList.length > 0 ? 1 : 2)) && (
                      <div className="text-[7.5px] font-semibold text-[#8C7D9E] dark:text-[#A798BC] px-1 leading-none">
                        +{cellNotes.length - (isPayDay || dayBillsList.length > 0 ? 1 : 2)} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Details Card (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-[#1E1628] rounded-3xl p-5 border border-[#DDD7E8] dark:border-[#2C213B] shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            {/* Selected Date Header */}
            <div className="border-b border-[#ECE6F3] dark:border-[#2D213D] pb-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#8C7D9E] uppercase tracking-wider block">
                  Selected Day
                </span>
                <h3 className="font-serif font-bold text-lg text-[#241930] dark:text-white flex items-center gap-2">
                  <span>{MONTH_NAMES[activeMonth]} {selectedDay}, {currentYear}</span>
                  {isToday(selectedDay) && (
                    <span className="px-2 py-0.5 rounded-full bg-[#241930] text-white text-[9px] font-mono font-bold">
                      Today
                    </span>
                  )}
                </h3>
              </div>

              <button
                onClick={() => setIsAddingNote(prev => !prev)}
                className="p-2 rounded-xl bg-[#EDE7F4] dark:bg-[#2C203B] hover:bg-[#E3DCED] text-[#4A3561] dark:text-purple-300 transition-colors"
                title={isAddingNote ? 'Close note input' : 'Add note to this day'}
              >
                {isAddingNote ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </button>
            </div>

            {/* Payday Notice */}
            {payDayOfMonth === selectedDay && (
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                <span>💰</span>
                <span>Expected Paycheck Deposit: {settings.currencySymbol}{paycheckConfig.expectedAmount.toFixed(2)}</span>
              </div>
            )}

            {/* SECTION: DAY NOTES & REMINDERS */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <StickyNote className="w-4 h-4 text-[#4A3561] dark:text-purple-300" />
                  <span className="text-xs font-bold text-[#241930] dark:text-white">
                    Day Notes & Reminders
                  </span>
                  {dayNotes.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-[#EDE7F4] dark:bg-[#2C203B] text-[#4A3561] dark:text-purple-300 font-bold text-[10px]">
                      {dayNotes.length}
                    </span>
                  )}
                </div>

                {!isAddingNote && (
                  <button
                    onClick={() => setIsAddingNote(true)}
                    className="text-[11px] font-bold text-[#4A3561] dark:text-purple-300 hover:underline flex items-center gap-0.5"
                  >
                    <Plus className="w-3 h-3" /> Add note
                  </button>
                )}
              </div>

              {/* Inline Add Note Form */}
              {isAddingNote && (
                <form onSubmit={handleAddNote} className="mb-3 p-3 rounded-2xl bg-[#FAF9FC] dark:bg-[#181121] border border-[#DDD5E6] dark:border-[#2C213D] space-y-2.5 animate-fade-in">
                  <div>
                    <input
                      type="text"
                      autoFocus
                      required
                      placeholder="e.g. Dentist 2pm, Cancel trial, Pick up keys..."
                      value={noteText}
                      onChange={e => setNoteText(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#221830] border border-[#DDD5E6] dark:border-[#382B4E] text-[#241930] dark:text-white placeholder-[#A092B3] focus:outline-hidden focus:ring-2 focus:ring-[#4A3561]"
                    />
                  </div>

                  {/* Category Pill Selectors */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {(Object.keys(CATEGORY_CONFIG) as CalendarNoteCategory[]).map(cat => {
                      const cfg = CATEGORY_CONFIG[cat];
                      const isCatSelected = noteCategory === cat;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setNoteCategory(cat)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 border ${
                            isCatSelected
                              ? `${cfg.bg} ${cfg.text} ${cfg.border} ring-1 ring-current`
                              : 'bg-white dark:bg-[#1A1223] text-[#7F7094] border-transparent hover:border-[#DDD5E6]'
                          }`}
                        >
                          <span>{cfg.icon}</span>
                          <span>{cfg.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddingNote(false)}
                      className="px-2.5 py-1 text-xs text-[#7F7094] hover:text-[#241930]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-xl bg-[#241930] dark:bg-[#4A3561] text-white font-bold text-xs shadow-xs hover:bg-black transition-colors"
                    >
                      Save to Day
                    </button>
                  </div>
                </form>
              )}

              {/* Notes List */}
              {dayNotes.length === 0 && !isAddingNote ? (
                <div 
                  onClick={() => setIsAddingNote(true)}
                  className="p-3.5 rounded-2xl border border-dashed border-[#DDD5E6] dark:border-[#2C213D] text-center cursor-pointer hover:bg-[#FAF9FC] dark:hover:bg-[#181121] transition-colors"
                >
                  <p className="text-xs text-[#8C7D9E] dark:text-[#A798BC]">
                    No notes for this date.
                  </p>
                  <span className="text-[11px] font-bold text-[#4A3561] dark:text-purple-300 mt-1 inline-block">
                    + Tap to add a reminder or to-do
                  </span>
                </div>
              ) : (
                <div className="space-y-2">
                  {dayNotes.map(n => {
                    const cfg = CATEGORY_CONFIG[n.category || 'reminder'];
                    const isEditing = editingNoteId === n.id;

                    if (isEditing) {
                      return (
                        <div key={n.id} className="p-2.5 rounded-xl bg-white dark:bg-[#1E1628] border border-[#4A3561] space-y-2 shadow-xs">
                          <input
                            type="text"
                            value={editingText}
                            onChange={e => setEditingText(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-[#FAF9FC] dark:bg-[#161020] border border-[#DDD5E6] text-[#241930] dark:text-white"
                            autoFocus
                          />
                          <div className="flex items-center justify-between">
                            <div className="flex gap-1 flex-wrap">
                              {(Object.keys(CATEGORY_CONFIG) as CalendarNoteCategory[]).map(cat => (
                                <button
                                  key={cat}
                                  type="button"
                                  onClick={() => setEditingCategory(cat)}
                                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                    editingCategory === cat ? 'bg-[#241930] text-white' : 'text-[#7F7094]'
                                  }`}
                                >
                                  {CATEGORY_CONFIG[cat].icon} {CATEGORY_CONFIG[cat].label}
                                </button>
                              ))}
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => setEditingNoteId(null)}
                                className="p-1 text-xs text-slate-400 hover:text-slate-600"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => saveEditing(n.id)}
                                className="p-1 px-2 rounded-lg bg-[#241930] text-white text-xs font-bold"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={n.id}
                        className={`p-2.5 rounded-xl border flex items-start justify-between gap-2 transition-all ${
                          n.completed
                            ? 'bg-[#F9F8FA] dark:bg-[#160F1E] border-[#ECE6F3] dark:border-[#251A31] opacity-75'
                            : `${cfg.bg} ${cfg.border}`
                        }`}
                      >
                        <div className="flex items-start gap-2 flex-1 min-w-0">
                          {/* Complete checkbox */}
                          <button
                            type="button"
                            onClick={() => handleToggleNote(n.id, n.completed)}
                            className={`mt-0.5 w-4 h-4 rounded-md flex items-center justify-center transition-all shrink-0 ${
                              n.completed
                                ? 'bg-[#4A3561] text-white'
                                : 'border border-[#8C7D9E] hover:border-[#4A3561] bg-white dark:bg-[#20162B]'
                            }`}
                            title={n.completed ? 'Mark undone' : 'Mark done'}
                          >
                            {n.completed && <Check className="w-3 h-3 stroke-[3]" />}
                          </button>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
                                {cfg.icon} {cfg.label}
                              </span>
                            </div>
                            <p className={`text-xs break-words ${
                              n.completed
                                ? 'line-through text-[#8C7D9E] dark:text-[#7A6B8E]'
                                : 'text-[#241930] dark:text-white font-medium'
                            }`}>
                              {n.text}
                            </p>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1 shrink-0 opacity-80 hover:opacity-100">
                          <button
                            onClick={() => startEditing(n)}
                            className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5 text-[#8C7D9E] hover:text-[#241930]"
                            title="Edit note"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => deleteCalendarNote(n.id)}
                            className="p-1 rounded-md hover:bg-rose-500/10 text-[#8C7D9E] hover:text-rose-500"
                            title="Delete note"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bills due on this day */}
            <div className="pt-2 border-t border-[#ECE6F3] dark:border-[#2D213D]">
              <span className="text-xs font-bold text-[#5F4E75] dark:text-[#A798BC] block mb-2">
                Bills Due on {MONTH_NAMES[activeMonth]} {selectedDay} ({dayBills.length})
              </span>
              {dayBills.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No bills due on this date.</p>
              ) : (
                <div className="space-y-1.5">
                  {dayBills.map(b => (
                    <div key={b.id} className="p-2.5 rounded-xl bg-[#FAF9FC] dark:bg-[#181121] border border-[#ECE6F3] dark:border-[#2E223E] flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-[#241930] dark:text-white block">{b.name}</span>
                        <span className="text-[10px] text-[#8C7D9E]">{b.autoPay ? 'AutoPay' : 'Manual'}</span>
                      </div>
                      <span className="font-mono font-bold text-[#241930] dark:text-white">
                        {settings.currencySymbol}{b.amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Transactions on this day */}
            <div className="pt-2 border-t border-[#ECE6F3] dark:border-[#2D213D]">
              <span className="text-xs font-bold text-[#5F4E75] dark:text-[#A798BC] block mb-2">
                Logged Purchases ({dayTransactions.length})
              </span>
              {dayTransactions.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Nothing spent on this date.</p>
              ) : (
                <div className="space-y-1.5">
                  {dayTransactions.map(t => (
                    <div key={t.id} className="p-2 rounded-xl bg-[#FAF9FC] dark:bg-[#181121] border border-[#ECE6F3] dark:border-[#2E223E] flex items-center justify-between text-xs">
                      <span className="font-medium text-[#241930] dark:text-white truncate max-w-[160px]">{t.description}</span>
                      <span className="font-mono font-bold text-[#241930] dark:text-white">
                        {settings.currencySymbol}{t.amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-[#ECE6F3] dark:border-[#2D213D] mt-4">
            <span className="text-[11px] text-[#8C7D9E] font-serif italic text-center block">
              Consistency over perfection.
            </span>
          </div>
        </div>
      </div>

      {/* Quick Add Note Modal (accessible from "+" icon on days or top header) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-[#1E1628] w-full max-w-md rounded-3xl p-6 shadow-2xl border border-[#DDD7E8] dark:border-[#2C213B] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📝</span>
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#241930] dark:text-white">
                    Add Note for {MONTH_NAMES[activeMonth]} {modalDay}
                  </h3>
                  <p className="text-xs text-[#8C7D9E]">
                    Jot down an appointment, reminder, or ADHD to-do
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveModalNote} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#5F4E75] dark:text-[#A798BC] mb-1">
                  Day of Month
                </label>
                <select
                  value={modalDay}
                  onChange={e => setModalDay(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[#FAF9FC] dark:bg-[#181121] border border-[#DDD5E6] dark:border-[#2C213D] text-[#241930] dark:text-white font-mono font-bold"
                >
                  {Array.from({ length: daysInMonth }).map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {MONTH_NAMES[activeMonth]} {i + 1}, {currentYear} {isToday(i + 1) ? '(Today)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5F4E75] dark:text-[#A798BC] mb-1">
                  Note / Reminder Text
                </label>
                <textarea
                  required
                  autoFocus
                  rows={3}
                  placeholder="e.g. Call dentist at 2pm, Cancel gym subscription before renewal, Bring tax documents..."
                  value={modalText}
                  onChange={e => setModalText(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[#FAF9FC] dark:bg-[#181121] border border-[#DDD5E6] dark:border-[#2C213D] text-[#241930] dark:text-white placeholder-[#A092B3] focus:outline-hidden focus:ring-2 focus:ring-[#4A3561]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5F4E75] dark:text-[#A798BC] mb-1.5">
                  Category Tag
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(Object.keys(CATEGORY_CONFIG) as CalendarNoteCategory[]).map(cat => {
                    const cfg = CATEGORY_CONFIG[cat];
                    const isSelected = modalCategory === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setModalCategory(cat)}
                        className={`p-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? `${cfg.bg} ${cfg.text} ${cfg.border} ring-2 ring-current`
                            : 'bg-[#FAF9FC] dark:bg-[#181121] text-[#7F7094] border-transparent hover:border-[#DDD5E6]'
                        }`}
                      >
                        <span>{cfg.icon}</span>
                        <span>{cfg.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#ECE6F3] dark:border-[#2D213D]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl bg-[#241930] dark:bg-[#4A3561] text-white font-bold text-xs shadow-xs hover:bg-black transition-colors"
                >
                  Save Note to Calendar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
