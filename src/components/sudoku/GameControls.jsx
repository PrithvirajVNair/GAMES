import React from 'react';

const GameControls = ({ pencilMode, togglePencilMode, onErase, onUndo, canUndo, onHint, hintsRemaining, isExpert }) => {
  return (
    <div className="grid grid-cols-4 gap-1.5 sm:gap-2 w-full mt-4 px-1 sm:px-2">
      <button 
        onClick={onUndo}
        disabled={!canUndo}
        className="flex flex-col items-center justify-center gap-0.5 sm:gap-1 py-1.5 sm:py-2 bg-[#1e293b] border border-white/10 text-gray-400 rounded-xl font-bold transition-all duration-200 hover:bg-[#334155] hover:text-white shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="text-lg sm:text-xl">↩️</span> 
        <span className="text-[10px] sm:text-xs uppercase tracking-wider">Undo</span>
      </button>

      <button 
        onClick={onErase}
        className="flex flex-col items-center justify-center gap-0.5 sm:gap-1 py-1.5 sm:py-2 bg-[#1e293b] border border-white/10 text-gray-400 rounded-xl font-bold transition-all duration-200 hover:bg-[#334155] hover:text-white shadow-md active:scale-95"
      >
        <span className="text-lg sm:text-xl">🧹</span> 
        <span className="text-[10px] sm:text-xs uppercase tracking-wider">Erase</span>
      </button>

      <button 
        onClick={togglePencilMode}
        className={`flex flex-col items-center justify-center gap-0.5 sm:gap-1 py-1.5 sm:py-2 rounded-xl font-bold transition-all duration-200 shadow-md ${
          pencilMode 
            ? 'bg-blue-600 text-white border border-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.4)]' 
            : 'bg-[#1e293b] text-gray-400 border border-white/10 hover:bg-[#334155] hover:text-white'
        }`}
      >
        <span className="text-lg sm:text-xl">✏️</span> 
        <span className="text-[10px] sm:text-xs uppercase tracking-wider">Notes</span>
      </button>

      {isExpert ? (
        <button 
          disabled
          className="flex flex-col items-center justify-center gap-0.5 sm:gap-1 py-1.5 sm:py-2 bg-[#1e293b] border border-white/5 text-gray-500 rounded-xl font-bold opacity-40 cursor-not-allowed"
        >
          <span className="text-lg sm:text-xl">🔒</span> 
          <span className="text-[10px] sm:text-xs uppercase tracking-wider">Locked</span>
        </button>
      ) : (
        <button 
          onClick={onHint}
          disabled={hintsRemaining <= 0}
          className="flex flex-col items-center justify-center gap-0.5 sm:gap-1 py-1.5 sm:py-2 bg-[#1e293b] border border-white/10 text-emerald-400 rounded-xl font-bold transition-all duration-200 hover:bg-[#334155] hover:text-emerald-300 shadow-md active:scale-95 disabled:opacity-45 disabled:cursor-not-allowed"
        >
          <span className="text-lg sm:text-xl">💡</span> 
          <span className="text-[10px] sm:text-xs uppercase tracking-wider">Hint ({hintsRemaining})</span>
        </button>
      )}
    </div>
  );
};

export default GameControls;
