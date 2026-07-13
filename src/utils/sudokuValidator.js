/**
 * Finds all conflicting cells on the board based on Sudoku rules.
 * A conflict occurs when a number appears more than once in a row, column, or 3x3 box.
 * @param {number[][]} board - The current 9x9 Sudoku grid.
 * @returns {Array<{row: number, col: number}>} Array of conflicting cell coordinates.
 */
export const findConflicts = (board) => {
  const conflicts = [];
  
  // Helper to add a conflict uniquely
  const addConflict = (r, c) => {
    if (!conflicts.some(conflict => conflict.row === r && conflict.col === c)) {
      conflicts.push({ row: r, col: c });
    }
  };

  // Check rows
  for (let r = 0; r < 9; r++) {
    const seen = {};
    for (let c = 0; c < 9; c++) {
      const val = board[r][c];
      if (val !== 0) {
        if (seen[val]) {
          addConflict(r, c);
          seen[val].forEach(pos => addConflict(pos.r, pos.c));
        } else {
          seen[val] = [{ r, c }];
        }
      }
    }
  }

  // Check columns
  for (let c = 0; c < 9; c++) {
    const seen = {};
    for (let r = 0; r < 9; r++) {
      const val = board[r][c];
      if (val !== 0) {
        if (seen[val]) {
          addConflict(r, c);
          seen[val].forEach(pos => addConflict(pos.r, pos.c));
        } else {
          seen[val] = [{ r, c }];
        }
      }
    }
  }

  // Check 3x3 boxes
  for (let boxRow = 0; boxRow < 3; boxRow++) {
    for (let boxCol = 0; boxCol < 3; boxCol++) {
      const seen = {};
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          const r = boxRow * 3 + i;
          const c = boxCol * 3 + j;
          const val = board[r][c];
          if (val !== 0) {
            if (seen[val]) {
              addConflict(r, c);
              seen[val].forEach(pos => addConflict(pos.r, pos.c));
            } else {
              seen[val] = [{ r, c }];
            }
          }
        }
      }
    }
  }

  return conflicts;
};
