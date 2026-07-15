import { motion } from "framer-motion";
import { formatDateStr } from "../../utils/hangman/checkNewDay";
import { Flame } from "lucide-react";

/**
 * ModeSelector — Renders the game mode selection screen inside a glassmorphism
 * container (matching Sudoku's card layout) with Daily Challenge, Unlimited Mode,
 * and feature details.
 *
 * @param {function} onSelect - Called with "daily" or "unlimited"
 */
const ModeSelector = ({ onSelect }) => {
  const today = new Date().toISOString().slice(0, 10);
  const todayFormatted = formatDateStr(today);

  return (
    <div className="relative z-[1] w-full max-w-[500px] bg-white/[0.04] border border-white/10 p-5 sm:p-6 md:p-8 backdrop-blur-[20px] shadow-[0_25px_60px_rgba(0,0,0,0.5),inset_0_0_0_1px_rgba(255,255,255,0.05)] flex flex-col items-center">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="text-center flex flex-col items-center gap-2 mb-6"
      >
        <div
          className="text-[3rem] sm:text-[3.5rem] animate-float"
          style={{ filter: "drop-shadow(0 0 25px rgba(139,92,246,0.45))" }}
        >
          💀
        </div>
        <h1 className="text-[clamp(1.6rem,5vw,2.2rem)] font-extrabold bg-[linear-gradient(90deg,#a78bfa,#60a5fa,#f472b6)] bg-clip-text text-transparent tracking-tight">
          Hangman
        </h1>
        <p className="text-[0.8rem] text-white/45 font-medium">
          Choose your mode to begin
        </p>
      </motion.div>

      {/* Mode Cards */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
        }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mb-6"
      >
        {/* Daily Challenge Card */}
        <motion.button
          variants={{
            hidden: { opacity: 0, y: 28 },
            visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 220, damping: 22 } },
          }}
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect("daily")}
          className="group relative flex flex-col gap-4 p-5
            bg-gradient-to-br from-amber-500/10 to-orange-500/5
            border border-amber-400/20 hover:border-amber-400/50
            hover:shadow-[0_20px_40px_rgba(251,191,36,0.12)]
            transition-all duration-300 text-left cursor-pointer outline-none
            focus-visible:ring-2 focus-visible:ring-amber-400"
          aria-label="Play Daily Challenge"
        >
          {/* Once-daily badge */}
          <span className="absolute top-3 right-3 text-[0.55rem] font-extrabold uppercase tracking-widest text-amber-400/70 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5">
            Once Daily
          </span>

          {/* Icon */}
          <div className="w-11 h-11 bg-amber-400/15 border border-amber-400/25 flex items-center justify-center text-xl">
            📅
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[0.62rem] font-extrabold uppercase tracking-widest text-amber-400">
              Daily Challenge
            </span>
            <h2 className="text-base font-extrabold text-white">
              Today's Puzzle
            </h2>
            <p className="text-xs text-white/40 leading-relaxed">
              One special word every day. Same puzzle for everyone.
            </p>
          </div>

          <div className="mt-auto flex items-center gap-1.5 text-[0.68rem] font-semibold text-amber-300/60">
            <span>🗓</span>
            <span>{todayFormatted}</span>
          </div>
        </motion.button>

        {/* Unlimited Card */}
        <motion.button
          variants={{
            hidden: { opacity: 0, y: 28 },
            visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 220, damping: 22 } },
          }}
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect("unlimited")}
          className="group flex flex-col gap-4 p-5
            bg-gradient-to-br from-indigo-500/10 to-violet-500/5
            border border-indigo-500/20 hover:border-indigo-400/50
            hover:shadow-[0_20px_40px_rgba(99,102,241,0.12)]
            transition-all duration-300 text-left cursor-pointer outline-none
            focus-visible:ring-2 focus-visible:ring-indigo-400"
          aria-label="Play Unlimited Mode"
        >
          {/* Icon */}
          <div className="w-11 h-11 bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-xl">
            ∞
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[0.62rem] font-extrabold uppercase tracking-widest text-indigo-400">
              Unlimited Mode
            </span>
            <h2 className="text-base font-extrabold text-white">
              Play Freely
            </h2>
            <p className="text-xs text-white/40 leading-relaxed">
              Play unlimited random puzzles from a massive word bank.
            </p>
          </div>

          <div className="mt-auto flex items-center gap-1.5 text-[0.68rem] font-semibold text-indigo-300/60">
            <span>🎯</span>
            <span>12 Categories</span>
          </div>
        </motion.button>
      </motion.div>

      {/* Feature Details Container */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
        className="grid grid-cols-2 gap-2.5 w-full"
      >
        {[
          { icon: "📖", title: "1,200+ Words", desc: "Expansive local vocabulary bank" },
          { icon: "🗂️", title: "12 Categories", desc: "Geography, Space, Music, etc." },
          { icon: "💡", title: "Smart Hints", desc: "Clues to help solve the word" },
          { icon: <Flame size={16} className="text-amber-400" />, title: "Daily Streak", desc: "Build streaks for daily plays" },
        ].map((f) => (
          <div
            key={f.title}
            className="flex items-start gap-2.5 bg-white/[0.02] border border-white/6 p-3"
          >
            <span className="text-base mt-0.5 flex items-center justify-center h-5 w-5">{f.icon}</span>
            <div className="flex flex-col gap-0.5">
              <strong className="text-[0.72rem] font-bold text-white/80">{f.title}</strong>
              <span className="text-[0.62rem] text-white/35 leading-snug">{f.desc}</span>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default ModeSelector;
