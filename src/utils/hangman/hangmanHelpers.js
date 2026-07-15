/**
 * Returns a random word entry from the word bank.
 * Optionally filters by category or difficulty.
 * @param {Array} words - Array of word objects
 * @param {object} [filters] - Optional { category, difficulty } filters
 */
export function getRandomWord(words, filters = {}) {
  let pool = [...words];
  if (filters.category) pool = pool.filter((w) => w.category === filters.category);
  if (filters.difficulty) pool = pool.filter((w) => w.difficulty === filters.difficulty);
  if (pool.length === 0) pool = [...words]; // fallback to full list
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Returns true if the player has guessed all unique letters in the word.
 * @param {string} word - The target word (uppercase)
 * @param {Set<string>} guessedLetters - Set of guessed uppercase letters
 */
export function isWon(word, guessedLetters) {
  return [...word].every((letter) => guessedLetters.has(letter));
}

/**
 * Returns true if the player has exceeded the maximum allowed wrong guesses.
 * @param {number} wrongGuesses
 * @param {number} [maxGuesses=6]
 */
export function isLost(wrongGuesses, maxGuesses = 6) {
  return wrongGuesses >= maxGuesses;
}

/**
 * Returns Tailwind colour classes for a given difficulty label.
 * @param {"Easy"|"Medium"|"Hard"} difficulty
 */
export function getDifficultyColor(difficulty) {
  switch (difficulty) {
    case "Easy":
      return {
        text: "text-emerald-400",
        bg: "bg-emerald-400/10",
        border: "border-emerald-400/30",
      };
    case "Medium":
      return {
        text: "text-amber-400",
        bg: "bg-amber-400/10",
        border: "border-amber-400/30",
      };
    case "Hard":
      return {
        text: "text-rose-400",
        bg: "bg-rose-400/10",
        border: "border-rose-400/30",
      };
    default:
      return {
        text: "text-white/60",
        bg: "bg-white/5",
        border: "border-white/10",
      };
  }
}

/**
 * Returns an emoji icon for a given category.
 * @param {string} category
 */
export function getCategoryIcon(category) {
  const icons = {
    Geography: "🌍",
    Animals: "🦁",
    Food: "🍕",
    Technology: "💻",
    Movies: "🎬",
    Space: "🚀",
    Sports: "⚽",
    History: "🏛️",
    Music: "🎵",
    Science: "🔬",
    Nature: "🌿",
    Mythology: "⚡",
  };
  return icons[category] || "❓";
}

/**
 * Returns the progress percentage remaining (for the progress bar).
 * @param {number} wrongGuesses
 * @param {number} [maxGuesses=6]
 */
export function getProgressPercent(wrongGuesses, maxGuesses = 6) {
  return Math.max(0, ((maxGuesses - wrongGuesses) / maxGuesses) * 100);
}

/**
 * Returns Tailwind colour for the progress bar based on remaining attempts.
 * @param {number} wrongGuesses
 */
export function getProgressColor(wrongGuesses) {
  if (wrongGuesses <= 2) return "from-emerald-500 to-emerald-400";
  if (wrongGuesses <= 4) return "from-amber-500 to-amber-400";
  return "from-rose-500 to-rose-400";
}
