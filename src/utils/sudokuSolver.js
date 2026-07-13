/**
 * Checks if it's valid to place a number in a given cell.
 * @param {number[][]} board - 9x9 Sudoku grid
 * @param {number} row - Row index (0-8)
 * @param {number} col - Column index (0-8)
 * @param {number} num - Number to place (1-9)
 * @returns {boolean} True if valid, false otherwise
 */
export const isValid = (board, row, col, num) => {
  // Check row
  for (let i = 0; i < 9; i++) {
    if (board[row][i] === num) return false;
  }

  // Check column
  for (let i = 0; i < 9; i++) {
    if (board[i][col] === num) return false;
  }

  // Check 3x3 box
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[startRow + i][startCol + j] === num) return false;
    }
  }

  return true;
};

/**
 * Solves the Sudoku board using backtracking (in-place).
 * @param {number[][]} board - 9x9 Sudoku grid (0 represents empty cells)
 * @returns {boolean} True if solved, false if unsolvable
 */
export const solveSudoku = (board) => {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      // Find an empty cell
      if (board[row][col] === 0) {
        // Try numbers 1-9
        for (let num = 1; num <= 9; num++) {
          if (isValid(board, row, col, num)) {
            // Place the number if valid
            board[row][col] = num;

            // Recursively attempt to solve the rest of the board
            if (solveSudoku(board)) {
              return true;
            }

            // If it doesn't lead to a solution, backtrack
            board[row][col] = 0;
          }
        }
        // If no number 1-9 works, the board is unsolvable from this state
        return false;
      }
    }
  }
  // If we fill all cells without returning false, it's solved
  return true;
};

/**
 * Counts the total number of solutions for a given board.
 * Useful for ensuring a generated puzzle has exactly ONE unique solution.
 * @param {number[][]} board - 9x9 Sudoku grid
 * @param {number} limit - Maximum number of solutions to look for (default 2, for uniqueness check)
 * @returns {number} Total number of solutions found (up to limit)
 */
export const countSolutions = (board, limit = 2) => {
  let count = 0;

  const solve = () => {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === 0) {
          for (let num = 1; num <= 9; num++) {
            if (isValid(board, row, col, num)) {
              board[row][col] = num;
              solve();
              board[row][col] = 0; // Backtrack

              if (count >= limit) return; // Stop early if we reached the limit
            }
          }
          return;
        }
      }
    }
    // Found a solution
    count++;
  };

  solve();
  return count;
};
