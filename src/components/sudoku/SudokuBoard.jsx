import React from 'react';
import SudokuCell from './SudokuCell';

const SudokuBoard = ({ board, initialBoard, selectedCell, conflicts, notes, onCellClick }) => {
  const selectedValue = selectedCell ? board[selectedCell.row][selectedCell.col] : 0;

  return (
    <div className="grid grid-cols-9 gap-0 border-4 border-slate-950 bg-slate-950 rounded-sm overflow-hidden aspect-square">
      {board.map((row, rowIndex) => (
        row.map((cellValue, colIndex) => {
          const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
          const isInitial = initialBoard[rowIndex][colIndex] !== 0;

          let isRelated = false;
          if (selectedCell && !isSelected) {
            const sameRow = selectedCell.row === rowIndex;
            const sameCol = selectedCell.col === colIndex;
            const sameBox = Math.floor(selectedCell.row / 3) === Math.floor(rowIndex / 3) &&
                            Math.floor(selectedCell.col / 3) === Math.floor(colIndex / 3);
            isRelated = sameRow || sameCol || sameBox;
          }

          const isSameValue = !isSelected && cellValue !== 0 && cellValue === selectedValue;
          const isConflict = conflicts.some(c => c.row === rowIndex && c.col === colIndex);

          return (
            <SudokuCell 
              key={`${rowIndex}-${colIndex}`} 
              value={cellValue}
              row={rowIndex}
              col={colIndex}
              isSelected={isSelected}
              isRelated={isRelated}
              isSameValue={isSameValue}
              isConflict={isConflict}
              isInitial={isInitial}
              notes={notes[`${rowIndex}-${colIndex}`] || []}
              onClick={() => onCellClick(rowIndex, colIndex)}
            />
          );
        })
      ))}
    </div>
  );
};

export default SudokuBoard;
