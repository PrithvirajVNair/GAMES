import { useState, useCallback } from "react";

const STORAGE_KEY = "hangman_stats";

const defaultStats = {
  wins: 0,
  losses: 0,
  currentStreak: 0,
  bestStreak: 0,
  gamesPlayed: 0,
};

/**
 * Reads Hangman statistics from localStorage, with safe JSON parsing.
 */
function loadStats() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultStats };
    return { ...defaultStats, ...JSON.parse(raw) };
  } catch {
    return { ...defaultStats };
  }
}

/**
 * Writes updated stats back to localStorage.
 */
function saveStats(stats) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // localStorage unavailable — silently fail
  }
}

/**
 * Hook exposing Hangman win/loss stats stored in localStorage.
 * Provides: stats object + recordWin, recordLoss, resetStats actions.
 */
export function useStats() {
  const [stats, setStats] = useState(loadStats);

  const recordWin = useCallback(() => {
    setStats((prev) => {
      const newStreak = prev.currentStreak + 1;
      const updated = {
        ...prev,
        wins: prev.wins + 1,
        gamesPlayed: prev.gamesPlayed + 1,
        currentStreak: newStreak,
        bestStreak: Math.max(prev.bestStreak, newStreak),
      };
      saveStats(updated);
      return updated;
    });
  }, []);

  const recordLoss = useCallback(() => {
    setStats((prev) => {
      const updated = {
        ...prev,
        losses: prev.losses + 1,
        gamesPlayed: prev.gamesPlayed + 1,
        currentStreak: 0,
      };
      saveStats(updated);
      return updated;
    });
  }, []);

  const resetStats = useCallback(() => {
    const fresh = { ...defaultStats };
    saveStats(fresh);
    setStats(fresh);
  }, []);

  return { stats, recordWin, recordLoss, resetStats };
}
