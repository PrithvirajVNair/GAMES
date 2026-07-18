import { supabase } from '../lib/supabase';

/**
 * Fetches all user profiles for the admin dashboard.
 * @returns {Promise<Array>} List of user profiles
 */
export const getAllUsers = async () => {
  // Uses admin_get_all_users RPC (security definer) so we can join auth.users
  // and return each user's email, which is not accessible via the profiles table.
  const { data, error } = await supabase.rpc('admin_get_all_users');

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

/**
 * Bans or unbans a user via the admin_ban_user RPC.
 * Only callable by the admin account.
 * @param {string} userId - The ID of the user to ban/unban.
 * @param {boolean} shouldBan - true to ban, false to unban.
 */
export const banUser = async (userId, shouldBan) => {
  const { error } = await supabase.rpc('admin_ban_user', {
    target_user_id: userId,
    should_ban: shouldBan,
  });
  if (error) throw error;
};

/**
 * Permanently deletes a user and all their data via the admin_delete_user RPC.
 * This action is IRREVERSIBLE. Cascades to profiles, scores, quiz_sessions.
 * Only callable by the admin account.
 * @param {string} userId - The ID of the user to delete.
 */
export const deleteUser = async (userId) => {
  const { error } = await supabase.rpc('admin_delete_user', {
    target_user_id: userId,
  });
  if (error) throw error;
};

/**
 * Fetches all pending user reports.
 * Only callable by the admin account.
 * @returns {Promise<Array>} List of pending reports
 */
export const getPendingReports = async () => {
  const { data, error } = await supabase.rpc('admin_get_pending_reports');
  if (error) throw error;
  return data || [];
};

/**
 * Resolves a report, optionally banning the reported user.
 * Only callable by the admin account.
 * @param {string} reportId - The ID of the report.
 * @param {string} action - 'resolved' or 'dismissed'.
 * @param {boolean} shouldBan - true to also ban the reported user.
 */
export const resolveReport = async (reportId, action, shouldBan = false) => {
  const { error } = await supabase.rpc('admin_resolve_report', {
    target_report_id: reportId,
    new_status: action,
    should_ban: shouldBan,
  });
  if (error) throw error;
};
