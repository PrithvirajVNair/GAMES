import React from 'react';

const DifficultySelector = ({ isOpen, onSelect, onClose }) => {
  if (!isOpen) return null;

  const difficulties = [
    { id: 'EASY', color: 'text-emerald-400', bg: 'bg-emerald-400/10', hover: 'hover:bg-emerald-400/20' },
    { id: 'MEDIUM', color: 'text-amber-400', bg: 'bg-amber-400/10', hover: 'hover:bg-amber-400/20' },
    { id: 'HARD', color: 'text-orange-500', bg: 'bg-orange-500/10', hover: 'hover:bg-orange-500/20' },
    { id: 'EXPERT', color: 'text-red-500', bg: 'bg-red-500/10', hover: 'hover:bg-red-500/20' }
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-6 max-w-xs w-full text-center shadow-2xl animate-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 mb-6">
          New Game
        </h2>
        <div className="flex flex-col gap-3">
          {difficulties.map(d => (
            <button 
              key={d.id}
              onClick={() => onSelect(d.id)}
              className={`w-full py-3 px-4 rounded-xl font-bold tracking-widest border border-white/5 transition-all hover:scale-[1.02] active:scale-95 ${d.bg} ${d.hover} ${d.color}`}
            >
              {d.id}
            </button>
          ))}
        </div>
        <button 
          onClick={onClose}
          className="mt-6 w-full py-2 text-gray-400 hover:text-white font-semibold transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default DifficultySelector;
