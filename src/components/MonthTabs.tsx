import React from 'react';
import { useBudget } from '../context/BudgetContext';

const MONTHS = [
  { label: 'JAN', color: '#E8C8C8', text: '#4B3642' },
  { label: 'FEB', color: '#E5C5B5', text: '#4E3628' },
  { label: 'MAR', color: '#BBD5C4', text: '#2A4434' },
  { label: 'APR', color: '#B9D8DC', text: '#274348' },
  { label: 'MAY', color: '#E4DAA8', text: '#494220' },
  { label: 'JUN', color: '#E3BACB', text: '#4C2837' },
  { label: 'JUL', color: '#C1D6E2', text: '#264251' },
  { label: 'AUG', color: '#BEDAD2', text: '#26463E' },
  { label: 'SEP', color: '#A7D4C2', text: '#1E4334' },
  { label: 'OCT', color: '#E0B693', text: '#4E2F17' },
  { label: 'NOV', color: '#4A3561', text: '#FFFFFF' },
  { label: 'DEC', color: '#96B0BC', text: '#213742' },
];

export const MonthTabs: React.FC = () => {
  const { activeMonth, setActiveMonth } = useBudget();

  return (
    <div className="fixed top-0 bottom-0 right-0 z-30 flex flex-col justify-between py-1 w-8 sm:w-10 select-none pointer-events-auto">
      {MONTHS.map((m, idx) => {
        const isActive = activeMonth === idx;
        return (
          <button
            key={m.label}
            onClick={() => setActiveMonth(idx)}
            style={{
              backgroundColor: isActive ? '#4A3561' : m.color,
              color: isActive ? '#FFFFFF' : m.text,
            }}
            className={`flex-1 flex items-center justify-center text-[9px] sm:text-[10px] font-bold tracking-wider rounded-l-xl transition-all duration-200 border-l border-t border-b border-white/40 shadow-xs ${
              isActive
                ? 'w-9 sm:w-11 -ml-1 sm:-ml-1.5 shadow-md font-black z-20 scale-y-105'
                : 'hover:w-9 hover:-ml-1 opacity-90 hover:opacity-100 z-10'
            }`}
            title={`Switch to ${m.label}`}
          >
            <span className="rotate-90 block transform origin-center uppercase font-mono">
              {m.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

