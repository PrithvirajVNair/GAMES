import { motion } from "framer-motion";
import { getProgressPercent, getProgressColor } from "../../utils/hangman/hangmanHelpers";

/**
 * ProgressBar — shows remaining attempts as an animated horizontal bar.
 * Colour transitions green → amber → red as wrong guesses increase.
 *
 * @param {number} wrongGuesses - Current wrong guess count (0–6)
 * @param {number} maxWrong     - Max allowed wrong guesses (default 6)
 */
const ProgressBar = ({ wrongGuesses, maxWrong = 6 }) => {
  const percent = getProgressPercent(wrongGuesses, maxWrong);
  const gradientClass = getProgressColor(wrongGuesses);
  const remaining = maxWrong - wrongGuesses;

  return (
    <div className="w-full flex flex-col gap-1.5">
      {/* Label row */}
      <div className="flex items-center justify-between text-[0.68rem] font-bold uppercase tracking-widest">
        <span className="text-white/35">Attempts Left</span>
        <span
          className={`${
            remaining <= 1
              ? "text-rose-400"
              : remaining <= 3
              ? "text-amber-400"
              : "text-emerald-400"
          }`}
        >
          {remaining} / {maxWrong}
        </span>
      </div>

      {/* Bar track */}
      <div className="h-2 w-full rounded-full bg-white/8 overflow-hidden">
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${gradientClass}`}
          initial={{ width: "100%" }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          role="progressbar"
          aria-valuenow={remaining}
          aria-valuemin={0}
          aria-valuemax={maxWrong}
          aria-label={`${remaining} attempts remaining`}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
