import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Clock, Eye, Grid2x2, Zap } from 'lucide-react';
import { DisappearingMemoryGame } from '../components/games/DisappearingMemoryGame';
import { NormalMemoryGame } from '../components/games/NormalMemoryGame';
import { TimeAttackGame } from '../components/games/TimeAttackGame';
import { useMemoraStore } from '../hooks/useMemoraStore';
import { GameMode } from '../types/memora';
import { formatDurationShort } from '../utils/gameLogic';

const ARENA_BACKDROP_URL =
  '/src/assets/images/memora_arena_backdrop_1795422773591.jpg';

export const GameArenaPage: React.FC = () => {
  const { data, stats } = useMemoraStore();
  const [activeMode, setActiveMode] = useState<GameMode | null>(null);
  const [backdropFailed, setBackdropFailed] = useState(false);

  if (activeMode === 'normal') {
    return (
      <section className="mx-auto max-w-7xl px-3 py-2.5 sm:py-3.5 sm:px-6 lg:px-8 lg:min-h-[calc(100dvh-4rem)] lg:flex lg:items-center">
        <div className="w-full">
          <NormalMemoryGame onBack={() => setActiveMode(null)} />
        </div>
      </section>
    );
  }

  if (activeMode === 'time-attack') {
    return (
      <section className="mx-auto max-w-7xl px-3 py-2.5 sm:py-3.5 sm:px-6 lg:px-8 lg:min-h-[calc(100dvh-4rem)] lg:flex lg:items-center">
        <div className="w-full">
          <TimeAttackGame onBack={() => setActiveMode(null)} />
        </div>
      </section>
    );
  }

  if (activeMode === 'disappearing') {
    return (
      <section className="mx-auto max-w-7xl px-3 py-2.5 sm:py-3.5 sm:px-6 lg:px-8 lg:min-h-[calc(100dvh-4rem)] lg:flex lg:items-center">
        <div className="w-full">
          <DisappearingMemoryGame onBack={() => setActiveMode(null)} />
        </div>
      </section>
    );
  }

  const normalBestOverall = Math.max(
    data.bestScores.normal.easy.bestScore,
    data.bestScores.normal.medium.bestScore,
    data.bestScores.normal.hard.bestScore
  );

  return (
    <section className="mx-auto max-w-7xl px-3.5 py-4 sm:py-8 sm:px-6 lg:px-8">
      {/* Arena Hero Stage */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
        className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-[#8056E8]/20 dark:border-white/10 bg-[#EFECFF] dark:bg-[#11152A] shadow-sm dark:shadow-none"
      >
        {/* Atmospheric Backdrop Image with Resilient Fallback */}
        {!backdropFailed && (
          <img
            src={ARENA_BACKDROP_URL}
            alt="MEMORA futuristic geometric arena table"
            referrerPolicy="no-referrer"
            onError={() => setBackdropFailed(true)}
            className="absolute inset-0 h-full w-full object-cover opacity-15 dark:opacity-45"
          />
        )}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-[#F8F7FF]/95 via-[#F8F7FF]/88 to-[#EFECFF]/75 dark:from-[#090B18]/95 dark:via-[#090B18]/80 dark:to-[#11152A]/65"
        />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-4 sm:gap-6 p-5 sm:p-10">
          <div className="max-w-2xl">
            <p className="text-xs sm:text-sm font-semibold text-[#477BFF] dark:text-[#55D9FF]">
              Cognitive Training Arena
            </p>
            <h1 className="mt-1.5 sm:mt-2 text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#20213A] dark:text-[#F5F5FF] [text-wrap:balance]">
              Sharpen Your Mind. One Move at a Time.
            </h1>
            <p className="mt-2 sm:mt-3 text-xs sm:text-base text-[#5E6282] dark:text-[#929BB8] max-w-xl leading-relaxed">
              Choose a memory discipline below to start playing immediately.
              Every completed round awards XP, tracks accuracy, and unlocks
              milestones.
            </p>
          </div>

          {/* Player Snapshot */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 rounded-2xl border border-[#8056E8]/15 dark:border-white/10 bg-[#FFFFFF]/85 dark:bg-[#11152A]/85 p-3.5 sm:p-4 backdrop-blur-md shrink-0 text-center sm:text-left shadow-xs dark:shadow-none">
            <div>
              <div className="text-[11px] font-medium text-[#5E6282] dark:text-[#929BB8]">
                Level
              </div>
              <div className="mt-0.5 font-mono-tabular text-base sm:text-xl font-extrabold text-[#8056E8] dark:text-[#9B7BFF]">
                {stats.level}
              </div>
            </div>
            <div>
              <div className="text-[11px] font-medium text-[#5E6282] dark:text-[#929BB8]">
                Total XP
              </div>
              <div className="mt-0.5 font-mono-tabular text-base sm:text-xl font-extrabold text-[#477BFF] dark:text-[#55D9FF]">
                {data.totalXP.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-[11px] font-medium text-[#5E6282] dark:text-[#929BB8]">
                Streak
              </div>
              <div className="mt-0.5 font-mono-tabular text-base sm:text-xl font-extrabold text-[#25B985] dark:text-[#37D99A]">
                {data.streak.current}d
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Three Distinct Mode Selection Cards */}
      <div className="mt-5 sm:mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
        {/* Mode 1: Normal Memory Match */}
        <motion.article
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.26, delay: 0.04 }}
          className="group flex flex-col justify-between rounded-3xl border border-[#8056E8]/25 dark:border-[#9B7BFF]/30 bg-[#FFFFFF] dark:bg-[#171C35] p-6 shadow-xs dark:shadow-none transition-all duration-200 hover:border-[#8056E8]/65 dark:hover:border-[#9B7BFF]/75 hover:shadow-[0_12px_32px_rgba(128,86,232,0.14)] dark:hover:shadow-[0_12px_36px_rgba(155,123,255,0.16)]"
        >
          <div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#8056E8]/12 dark:bg-[#9B7BFF]/15 text-[#8056E8] dark:text-[#9B7BFF]">
                <Grid2x2 className="h-6 w-6" aria-hidden="true" />
              </div>
              <span className="text-xs font-medium text-[#5E6282] dark:text-[#929BB8]">
                4×4 · 6×4 · 6×6
              </span>
            </div>

            <h2 className="mt-5 text-xl font-bold text-[#20213A] dark:text-[#F5F5FF]">
              Normal Memory Match
            </h2>
            <p className="mt-2 text-sm text-[#5E6282] dark:text-[#929BB8] leading-relaxed">
              Classic card-flipping mastery across three grid sizes. Match
              everyday icons in as few moves and seconds as possible.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3 border-t border-[#8056E8]/12 dark:border-white/10 pt-4 text-xs">
              <div>
                <div className="text-[#5E6282] dark:text-[#929BB8]">
                  Best Score
                </div>
                <div className="mt-0.5 font-mono-tabular text-sm font-bold text-[#20213A] dark:text-[#F5F5FF]">
                  {normalBestOverall > 0
                    ? normalBestOverall.toLocaleString()
                    : '—'}
                </div>
              </div>
              <div>
                <div className="text-[#5E6282] dark:text-[#929BB8]">
                  Fastest Clear
                </div>
                <div className="mt-0.5 font-mono-tabular text-sm font-bold text-[#25B985] dark:text-[#37D99A]">
                  {stats.bestNormalTimeSeconds !== null
                    ? formatDurationShort(stats.bestNormalTimeSeconds)
                    : '—'}
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveMode('normal')}
            className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#8056E8] dark:bg-[#9B7BFF] px-5 text-sm font-bold text-white dark:text-[#090B18] transition-all hover:brightness-110"
          >
            <span>Play Normal Match</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </motion.article>

        {/* Mode 2: Time Attack */}
        <motion.article
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.26, delay: 0.08 }}
          className="group flex flex-col justify-between rounded-3xl border border-[#35C8E8]/35 dark:border-[#55D9FF]/30 bg-[#FFFFFF] dark:bg-[#171C35] p-6 shadow-xs dark:shadow-none transition-all duration-200 hover:border-[#35C8E8]/75 dark:hover:border-[#55D9FF]/75 hover:shadow-[0_12px_32px_rgba(53,200,232,0.16)] dark:hover:shadow-[0_12px_36px_rgba(85,217,255,0.16)]"
        >
          <div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#35C8E8]/15 dark:bg-[#55D9FF]/15 text-[#0891B2] dark:text-[#55D9FF]">
                <Zap className="h-6 w-6" aria-hidden="true" />
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-[#5E6282] dark:text-[#929BB8]">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                <span>60s Sprint</span>
              </span>
            </div>

            <h2 className="mt-5 text-xl font-bold text-[#20213A] dark:text-[#F5F5FF]">
              Time Attack
            </h2>
            <p className="mt-2 text-sm text-[#5E6282] dark:text-[#929BB8] leading-relaxed">
              Race a 60-second clock with unlimited flips. Stack consecutive
              matches to climb combo multipliers from +100 up to +300 per pair.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3 border-t border-[#8056E8]/12 dark:border-white/10 pt-4 text-xs">
              <div>
                <div className="text-[#5E6282] dark:text-[#929BB8]">
                  Personal Best
                </div>
                <div className="mt-0.5 font-mono-tabular text-sm font-bold text-[#20213A] dark:text-[#F5F5FF]">
                  {data.bestScores.timeAttack.bestScore > 0
                    ? data.bestScores.timeAttack.bestScore.toLocaleString()
                    : '—'}
                </div>
              </div>
              <div>
                <div className="text-[#5E6282] dark:text-[#929BB8]">
                  Best Combo
                </div>
                <div className="mt-0.5 font-mono-tabular text-sm font-bold text-[#0891B2] dark:text-[#55D9FF]">
                  {data.bestScores.timeAttack.highestCombo > 0
                    ? `${data.bestScores.timeAttack.highestCombo}x`
                    : '—'}
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveMode('time-attack')}
            className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#35C8E8] dark:bg-[#55D9FF] px-5 text-sm font-bold text-[#090B18] transition-all hover:brightness-105"
          >
            <span>Start Time Attack</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </motion.article>

        {/* Mode 3: Disappearing Memory */}
        <motion.article
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.26, delay: 0.12 }}
          className="group flex flex-col justify-between rounded-3xl border border-[#477BFF]/30 dark:border-[#527BFF]/30 bg-[#FFFFFF] dark:bg-[#171C35] p-6 shadow-xs dark:shadow-none transition-all duration-200 hover:border-[#477BFF]/75 dark:hover:border-[#527BFF]/75 hover:shadow-[0_12px_32px_rgba(71,123,255,0.15)] dark:hover:shadow-[0_12px_36px_rgba(82,123,255,0.18)]"
        >
          <div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#477BFF]/15 dark:bg-[#527BFF]/20 text-[#477BFF] dark:text-[#527BFF]">
                <Eye className="h-6 w-6" aria-hidden="true" />
              </div>
              <span className="text-xs font-medium text-[#5E6282] dark:text-[#929BB8]">
                Visual Recall
              </span>
            </div>

            <h2 className="mt-5 text-xl font-bold text-[#20213A] dark:text-[#F5F5FF]">
              Disappearing Memory
            </h2>
            <p className="mt-2 text-sm text-[#5E6282] dark:text-[#929BB8] leading-relaxed">
              Study a target group of symbols during a short countdown before
              they vanish, then pick them out from a larger distractor field.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3 border-t border-[#8056E8]/12 dark:border-white/10 pt-4 text-xs">
              <div>
                <div className="text-[#5E6282] dark:text-[#929BB8]">
                  Best Score
                </div>
                <div className="mt-0.5 font-mono-tabular text-sm font-bold text-[#20213A] dark:text-[#F5F5FF]">
                  {data.bestScores.disappearing.bestScore > 0
                    ? data.bestScores.disappearing.bestScore.toLocaleString()
                    : '—'}
                </div>
              </div>
              <div>
                <div className="text-[#5E6282] dark:text-[#929BB8]">
                  Highest Round
                </div>
                <div className="mt-0.5 font-mono-tabular text-sm font-bold text-[#8056E8] dark:text-[#9B7BFF]">
                  {data.bestScores.disappearing.highestRound > 0
                    ? `Round ${data.bestScores.disappearing.highestRound}`
                    : '—'}
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveMode('disappearing')}
            className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#477BFF] dark:bg-[#527BFF] px-5 text-sm font-bold text-white transition-all hover:brightness-110"
          >
            <span>Enter Visual Recall</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </motion.article>
      </div>
    </section>
  );
};
