/**
 * checkNewDay
 * Compares a saved date string ("YYYY-MM-DD") with today's date.
 * Returns true if they differ — meaning a new daily puzzle should start.
 *
 * @param {string | null} savedDateStr - Previously saved date string, or null
 * @returns {boolean}
 */
export function checkNewDay(savedDateStr) {
  if (!savedDateStr) return true;
  const today = new Date().toISOString().slice(0, 10);
  return savedDateStr !== today;
}

/**
 * Formats a "YYYY-MM-DD" string into a human-readable date.
 * Example: "2026-07-15" → "July 15, 2026"
 *
 * @param {string} dateStr
 * @returns {string}
 */
export function formatDateStr(dateStr) {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}
