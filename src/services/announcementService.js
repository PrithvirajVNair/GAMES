import { supabase } from '../lib/supabase';

/**
 * Fetch the latest announcement from the database.
 * @returns {Promise<Object|null>} The latest announcement or null.
 */
export const getLatestAnnouncement = async () => {
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching latest announcement:', error.message);
    return null;
  }
  return data;
};

/**
 * Fetch all announcements (ordered by newest first).
 * @returns {Promise<Array>} List of all announcements.
 */
export const getAnnouncements = async () => {
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching announcements:', error.message);
    return [];
  }
  return data;
};

/**
 * Create a new announcement.
 * @param {Object} announcement
 * @param {string} announcement.title - Title of announcement
 * @param {string} announcement.message - Message content
 * @param {string} announcement.type - 'news' | 'game'
 * @returns {Promise<Object>} The created announcement record.
 */
export const createAnnouncement = async ({ title, message, type }) => {
  const { data, error } = await supabase
    .from('announcements')
    .insert({ title, message, type })
    .select()
    .single();

  if (error) {
    throw error;
  }
  return data;
};

/**
 * Delete an announcement.
 * @param {string} id - The UUID of the announcement to delete.
 * @returns {Promise<boolean>} True on success.
 */
export const deleteAnnouncement = async (id) => {
  const { error } = await supabase
    .from('announcements')
    .delete()
    .eq('id', id);

  if (error) {
    throw error;
  }
  return true;
};
