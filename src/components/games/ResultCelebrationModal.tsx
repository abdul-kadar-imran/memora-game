import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Award, ArrowLeft, RotateCcw, Sparkles, Trophy } from 'lucide-react';
import { useMemoraStore } from '../../hooks/useMemoraStore';
import { SessionRecordResult } from '../../types/memora';

interface ResultMetric {
  label: string;
  value: string;
  accent?: 'cyan' | 'purple' | 'emerald' | 'default';
}

interface ResultCelebrationModalProps {
  title: string;
  subtitle: string;
  score: number;
  isNewBest?: boolean;
  metrics: ResultMetric[];
  sessionResult: SessionRecordResult | null;
  primaryActionLabel?: string;
  onPrimaryAction: () => void;
  onBackToArena: () => void;
}

export const ResultCelebrationModal: React.FC<ResultCelebrationModalProps> = ({
  title,
  subtitle,
  score,
  isNewBest = false,
  metrics,
  sessionResult,
  primaryActionLabel = 'Play Again',
  onPrimaryAction,
  onBackToArena,
}) => {
  const { stats } = useMemoraStore();
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    let rafId = 0;
    const duration = 650;
    const start = performance.now();

    const step = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(score * eased));
      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      }
    };
    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [score]);

  const xpEarned = sessionResult?.session.xpEarned ?? 0;
  const leveledUp = sessionResult?.leveledUp ?? false;
  const newlyUnlocked = sessionResult?.newlyUnlockedAchievements ?? [];
  const levelProgressPct = Math.round(
    (stats.xpInLevel / stats.xpForNextLevel) * 100
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#20213A]/55 dark:bg-[#090B18]/80 px-4 py-6 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="result-modal-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg rounded-3xl border border-[#8056E8]/30 dark:border-[#9B7BFF]/35 bg-[#FFFFFF] dark:bg-[#11152A] p-6 sm:p-7 shadow-[0_24px_80px_rgba(32,33,58,0.22)] dark:shadow-[0_24px_80px_rgba(9,11,24,0.85)]"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-[#477BFF] dark:text-[#55D9FF]">
              {subtitle}
            </p>
            <h2
              id="result-modal-title"
              className="mt-1 text-2xl font-extrabold text-[#20213A] dark:text-[#F5F5FF]"
            >
              {title}
            </h2>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#8056E8]/30 dark:border-[#9B7BFF]/40 bg-[#EFECFF] dark:bg-[#171C35] text-[#8056E8] dark:text-[#9B7BFF] shrink-0">
            <Trophy className="h-6 w-6" aria-hidden="true" />
          </div>
        </div>

        {/* Score Showcase */}
        <div className="mt-5 rounded-2xl border border-[#8056E8]/15 dark:border-white/10 bg-[#EFECFF]/70 dark:bg-[#171C35] p-5 text-center">
          <div className="text-xs font-medium text-[#5E6282] dark:text-[#929BB8]">
            Total Score
          </div>
          <div className="mt-1 font-mono-tabular text-4xl sm:text-5xl font-extrabold text-[#20213A] dark:text-[#F5F5FF]">
            {animatedScore.toLocaleString()}
          </div>
          {isNewBest && (
            <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[#25B985] dark:text-[#37D99A]">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              <span>New Personal Best</span>
            </div>
          )}
        </div>

        {/* Metrics Grid */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {metrics.map((m) => {
            const colorClass =
              m.accent === 'cyan'
                ? 'text-[#477BFF] dark:text-[#55D9FF]'
                : m.accent === 'purple'
                  ? 'text-[#8056E8] dark:text-[#9B7BFF]'
                  : m.accent === 'emerald'
                    ? 'text-[#25B985] dark:text-[#37D99A]'
                    : 'text-[#20213A] dark:text-[#F5F5FF]';
            return (
              <div
                key={m.label}
                className="rounded-xl border border-[#8056E8]/15 dark:border-white/10 bg-[#F8F7FF] dark:bg-[#171C35]/70 px-3.5 py-3"
              >
                <div className="text-[11px] font-medium text-[#5E6282] dark:text-[#929BB8]">
                  {m.label}
                </div>
                <div
                  className={`mt-1 font-mono-tabular text-base sm:text-lg font-bold ${colorClass}`}
                >
                  {m.value}
                </div>
              </div>
            );
          })}
        </div>

        {/* XP & Level Progress */}
        <div className="mt-4 rounded-2xl border border-[#477BFF]/25 dark:border-[#527BFF]/30 bg-[#EFECFF]/65 dark:bg-[#171C35] p-4">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="font-semibold text-[#20213A] dark:text-[#F5F5FF]">
              Level {stats.level}
            </span>
            <span className="font-mono-tabular font-bold text-[#477BFF] dark:text-[#55D9FF]">
              +{xpEarned} XP Earned
            </span>
          </div>

          <div className="mt-2.5 h-2.5 w-full overflow-hidden rounded-full bg-[#FFFFFF] dark:bg-[#090B18]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${levelProgressPct}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-[#8056E8] via-[#477BFF] to-[#35C8E8] dark:from-[#9B7BFF] dark:via-[#527BFF] dark:to-[#55D9FF]"
            />
          </div>

          <div className="mt-1.5 flex items-center justify-between text-[11px] text-[#5E6282] dark:text-[#929BB8]">
            <span className="font-mono-tabular">
              {stats.xpInLevel} / {stats.xpForNextLevel} XP
            </span>
            <span className="font-mono-tabular">
              {stats.xpRemaining} XP to Level {stats.level + 1}
            </span>
          </div>

          {leveledUp && sessionResult && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 rounded-xl border border-[#25B985]/40 dark:border-[#37D99A]/40 bg-[#25B985]/10 dark:bg-[#37D99A]/10 px-3 py-2 text-center text-xs font-bold text-[#25B985] dark:text-[#37D99A]"
            >
              Level Up! Reached Level {sessionResult.newLevel}
            </motion.div>
          )}
        </div>

        {/* Newly Unlocked Achievements */}
        {newlyUnlocked.length > 0 && (
          <div className="mt-4 space-y-2">
            <div className="text-xs font-semibold text-[#5E6282] dark:text-[#929BB8]">
              Achievements Unlocked
            </div>
            {newlyUnlocked.map((ach) => (
              <motion.div
                key={ach.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 rounded-xl border border-[#8056E8]/35 dark:border-[#9B7BFF]/45 bg-[#EFECFF]/70 dark:bg-[#171C35] px-3.5 py-2.5"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#8056E8]/15 dark:bg-[#9B7BFF]/20 text-[#8056E8] dark:text-[#9B7BFF] shrink-0">
                  <Award className="h-4 w-4" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-xs font-bold text-[#20213A] dark:text-[#F5F5FF]">
                    {ach.title}
                  </div>
                  <div className="truncate text-[11px] text-[#5E6282] dark:text-[#929BB8]">
                    {ach.description}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex flex-col-reverse sm:flex-row gap-3">
          <button
            type="button"
            onClick={onBackToArena}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-[#8056E8]/20 dark:border-white/15 bg-[#EFECFF] dark:bg-[#171C35] px-4 text-sm font-semibold text-[#20213A] dark:text-[#F5F5FF] hover:border-[#8056E8]/60 dark:hover:border-[#9B7BFF]/60 transition-colors whitespace-nowrap"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Back to Arena</span>
          </button>

          <button
            type="button"
            onClick={onPrimaryAction}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#8056E8] to-[#477BFF] dark:from-[#9B7BFF] dark:to-[#527BFF] px-5 text-sm font-bold text-white shadow-[0_8px_24px_rgba(71,123,255,0.3)] dark:shadow-[0_8px_24px_rgba(82,123,255,0.35)] hover:brightness-110 transition-all whitespace-nowrap"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            <span>{primaryActionLabel}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
