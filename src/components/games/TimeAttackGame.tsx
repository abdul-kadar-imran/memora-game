import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Flame, Play, Zap } from 'lucide-react';
import { CATEGORY_LABELS } from '../../data/iconLibrary';
import { useMemoraStore } from '../../hooks/useMemoraStore';
import {
  IconCategoryFilter,
  SessionRecordResult,
  TimeAttackGrid,
} from '../../types/memora';
import {
  BoardCard,
  calculateTimeAttackXP,
  createShuffledDeck,
  generateSessionId,
  getComboPoints,
  TIME_ATTACK_DURATION_SECONDS,
  TIME_ATTACK_GRIDS,
} from '../../utils/gameLogic';
import { GameHeader } from './GameHeader';
import { MemoryCard } from './MemoryCard';
import { ResultCelebrationModal } from './ResultCelebrationModal';

interface TimeAttackGameProps {
  onBack: () => void;
}

export const TimeAttackGame: React.FC<TimeAttackGameProps> = ({ onBack }) => {
  const { data, recordSession } = useMemoraStore();

  const [gridType, setGridType] = useState<TimeAttackGrid>('4x4');
  const [category, setCategory] = useState<IconCategoryFilter>('all');
  const [cards, setCards] = useState<BoardCard[]>(() =>
    createShuffledDeck(TIME_ATTACK_GRIDS['4x4'].pairs, 'all')
  );
  const [flippedIds, setFlippedIds] = useState<string[]>([]);
  const [wrongPairIds, setWrongPairIds] = useState<string[]>([]);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const [phase, setPhase] = useState<'READY' | 'PLAYING' | 'FINISHED'>('READY');
  const [remainingMs, setRemainingMs] = useState(
    TIME_ATTACK_DURATION_SECONDS * 1000
  );
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [highestCombo, setHighestCombo] = useState(0);
  const [pairsMatched, setPairsMatched] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [boardsCleared, setBoardsCleared] = useState(0);
  const [lastPointsBurst, setLastPointsBurst] = useState<number | null>(null);
  const [isNewBest, setIsNewBest] = useState(false);
  const [sessionResult, setSessionResult] =
    useState<SessionRecordResult | null>(null);

  const endTimeRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const mismatchTimeoutRef = useRef<number | null>(null);
  const reboardTimeoutRef = useRef<number | null>(null);
  const completedRef = useRef(false);

  // Refs synced for accurate timeout completion snapshot
  const scoreRef = useRef(0);
  const pairsMatchedRef = useRef(0);
  const highestComboRef = useRef(0);
  const attemptsRef = useRef(0);

  scoreRef.current = score;
  pairsMatchedRef.current = pairsMatched;
  highestComboRef.current = highestCombo;
  attemptsRef.current = attempts;

  const gridConfig = TIME_ATTACK_GRIDS[gridType];
  const personalBest = data.bestScores.timeAttack.bestScore;

  const clearTimers = useCallback(() => {
    if (timerIntervalRef.current !== null) {
      window.clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (mismatchTimeoutRef.current !== null) {
      window.clearTimeout(mismatchTimeoutRef.current);
      mismatchTimeoutRef.current = null;
    }
    if (reboardTimeoutRef.current !== null) {
      window.clearTimeout(reboardTimeoutRef.current);
      reboardTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  const finishChallenge = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    clearTimers();
    setRemainingMs(0);
    setPhase('FINISHED');
    setIsEvaluating(false);
    setWrongPairIds([]);
    setFlippedIds([]);

    const finalScoreVal = scoreRef.current;
    const finalPairs = pairsMatchedRef.current;
    const finalMaxCombo = highestComboRef.current;
    const finalAttempts = attemptsRef.current;

    const accuracy =
      finalAttempts > 0
        ? Math.min(100, Math.round((finalPairs / finalAttempts) * 100))
        : 0;
    const xpEarned = calculateTimeAttackXP({
      score: finalScoreVal,
      pairsMatched: finalPairs,
      highestCombo: finalMaxCombo,
    });

    setIsNewBest(finalScoreVal > personalBest && finalScoreVal > 0);

    const result = recordSession({
      id: generateSessionId(),
      mode: 'time-attack',
      difficulty: gridType,
      score: finalScoreVal,
      xpEarned,
      accuracy,
      durationSeconds: TIME_ATTACK_DURATION_SECONDS,
      completed: true,
      timestamp: new Date().toISOString(),
      moves: finalAttempts,
      pairsMatched: finalPairs,
      highestCombo: finalMaxCombo,
    });

    setSessionResult(result);
  }, [clearTimers, gridType, personalBest, recordSession]);

  // Timestamp-driven 60s countdown
  useEffect(() => {
    if (phase !== 'PLAYING') {
      if (timerIntervalRef.current !== null) {
        window.clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      return;
    }

    if (endTimeRef.current === null) {
      endTimeRef.current = Date.now() + TIME_ATTACK_DURATION_SECONDS * 1000;
    }

    timerIntervalRef.current = window.setInterval(() => {
      if (endTimeRef.current === null) return;
      const left = Math.max(0, endTimeRef.current - Date.now());
      setRemainingMs(left);

      if (left <= 0) {
        finishChallenge();
      }
    }, 50);

    return () => {
      if (timerIntervalRef.current !== null) {
        window.clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [finishChallenge, phase]);

  const resetChallenge = useCallback(
    (
      nextGrid: TimeAttackGrid = gridType,
      nextCat: IconCategoryFilter = category
    ) => {
      clearTimers();
      completedRef.current = false;
      endTimeRef.current = null;

      setGridType(nextGrid);
      setCategory(nextCat);
      setCards(createShuffledDeck(TIME_ATTACK_GRIDS[nextGrid].pairs, nextCat));
      setFlippedIds([]);
      setWrongPairIds([]);
      setIsEvaluating(false);
      setPhase('READY');
      setRemainingMs(TIME_ATTACK_DURATION_SECONDS * 1000);
      setScore(0);
      setCombo(0);
      setHighestCombo(0);
      setPairsMatched(0);
      setAttempts(0);
      setBoardsCleared(0);
      setLastPointsBurst(null);
      setIsNewBest(false);
      setSessionResult(null);
    },
    [category, clearTimers, gridType]
  );

  const startChallenge = useCallback(() => {
    if (phase !== 'READY') return;
    endTimeRef.current = Date.now() + TIME_ATTACK_DURATION_SECONDS * 1000;
    setRemainingMs(TIME_ATTACK_DURATION_SECONDS * 1000);
    setPhase('PLAYING');
  }, [phase]);

  const handleCardSelect = useCallback(
    (clickedCard: BoardCard) => {
      if (
        phase !== 'PLAYING' ||
        remainingMs <= 0 ||
        isEvaluating ||
        clickedCard.isFlipped ||
        clickedCard.isMatched
      ) {
        return;
      }

      const updatedCards = cards.map((c) =>
        c.uid === clickedCard.uid ? { ...c, isFlipped: true } : c
      );
      setCards(updatedCards);

      const nextFlipped = [...flippedIds, clickedCard.uid];
      setFlippedIds(nextFlipped);

      if (nextFlipped.length < 2) return;

      setIsEvaluating(true);
      setAttempts((a) => a + 1);

      const firstCard = updatedCards.find((c) => c.uid === nextFlipped[0]);
      const secondCard = updatedCards.find((c) => c.uid === nextFlipped[1]);

      if (!firstCard || !secondCard) {
        setIsEvaluating(false);
        setFlippedIds([]);
        return;
      }

      if (firstCard.symbolId === secondCard.symbolId) {
        const nextCombo = combo + 1;
        const pointsEarned = getComboPoints(nextCombo);
        const nextTotalPairs = pairsMatched + 1;

        setCombo(nextCombo);
        setHighestCombo((prev) => Math.max(prev, nextCombo));
        setPairsMatched(nextTotalPairs);
        setLastPointsBurst(pointsEarned);

        const nextBoardCards = updatedCards.map((c) =>
          c.uid === firstCard.uid || c.uid === secondCard.uid
            ? { ...c, isMatched: true, isFlipped: true }
            : c
        );
        setCards(nextBoardCards);
        setFlippedIds([]);
        setIsEvaluating(false);

        const allMatchedOnBoard = nextBoardCards.every((c) => c.isMatched);
        if (allMatchedOnBoard) {
          const boardClearBonus = 250;
          setScore((s) => s + pointsEarned + boardClearBonus);
          setBoardsCleared((b) => b + 1);
          setLastPointsBurst(pointsEarned + boardClearBonus);

          reboardTimeoutRef.current = window.setTimeout(() => {
            if (!completedRef.current) {
              setCards(createShuffledDeck(gridConfig.pairs, category));
            }
          }, 350);
        } else {
          setScore((s) => s + pointsEarned);
        }
      } else {
        setCombo(0);
        setLastPointsBurst(null);
        setWrongPairIds([firstCard.uid, secondCard.uid]);

        mismatchTimeoutRef.current = window.setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.uid === firstCard.uid || c.uid === secondCard.uid
                ? { ...c, isFlipped: false }
                : c
            )
          );
          setWrongPairIds([]);
          setFlippedIds([]);
          setIsEvaluating(false);
        }, 550);
      }
    },
    [
      cards,
      category,
      combo,
      flippedIds,
      gridConfig.pairs,
      isEvaluating,
      pairsMatched,
      phase,
      remainingMs,
    ]
  );

  const secondsLeftDisplay = (remainingMs / 1000).toFixed(1);
  const progressPct = Math.max(
    0,
    Math.min(100, (remainingMs / (TIME_ATTACK_DURATION_SECONDS * 1000)) * 100)
  );
  const liveAccuracy = useMemo(() => {
    if (attempts === 0) return 100;
    return Math.min(100, Math.round((pairsMatched / attempts) * 100));
  }, [attempts, pairsMatched]);

  return (
    <div className="mx-auto max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-[330px_minmax(0,1fr)] lg:items-center gap-3.5 sm:gap-4 lg:gap-6">
        {/* Left Column: Game Details & Controls */}
        <aside className="space-y-2.5 sm:space-y-3">
          <GameHeader
            modeTitle="Time Attack"
            indicatorLabel={`60-Second Blitz · ${gridConfig.label}`}
            timerText={`${secondsLeftDisplay}s`}
            timerUrgent={phase === 'PLAYING' && remainingMs <= 10000}
            score={score}
            onRestart={() => resetChallenge(gridType, category)}
            onBack={onBack}
          />

          {/* Setup Controls */}
          <div className="flex flex-col gap-2.5 rounded-2xl border border-[#8056E8]/15 dark:border-white/10 bg-[#FFFFFF] dark:bg-[#11152A] p-3 sm:p-3.5 shadow-xs dark:shadow-none transition-colors duration-200">
            <div>
              <div className="hidden lg:block text-[11px] font-medium text-[#5E6282] dark:text-[#929BB8] mb-1.5">
                Board Grid
              </div>
              <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                {(['4x4', '6x4'] as TimeAttackGrid[]).map((g) => (
                  <button
                    key={g}
                    type="button"
                    disabled={phase === 'PLAYING'}
                    onClick={() => resetChallenge(g, category)}
                    className={`h-9 rounded-xl px-2.5 text-[11px] font-semibold transition-colors whitespace-nowrap truncate ${
                      gridType === g
                        ? 'bg-[#35C8E8] dark:bg-[#55D9FF] text-[#090B18]'
                        : 'bg-[#EFECFF] dark:bg-[#171C35] text-[#5E6282] dark:text-[#929BB8] border border-[#8056E8]/15 dark:border-white/10 hover:text-[#20213A] dark:hover:text-[#F5F5FF] disabled:opacity-50'
                    }`}
                  >
                    {TIME_ATTACK_GRIDS[g].label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between gap-2.5">
              <label
                htmlFor="ta-category-select"
                className="text-xs font-medium text-[#5E6282] dark:text-[#929BB8] whitespace-nowrap"
              >
                Theme
              </label>
              <select
                id="ta-category-select"
                disabled={phase === 'PLAYING'}
                value={category}
                onChange={(e) =>
                  resetChallenge(gridType, e.target.value as IconCategoryFilter)
                }
                className="h-9 flex-1 rounded-xl border border-[#8056E8]/20 dark:border-white/15 bg-[#EFECFF] dark:bg-[#171C35] px-3 text-xs font-medium text-[#20213A] dark:text-[#F5F5FF] focus:border-[#35C8E8] dark:focus:border-[#55D9FF] focus:outline-none disabled:opacity-50"
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

          {/* Countdown Progress Bar & Combo HUD */}
          <div className="rounded-2xl border border-[#8056E8]/15 dark:border-white/10 bg-[#FFFFFF] dark:bg-[#11152A] p-3 sm:p-3.5 shadow-xs dark:shadow-none transition-colors duration-200">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2.5">
                <div>
                  <div className="text-[10px] sm:text-[11px] font-medium text-[#5E6282] dark:text-[#929BB8]">
                    Time Left
                  </div>
                  <div
                    className={`font-mono-tabular text-xl sm:text-2xl font-extrabold ${
                      phase === 'PLAYING' && remainingMs <= 10000
                        ? 'text-[#E11D48] dark:text-[#FF5D78]'
                        : 'text-[#477BFF] dark:text-[#55D9FF]'
                    }`}
                  >
                    {secondsLeftDisplay}s
                  </div>
                </div>

                {lastPointsBurst !== null && phase === 'PLAYING' && (
                  <motion.span
                    key={`${pairsMatched}-${score}`}
                    initial={{ opacity: 0, y: 6, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="font-mono-tabular text-xs sm:text-sm font-bold text-[#25B985] dark:text-[#37D99A]"
                  >
                    +{lastPointsBurst}
                  </motion.span>
                )}
              </div>

              <div className="flex items-center gap-3.5 sm:gap-4">
                <div className="text-right">
                  <div className="text-[10px] sm:text-[11px] font-medium text-[#5E6282] dark:text-[#929BB8]">
                    Combo
                  </div>
                  <div className="flex items-center justify-end gap-1 font-mono-tabular text-sm sm:text-base font-bold text-[#8056E8] dark:text-[#9B7BFF]">
                    <Flame
                      className="h-3.5 w-3.5 text-[#8056E8] dark:text-[#9B7BFF]"
                      aria-hidden="true"
                    />
                    <span>{combo}x</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] sm:text-[11px] font-medium text-[#5E6282] dark:text-[#929BB8]">
                    Pairs
                  </div>
                  <div className="font-mono-tabular text-sm sm:text-base font-bold text-[#20213A] dark:text-[#F5F5FF]">
                    {pairsMatched}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] sm:text-[11px] font-medium text-[#5E6282] dark:text-[#929BB8]">
                    Best
                  </div>
                  <div className="font-mono-tabular text-sm sm:text-base font-bold text-[#0891B2] dark:text-[#55D9FF]">
                    {personalBest > 0 ? personalBest.toLocaleString() : '—'}
                  </div>
                </div>
              </div>
            </div>

            <div className="h-2 sm:h-2.5 w-full overflow-hidden rounded-full bg-[#EFECFF] dark:bg-[#090B18]">
              <div
                style={{ width: `${progressPct}%` }}
                className={`h-full rounded-full transition-colors duration-150 ${
                  remainingMs <= 10000
                    ? 'bg-[#E11D48] dark:bg-[#FF5D78]'
                    : 'bg-gradient-to-r from-[#477BFF] to-[#35C8E8] dark:from-[#527BFF] dark:to-[#55D9FF]'
                }`}
              />
            </div>

            {/* Extra desktop breakdown */}
            <div className="mt-2.5 hidden lg:grid grid-cols-2 gap-2 border-t border-[#8056E8]/10 dark:border-white/5 pt-2.5 text-xs">
              <div>
                <span className="text-[#5E6282] dark:text-[#929BB8]">
                  Max Combo:{' '}
                </span>
                <span className="font-mono-tabular font-bold text-[#8056E8] dark:text-[#9B7BFF]">
                  {highestCombo}x
                </span>
              </div>
              <div className="text-right">
                <span className="text-[#5E6282] dark:text-[#929BB8]">
                  Accuracy:{' '}
                </span>
                <span className="font-mono-tabular font-bold text-[#25B985] dark:text-[#37D99A]">
                  {liveAccuracy}%
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Column: Game Tile Play Area */}
        <div className="rounded-2xl sm:rounded-3xl border border-[#8056E8]/15 dark:border-white/10 bg-[#EFECFF]/65 dark:bg-[#11152A]/55 p-2.5 sm:p-4 lg:p-5 flex items-center justify-center transition-colors duration-200">
          <div
            className={`relative mx-auto w-full ${
              phase === 'READY' ? 'min-h-[300px] sm:min-h-0' : ''
            }`}
          >
            <div
              className={`mx-auto grid w-full ${
                gridType === '4x4'
                  ? 'grid-cols-4 max-w-md lg:max-w-[min(100%,calc(100dvh-11rem))] gap-2 sm:gap-2.5 lg:gap-3'
                  : 'grid-cols-4 sm:grid-cols-6 max-w-2xl lg:max-w-[min(100%,calc((100dvh-11rem)*1.45))] gap-2 sm:gap-2.5'
              }`}
            >
              {cards.map((card) => (
                <MemoryCard
                  key={card.uid}
                  card={card}
                  isWrongPair={wrongPairIds.includes(card.uid)}
                  disabled={
                    phase !== 'PLAYING' || isEvaluating || remainingMs <= 0
                  }
                  onSelect={handleCardSelect}
                />
              ))}
            </div>

            {/* Ready Overlay */}
            {phase === 'READY' && (
              <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-[#F8F7FF]/80 dark:bg-[#090B18]/80 backdrop-blur-sm p-3 sm:p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="max-w-sm w-full rounded-2xl border border-[#35C8E8]/45 dark:border-[#55D9FF]/40 bg-[#FFFFFF] dark:bg-[#11152A] p-5 sm:p-6 text-center shadow-xl dark:shadow-2xl"
                >
                  <div className="mx-auto flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-[#35C8E8]/15 dark:bg-[#55D9FF]/15 text-[#0891B2] dark:text-[#55D9FF]">
                    <Zap className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
                  </div>
                  <h2 className="mt-2.5 sm:mt-3 text-lg sm:text-xl font-bold text-[#20213A] dark:text-[#F5F5FF]">
                    60-Second Memory Blitz
                  </h2>
                  <p className="mt-1.5 text-xs sm:text-sm text-[#5E6282] dark:text-[#929BB8]">
                    Match pairs fast to build combo multipliers (+100 up to +300
                    per pair). Clearing a full board awards +250 bonus points.
                  </p>
                  <button
                    type="button"
                    onClick={startChallenge}
                    className="mt-4 sm:mt-5 inline-flex h-11 sm:h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#477BFF] to-[#35C8E8] dark:from-[#527BFF] dark:to-[#55D9FF] px-5 text-sm font-bold text-white dark:text-[#090B18] shadow-[0_8px_24px_rgba(53,200,232,0.28)] dark:shadow-[0_8px_24px_rgba(85,217,255,0.3)] hover:brightness-105 transition-all"
                  >
                    <Play className="h-4 w-4 fill-current" aria-hidden="true" />
                    <span>Start 60s Challenge</span>
                  </button>
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Finished Modal */}
      {phase === 'FINISHED' && (
        <ResultCelebrationModal
          title="Time's Up!"
          subtitle={`Time Attack · ${gridConfig.label}${
            boardsCleared > 0 ? ` · ${boardsCleared} Board Clears` : ''
          }`}
          score={score}
          isNewBest={isNewBest}
          sessionResult={sessionResult}
          metrics={[
            {
              label: 'Matched Pairs',
              value: String(pairsMatched),
              accent: 'cyan',
            },
            {
              label: 'Highest Combo',
              value: `${highestCombo}x`,
              accent: 'purple',
            },
            {
              label: 'Accuracy',
              value: `${liveAccuracy}%`,
              accent: 'emerald',
            },
          ]}
          primaryActionLabel="Play Again"
          onPrimaryAction={() => resetChallenge(gridType, category)}
          onBackToArena={onBack}
        />
      )}
    </div>
  );
};
