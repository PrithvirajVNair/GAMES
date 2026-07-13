import { LEADERBOARD_ELIGIBILITY, LEADERBOARD_MODES } from './leaderboardConstants.js';

/**
 * Validates whether a completed game session qualifies for leaderboard submission.
 * Ensures the puzzle is finished without hints on Expert difficulty.
 * 
 * @param {Object} gameData
 * @param {boolean} gameData.isComplete - True if the puzzle was successfully solved
 * @param {string} gameData.difficulty - Difficulty level played
 * @param {number} gameData.hintsUsed - Number of hints used
 * @param {number} gameData.timeMs - Total time elapsed in milliseconds
 * @param {string} gameData.mode - The game mode played (daily | unlimited)
 * 
 * @returns {{ eligible: boolean, reason?: string }} Result and rejection reason if applicable
 */
export const validateLeaderboardEligibility = (gameData) => {
  if (!gameData) {
    return { eligible: false, reason: 'Missing game data.' };
  }

  if (!gameData.isComplete) {
    return { eligible: false, reason: 'Puzzle must be successfully completed.' };
  }

  if (!Object.values(LEADERBOARD_MODES).includes(gameData.mode)) {
    return { eligible: false, reason: 'Invalid or missing game mode.' };
  }

  const requiredDifficulty = gameData.mode === LEADERBOARD_MODES.DAILY ? 'MEDIUM' : LEADERBOARD_ELIGIBILITY.REQUIRED_DIFFICULTY;

  if (gameData.difficulty !== requiredDifficulty) {
    return { eligible: false, reason: `Only ${requiredDifficulty} difficulty is eligible for ${gameData.mode} leaderboards.` };
  }

  if (gameData.hintsUsed > LEADERBOARD_ELIGIBILITY.MAX_HINTS_ALLOWED) {
    return { eligible: false, reason: 'Hints disqualify you from the leaderboard.' };
  }

  if (typeof gameData.timeMs !== 'number' || gameData.timeMs <= 0) {
    return { eligible: false, reason: 'A valid completion time is required.' };
  }

  return { eligible: true };
};
