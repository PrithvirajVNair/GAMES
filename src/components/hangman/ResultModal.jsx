import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Confetti particle — a single coloured floating square.
 */
const ConfettiParticle = ({ style }) => (
  <motion.div
    className="absolute w-2 h-2 rounded-sm pointer-events-none"
    style={style}
    initial={{ y: -20, opacity: 1, rotate: 0 }}
    animate={{
      y: typeof window !== "undefined" ? window.innerHeight + 40 : 900,
      opacity: [1, 1, 0],
      rotate: style.rotate * 4,
      x: style.drift,
    }}
    transition={{
      duration: style.duration,
      delay: style.delay,
      ease: "linear",
    }}
  />
);

/**
 * Generates an array of random confetti particle styles.
 */
function generateConfetti(count = 60) {
  const colours = [
    "#6366f1", "#8b5cf6", "#a78bfa", "#34d399",
    "#f59e0b", "#f87171", "#38bdf8", "#e879f9",
  ];
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    background: colours[Math.floor(Math.random() * colours.length)],
    rotate: Math.random() * 360 - 180,
    drift: (Math.random() - 0.5) * 200,
    duration: 2 + Math.random() * 2,
    delay: Math.random() * 1.2,
    width: `${6 + Math.random() * 8}px`,
    height: `${6 + Math.random() * 8}px`,
  }));
}

/**
 * ResultModal — shown when the player wins or loses.
 * Win: confetti + trophy animation.
 * Lose: shake + word reveal.
 *
 * @param {string}   gameStatus - "won" | "lost" | other
 * @param {string}   word       - The target word
 * @param {function} onPlayAgain - Callback to start a new game
 */
const ResultModal = ({ gameStatus, word, onPlayAgain }) => {
  const isOpen = gameStatus === "won" || gameStatus === "lost";
  const isWon = gameStatus === "won";
  const confettiParticles = useRef(generateConfetti(70)).current;

  // Trap focus inside the modal when open
  const modalRef = useRef(null);
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const focusable = modalRef.current.querySelectorAll("button, [tabindex]:not([tabindex='-1'])");
      if (focusable.length) focusable[0].focus();
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-[200]"
            aria-hidden="true"
          />

          {/* Confetti (win only) */}
          {isWon && (
            <div className="fixed inset-0 z-[201] pointer-events-none overflow-hidden">
              {confettiParticles.map((p) => (
                <ConfettiParticle
                  key={p.id}
                  style={{
                    left: p.left,
                    background: p.background,
                    rotate: p.rotate,
                    drift: p.drift,
                    duration: p.duration,
                    delay: p.delay,
                    width: p.width,
                    height: p.height,
                  }}
                />
              ))}
            </div>
          )}

          {/* Modal card */}
          <div
            className="fixed inset-0 z-[202] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="result-modal-title"
          >
            <motion.div
              ref={modalRef}
              key="modal"
              initial={{ scale: 0.7, opacity: 0, y: 40 }}
              animate={
                isWon
                  ? { scale: 1, opacity: 1, y: 0 }
                  : {
                      scale: [0.7, 1.02, 0.98, 1],
                      opacity: 1,
                      y: 0,
                      x: [0, -10, 10, -8, 8, 0], // shake
                    }
              }
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              transition={
                isWon
                  ? { type: "spring", stiffness: 250, damping: 22 }
                  : { duration: 0.55, ease: "easeInOut" }
              }
              className="w-full max-w-sm bg-[rgba(10,14,28,0.95)] border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.7)] p-8 flex flex-col items-center gap-6 text-center"
            >
              {/* Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.1 }}
                className="text-6xl select-none"
                aria-hidden="true"
              >
                {isWon ? "🏆" : "💀"}
              </motion.div>

              {/* Title */}
              <div className="flex flex-col gap-2">
                <h2
                  id="result-modal-title"
                  className={`text-3xl font-extrabold tracking-tight ${
                    isWon ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {isWon ? "You Won!" : "Game Over"}
                </h2>
                <p className="text-white/55 text-sm leading-relaxed">
                  {isWon
                    ? "Excellent! You guessed the word correctly."
                    : "Better luck next time. The word was:"}
                </p>
              </div>

              {/* Word reveal (always shown) */}
              <div className="flex flex-col items-center gap-1.5">
                <span className="text-[0.65rem] font-extrabold uppercase tracking-widest text-white/30">
                  The word
                </span>
                <motion.span
                  initial={{ opacity: 0, letterSpacing: "0.1em" }}
                  animate={{ opacity: 1, letterSpacing: "0.25em" }}
                  transition={{ delay: 0.25, duration: 0.4 }}
                  className={`text-2xl font-extrabold tracking-[0.25em] ${
                    isWon ? "text-emerald-300" : "text-rose-300"
                  }`}
                >
                  {word}
                </motion.span>
              </div>

              {/* Play again button */}
              <motion.button
                onClick={onPlayAgain}
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{ scale: 0.97 }}
                className={`w-full py-3.5 font-bold text-sm text-white cursor-pointer outline-none
                  focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent
                  transition-shadow duration-200
                  ${
                    isWon
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 shadow-[0_4px_18px_rgba(52,211,153,0.3)] hover:shadow-[0_6px_26px_rgba(52,211,153,0.45)] focus-visible:ring-emerald-400"
                      : "bg-gradient-to-r from-indigo-600 to-violet-600 shadow-[0_4px_18px_rgba(99,102,241,0.3)] hover:shadow-[0_6px_26px_rgba(99,102,241,0.45)] focus-visible:ring-indigo-400"
                  }`}
                autoFocus
              >
                {isWon ? "🎉 Play Again" : "↺ Try Again"}
              </motion.button>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ResultModal;
