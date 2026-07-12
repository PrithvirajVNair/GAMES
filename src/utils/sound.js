import assistMeSfx from "../assets/sounds/Assist_Me_ping_SFX.ogg";
import correctSfx from "../assets/sounds/correct.ogg";
import errorSfx from "../assets/sounds/error.ogg";
import skipSfx from "../assets/sounds/skip.ogg";

let pingAudio = null;
let dupAudio = null;
let errorAudio = null;
let skipAudio = null;

if (typeof window !== "undefined") {
  pingAudio = new Audio(assistMeSfx);
  // 👇 CHANGE VOLUME FOR HINT SOUND HERE (0.0 to 1.0)
  pingAudio.volume = 0.02; 

  dupAudio = new Audio(correctSfx);
  // 👇 CHANGE VOLUME FOR CORRECT (NEXT) SOUND HERE (0.0 to 1.0)
  dupAudio.volume = 0.02;

  errorAudio = new Audio(errorSfx);
  // 👇 CHANGE VOLUME FOR ERROR SOUND HERE (0.0 to 1.0)
  errorAudio.volume = 0.02;

  skipAudio = new Audio(skipSfx);
  // 👇 CHANGE VOLUME FOR SKIP SOUND HERE (0.0 to 1.0)
  skipAudio.volume = 0.02;
}

export const playDup = (isMuted) => {
  if (isMuted || !dupAudio) return;
  try {
    dupAudio.currentTime = 0;
    dupAudio.play().catch(() => {});
  } catch {}
};

export const playLolPing = (isMuted) => {
  if (isMuted || !pingAudio) return;
  try {
    pingAudio.currentTime = 0;
    pingAudio.play().catch(() => {});
  } catch {}
};

export const playAssistMe = (isMuted) => {
  if (isMuted || !skipAudio) return;
  try {
    skipAudio.currentTime = 0;
    skipAudio.play().catch(() => {});
  } catch {}
};

export const playError = (isMuted) => {
  if (isMuted || !errorAudio) return;
  try {
    errorAudio.currentTime = 0;
    errorAudio.play().catch(() => {});
  } catch {}
};
