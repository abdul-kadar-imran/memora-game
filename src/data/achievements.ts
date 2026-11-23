import {
  AchievementDefinition,
  AchievementId,
  AchievementProgress,
  MemoraPersistedData,
} from '../types/memora';

export const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: 'first_match',
    title: 'First Match',
    description: 'Complete your first memory game session.',
    target: 1,
    unit: 'game',
    iconName: 'Sparkles',
  },
  {
    id: 'memory_starter',
    title: 'Memory Starter',
    description: 'Complete 5 total game sessions across any mode.',
    target: 5,
    unit: 'games',
    iconName: 'Layers',
  },
  {
    id: 'perfect_recall',
    title: 'Perfect Recall',
    description: 'Finish a game with 100% accuracy.',
    target: 1,
    unit: 'perfect run',
    iconName: 'Target',
  },
  {
    id: 'speed_master',
    title: 'Speed Master',
    description: 'Score 1,000 or more points in Time Attack.',
    target: 1000,
    unit: 'pts',
    iconName: 'Zap',
  },
  {
    id: 'combo_king',
    title: 'Combo King',
    description: 'Reach a 5-match consecutive combo streak.',
    target: 5,
    unit: 'combo',
    iconName: 'Flame',
  },
  {
    id: 'daily_thinker',
    title: 'Daily Thinker',
    description: 'Play completed games on 3 consecutive days.',
    target: 3,
    unit: 'days',
    iconName: 'Calendar',
  },
  {
    id: 'brain_explorer',
    title: 'Brain Explorer',
    description: 'Complete at least one game in all 3 modes.',
    target: 3,
    unit: 'modes',
    iconName: 'Compass',
  },
  {
    id: 'memory_legend',
    title: 'Memory Legend',
    description: 'Earn 2,500 total XP across your memory journey.',
    target: 2500,
    unit: 'XP',
    iconName: 'Crown',
  },
];

export function evaluateAchievements(data: MemoraPersistedData): {
  unlockedMap: Partial<Record<AchievementId, string>>;
  newlyUnlocked: AchievementDefinition[];
} {
  const nextUnlocked: Partial<Record<AchievementId, string>> = {
    ...data.unlockedAchievements,
  };
  const newlyUnlocked: AchievementDefinition[] = [];
  const now = new Date().toISOString();

  const completedCount = data.sessions.length;
  const hasPerfectAccuracy = data.sessions.some((s) => s.accuracy >= 100);
  const maxTimeAttackScore = data.sessions
    .filter((s) => s.mode === 'time-attack')
    .reduce((max, s) => Math.max(max, s.score), 0);
  const maxCombo = data.sessions.reduce(
    (max, s) => Math.max(max, s.highestCombo ?? 0),
    0
  );
  const modesPlayed = new Set(data.sessions.map((s) => s.mode)).size;
  const bestStreak = Math.max(data.streak.current, data.streak.longest);

  const checks: Record<AchievementId, boolean> = {
    first_match: completedCount >= 1,
    memory_starter: completedCount >= 5,
    perfect_recall: hasPerfectAccuracy,
    speed_master: maxTimeAttackScore >= 1000,
    combo_king: maxCombo >= 5,
    daily_thinker: bestStreak >= 3,
    brain_explorer: modesPlayed >= 3,
    memory_legend: data.totalXP >= 2500,
  };

  for (const def of ACHIEVEMENTS) {
    if (checks[def.id] && !nextUnlocked[def.id]) {
      nextUnlocked[def.id] = now;
      newlyUnlocked.push(def);
    }
  }

  return { unlockedMap: nextUnlocked, newlyUnlocked };
}

export function getAchievementProgressList(
  data: MemoraPersistedData
): AchievementProgress[] {
  const completedCount = data.sessions.length;
  const perfectRuns = data.sessions.filter((s) => s.accuracy >= 100).length;
  const maxTimeAttackScore = data.sessions
    .filter((s) => s.mode === 'time-attack')
    .reduce((max, s) => Math.max(max, s.score), 0);
  const maxCombo = data.sessions.reduce(
    (max, s) => Math.max(max, s.highestCombo ?? 0),
    0
  );
  const modesPlayed = new Set(data.sessions.map((s) => s.mode)).size;
  const bestStreak = Math.max(data.streak.current, data.streak.longest);

  const currentMap: Record<AchievementId, number> = {
    first_match: Math.min(1, completedCount),
    memory_starter: Math.min(5, completedCount),
    perfect_recall: Math.min(1, perfectRuns),
    speed_master: Math.min(1000, maxTimeAttackScore),
    combo_king: Math.min(5, maxCombo),
    daily_thinker: Math.min(3, bestStreak),
    brain_explorer: Math.min(3, modesPlayed),
    memory_legend: Math.min(2500, data.totalXP),
  };

  return ACHIEVEMENTS.map((def) => {
    const unlockedAt = data.unlockedAchievements[def.id];
    const unlocked = Boolean(unlockedAt);
    const current = unlocked ? def.target : currentMap[def.id];
    const percent = Math.min(100, Math.round((current / def.target) * 100));

    return {
      ...def,
      unlocked,
      unlockedAt,
      current,
      percent,
    };
  });
}
