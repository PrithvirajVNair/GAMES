/**
 * getDailyWord
 * Returns today's deterministic word entry from the word bank.
 *
 * Algorithm:
 *   1. Compute daysSinceLaunch
 *   2. index = daysSinceLaunch % words.length
 *   3. Return words[index]
 *
 * This guarantees every player sees the same word each day,
 * requires no backend, and words cycle through the full list.
 */
import hangmanWords from "../../data/hangmanWords";
import { getDaysSinceLaunch } from "./getDaysSinceLaunch";

/**
 * @returns {{ word: string, hint: string, difficulty: string, category: string, index: number }}
 */
export function getDailyWord() {
  const days = getDaysSinceLaunch();
  const index = days % hangmanWords.length;
  return { ...hangmanWords[index], index };
}
