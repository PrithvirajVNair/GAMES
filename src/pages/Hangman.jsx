import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import Sidebar from "../components/Sidebar";

// ── Unlimited Mode hooks ────────────────────────────────────────────
import { useHangmanGame } from "../hooks/hangman/useHangmanGame";
import { useStats } from "../hooks/hangman/useStats";

// ── Daily Mode hooks ────────────────────────────────────────────────
import { useDailyGame } from "../hooks/hangman/useDailyGame";
import { useDailyStats } from "../hooks/hangman/useDailyStats";

// ── Shared hooks ────────────────────────────────────────────────────
import { useSound } from "../hooks/hangman/useSound";
import { useKeyboard } from "../hooks/hangman/useKeyboard";

// ── Shared components ───────────────────────────────────────────────
import HangmanDrawing from "../components/hangman/HangmanDrawing";
import WordDisplay from "../components/hangman/WordDisplay";
import Keyboard from "../components/hangman/Keyboard";
import HintCard from "../components/hangman/HintCard";
import StatsCard from "../components/hangman/StatsCard";
import ProgressBar from "../components/hangman/ProgressBar";
import GameControls from "../components/hangman/GameControls";
import ResultModal from "../components/hangman/ResultModal";

// ── New Daily Mode components ────────────────────────────────────────
import ModeSelector from "../components/hangman/ModeSelector";
import DailyBadge from "../components/hangman/DailyBadge";
import DailyResultModal from "../components/hangman/DailyResultModal";
import DailyCompletionScreen from "../components/hangman/DailyCompletionScreen";

// ─────────────────────────────────────────────────────────────────────
// UNLIMITED MODE — completely unchanged from original implementation
// ─────────────────────────────────────────────────────────────────────
const UnlimitedGame = ({ onGoHome }) => {
  const { muted, playCorrect, playWrong, playWin, playLose, playHint, playSkip, toggleMute } = useSound();
  const { stats, recordWin, recordLoss, resetStats } = useStats();

  const handleWin = useCallback(() => { recordWin(); playWin(); }, [recordWin, playWin]);
  const handleLose = useCallback(() => { recordLoss(); playLose(); }, [recordLoss, playLose]);

  const {
    word, hint, difficulty, category,
    guessedLetters, wrongGuesses, maxWrong,
    gameStatus, hintUsed,
    guessLetter, newGame: originalNewGame,
    useHint: originalUseHint,
  } = useHangmanGame({ onWin: handleWin, onLose: handleLose });

  const newGame = useCallback(() => {
    originalNewGame();
    playSkip();
  }, [originalNewGame, playSkip]);

  const useHint = useCallback(() => {
    originalUseHint();
    playHint();
  }, [originalUseHint, playHint]);

  const handleGuess = useCallback(
    (letter) => {
      if (gameStatus !== "playing") return;
      if (guessedLetters.has(letter)) return;
      const isCorrect = word.includes(letter);
      guessLetter(letter);
      if (isCorrect) playCorrect(); else playWrong();
    },
    [gameStatus, guessedLetters, word, guessLetter, playCorrect, playWrong]
  );

  useKeyboard(handleGuess, gameStatus === "playing");

  const isGameOver = gameStatus === "won" || gameStatus === "lost";

  return (
    <>
      <ResultModal gameStatus={gameStatus} word={word} onPlayAgain={newGame} />

      {/* ── Game Content ───────────────────────────────────────── */}
      <div className="flex flex-col items-center justify-start pt-6 pb-16 px-4 sm:px-6 gap-8 max-w-5xl mx-auto">
        {/* Header with mode label + back button */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center flex flex-col items-center gap-3 w-full"
        >
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <button
              onClick={onGoHome}
              className="text-xs font-bold text-white/40 hover:text-white/70 transition-colors cursor-pointer outline-none"
              title="Back to mode selection"
            >
              ← Modes
            </button>
            <span className="text-white/15 text-xs">|</span>
            <span className="text-[0.65rem] font-extrabold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5">
              ∞ Unlimited Mode
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-violet-400 via-indigo-400 to-blue-400 bg-clip-text text-transparent">
            Hangman
          </h1>
          <p className="text-white/40 text-sm font-medium">Guess the hidden word — one letter at a time</p>
        </motion.div>

        {/* Two-column layout */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start">
          {/* Left: Drawing + Word */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="flex flex-col items-center gap-6"
          >
            <div className="w-full bg-white/[0.03] border border-white/8 backdrop-blur-sm p-6 sm:p-8 flex flex-col items-center gap-6">
              <HangmanDrawing wrongGuesses={wrongGuesses} />
              <div className="w-full max-w-[320px]">
                <ProgressBar wrongGuesses={wrongGuesses} maxWrong={maxWrong} />
              </div>
            </div>
            <div className="w-full bg-white/[0.03] border border-white/8 backdrop-blur-sm p-6 sm:p-8">
              <WordDisplay
                word={word}
                guessedLetters={guessedLetters}
                category={category}
                difficulty={difficulty}
                isLost={gameStatus === "lost"}
              />
            </div>
          </motion.div>

          {/* Right: Stats + Hint + Keyboard + Controls */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
            className="flex flex-col gap-4"
          >
            <StatsCard stats={stats} onReset={resetStats} />
            <div className="w-full bg-white/[0.03] border border-white/8 backdrop-blur-sm p-4">
              <HintCard hint={hint} hintUsed={hintUsed} onUseHint={useHint} gameStatus={gameStatus} />
            </div>
            <div className="w-full bg-white/[0.03] border border-white/8 backdrop-blur-sm p-4 sm:p-5">
              <p className="text-[0.65rem] font-extrabold uppercase tracking-widest text-white/30 mb-3">
                ⌨️ Keyboard — or press A–Z on your keyboard
              </p>
              <Keyboard guessedLetters={guessedLetters} word={word} onGuess={handleGuess} disabled={isGameOver} />
            </div>
            <GameControls onNewGame={newGame} muted={muted} onToggleMute={toggleMute} />
          </motion.div>
        </div>
      </div>
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────
// DAILY MODE
// ─────────────────────────────────────────────────────────────────────
const DailyGame = ({ onGoHome, onPlayUnlimited }) => {
  const { muted, playCorrect, playWrong, playWin, playLose, playHint, toggleMute } = useSound();
  const { stats: dailyStats, recordDailyWin, recordDailyLoss } = useDailyStats();

  const handleWin = useCallback(() => {
    playWin();
    recordDailyWin(new Date().toISOString().slice(0, 10));
  }, [playWin, recordDailyWin]);

  const handleLose = useCallback(() => {
    playLose();
    recordDailyLoss(new Date().toISOString().slice(0, 10));
  }, [playLose, recordDailyLoss]);

  const {
    word, hint, difficulty, category,
    todayDateStr,
    guessedLetters, wrongGuesses, maxWrong,
    gameStatus, hintUsed,
    gameCompleted, gameWon,
    guessLetter, useHint: originalUseHint,
  } = useDailyGame({ onWin: handleWin, onLose: handleLose });

  const useHint = useCallback(() => {
    originalUseHint();
    playHint();
  }, [originalUseHint, playHint]);

  const handleGuess = useCallback(
    (letter) => {
      if (gameStatus !== "playing") return;
      if (guessedLetters.has(letter)) return;
      const isCorrect = word.includes(letter);
      guessLetter(letter);
      if (isCorrect) playCorrect(); else playWrong();
    },
    [gameStatus, guessedLetters, word, guessLetter, playCorrect, playWrong]
  );

  useKeyboard(handleGuess, gameStatus === "playing" && !gameCompleted);

  const isGameOver = gameStatus === "won" || gameStatus === "lost";

  // ── Already completed today → show completion screen ─────────────
  if (gameCompleted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 py-20 w-full max-w-5xl mx-auto gap-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center flex flex-col items-center gap-3 w-full"
        >
          <button
            onClick={onGoHome}
            className="text-xs font-bold text-white/40 hover:text-white/70 transition-colors cursor-pointer outline-none self-center"
          >
            ← Modes
          </button>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-violet-400 via-indigo-400 to-blue-400 bg-clip-text text-transparent">
            Daily Hangman
          </h1>
          <DailyBadge todayDateStr={todayDateStr} currentStreak={dailyStats.currentStreak} />
        </motion.div>

        <DailyCompletionScreen
          gameWon={gameWon}
          word={word}
          hint={hint}
          category={category}
          difficulty={difficulty}
          todayDateStr={todayDateStr}
          currentStreak={dailyStats.currentStreak}
          bestStreak={dailyStats.bestStreak}
          totalWins={dailyStats.totalWins}
          totalGames={dailyStats.totalGames}
          onGoHome={onGoHome}
          onPlayUnlimited={onPlayUnlimited}
        />
      </div>
    );
  }

  // ── Active daily game ─────────────────────────────────────────────
  return (
    <>
      <DailyResultModal
        gameStatus={gameStatus}
        word={word}
        hint={hint}
        category={category}
        currentStreak={dailyStats.currentStreak}
        onGoHome={onGoHome}
        onPlayUnlimited={onPlayUnlimited}
      />

      <div className="flex flex-col items-center justify-start pt-6 pb-16 px-4 sm:px-6 gap-8 max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center flex flex-col items-center gap-3 w-full"
        >
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <button
              onClick={onGoHome}
              className="text-xs font-bold text-white/40 hover:text-white/70 transition-colors cursor-pointer outline-none"
              title="Back to mode selection"
            >
              ← Modes
            </button>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-violet-400 via-indigo-400 to-blue-400 bg-clip-text text-transparent">
            Daily Hangman
          </h1>
          <DailyBadge todayDateStr={todayDateStr} currentStreak={dailyStats.currentStreak} />
        </motion.div>

        {/* Two-column layout — identical structure to Unlimited */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start">
          {/* Left: Drawing + Word */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="flex flex-col items-center gap-6"
          >
            <div className="w-full bg-white/[0.03] border border-white/8 backdrop-blur-sm p-6 sm:p-8 flex flex-col items-center gap-6">
              <HangmanDrawing wrongGuesses={wrongGuesses} />
              <div className="w-full max-w-[320px]">
                <ProgressBar wrongGuesses={wrongGuesses} maxWrong={maxWrong} />
              </div>
            </div>
            <div className="w-full bg-white/[0.03] border border-white/8 backdrop-blur-sm p-6 sm:p-8">
              <WordDisplay
                word={word}
                guessedLetters={guessedLetters}
                category={category}
                difficulty={difficulty}
                isLost={gameStatus === "lost"}
              />
            </div>
          </motion.div>

          {/* Right: Daily Stats + Hint + Keyboard + Sound */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
            className="flex flex-col gap-4"
          >
            {/* Daily Stats card */}
            <div className="w-full bg-white/[0.03] border border-white/8 backdrop-blur-sm p-4">
              <p className="text-[0.65rem] font-extrabold uppercase tracking-widest text-white/30 mb-3">
                📅 Daily Statistics
              </p>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: "Streak", value: dailyStats.currentStreak, icon: <Flame size={14} className="text-amber-400" />, color: "text-amber-400" },
                  { label: "Best", value: dailyStats.bestStreak, icon: "⭐", color: "text-indigo-400" },
                  { label: "Wins", value: dailyStats.totalWins, icon: "🏆", color: "text-emerald-400" },
                  { label: "Played", value: dailyStats.totalGames, icon: "🎮", color: "text-white/60" },
                ].map(({ label, value, icon, color }) => (
                  <div key={label} className="flex flex-col items-center gap-0.5">
                    <span className="text-sm flex items-center justify-center h-5">{icon}</span>
                    <span className={`text-xl font-extrabold ${color}`}>{value}</span>
                    <span className="text-[0.58rem] font-bold uppercase tracking-widest text-white/30">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hint */}
            <div className="w-full bg-white/[0.03] border border-white/8 backdrop-blur-sm p-4">
              <HintCard hint={hint} hintUsed={hintUsed} onUseHint={useHint} gameStatus={gameStatus} />
            </div>

            {/* Keyboard */}
            <div className="w-full bg-white/[0.03] border border-white/8 backdrop-blur-sm p-4 sm:p-5">
              <p className="text-[0.65rem] font-extrabold uppercase tracking-widest text-white/30 mb-3">
                ⌨️ Keyboard — or press A–Z on your keyboard
              </p>
              <Keyboard guessedLetters={guessedLetters} word={word} onGuess={handleGuess} disabled={isGameOver} />
            </div>

            {/* Sound toggle (no New Game button in daily mode) */}
            <div className="flex justify-end">
              <button
                onClick={toggleMute}
                aria-label={muted ? "Unmute sound" : "Mute sound"}
                className="w-11 h-11 bg-white/[0.05] border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all duration-200 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-white/30"
              >
                {muted ? "🔇" : "🔊"}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────
// ROOT PAGE — Mode routing
// ─────────────────────────────────────────────────────────────────────
/**
 * Hangman — main game page.
 * Freely accessible (no auth required), matches the FQz Games dark aesthetic.
 * Renders a mode selector first, then routes to Daily or Unlimited game.
 */
const Hangman = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mode, setMode] = useState(null); // null | "daily" | "unlimited"

  useEffect(() => {
    document.title = "Hangman — FQz Games";
    return () => { document.title = "FQz Games"; };
  }, []);

  return (
    <>
      {/* ── Root layout ──────────────────────────────────────────── */}
      <div className="min-h-screen w-full bg-[linear-gradient(135deg,#070b19_0%,#0c1224_50%,#070914_100%)] text-white relative overflow-x-hidden">

        {/* Sidebar toggle */}
        <button
          className={`fixed top-5 left-5 z-[101] bg-white/5 border-[1.5px] border-white/12 rounded-full px-[1.1rem] py-2 text-[0.82rem] font-bold text-white/70 cursor-pointer backdrop-blur-[10px] flex items-center gap-1.5 shadow-[0_4px_15px_rgba(0,0,0,0.2)] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-white/12 hover:border-white/25 hover:text-white hover:-translate-y-px max-sm:top-4 max-sm:left-4 max-sm:px-[0.9rem] max-sm:py-[0.4rem] max-sm:text-[0.76rem] ${
            sidebarOpen ? "opacity-0 pointer-events-none scale-[0.8]" : ""
          }`}
          onClick={() => setSidebarOpen(true)}
          title="Toggle Menu"
          aria-label="Open sidebar menu"
        >
          🎮 Games
        </button>

        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* ── Mode routing ─────────────────────────────────────────── */}
        {mode === null && (
          <div className="flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 py-20">
            <ModeSelector onSelect={setMode} />
          </div>
        )}

        {mode === "unlimited" && (
          <UnlimitedGame onGoHome={() => setMode(null)} />
        )}

        {mode === "daily" && (
          <DailyGame
            onGoHome={() => setMode(null)}
            onPlayUnlimited={() => setMode("unlimited")}
          />
        )}
      </div>
    </>
  );
};

export default Hangman;
