import { supabase } from '../lib/supabase';

/**
 * Checks if the user has completed today's daily challenge.
 * @param {string} seed - The daily seed (YYYY-MM-DD)
 * @param {string} userId - User's unique identifier
 * @returns {Promise<boolean>} True if completed, false otherwise
 */
export const hasCompletedToday = async (seed, userId) => {
  if (!userId || !seed) return false;

  if (userId === 'local') {
    try {
      const data = JSON.parse(localStorage.getItem(`fqz_daily_${seed}_local`));
      return data?.completed === true;
    } catch (e) {
      return false;
    }
  }

  const { data, error } = await supabase
    .from('sudoku_daily_progress')
    .select('completed')
    .eq('user_id', userId)
    .eq('seed', seed)
    .maybeSingle();

  if (error) {
    console.error('Error checking daily completion:', error);
    return false;
  }

  return data?.completed === true;
};

/**
 * Marks today's daily challenge as completed and saves the final result.
 * @param {Object} resultData
 * @param {string} resultData.seed - The daily seed
 * @param {string} resultData.userId - User's unique identifier
 * @param {number} resultData.timeMs - Completion time in ms
 * @param {number} resultData.mistakes - Mistakes made
 */
export const markCompleted = async ({ seed, userId, timeMs, mistakes }) => {
  if (!userId || !seed) return;

  if (userId === 'local') {
    localStorage.setItem(`fqz_daily_${seed}_local`, JSON.stringify({
      completed: true,
      timeMs,
      mistakes
    }));
    return;
  }

  const { error } = await supabase
    .from('sudoku_daily_progress')
    .upsert({
      user_id: userId,
      seed: seed,
      game_state: {}, // clear game state since it's completed
      completed: true,
      time_ms: timeMs,
      mistakes: mistakes,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id, seed' });

  if (error) {
    console.error('Error marking daily as completed:', error);
  }
};

/**
 * Retrieves the completion result if the user finished it.
 * @param {string} seed
 * @param {string} userId
 * @returns {Promise<Object|null>} The result object or null
 */
export const getCompletedResult = async (seed, userId) => {
  if (!userId || !seed) return null;

  if (userId === 'local') {
    try {
      const data = JSON.parse(localStorage.getItem(`fqz_daily_${seed}_local`));
      if (data && data.completed) {
        return { timeMs: data.timeMs, mistakes: data.mistakes };
      }
    } catch (e) {
      return null;
    }
    return null;
  }

  const { data, error } = await supabase
    .from('sudoku_daily_progress')
    .select('time_ms, mistakes, completed')
    .eq('user_id', userId)
    .eq('seed', seed)
    .maybeSingle();

  if (error) {
    console.error('Error fetching daily result:', error);
    return null;
  }

  if (data && data.completed) {
    return {
      timeMs: data.time_ms,
      mistakes: data.mistakes
    };
  }
  return null;
};

/**
 * Saves an incomplete daily challenge state to allow resuming later.
 * @param {string} seed
 * @param {string} userId
 * @param {Object} gameState - The entire serialized board/history state
 */
export const saveInProgress = async (seed, userId, gameState) => {
  if (!userId || !seed) return;

  if (userId === 'local') {
    localStorage.setItem(`fqz_daily_progress_${seed}_local`, JSON.stringify(gameState));
    return;
  }

  const { error } = await supabase
    .from('sudoku_daily_progress')
    .upsert({
      user_id: userId,
      seed: seed,
      game_state: gameState,
      completed: false,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id, seed' });

  if (error) {
    console.error('Error saving in-progress daily:', error);
  }
};

/**
 * Loads an incomplete daily challenge state if one exists.
 * @param {string} seed
 * @param {string} userId
 * @returns {Promise<Object|null>} The gameState object or null
 */
export const loadInProgress = async (seed, userId) => {
  if (!userId || !seed) return null;

  if (userId === 'local') {
    try {
      const data = JSON.parse(localStorage.getItem(`fqz_daily_progress_${seed}_local`));
      return data || null;
    } catch (e) {
      return null;
    }
  }

  const { data, error } = await supabase
    .from('sudoku_daily_progress')
    .select('game_state, completed')
    .eq('user_id', userId)
    .eq('seed', seed)
    .maybeSingle();

  if (error) {
    console.error('Error loading in-progress daily:', error);
    return null;
  }

  if (data && !data.completed) {
    return data.game_state;
  }
  return null;
};

/**
 * Clears the in-progress state (e.g. if the user restarts).
 * @param {string} seed
 * @param {string} userId
 */
export const clearInProgress = async (seed, userId) => {
  if (!userId || !seed) return;

  if (userId === 'local') {
    localStorage.removeItem(`fqz_daily_progress_${seed}_local`);
    return;
  }

  // We delete the row if it's not completed. If it's completed, we shouldn't clear it.
  const { error } = await supabase
    .from('sudoku_daily_progress')
    .delete()
    .eq('user_id', userId)
    .eq('seed', seed)
    .eq('completed', false);

  if (error) {
    console.error('Error clearing in-progress daily:', error);
  }
};

/**
 * Calculates the user's current daily challenge streak.
 * @param {string} userId - User's unique identifier
 * @returns {Promise<number>} The current streak count
 */
export const calculateStreakFromDates = (dates) => {
  if (!dates || dates.length === 0) return 0;
  
  // Parse YYYY-MM-DD as local date to prevent UTC timezone shifts
  const parseLocalDate = (dateStr) => {
    const [y, m, d] = dateStr.split('-');
    return new Date(y, m - 1, d);
  };

  const completedDates = [...dates].sort((a, b) => parseLocalDate(b) - parseLocalDate(a));

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

  if (!completedDates.includes(todayStr) && !completedDates.includes(yesterdayStr)) {
    return 0;
  }

  let streak = 0;
  let currentDate = parseLocalDate(completedDates[0]);

  for (let i = 0; i < completedDates.length; i++) {
    const seedStr = completedDates[i];
    const expectedStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
    
    if (seedStr === expectedStr) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
};

export const getDailyStreak = async (userId) => {
  if (!userId) return 0;

  let completedDates = [];

  if (userId === 'local') {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('fqz_daily_') && key.endsWith('_local')) {
        const seed = key.split('_')[2];
        try {
          const data = JSON.parse(localStorage.getItem(key));
          if (data && data.completed) {
            completedDates.push(seed);
          }
        } catch (e) {}
      }
    }
  } else {
    const [{ data: progData }, { data: scoreData }] = await Promise.all([
      supabase.from('sudoku_daily_progress').select('seed').eq('user_id', userId).eq('completed', true),
      supabase.from('sudoku_daily_scores').select('seed').eq('user_id', userId)
    ]);

    const progSeeds = progData ? progData.map(r => r.seed) : [];
    const scoreSeeds = scoreData ? scoreData.map(r => r.seed) : [];
    
    // Merge and deduplicate
    completedDates = [...new Set([...progSeeds, ...scoreSeeds])];
  }

  return calculateStreakFromDates(completedDates);
};

/**
 * Calculates streaks for multiple users in bulk (for leaderboards).
 * @param {string[]} userIds - Array of user identifiers
 * @returns {Promise<Object>} A map of userId to streak count
 */
export const getDailyStreaksForUsers = async (userIds) => {
  if (!userIds || userIds.length === 0) return {};
  
  const [{ data: progData }, { data: scoreData }] = await Promise.all([
    supabase.from('sudoku_daily_progress').select('user_id, seed').eq('completed', true).in('user_id', userIds),
    supabase.from('sudoku_daily_scores').select('user_id, seed').in('user_id', userIds)
  ]);
  
  const userDates = {};
  
  const addRows = (rows) => {
    if (!rows) return;
    rows.forEach(row => {
      if (!userDates[row.user_id]) userDates[row.user_id] = new Set();
      userDates[row.user_id].add(row.seed);
    });
  };

  addRows(progData);
  addRows(scoreData);
  
  const userStreaks = {};
  Object.keys(userDates).forEach(uid => {
    userStreaks[uid] = calculateStreakFromDates(Array.from(userDates[uid]));
  });
  
  return userStreaks;
};
