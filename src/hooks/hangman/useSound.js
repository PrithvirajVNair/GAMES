import { useCallback, useRef, useState } from "react";
import correctSfx from "../../assets/sounds/correct.ogg";
import assistMeSfx from "../../assets/sounds/Assist_Me_ping_SFX.ogg";
import errorSfx from "../../assets/sounds/error.ogg";
import skipSfx from "../../assets/sounds/skip.ogg";

let correctAudio = null;
let wrongAudio = null;
let hintAudio = null;
let skipAudio = null;

if (typeof window !== "undefined") {
  correctAudio = new Audio(correctSfx);
  correctAudio.volume = 0.02;

  wrongAudio = new Audio(errorSfx);
  wrongAudio.volume = 0.02;

  hintAudio = new Audio(assistMeSfx);
  hintAudio.volume = 0.02;

  skipAudio = new Audio(skipSfx);
  skipAudio.volume = 0.02;
}

/**
 * Sound hook — provides audio actions for Hangman game.
 */
export function useSound() {
  const [muted, setMuted] = useState(false);
  const muteRef = useRef(muted);
  muteRef.current = muted;

  const playSound = useCallback((audio) => {
    if (muteRef.current || !audio) return;
    try {
      audio.currentTime = 0;
      audio.play().catch(() => {}); // suppress autoplay policy errors
    } catch {}
  }, []);

  const playCorrect = useCallback(() => playSound(correctAudio), [playSound]);
  const playWrong = useCallback(() => playSound(wrongAudio), [playSound]);
  const playHint = useCallback(() => playSound(hintAudio), [playSound]);
  const playSkip = useCallback(() => playSound(skipAudio), [playSound]);
  const playWin = useCallback(() => {}, []);
  const playLose = useCallback(() => {}, []);

  const toggleMute = useCallback(() => {
    setMuted((prev) => !prev);
  }, []);

  return { muted, playCorrect, playWrong, playWin, playLose, playHint, playSkip, toggleMute };
}
