import { motion, AnimatePresence } from "framer-motion";

/**
 * HangmanDrawing — SVG gallows with 6 animated body-part stages.
 * Each part appears with a smooth stroke-draw animation via Framer Motion.
 *
 * Stage 0: Empty gallows
 * Stage 1: Head
 * Stage 2: Body
 * Stage 3: Left arm
 * Stage 4: Right arm
 * Stage 5: Left leg
 * Stage 6: Right leg
 *
 * @param {number} wrongGuesses - Current number of wrong guesses (0–6)
 */
const HangmanDrawing = ({ wrongGuesses }) => {
  // Stroke draw animation config
  const drawVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeInOut" },
    },
  };

  // Circle animation for head
  const circleVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.4, type: "spring", stiffness: 200 },
    },
  };

  const strokeProps = {
    stroke: "#e2e8f0",
    strokeWidth: "4",
    strokeLinecap: "round",
    fill: "none",
  };

  return (
    <div className="flex items-center justify-center w-full">
      <svg
        viewBox="0 0 220 280"
        className="w-full max-w-[260px] sm:max-w-[300px]"
        aria-label={`Hangman drawing: ${wrongGuesses} wrong guesses`}
        role="img"
      >
        {/* ── Static Gallows ────────────────────────────────── */}
        {/* Base */}
        <line x1="20" y1="268" x2="200" y2="268" stroke="#6366f1" strokeWidth="5" strokeLinecap="round" />
        {/* Vertical pole */}
        <line x1="60" y1="268" x2="60" y2="20" stroke="#6366f1" strokeWidth="5" strokeLinecap="round" />
        {/* Horizontal beam */}
        <line x1="60" y1="20" x2="150" y2="20" stroke="#6366f1" strokeWidth="5" strokeLinecap="round" />
        {/* Short support brace */}
        <line x1="60" y1="50" x2="90" y2="20" stroke="#6366f1" strokeWidth="4" strokeLinecap="round" />
        {/* Rope */}
        <line x1="150" y1="20" x2="150" y2="55" stroke="#a5b4fc" strokeWidth="3" strokeLinecap="round" />

        {/* ── Body Parts (animated in order) ────────────────── */}

        {/* Stage 1: Head */}
        <AnimatePresence>
          {wrongGuesses >= 1 && (
            <motion.circle
              cx="150"
              cy="75"
              r="20"
              stroke="#f1f5f9"
              strokeWidth="4"
              fill="none"
              variants={circleVariants}
              initial="hidden"
              animate="visible"
              key="head"
            />
          )}
        </AnimatePresence>

        {/* Stage 2: Body */}
        <AnimatePresence>
          {wrongGuesses >= 2 && (
            <motion.line
              x1="150" y1="95"
              x2="150" y2="175"
              {...strokeProps}
              variants={drawVariants}
              initial="hidden"
              animate="visible"
              key="body"
            />
          )}
        </AnimatePresence>

        {/* Stage 3: Left arm */}
        <AnimatePresence>
          {wrongGuesses >= 3 && (
            <motion.line
              x1="150" y1="115"
              x2="115" y2="150"
              {...strokeProps}
              variants={drawVariants}
              initial="hidden"
              animate="visible"
              key="left-arm"
            />
          )}
        </AnimatePresence>

        {/* Stage 4: Right arm */}
        <AnimatePresence>
          {wrongGuesses >= 4 && (
            <motion.line
              x1="150" y1="115"
              x2="185" y2="150"
              {...strokeProps}
              variants={drawVariants}
              initial="hidden"
              animate="visible"
              key="right-arm"
            />
          )}
        </AnimatePresence>

        {/* Stage 5: Left leg */}
        <AnimatePresence>
          {wrongGuesses >= 5 && (
            <motion.line
              x1="150" y1="175"
              x2="115" y2="225"
              {...strokeProps}
              variants={drawVariants}
              initial="hidden"
              animate="visible"
              key="left-leg"
            />
          )}
        </AnimatePresence>

        {/* Stage 6: Right leg */}
        <AnimatePresence>
          {wrongGuesses >= 6 && (
            <motion.line
              x1="150" y1="175"
              x2="185" y2="225"
              {...strokeProps}
              stroke="#f87171"
              variants={drawVariants}
              initial="hidden"
              animate="visible"
              key="right-leg"
            />
          )}
        </AnimatePresence>
      </svg>
    </div>
  );
};

export default HangmanDrawing;
