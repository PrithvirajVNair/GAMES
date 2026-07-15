import { motion } from "framer-motion";
import { formatDateStr } from "../../utils/hangman/checkNewDay";
import { Flame } from "lucide-react";

/**
 * DailyBadge — header strip shown while Daily Mode is active.
 * Displays the "Daily Challenge" label, today's date, and the current streak.
 *
 * @param {string} todayDateStr  - "YYYY-MM-DD"
 * @param {number} currentStreak - Player's current daily win streak
 */
const DailyBadge = ({ todayDateStr, currentStreak }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-wrap items-center justify-center gap-3"
    >
      {/* Badge */}
      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400/12 border border-amber-400/30 text-amber-300 text-xs font-extrabold tracking-widest uppercase">
        📅 Daily Challenge
      </span>

      {/* Date */}
      <span className="text-white/40 text-xs font-semibold">
        {formatDateStr(todayDateStr)}
      </span>

      {/* Streak */}
      {currentStreak > 0 && (
        <motion.span
          key={currentStreak}
          initial={{ scale: 1.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-500/10 border border-orange-400/25 text-orange-300 text-xs font-extrabold"
        >
          <Flame size={14} className="text-orange-400 flex-shrink-0" />
          <span>{currentStreak} day{currentStreak !== 1 ? "s" : ""} streak</span>
        </motion.span>
      )}
    </motion.div>
  );
};

export default DailyBadge;
