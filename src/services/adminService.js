import { supabase } from '../lib/supabase';

/**
 * Fetches all user profiles for the admin dashboard.
 * @returns {Promise<Array>} List of user profiles
 */
export const getAllUsers = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, avatar_url, badge, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }
  return data || [];
};

/**
 * Updates the badge of a specific user.
 * @param {string} userId - The ID of the user to update.
 * @param {string|null} badge - The badge ENUM value ('developer', 'verified', 'moderator', or null).
 * @returns {Promise<Object>} The updated user profile.
 */
export const updateUserBadge = async (userId, badge) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ badge: badge })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw error;
  }
  return data;
};
