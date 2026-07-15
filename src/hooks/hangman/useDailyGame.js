import { useState, useCallback, useEffect, useRef } from "react";
import { getDailyWord } from "../../utils/hangman/getDailyWord";
import { checkNewDay } from "../../utils/hangman/checkNewDay";
import { isWon, isLost } from "../../utils/hangman/hangmanHelpers";

const STORAGE_KEY = "hangman_daily_progress";
const MAX_WRONG = 6;

/** Returns today's ISO date string "YYYY-MM-DD" */
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

/** Safely load progress from localStorage */
function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Persist progress to localStorage */
function saveProgress(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

/**
 * useDailyGame — manages the Daily Mode puzzle state.
 *
 * State is fully persisted to localStorage under "hangman_daily_progress".
 * On mount it resumes today's saved game, or starts a fresh one.
 * Automatically resets when a new calendar day is detected.
 *
 * @param {{ onWin: function, onLose: function }} callbacks
 */
export function useDailyGame({ onWin, onLose } = {}) {
  const today = todayStr();
  const dailyEntry = getDailyWord();

  // ── Derive initial state from localStorage ──────────────────────
  function buildInitialState() {
    const saved = loadProgress();

    // New day OR no save → fresh puzzle
    if (!saved || checkNewDay(saved.dailyDate)) {
      return {
        dailyDate: today,
        dailyWordIndex: dailyEntry.index,
        guessedLetters: new Set(),
        wrongGuesses: 0,
        hintUsed: false,
        gameStatus: "playing", // "playing" | "won" | "lost"
        gameCompleted: false,
        gameWon: false,
        completedWord: dailyEntry.word,
        completionTimestamp: null,
      };
    }

    // Resume saved game
    return {
      dailyDate: saved.dailyDate,
      dailyWordIndex: saved.dailyWordIndex,
      guessedLetters: new Set(saved.revealedLetters ?? []),
      wrongGuesses: saved.wrongGuessCount ?? 0,
      hintUsed: saved.hintUsed ?? false,
      gameStatus: saved.gameCompleted
        ? saved.gameWon
          ? "won"
          : "lost"
        : "playing",
      gameCompleted: saved.gameCompleted ?? false,
      gameWon: saved.gameWon ?? false,
      completedWord: saved.completedWord ?? dailyEntry.word,
      completionTimestamp: saved.completionTimestamp ?? null,
    };
  }

  const [state, setState] = useState(buildInitialState);

  // Ref to avoid stale-closure issues in callbacks
  const onWinRef = useRef(onWin);
  const onLoseRef = useRef(onLose);
  useEffect(() => { onWinRef.current = onWin; }, [onWin]);
  useEffect(() => { onLoseRef.current = onLose; }, [onLose]);

  // ── Persist to localStorage whenever state changes ──────────────
  useEffect(() => {
    saveProgress({
      dailyDate: state.dailyDate,
      dailyWordIndex: state.dailyWordIndex,
      revealedLetters: [...state.guessedLetters],
      wrongGuessCount: state.wrongGuesses,
      hintUsed: state.hintUsed,
      gameCompleted: state.gameCompleted,
      gameWon: state.gameWon,
      completedWord: state.completedWord,
      completionTimestamp: state.completionTimestamp,
    });
  }, [state]);

  // ── Check for midnight rollover while tab is open ───────────────
  useEffect(() => {
    const interval = setInterval(() => {
      const saved = loadProgress();
      if (saved && checkNewDay(saved.dailyDate)) {
        setState(buildInitialState());
      }
    }, 60_000); // check every minute
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Actions ─────────────────────────────────────────────────────

  const guessLetter = useCallback((letter) => {
    const L = letter.toUpperCase();
    setState((prev) => {
      if (prev.gameStatus !== "playing") return prev;
      if (prev.guessedLetters.has(L)) return prev;

      const updated = new Set(prev.guessedLetters);
      updated.add(L);

      const correct = dailyEntry.word.includes(L);
      const newWrong = correct ? prev.wrongGuesses : prev.wrongGuesses + 1;

      const won = isWon(dailyEntry.word, updated);
      const lost = !won && isLost(newWrong, MAX_WRONG);

      if (won) setTimeout(() => onWinRef.current?.(), 0);
      if (lost) setTimeout(() => onLoseRef.current?.(), 0);

      return {
        ...prev,
        guessedLetters: updated,
        wrongGuesses: newWrong,
        gameStatus: won ? "won" : lost ? "lost" : "playing",
        gameCompleted: won || lost,
        gameWon: won,
        completionTimestamp: won || lost ? new Date().toISOString() : prev.completionTimestamp,
      };
    });
  }, [dailyEntry.word]);

  const useHint = useCallback(() => {
    setState((prev) => {
      if (prev.hintUsed || prev.gameStatus !== "playing") return prev;
      return { ...prev, hintUsed: true };
    });
  }, []);

  return {
    word: dailyEntry.word,
    hint: dailyEntry.hint,
    difficulty: dailyEntry.difficulty,
    category: dailyEntry.category,
    todayDateStr: state.dailyDate,
    guessedLetters: state.guessedLetters,
    wrongGuesses: state.wrongGuesses,
    maxWrong: MAX_WRONG,
    gameStatus: state.gameStatus,
    hintUsed: state.hintUsed,
    gameCompleted: state.gameCompleted,
    gameWon: state.gameWon,
    completionTimestamp: state.completionTimestamp,
    guessLetter,
    useHint,
  };
}
