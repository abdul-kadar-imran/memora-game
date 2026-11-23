import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  Award,
  Calendar,
  Check,
  Compass,
  Crown,
  Edit3,
  Flame,
  Gamepad2,
  Layers,
  Lock,
  Sparkles,
  Target,
  Trash2,
  Trophy,
  Zap,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useMemoraStore } from '../hooks/useMemoraStore';
import { AppRoute } from '../hooks/useRouter';
import { AchievementDefinition, GameMode } from '../types/memora';
import { formatDurationShort } from '../utils/gameLogic';

interface DashboardPageProps {
  onNavigate: (route: AppRoute) => void;
}

const MODE_LABELS: Record<GameMode, string> = {
  normal: 'Normal Match',
  'time-attack': 'Time Attack',
  disappearing: 'Disappearing',
};

const ACHIEVEMENT_ICONS: Record<
  AchievementDefinition['iconName'],
  React.FC<{ className?: string }>
> = {
  Sparkles,
  Layers,
  Target,
  Zap,
  Flame,
  Calendar,
  Compass,
  Crown,
};

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const {
    data,
    theme,
    stats,
    achievements,
    updateDisplayName,
    resetProgress,
  } = useMemoraStore();

  const isDark = theme === 'dark';

  const chartColors = useMemo(
    () => ({
      grid: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(128,86,232,0.12)',
      axis: isDark ? '#929BB8' : '#5E6282',
      tooltipBg: isDark ? '#171C35' : '#FFFFFF',
      tooltipText: isDark ? '#F5F5FF' : '#20213A',
      tooltipBorderPurple: isDark
        ? 'rgba(155,123,255,0.4)'
        : 'rgba(128,86,232,0.35)',
      tooltipBorderCyan: isDark
        ? 'rgba(85,217,255,0.4)'
        : 'rgba(53,200,232,0.45)',
      tooltipBorderGreen: isDark
        ? 'rgba(55,217,154,0.4)'
        : 'rgba(37,185,133,0.4)',
      purple: isDark ? '#9B7BFF' : '#8056E8',
      blue: isDark ? '#527BFF' : '#477BFF',
      cyan: isDark ? '#55D9FF' : '#35C8E8',
      green: isDark ? '#37D99A' : '#25B985',
    }),
    [isDark]
  );

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(data.profile.displayName);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    updateDisplayName(nameInput);
    setIsEditingName(false);
  };

  const levelPct = Math.round((stats.xpInLevel / stats.xpForNextLevel) * 100);

  // Chart 1 & 4: Chronological score & accuracy history (up to last 15 sessions)
  const chronologicalSessions = useMemo(() => {
    return [...data.sessions]
      .slice(0, 15)
      .reverse()
      .map((s, idx) => ({
        index: `#${idx + 1}`,
        score: s.score,
        accuracy: s.accuracy,
        mode: MODE_LABELS[s.mode],
      }));
  }, [data.sessions]);

  // Chart 2: Performance per Game Mode
  const modePerformanceData = useMemo(() => {
    const modes: GameMode[] = ['normal', 'time-attack', 'disappearing'];
    return modes.map((mode) => {
      const list = data.sessions.filter((s) => s.mode === mode);
      const avgScore =
        list.length > 0
          ? Math.round(list.reduce((sum, s) => sum + s.score, 0) / list.length)
          : 0;
      const bestScore = list.reduce((max, s) => Math.max(max, s.score), 0);
      return {
        mode: MODE_LABELS[mode],
        avgScore,
        bestScore,
        games: list.length,
      };
    });
  }, [data.sessions]);

  // Chart 3: Daily Activity (grouped by local date)
  const dailyActivityData = useMemo(() => {
    const map = new Map<string, { date: string; games: number; xp: number }>();
    [...data.sessions].reverse().forEach((s) => {
      const dt = new Date(s.timestamp);
      const label = dt.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });
      const existing = map.get(label) ?? { date: label, games: 0, xp: 0 };
      existing.games += 1;
      existing.xp += s.xpEarned;
      map.set(label, existing);
    });
    return Array.from(map.values()).slice(-10);
  }, [data.sessions]);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Welcome & Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="rounded-3xl border border-[#8056E8]/15 dark:border-white/10 bg-[#FFFFFF] dark:bg-[#11152A] p-6 sm:p-8 shadow-xs dark:shadow-none transition-colors duration-200"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4 sm:gap-5">
            {/* Avatar */}
            <div className="h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-2xl border border-[#8056E8]/35 dark:border-[#9B7BFF]/45 bg-[#EFECFF] dark:bg-[#171C35]">
              {!avatarFailed ? (
                <img
                  src={data.profile.avatarUrl}
                  alt={data.profile.displayName}
                  referrerPolicy="no-referrer"
                  onError={() => setAvatarFailed(true)}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl font-extrabold text-[#8056E8] dark:text-[#9B7BFF]">
                  {data.profile.displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                {isEditingName ? (
                  <form
                    onSubmit={handleSaveName}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="text"
                      value={nameInput}
                      maxLength={28}
                      autoFocus
                      onChange={(e) => setNameInput(e.target.value)}
                      aria-label="Display name"
                      className="h-9 rounded-xl border border-[#35C8E8] dark:border-[#55D9FF]/60 bg-[#EFECFF] dark:bg-[#171C35] px-3 text-sm font-semibold text-[#20213A] dark:text-[#F5F5FF] focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="flex h-9 items-center gap-1 rounded-xl bg-[#25B985] dark:bg-[#37D99A] px-3 text-xs font-bold text-white dark:text-[#090B18]"
                    >
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Save</span>
                    </button>
                  </form>
                ) : (
                  <>
                    <span className="text-sm font-semibold text-[#477BFF] dark:text-[#55D9FF]">
                      {data.profile.displayName}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setNameInput(data.profile.displayName);
                        setIsEditingName(true);
                      }}
                      aria-label="Edit display name"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#5E6282] dark:text-[#929BB8] hover:bg-[#EFECFF] dark:hover:bg-[#171C35] hover:text-[#20213A] dark:hover:text-[#F5F5FF] transition-colors"
                    >
                      <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </>
                )}
              </div>

              <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-[#20213A] dark:text-[#F5F5FF]">
                Welcome back, Brain Explorer!
              </h1>
              <p className="mt-1.5 text-sm text-[#5E6282] dark:text-[#929BB8] max-w-xl">
                Your memory journey continues. Keep challenging yourself and
                unlock new achievements.
              </p>
            </div>
          </div>

          {/* Level & XP Bar */}
          <div className="w-full lg:w-80 rounded-2xl border border-[#8056E8]/25 dark:border-[#9B7BFF]/30 bg-[#EFECFF]/75 dark:bg-[#171C35] p-4 shrink-0">
            <div className="flex items-center justify-between text-sm">
              <span className="font-bold text-[#20213A] dark:text-[#F5F5FF]">
                Level {stats.level}
              </span>
              <span className="font-mono-tabular font-bold text-[#477BFF] dark:text-[#55D9FF]">
                {data.totalXP.toLocaleString()} XP
              </span>
            </div>
            <div className="mt-2.5 h-2.5 w-full overflow-hidden rounded-full bg-[#FFFFFF] dark:bg-[#090B18]">
              <div
                style={{ width: `${levelPct}%` }}
                className="h-full rounded-full bg-gradient-to-r from-[#8056E8] via-[#477BFF] to-[#35C8E8] dark:from-[#9B7BFF] dark:via-[#527BFF] dark:to-[#55D9FF] transition-all duration-300"
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-[#5E6282] dark:text-[#929BB8]">
              <span className="font-mono-tabular">
                {stats.xpInLevel} / {stats.xpForNextLevel} XP
              </span>
              <span className="font-mono-tabular">
                {stats.xpRemaining} XP to Level {stats.level + 1}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Four Primary Statistic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-[#8056E8]/15 dark:border-white/10 bg-[#FFFFFF] dark:bg-[#171C35] p-5 shadow-xs dark:shadow-none">
          <div className="text-xs font-medium text-[#5E6282] dark:text-[#929BB8]">
            Total Games Played
          </div>
          <div className="mt-2 font-mono-tabular text-3xl font-extrabold text-[#20213A] dark:text-[#F5F5FF]">
            {stats.totalGamesPlayed}
          </div>
          <div className="mt-1 text-xs text-[#5E6282] dark:text-[#929BB8]">
            Completed cognitive sessions
          </div>
        </div>

        <div className="rounded-2xl border border-[#8056E8]/15 dark:border-white/10 bg-[#FFFFFF] dark:bg-[#171C35] p-5 shadow-xs dark:shadow-none">
          <div className="text-xs font-medium text-[#5E6282] dark:text-[#929BB8]">
            Total XP Earned
          </div>
          <div className="mt-2 font-mono-tabular text-3xl font-extrabold text-[#477BFF] dark:text-[#55D9FF]">
            {data.totalXP.toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-[#5E6282] dark:text-[#929BB8]">
            Level {stats.level} progression
          </div>
        </div>

        <div className="rounded-2xl border border-[#8056E8]/15 dark:border-white/10 bg-[#FFFFFF] dark:bg-[#171C35] p-5 shadow-xs dark:shadow-none">
          <div className="text-xs font-medium text-[#5E6282] dark:text-[#929BB8]">
            Best Score
          </div>
          <div className="mt-2 font-mono-tabular text-3xl font-extrabold text-[#8056E8] dark:text-[#9B7BFF]">
            {stats.bestOverallScore > 0
              ? stats.bestOverallScore.toLocaleString()
              : '—'}
          </div>
          <div className="mt-1 text-xs text-[#5E6282] dark:text-[#929BB8]">
            Highest single-session score
          </div>
        </div>

        <div className="rounded-2xl border border-[#8056E8]/15 dark:border-white/10 bg-[#FFFFFF] dark:bg-[#171C35] p-5 shadow-xs dark:shadow-none">
          <div className="text-xs font-medium text-[#5E6282] dark:text-[#929BB8]">
            Current Daily Streak
          </div>
          <div className="mt-2 font-mono-tabular text-3xl font-extrabold text-[#25B985] dark:text-[#37D99A]">
            {data.streak.current} {data.streak.current === 1 ? 'day' : 'days'}
          </div>
          <div className="mt-1 text-xs text-[#5E6282] dark:text-[#929BB8]">
            Best streak: {data.streak.longest}d
          </div>
        </div>
      </div>

      {/* Secondary Statistics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="rounded-2xl border border-[#8056E8]/15 dark:border-white/10 bg-[#EFECFF]/65 dark:bg-[#11152A] p-4">
          <div className="text-[11px] font-medium text-[#5E6282] dark:text-[#929BB8]">
            Games Completed
          </div>
          <div className="mt-1 font-mono-tabular text-lg font-bold text-[#20213A] dark:text-[#F5F5FF]">
            {stats.gamesCompleted}
          </div>
        </div>
        <div className="rounded-2xl border border-[#8056E8]/15 dark:border-white/10 bg-[#EFECFF]/65 dark:bg-[#11152A] p-4">
          <div className="text-[11px] font-medium text-[#5E6282] dark:text-[#929BB8]">
            Average Accuracy
          </div>
          <div className="mt-1 font-mono-tabular text-lg font-bold text-[#25B985] dark:text-[#37D99A]">
            {stats.totalGamesPlayed > 0 ? `${stats.averageAccuracy}%` : '—'}
          </div>
        </div>
        <div className="rounded-2xl border border-[#8056E8]/15 dark:border-white/10 bg-[#EFECFF]/65 dark:bg-[#11152A] p-4">
          <div className="text-[11px] font-medium text-[#5E6282] dark:text-[#929BB8]">
            Matching Pairs
          </div>
          <div className="mt-1 font-mono-tabular text-lg font-bold text-[#20213A] dark:text-[#F5F5FF]">
            {stats.totalMatchingPairs}
          </div>
        </div>
        <div className="rounded-2xl border border-[#8056E8]/15 dark:border-white/10 bg-[#EFECFF]/65 dark:bg-[#11152A] p-4">
          <div className="text-[11px] font-medium text-[#5E6282] dark:text-[#929BB8]">
            Total Playtime
          </div>
          <div className="mt-1 font-mono-tabular text-lg font-bold text-[#0891B2] dark:text-[#55D9FF]">
            {stats.totalPlaytimeSeconds > 0
              ? formatDurationShort(stats.totalPlaytimeSeconds)
              : '0s'}
          </div>
        </div>
        <div className="rounded-2xl border border-[#8056E8]/15 dark:border-white/10 bg-[#EFECFF]/65 dark:bg-[#11152A] p-4">
          <div className="text-[11px] font-medium text-[#5E6282] dark:text-[#929BB8]">
            Best Clear Time
          </div>
          <div className="mt-1 font-mono-tabular text-lg font-bold text-[#8056E8] dark:text-[#9B7BFF]">
            {stats.bestNormalTimeSeconds !== null
              ? formatDurationShort(stats.bestNormalTimeSeconds)
              : '—'}
          </div>
        </div>
        <div className="rounded-2xl border border-[#8056E8]/15 dark:border-white/10 bg-[#EFECFF]/65 dark:bg-[#11152A] p-4">
          <div className="text-[11px] font-medium text-[#5E6282] dark:text-[#929BB8]">
            Highest Combo
          </div>
          <div className="mt-1 font-mono-tabular text-lg font-bold text-[#20213A] dark:text-[#F5F5FF]">
            {stats.highestCombo > 0 ? `${stats.highestCombo}x` : '—'}
          </div>
        </div>
      </div>

      {/* Performance Charts (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Chart 1: Score History */}
        <div className="rounded-3xl border border-[#8056E8]/15 dark:border-white/10 bg-[#FFFFFF] dark:bg-[#11152A] p-5 sm:p-6 shadow-xs dark:shadow-none">
          <h2 className="text-base font-bold text-[#20213A] dark:text-[#F5F5FF]">
            Score History
          </h2>
          <p className="text-xs text-[#5E6282] dark:text-[#929BB8] mt-0.5">
            Recent completed session scores
          </p>

          <div className="mt-4 h-60 w-full">
            {chronologicalSessions.length < 1 ? (
              <EmptyChartState onPlay={() => onNavigate('/')} />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chronologicalSessions}>
                  <defs>
                    <linearGradient id="scoreArea" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor={chartColors.purple}
                        stopOpacity={0.4}
                      />
                      <stop
                        offset="100%"
                        stopColor={chartColors.purple}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke={chartColors.grid} vertical={false} />
                  <XAxis
                    dataKey="index"
                    stroke={chartColors.axis}
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke={chartColors.axis}
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: chartColors.tooltipBg,
                      borderColor: chartColors.tooltipBorderPurple,
                      borderRadius: '12px',
                      color: chartColors.tooltipText,
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    name="Score"
                    stroke={chartColors.purple}
                    strokeWidth={2.5}
                    fill="url(#scoreArea)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 2: Game Mode Performance */}
        <div className="rounded-3xl border border-[#8056E8]/15 dark:border-white/10 bg-[#FFFFFF] dark:bg-[#11152A] p-5 sm:p-6 shadow-xs dark:shadow-none">
          <h2 className="text-base font-bold text-[#20213A] dark:text-[#F5F5FF]">
            Game Mode Performance
          </h2>
          <p className="text-xs text-[#5E6282] dark:text-[#929BB8] mt-0.5">
            Average vs. best score by mode
          </p>

          <div className="mt-4 h-60 w-full">
            {data.sessions.length < 1 ? (
              <EmptyChartState onPlay={() => onNavigate('/')} />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={modePerformanceData}>
                  <CartesianGrid stroke={chartColors.grid} vertical={false} />
                  <XAxis
                    dataKey="mode"
                    stroke={chartColors.axis}
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke={chartColors.axis}
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: chartColors.tooltipBg,
                      borderColor: chartColors.tooltipBorderCyan,
                      borderRadius: '12px',
                      color: chartColors.tooltipText,
                      fontSize: '12px',
                    }}
                  />
                  <Bar
                    dataKey="avgScore"
                    name="Avg Score"
                    fill={chartColors.blue}
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey="bestScore"
                    name="Best Score"
                    fill={chartColors.cyan}
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 3: Daily Activity */}
        <div className="rounded-3xl border border-[#8056E8]/15 dark:border-white/10 bg-[#FFFFFF] dark:bg-[#11152A] p-5 sm:p-6 shadow-xs dark:shadow-none">
          <h2 className="text-base font-bold text-[#20213A] dark:text-[#F5F5FF]">
            Daily Activity
          </h2>
          <p className="text-xs text-[#5E6282] dark:text-[#929BB8] mt-0.5">
            Completed games per active day
          </p>

          <div className="mt-4 h-60 w-full">
            {dailyActivityData.length < 1 ? (
              <EmptyChartState onPlay={() => onNavigate('/')} />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyActivityData}>
                  <CartesianGrid stroke={chartColors.grid} vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke={chartColors.axis}
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    stroke={chartColors.axis}
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: chartColors.tooltipBg,
                      borderColor: chartColors.tooltipBorderGreen,
                      borderRadius: '12px',
                      color: chartColors.tooltipText,
                      fontSize: '12px',
                    }}
                  />
                  <Bar
                    dataKey="games"
                    name="Games Played"
                    fill={chartColors.green}
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 4: Accuracy Trend */}
        <div className="rounded-3xl border border-[#8056E8]/15 dark:border-white/10 bg-[#FFFFFF] dark:bg-[#11152A] p-5 sm:p-6 shadow-xs dark:shadow-none">
          <h2 className="text-base font-bold text-[#20213A] dark:text-[#F5F5FF]">
            Accuracy Trend
          </h2>
          <p className="text-xs text-[#5E6282] dark:text-[#929BB8] mt-0.5">
            Recall precision (%) across recent sessions
          </p>

          <div className="mt-4 h-60 w-full">
            {chronologicalSessions.length < 1 ? (
              <EmptyChartState onPlay={() => onNavigate('/')} />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chronologicalSessions}>
                  <CartesianGrid stroke={chartColors.grid} vertical={false} />
                  <XAxis
                    dataKey="index"
                    stroke={chartColors.axis}
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    stroke={chartColors.axis}
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: chartColors.tooltipBg,
                      borderColor: chartColors.tooltipBorderCyan,
                      borderRadius: '12px',
                      color: chartColors.tooltipText,
                      fontSize: '12px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="accuracy"
                    name="Accuracy %"
                    stroke={chartColors.cyan}
                    strokeWidth={2.5}
                    dot={{ r: 3.5, fill: chartColors.cyan }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Achievements Section */}
      <div className="rounded-3xl border border-[#8056E8]/15 dark:border-white/10 bg-[#FFFFFF] dark:bg-[#11152A] p-5 sm:p-7 shadow-xs dark:shadow-none">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#20213A] dark:text-[#F5F5FF]">
              Achievements
            </h2>
            <p className="text-xs sm:text-sm text-[#5E6282] dark:text-[#929BB8]">
              {unlockedCount} of {achievements.length} milestones unlocked
            </p>
          </div>
          <div className="flex items-center gap-2 font-mono-tabular text-sm font-bold text-[#8056E8] dark:text-[#9B7BFF]">
            <Trophy className="h-4 w-4" aria-hidden="true" />
            <span>
              {unlockedCount}/{achievements.length}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {achievements.map((ach) => {
            const IconComp = ACHIEVEMENT_ICONS[ach.iconName] ?? Award;
            return (
              <motion.div
                key={ach.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex flex-col justify-between rounded-2xl border p-4 transition-colors ${
                  ach.unlocked
                    ? 'border-[#25B985]/45 dark:border-[#37D99A]/45 bg-[#E6F8F1]/45 dark:bg-[#171C35]'
                    : 'border-[#8056E8]/15 dark:border-white/10 bg-[#F8F7FF] dark:bg-[#13182E]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        ach.unlocked
                          ? 'bg-[#25B985]/15 dark:bg-[#37D99A]/15 text-[#25B985] dark:text-[#37D99A]'
                          : 'bg-[#EFECFF] dark:bg-[#090B18] text-[#5E6282] dark:text-[#929BB8]'
                      }`}
                    >
                      <IconComp className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                        ach.unlocked
                          ? 'text-[#25B985] dark:text-[#37D99A]'
                          : 'text-[#5E6282] dark:text-[#929BB8]'
                      }`}
                    >
                      {ach.unlocked ? (
                        <>
                          <Check className="h-3 w-3" aria-hidden="true" />
                          <span>Unlocked</span>
                        </>
                      ) : (
                        <>
                          <Lock className="h-3 w-3" aria-hidden="true" />
                          <span>Locked</span>
                        </>
                      )}
                    </span>
                  </div>

                  <h3 className="mt-3 text-sm font-bold text-[#20213A] dark:text-[#F5F5FF]">
                    {ach.title}
                  </h3>
                  <p className="mt-1 text-xs text-[#5E6282] dark:text-[#929BB8] leading-relaxed">
                    {ach.description}
                  </p>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between text-[11px] text-[#5E6282] dark:text-[#929BB8] font-mono-tabular">
                    <span>
                      {ach.current.toLocaleString()} /{' '}
                      {ach.target.toLocaleString()} {ach.unit}
                    </span>
                    <span>{ach.percent}%</span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[#EFECFF] dark:bg-[#090B18]">
                    <div
                      style={{ width: `${ach.percent}%` }}
                      className={`h-full rounded-full transition-all duration-300 ${
                        ach.unlocked
                          ? 'bg-[#25B985] dark:bg-[#37D99A]'
                          : 'bg-gradient-to-r from-[#8056E8] to-[#35C8E8] dark:from-[#9B7BFF] dark:to-[#55D9FF]'
                      }`}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Recent Game History */}
      <div className="rounded-3xl border border-[#8056E8]/15 dark:border-white/10 bg-[#FFFFFF] dark:bg-[#11152A] p-5 sm:p-7 shadow-xs dark:shadow-none">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#20213A] dark:text-[#F5F5FF]">
              Recent Game History
            </h2>
            <p className="text-xs sm:text-sm text-[#5E6282] dark:text-[#929BB8]">
              Completed sessions recorded automatically
            </p>
          </div>
          {data.sessions.length > 0 && (
            <span className="font-mono-tabular text-xs font-semibold text-[#5E6282] dark:text-[#929BB8]">
              {data.sessions.length} total sessions
            </span>
          )}
        </div>

        {data.sessions.length === 0 ? (
          <div className="rounded-2xl border border-[#8056E8]/15 dark:border-white/10 bg-[#EFECFF]/55 dark:bg-[#171C35]/50 py-10 px-4 text-center">
            <Gamepad2
              className="mx-auto h-9 w-9 text-[#8056E8] dark:text-[#9B7BFF]"
              aria-hidden="true"
            />
            <h3 className="mt-3 text-base font-bold text-[#20213A] dark:text-[#F5F5FF]">
              No Completed Games Yet
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-[#5E6282] dark:text-[#929BB8] max-w-md mx-auto">
              Finish a round in Normal Match, Time Attack, or Disappearing
              Memory to see your full session history here.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="mt-4 h-11 rounded-xl bg-gradient-to-r from-[#8056E8] to-[#477BFF] dark:from-[#9B7BFF] dark:to-[#527BFF] px-5 text-xs sm:text-sm font-bold text-white hover:brightness-110 transition-all"
            >
              Go to Game Arena
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-[#8056E8]/15 dark:border-white/10 text-[11px] font-semibold text-[#5E6282] dark:text-[#929BB8]">
                  <th className="py-3 pr-4">Game Mode</th>
                  <th className="py-3 px-4">Difficulty / Round</th>
                  <th className="py-3 px-4">Date &amp; Time</th>
                  <th className="py-3 px-4 text-right">Score</th>
                  <th className="py-3 px-4 text-right">Accuracy</th>
                  <th className="py-3 pl-4 text-right">XP Earned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#8056E8]/10 dark:divide-white/5">
                {data.sessions.slice(0, 15).map((session) => (
                  <tr
                    key={session.id}
                    className="hover:bg-[#EFECFF]/55 dark:hover:bg-[#171C35]/60 transition-colors"
                  >
                    <td className="py-3.5 pr-4 font-semibold text-[#20213A] dark:text-[#F5F5FF]">
                      {MODE_LABELS[session.mode]}
                    </td>
                    <td className="py-3.5 px-4 text-[#5E6282] dark:text-[#929BB8] capitalize">
                      {session.difficulty}
                      {session.round ? ` · Round ${session.round}` : ''}
                    </td>
                    <td className="py-3.5 px-4 font-mono-tabular text-xs text-[#5E6282] dark:text-[#929BB8]">
                      {new Date(session.timestamp).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono-tabular font-bold text-[#20213A] dark:text-[#F5F5FF]">
                      {session.score.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono-tabular font-semibold text-[#25B985] dark:text-[#37D99A]">
                      {session.accuracy}%
                    </td>
                    <td className="py-3.5 pl-4 text-right font-mono-tabular font-bold text-[#477BFF] dark:text-[#55D9FF]">
                      +{session.xpEarned} XP
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reset Progress Section */}
      <div className="rounded-3xl border border-[#E11D48]/25 dark:border-[#FF5D78]/25 bg-[#FFFFFF] dark:bg-[#11152A] p-5 sm:p-6 shadow-xs dark:shadow-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-[#20213A] dark:text-[#F5F5FF]">
              Reset Saved Progress
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#5E6282] dark:text-[#929BB8]">
              Clear all XP, game history, personal best scores, streaks, and
              unlocked achievements from local storage.
            </p>
          </div>

          {!confirmResetOpen ? (
            <button
              type="button"
              onClick={() => setConfirmResetOpen(true)}
              className="flex h-11 items-center justify-center gap-2 rounded-xl border border-[#E11D48]/40 dark:border-[#FF5D78]/45 bg-[#FFE9EE] dark:bg-[#2E1626] px-4 text-xs sm:text-sm font-semibold text-[#E11D48] dark:text-[#FF5D78] hover:bg-[#FFD7E0] dark:hover:bg-[#3D1B31] transition-colors whitespace-nowrap shrink-0"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              <span>Reset Data</span>
            </button>
          ) : (
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <span className="text-xs font-semibold text-[#E11D48] dark:text-[#FF5D78]">
                Are you sure?
              </span>
              <button
                type="button"
                onClick={() => setConfirmResetOpen(false)}
                className="h-10 rounded-xl border border-[#8056E8]/20 dark:border-white/15 bg-[#EFECFF] dark:bg-[#171C35] px-4 text-xs font-semibold text-[#20213A] dark:text-[#F5F5FF] hover:border-[#8056E8]/50 dark:hover:border-white/30"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  resetProgress();
                  setConfirmResetOpen(false);
                  setNameInput('Brain Explorer');
                }}
                className="h-10 rounded-xl bg-[#E11D48] dark:bg-[#FF5D78] px-4 text-xs font-bold text-white dark:text-[#090B18] hover:brightness-110"
              >
                Confirm Reset
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

const EmptyChartState: React.FC<{ onPlay: () => void }> = ({ onPlay }) => (
  <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-[#8056E8]/10 dark:border-white/5 bg-[#EFECFF]/55 dark:bg-[#171C35]/40 p-4 text-center">
    <p className="text-xs sm:text-sm font-medium text-[#5E6282] dark:text-[#929BB8]">
      Play at least one completed game to populate this chart.
    </p>
    <button
      type="button"
      onClick={onPlay}
      className="mt-3 h-9 rounded-lg border border-[#8056E8]/35 dark:border-[#9B7BFF]/45 bg-[#FFFFFF] dark:bg-[#171C35] px-3.5 text-xs font-semibold text-[#20213A] dark:text-[#F5F5FF] hover:border-[#35C8E8] dark:hover:border-[#55D9FF] transition-colors"
    >
      Play a Round
    </button>
  </div>
);
