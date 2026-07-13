import React from 'react';

const SudokuCell = ({ value, row, col, isSelected, isRelated, isSameValue, isConflict, isInitial, notes, onClick }) => {
  // Determine if we need thick borders for 3x3 box separation
  const isRightBorder = col === 2 || col === 5;
  const isBottomBorder = row === 2 || row === 5;

  let borderClasses = "border border-slate-700/30";
  if (isRightBorder) borderClasses += " border-r-slate-950 border-r-4";
  if (isBottomBorder) borderClasses += " border-b-slate-950 border-b-4";

  // Background color based on selection and highlighting
  let bgClass = "bg-[#0f172a] hover:bg-[#1e293b]";
  if (isSelected) {
    bgClass = "bg-blue-900/60";
  } else if (isSameValue) {
    bgClass = "bg-blue-800/40";
  } else if (isRelated) {
    bgClass = "bg-[#1e293b]"; // Slight highlight for related row/col/box
  }

  // Override with error color if conflict
  if (isConflict) {
    bgClass = isSelected ? "bg-red-900/60" : "bg-red-900/30";
  }

  // Text color based on whether it's an initial clue or user input
  let textClass = "text-transparent"; // for 0
  if (value !== 0) {
    textClass = isInitial ? "text-blue-300 font-semibold" : "text-emerald-300 font-light";
    if (isConflict) {
      textClass = "text-red-400 font-semibold";
    }
  }

  // Render notes if empty
  const renderContent = () => {
    if (value !== 0) return value;
    if (notes && notes.length > 0) {
      return (
        <div className="grid grid-cols-3 grid-rows-3 w-full h-full p-[0.5px] sm:p-[1px] md:p-[2px]">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
            <div key={n} className="flex items-center justify-center text-[0.45rem] sm:text-[0.6rem] md:text-[0.65rem] leading-none text-slate-400 font-medium">
              {notes.includes(n) ? n : ''}
            </div>
          ))}
        </div>
      );
    }
    return '';
  };

  return (
    <div 
      onClick={onClick}
      className={`
        flex items-center justify-center 
        aspect-square w-full
        text-base sm:text-xl md:text-2xl cursor-pointer select-none
        transition-colors duration-150 relative
        ${borderClasses} 
        ${bgClass}
        ${textClass}
      `}
    >
      {renderContent()}
    </div>
  );
};

export default SudokuCell;
