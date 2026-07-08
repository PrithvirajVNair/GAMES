import React, { useEffect, useState, useCallback, useRef } from "react";
import countries from "../utils/countries";
import Sidebar from "../components/Sidebar";
import assistMeSfx from "../assets/sounds/Assist_Me_ping_SFX.ogg";
import { Flag } from "lucide-react";

const TOTAL = countries.data.length;

const shuffleArray = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const FlagQuiz = () => {
  const getInitialQuiz = () => {
    const saved = localStorage.getItem("flagQuiz");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        /* fall through */
      }
    }
    const shuffled = shuffleArray(countries.data);
    return {
      score: 0,
      remainingCountries: shuffled,
      currentCountry: shuffled[0],
      answer: "",
    };
  };

  const [quiz, setQuiz] = useState(getInitialQuiz);

  // Drift + subtle mouse influence
  const orb1Ref = useRef(null);
  const orb2Ref = useRef(null);
  const rafRef = useRef(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  // Smoothed current positions (lerped toward target each frame)
  const orb1Cur = useRef({ x: 20, y: 18 });
  const orb2Cur = useRef({ x: 55, y: 58 });

  useEffect(() => {
    const onMove = (e) => {
      mouseRef.current = {
        x: e.clientX / window.innerWidth, // 0..1
        y: e.clientY / window.innerHeight,
      };
    };
    window.addEventListener("mousemove", onMove);

    // Anchor positions (%) each orb floats around
    const orb1Anchor = { x: 20, y: 18 };
    const orb2Anchor = { x: 55, y: 58 };

    const driftAmt = 3; // ±3% autonomous sine drift
    const mouseAmt = 4; // ±4% max mouse nudge
    const speed1 = 0.00018;
    const speed2 = 0.00013;
    const lerpSpeed = 0.025; // how quickly orbs ease to target (slow & dreamy)

    const lerp = (a, b, t) => a + (b - a) * t;

    let startTime = null;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const t = timestamp - startTime;
      const mx = mouseRef.current.x; // 0..1
      const my = mouseRef.current.y;

      // Orb 1 — mouse nudges in same direction as cursor
      const t1x =
        orb1Anchor.x +
        Math.sin(t * speed1) * driftAmt +
        (mx - 0.5) * mouseAmt * 2;
      const t1y =
        orb1Anchor.y +
        Math.cos(t * speed1 * 0.7) * driftAmt +
        (my - 0.5) * mouseAmt * 2;
      orb1Cur.current.x = lerp(orb1Cur.current.x, t1x, lerpSpeed);
      orb1Cur.current.y = lerp(orb1Cur.current.y, t1y, lerpSpeed);

      // Orb 2 — mouse nudges in opposite direction (counter-movement)
      const t2x =
        orb2Anchor.x +
        Math.sin(t * speed2 + 2) * driftAmt -
        (mx - 0.5) * mouseAmt * 2;
      const t2y =
        orb2Anchor.y +
        Math.cos(t * speed2 * 0.8 + 1) * driftAmt -
        (my - 0.5) * mouseAmt * 2;
      orb2Cur.current.x = lerp(orb2Cur.current.x, t2x, lerpSpeed);
      orb2Cur.current.y = lerp(orb2Cur.current.y, t2y, lerpSpeed);

      if (orb1Ref.current) {
        orb1Ref.current.style.left = `${orb1Cur.current.x}%`;
        orb1Ref.current.style.top = `${orb1Cur.current.y}%`;
      }
      if (orb2Ref.current) {
        orb2Ref.current.style.left = `${orb2Cur.current.x}%`;
        orb2Ref.current.style.top = `${orb2Cur.current.y}%`;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);
  const inputRef = useRef(null);

  // Synthesised "dup" sound via Web Audio API
  const playDup = () => {
    if (isMutedRef.current) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      ctx.resume().then(() => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        const t = ctx.currentTime;
        osc.frequency.setValueAtTime(880, t);
        osc.frequency.exponentialRampToValueAtTime(440, t + 0.08);
        gain.gain.setValueAtTime(0.003, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
        osc.start(t);
        osc.stop(t + 0.18);
        osc.onended = () => ctx.close();
      });
    } catch {
      /* AudioContext not available */
    }
  };

  // Hint sound — real audio file
  const playLolPing = () => {
    if (isMutedRef.current) return;
    try {
      const audio = new Audio(assistMeSfx);
      audio.volume = 0.003;
      audio.play();
    } catch {
      /* Audio not available */
    }
  };

  // Skip sound — satisfying "whoosh swipe" (filtered noise + pitch glide)
  const playAssistMe = () => {
    if (isMutedRef.current) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      ctx.resume().then(() => {
        const t = ctx.currentTime;

        // ── Layer 1: White noise burst through a sweeping bandpass filter ──
        const bufferSize = ctx.sampleRate * 0.22;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(3200, t); // start high
        filter.frequency.exponentialRampToValueAtTime(400, t + 0.2); // sweep down
        filter.Q.value = 1.8;

        const noiseGain = ctx.createGain();
        //   volume
        noiseGain.gain.setValueAtTime(0.003, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        noise.start(t);
        noise.stop(t + 0.22);

        // ── Layer 2: Descending sine glide (tonal "swoosh" feel) ──
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.connect(oscGain);
        oscGain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(600, t);
        osc.frequency.exponentialRampToValueAtTime(80, t + 0.18); // fast pitch drop
        //   volume
        oscGain.gain.setValueAtTime(0.003, t);
        oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
        osc.start(t);
        osc.stop(t + 0.18);

        setTimeout(() => ctx.close(), 400);
      });
    } catch {
      /* AudioContext not available */
    }
  };

  // Error sound — a detuned low sawtooth buzz
  const playError = () => {
    if (isMutedRef.current) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      ctx.resume().then(() => {
        const t = ctx.currentTime;
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.type = "sawtooth";
        osc2.type = "sawtooth";

        osc1.frequency.setValueAtTime(110, t);
        osc2.frequency.setValueAtTime(113, t);

        gain.gain.setValueAtTime(0.003, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);

        osc1.start(t);
        osc2.start(t);
        osc1.stop(t + 0.22);
        osc2.stop(t + 0.22);
        osc1.onended = () => ctx.close();
      });
    } catch {
      /* AudioContext not available */
    }
  };

  const [isMuted, setIsMuted] = useState(() => {
    return localStorage.getItem("flagQuizMuted") === "true";
  });
  const isMutedRef = useRef(isMuted);
  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  const toggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      localStorage.setItem("flagQuizMuted", String(next));
      return next;
    });
  };

  const [shake, setShake] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [hint, setHint] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [gaveUp, setGaveUp] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [started, setStarted] = useState(false);

  // ── Total elapsed timer ──
  const [elapsed, setElapsed] = useState(() => {
    const start = localStorage.getItem("quizStartTime");
    if (!start) return 0;
    return Math.floor((Date.now() - Number(start)) / 1000);
  });

  const hasSavedProgress = React.useMemo(() => {
    const saved = localStorage.getItem("flagQuiz");
    if (!saved) return false;
    try {
      const parsed = JSON.parse(saved);
      return (
        parsed.remainingCountries && parsed.remainingCountries.length < TOTAL
      );
    } catch {
      return false;
    }
  }, []);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleNext = useCallback(() => {
    const trimmed = quiz.answer.trim().toLowerCase();
    const expected = quiz.currentCountry.country.toLowerCase();

    if (trimmed !== expected) {
      playError();
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
      triggerShake();
      return;
    }

    playDup();
    setCorrect(true);
    setTimeout(() => {
      setCorrect(false);
      setHint(false);
      setImgLoaded(false);

      const updatedCountries = quiz.remainingCountries.filter(
        (c) => c.country !== quiz.currentCountry.country,
      );

      if (updatedCountries.length === 0) {
        setCompleted(true);
        localStorage.removeItem("flagQuiz");
        return;
      }

      setQuiz({
        score: quiz.score + 1,
        remainingCountries: updatedCountries,
        currentCountry: updatedCountries[0],
        answer: "",
      });
    }, 600);
  }, [quiz]);

  const handleSkip = () => {
    playAssistMe();
    setHint(false);
    setImgLoaded(false);
    if (quiz.remainingCountries.length > 1) {
      const [current, ...rest] = quiz.remainingCountries;
      const updatedCountries = [...rest, current];
      setQuiz({
        ...quiz,
        remainingCountries: updatedCountries,
        currentCountry: updatedCountries[0],
        answer: "",
      });
    } else {
      setQuiz({
        ...quiz,
        answer: "",
      });
    }
    inputRef.current?.focus();
  };

  const handleReset = useCallback(() => {
    localStorage.removeItem("flagQuiz");
    localStorage.setItem("quizStartTime", Date.now().toString());
    const shuffled = shuffleArray(countries.data);
    const initial = {
      score: 0,
      remainingCountries: shuffled,
      currentCountry: shuffled[0],
      answer: "",
    };
    setQuiz(initial);
    setCompleted(false);
    setGaveUp(false);
    setHint(false);
    setImgLoaded(false);
    setElapsed(0);
    setStarted(true);
  }, []);

  const handleResume = useCallback(() => {
    if (!localStorage.getItem("quizStartTime")) {
      localStorage.setItem("quizStartTime", Date.now().toString());
    }
    // calculate correct elapsed based on existing start time
    const start = localStorage.getItem("quizStartTime");
    if (start) {
      setElapsed(Math.floor((Date.now() - Number(start)) / 1000));
    }
    setStarted(true);
  }, []);

  const handleStartNew = useCallback(() => {
    localStorage.removeItem("flagQuiz");
    localStorage.setItem("quizStartTime", Date.now().toString());
    const shuffled = shuffleArray(countries.data);
    const initial = {
      score: 0,
      remainingCountries: shuffled,
      currentCountry: shuffled[0],
      answer: "",
    };
    setQuiz(initial);
    setCompleted(false);
    setGaveUp(false);
    setHint(false);
    setImgLoaded(false);
    setElapsed(0);
    setStarted(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("flagQuiz", JSON.stringify(quiz));
  }, [quiz]);



  useEffect(() => {
    if (!started || completed || gaveUp) return; // freeze when not started or done
    const id = setInterval(() => {
      const start = Number(localStorage.getItem("quizStartTime") || Date.now());
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [started, completed, gaveUp]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60)
      .toString()
      .padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  // Re-focus input after the correct-answer flash ends (input re-enables after render)
  useEffect(() => {
    if (!correct) {
      inputRef.current?.focus();
    }
  }, [correct]);

  const progress = ((TOTAL - quiz.remainingCountries.length) / TOTAL) * 100;
  const firstLetter = quiz.currentCountry.country[0];
  const hintText = `${firstLetter}${"_ ".repeat(quiz.currentCountry.country.length - 1).trim()} (${quiz.currentCountry.country.length} letters)`;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'Inter', sans-serif;
          background: #0a0f1e;
          min-height: 100vh;
        }

        .fq-root {
          min-height: 100vh;
          background: linear-gradient(135deg, #0a0f1e 0%, #0f1929 50%, #0d1520 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          position: relative;
          overflow: hidden;
        }

        /* Mouse-tracking orbs (rendered as real divs) */
        .fq-orb {
          position: fixed;
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
          will-change: left, top;
          transition: opacity 0.4s;
        }
        .fq-orb-1 {
          width: 60vw;
          height: 60vw;
          background: radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%);
          filter: blur(4px);
        }
        .fq-orb-2 {
          width: 50vw;
          height: 50vw;
          background: radial-gradient(circle, rgba(236,72,153,0.06) 0%, transparent 70%);
          filter: blur(4px);
        }

        .fq-card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 480px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 24px;
          padding: 2rem 1.75rem;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          box-shadow:
            0 25px 60px rgba(0,0,0,0.5),
            0 0 0 1px rgba(255,255,255,0.05) inset;
        }

        /* Header */
        .fq-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
        }

        .fq-title {
          font-size: clamp(1.1rem, 3vw, 1.4rem);
          font-weight: 800;
          background: linear-gradient(90deg, #a78bfa, #60a5fa, #f472b6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.5px;
        }

        .fq-score-badge {
          background: rgba(99,102,241,0.2);
          border: 1px solid rgba(99,102,241,0.35);
          border-radius: 999px;
          padding: 0.3rem 0.9rem;
          font-size: 0.85rem;
          font-weight: 700;
          color: #a78bfa;
          letter-spacing: 0.5px;
        }

        /* Progress */
        .fq-progress-wrap {
          margin-bottom: 1.5rem;
        }
        .fq-progress-label {
          display: flex;
          justify-content: space-between;
          font-size: 0.72rem;
          color: rgba(255,255,255,0.4);
          margin-bottom: 0.4rem;
          font-weight: 500;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        .fq-progress-bar {
          width: 100%;
          height: 6px;
          background: rgba(255,255,255,0.07);
          border-radius: 999px;
          overflow: hidden;
        }
        .fq-progress-fill {
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(90deg, #6366f1, #a78bfa, #ec4899);
          transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Flag area */
        .fq-flag-wrapper {
          position: relative;
          width: 100%;
          aspect-ratio: 3 / 2;
          border-radius: 16px;
          overflow: hidden;
          margin-bottom: 1.5rem;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .fq-flag-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 1rem;
          transition: opacity 0.4s ease;
        }
        .fq-flag-img.hidden { opacity: 0; }
        .fq-flag-img.visible { opacity: 1; }
        .fq-flag-skeleton {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg,
            rgba(255,255,255,0.04) 25%,
            rgba(255,255,255,0.08) 50%,
            rgba(255,255,255,0.04) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 16px;
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .fq-correct-overlay {
          position: absolute;
          inset: 0;
          background: rgba(34, 197, 94, 0.2);
          border: 2px solid rgba(34, 197, 94, 0.5);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadeInScale 0.3s ease;
        }
        .fq-check-icon {
          font-size: 3rem;
          filter: drop-shadow(0 0 16px rgba(34,197,94,0.8));
        }
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.8); }
          to   { opacity: 1; transform: scale(1); }
        }

        /* Input */
        .fq-input-wrap {
          position: relative;
          margin-bottom: 1rem;
        }
        .fq-input {
          width: 100%;
          background: rgba(255,255,255,0.06);
          border: 1.5px solid rgba(255,255,255,0.12);
          border-radius: 12px;
          padding: 0.8rem 1.1rem;
          font-size: 1rem;
          font-family: 'Inter', sans-serif;
          color: #fff;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
          letter-spacing: 0.2px;
        }
        .fq-input::placeholder { color: rgba(255,255,255,0.3); }
        .fq-input:focus {
          border-color: rgba(99,102,241,0.6);
          background: rgba(99,102,241,0.08);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.15);
        }
        .fq-input.shake {
          animation: shake 0.45s cubic-bezier(0.36,0.07,0.19,0.97) both;
          border-color: rgba(239,68,68,0.7) !important;
          box-shadow: 0 0 0 3px rgba(239,68,68,0.15) !important;
        }
        @keyframes shake {
          10%, 90% { transform: translateX(-2px); }
          20%, 80% { transform: translateX(4px); }
          30%, 50%, 70% { transform: translateX(-6px); }
          40%, 60% { transform: translateX(6px); }
        }

        /* Hint */
        .fq-hint {
          font-size: 0.78rem;
          color: rgba(167,139,250,0.8);
          letter-spacing: 0.3px;
          min-height: 1.2rem;
          margin-bottom: 1.25rem;
          text-align: center;
          font-weight: 500;
        }

        /* Buttons */
        .fq-actions {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 0.6rem;
        }
        .fq-btn {
          padding: 0.72rem 0.5rem;
          border-radius: 12px;
          font-size: 0.88rem;
          font-weight: 700;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          border: none;
          transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s;
          letter-spacing: 0.3px;
        }
        .fq-btn:active { transform: scale(0.95); }
        .fq-btn:disabled { opacity: 0.45; cursor: not-allowed; }

        .fq-btn-skip {
          background: rgba(239,68,68,0.15);
          border: 1.5px solid rgba(239,68,68,0.3);
          color: #f87171;
        }
        .fq-btn-skip:hover:not(:disabled) {
          background: rgba(239,68,68,0.25);
          box-shadow: 0 4px 20px rgba(239,68,68,0.2);
        }

        .fq-btn-hint {
          background: rgba(245,158,11,0.12);
          border: 1.5px solid rgba(245,158,11,0.3);
          color: #fbbf24;
        }
        .fq-btn-hint:hover:not(:disabled) {
          background: rgba(245,158,11,0.22);
          box-shadow: 0 4px 20px rgba(245,158,11,0.2);
        }

        .fq-btn-next {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #fff;
          box-shadow: 0 4px 18px rgba(99,102,241,0.35);
        }
        .fq-btn-next:hover:not(:disabled) {
          box-shadow: 0 6px 24px rgba(99,102,241,0.5);
          transform: translateY(-1px);
        }

        .fq-secondary-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.6rem;
          margin-top: 1.25rem;
          border-top: 1px solid rgba(255,255,255,0.06);
          padding-top: 1rem;
        }
        .fq-btn-secondary {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.55);
          padding: 0.6rem;
          font-size: 0.82rem;
          font-weight: 700;
          font-family: 'Inter', sans-serif;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.15s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
        }
        .fq-btn-secondary:hover {
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.18);
          color: #fff;
        }
        .fq-btn-secondary:active {
          transform: scale(0.97);
        }

        /* Completion screen */
        .fq-complete {
          text-align: center;
        }
        .fq-complete-trophy {
          font-size: clamp(4rem, 15vw, 5.5rem);
          margin-bottom: 1rem;
          filter: drop-shadow(0 0 30px rgba(251,191,36,0.6));
          animation: float 3s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-10px); }
        }
        .fq-complete-title {
          font-size: clamp(1.5rem, 5vw, 2rem);
          font-weight: 800;
          color: #fff;
          margin-bottom: 0.5rem;
        }
        .fq-complete-sub {
          color: rgba(255,255,255,0.5);
          font-size: 0.95rem;
          margin-bottom: 2rem;
        }
        .fq-complete-score {
          font-size: clamp(2.5rem, 10vw, 4rem);
          font-weight: 800;
          background: linear-gradient(90deg, #fbbf24, #f97316);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.25rem;
        }
        .fq-complete-score-label {
          color: rgba(255,255,255,0.4);
          font-size: 0.85rem;
          margin-bottom: 2rem;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        .fq-btn-reset {
          width: 100%;
          padding: 0.9rem;
          border-radius: 14px;
          background: linear-gradient(135deg, #6366f1, #a78bfa);
          color: #fff;
          font-size: 1rem;
          font-weight: 700;
          font-family: 'Inter', sans-serif;
          border: none;
          cursor: pointer;
          letter-spacing: 0.5px;
          box-shadow: 0 6px 24px rgba(99,102,241,0.4);
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .fq-btn-reset:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(99,102,241,0.5); }
        .fq-btn-reset:active { transform: scale(0.97); }

        .fq-timer-badge {
          background: rgba(255,255,255,0.07);
          border: 1.5px solid rgba(255,255,255,0.12);
          border-radius: 999px;
          padding: 0.3rem 0.9rem;
          font-size: 0.82rem;
          font-weight: 700;
          color: rgba(255,255,255,0.55);
          font-variant-numeric: tabular-nums;
          letter-spacing: 1px;
        }
        .fq-mute-btn {
          background: rgba(255,255,255,0.07);
          border: 1.5px solid rgba(255,255,255,0.12);
          border-radius: 999px;
          width: 34px;
          height: 34px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 0.9rem;
          color: rgba(255,255,255,0.55);
          transition: all 0.15s ease;
          outline: none;
        }
        .fq-mute-btn:hover {
          background: rgba(255,255,255,0.15);
          border-color: rgba(255,255,255,0.25);
          color: #fff;
          transform: scale(1.05);
        }
        .fq-mute-btn:active {
          transform: scale(0.95);
        }
        .fq-header-right {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }
        @media (max-width: 480px) {
          .fq-card { padding: 1.25rem 1rem; border-radius: 20px; }
          .fq-actions { gap: 0.4rem; }
          .fq-btn { font-size: 0.76rem; padding: 0.6rem 0.2rem; }
          .fq-header {
            flex-direction: column;
            align-items: center;
            gap: 0.5rem;
          }
          .fq-header-right {
            width: 100%;
            justify-content: center;
            gap: 0.4rem;
          }
          .fq-mute-btn {
            width: 32px;
            height: 32px;
            font-size: 0.8rem;
          }
          .fq-timer-badge, .fq-score-badge {
            padding: 0.25rem 0.7rem;
            font-size: 0.75rem;
          }
          .fq-title {
            font-size: 1.3rem;
          }
        }
        @media (max-width: 320px) {
          .fq-card { padding: 1rem 0.75rem; }
          .fq-btn { font-size: 0.7rem; padding: 0.5rem 0.15rem; }
        }
        @media (min-width: 768px) {
          .fq-card { max-width: 520px; padding: 2.5rem 2.25rem; }
        }
        /* Sidebar Toggle Button */
        .fq-sidebar-toggle {
          position: fixed;
          top: 1.25rem;
          left: 1.25rem;
          z-index: 101;
          background: rgba(255, 255, 255, 0.05);
          border: 1.5px solid rgba(255, 255, 255, 0.12);
          border-radius: 999px;
          padding: 0.5rem 1.1rem;
          font-size: 0.82rem;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          gap: 0.4rem;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }
        .fq-sidebar-toggle:hover {
          background: rgba(255, 255, 255, 0.12);
          border-color: rgba(255, 255, 255, 0.25);
          color: #fff;
          transform: translateY(-1px);
        }
        .fq-sidebar-toggle.active {
          opacity: 0;
          pointer-events: none;
          transform: scale(0.8);
        }
        
        /* Start Screen Styling */
        .fq-start-screen {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.25rem;
        }
        .fq-start-globe {
          font-size: clamp(3.5rem, 12vw, 4.5rem);
          margin-bottom: 0.5rem;
          filter: drop-shadow(0 0 25px rgba(99, 102, 241, 0.45));
          animation: float 3s ease-in-out infinite;
        }
        .fq-start-title {
          font-size: clamp(1.6rem, 5vw, 2.2rem);
          font-weight: 800;
          background: linear-gradient(90deg, #a78bfa, #60a5fa, #f472b6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.5px;
          margin-bottom: 0.25rem;
        }
        .fq-start-desc {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.5);
          line-height: 1.6;
          max-width: 380px;
          margin-bottom: 0.5rem;
        }
        .fq-start-features {
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
          width: 100%;
          text-align: left;
          margin-bottom: 1.25rem;
        }
        .fq-start-feature {
          display: flex;
          gap: 0.8rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          padding: 0.8rem 1rem;
          border-radius: 14px;
          align-items: center;
        }
        .fq-start-feature span {
          font-size: 1.3rem;
        }
        .fq-start-feature-details {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }
        .fq-start-feature-title {
          font-size: 0.85rem;
          font-weight: 700;
          color: #fff;
        }
        .fq-start-feature-desc {
          font-size: 0.74rem;
          color: rgba(255, 255, 255, 0.45);
          line-height: 1.4;
        }
        .fq-start-actions {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          width: 100%;
        }
        .fq-start-btn {
          width: 100%;
          padding: 0.85rem;
          border-radius: 12px;
          font-size: 0.9rem;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          letter-spacing: 0.3px;
        }
        .fq-btn-start, .fq-btn-resume {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #fff;
          box-shadow: 0 4px 18px rgba(99, 102, 241, 0.35);
        }
        .fq-btn-start:hover, .fq-btn-resume:hover {
          box-shadow: 0 6px 24px rgba(99, 102, 241, 0.5);
          transform: translateY(-1px);
        }
        .fq-btn-start:active, .fq-btn-resume:active {
          transform: scale(0.98);
        }
        .fq-btn-new-game {
          background: rgba(255, 255, 255, 0.04);
          border: 1.5px solid rgba(255, 255, 255, 0.08);
          color: rgba(255, 255, 255, 0.6);
        }
        .fq-btn-new-game:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.15);
          color: #fff;
        }
        .fq-btn-new-game:active {
          transform: scale(0.98);
        }

        @media (max-width: 480px) {
          .fq-sidebar-toggle {
            top: 1rem;
            left: 1rem;
            padding: 0.4rem 0.9rem;
            font-size: 0.76rem;
          }
        }
      `}</style>

      <div className="fq-root">
        {/* Toggle Button */}
        <button
          className={`fq-sidebar-toggle ${sidebarOpen ? "active" : ""}`}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          title="Toggle Menu"
        >
          {sidebarOpen ? "✕ Close" : "🎮 Games"}
        </button>

        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        {/* Mouse-following background orbs */}
        <div
          ref={orb1Ref}
          className="fq-orb fq-orb-1"
          style={{ left: "20%", top: "20%" }}
        />
        <div
          ref={orb2Ref}
          className="fq-orb fq-orb-2"
          style={{ left: "55%", top: "60%" }}
        />
        <div className="fq-card">
          {!started ? (
            /* ── Start Screen ── */
            <div className="fq-start-screen">
              <div className="fq-start-globe">🌍</div>
              <h1 className="fq-start-title">Flag Quiz</h1>
              <p className="fq-start-desc">
                Identify all 196 flags of the world. Test your recognition
                speed, memory, and geography skills!
              </p>

              <div className="fq-start-features">
                <div className="fq-start-feature">
                  <span>⏱️</span>
                  <div className="fq-start-feature-details">
                    <strong className="fq-start-feature-title">
                      Race the Clock
                    </strong>
                    <span className="fq-start-feature-desc !text-xs md:!text-sm">
                      Track your elapsed time and push for your personal best.
                    </span>
                  </div>
                </div>
                <div className="fq-start-feature">
                  <span>💡</span>
                  <div className="fq-start-feature-details">
                    <strong className="fq-start-feature-title">
                      Need Help?
                    </strong>
                    <span className="fq-start-feature-desc !text-xs md:!text-sm">
                      Use hints to reveal country length and first letters.
                    </span>
                  </div>
                </div>
              </div>

              <div className="fq-start-actions">
                {hasSavedProgress ? (
                  <>
                    <button
                      className="fq-start-btn fq-btn-resume"
                      onClick={handleResume}
                    >
                      ▶ Resume Game ({TOTAL - quiz.score} left)
                    </button>
                    <button
                      className="fq-start-btn fq-btn-new-game"
                      onClick={handleStartNew}
                    >
                      🔄 Start Fresh
                    </button>
                  </>
                ) : (
                  <button
                    className="fq-start-btn fq-btn-start"
                    onClick={handleStartNew}
                  >
                    Start Quiz ➔
                  </button>
                )}
              </div>
            </div>
          ) : completed || gaveUp ? (
            /* ── End/Complete Screen ── */
            <div className="fq-complete">
              <div className="fq-complete-trophy">
                {completed ? "🏆" : "🏳️"}
              </div>
              <div className="fq-complete-title">
                {completed ? "Quiz Complete!" : "Quiz Given Up"}
              </div>
              <div className="fq-complete-sub">
                {completed
                  ? "You identified every flag in the world"
                  : `You gave up after identifying ${quiz.score} flags`}
              </div>
              <div className="fq-complete-score">
                {completed ? TOTAL : quiz.score}
              </div>
              <div className="fq-complete-score-label">Flags Identified</div>
              <div
                style={{
                  color: "rgba(255,255,255,0.4)",
                  fontSize: "0.9rem",
                  marginBottom: "1.5rem",
                  letterSpacing: "1px",
                }}
              >
                ⏱ {formatTime(elapsed)}
              </div>
              <button className="fq-btn-reset" onClick={handleReset}>
                🔄 {completed ? "Play Again" : "Try Again"}
              </button>
            </div>
          ) : (
            /* ── Quiz Screen ── */
            <>
              {/* Header */}
              <div className="fq-header">
                <div className="fq-title flex items-center gap-3 text-white">
                  <Flag size={20} /> Flag Quiz
                </div>
                <div className="fq-header-right">
                  <button
                    className="fq-mute-btn"
                    onClick={toggleMute}
                    title={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted ? "🔇" : "🔊"}
                  </button>
                  <div className="fq-timer-badge">⏱ {formatTime(elapsed)}</div>
                  <div className="fq-score-badge">
                    {quiz.score} / {TOTAL}
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="fq-progress-wrap">
                <div className="fq-progress-label">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="fq-progress-bar">
                  <div
                    className="fq-progress-fill"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Flag */}
              <div className="fq-flag-wrapper">
                {!imgLoaded && <div className="fq-flag-skeleton" />}
                <img
                  key={quiz.currentCountry.flag}
                  src={quiz.currentCountry.flag}
                  alt="Guess this flag"
                  className={`fq-flag-img ${imgLoaded ? "visible" : "hidden"}`}
                  onLoad={() => setImgLoaded(true)}
                />
                {correct && (
                  <div className="fq-correct-overlay">
                    <span className="fq-check-icon">✅</span>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="fq-input-wrap">
                <input
                  ref={inputRef}
                  className={`fq-input${shake ? " shake" : ""}`}
                  type="text"
                  placeholder="Type the country name…"
                  value={quiz.answer}
                  autoFocus
                  onChange={(e) => setQuiz({ ...quiz, answer: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleNext();
                  }}
                  disabled={correct}
                />
              </div>

              {/* Hint */}
              <div className="fq-hint">
                {hint ? (
                  `💡 Hint: ${hintText}`
                ) : (
                  <span style={{ color: "transparent" }}>‎</span>
                )}
              </div>

              {/* Buttons */}
              <div className="fq-actions">
                <button
                  className="fq-btn fq-btn-skip"
                  onClick={handleSkip}
                  disabled={correct}
                >
                  ⏭ Skip
                </button>
                <button
                  className="fq-btn fq-btn-hint"
                  onClick={() => {
                    playLolPing();
                    setHint(true);
                  }}
                  disabled={correct || hint}
                >
                  💡 Hint
                </button>
                <button
                  className="fq-btn fq-btn-next"
                  onClick={handleNext}
                  disabled={correct}
                >
                  Next ➜
                </button>
              </div>

              {/* Secondary Actions */}
              <div className="fq-secondary-actions">
                <button
                  className="fq-btn-secondary fq-btn-restart"
                  onClick={handleReset}
                  disabled={correct}
                >
                  🔄 Restart
                </button>
                <button
                  className="fq-btn-secondary fq-btn-giveup"
                  onClick={() => setGaveUp(true)}
                  disabled={correct}
                >
                  🏳️ Give Up
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default FlagQuiz;
