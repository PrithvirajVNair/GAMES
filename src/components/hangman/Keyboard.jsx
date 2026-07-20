import { motion } from "framer-motion";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const QWERTY_ROWS = [
  "QWERTYUIOP".split(""),
  "ASDFGHJKL".split(""),
  "ZXCVBNM".split("")
];

/**
 * Keyboard — QWERTY mobile layout for mobile screens, Alphabetical layout for larger screens.
 * Correct = green highlight, Wrong = red highlight, Used = disabled.
 *
 * @param {Set}      guessedLetters  - All guessed letters
 * @param {string}   word            - The target word (uppercase)
 * @param {function} onGuess         - Callback with the letter string
 * @param {boolean}  disabled        - Disable entire keyboard (game over)
 */
const Keyboard = ({ guessedLetters, word, onGuess, disabled = false }) => {
  // Helper to render a single letter button
  const renderButton = (letter, isMobile = false) => {
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
          aspect-square rounded-lg text-sm sm:text-base font-bold
          transition-colors duration-200 border outline-none flex items-center justify-center
          focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent
          ${isMobile ? "col-span-2 w-full" : "w-10"}
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
  };

  return (
    <div role="group" aria-label="Letter keyboard" className="w-full">
      {/* Mobile Keyboard: QWERTY layout, hidden on sm and above */}
      <div className="flex flex-col gap-2 w-full max-w-[450px] mx-auto sm:hidden">
        {/* Row 1: 10 keys (cols 1-20) */}
        <div className="grid grid-cols-[repeat(20,minmax(0,1fr))] gap-1 w-full">
          {QWERTY_ROWS[0].map((letter) => renderButton(letter, true))}
        </div>

        {/* Row 2: 9 keys, offset by 0.5 key (col-span-1 spacer on each side) */}
        <div className="grid grid-cols-[repeat(20,minmax(0,1fr))] gap-1 w-full">
          <div className="col-span-1" />
          {QWERTY_ROWS[1].map((letter) => renderButton(letter, true))}
          <div className="col-span-1" />
        </div>

        {/* Row 3: 7 keys, offset by 1.5 keys (col-span-3 spacer on each side) */}
        <div className="grid grid-cols-[repeat(20,minmax(0,1fr))] gap-1 w-full">
          <div className="col-span-3" />
          {QWERTY_ROWS[2].map((letter) => renderButton(letter, true))}
          <div className="col-span-3" />
        </div>
      </div>

      {/* Desktop/Tablet Keyboard: Alphabetical layout, hidden on screens below sm */}
      <div className="hidden sm:flex flex-wrap justify-center gap-2 max-w-[480px] mx-auto">
        {ALPHABET.map((letter) => renderButton(letter, false))}
      </div>
    </div>
  );
};

export default Keyboard;
