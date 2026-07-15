/**
 * getDaysSinceLaunch
 * Returns the number of full calendar days elapsed since the game's launch date.
 * This is used for deterministic daily word selection — every player in the world
 * gets the same index on the same calendar day regardless of timezone.
 *
 * Launch date: January 1, 2026
 */

const LAUNCH_DATE = new Date("2026-01-01T00:00:00.000Z");
const MS_PER_DAY = 1000 * 60 * 60 * 24;

/**
 * @returns {number} Days elapsed since launch (0-based, e.g. 0 = Jan 1 2026)
 */
export function getDaysSinceLaunch() {
  const now = Date.now();
  return Math.floor((now - LAUNCH_DATE.getTime()) / MS_PER_DAY);
}

/**
 * Returns today's date as a locale-independent ISO string: "YYYY-MM-DD"
 * Always uses UTC to avoid timezone-related date mismatches.
 */
export function getTodayDateStr() {
  return new Date().toISOString().slice(0, 10); // "2026-07-15"
}
