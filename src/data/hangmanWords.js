/**
 * Hangman word bank — 1000+ entries across 12 categories.
 *
 * Words are split into category files in src/data/hangman/
 * for maintainability. All categories are combined and exported here.
 *
 * Categories:
 *   Original 6: Geography, Animals, Food, Technology, Movies, Space
 *   New 6:      Sports, History, Music, Science, Nature, Mythology
 */
import geography from "./hangman/geography";
import animals from "./hangman/animals";
import food from "./hangman/food";
import technology from "./hangman/technology";
import movies from "./hangman/movies";
import space from "./hangman/space";
import sports from "./hangman/sports";
import history from "./hangman/history";
import music from "./hangman/music";
import science from "./hangman/science";
import nature from "./hangman/nature";
import mythology from "./hangman/mythology";

const hangmanWords = [
  ...geography,
  ...animals,
  ...food,
  ...technology,
  ...movies,
  ...space,
  ...sports,
  ...history,
  ...music,
  ...science,
  ...nature,
  ...mythology,
];

export default hangmanWords;
