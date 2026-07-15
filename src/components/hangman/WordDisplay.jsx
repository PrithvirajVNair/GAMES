import { motion, AnimatePresence } from "framer-motion";
import { getDifficultyColor, getCategoryIcon } from "../../utils/hangman/hangmanHelpers";

/**
 * WordDisplay — Shows blanks/revealed letters for the current word.
 * Also shows the category and difficulty badges.
 *
 * @param {string}   word           - The target word (uppercase)
 * @param {Set}      guessedLetters - Set of guessed uppercase letters
 * @param {string}   category       - Word's category
 * @param {string}   difficulty     - Word's difficulty label
 * @param {boolean}  isLost         - Whether the game is over (lost), to show full word in red
 */
const WordDisplay = ({ word, guessedLetters, category, difficulty, isLost = false }) => {
  const diffColors = getDifficultyColor(difficulty);
  const categoryIcon = getCategoryIcon(category);

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      {/* Badges */}
      <div className="flex items-center gap-2 flex-wrap justify-center">
        {/* Category badge */}
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs font-bold tracking-wide">
          <span>{categoryIcon}</span>
          {category}
        </span>

        {/* Difficulty badge */}
        <span
          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold tracking-wide border ${diffColors.bg} ${diffColors.border} ${diffColors.text}`}
        >
          {difficulty}
        </span>
      </div>

      {/* Letter tiles */}
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3 px-2">
        {[...word].map((letter, idx) => {
          const revealed = guessedLetters.has(letter);
          const showRed = isLost && !revealed; // Show unguessed letters in red when lost

          return (
            <div key={idx} className="flex flex-col items-center gap-1">
              <AnimatePresence mode="wait">
                {(revealed || isLost) ? (
                  <motion.span
                    key={`revealed-${idx}`}
                    initial={{ scale: 0.4, opacity: 0, y: -8 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20, delay: idx * 0.03 }}
                    className={`text-2xl sm:text-3xl font-extrabold tracking-widest leading-none min-w-[1.6rem] text-center ${
                      showRed ? "text-rose-400" : "text-white"
                    }`}
                    aria-label={letter}
                  >
                    {letter}
                  </motion.span>
                ) : (
                  <motion.span
                    key={`blank-${idx}`}
                    initial={{ opacity: 1 }}
                    exit={{ scale: 0.4, opacity: 0 }}
                    className="text-2xl sm:text-3xl font-extrabold tracking-widest leading-none min-w-[1.6rem] text-center text-white/10"
                    aria-label="unknown letter"
                  >
                    _
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Underline */}
              <div
                className={`h-[2px] w-6 sm:w-8 rounded-full transition-colors duration-300 ${
                  revealed
                    ? "bg-indigo-400"
                    : showRed
                    ? "bg-rose-400/60"
                    : "bg-white/20"
                }`}
              />
            </div>
          );
        })}
      </div>

      {/* Word length indicator */}
      <p className="text-white/30 text-xs font-medium tracking-widest uppercase">
        {word.length} {word.length === 1 ? "letter" : "letters"}
      </p>
    </div>
  );
};

export default WordDisplay;
