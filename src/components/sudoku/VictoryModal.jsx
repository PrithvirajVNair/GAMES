import React from 'react';
import { formatTime } from '../../utils/sudokuHelpers';
import { Flame } from 'lucide-react';

const VictoryModal = ({ isOpen, time, difficulty, onPlayAgain, onBackToMenu, isDaily, dailyStreak, user, scoreSubmitted, isSubmitting, onSaveScore }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#1e293b] border border-white/10 p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in duration-300">
        <div className="text-6xl mb-4 animate-bounce" style={{ filter: "drop-shadow(0 0 25px rgba(52,211,153,0.45))" }}>
          🎉
        </div>
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 mb-2">
          Puzzle Solved!
        </h2>
        <p className="text-gray-400 mb-6">
          {isDaily 
            ? "You completed today's Daily Challenge!" 
            : `You completed the ${difficulty.toLowerCase()} Sudoku puzzle!`}
        </p>
        
        {isDaily && dailyStreak > 0 && (
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/30 text-orange-400 px-4 py-1.5 rounded-full text-sm font-bold shadow-[0_0_15px_rgba(249,115,22,0.2)]">
              <Flame size={14} className="flex-shrink-0" />
              {dailyStreak} Day Streak
            </div>
          </div>
        )}

        <div className="bg-[#0f172a] p-4 mb-6 border border-white/5">
          <div className="text-sm text-gray-500 uppercase tracking-widest mb-1">Time</div>
          <div className="text-3xl font-mono text-emerald-400">{formatTime(time)}</div>
        </div>

        {(isDaily || difficulty === "EXPERT") && (
          <div className="mb-6 w-full flex justify-center">
            {scoreSubmitted ? (
              <div className="w-full py-2.5 px-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center gap-2">
                <span>✅</span> Score Saved
              </div>
            ) : isSubmitting ? (
              <div className="w-full py-2.5 px-4 bg-amber-500/10 border border-amber-500/20 text-amber-500 font-bold flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                Saving Score...
              </div>
            ) : !user ? (
              <button
                onClick={onSaveScore}
                className="w-full py-2.5 px-4 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-500 font-bold transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                💾 Save Score
              </button>
            ) : null}
          </div>
        )}

        <div className="flex flex-col gap-3 w-full">
          {!isDaily && (
            <button 
              onClick={onPlayAgain}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold shadow-[0_4px_18px_rgba(37,99,235,0.35)] hover:shadow-[0_6px_24px_rgba(37,99,235,0.5)] transition-all active:scale-95"
            >
              Play Again
            </button>
          )}
          <button 
            onClick={onBackToMenu}
            className={`w-full py-3 px-4 font-bold transition-all active:scale-95 ${
              isDaily 
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-[0_4px_18px_rgba(37,99,235,0.35)] hover:shadow-[0_6px_24px_rgba(37,99,235,0.5)]"
                : "bg-white/[0.04] border border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            Back to Menu
          </button>
        </div>
      </div>
    </div>
  );
};

export default VictoryModal;
