import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Check, Eye, RotateCcw, X } from 'lucide-react';
import { CATEGORY_LABELS } from '../../data/iconLibrary';
import { useMemoraStore } from '../../hooks/useMemoraStore';
import {
  DisappearingDifficulty,
  IconCategoryFilter,
  MemorySymbol,
  SessionRecordResult,
} from '../../types/memora';
import {
  calculateDisappearingScoreAndXP,
  createDisappearingRound,
  DISAPPEARING_DIFFICULTIES,
  generateSessionId,
} from '../../utils/gameLogic';
import { GameHeader } from './GameHeader';

interface DisappearingMemoryGameProps {
  onBack: () => void;
}

type ChallengePhase = 'MEMORIZE' | 'RECALL' | 'RESULTS';

function getDifficultyForRound(roundNum: number): DisappearingDifficulty {
  if (roundNum >= 5) return 'hard';
  if (roundNum >= 3) return 'medium';
  return 'easy';
}

export const DisappearingMemoryGame: React.FC<DisappearingMemoryGameProps> = ({
  onBack,
}) => {
  const { recordSession } = useMemoraStore();

  const [difficulty, setDifficulty] = useState<DisappearingDifficulty>('easy');
  const [category, setCategory] = useState<IconCategoryFilter>('all');
  const [round, setRound] = useState(1);
  const [phase, setPhase] = useState<ChallengePhase>('MEMORIZE');

  const [deck, setDeck] = useState<{
    targets: MemorySymbol[];
    options: MemorySymbol[];
  }>(() => createDisappearingRound('easy', 'all'));

  const [memorizeLeftMs, setMemorizeLeftMs] = useState(
    DISAPPEARING_DIFFICULTIES.easy.memorizeSeconds * 1000
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [roundScore, setRoundScore] = useState(0);
  const [sessionResult, setSessionResult] =
    useState<SessionRecordResult | null>(null);

  const memorizeEndRef = useRef<number | null>(null);
  const recallStartRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);
  const completedRef = useRef(false);

  const config = DISAPPEARING_DIFFICULTIES[difficulty];

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  // Countdown strictly scoped to MEMORIZE phase
  useEffect(() => {
    if (phase !== 'MEMORIZE') {
      clearTimer();
      return;
    }

    const totalMs = config.memorizeSeconds * 1000;
    memorizeEndRef.current = Date.now() + totalMs;
    setMemorizeLeftMs(totalMs);

    intervalRef.current = window.setInterval(() => {
      if (memorizeEndRef.current === null) return;
      const left = Math.max(0, memorizeEndRef.current - Date.now());
      setMemorizeLeftMs(left);

      if (left <= 0) {
        clearTimer();
        recallStartRef.current = Date.now();
        setPhase('RECALL');
      }
    }, 50);

    return () => clearTimer();
  }, [clearTimer, config.memorizeSeconds, deck, phase]);

  const startChallenge = useCallback(
    (
      nextDiff: DisappearingDifficulty,
      nextRound: number,
      nextCat: IconCategoryFilter = category
    ) => {
      clearTimer();
      completedRef.current = false;
      setDifficulty(nextDiff);
      setCategory(nextCat);
      setRound(nextRound);
      setDeck(createDisappearingRound(nextDiff, nextCat));
      setSelectedIds([]);
      setRoundScore(0);
      setSessionResult(null);
      setPhase('MEMORIZE');
    },
    [category, clearTimer]
  );

  const handleToggleOption = useCallback(
    (symbolId: string) => {
      if (phase !== 'RECALL') return;

      setSelectedIds((prev) => {
        if (prev.includes(symbolId)) {
          return prev.filter((id) => id !== symbolId);
        }
        if (prev.length >= config.targetCount) {
          return prev;
        }
        return [...prev, symbolId];
      });
    },
    [config.targetCount, phase]
  );

  const handleSubmitRecall = useCallback(() => {
    if (
      phase !== 'RECALL' ||
      selectedIds.length !== config.targetCount ||
      completedRef.current
    ) {
      return;
    }

    completedRef.current = true;
    clearTimer();

    const targetIdSet = new Set(deck.targets.map((t) => t.id));
    const correctCount = selectedIds.filter((id) => targetIdSet.has(id)).length;
    const incorrectCount = selectedIds.length - correctCount;
    const missedCount = deck.targets.length - correctCount;

    const recallSeconds =
      recallStartRef.current !== null
        ? Math.max(1, Math.round((Date.now() - recallStartRef.current) / 1000))
        : 5;
    const totalDuration = config.memorizeSeconds + recallSeconds;

    const calc = calculateDisappearingScoreAndXP({
      difficulty,
      correctCount,
      targetCount: config.targetCount,
      round,
    });

    setRoundScore(calc.score);
    setPhase('RESULTS');

    const result = recordSession({
      id: generateSessionId(),
      mode: 'disappearing',
      difficulty,
      score: calc.score,
      xpEarned: calc.xpEarned,
      accuracy: calc.accuracy,
      durationSeconds: totalDuration,
      completed: true,
      timestamp: new Date().toISOString(),
      correctSelections: correctCount,
      incorrectSelections: incorrectCount,
      missedSelections: missedCount,
      pairsMatched: correctCount,
      totalPairs: config.targetCount,
      round,
    });

    setSessionResult(result);
  }, [
    clearTimer,
    config.memorizeSeconds,
    config.targetCount,
    deck.targets,
    difficulty,
    phase,
    recordSession,
    round,
    selectedIds,
  ]);

  const targetIdSet = useMemo(
    () => new Set(deck.targets.map((t) => t.id)),
    [deck.targets]
  );

  const resultsBreakdown = useMemo(() => {
    const correct = selectedIds.filter((id) => targetIdSet.has(id)).length;
    const incorrect = selectedIds.length - correct;
    const missed = deck.targets.length - correct;
    const accuracy = Math.round((correct / deck.targets.length) * 100);
    return { correct, incorrect, missed, accuracy };
  }, [deck.targets.length, selectedIds, targetIdSet]);

  const memorizeSecondsLeft = Math.ceil(memorizeLeftMs / 1000);
  const memorizeProgressPct = Math.max(
    0,
    Math.min(100, (memorizeLeftMs / (config.memorizeSeconds * 1000)) * 100)
  );

  const canAdvanceRound = resultsBreakdown.accuracy >= 75;
  const nextRoundNumber = round + 1;
  const nextAutoDifficulty = getDifficultyForRound(nextRoundNumber);

  const recallGridMaxWidth =
    config.totalOptions <= 8
      ? 'max-w-2xl lg:max-w-[min(100%,calc((100dvh-11.5rem)*1.7))]'
      : config.totalOptions <= 12
        ? 'max-w-2xl lg:max-w-[min(100%,calc((100dvh-11.5rem)*1.28))]'
        : 'max-w-2xl lg:max-w-[min(100%,calc(100dvh-11.5rem))]';

  return (
    <div className="mx-auto max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-[330px_minmax(0,1fr)] lg:items-center gap-3.5 sm:gap-4 lg:gap-6">
        {/* Left Column: Game Details & Controls */}
        <aside className="space-y-2.5 sm:space-y-3">
          <GameHeader
            modeTitle="Disappearing Memory"
            indicatorLabel={`Round ${round} · ${config.label} (${config.targetCount} of ${config.totalOptions})`}
            timerText={
              phase === 'MEMORIZE'
                ? `${memorizeSecondsLeft}s`
                : phase === 'RECALL'
                  ? 'Recall'
                  : 'Done'
            }
            timerUrgent={phase === 'MEMORIZE' && memorizeSecondsLeft <= 2}
            score={roundScore}
            onRestart={() => startChallenge(difficulty, 1, category)}
            onBack={onBack}
          />

          {/* Difficulty & Category Bar */}
          <div className="flex flex-col gap-2.5 rounded-2xl border border-[#8056E8]/15 dark:border-white/10 bg-[#FFFFFF] dark:bg-[#11152A] p-3 sm:p-3.5 shadow-xs dark:shadow-none transition-colors duration-200">
            <div>
              <div className="hidden lg:block text-[11px] font-medium text-[#5E6282] dark:text-[#929BB8] mb-1.5">
                Difficulty
              </div>
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                {(['easy', 'medium', 'hard'] as DisappearingDifficulty[]).map(
                  (diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => startChallenge(diff, 1, category)}
                      className={`h-9 rounded-xl px-2 text-[11px] font-semibold transition-colors whitespace-nowrap truncate ${
                        difficulty === diff
                          ? 'bg-[#8056E8] dark:bg-[#9B7BFF] text-white dark:text-[#090B18]'
                          : 'bg-[#EFECFF] dark:bg-[#171C35] text-[#5E6282] dark:text-[#929BB8] border border-[#8056E8]/15 dark:border-white/10 hover:text-[#20213A] dark:hover:text-[#F5F5FF]'
                      }`}
                    >
                      {DISAPPEARING_DIFFICULTIES[diff].label} (
                      {DISAPPEARING_DIFFICULTIES[diff].targetCount}/
                      {DISAPPEARING_DIFFICULTIES[diff].totalOptions})
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="flex items-center justify-between gap-2.5">
              <label
                htmlFor="dis-category-select"
                className="text-xs font-medium text-[#5E6282] dark:text-[#929BB8] whitespace-nowrap"
              >
                Theme
              </label>
              <select
                id="dis-category-select"
                value={category}
                onChange={(e) =>
                  startChallenge(
                    difficulty,
                    1,
                    e.target.value as IconCategoryFilter
                  )
                }
                className="h-9 flex-1 rounded-xl border border-[#8056E8]/20 dark:border-white/15 bg-[#EFECFF] dark:bg-[#171C35] px-3 text-xs font-medium text-[#20213A] dark:text-[#F5F5FF] focus:border-[#35C8E8] dark:focus:border-[#55D9FF] focus:outline-none"
              >
                {(Object.keys(CATEGORY_LABELS) as IconCategoryFilter[]).map(
                  (key) => (
                    <option key={key} value={key}>
                      {CATEGORY_LABELS[key]}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>

          {/* Phase Details Panel */}
          <div className="rounded-2xl border border-[#8056E8]/15 dark:border-white/10 bg-[#FFFFFF] dark:bg-[#11152A] p-3 sm:p-3.5 shadow-xs dark:shadow-none transition-colors duration-200">
            {phase === 'MEMORIZE' && (
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-[#477BFF] dark:text-[#55D9FF]">
                  <span className="inline-flex items-center gap-1.5">
                    <Eye className="h-4 w-4" aria-hidden="true" />
                    <span>Memorize {config.targetCount} Symbols</span>
                  </span>
                  <span className="font-mono-tabular text-base font-extrabold text-[#20213A] dark:text-[#F5F5FF]">
                    {memorizeSecondsLeft}s
                  </span>
                </div>

                <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-[#EFECFF] dark:bg-[#090B18]">
                  <div
                    style={{ width: `${memorizeProgressPct}%` }}
                    className="h-full rounded-full bg-gradient-to-r from-[#8056E8] to-[#35C8E8] dark:from-[#9B7BFF] dark:to-[#55D9FF]"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    clearTimer();
                    recallStartRef.current = Date.now();
                    setPhase('RECALL');
                  }}
                  className="mt-3 h-9 w-full rounded-xl border border-[#8056E8]/20 dark:border-white/15 bg-[#EFECFF] dark:bg-[#171C35] px-4 text-xs font-semibold text-[#5E6282] dark:text-[#929BB8] hover:text-[#20213A] dark:hover:text-[#F5F5FF] transition-colors"
                >
                  Ready Early — Recall Now
                </button>
              </div>
            )}

            {phase === 'RECALL' && (
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h2 className="text-sm font-bold text-[#20213A] dark:text-[#F5F5FF]">
                      Select {config.targetCount} Symbols
                    </h2>
                    <p className="text-[11px] text-[#5E6282] dark:text-[#929BB8] mt-0.5">
                      Tap the icons shown earlier.
                    </p>
                  </div>
                  <div className="rounded-xl border border-[#35C8E8]/45 dark:border-[#55D9FF]/35 bg-[#EFECFF] dark:bg-[#171C35] px-3 py-1.5 font-mono-tabular text-xs font-bold text-[#0891B2] dark:text-[#55D9FF] whitespace-nowrap">
                    {selectedIds.length} / {config.targetCount}
                  </div>
                </div>

                <div className="mt-3 hidden lg:flex flex-col gap-2">
                  <button
                    type="button"
                    disabled={selectedIds.length !== config.targetCount}
                    onClick={handleSubmitRecall}
                    className="h-10 w-full rounded-xl bg-gradient-to-r from-[#8056E8] to-[#477BFF] dark:from-[#9B7BFF] dark:to-[#527BFF] px-5 text-sm font-bold text-white shadow-[0_8px_24px_rgba(71,123,255,0.28)] dark:shadow-[0_8px_24px_rgba(82,123,255,0.3)] hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    Submit Recall ({selectedIds.length}/{config.targetCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedIds([])}
                    disabled={selectedIds.length === 0}
                    className="h-9 w-full rounded-xl border border-[#8056E8]/20 dark:border-white/15 bg-[#EFECFF] dark:bg-[#171C35] px-4 text-xs font-semibold text-[#5E6282] dark:text-[#929BB8] hover:text-[#20213A] dark:hover:text-[#F5F5FF] disabled:opacity-40 transition-colors"
                  >
                    Clear Selection
                  </button>
                </div>
              </div>
            )}

            {phase === 'RESULTS' && (
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <h2 className="text-sm font-bold text-[#20213A] dark:text-[#F5F5FF]">
                    Recall Results
                  </h2>
                  <span className="font-mono-tabular text-xs font-bold text-[#477BFF] dark:text-[#55D9FF]">
                    {resultsBreakdown.accuracy}% Accuracy
                  </span>
                </div>

                <div className="grid grid-cols-4 lg:grid-cols-2 gap-2">
                  <div className="rounded-xl border border-[#25B985]/35 dark:border-[#37D99A]/35 bg-[#E6F8F1] dark:bg-[#13292B] px-2.5 py-2 text-center lg:text-left">
                    <div className="text-[10px] font-medium text-[#5E6282] dark:text-[#929BB8]">
                      Correct
                    </div>
                    <div className="mt-0.5 font-mono-tabular text-base font-bold text-[#25B985] dark:text-[#37D99A]">
                      {resultsBreakdown.correct}
                    </div>
                  </div>
                  <div className="rounded-xl border border-[#E11D48]/35 dark:border-[#FF5D78]/35 bg-[#FFE9EE] dark:bg-[#2E1626] px-2.5 py-2 text-center lg:text-left">
                    <div className="text-[10px] font-medium text-[#5E6282] dark:text-[#929BB8]">
                      Wrong
                    </div>
                    <div className="mt-0.5 font-mono-tabular text-base font-bold text-[#E11D48] dark:text-[#FF5D78]">
                      {resultsBreakdown.incorrect}
                    </div>
                  </div>
                  <div className="rounded-xl border border-[#8056E8]/35 dark:border-[#9B7BFF]/35 bg-[#EFECFF] dark:bg-[#1E1938] px-2.5 py-2 text-center lg:text-left">
                    <div className="text-[10px] font-medium text-[#5E6282] dark:text-[#929BB8]">
                      Missed
                    </div>
                    <div className="mt-0.5 font-mono-tabular text-base font-bold text-[#8056E8] dark:text-[#9B7BFF]">
                      {resultsBreakdown.missed}
                    </div>
                  </div>
                  <div className="rounded-xl border border-[#35C8E8]/40 dark:border-[#55D9FF]/35 bg-[#F2FAFF] dark:bg-[#171C35] px-2.5 py-2 text-center lg:text-left">
                    <div className="text-[10px] font-medium text-[#5E6282] dark:text-[#929BB8]">
                      XP
                    </div>
                    <div className="mt-0.5 font-mono-tabular text-base font-bold text-[#0891B2] dark:text-[#55D9FF]">
                      +{sessionResult?.session.xpEarned ?? 0}
                    </div>
                  </div>
                </div>

                {sessionResult?.leveledUp && (
                  <div className="mt-2.5 rounded-xl border border-[#25B985]/40 dark:border-[#37D99A]/40 bg-[#25B985]/10 dark:bg-[#37D99A]/10 px-3 py-1.5 text-center text-xs font-bold text-[#25B985] dark:text-[#37D99A]">
                    Level Up! Reached Level {sessionResult.newLevel}
                  </div>
                )}

                <div className="mt-3 hidden lg:grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => startChallenge(difficulty, round, category)}
                    className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-[#8056E8]/20 dark:border-white/15 bg-[#EFECFF] dark:bg-[#171C35] px-3 text-xs font-semibold text-[#20213A] dark:text-[#F5F5FF] hover:border-[#8056E8]/60 dark:hover:border-[#9B7BFF]/60 transition-colors"
                  >
                    <RotateCcw className="h-4 w-4" aria-hidden="true" />
                    <span>Retry</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      startChallenge(
                        canAdvanceRound ? nextAutoDifficulty : difficulty,
                        nextRoundNumber,
                        category
                      )
                    }
                    className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#8056E8] to-[#477BFF] dark:from-[#9B7BFF] dark:to-[#527BFF] px-3 text-xs font-bold text-white shadow-[0_8px_24px_rgba(71,123,255,0.28)] dark:shadow-[0_8px_24px_rgba(82,123,255,0.35)] hover:brightness-110 transition-all"
                  >
                    <span>Round {nextRoundNumber}</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Right Column: Game Tile Play Area (Icon-Only Tiles) */}
        <div className="rounded-2xl sm:rounded-3xl border border-[#8056E8]/15 dark:border-white/10 bg-[#EFECFF]/65 dark:bg-[#11152A]/55 p-3 sm:p-4 lg:p-5 flex items-center justify-center transition-colors duration-200">
          <AnimatePresence mode="wait">
            {phase === 'MEMORIZE' && (
              <motion.div
                key="memorize-phase"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.22 }}
                className="w-full flex flex-col items-center justify-center py-2 sm:py-4"
              >
                <div className="mx-auto grid w-full max-w-xl lg:max-w-[min(100%,calc((100dvh-12rem)*1.35))] grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 justify-items-center">
                  {deck.targets.map((sym, idx) => (
                    <motion.div
                      key={sym.id}
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05, duration: 0.2 }}
                      aria-label={sym.label}
                      className="flex w-full aspect-square max-w-[155px] items-center justify-center rounded-2xl border border-[#35C8E8]/55 dark:border-[#55D9FF]/35 bg-[#FFFFFF] dark:bg-[#171C35] shadow-[0_8px_24px_rgba(53,200,232,0.12)] dark:shadow-[0_8px_28px_rgba(85,217,255,0.1)]"
                    >
                      <span
                        className="text-5xl sm:text-6xl leading-none select-none"
                        role="img"
                        aria-hidden="true"
                      >
                        {sym.emoji}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {(phase === 'RECALL' || phase === 'RESULTS') && (
              <motion.div
                key="recall-results-phase"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.24 }}
                className="w-full"
              >
                <div
                  className={`mx-auto grid w-full ${recallGridMaxWidth} gap-2 sm:gap-2.5 lg:gap-3 ${
                    config.totalOptions > 8
                      ? 'grid-cols-3 sm:grid-cols-4'
                      : 'grid-cols-2 sm:grid-cols-4'
                  }`}
                >
                  {deck.options.map((sym) => {
                    const isSelected = selectedIds.includes(sym.id);
                    const isTarget = targetIdSet.has(sym.id);

                    let cardStyle =
                      'border-[#8056E8]/20 dark:border-white/10 bg-[#FFFFFF] dark:bg-[#171C35] hover:border-[#8056E8]/65 dark:hover:border-[#9B7BFF]/60 shadow-xs dark:shadow-none';
                    let statusTag: { label: string; color: string } | null =
                      null;

                    if (phase === 'RECALL' && isSelected) {
                      cardStyle =
                        'border-[#35C8E8] dark:border-[#55D9FF] bg-[#EFFAFF] dark:bg-[#1C284D] shadow-[0_0_18px_rgba(53,200,232,0.22)] dark:shadow-[0_0_20px_rgba(85,217,255,0.22)]';
                    } else if (phase === 'RESULTS') {
                      if (isSelected && isTarget) {
                        cardStyle =
                          'border-[#25B985] dark:border-[#37D99A] bg-[#E6F8F1] dark:bg-[#13292B]';
                        statusTag = {
                          label: 'Correct',
                          color: 'text-[#25B985] dark:text-[#37D99A]',
                        };
                      } else if (isSelected && !isTarget) {
                        cardStyle =
                          'border-[#E11D48] dark:border-[#FF5D78] bg-[#FFE9EE] dark:bg-[#2E1626]';
                        statusTag = {
                          label: 'Wrong',
                          color: 'text-[#E11D48] dark:text-[#FF5D78]',
                        };
                      } else if (!isSelected && isTarget) {
                        cardStyle =
                          'border-[#8056E8] dark:border-[#9B7BFF] bg-[#EFECFF] dark:bg-[#1E1938]';
                        statusTag = {
                          label: 'Missed',
                          color: 'text-[#8056E8] dark:text-[#9B7BFF]',
                        };
                      } else {
                        cardStyle =
                          'border-[#8056E8]/10 dark:border-white/5 bg-[#FFFFFF]/60 dark:bg-[#11152A] opacity-55';
                      }
                    }

                    return (
                      <motion.button
                        key={sym.id}
                        type="button"
                        disabled={phase === 'RESULTS'}
                        whileTap={
                          phase === 'RECALL' ? { scale: 0.97 } : undefined
                        }
                        onClick={() => handleToggleOption(sym.id)}
                        aria-label={sym.label}
                        aria-pressed={isSelected}
                        className={`relative flex aspect-square min-h-[72px] lg:min-h-0 items-center justify-center rounded-xl sm:rounded-2xl border p-2 transition-colors focus-visible:outline-2 focus-visible:outline-[#35C8E8] dark:focus-visible:outline-[#55D9FF] ${cardStyle}`}
                      >
                        <span
                          className="text-3xl sm:text-4xl lg:text-[2.35rem] xl:text-5xl leading-none select-none"
                          role="img"
                          aria-hidden="true"
                        >
                          {sym.emoji}
                        </span>

                        {phase === 'RECALL' && isSelected && (
                          <span
                            aria-hidden="true"
                            className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#35C8E8] dark:bg-[#55D9FF] text-[#090B18]"
                          >
                            <Check className="h-3.5 w-3.5 stroke-[3]" />
                          </span>
                        )}

                        {phase === 'RESULTS' && statusTag && (
                          <span
                            className={`absolute bottom-1.5 inset-x-1 inline-flex items-center justify-center gap-0.5 text-[10px] font-bold ${statusTag.color}`}
                          >
                            {statusTag.label === 'Wrong' ? (
                              <X className="h-3 w-3" aria-hidden="true" />
                            ) : (
                              <Check className="h-3 w-3" aria-hidden="true" />
                            )}
                            <span>{statusTag.label}</span>
                          </span>
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Mobile/Tablet Action Controls */}
                <div className="mt-4 flex lg:hidden flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                  {phase === 'RECALL' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setSelectedIds([])}
                        disabled={selectedIds.length === 0}
                        className="h-11 rounded-xl border border-[#8056E8]/20 dark:border-white/15 bg-[#FFFFFF] dark:bg-[#171C35] px-4 text-xs font-semibold text-[#5E6282] dark:text-[#929BB8] hover:text-[#20213A] dark:hover:text-[#F5F5FF] disabled:opacity-40 transition-colors"
                      >
                        Clear Selection
                      </button>

                      <button
                        type="button"
                        disabled={selectedIds.length !== config.targetCount}
                        onClick={handleSubmitRecall}
                        className="h-12 rounded-xl bg-gradient-to-r from-[#8056E8] to-[#477BFF] dark:from-[#9B7BFF] dark:to-[#527BFF] px-6 text-sm font-bold text-white shadow-[0_8px_24px_rgba(71,123,255,0.28)] dark:shadow-[0_8px_24px_rgba(82,123,255,0.3)] hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      >
                        Submit Recall ({selectedIds.length}/{config.targetCount}
                        )
                      </button>
                    </>
                  ) : (
                    <div className="grid grid-cols-2 gap-2.5 w-full">
                      <button
                        type="button"
                        onClick={() =>
                          startChallenge(difficulty, round, category)
                        }
                        className="flex h-12 items-center justify-center gap-2 rounded-xl border border-[#8056E8]/20 dark:border-white/15 bg-[#FFFFFF] dark:bg-[#171C35] px-3 text-xs font-semibold text-[#20213A] dark:text-[#F5F5FF] hover:border-[#8056E8]/60 dark:hover:border-[#9B7BFF]/60 transition-colors"
                      >
                        <RotateCcw className="h-4 w-4" aria-hidden="true" />
                        <span>Retry</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          startChallenge(
                            canAdvanceRound ? nextAutoDifficulty : difficulty,
                            nextRoundNumber,
                            category
                          )
                        }
                        className="flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#8056E8] to-[#477BFF] dark:from-[#9B7BFF] dark:to-[#527BFF] px-3 text-xs font-bold text-white shadow-[0_8px_24px_rgba(71,123,255,0.28)] dark:shadow-[0_8px_24px_rgba(82,123,255,0.35)] hover:brightness-110 transition-all"
                      >
                        <span>Round {nextRoundNumber}</span>
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
