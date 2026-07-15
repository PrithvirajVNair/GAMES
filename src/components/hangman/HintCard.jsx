import { motion, AnimatePresence } from "framer-motion";

/**
 * HintCard — displays the hint text for the current word.
 * One-time use. After used, shows the hint text with a reveal animation.
 *
 * @param {string}   hint      - The hint text to display
 * @param {boolean}  hintUsed  - Whether the hint has been used
 * @param {function} onUseHint - Callback to activate hint
 * @param {string}   gameStatus - Current game status
 */
const HintCard = ({ hint, hintUsed, onUseHint, gameStatus }) => {
  const isPlayable = gameStatus === "playing";

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {hintUsed ? (
          <motion.div
            key="hint-revealed"
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="flex flex-col gap-1.5 px-4 py-3 bg-amber-400/10 border border-amber-400/25 w-full"
            role="status"
            aria-live="polite"
          >
            <span className="text-[0.65rem] font-extrabold uppercase tracking-widest text-amber-400/70">
              💡 Hint
            </span>
            <span className="text-sm font-semibold text-amber-200 leading-snug">
              {hint}
            </span>
          </motion.div>
        ) : (
          <motion.button
            key="hint-button"
            onClick={isPlayable ? onUseHint : undefined}
            disabled={!isPlayable}
            whileHover={isPlayable ? { scale: 1.02, y: -1 } : {}}
            whileTap={isPlayable ? { scale: 0.97 } : {}}
            className={`w-full px-4 py-3 border text-sm font-bold transition-all duration-200 outline-none
              focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent
              ${
                isPlayable
                  ? "bg-amber-400/10 border-amber-400/30 text-amber-300 hover:bg-amber-400/15 hover:border-amber-400/50 cursor-pointer"
                  : "bg-white/5 border-white/10 text-white/25 cursor-not-allowed"
              }`}
            aria-label="Use hint"
          >
            💡 Use Hint
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HintCard;
