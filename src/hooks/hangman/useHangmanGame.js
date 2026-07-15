import { useState, useCallback, useEffect } from "react";
import hangmanWords from "../../data/hangmanWords";
import { getRandomWord, isWon, isLost } from "../../utils/hangman/hangmanHelpers";

const MAX_WRONG = 6;

/**
 * Core game state hook for Hangman.
 * Manages: word, guessedLetters, wrongGuesses, gameStatus, hintUsed
 * Actions: guessLetter, newGame, useHint
 *
 * @param {function} onWin  - Callback fired when the player wins
 * @param {function} onLose - Callback fired when the player loses
 */
export function useHangmanGame({ onWin, onLose } = {}) {
  const [currentEntry, setCurrentEntry] = useState(null);
  const [guessedLetters, setGuessedLetters] = useState(new Set());
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [gameStatus, setGameStatus] = useState("idle"); // "idle" | "playing" | "won" | "lost"
  const [hintUsed, setHintUsed] = useState(false);

  // Start a fresh game with a random word
  const newGame = useCallback(() => {
    const entry = getRandomWord(hangmanWords);
    setCurrentEntry(entry);
    setGuessedLetters(new Set());
    setWrongGuesses(0);
    setGameStatus("playing");
    setHintUsed(false);
  }, []);

  // Auto-start on first mount
  useEffect(() => {
    newGame();
  }, [newGame]);

  // Core guess action
  const guessLetter = useCallback(
    (letter) => {
      const L = letter.toUpperCase();
      if (gameStatus !== "playing") return;
      if (guessedLetters.has(L)) return;

      const updatedGuessed = new Set(guessedLetters);
      updatedGuessed.add(L);
      setGuessedLetters(updatedGuessed);

      const isCorrect = currentEntry.word.includes(L);
      let newWrong = wrongGuesses;

      if (!isCorrect) {
        newWrong = wrongGuesses + 1;
        setWrongGuesses(newWrong);
      }

      // Check win / lose immediately with updated state values
      if (isWon(currentEntry.word, updatedGuessed)) {
        setGameStatus("won");
        onWin && onWin();
      } else if (isLost(newWrong, MAX_WRONG)) {
        setGameStatus("lost");
        onLose && onLose();
      }
    },
    [gameStatus, guessedLetters, wrongGuesses, currentEntry, onWin, onLose]
  );

  // Use the hint (one-time)
  const useHint = useCallback(() => {
    if (!hintUsed && gameStatus === "playing") {
      setHintUsed(true);
    }
  }, [hintUsed, gameStatus]);

  return {
    word: currentEntry?.word ?? "",
    hint: currentEntry?.hint ?? "",
    difficulty: currentEntry?.difficulty ?? "",
    category: currentEntry?.category ?? "",
    guessedLetters,
    wrongGuesses,
    maxWrong: MAX_WRONG,
    gameStatus,
    hintUsed,
    guessLetter,
    newGame,
    useHint,
  };
}
