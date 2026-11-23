import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { getAchievementProgressList } from '../data/achievements';
import {
  appendCompletedSession,
  computeDerivedStats,
  loadMemoraData,
  resetPersistedData,
  saveMemoraData,
} from '../services/storage';
import {
  AchievementProgress,
  DerivedPlayerStats,
  GameSession,
  MemoraPersistedData,
  MemoraTheme,
  SessionRecordResult,
} from '../types/memora';

interface MemoraContextValue {
  data: MemoraPersistedData;
  theme: MemoraTheme;
  stats: DerivedPlayerStats;
  achievements: AchievementProgress[];
  recordSession: (session: GameSession) => SessionRecordResult;
  updateDisplayName: (name: string) => void;
  toggleTheme: () => void;
  resetProgress: () => void;
}

const MemoraContext = createContext<MemoraContextValue | null>(null);

function applyDocumentTheme(theme: MemoraTheme) {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

export const MemoraProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [data, setData] = useState<MemoraPersistedData>(() => loadMemoraData());
  const dataRef = useRef<MemoraPersistedData>(data);

  useEffect(() => {
    dataRef.current = data;
    applyDocumentTheme(data.settings.theme);
  }, [data]);

  const recordSession = useCallback(
    (session: GameSession): SessionRecordResult => {
      const { nextData, result } = appendCompletedSession(
        dataRef.current,
        session
      );
      dataRef.current = nextData;
      setData(nextData);
      return result;
    },
    []
  );

  const updateDisplayName = useCallback((name: string) => {
    const cleaned = name.trim().slice(0, 28) || 'Brain Explorer';
    const next: MemoraPersistedData = {
      ...dataRef.current,
      profile: {
        ...dataRef.current.profile,
        displayName: cleaned,
      },
    };
    dataRef.current = next;
    saveMemoraData(next);
    setData(next);
  }, []);

  const toggleTheme = useCallback(() => {
    const nextTheme: MemoraTheme =
      dataRef.current.settings.theme === 'dark' ? 'light' : 'dark';
    applyDocumentTheme(nextTheme);
    const next: MemoraPersistedData = {
      ...dataRef.current,
      settings: {
        ...dataRef.current.settings,
        theme: nextTheme,
      },
    };
    dataRef.current = next;
    saveMemoraData(next);
    setData(next);
  }, []);

  const resetProgress = useCallback(() => {
    const fresh = resetPersistedData(true);
    dataRef.current = fresh;
    setData(fresh);
  }, []);

  const stats = useMemo(() => computeDerivedStats(data), [data]);
  const achievements = useMemo(
    () => getAchievementProgressList(data),
    [data]
  );

  const value = useMemo<MemoraContextValue>(
    () => ({
      data,
      theme: data.settings.theme,
      stats,
      achievements,
      recordSession,
      updateDisplayName,
      toggleTheme,
      resetProgress,
    }),
    [
      data,
      stats,
      achievements,
      recordSession,
      updateDisplayName,
      toggleTheme,
      resetProgress,
    ]
  );

  return (
    <MemoraContext.Provider value={value}>{children}</MemoraContext.Provider>
  );
};

export function useMemoraStore(): MemoraContextValue {
  const ctx = useContext(MemoraContext);
  if (!ctx) {
    throw new Error('useMemoraStore must be used within MemoraProvider');
  }
  return ctx;
}
