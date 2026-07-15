import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getCategoryIcon } from "../../utils/hangman/hangmanHelpers";
import { Flame } from "lucide-react";

/** Re-use the same confetti from ResultModal */
const ConfettiParticle = ({ style }) => (
  <motion.div
    className="absolute rounded-sm pointer-events-none"
    style={{ background: style.background, left: style.left, width: style.width, height: style.height }}
    initial={{ y: -20, opacity: 1, rotate: 0 }}
    animate={{
      y: typeof window !== "undefined" ? window.innerHeight + 40 : 900,
      opacity: [1, 1, 0],
      rotate: style.rotate * 4,
      x: style.drift,
    }}
    transition={{ duration: style.duration, delay: style.delay, ease: "linear" }}
  />
);

function generateConfetti(count = 60) {
  const colours = ["#f59e0b", "#fbbf24", "#6366f1", "#8b5cf6", "#34d399", "#f87171", "#38bdf8"];
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    background: colours[Math.floor(Math.random() * colours.length)],
    rotate: Math.random() * 360 - 180,
    drift: (Math.random() - 0.5) * 200,
    duration: 2 + Math.random() * 2,
    delay: Math.random() * 1.0,
    width: `${6 + Math.random() * 8}px`,
    height: `${6 + Math.random() * 8}px`,
  }));
}

/**
 * DailyResultModal — Win/Lose modal specific to Daily Mode.
 *
 * Win: confetti + streak + "See you tomorrow!"
 * Lose: word reveal + "Come back tomorrow"
 * Buttons: Return Home | Play Unlimited
 *
 * @param {string}   gameStatus     - "won" | "lost" | other
 * @param {string}   word           - The target word
 * @param {string}   hint           - The word's hint
 * @param {string}   category       - The word's category
 * @param {number}   currentStreak  - Post-game daily streak
 * @param {function} onGoHome       - Navigate to mode selector
 * @param {function} onPlayUnlimited - Switch to Unlimited Mode
 */
const DailyResultModal = ({
  gameStatus,
  word,
  hint,
  category,
  currentStreak,
  onGoHome,
  onPlayUnlimited,
}) => {
  const isOpen = gameStatus === "won" || gameStatus === "lost";
  const isWon = gameStatus === "won";
  const confettiParticles = useRef(generateConfetti(70)).current;
  const modalRef = useRef(null);
  const categoryIcon = getCategoryIcon(category);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      const focusable = modalRef.current.querySelectorAll("button");
      if (focusable.length) focusable[0].focus();
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="bd"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-[200]"
            aria-hidden="true"
          />

          {/* Confetti */}
          {isWon && (
            <div className="fixed inset-0 z-[201] pointer-events-none overflow-hidden">
              {confettiParticles.map((p) => (
                <ConfettiParticle key={p.id} style={p} />
              ))}
            </div>
          )}

          {/* Modal */}
          <div
            className="fixed inset-0 z-[202] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="daily-result-title"
          >
            <motion.div
              ref={modalRef}
              key="modal"
              initial={{ scale: 0.7, opacity: 0, y: 40 }}
              animate={
                isWon
                  ? { scale: 1, opacity: 1, y: 0 }
                  : { scale: [0.7, 1.02, 0.98, 1], opacity: 1, y: 0, x: [0, -10, 10, -6, 6, 0] }
              }
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              transition={
                isWon
                  ? { type: "spring", stiffness: 250, damping: 22 }
                  : { duration: 0.55, ease: "easeInOut" }
              }
              className="w-full max-w-sm bg-[rgba(10,14,28,0.97)] border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.7)] p-7 flex flex-col items-center gap-5 text-center"
            >
              {/* Daily badge */}
              <span className="text-[0.6rem] font-extrabold uppercase tracking-widest text-amber-400/70 bg-amber-400/10 border border-amber-400/20 px-2.5 py-0.5">
                📅 Daily Challenge
              </span>

              {/* Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.1 }}
                className="text-5xl select-none"
                aria-hidden="true"
              >
                {isWon ? "🏆" : "💀"}
              </motion.div>

              {/* Title */}
              <div className="flex flex-col gap-1.5">
                <h2
                  id="daily-result-title"
                  className={`text-2xl font-extrabold tracking-tight ${
                    isWon ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {isWon ? "Puzzle Solved!" : "Puzzle Failed"}
                </h2>
                <p className="text-white/50 text-sm leading-relaxed">
                  {isWon
                    ? "See you tomorrow for a new puzzle!"
                    : "Today's puzzle is over. Come back tomorrow for a new challenge."}
                </p>
              </div>

              {/* Info grid */}
              <div className="w-full grid grid-cols-2 gap-2 text-left border-t border-white/8 pt-4">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[0.6rem] font-extrabold uppercase tracking-widest text-white/30">Word</span>
                  <span className="text-white font-extrabold tracking-widest text-sm">{word}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[0.6rem] font-extrabold uppercase tracking-widest text-white/30">Category</span>
                  <span className="text-indigo-300 font-bold text-sm">{categoryIcon} {category}</span>
                </div>
                <div className="col-span-2 flex flex-col gap-0.5">
                  <span className="text-[0.6rem] font-extrabold uppercase tracking-widest text-white/30">Hint</span>
                  <span className="text-amber-200 font-semibold text-sm leading-snug">{hint}</span>
                </div>
                {isWon && (
                  <div className="col-span-2 flex flex-col gap-0.5 border-t border-white/8 pt-2">
                    <span className="text-[0.6rem] font-extrabold uppercase tracking-widest text-white/30">Daily Streak</span>
                    <span className="text-amber-400 font-extrabold text-lg flex items-center gap-1">
                      <Flame size={18} className="text-amber-400 flex-shrink-0" />
                      <span>{currentStreak} day{currentStreak !== 1 ? "s" : ""}</span>
                    </span>
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="flex flex-col gap-2.5 w-full pt-1">
                <motion.button
                  onClick={onGoHome}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full py-3 bg-white/[0.06] border border-white/15 text-white/80 font-bold text-sm
                    hover:bg-white/10 hover:text-white transition-all duration-200 cursor-pointer outline-none
                    focus-visible:ring-2 focus-visible:ring-white/30"
                  autoFocus
                >
                  ← Return Home
                </motion.button>
                <motion.button
                  onClick={onPlayUnlimited}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-sm
                    shadow-[0_4px_18px_rgba(99,102,241,0.3)] hover:shadow-[0_6px_24px_rgba(99,102,241,0.45)]
                    transition-shadow duration-200 cursor-pointer outline-none
                    focus-visible:ring-2 focus-visible:ring-indigo-400"
                >
                  ∞ Play Unlimited
                </motion.button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default DailyResultModal;
