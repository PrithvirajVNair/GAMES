import { useEffect } from "react";

/**
 * Listens for physical A–Z key presses and fires onGuess(letter).
 * Only active when the game is in "playing" state.
 *
 * @param {function} onGuess  - Callback receiving the uppercase letter pressed
 * @param {boolean}  active   - Whether key listening should be active
 */
export function useKeyboard(onGuess, active = true) {
  useEffect(() => {
    if (!active) return;

    const handleKeyDown = (e) => {
      if (e.repeat) return; // Ignore held keys
      const letter = e.key.toUpperCase();
      if (letter.length === 1 && letter >= "A" && letter <= "Z") {
        onGuess(letter);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onGuess, active]);
}
