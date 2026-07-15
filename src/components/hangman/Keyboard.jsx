import { motion } from "framer-motion";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

/**
 * Keyboard — 26 A–Z letter buttons in alphabetical rows.
 * Correct = green highlight, Wrong = red highlight, Used = disabled.
 *
 * @param {Set}      guessedLetters  - All guessed letters
 * @param {string}   word            - The target word (uppercase)
 * @param {function} onGuess         - Callback with the letter string
 * @param {boolean}  disabled        - Disable entire keyboard (game over)
 */
const Keyboard = ({ guessedLetters, word, onGuess, disabled = false }) => {
  return (
    <div
      className="flex flex-wrap justify-center gap-2 max-w-[480px] mx-auto"
      role="group"
      aria-label="Letter keyboard"
    >
      {ALPHABET.map((letter) => {
        const isGuessed = guessedLetters.has(letter);
        const isCorrect = isGuessed && word.includes(letter);
        const isWrong = isGuessed && !word.includes(letter);
        const isDisabled = disabled || isGuessed;

        return (
          <motion.button
            key={letter}
            onClick={() => !isDisabled && onGuess(letter)}
            disabled={isDisabled}
            whileHover={!isDisabled ? { scale: 1.12, y: -2 } : {}}
            whileTap={!isDisabled ? { scale: 0.9 } : {}}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            aria-label={`Letter ${letter}${isCorrect ? ", correct" : isWrong ? ", incorrect" : ""}`}
            aria-pressed={isGuessed}
            className={`
              w-9 h-10 sm:w-10 sm:h-11 rounded-lg text-sm font-bold
              transition-colors duration-200 border outline-none
              focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent
              ${
                isCorrect
                  ? "bg-emerald-500/20 border-emerald-400/50 text-emerald-300 cursor-default"
                  : isWrong
                  ? "bg-rose-500/20 border-rose-400/50 text-rose-300 cursor-default opacity-60"
                  : isDisabled
                  ? "bg-white/5 border-white/10 text-white/20 cursor-not-allowed"
                  : "bg-white/[0.06] border-white/15 text-white/80 cursor-pointer hover:bg-indigo-500/20 hover:border-indigo-400/40 hover:text-white"
              }
            `}
          >
            {letter}
          </motion.button>
        );
      })}
    </div>
  );
};

export default Keyboard;
