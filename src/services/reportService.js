import { supabase } from '../lib/supabase';

/**
 * Submits a report for a user from the leaderboard.
 * @param {string} reportedUserId - The ID of the user being reported.
 * @param {string} reason - The reason for the report.
 */
export const submitReport = async (reportedUserId, reason) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("You must be logged in to report a user.");
  }

  // 1. Check if a pending report already exists from this user to the target user
  const { data: existingReport, error: checkError } = await supabase
    .from('user_reports')
    .select('id')
    .eq('reporter_id', user.id)
    .eq('reported_user_id', reportedUserId)
    .eq('status', 'pending')
    .maybeSingle();

  if (checkError) throw checkError;

  if (existingReport) {
    throw new Error("You have already reported this user. Your report is pending review.");
  }

  // 2. If no pending report exists, create a new one
  const { error } = await supabase
    .from('user_reports')
    .insert([
      {
        reporter_id: user.id,
        reported_user_id: reportedUserId,
        reason: reason,
        status: 'pending'
      }
    ]);

  if (error) {
    if (error.code === '23505') {
      throw new Error("You have already reported this user. Your report is pending review.");
    }
    throw error;
  }
};
