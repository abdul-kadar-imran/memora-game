import { pickRandomSymbols, shuffleArray } from '../data/iconLibrary';
import {
  DisappearingDifficulty,
  IconCategoryFilter,
  MemorySymbol,
  NormalDifficulty,
  TimeAttackGrid,
} from '../types/memora';

export interface BoardCard {
  uid: string;
  symbolId: string;
  label: string;
  emoji: string;
  accent: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export interface NormalDifficultyConfig {
  label: string;
  cols: number;
  rows: number;
  pairs: number;
  baseScorePerPair: number;
  targetTimeSeconds: number;
}

export const NORMAL_DIFFICULTIES: Record<
  NormalDifficulty,
  NormalDifficultyConfig
> = {
  easy: {
    label: 'Easy (4×4)',
    cols: 4,
    rows: 4,
    pairs: 8,
    baseScorePerPair: 120,
    targetTimeSeconds: 45,
  },
  medium: {
    label: 'Medium (6×4)',
    cols: 6,
    rows: 4,
    pairs: 12,
    baseScorePerPair: 150,
    targetTimeSeconds: 75,
  },
  hard: {
    label: 'Hard (6×6)',
    cols: 6,
    rows: 6,
    pairs: 18,
    baseScorePerPair: 180,
    targetTimeSeconds: 120,
  },
};

export const TIME_ATTACK_DURATION_SECONDS = 60;

export const TIME_ATTACK_GRIDS: Record<
  TimeAttackGrid,
  { label: string; cols: number; rows: number; pairs: number }
> = {
  '4x4': { label: '4×4 Fast Grid (8 pairs)', cols: 4, rows: 4, pairs: 8 },
  '6x4': { label: '6×4 Dense Grid (12 pairs)', cols: 6, rows: 4, pairs: 12 },
};

export interface DisappearingDifficultyConfig {
  label: string;
  targetCount: number;
  totalOptions: number;
  memorizeSeconds: number;
  multiplier: number;
}

export const DISAPPEARING_DIFFICULTIES: Record<
  DisappearingDifficulty,
  DisappearingDifficultyConfig
> = {
  easy: {
    label: 'Easy',
    targetCount: 4,
    totalOptions: 8,
    memorizeSeconds: 5,
    multiplier: 1,
  },
  medium: {
    label: 'Medium',
    targetCount: 5,
    totalOptions: 12,
    memorizeSeconds: 4,
    multiplier: 1.35,
  },
  hard: {
    label: 'Hard',
    targetCount: 6,
    totalOptions: 16,
    memorizeSeconds: 3,
    multiplier: 1.75,
  },
};

export function createShuffledDeck(
  pairsCount: number,
  category: IconCategoryFilter = 'all'
): BoardCard[] {
  const symbols = pickRandomSymbols(pairsCount, category);
  const doubled: BoardCard[] = [];

  symbols.forEach((sym) => {
    doubled.push({
      uid: `${sym.id}-a-${Math.random().toString(36).slice(2, 7)}`,
      symbolId: sym.id,
      label: sym.label,
      emoji: sym.emoji,
      accent: sym.accent,
      isFlipped: false,
      isMatched: false,
    });
    doubled.push({
      uid: `${sym.id}-b-${Math.random().toString(36).slice(2, 7)}`,
      symbolId: sym.id,
      label: sym.label,
      emoji: sym.emoji,
      accent: sym.accent,
      isFlipped: false,
      isMatched: false,
    });
  });

  return shuffleArray(doubled);
}

export function createDisappearingRound(
  difficulty: DisappearingDifficulty,
  category: IconCategoryFilter = 'all'
): {
  targets: MemorySymbol[];
  options: MemorySymbol[];
} {
  const cfg = DISAPPEARING_DIFFICULTIES[difficulty];
  // pickRandomSymbols guarantees zero duplicate emojis or IDs
  const combined = pickRandomSymbols(cfg.totalOptions, category);
  const targets = combined.slice(0, cfg.targetCount);
  const options = shuffleArray(combined);

  return { targets, options };
}

export function calculateNormalScoreAndXP(params: {
  difficulty: NormalDifficulty;
  pairs: number;
  moves: number;
  durationSeconds: number;
}) {
  const { difficulty, pairs, moves, durationSeconds } = params;
  const cfg = NORMAL_DIFFICULTIES[difficulty];
  const accuracy =
    moves > 0 ? Math.min(100, Math.round((pairs / moves) * 100)) : 100;

  const baseMatchPoints = pairs * cfg.baseScorePerPair;
  const accuracyBonus = Math.round(accuracy * 6);
  const timeSaved = Math.max(0, cfg.targetTimeSeconds - durationSeconds);
  const speedBonus = Math.round(timeSaved * 12);
  const moveEfficiencyBonus = Math.max(0, (pairs * 2 - moves) * 25);

  const score =
    baseMatchPoints + accuracyBonus + speedBonus + moveEfficiencyBonus;

  const difficultyXPBase =
    difficulty === 'hard' ? 140 : difficulty === 'medium' ? 95 : 65;
  const efficiencyXP = Math.round((accuracy / 100) * 45);
  const speedXP = Math.min(40, Math.round(timeSaved * 0.7));
  const xpEarned = difficultyXPBase + efficiencyXP + speedXP;

  return {
    score,
    accuracy,
    xpEarned,
  };
}

export function getComboPoints(nextCombo: number): number {
  // Pair 1 = 100, Pair 2 = 150, Pair 3 = 200, Pair 4 = 250, Pair 5+ = 300 (cap)
  const bonus = Math.min(4, Math.max(0, nextCombo - 1)) * 50;
  return 100 + bonus;
}

export function calculateTimeAttackXP(params: {
  score: number;
  pairsMatched: number;
  highestCombo: number;
}) {
  const { score, pairsMatched, highestCombo } = params;
  if (pairsMatched === 0) return 15; // Participation XP for completing 60s
  return Math.max(
    25,
    Math.round(pairsMatched * 10 + highestCombo * 12 + score * 0.04)
  );
}

export function calculateDisappearingScoreAndXP(params: {
  difficulty: DisappearingDifficulty;
  correctCount: number;
  targetCount: number;
  round: number;
}) {
  const { difficulty, correctCount, targetCount, round } = params;
  const cfg = DISAPPEARING_DIFFICULTIES[difficulty];
  const accuracy =
    targetCount > 0 ? Math.round((correctCount / targetCount) * 100) : 0;

  const perfectBonus = correctCount === targetCount ? 250 : 0;
  const roundBonus = (round - 1) * 40;
  const score = Math.round(
    (correctCount * 140 + perfectBonus + roundBonus) * cfg.multiplier
  );

  const xpBase = difficulty === 'hard' ? 75 : difficulty === 'medium' ? 55 : 40;
  const recallXP = Math.round((accuracy / 100) * 45);
  const perfectXP = correctCount === targetCount ? 20 : 0;
  const xpEarned = Math.max(15, xpBase + recallXP + perfectXP);

  return {
    score,
    accuracy,
    xpEarned,
  };
}

export function formatTimeMMSS(totalSeconds: number): string {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(clamped / 60);
  const secs = clamped % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function formatDurationShort(totalSeconds: number): string {
  const clamped = Math.max(0, Math.round(totalSeconds));
  if (clamped < 60) return `${clamped}s`;
  const mins = Math.floor(clamped / 60);
  const secs = clamped % 60;
  if (mins < 60) return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  return `${hrs}h ${remMins}m`;
}

export function generateSessionId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `mem-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
