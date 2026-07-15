import { motion } from "framer-motion";
import { formatDateStr } from "../../utils/hangman/checkNewDay";
import { getCategoryIcon } from "../../utils/hangman/hangmanHelpers";
import { Flame } from "lucide-react";

/**
 * DailyCompletionScreen — shown when today's Daily puzzle is already finished.
 * Displays the result, word, category, streak, and navigation buttons.
 *
 * @param {boolean}  gameWon          - Whether the player won today
 * @param {string}   word             - The completed word
 * @param {string}   hint             - The hint for the word
 * @param {string}   category         - Word's category
 * @param {string}   difficulty       - Word's difficulty
 * @param {string}   todayDateStr     - "YYYY-MM-DD"
 * @param {number}   currentStreak    - Current daily win streak
 * @param {number}   bestStreak       - All-time best streak
 * @param {number}   totalWins        - Total daily wins
 * @param {number}   totalGames       - Total daily games played
 * @param {function} onGoHome         - Navigate back to mode selector
 * @param {function} onPlayUnlimited  - Switch to Unlimited Mode
 */
const DailyCompletionScreen = ({
  gameWon,
  word,
  hint,
  category,
  difficulty,
  todayDateStr,
  currentStreak,
  bestStreak,
  totalWins,
  totalGames,
  onGoHome,
  onPlayUnlimited,
}) => {
  const categoryIcon = getCategoryIcon(category);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-md mx-auto flex flex-col gap-6"
    >
      {/* Result card */}
      <div
        className={`border p-7 flex flex-col gap-5 ${
          gameWon
            ? "bg-emerald-500/8 border-emerald-400/20"
            : "bg-rose-500/8 border-rose-400/20"
        }`}
      >
        {/* Icon + headline */}
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="text-5xl">{gameWon ? "✅" : "❌"}</span>
          <h2
            className={`text-xl font-extrabold ${
              gameWon ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {gameWon
              ? "You've completed today's puzzle."
              : "Today's puzzle is over."}
          </h2>
          <p className="text-white/45 text-sm leading-relaxed">
            {gameWon
              ? "Come back tomorrow for a new challenge."
              : "Come back tomorrow for a new challenge."}
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-white/8" />

        {/* Today's result */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex flex-col gap-0.5">
            <span className="text-[0.65rem] font-extrabold uppercase tracking-widest text-white/30">
              Date
            </span>
            <span className="text-white/70 font-semibold text-xs">
              {formatDateStr(todayDateStr)}
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[0.65rem] font-extrabold uppercase tracking-widest text-white/30">
              Result
            </span>
            <span
              className={`font-extrabold text-sm ${
                gameWon ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {gameWon ? "🏆 Win" : "💀 Loss"}
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[0.65rem] font-extrabold uppercase tracking-widest text-white/30">
              Word
            </span>
            <span className="text-white font-extrabold tracking-widest text-sm">
              {word}
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[0.65rem] font-extrabold uppercase tracking-widest text-white/30">
              Category
            </span>
            <span className="text-indigo-300 font-bold text-sm">
              {categoryIcon} {category}
            </span>
          </div>
          <div className="col-span-2 flex flex-col gap-0.5">
            <span className="text-[0.65rem] font-extrabold uppercase tracking-widest text-white/30">
              Hint
            </span>
            <span className="text-amber-200 font-semibold text-sm leading-snug">{hint}</span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/8" />

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Streak", value: currentStreak, icon: <Flame size={18} className="text-amber-400" />, color: "text-amber-400" },
            { label: "Best", value: bestStreak, icon: "⭐", color: "text-indigo-400" },
            { label: "Wins", value: totalWins, icon: "🏆", color: "text-emerald-400" },
            { label: "Played", value: totalGames, icon: "🎮", color: "text-white/60" },
          ].map(({ label, value, icon, color }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <span className="text-base flex items-center justify-center h-6">{icon}</span>
              <span className={`text-xl font-extrabold ${color}`}>{value}</span>
              <span className="text-[0.6rem] font-bold uppercase tracking-widest text-white/35">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <motion.button
          onClick={onGoHome}
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.97 }}
          className="flex-1 py-3 px-5 bg-white/[0.06] border border-white/15 text-white/80 font-bold text-sm
            hover:bg-white/10 hover:border-white/25 hover:text-white
            transition-all duration-200 cursor-pointer outline-none"
        >
          ← Return Home
        </motion.button>
        <motion.button
          onClick={onPlayUnlimited}
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.97 }}
          className="flex-1 py-3 px-5
            bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-sm
            shadow-[0_4px_18px_rgba(99,102,241,0.3)] hover:shadow-[0_6px_24px_rgba(99,102,241,0.45)]
            transition-shadow duration-200 cursor-pointer outline-none"
        >
          ∞ Play Unlimited
        </motion.button>
      </div>
    </motion.div>
  );
};

export default DailyCompletionScreen;
