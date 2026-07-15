import { useState, useCallback } from "react";

const STORAGE_KEY = "hangman_daily_stats";

const defaultStats = {
  currentStreak: 0,
  bestStreak: 0,
  totalWins: 0,
  totalGames: 0,
  lastCompletedDate: null, // "YYYY-MM-DD" of last completed game
};

function loadStats() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...defaultStats, ...JSON.parse(raw) } : { ...defaultStats };
  } catch {
    return { ...defaultStats };
  }
}

function saveStats(stats) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {}
}

/**
 * Checks if dateStr was yesterday relative to today.
 * Both strings are "YYYY-MM-DD".
 */
function wasYesterday(dateStr) {
  if (!dateStr) return false;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return dateStr === yesterday.toISOString().slice(0, 10);
}

/**
 * useDailyStats — daily-mode-specific statistics.
 *
 * Stored separately from Unlimited Mode stats under "hangman_daily_stats".
 * Tracks: currentStreak, bestStreak, totalWins, totalGames, lastCompletedDate.
 *
 * Streak rules:
 *   - Win after consecutive days → streak increments
 *   - Win after missing a day → streak resets to 1
 *   - Loss → streak resets to 0
 */
export function useDailyStats() {
  const [stats, setStats] = useState(loadStats);

  /**
   * Record a daily win.
   * @param {string} dateStr - Today's date string "YYYY-MM-DD"
   */
  const recordDailyWin = useCallback((dateStr) => {
    setStats((prev) => {
      // Don't double-count if same date was already recorded
      if (prev.lastCompletedDate === dateStr) return prev;

      const streakContinues = wasYesterday(prev.lastCompletedDate);
      const newStreak = streakContinues ? prev.currentStreak + 1 : 1;
      const updated = {
        ...prev,
        totalWins: prev.totalWins + 1,
        totalGames: prev.totalGames + 1,
        currentStreak: newStreak,
        bestStreak: Math.max(prev.bestStreak, newStreak),
        lastCompletedDate: dateStr,
      };
      saveStats(updated);
      return updated;
    });
  }, []);

  /**
   * Record a daily loss.
   * @param {string} dateStr - Today's date string "YYYY-MM-DD"
   */
  const recordDailyLoss = useCallback((dateStr) => {
    setStats((prev) => {
      if (prev.lastCompletedDate === dateStr) return prev;

      const updated = {
        ...prev,
        totalGames: prev.totalGames + 1,
        currentStreak: 0,
        lastCompletedDate: dateStr,
      };
      saveStats(updated);
      return updated;
    });
  }, []);

  const resetDailyStats = useCallback(() => {
    const fresh = { ...defaultStats };
    saveStats(fresh);
    setStats(fresh);
  }, []);

  return { stats, recordDailyWin, recordDailyLoss, resetDailyStats };
}
