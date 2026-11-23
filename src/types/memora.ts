export type GameMode = 'normal' | 'time-attack' | 'disappearing';

export type NormalDifficulty = 'easy' | 'medium' | 'hard';
export type DisappearingDifficulty = 'easy' | 'medium' | 'hard';
export type TimeAttackGrid = '4x4' | '6x4';

export type IconCategoryKey =
  | 'everyday'
  | 'food'
  | 'nature'
  | 'animals'
  | 'travel'
  | 'technology'
  | 'sports'
  | 'lifestyle';

export type IconCategoryFilter = 'all' | IconCategoryKey;

export interface MemorySymbol {
  id: string;
  label: string;
  emoji: string;
  category: IconCategoryKey;
  accent: string;
}

export interface GameSession {
  id: string;
  mode: GameMode;
  difficulty: string;
  score: number;
  xpEarned: number;
  accuracy: number;
  durationSeconds: number;
  completed: true;
  timestamp: string; // ISO string
  // Mode-specific optional metrics
  moves?: number;
  pairsMatched?: number;
  totalPairs?: number;
  highestCombo?: number;
  correctSelections?: number;
  incorrectSelections?: number;
  missedSelections?: number;
  round?: number;
}

export type AchievementId =
  | 'first_match'
  | 'memory_starter'
  | 'perfect_recall'
  | 'speed_master'
  | 'combo_king'
  | 'daily_thinker'
  | 'brain_explorer'
  | 'memory_legend';

export interface AchievementDefinition {
  id: AchievementId;
  title: string;
  description: string;
  target: number;
  unit: string;
  iconName:
    | 'Sparkles'
    | 'Layers'
    | 'Target'
    | 'Zap'
    | 'Flame'
    | 'Calendar'
    | 'Compass'
    | 'Crown';
}

export interface AchievementProgress extends AchievementDefinition {
  unlocked: boolean;
  unlockedAt?: string;
  current: number;
  percent: number;
}

export interface NormalBestRecord {
  bestScore: number;
  bestTimeSeconds: number | null;
  lowestMoves: number | null;
}

export interface BestScores {
  normal: Record<NormalDifficulty, NormalBestRecord>;
  timeAttack: {
    bestScore: number;
    highestCombo: number;
    mostPairs: number;
  };
  disappearing: {
    bestScore: number;
    highestRound: number;
    bestAccuracy: number;
  };
}

export interface PlayerProfile {
  displayName: string;
  avatarUrl: string;
  createdAt: string;
}

export interface StreakState {
  current: number;
  longest: number;
  lastPlayedDate: string | null; // YYYY-MM-DD local date
  activeDates: string[]; // unique YYYY-MM-DD local dates
}

export type MemoraTheme = 'dark' | 'light';

export interface PlayerSettings {
  theme: MemoraTheme;
}

export interface MemoraPersistedData {
  version: number;
  profile: PlayerProfile;
  totalXP: number;
  sessions: GameSession[];
  unlockedAchievements: Partial<Record<AchievementId, string>>; // id -> ISO timestamp
  bestScores: BestScores;
  streak: StreakState;
  settings: PlayerSettings;
}

export interface DerivedPlayerStats {
  level: number;
  xpInLevel: number;
  xpForNextLevel: number;
  xpRemaining: number;
  totalGamesPlayed: number;
  gamesCompleted: number;
  averageAccuracy: number;
  totalMatchingPairs: number;
  totalPlaytimeSeconds: number;
  bestOverallScore: number;
  bestNormalTimeSeconds: number | null;
  highestCombo: number;
}

export interface SessionRecordResult {
  session: GameSession;
  leveledUp: boolean;
  previousLevel: number;
  newLevel: number;
  newlyUnlockedAchievements: AchievementDefinition[];
}
