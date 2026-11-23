import { evaluateAchievements } from '../data/achievements';
import {
  BestScores,
  DerivedPlayerStats,
  GameSession,
  MemoraPersistedData,
  NormalDifficulty,
  SessionRecordResult,
  StreakState,
} from '../types/memora';

export const STORAGE_KEY = 'memora_beyond_memory_v1';
export const THEME_STORAGE_KEY = 'memora_theme_v1';
export const STORAGE_VERSION = 1;
export const XP_PER_LEVEL = 250;
export const DEFAULT_AVATAR_URL =
  '/src/assets/images/memora_avatar_explorer_1795422773274.jpg';

let inMemoryFallback: MemoraPersistedData | null = null;

export function getLocalDateString(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getPreviousDateString(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() - 1);
  return getLocalDateString(dt);
}

export function createDefaultBestScores(): BestScores {
  return {
    normal: {
      easy: { bestScore: 0, bestTimeSeconds: null, lowestMoves: null },
      medium: { bestScore: 0, bestTimeSeconds: null, lowestMoves: null },
      hard: { bestScore: 0, bestTimeSeconds: null, lowestMoves: null },
    },
    timeAttack: {
      bestScore: 0,
      highestCombo: 0,
      mostPairs: 0,
    },
    disappearing: {
      bestScore: 0,
      highestRound: 0,
      bestAccuracy: 0,
    },
  };
}

export function createDefaultPersistedData(): MemoraPersistedData {
  return {
    version: STORAGE_VERSION,
    profile: {
      displayName: 'Brain Explorer',
      avatarUrl: DEFAULT_AVATAR_URL,
      createdAt: new Date().toISOString(),
    },
    totalXP: 0,
    sessions: [],
    unlockedAchievements: {},
    bestScores: createDefaultBestScores(),
    streak: {
      current: 0,
      longest: 0,
      lastPlayedDate: null,
      activeDates: [],
    },
    settings: {
      theme: 'dark',
    },
  };
}

function isRecord(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null && !Array.isArray(val);
}

function sanitizeNumber(val: unknown, fallback = 0): number {
  return typeof val === 'number' && Number.isFinite(val) && val >= 0
    ? val
    : fallback;
}

function validateSession(raw: unknown): GameSession | null {
  if (!isRecord(raw)) return null;
  if (
    typeof raw.id !== 'string' ||
    (raw.mode !== 'normal' &&
      raw.mode !== 'time-attack' &&
      raw.mode !== 'disappearing') ||
    typeof raw.difficulty !== 'string' ||
    raw.completed !== true ||
    typeof raw.timestamp !== 'string'
  ) {
    return null;
  }

  return {
    id: raw.id,
    mode: raw.mode,
    difficulty: raw.difficulty,
    score: sanitizeNumber(raw.score),
    xpEarned: sanitizeNumber(raw.xpEarned),
    accuracy: Math.min(100, sanitizeNumber(raw.accuracy)),
    durationSeconds: sanitizeNumber(raw.durationSeconds),
    completed: true,
    timestamp: raw.timestamp,
    moves: typeof raw.moves === 'number' ? raw.moves : undefined,
    pairsMatched:
      typeof raw.pairsMatched === 'number' ? raw.pairsMatched : undefined,
    totalPairs: typeof raw.totalPairs === 'number' ? raw.totalPairs : undefined,
    highestCombo:
      typeof raw.highestCombo === 'number' ? raw.highestCombo : undefined,
    correctSelections:
      typeof raw.correctSelections === 'number'
        ? raw.correctSelections
        : undefined,
    incorrectSelections:
      typeof raw.incorrectSelections === 'number'
        ? raw.incorrectSelections
        : undefined,
    missedSelections:
      typeof raw.missedSelections === 'number'
        ? raw.missedSelections
        : undefined,
    round: typeof raw.round === 'number' ? raw.round : undefined,
  };
}

function validateAndMigrate(raw: unknown): MemoraPersistedData {
  const defaults = createDefaultPersistedData();
  if (!isRecord(raw)) return defaults;

  const profileRaw = isRecord(raw.profile) ? raw.profile : {};
  const settingsRaw = isRecord(raw.settings) ? raw.settings : {};
  const streakRaw = isRecord(raw.streak) ? raw.streak : {};
  const bestRaw = isRecord(raw.bestScores) ? raw.bestScores : {};

  const sessions = Array.isArray(raw.sessions)
    ? raw.sessions
        .map(validateSession)
        .filter((s): s is GameSession => s !== null)
    : [];

  // Re-verify best scores safely
  const defaultBests = createDefaultBestScores();
  const normalRaw = isRecord(bestRaw.normal) ? bestRaw.normal : {};
  (['easy', 'medium', 'hard'] as NormalDifficulty[]).forEach((diff) => {
    const entry = isRecord(normalRaw[diff]) ? normalRaw[diff] : {};
    defaultBests.normal[diff] = {
      bestScore: sanitizeNumber(entry.bestScore),
      bestTimeSeconds:
        typeof entry.bestTimeSeconds === 'number' && entry.bestTimeSeconds >= 0
          ? entry.bestTimeSeconds
          : null,
      lowestMoves:
        typeof entry.lowestMoves === 'number' && entry.lowestMoves >= 0
          ? entry.lowestMoves
          : null,
    };
  });

  const taRaw = isRecord(bestRaw.timeAttack) ? bestRaw.timeAttack : {};
  defaultBests.timeAttack = {
    bestScore: sanitizeNumber(taRaw.bestScore),
    highestCombo: sanitizeNumber(taRaw.highestCombo),
    mostPairs: sanitizeNumber(taRaw.mostPairs),
  };

  const disRaw = isRecord(bestRaw.disappearing) ? bestRaw.disappearing : {};
  defaultBests.disappearing = {
    bestScore: sanitizeNumber(disRaw.bestScore),
    highestRound: sanitizeNumber(disRaw.highestRound),
    bestAccuracy: Math.min(100, sanitizeNumber(disRaw.bestAccuracy)),
  };

  const activeDates = Array.isArray(streakRaw.activeDates)
    ? streakRaw.activeDates.filter((d): d is string => typeof d === 'string')
    : [];

  const unlockedRaw = isRecord(raw.unlockedAchievements)
    ? raw.unlockedAchievements
    : {};
  const unlockedAchievements: MemoraPersistedData['unlockedAchievements'] = {};
  for (const [k, v] of Object.entries(unlockedRaw)) {
    if (typeof v === 'string') {
      unlockedAchievements[k as keyof typeof unlockedAchievements] = v;
    }
  }

  return {
    version: STORAGE_VERSION,
    profile: {
      displayName:
        typeof profileRaw.displayName === 'string' &&
        profileRaw.displayName.trim().length > 0
          ? profileRaw.displayName.trim().slice(0, 28)
          : defaults.profile.displayName,
      avatarUrl:
        typeof profileRaw.avatarUrl === 'string' && profileRaw.avatarUrl
          ? profileRaw.avatarUrl
          : defaults.profile.avatarUrl,
      createdAt:
        typeof profileRaw.createdAt === 'string'
          ? profileRaw.createdAt
          : defaults.profile.createdAt,
    },
    totalXP: sanitizeNumber(raw.totalXP),
    sessions,
    unlockedAchievements,
    bestScores: defaultBests,
    streak: {
      current: sanitizeNumber(streakRaw.current),
      longest: sanitizeNumber(streakRaw.longest),
      lastPlayedDate:
        typeof streakRaw.lastPlayedDate === 'string'
          ? streakRaw.lastPlayedDate
          : null,
      activeDates: Array.from(new Set(activeDates)),
    },
    settings: {
      theme:
        settingsRaw.theme === 'light' || settingsRaw.theme === 'dark'
          ? settingsRaw.theme
          : 'dark',
    },
  };
}

function canUseLocalStorage(): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    const probeKey = '__memora_probe__';
    window.localStorage.setItem(probeKey, '1');
    window.localStorage.removeItem(probeKey);
    return true;
  } catch {
    return false;
  }
}

export function loadMemoraData(): MemoraPersistedData {
  if (!canUseLocalStorage()) {
    if (!inMemoryFallback) {
      inMemoryFallback = createDefaultPersistedData();
    }
    return inMemoryFallback;
  }

  try {
    const rawText = window.localStorage.getItem(STORAGE_KEY);
    if (!rawText) {
      const defaults = createDefaultPersistedData();
      saveMemoraData(defaults);
      return defaults;
    }
    const parsed = JSON.parse(rawText);
    const validated = validateAndMigrate(parsed);
    // Refresh streak display if user missed days without resetting saved history
    const today = getLocalDateString();
    const yesterday = getPreviousDateString(today);
    if (
      validated.streak.lastPlayedDate &&
      validated.streak.lastPlayedDate !== today &&
      validated.streak.lastPlayedDate !== yesterday &&
      validated.streak.current !== 0
    ) {
      validated.streak.current = 0;
    }
    return validated;
  } catch {
    const defaults = createDefaultPersistedData();
    return defaults;
  }
}

export function saveMemoraData(data: MemoraPersistedData): void {
  inMemoryFallback = data;
  if (!canUseLocalStorage()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.localStorage.setItem(THEME_STORAGE_KEY, data.settings.theme);
  } catch {
    // Graceful degradation if quota exceeded or private mode blocks writes
  }
}

export function getLevelInfo(totalXP: number) {
  const safeXP = Math.max(0, Math.floor(totalXP));
  const level = Math.floor(safeXP / XP_PER_LEVEL) + 1;
  const xpInLevel = safeXP % XP_PER_LEVEL;
  const xpRemaining = XP_PER_LEVEL - xpInLevel;
  return {
    level,
    xpInLevel,
    xpForNextLevel: XP_PER_LEVEL,
    xpRemaining,
  };
}

export function computeDerivedStats(
  data: MemoraPersistedData
): DerivedPlayerStats {
  const levelInfo = getLevelInfo(data.totalXP);
  const totalGamesPlayed = data.sessions.length;
  const gamesCompleted = data.sessions.filter((s) => s.completed).length;

  const averageAccuracy =
    totalGamesPlayed > 0
      ? Math.round(
          data.sessions.reduce((acc, s) => acc + s.accuracy, 0) /
            totalGamesPlayed
        )
      : 0;

  const totalMatchingPairs = data.sessions.reduce(
    (sum, s) => sum + (s.pairsMatched ?? s.correctSelections ?? 0),
    0
  );

  const totalPlaytimeSeconds = data.sessions.reduce(
    (sum, s) => sum + s.durationSeconds,
    0
  );

  const bestOverallScore = data.sessions.reduce(
    (max, s) => Math.max(max, s.score),
    0
  );

  const normalTimes = (['easy', 'medium', 'hard'] as NormalDifficulty[])
    .map((d) => data.bestScores.normal[d].bestTimeSeconds)
    .filter((t): t is number => t !== null);
  const bestNormalTimeSeconds =
    normalTimes.length > 0 ? Math.min(...normalTimes) : null;

  const highestCombo = data.sessions.reduce(
    (max, s) => Math.max(max, s.highestCombo ?? 0),
    data.bestScores.timeAttack.highestCombo
  );

  return {
    ...levelInfo,
    totalGamesPlayed,
    gamesCompleted,
    averageAccuracy,
    totalMatchingPairs,
    totalPlaytimeSeconds,
    bestOverallScore,
    bestNormalTimeSeconds,
    highestCombo,
  };
}

function updateStreak(prev: StreakState, sessionDate: Date): StreakState {
  const today = getLocalDateString(sessionDate);
  const yesterday = getPreviousDateString(today);
  const activeDates = prev.activeDates.includes(today)
    ? prev.activeDates
    : [...prev.activeDates, today];

  if (prev.lastPlayedDate === today) {
    return {
      ...prev,
      activeDates,
    };
  }

  let nextCurrent = 1;
  if (prev.lastPlayedDate === yesterday) {
    nextCurrent = prev.current + 1;
  }

  return {
    current: nextCurrent,
    longest: Math.max(prev.longest, nextCurrent),
    lastPlayedDate: today,
    activeDates,
  };
}

export function appendCompletedSession(
  currentData: MemoraPersistedData,
  session: GameSession
): { nextData: MemoraPersistedData; result: SessionRecordResult } {
  // Prevent duplicate session records & duplicate XP awards
  if (currentData.sessions.some((s) => s.id === session.id)) {
    const lvl = getLevelInfo(currentData.totalXP).level;
    return {
      nextData: currentData,
      result: {
        session,
        leveledUp: false,
        previousLevel: lvl,
        newLevel: lvl,
        newlyUnlockedAchievements: [],
      },
    };
  }

  const previousLevel = getLevelInfo(currentData.totalXP).level;
  const nextXP = currentData.totalXP + Math.max(0, Math.round(session.xpEarned));
  const newLevel = getLevelInfo(nextXP).level;

  const nextBestScores: BestScores = {
    normal: {
      easy: { ...currentData.bestScores.normal.easy },
      medium: { ...currentData.bestScores.normal.medium },
      hard: { ...currentData.bestScores.normal.hard },
    },
    timeAttack: { ...currentData.bestScores.timeAttack },
    disappearing: { ...currentData.bestScores.disappearing },
  };

  if (session.mode === 'normal') {
    const diff = (
      ['easy', 'medium', 'hard'].includes(session.difficulty)
        ? session.difficulty
        : 'easy'
    ) as NormalDifficulty;
    const prevRec = nextBestScores.normal[diff];
    nextBestScores.normal[diff] = {
      bestScore: Math.max(prevRec.bestScore, session.score),
      bestTimeSeconds:
        prevRec.bestTimeSeconds === null
          ? session.durationSeconds
          : Math.min(prevRec.bestTimeSeconds, session.durationSeconds),
      lowestMoves:
        typeof session.moves === 'number'
          ? prevRec.lowestMoves === null
            ? session.moves
            : Math.min(prevRec.lowestMoves, session.moves)
          : prevRec.lowestMoves,
    };
  } else if (session.mode === 'time-attack') {
    nextBestScores.timeAttack = {
      bestScore: Math.max(nextBestScores.timeAttack.bestScore, session.score),
      highestCombo: Math.max(
        nextBestScores.timeAttack.highestCombo,
        session.highestCombo ?? 0
      ),
      mostPairs: Math.max(
        nextBestScores.timeAttack.mostPairs,
        session.pairsMatched ?? 0
      ),
    };
  } else if (session.mode === 'disappearing') {
    nextBestScores.disappearing = {
      bestScore: Math.max(nextBestScores.disappearing.bestScore, session.score),
      highestRound: Math.max(
        nextBestScores.disappearing.highestRound,
        session.round ?? 1
      ),
      bestAccuracy: Math.max(
        nextBestScores.disappearing.bestAccuracy,
        session.accuracy
      ),
    };
  }

  const nextStreak = updateStreak(
    currentData.streak,
    new Date(session.timestamp)
  );

  const preliminaryData: MemoraPersistedData = {
    ...currentData,
    totalXP: nextXP,
    sessions: [session, ...currentData.sessions],
    bestScores: nextBestScores,
    streak: nextStreak,
  };

  const { unlockedMap, newlyUnlocked } = evaluateAchievements(preliminaryData);

  const nextData: MemoraPersistedData = {
    ...preliminaryData,
    unlockedAchievements: unlockedMap,
  };

  saveMemoraData(nextData);

  return {
    nextData,
    result: {
      session,
      leveledUp: newLevel > previousLevel,
      previousLevel,
      newLevel,
      newlyUnlockedAchievements: newlyUnlocked,
    },
  };
}

export function resetPersistedData(keepTheme = true): MemoraPersistedData {
  const current = loadMemoraData();
  const fresh = createDefaultPersistedData();
  fresh.settings.theme = keepTheme ? current.settings.theme : 'dark';
  saveMemoraData(fresh);
  return fresh;
}
