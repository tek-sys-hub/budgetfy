import React from 'react';
import { Sparkles, Trophy, Star, Plus, CheckCircle2 } from 'lucide-react';
import { useBudget } from '../../context/BudgetContext';

export const MilestonesView: React.FC = () => {
  const { 
    challenges, 
    toggleChallengeStep, 
    addChallenge,
    noSpendDates, 
    toggleNoSpendToday, 
    settings,
    triggerConfetti 
  } = useBudget();

  const todayStr = new Date().toISOString().split('T')[0];
  const isNoSpendToday = (noSpendDates || []).includes(todayStr);

  return (
    <div className="space-y-6 pb-24 md:pb-12 max-w-6xl mx-auto">
      {/* Title */}
      <div className="bg-white dark:bg-[#1E1628] rounded-3xl p-6 border border-[#DDD7E8] dark:border-[#2C213B] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏆</span>
            <h2 className="text-2xl font-serif font-bold text-[#241930] dark:text-white">
              Milestones & Dopamine Challenges
            </h2>
          </div>
          <p className="text-xs text-[#7F7094] dark:text-[#A798BC] mt-1">
            Inspired by Etsy color-in savings sheets: tap each bubble to color it in as you save!
          </p>
        </div>

        {/* No Spend Today Dopamine Button */}
        <button
          onClick={toggleNoSpendToday}
          className={`py-3 px-5 rounded-2xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all active:scale-95 ${
            isNoSpendToday
              ? 'bg-amber-400 text-amber-950 ring-4 ring-amber-300/40'
              : 'bg-[#241930] hover:bg-[#3C2A52] text-white'
          }`}
        >
          <Star className={`w-4 h-4 ${isNoSpendToday ? 'fill-amber-950 text-amber-950' : 'text-amber-400'}`} />
          <span>{isNoSpendToday ? '⭐ No-Spend Day Logged Today!' : '+ Log No-Spend Day Today'}</span>
        </button>
      </div>

      {/* No Spend Streak Counter */}
      <div className="bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl p-4 border border-amber-300/60 dark:border-amber-800/40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🌟</span>
          <div>
            <div className="text-xs font-bold text-[#241930] dark:text-white">
              Total No-Spend Days This Month: {(noSpendDates || []).length} days
            </div>
            <div className="text-[11px] text-[#7F7094] dark:text-[#A798BC]">
              Every zero-spend day protects your Safe-to-Spend allowance!
            </div>
          </div>
        </div>
        <div className="font-serif font-bold text-xl text-amber-600 dark:text-amber-400">
          {(noSpendDates || []).length} ★
        </div>
      </div>

      {/* Interactive Color-in Savings Challenges */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-serif font-bold text-lg text-[#241930] dark:text-white">
            Visual Color-In Trackers
          </h3>
        </div>

        {(challenges || []).length === 0 ? (
          <div className="bg-white dark:bg-[#1E1628] rounded-3xl p-8 border border-[#DDD7E8] dark:border-[#2C213B] shadow-xs text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center text-2xl mx-auto mb-3">
              🎨
            </div>
            <h4 className="font-serif font-bold text-lg text-[#241930] dark:text-white mb-1">
              Start an ADHD Color-In Challenge
            </h4>
            <p className="text-xs text-[#7F7094] dark:text-[#A798BC] max-w-md mx-auto mb-5 leading-relaxed">
              Coloring in each bubble as you save gives your brain quick visual dopamine hits. Pick a challenge below to begin:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto">
              <button
                onClick={() => addChallenge({
                  name: '$100 Quick Cushion',
                  icon: '⚡',
                  totalTarget: 100,
                  stepValue: 10,
                  totalSteps: 10,
                  color: '#8B5CF6'
                })}
                className="p-4 rounded-2xl bg-[#FAF9FC] dark:bg-[#251A33] border border-[#ECE6F3] dark:border-[#38284C] hover:border-purple-500 text-left transition-all active:scale-95"
              >
                <div className="text-xl mb-1">⚡</div>
                <div className="font-bold text-xs text-[#241930] dark:text-white">$100 Starter Cushion</div>
                <div className="text-[10px] text-[#8C7D9E] mt-0.5">10 bubbles × {settings.currencySymbol}10</div>
              </button>

              <button
                onClick={() => addChallenge({
                  name: '$250 Weekend Buffer',
                  icon: '🛡️',
                  totalTarget: 250,
                  stepValue: 25,
                  totalSteps: 10,
                  color: '#10B981'
                })}
                className="p-4 rounded-2xl bg-[#FAF9FC] dark:bg-[#251A33] border border-[#ECE6F3] dark:border-[#38284C] hover:border-emerald-500 text-left transition-all active:scale-95"
              >
                <div className="text-xl mb-1">🛡️</div>
                <div className="font-bold text-xs text-[#241930] dark:text-white">$250 Weekend Buffer</div>
                <div className="text-[10px] text-[#8C7D9E] mt-0.5">10 bubbles × {settings.currencySymbol}25</div>
              </button>

              <button
                onClick={() => addChallenge({
                  name: '$500 Debt Smasher',
                  icon: '🔥',
                  totalTarget: 500,
                  stepValue: 25,
                  totalSteps: 20,
                  color: '#EF4444'
                })}
                className="p-4 rounded-2xl bg-[#FAF9FC] dark:bg-[#251A33] border border-[#ECE6F3] dark:border-[#38284C] hover:border-rose-500 text-left transition-all active:scale-95"
              >
                <div className="text-xl mb-1">🔥</div>
                <div className="font-bold text-xs text-[#241930] dark:text-white">$500 Debt Smasher</div>
                <div className="text-[10px] text-[#8C7D9E] mt-0.5">20 bubbles × {settings.currencySymbol}25</div>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {(challenges || []).map(chal => {
            const currentSaved = chal.completedSteps * chal.stepValue;
            const percent = Math.round((chal.completedSteps / chal.totalSteps) * 100);
            const isCompleted = chal.completedSteps >= chal.totalSteps;

            return (
              <div
                key={chal.id}
                className="bg-white dark:bg-[#1E1628] rounded-3xl p-5 border border-[#DDD7E8] dark:border-[#2C213B] shadow-xs flex flex-col justify-between relative overflow-hidden"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{chal.icon}</span>
                    <span className="text-xs font-mono font-bold text-[#8C7D9E]">
                      {settings.currencySymbol}{currentSaved} / {settings.currencySymbol}{chal.totalTarget}
                    </span>
                  </div>

                  <h4 className="font-serif font-bold text-base text-[#241930] dark:text-white">
                    {chal.name}
                  </h4>
                  <p className="text-[11px] text-[#8C7D9E] mb-3">
                    Each bubble = {settings.currencySymbol}{chal.stepValue} saved
                  </p>

                  {/* Interactive Bubbles Grid */}
                  <div className="grid grid-cols-5 gap-2 my-3 p-3 bg-[#FAF9FC] dark:bg-[#181121] rounded-2xl border border-[#ECE6F3] dark:border-[#2E223E]">
                    {Array.from({ length: chal.totalSteps }).map((_, idx) => {
                      const isFilled = idx < chal.completedSteps;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => toggleChallengeStep(chal.id)}
                          className={`w-full aspect-square rounded-xl border flex items-center justify-center text-[10px] font-bold font-mono transition-all transform active:scale-90 ${
                            isFilled
                              ? 'bg-[#4A3561] text-white border-[#4A3561] shadow-xs scale-102'
                              : 'bg-white dark:bg-[#221731] border-[#DDD5E6] dark:border-[#3A2B4E] text-[#8C7D9E] hover:border-[#4A3561]'
                          }`}
                          title={`Tap to toggle step ${idx + 1}`}
                        >
                          {isFilled ? '✓' : settings.currencySymbol + chal.stepValue}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#66557B] dark:text-[#A798BC]">
                    {percent}% colored in
                  </span>
                  <button
                    onClick={() => toggleChallengeStep(chal.id)}
                    className="text-xs font-bold text-[#4A3561] dark:text-purple-300 underline"
                  >
                    + Color in 1 sticker
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        )}
      </div>
    </div>
  );
};

