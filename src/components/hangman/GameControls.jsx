import { motion } from "framer-motion";

/**
 * GameControls — New Game, Hint (delegated to HintCard), and Mute toggle.
 * New Game is always available; Mute is a simple toggle icon.
 *
 * @param {function} onNewGame    - Callback to start a new game
 * @param {boolean}  muted        - Current mute state
 * @param {function} onToggleMute - Callback to toggle mute
 */
const GameControls = ({ onNewGame, muted, onToggleMute }) => {
  return (
    <div className="flex items-center gap-3 w-full">
      {/* New Game */}
      <motion.button
        onClick={onNewGame}
        whileHover={{ scale: 1.03, y: -1 }}
        whileTap={{ scale: 0.97 }}
        className="flex-1 py-3 px-5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-sm
          shadow-[0_4px_18px_rgba(99,102,241,0.3)] hover:shadow-[0_6px_24px_rgba(99,102,241,0.45)]
          transition-shadow duration-200 cursor-pointer outline-none
          focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
        aria-label="Start new game"
      >
        ↺ New Game
      </motion.button>

      {/* Mute toggle */}
      <motion.button
        onClick={onToggleMute}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className="w-11 h-11 bg-white/[0.06] border border-white/15 text-white/60
          hover:bg-white/10 hover:border-white/25 hover:text-white
          transition-all duration-200 flex items-center justify-center text-lg cursor-pointer outline-none
          focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
        aria-label={muted ? "Unmute sound" : "Mute sound"}
        aria-pressed={muted}
      >
        {muted ? "🔇" : "🔊"}
      </motion.button>
    </div>
  );
};

export default GameControls;
