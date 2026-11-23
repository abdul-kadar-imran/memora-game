import React from 'react';
import { ArrowLeft, RotateCcw } from 'lucide-react';

interface GameHeaderProps {
  modeTitle: string;
  indicatorLabel: string;
  timerText?: string;
  timerUrgent?: boolean;
  score: number;
  onRestart: () => void;
  onBack: () => void;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  modeTitle,
  indicatorLabel,
  timerText,
  timerUrgent = false,
  score,
  onRestart,
  onBack,
}) => {
  return (
    <div className="rounded-2xl border border-[#8056E8]/15 dark:border-white/10 bg-[#FFFFFF]/95 dark:bg-[#11152A]/90 px-3.5 py-2.5 sm:px-4 sm:py-3 backdrop-blur-md shadow-xs dark:shadow-none transition-colors duration-200">
      <div className="flex flex-col sm:flex-row lg:flex-col sm:items-center lg:items-stretch justify-between gap-2.5">
        {/* Top Row: Back, Title, Quick Restart (Mobile & Desktop Left Panel) */}
        <div className="flex items-center justify-between gap-2.5 min-w-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={onBack}
              className="flex h-9 items-center gap-1.5 rounded-xl border border-[#8056E8]/20 dark:border-white/10 bg-[#EFECFF] dark:bg-[#171C35] px-2.5 text-xs font-medium text-[#5E6282] dark:text-[#929BB8] hover:border-[#8056E8]/55 dark:hover:border-[#9B7BFF]/50 hover:text-[#20213A] dark:hover:text-[#F5F5FF] transition-colors whitespace-nowrap shrink-0"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Modes</span>
            </button>

            <div className="min-w-0">
              <h1 className="truncate text-sm sm:text-base font-bold text-[#20213A] dark:text-[#F5F5FF]">
                {modeTitle}
              </h1>
              <p className="truncate text-[11px] text-[#5E6282] dark:text-[#929BB8]">
                {indicatorLabel}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onRestart}
            aria-label="Restart game"
            title="Restart"
            className="flex sm:hidden lg:flex h-9 w-9 items-center justify-center rounded-xl border border-[#477BFF]/35 dark:border-[#527BFF]/40 bg-[#EFECFF] dark:bg-[#171C35] text-[#477BFF] dark:text-[#55D9FF] hover:border-[#35C8E8] dark:hover:border-[#55D9FF] hover:bg-[#E4DFFF] dark:hover:bg-[#1E2546] transition-colors shrink-0"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Bottom Row: Timer, Score, Tablet Restart */}
        <div className="flex items-center justify-between gap-4 border-t border-[#8056E8]/10 dark:border-white/5 pt-2 sm:border-t-0 sm:pt-0 lg:border-t lg:border-[#8056E8]/10 lg:dark:border-white/5 lg:pt-2.5">
          {timerText !== undefined && (
            <div className="flex sm:block lg:flex items-baseline gap-2 sm:text-right lg:text-left">
              <div className="text-[11px] font-medium text-[#5E6282] dark:text-[#929BB8]">
                Timer
              </div>
              <div
                className={`font-mono-tabular text-base sm:text-lg font-bold ${
                  timerUrgent
                    ? 'text-[#E11D48] dark:text-[#FF5D78]'
                    : 'text-[#477BFF] dark:text-[#55D9FF]'
                }`}
              >
                {timerText}
              </div>
            </div>
          )}

          <div className="flex sm:block lg:flex items-baseline gap-2 sm:text-right lg:text-right ml-auto sm:ml-0 lg:ml-auto">
            <div className="text-[11px] font-medium text-[#5E6282] dark:text-[#929BB8]">
              Score
            </div>
            <div className="font-mono-tabular text-base sm:text-lg font-bold text-[#20213A] dark:text-[#F5F5FF]">
              {score.toLocaleString()}
            </div>
          </div>

          <button
            type="button"
            onClick={onRestart}
            className="hidden sm:flex lg:hidden h-9 items-center gap-2 rounded-xl border border-[#477BFF]/35 dark:border-[#527BFF]/40 bg-[#EFECFF] dark:bg-[#171C35] px-3.5 text-xs font-semibold text-[#20213A] dark:text-[#F5F5FF] hover:border-[#35C8E8] dark:hover:border-[#55D9FF] hover:bg-[#E4DFFF] dark:hover:bg-[#1E2546] transition-colors whitespace-nowrap shrink-0"
          >
            <RotateCcw
              className="h-3.5 w-3.5 text-[#477BFF] dark:text-[#55D9FF]"
              aria-hidden="true"
            />
            <span>Restart</span>
          </button>
        </div>
      </div>
    </div>
  );
};
