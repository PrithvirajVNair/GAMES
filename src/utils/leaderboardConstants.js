/**
 * Leaderboard Game Modes
 * The Sudoku game only tracks leaderboards for these two specific modes.
 */
export const LEADERBOARD_MODES = {
  UNLIMITED: 'unlimited',
  DAILY: 'daily'
};

/**
 * Validation rules for a score to be eligible for the leaderboard.
 * 
 * Both Unlimited and Daily leaderboards require EXPERT difficulty
 * and zero hints used to ensure competitive fairness.
 */
export const LEADERBOARD_ELIGIBILITY = {
  REQUIRED_DIFFICULTY: 'EXPERT',
  MAX_HINTS_ALLOWED: 0
};
