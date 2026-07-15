import { useCallback, useRef, useState } from "react";

/**
 * Sound hook — provides placeholder audio actions.
 * All functions are no-ops by default; wire up real Audio() instances here later.
 * Structure is future-ready for real audio files (e.g. /sounds/correct.mp3).
 */
export function useSound() {
  const [muted, setMuted] = useState(false);
  const muteRef = useRef(muted);
  muteRef.current = muted;

  const play = useCallback((src) => {
    if (muteRef.current) return;
    try {
      const audio = new Audio(src);
      audio.volume = 0.4;
      audio.play().catch(() => {}); // suppress autoplay policy errors
    } catch {
      // Silently ignore — placeholder path doesn't exist yet
    }
  }, []);

  const playCorrect = useCallback(() => play("/sounds/correct.mp3"), [play]);
  const playWrong = useCallback(() => play("/sounds/wrong.mp3"), [play]);
  const playWin = useCallback(() => play("/sounds/win.mp3"), [play]);
  const playLose = useCallback(() => play("/sounds/lose.mp3"), [play]);

  const toggleMute = useCallback(() => {
    setMuted((prev) => !prev);
  }, []);

  return { muted, playCorrect, playWrong, playWin, playLose, toggleMute };
}
