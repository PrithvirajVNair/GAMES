import { motion } from "framer-motion";
import { Flame } from "lucide-react";

/**
 * Individual stat item with animated number display.
 */
const StatItem = ({ label, value, icon, accentColor, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay, ease: "easeOut" }}
    className="flex flex-col items-center gap-1 flex-1 min-w-[70px]"
  >
    <span className="text-lg flex items-center justify-center h-7">{icon}</span>
    <motion.span
      key={value}
      initial={{ scale: 1.3, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`text-2xl sm:text-3xl font-extrabold ${accentColor}`}
    >
      {value}
    </motion.span>
    <span className="text-[0.65rem] font-bold uppercase tracking-widest text-white/40 text-center leading-tight">
      {label}
    </span>
  </motion.div>
);

/**
 * StatsCard — displays win/loss/streak statistics in a glassmorphism card.
 *
 * @param {object}   stats       - { wins, losses, currentStreak, bestStreak }
 * @param {function} onReset     - Callback to reset all statistics
 */
const StatsCard = ({ stats, onReset }) => {
  const { wins, losses, currentStreak, bestStreak } = stats;

  return (
    <div className="w-full bg-white/[0.03] border border-white/8 backdrop-blur-sm p-4 sm:p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[0.7rem] font-extrabold uppercase tracking-widest text-white/40">
          📊 Statistics
        </h2>
        <motion.button
          onClick={onReset}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="text-[0.65rem] font-bold text-white/25 hover:text-rose-400 transition-colors duration-200 uppercase tracking-wide cursor-pointer outline-none focus-visible:text-rose-400"
          aria-label="Reset statistics"
        >
          Reset
        </motion.button>
      </div>

      {/* Stats grid */}
      <div className="flex justify-around gap-2">
        <StatItem label="Wins" value={wins} icon="🏆" accentColor="text-emerald-400" delay={0} />
        <StatItem label="Losses" value={losses} icon="💀" accentColor="text-rose-400" delay={0.05} />
        <StatItem label="Streak" value={currentStreak} icon={<Flame size={18} className="text-amber-400" />} accentColor="text-amber-400" delay={0.1} />
        <StatItem label="Best" value={bestStreak} icon="⭐" accentColor="text-indigo-400" delay={0.15} />
      </div>
    </div>
  );
};

export default StatsCard;
