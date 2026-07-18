import React, { useCallback, useEffect, useRef, useState } from "react";
import logos from "../utils/logos";
import { Building2 } from "lucide-react";
import SidebarNav from "../components/Sidebar";
import { toast } from "react-toastify";
import InputBehaviorAnalyzer from "../utils/InputBehaviorAnalyzer";
import {
  playDup as _playDup,
  playLolPing as _playLolPing,
  playAssistMe as _playAssistMe,
  playError as _playError,
} from "../utils/sound";

const TOTAL = logos.data.length;
const shuffle = (a) => {
  const arr = [...a];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const LogoQuiz = () => {
  const getInitial = () => {
    const saved = localStorage.getItem("logoQuiz");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    const s = shuffle(logos.data);
    return { score: 0, remainingLogos: s, currentLogo: s[0], answer: "" };
  };
  const [quiz, setQuiz] = useState(getInitial);

  useEffect(() => {
    document.title = "Logo Quiz - Guess the Brand | FQz Games";
    const descMeta = document.querySelector('meta[name="description"]');
    if (descMeta) {
      descMeta.setAttribute(
        "content",
        "How well do you know famous global brands? Test your logo recognition skills with the interactive FQz Logo Quiz!",
      );
    }
  }, []);

  const orb1Ref = useRef(null),
    orb2Ref = useRef(null),
    rafRef = useRef(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 }),
    orb1Cur = useRef({ x: 20, y: 18 }),
    orb2Cur = useRef({ x: 55, y: 58 });

  useEffect(() => {
    const onMove = (e) => {
      mouseRef.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      };
    };
    window.addEventListener("mousemove", onMove);
    const o1A = { x: 20, y: 18 },
      o2A = { x: 55, y: 58 },
      dA = 3,
      mA = 4,
      s1 = 0.00018,
      s2 = 0.00013,
      lS = 0.025;
    const lerp = (a, b, t) => a + (b - a) * t;
    let st = null;
    const animate = (ts) => {
      if (!st) st = ts;
      const t = ts - st,
        mx = mouseRef.current.x,
        my = mouseRef.current.y;
      orb1Cur.current.x = lerp(
        orb1Cur.current.x,
        o1A.x + Math.sin(t * s1) * dA + (mx - 0.5) * mA * 2,
        lS,
      );
      orb1Cur.current.y = lerp(
        orb1Cur.current.y,
        o1A.y + Math.cos(t * s1 * 0.7) * dA + (my - 0.5) * mA * 2,
        lS,
      );
      orb2Cur.current.x = lerp(
        orb2Cur.current.x,
        o2A.x + Math.sin(t * s2 + 2) * dA - (mx - 0.5) * mA * 2,
        lS,
      );
      orb2Cur.current.y = lerp(
        orb2Cur.current.y,
        o2A.y + Math.cos(t * s2 * 0.8 + 1) * dA - (my - 0.5) * mA * 2,
        lS,
      );
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

  const [isMuted, setIsMuted] = useState(
    () => localStorage.getItem("flagQuizMuted") === "true",
  );
  const isMutedRef = useRef(isMuted);
  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);
  const toggleMute = () =>
    setIsMuted((p) => {
      const n = !p;
      localStorage.setItem("flagQuizMuted", String(n));
      return n;
    });

  const playDup = () => _playDup(isMutedRef.current);
  const playLolPing = () => _playLolPing(isMutedRef.current);
  const playAssistMe = () => _playAssistMe(isMutedRef.current);
  const playError = () => _playError(isMutedRef.current);

  const [shake, setShake] = useState(false),
    [correct, setCorrect] = useState(false),
    [hint, setHint] = useState(false),
    [imgLoaded, setImgLoaded] = useState(false),
    [completed, setCompleted] = useState(false),
    [gaveUp, setGaveUp] = useState(false),
    [sidebarOpen, setSidebarOpen] = useState(false),
    [started, setStarted] = useState(false),
    [imgError, setImgError] = useState(false);

  const analyzerRef = useRef(null);
  useEffect(() => {
    if (started && !completed && !gaveUp && inputRef.current) {
      if (!analyzerRef.current) {
        analyzerRef.current = new InputBehaviorAnalyzer(inputRef.current);
      }
    } else {
      analyzerRef.current = null;
    }
  }, [started, completed, gaveUp]);
  const [elapsed, setElapsed] = useState(() => {
    const s = localStorage.getItem("logoQuizStartTime");
    if (!s) return 0;
    return Math.floor((Date.now() - Number(s)) / 1000);
  });
  const hasSavedProgress = React.useMemo(() => {
    const s = localStorage.getItem("logoQuiz");
    if (!s) return false;
    try {
      const p = JSON.parse(s);
      return p.remainingLogos && p.remainingLogos.length < TOTAL;
    } catch {
      return false;
    }
  }, []);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  useEffect(() => {
    if (correct) return;
    if (!quiz.answer || !quiz.currentLogo) return;
    const tr = quiz.answer.trim().toLowerCase();
    const ex = quiz.currentLogo.name.toLowerCase();
    const sanitize = (str) => str.replace(/[^a-z0-9]/g, "");

    if (tr === ex || sanitize(tr) === sanitize(ex)) {
      if (analyzerRef.current) {
        const analysis = analyzerRef.current.analyze();
        if (!analysis.isHuman) {
          toast.error("Unusual input detected. Please type manually.", { theme: "dark" });
          analyzerRef.current.reset();
          setQuiz((prev) => ({ ...prev, answer: "" }));
          return;
        }
        analyzerRef.current.reset();
      }
      playDup();
      setCorrect(true);
      setTimeout(() => {
        setCorrect(false);
        setHint(false);
        setImgLoaded(false);
        setImgError(false);
        setQuiz((prev) => {
          const u = prev.remainingLogos.filter(
            (l) => l.id !== prev.currentLogo.id,
          );
          if (u.length === 0) {
            setCompleted(true);
            localStorage.removeItem("logoQuiz");
            return {
              ...prev,
              score: prev.score + 1,
              remainingLogos: [],
              currentLogo: null,
              answer: "",
            };
          }
          return {
            score: prev.score + 1,
            remainingLogos: u,
            currentLogo: u[0],
            answer: "",
          };
        });
      }, 150);
    }
  }, [quiz.answer, quiz.currentLogo, correct]);

  const handleNext = useCallback(() => {
    if (correct) return;
    const tr = quiz.answer.trim().toLowerCase();
    const ex = quiz.currentLogo?.name.toLowerCase() || "";
    const sanitize = (str) => str.replace(/[^a-z0-9]/g, "");

    if (tr !== ex && sanitize(tr) !== sanitize(ex)) {
      playError();
      if (typeof navigator !== "undefined" && navigator.vibrate)
        navigator.vibrate([100, 50, 100]);
      triggerShake();
      return;
    }
  }, [quiz, correct]);

  const handleSkip = () => {
    playAssistMe();
    setHint(false);
    setImgLoaded(false);
    setImgError(false);
    if (quiz.remainingLogos.length > 1) {
      const [cur, ...rest] = quiz.remainingLogos;
      const u = [...rest, cur];
      setQuiz({ ...quiz, remainingLogos: u, currentLogo: u[0], answer: "" });
    } else {
      setQuiz({ ...quiz, answer: "" });
    }
    inputRef.current?.focus();
  };

  const newGame = (resume = false) => {
    if (!resume) {
      localStorage.removeItem("logoQuiz");
      const s = shuffle(logos.data);
      setQuiz({ score: 0, remainingLogos: s, currentLogo: s[0], answer: "" });
    }
    localStorage.setItem("logoQuizStartTime", Date.now().toString());
    setCompleted(false);
    setGaveUp(false);
    setHint(false);
    setImgLoaded(false);
    setImgError(false);
    setElapsed(0);
    setStarted(true);
  };
  const handleResume = useCallback(() => {
    if (!localStorage.getItem("logoQuizStartTime"))
      localStorage.setItem("logoQuizStartTime", Date.now().toString());
    const s = localStorage.getItem("logoQuizStartTime");
    if (s) setElapsed(Math.floor((Date.now() - Number(s)) / 1000));
    setStarted(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("logoQuiz", JSON.stringify(quiz));
  }, [quiz]);
  useEffect(() => {
    if (!started || completed || gaveUp) return;
    const id = setInterval(() => {
      const s = Number(localStorage.getItem("logoQuizStartTime") || Date.now());
      setElapsed(Math.floor((Date.now() - s) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [started, completed, gaveUp]);
  useEffect(() => {
    if (!correct) inputRef.current?.focus();
  }, [correct]);

  const fmt = (s) =>
    `${Math.floor(s / 60)
      .toString()
      .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
  const progress = ((TOTAL - quiz.remainingLogos.length) / TOTAL) * 100;
  const hintText = `${quiz.currentLogo.name[0]}${"_ ".repeat(quiz.currentLogo.name.length - 1).trim()} (${quiz.currentLogo.name.length} letters)`;
  const logoUrl = `https://logo.clearbit.com/${quiz.currentLogo.domain}`;

  const btnBase =
    "py-3 px-2 rounded-xl text-[0.88rem] font-bold cursor-pointer border-none transition-all duration-150 active:scale-95 disabled:opacity-45 disabled:cursor-not-allowed tracking-wide";
  const badgeBase = "rounded-full font-bold tabular-nums tracking-wide";

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#0a0f1e_0%,#0f1929_50%,#0d1520_100%)] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div
        ref={orb1Ref}
        className="fixed rounded-full pointer-events-none z-0 w-[60vw] h-[60vw] blur-[4px] bg-[radial-gradient(circle,rgba(99,102,241,0.07)_0%,transparent_70%)]"
        style={{ willChange: "left,top", left: "20%", top: "20%" }}
      />
      <div
        ref={orb2Ref}
        className="fixed rounded-full pointer-events-none z-0 w-[50vw] h-[50vw] blur-[4px] bg-[radial-gradient(circle,rgba(236,72,153,0.06)_0%,transparent_70%)]"
        style={{ willChange: "left,top", left: "55%", top: "60%" }}
      />

      <button
        className={`fixed top-5 left-5 z-[101] bg-white/5 border-[1.5px] border-white/12 rounded-full px-[1.1rem] py-2 text-[0.82rem] font-bold text-white/70 cursor-pointer backdrop-blur-[10px] flex items-center gap-1.5 shadow-[0_4px_15px_rgba(0,0,0,0.2)] transition-all duration-300 hover:bg-white/12 hover:border-white/25 hover:text-white hover:-translate-y-px ${sidebarOpen ? "opacity-0 pointer-events-none" : ""}`}
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        🎮 Games
      </button>

      <SidebarNav isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="relative z-[1] w-full max-w-[480px] md:max-w-[520px] bg-white/[0.04] border border-white/10 p-8 md:p-10 backdrop-blur-[20px] shadow-[0_25px_60px_rgba(0,0,0,0.5)] max-sm:p-5">
        {!started ? (
          <div className="text-center flex flex-col items-center gap-5">
            <div
              className="text-[4rem] mb-2 animate-float"
              style={{ filter: "drop-shadow(0 0 25px rgba(99,102,241,0.45))" }}
            >
              🏷️
            </div>
            <h1 className="text-[clamp(1.6rem,5vw,2.2rem)] font-extrabold bg-[linear-gradient(90deg,#a78bfa,#60a5fa,#f472b6)] bg-clip-text text-transparent tracking-tight">
              Logo Quiz
            </h1>
            <p className="text-[0.9rem] text-white/50 leading-relaxed max-w-[380px]">
              Identify brands by their logos. Test your recognition of the
              world's most iconic company marks!
            </p>
            <div className="flex flex-col gap-3 w-full text-left">
              {[
                {
                  icon: "🏢",
                  title: `${TOTAL} Iconic Brands`,
                  desc: "From tech giants to gaming platforms.",
                },
                {
                  icon: "💡",
                  title: "Need a Hint?",
                  desc: "Reveal the first letter and name length.",
                },
              ].map((f, i) => (
                <div
                  key={i}
                  className="flex gap-3 bg-white/[0.02] border border-white/6 p-3 px-4 items-center"
                >
                  <span className="text-[1.3rem]">{f.icon}</span>
                  <div>
                    <strong className="text-[0.85rem] font-bold text-white block">
                      {f.title}
                    </strong>
                    <span className="text-[0.74rem] text-white/45">
                      {f.desc}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-3 w-full mt-2">
              {hasSavedProgress ? (
                <>
                  <button
                    className="w-full py-[0.85rem] text-[0.9rem] font-bold border-none cursor-pointer bg-[linear-gradient(135deg,#6366f1,#8b5cf6)] text-white shadow-[0_4px_18px_rgba(99,102,241,0.35)] transition-all duration-200 hover:shadow-[0_6px_24px_rgba(99,102,241,0.5)] hover:-translate-y-px"
                    onClick={handleResume}
                  >
                    ▶ Resume ({TOTAL - quiz.score} left)
                  </button>
                  <button
                    className="w-full py-[0.85rem] text-[0.9rem] font-bold cursor-pointer bg-white/[0.04] border-[1.5px] border-white/8 text-white/60 hover:bg-white/8 hover:text-white transition-all duration-200"
                    onClick={() => newGame(false)}
                  >
                    🔄 Start Fresh
                  </button>
                </>
              ) : (
                <button
                  className="w-full py-[0.85rem] text-[0.9rem] font-bold border-none cursor-pointer bg-[linear-gradient(135deg,#6366f1,#8b5cf6)] text-white shadow-[0_4px_18px_rgba(99,102,241,0.35)] hover:-translate-y-px transition-all duration-200"
                  onClick={() => newGame(false)}
                >
                  Start Quiz ➔
                </button>
              )}
            </div>
          </div>
        ) : completed || gaveUp ? (
          <div className="text-center">
            <div
              className="text-[5rem] mb-4 animate-float"
              style={{ filter: "drop-shadow(0 0 30px rgba(251,191,36,0.6))" }}
            >
              {completed ? "🏆" : "🏳️"}
            </div>
            <div className="text-[2rem] font-extrabold text-white mb-2">
              {completed ? "Quiz Complete!" : "Quiz Given Up"}
            </div>
            <div className="text-white/50 mb-8">
              {completed
                ? "You identified every logo!"
                : `Identified ${quiz.score} logos`}
            </div>
            <div className="text-[4rem] font-extrabold bg-[linear-gradient(90deg,#fbbf24,#f97316)] bg-clip-text text-transparent mb-1">
              {completed ? TOTAL : quiz.score}
            </div>
            <div className="text-white/40 text-[0.85rem] mb-4 uppercase tracking-wide">
              Logos Identified
            </div>
            <div className="text-white/40 mb-8">⏱ {fmt(elapsed)}</div>

            <button
              className="w-full py-[0.9rem] bg-[linear-gradient(135deg,#6366f1,#a78bfa)] text-white font-bold border-none cursor-pointer shadow-[0_6px_24px_rgba(99,102,241,0.4)] hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(99,102,241,0.5)] transition-all duration-150"
              onClick={() => newGame(false)}
            >
              🔄 {completed ? "Play Again" : "Try Again"}
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6 gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <Building2 size={20} className="text-violet-400" />
                <span className="text-[1.1rem] font-extrabold bg-[linear-gradient(90deg,#a78bfa,#60a5fa,#f472b6)] bg-clip-text text-transparent">
                  Logo Quiz
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="w-[34px] h-[34px] rounded-full inline-flex items-center justify-center bg-white/7 border-[1.5px] border-white/12 text-white/55 cursor-pointer outline-none transition-all duration-150 hover:bg-white/15 hover:text-white active:scale-95"
                  onClick={toggleMute}
                >
                  {isMuted ? "🔇" : "🔊"}
                </button>
                <div
                  className={`${badgeBase} bg-white/7 border-[1.5px] border-white/12 px-[0.9rem] py-[0.3rem] text-[0.82rem] text-white/55`}
                >
                  ⏱ {fmt(elapsed)}
                </div>
                <div
                  className={`${badgeBase} bg-indigo-500/20 border border-indigo-500/35 px-[0.9rem] py-[0.3rem] text-[0.85rem] text-violet-300`}
                >
                  {quiz.score} / {TOTAL}
                </div>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex justify-between text-[0.72rem] text-white/40 mb-[0.4rem] uppercase tracking-wide">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full h-[6px] bg-white/7 rounded-full overflow-hidden">
                <div
                  className="fq-progress-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="relative w-full aspect-[2/1] rounded-[16px] overflow-hidden mb-6 bg-white flex items-center justify-center">
              {!imgLoaded && !imgError && (
                <div className="fq-skeleton rounded-[16px]" />
              )}
              {imgError ? (
                <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                  <Building2 size={48} className="text-slate-300" />
                  <span className="text-sm font-medium">
                    {quiz.currentLogo.name}
                  </span>
                </div>
              ) : (
                <img
                  key={quiz.currentLogo.id}
                  src={
                    quiz.currentLogo.name == "ZeroSignal"
                      ? `/logos/${quiz.currentLogo.name}.png`
                      : `https://img.logo.dev/${quiz.currentLogo.domain}?token=${import.meta.env.VITE_LOGO_DEV_PUBLISHABLE_KEY}&type=icon`
                  }
                  alt="Guess this logo"
                  className={`w-1/2 h-1/2 object-contain transition-opacity duration-[400ms] ${imgLoaded ? "opacity-100" : "opacity-0"}`}
                  onLoad={() => setImgLoaded(true)}
                  onError={() => {
                    setImgError(true);
                    setImgLoaded(true);
                  }}
                />
              )}
              {correct && (
                <div className="absolute inset-0 bg-green-500/20 border-2 border-green-500/50 rounded-[16px] flex items-center justify-center fq-correct-anim">
                  <span
                    className="text-5xl"
                    style={{
                      filter: "drop-shadow(0 0 16px rgba(34,197,94,0.8))",
                    }}
                  >
                    ✅
                  </span>
                </div>
              )}
            </div>

            <div className="mb-1 text-center">
              <span
                className={`text-[0.72rem] font-bold uppercase tracking-widest border border-white/20 rounded-full px-3 py-1 ${
                  quiz.currentLogo.difficulty === "Hard"
                    ? "text-red-400 bg-red-500/15"
                    : quiz.currentLogo.difficulty === "Medium"
                      ? "text-amber-300 bg-amber-500/12"
                      : "text-green-300 bg-green-500/12"
                }`}
              >
                {quiz.currentLogo.difficulty}
              </span>
            </div>

            <div className="relative mb-4 mt-4">
              <input
                ref={inputRef}
                className={`w-full bg-white/6 border-[1.5px] border-white/12 rounded-xl px-[1.1rem] py-[0.8rem] text-base text-white outline-none transition-all duration-200 placeholder:text-white/30 focus:border-indigo-500/60 focus:bg-indigo-500/8 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.15)] ${shake ? "fq-shake" : ""}`}
                type="text"
                placeholder="Type the brand name…"
                value={quiz.answer}
                autoFocus
                onChange={(e) => setQuiz({ ...quiz, answer: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleNext();
                }}
                disabled={correct}
              />
            </div>

            <div className="text-[0.78rem] text-violet-300/80 tracking-wide min-h-[1.2rem] mb-5 text-center font-medium">
              {hint ? (
                `💡 Hint: ${hintText}, Category: ${quiz.currentLogo.category}`
              ) : (
                <span className="text-transparent">‎</span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-[0.6rem]">
              <button
                className={`${btnBase} bg-red-500/15 border-[1.5px] border-red-500/30 text-red-400 hover:bg-red-500/25`}
                onClick={handleSkip}
                disabled={correct}
              >
                ⏭ Skip
              </button>
              <button
                className={`${btnBase} bg-amber-500/12 border-[1.5px] border-amber-500/30 text-amber-300 hover:bg-amber-500/22`}
                onClick={() => {
                  playLolPing();
                  setHint(true);
                }}
                disabled={correct || hint}
              >
                💡 Hint
              </button>
              <button
                className={`${btnBase} bg-[linear-gradient(135deg,#6366f1,#8b5cf6)] text-white shadow-[0_4px_18px_rgba(99,102,241,0.35)] hover:shadow-[0_6px_24px_rgba(99,102,241,0.5)] hover:-translate-y-px`}
                onClick={handleNext}
                disabled={correct}
              >
                Check ➜
              </button>
            </div>

            <div className="grid grid-cols-3 gap-[0.6rem] mt-5 border-t border-white/6 pt-4">
              <button
                className="inline-flex items-center justify-center gap-1.5 bg-white/[0.04] border border-white/8 text-white/55 py-[0.6rem] text-[0.82rem] font-bold rounded-xl cursor-pointer transition-all duration-150 hover:bg-white/10 hover:text-white active:scale-[0.97]"
                onClick={() => newGame(false)}
                disabled={correct}
              >
                🔄 Restart
              </button>
              <button
                className="inline-flex items-center justify-center gap-1.5 bg-white/[0.04] border border-white/8 text-white/55 py-[0.6rem] text-[0.82rem] font-bold rounded-xl cursor-pointer transition-all duration-150 hover:bg-white/10 hover:text-white active:scale-[0.97]"
                onClick={() => setGaveUp(true)}
                disabled={correct}
              >
                🏳️ Give Up
              </button>
              <button
                className="inline-flex items-center justify-center gap-1.5 bg-white/[0.04] border border-white/8 text-white/55 py-[0.6rem] text-[0.82rem] font-bold rounded-xl cursor-pointer transition-all duration-150 hover:bg-white/10 hover:text-white active:scale-[0.97]"
                onClick={() => setStarted(false)}
                disabled={correct}
              >
                🏠 Home
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LogoQuiz;
