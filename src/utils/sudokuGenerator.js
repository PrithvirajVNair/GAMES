import { isValid, countSolutions } from './sudokuSolver.js';
import { createRandom } from './random.js';

/**
 * Creates an empty 9x9 Sudoku board.
 * @returns {number[][]} A 9x9 array filled with 0s.
 */
export const createEmptyBoard = () => {
  return Array.from({ length: 9 }, () => Array(9).fill(0));
};

/**
 * Shuffles an array in place (Fisher-Yates shuffle).
 * @param {Array} array 
 * @param {Object} rng - Seeded random number generator
 * @returns {Array} The shuffled array.
 */
const shuffleArray = (array, rng) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(rng.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

/**
 * Recursively fills the board with valid random numbers to create a complete Sudoku.
 * @param {number[][]} board - The Sudoku grid to fill.
 * @param {Object} rng - Seeded random number generator
 * @returns {boolean} True if the board was successfully filled.
 */
export const fillBoard = (board, rng) => {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) {
        // Try numbers 1-9 in a random order
        const numbers = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9], rng);

        for (const num of numbers) {
          if (isValid(board, row, col, num)) {
            board[row][col] = num;

            // Recursively attempt to fill the rest of the board
            if (fillBoard(board, rng)) {
              return true;
            }

            // Backtrack if placing 'num' doesn't lead to a valid full board
            board[row][col] = 0;
          }
        }
        // If no number can be placed, this path is a dead end
        return false;
      }
    }
  }
  // Board is completely filled
  return true;
};

/**
 * Generates a completely filled, valid 9x9 Sudoku board.
 * @param {Object} rng - Seeded random number generator
 * @returns {number[][]} A fully solved Sudoku grid.
 */
export const generateCompletedBoard = (rng) => {
  const board = createEmptyBoard();
  fillBoard(board, rng);
  return board;
};

/**
 * Removes numbers from the board to create a puzzle of the desired difficulty.
 * @param {number[][]} board - The completely filled Sudoku grid.
 * @param {number} attempts - Number of cells to attempt to remove. 
 * @param {Object} rng - Seeded random number generator
 * Note: Not all attempts will succeed because we ensure a unique solution.
 * @returns {number[][]} The puzzle grid with empty cells (0s).
 */
export const removeCells = (board, attempts, rng) => {
  // Create a deep copy so we don't mutate the original solved board
  const puzzle = board.map(row => [...row]);

  while (attempts > 0) {
    let row = Math.floor(rng.random() * 9);
    let col = Math.floor(rng.random() * 9);

    // If the cell is already empty, skip it but don't count it as an attempt
    while (puzzle[row][col] === 0) {
      row = Math.floor(rng.random() * 9);
      col = Math.floor(rng.random() * 9);
    }

    const backup = puzzle[row][col];
    puzzle[row][col] = 0;

    // Check if the board still has a unique solution
    // We create a deep copy to pass into countSolutions because it modifies the board
    const puzzleCopy = puzzle.map(r => [...r]);
    
    if (countSolutions(puzzleCopy) !== 1) {
      // If removing this cell caused multiple solutions, put it back
      puzzle[row][col] = backup;
    }

    attempts--;
  }

  return puzzle;
};

export const DIFFICULTIES = {
  EASY: 35,
  MEDIUM: 45,
  HARD: 55,
  EXPERT: 65
};

/**
 * Generates a new Sudoku puzzle of the given difficulty.
 * @param {string} difficulty - One of 'EASY', 'MEDIUM', 'HARD', 'EXPERT'
 * @param {string|number} [seed] - Optional seed for deterministic puzzle generation
 * @returns {Object} An object containing the original solved board and the playable puzzle.
 */
export const generatePuzzle = (difficulty = 'EASY', seed) => {
  const rng = createRandom(seed);
  const solvedBoard = generateCompletedBoard(rng);
  const attempts = DIFFICULTIES[difficulty] || DIFFICULTIES.EASY;
  const puzzle = removeCells(solvedBoard, attempts, rng);

  return {
    puzzle,
    solvedBoard
  };
};
