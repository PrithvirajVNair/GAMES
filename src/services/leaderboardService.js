import { supabase } from '../lib/supabase';
import { getDailyStreaksForUsers } from './dailyChallengeService';

/**
 * Submits a new score to the leaderboard.
 * Enforces the "Best Score Rule": 
 * - Unlimited: Keep only the user's fastest time.
 * - Daily: Keep only the user's fastest time for that specific day's seed.
 * 
 * @param {Object} scoreData
 * @param {string} scoreData.userId - Unique identifier for the user
 * @param {string} scoreData.mode - 'daily' | 'unlimited'
 * @param {string|null} scoreData.seed - The seed string (e.g. '2026-07-13') for daily, null for unlimited
 * @param {number} scoreData.timeMs - Completion time in milliseconds
 * @param {number} scoreData.mistakes - Number of mistakes made
 * @returns {Promise<Object>} The saved score record
 */
export const submitScore = async ({ userId, mode, seed = null, timeMs, mistakes = 0 }) => {
  if (!userId) {
    throw new Error('UserId is required to submit a score');
  }

  if (mode === 'daily') {
    if (!seed) throw new Error('Seed is required for daily mode');
    // Upsert daily score
    const { data, error } = await supabase
      .from('sudoku_daily_scores')
      .upsert({
        user_id: userId,
        seed: seed,
        time_ms: timeMs,
        mistakes: mistakes
      }, { onConflict: 'user_id, seed' })
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    // Unlimited mode
    // First, fetch the existing best score for this user
    const { data: existing } = await supabase
      .from('sudoku_unlimited_scores')
      .select('time_ms')
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) {
      if (timeMs >= existing.time_ms) {
        // Not a new best time, do not overwrite
        return { message: 'Not a new best time', time_ms: existing.time_ms };
      }
    }

    // Upsert the new best time
    const { data, error } = await supabase
      .from('sudoku_unlimited_scores')
      .upsert({
        user_id: userId,
        time_ms: timeMs,
        mistakes: mistakes,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

/**
 * Retrieves the global leaderboard.
 * Sorts by timeMs (ascending).
 * 
 * @param {Object} options
 * @param {string} options.mode - 'daily' | 'unlimited'
 * @param {string|null} options.seed - Required if mode is 'daily'
 * @param {number} options.limit - Number of top entries to fetch (default: 100)
 * @returns {Promise<Array>} List of score objects
 */
export const getLeaderboard = async ({ mode, seed = null, limit = 100 }) => {
  if (mode === 'daily') {
    if (!seed) throw new Error('Seed is required for daily leaderboards');
    
    const { data: scoresData, error } = await supabase
      .from('sudoku_daily_scores')
      .select('*')
      .eq('seed', seed)
      .order('time_ms', { ascending: true })
      .limit(limit);

    if (error) throw error;
    
    // Fetch profiles separately to avoid FK relationship issues
    const userIds = [...new Set(scoresData.map(s => s.user_id))];
    let profilesMap = {};
    let streaksMap = {};
    if (userIds.length > 0) {
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', userIds);
        
      if (profilesData) {
        profilesMap = profilesData.reduce((acc, p) => {
          acc[p.id] = p;
          return acc;
        }, {});
      }
      
      streaksMap = await getDailyStreaksForUsers(userIds);
    }

    // Format to match old structure
    return scoresData.map(row => ({
      id: row.id,
      userId: row.user_id,
      username: profilesMap[row.user_id]?.username || 'Unknown User',
      avatar: profilesMap[row.user_id]?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${row.user_id}`,
      streak: streaksMap[row.user_id] || 0,
      mode: 'daily',
      seed: row.seed,
      timeMs: row.time_ms,
      mistakes: row.mistakes,
      date: row.created_at
    }));
  } else {
    // Unlimited mode
    const { data: scoresData, error } = await supabase
      .from('sudoku_unlimited_scores')
      .select('*')
      .order('time_ms', { ascending: true })
      .limit(limit);

    if (error) throw error;

    // Fetch profiles separately
    const userIds = [...new Set(scoresData.map(s => s.user_id))];
    let profilesMap = {};
    let streaksMap = {};
    if (userIds.length > 0) {
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', userIds);
        
      if (profilesData) {
        profilesMap = profilesData.reduce((acc, p) => {
          acc[p.id] = p;
          return acc;
        }, {});
      }
      
      streaksMap = await getDailyStreaksForUsers(userIds);
    }

    return scoresData.map(row => ({
      id: row.user_id,
      userId: row.user_id,
      username: profilesMap[row.user_id]?.username || 'Unknown User',
      avatar: profilesMap[row.user_id]?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${row.user_id}`,
      streak: streaksMap[row.user_id] || 0,
      mode: 'unlimited',
      timeMs: row.time_ms,
      mistakes: row.mistakes,
      date: row.updated_at
    }));
  }
};
