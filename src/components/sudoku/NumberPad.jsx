import React from 'react';

const NumberPad = ({ onNumberClick }) => {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div className="grid grid-cols-5 gap-1.5 sm:gap-2 mt-4 sm:mt-6 w-full">
      {numbers.map((num) => (
        <button
          key={num}
          onClick={() => onNumberClick(num)}
          className="bg-[#1e293b] hover:bg-blue-600 text-white font-bold py-2.5 sm:py-4 rounded-lg text-lg sm:text-2xl transition-colors shadow-md border border-slate-700 active:scale-95"
        >
          {num}
        </button>
      ))}
      <button 
        onClick={() => onNumberClick(0)} // 0 means erase
        className="bg-red-900/40 hover:bg-red-600 text-red-200 hover:text-white font-bold py-2.5 sm:py-4 rounded-lg text-lg sm:text-2xl transition-colors shadow-md border border-red-800/50 active:scale-95"
      >
        ⌫
      </button>
    </div>
  );
};

export default NumberPad;
