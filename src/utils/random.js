/**
 * Creates a pseudo-random number generator (PRNG) using the Mulberry32 algorithm.
 * If no seed is provided, it falls back to Math.random().
 * 
 * @param {string|number} [seedString] - The seed value to ensure deterministic generation.
 * @returns {Object} An object containing a `random()` method that returns a number between 0 (inclusive) and 1 (exclusive).
 */
export function createRandom(seedString) {
  if (seedString === undefined || seedString === null) {
    // Return standard Math.random wrapper for unlimited/unseeded mode
    return {
      random: () => Math.random()
    };
  }

  // Convert string seed to integer seed using a simple hash
  let seed = 0;
  if (typeof seedString === 'string') {
    for (let i = 0; i < seedString.length; i++) {
      seed = (seed * 31 + seedString.charCodeAt(i)) | 0;
    }
  } else if (typeof seedString === 'number') {
    seed = seedString | 0;
  }

  // Mulberry32 implementation
  return {
    random: () => {
      let t = seed += 0x6D2B79F5;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
  };
}
