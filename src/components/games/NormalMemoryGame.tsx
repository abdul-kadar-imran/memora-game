import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { CATEGORY_LABELS } from '../../data/iconLibrary';
import { useMemoraStore } from '../../hooks/useMemoraStore';
import {
  IconCategoryFilter,
  NormalDifficulty,
  SessionRecordResult,
} from '../../types/memora';
import {
  BoardCard,
  calculateNormalScoreAndXP,
  createShuffledDeck,
  formatTimeMMSS,
  generateSessionId,
  NORMAL_DIFFICULTIES,
} from '../../utils/gameLogic';
import { GameHeader } from './GameHeader';
import { MemoryCard } from './MemoryCard';
import { ResultCelebrationModal } from './ResultCelebrationModal';

interface NormalMemoryGameProps {
  onBack: () => void;
}

export const NormalMemoryGame: React.FC<NormalMemoryGameProps> = ({
  onBack,
}) => {
  const { data, recordSession } = useMemoraStore();

  const [difficulty, setDifficulty] = useState<NormalDifficulty>('easy');
  const [category, setCategory] = useState<IconCategoryFilter>('all');
  const [cards, setCards] = useState<BoardCard[]>(() =>
    createShuffledDeck(NORMAL_DIFFICULTIES.easy.pairs, 'all')
  );
  const [flippedIds, setFlippedIds] = useState<string[]>([]);
  const [wrongPairIds, setWrongPairIds] = useState<string[]>([]);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const [moves, setMoves] = useState(0);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [isVictory, setIsVictory] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [isNewBest, setIsNewBest] = useState(false);
  const [sessionResult, setSessionResult] =
    useState<SessionRecordResult | null>(null);

  const startTimeRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const mismatchTimeoutRef = useRef<number | null>(null);
  const completedRef = useRef(false);

  const config = NORMAL_DIFFICULTIES[difficulty];
  const bestForDiff = data.bestScores.normal[difficulty];

  const clearTimers = useCallback(() => {
    if (timerIntervalRef.current !== null) {
      window.clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (mismatchTimeoutRef.current !== null) {
      window.clearTimeout(mismatchTimeoutRef.current);
      mismatchTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  // Timestamp-accurate elapsed timer
  useEffect(() => {
    if (!hasStarted || isVictory) {
      if (timerIntervalRef.current !== null) {
        window.clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      return;
    }

    if (startTimeRef.current === null) {
      startTimeRef.current = Date.now();
    }

    timerIntervalRef.current = window.setInterval(() => {
      if (startTimeRef.current !== null) {
        const secs = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setElapsedSeconds(secs);
      }
    }, 250);

    return () => {
      if (timerIntervalRef.current !== null) {
        window.clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [hasStarted, isVictory]);

  const startNewGame = useCallback(
    (
      nextDiff: NormalDifficulty = difficulty,
      nextCat: IconCategoryFilter = category
    ) => {
      clearTimers();
      completedRef.current = false;
      startTimeRef.current = null;
      setDifficulty(nextDiff);
      setCategory(nextCat);
      setCards(createShuffledDeck(NORMAL_DIFFICULTIES[nextDiff].pairs, nextCat));
      setFlippedIds([]);
      setWrongPairIds([]);
      setIsEvaluating(false);
      setMoves(0);
      setMatchedPairs(0);
      setElapsedSeconds(0);
      setHasStarted(false);
      setIsVictory(false);
      setFinalScore(0);
      setIsNewBest(false);
      setSessionResult(null);
    },
    [category, clearTimers, difficulty]
  );

  const accuracy = useMemo(() => {
    if (moves === 0) return 100;
    return Math.min(100, Math.round((matchedPairs / moves) * 100));
  }, [matchedPairs, moves]);

  const liveScorePreview = useMemo(() => {
    if (matchedPairs === 0) return 0;
    const base = matchedPairs * config.baseScorePerPair;
    return base + Math.round(accuracy * 3);
  }, [accuracy, config.baseScorePerPair, matchedPairs]);

  const handleCardSelect = useCallback(
    (clickedCard: BoardCard) => {
      if (
        isEvaluating ||
        isVictory ||
        clickedCard.isFlipped ||
        clickedCard.isMatched
      ) {
        return;
      }

      if (!hasStarted) {
        startTimeRef.current = Date.now();
        setHasStarted(true);
      }

      const updatedCards = cards.map((c) =>
        c.uid === clickedCard.uid ? { ...c, isFlipped: true } : c
      );
      setCards(updatedCards);

      const nextFlipped = [...flippedIds, clickedCard.uid];
      setFlippedIds(nextFlipped);

      if (nextFlipped.length < 2) {
        return;
      }

      // Two cards selected -> evaluate pair
      setIsEvaluating(true);
      const nextMoves = moves + 1;
      setMoves(nextMoves);

      const firstCard = updatedCards.find((c) => c.uid === nextFlipped[0]);
      const secondCard = updatedCards.find((c) => c.uid === nextFlipped[1]);

      if (!firstCard || !secondCard) {
        setIsEvaluating(false);
        setFlippedIds([]);
        return;
      }

      if (firstCard.symbolId === secondCard.symbolId) {
        // Match!
        const nextMatchedCount = matchedPairs + 1;

        setCards((prev) =>
          prev.map((c) =>
            c.uid === firstCard.uid || c.uid === secondCard.uid
              ? { ...c, isMatched: true, isFlipped: true }
              : c
          )
        );
        setMatchedPairs(nextMatchedCount);
        setFlippedIds([]);
        setIsEvaluating(false);

        // Check Victory
        if (nextMatchedCount === config.pairs && !completedRef.current) {
          completedRef.current = true;
          clearTimers();

          const finalDuration =
            startTimeRef.current !== null
              ? Math.max(
                  1,
                  Math.round((Date.now() - startTimeRef.current) / 1000)
                )
              : Math.max(1, elapsedSeconds);
          setElapsedSeconds(finalDuration);

          const calc = calculateNormalScoreAndXP({
            difficulty,
            pairs: config.pairs,
            moves: nextMoves,
            durationSeconds: finalDuration,
          });

          setFinalScore(calc.score);
          setIsNewBest(calc.score > bestForDiff.bestScore);
          setIsVictory(true);

          const result = recordSession({
            id: generateSessionId(),
            mode: 'normal',
            difficulty,
            score: calc.score,
            xpEarned: calc.xpEarned,
            accuracy: calc.accuracy,
            durationSeconds: finalDuration,
            completed: true,
            timestamp: new Date().toISOString(),
            moves: nextMoves,
            pairsMatched: config.pairs,
            totalPairs: config.pairs,
          });

          setSessionResult(result);
        }
      } else {
        // Mismatch -> hold 800ms before flipping back
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
        }, 800);
      }
    },
    [
      bestForDiff.bestScore,
      cards,
      clearTimers,
      config.pairs,
      difficulty,
      elapsedSeconds,
      flippedIds,
      hasStarted,
      isEvaluating,
      isVictory,
      matchedPairs,
      moves,
      recordSession,
    ]
  );

  const gridClass =
    difficulty === 'easy'
      ? 'grid-cols-4 max-w-md lg:max-w-[min(100%,calc(100dvh-11rem))]'
      : difficulty === 'medium'
        ? 'grid-cols-4 sm:grid-cols-6 max-w-2xl lg:max-w-[min(100%,calc((100dvh-11rem)*1.45))]'
        : 'grid-cols-6 max-w-xl lg:max-w-[min(100%,calc(100dvh-11rem))]';

  return (
    <div className="mx-auto max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-[330px_minmax(0,1fr)] lg:items-center gap-3.5 sm:gap-4 lg:gap-6">
        {/* Left Column: Game Details & Controls */}
        <aside className="space-y-2.5 sm:space-y-3">
          <GameHeader
            modeTitle="Normal Memory Match"
            indicatorLabel={`${config.label} · ${CATEGORY_LABELS[category]}`}
            timerText={formatTimeMMSS(elapsedSeconds)}
            score={isVictory ? finalScore : liveScorePreview}
            onRestart={() => startNewGame(difficulty, category)}
            onBack={onBack}
          />

          {/* Difficulty & Category Controls */}
          <div className="flex flex-col gap-2.5 rounded-2xl border border-[#8056E8]/15 dark:border-white/10 bg-[#FFFFFF] dark:bg-[#11152A] p-3 sm:p-3.5 shadow-xs dark:shadow-none transition-colors duration-200">
            <div>
              <div className="hidden lg:block text-[11px] font-medium text-[#5E6282] dark:text-[#929BB8] mb-1.5">
                Difficulty
              </div>
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                {(['easy', 'medium', 'hard'] as NormalDifficulty[]).map(
                  (diff) => {
                    const active = difficulty === diff;
                    return (
                      <button
                        key={diff}
                        type="button"
                        onClick={() => startNewGame(diff, category)}
                        className={`h-9 rounded-xl px-2 text-[11px] font-semibold transition-colors whitespace-nowrap truncate ${
                          active
                            ? 'bg-[#8056E8] dark:bg-[#9B7BFF] text-white dark:text-[#090B18]'
                            : 'bg-[#EFECFF] dark:bg-[#171C35] text-[#5E6282] dark:text-[#929BB8] hover:text-[#20213A] dark:hover:text-[#F5F5FF] border border-[#8056E8]/15 dark:border-white/10'
                        }`}
                      >
                        {NORMAL_DIFFICULTIES[diff].label}
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            <div className="flex items-center justify-between gap-2.5">
              <label
                htmlFor="normal-category-select"
                className="text-xs font-medium text-[#5E6282] dark:text-[#929BB8] whitespace-nowrap"
              >
                Theme
              </label>
              <select
                id="normal-category-select"
                value={category}
                onChange={(e) =>
                  startNewGame(difficulty, e.target.value as IconCategoryFilter)
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

          {/* Live Metrics */}
          <div className="grid grid-cols-4 lg:grid-cols-2 gap-2 sm:gap-2.5">
            <div className="rounded-xl border border-[#8056E8]/15 dark:border-white/10 bg-[#FFFFFF] dark:bg-[#11152A] px-2.5 py-2 sm:px-3.5 sm:py-2.5 text-center lg:text-left shadow-xs dark:shadow-none">
              <div className="text-[10px] sm:text-[11px] font-medium text-[#5E6282] dark:text-[#929BB8]">
                Pairs
              </div>
              <div className="mt-0.5 font-mono-tabular text-sm sm:text-base font-bold text-[#20213A] dark:text-[#F5F5FF]">
                {matchedPairs}/{config.pairs}
              </div>
            </div>
            <div className="rounded-xl border border-[#8056E8]/15 dark:border-white/10 bg-[#FFFFFF] dark:bg-[#11152A] px-2.5 py-2 sm:px-3.5 sm:py-2.5 text-center lg:text-left shadow-xs dark:shadow-none">
              <div className="text-[10px] sm:text-[11px] font-medium text-[#5E6282] dark:text-[#929BB8]">
                Moves
              </div>
              <div className="mt-0.5 font-mono-tabular text-sm sm:text-base font-bold text-[#20213A] dark:text-[#F5F5FF]">
                {moves}
              </div>
            </div>
            <div className="rounded-xl border border-[#8056E8]/15 dark:border-white/10 bg-[#FFFFFF] dark:bg-[#11152A] px-2.5 py-2 sm:px-3.5 sm:py-2.5 text-center lg:text-left shadow-xs dark:shadow-none">
              <div className="text-[10px] sm:text-[11px] font-medium text-[#5E6282] dark:text-[#929BB8]">
                Accuracy
              </div>
              <div className="mt-0.5 font-mono-tabular text-sm sm:text-base font-bold text-[#25B985] dark:text-[#37D99A]">
                {accuracy}%
              </div>
            </div>
            <div className="rounded-xl border border-[#8056E8]/15 dark:border-white/10 bg-[#FFFFFF] dark:bg-[#11152A] px-2.5 py-2 sm:px-3.5 sm:py-2.5 text-center lg:text-left shadow-xs dark:shadow-none">
              <div className="text-[10px] sm:text-[11px] font-medium text-[#5E6282] dark:text-[#929BB8] truncate">
                Best
              </div>
              <div className="mt-0.5 font-mono-tabular text-sm sm:text-base font-bold text-[#8056E8] dark:text-[#9B7BFF] truncate">
                {bestForDiff.bestScore > 0
                  ? bestForDiff.bestScore.toLocaleString()
                  : '—'}
              </div>
            </div>
          </div>

          {/* Desktop Action */}
          <button
            type="button"
            onClick={() => startNewGame(difficulty, category)}
            className="hidden lg:flex h-10 w-full items-center justify-center rounded-xl border border-[#8056E8]/20 dark:border-white/15 bg-[#FFFFFF] dark:bg-[#171C35] px-5 text-xs font-semibold text-[#20213A] dark:text-[#F5F5FF] hover:border-[#8056E8]/60 dark:hover:border-[#9B7BFF]/60 transition-colors shadow-xs dark:shadow-none"
          >
            New Shuffled Game
          </button>
        </aside>

        {/* Right Column: Game Tile Play Area */}
        <div className="rounded-2xl sm:rounded-3xl border border-[#8056E8]/15 dark:border-white/10 bg-[#EFECFF]/65 dark:bg-[#11152A]/55 p-2.5 sm:p-4 lg:p-5 flex flex-col items-center justify-center transition-colors duration-200">
          <motion.div
            key={`${difficulty}-${category}-${cards[0]?.uid ?? 'init'}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22 }}
            className={`mx-auto grid w-full ${gridClass} ${
              difficulty === 'hard'
                ? 'gap-1.5 sm:gap-2'
                : 'gap-2 sm:gap-2.5 lg:gap-3'
            }`}
          >
            {cards.map((card) => (
              <MemoryCard
                key={card.uid}
                card={card}
                compact={difficulty === 'hard'}
                isWrongPair={wrongPairIds.includes(card.uid)}
                disabled={isEvaluating || isVictory}
                onSelect={handleCardSelect}
              />
            ))}
          </motion.div>

          {/* Mobile Action */}
          <div className="mt-3.5 w-full lg:hidden">
            <button
              type="button"
              onClick={() => startNewGame(difficulty, category)}
              className="h-10 w-full rounded-xl border border-[#8056E8]/20 dark:border-white/15 bg-[#FFFFFF] dark:bg-[#171C35] px-5 text-xs font-semibold text-[#20213A] dark:text-[#F5F5FF] hover:border-[#8056E8]/60 dark:hover:border-[#9B7BFF]/60 transition-colors"
            >
              New Shuffled Game
            </button>
          </div>
        </div>
      </div>

      {/* Victory Modal */}
      {isVictory && (
        <ResultCelebrationModal
          title="Board Cleared!"
          subtitle={`Normal Memory Match · ${config.label}`}
          score={finalScore}
          isNewBest={isNewBest}
          sessionResult={sessionResult}
          metrics={[
            {
              label: 'Time',
              value: formatTimeMMSS(elapsedSeconds),
              accent: 'cyan',
            },
            { label: 'Moves', value: String(moves), accent: 'default' },
            { label: 'Accuracy', value: `${accuracy}%`, accent: 'emerald' },
          ]}
          primaryActionLabel="Play Again"
          onPrimaryAction={() => startNewGame(difficulty, category)}
          onBackToArena={onBack}
        />
      )}
    </div>
  );
};
