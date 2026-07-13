import React, { useCallback, useEffect, useRef, useState } from "react";
import countries from "../utils/countries";
import { Globe } from "lucide-react";
import Sidebar from "../components/Sidebar";
import {
  playDup as _playDup,
  playLolPing as _playLolPing,
  playAssistMe as _playAssistMe,
  playError as _playError,
} from "../utils/sound";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { toast } from "react-toastify";
import AuthModal from "../components/AuthModal";

// Continent name mapping
const continentNames = {
  AF: "Africa",
  AN: "Antarctica",
  AS: "Asia",
  EU: "Europe",
  NA: "North America",
  OC: "Oceania",
  SA: "South America",
};

const ALL_CONTINENTS = [
  "All",
  ...Object.keys(continentNames).filter((k) => k !== "AN"),
];

const getCountriesForContinent = (continent) =>
  continent === "All"
    ? countries.data
    : countries.data.filter((c) => c.continent === continentNames[continent]);
const shuffleArray = (a) => {
  const arr = [...a];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const countryAliases = {
  us: ["usa", "united states of america", "u.s.a.", "u.s.", "us"],
  tl: ["east timor", "timor leste", "timor lesta"],
  gb: ["great britain", "uk", "u.k.", "britain"],
  gw: ["guinea bissau"],
  cd: ["dem rep of congo", "dr congo"],
  kn: ["st kitts and nevis"],
  lc: ["st lucia"],
  vc: ["st vincent and the grenadines"],
  ae: ["uae", "u.a.e."],
};

const isAnswerCorrect = (answerText, countryObj) => {
  if (!answerText || !countryObj) return false;
  const typed = answerText.trim().toLowerCase();
  const code = countryObj.code.toLowerCase();
  const name = countryObj.country.toLowerCase();

  if (typed === name) return true;

  const aliases = countryAliases[code];
  if (aliases && aliases.some((alias) => alias.toLowerCase() === typed)) {
    return true;
  }

  const sanitize = (str) => str.replace(/[^a-z0-9]/g, "");
  if (sanitize(typed) === sanitize(name)) return true;
  if (aliases && aliases.some((alias) => sanitize(alias) === sanitize(typed))) {
    return true;
  }

  return false;
};

const CountryShapeQuiz = () => {
  const [selectedContinent, setSelectedContinent] = useState(() => {
    return localStorage.getItem("shapeQuizContinent") || "All";
  });

  useEffect(() => {
    localStorage.setItem("shapeQuizContinent", selectedContinent);
  }, [selectedContinent]);

  const getInitialQuiz = () => {
    const saved = localStorage.getItem("shapeQuiz");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    const continent = localStorage.getItem("shapeQuizContinent") || "All";
    const s = shuffleArray(getCountriesForContinent(continent));
    return {
      score: 0,
      remainingCountries: s,
      currentCountry: s[0],
      answer: "",
    };
  };
  const [quiz, setQuiz] = useState(getInitialQuiz);

  useEffect(() => {
    document.title = "Country Shape Quiz - Guess Border Outlines | FQz Games";
    const descMeta = document.querySelector('meta[name="description"]');
    if (descMeta) {
      descMeta.setAttribute(
        "content",
        "Test your geography skills by guessing country shapes! Can you identify a country purely by its border silhouette in FQz Games?",
      );
    }
  }, []);

  const orb1Ref = useRef(null),
    orb2Ref = useRef(null),
    rafRef = useRef(null),
    mouseRef = useRef({ x: 0.5, y: 0.5 }),
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
    [started, setStarted] = useState(false);
  const [elapsed, setElapsed] = useState(() => {
    const s = localStorage.getItem("shapeQuizStartTime");
    if (!s) return 0;
    return Math.floor((Date.now() - Number(s)) / 1000);
  });
  const hasSavedProgress = quiz.score > 0 && quiz.remainingCountries.length > 0;

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };
  // Auto-advance if the answer is correct
  useEffect(() => {
    if (!quiz.answer || !quiz.currentCountry) return;
    if (isAnswerCorrect(quiz.answer, quiz.currentCountry)) {
      playDup();
      setCorrect(true);
      const timer = setTimeout(() => {
        setCorrect(false);
        setHint(false);
        setImgLoaded(false);
        setQuiz((prev) => {
          const u = prev.remainingCountries.filter(
            (c) => c.country !== prev.currentCountry.country,
          );
          if (u.length === 0) {
            setCompleted(true);
            localStorage.removeItem("shapeQuiz");
            return prev;
          }
          return {
            score: prev.score + 1,
            remainingCountries: u,
            currentCountry: u[0],
            answer: "",
          };
        });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [quiz.answer, quiz.currentCountry]);

  const handleNext = useCallback(() => {
    if (correct) return;
    if (!isAnswerCorrect(quiz.answer, quiz.currentCountry)) {
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
    if (quiz.remainingCountries.length > 1) {
      const [cur, ...rest] = quiz.remainingCountries;
      const u = [...rest, cur];
      setQuiz({
        ...quiz,
        remainingCountries: u,
        currentCountry: u[0],
        answer: "",
      });
    } else {
      setQuiz({ ...quiz, answer: "" });
    }
    inputRef.current?.focus();
  };
  const handleReset = useCallback(() => {
    localStorage.removeItem("shapeQuiz");
    localStorage.setItem("shapeQuizStartTime", Date.now().toString());
    const s = shuffleArray(getCountriesForContinent(selectedContinent));
    setQuiz({
      score: 0,
      remainingCountries: s,
      currentCountry: s[0],
      answer: "",
    });
    setCompleted(false);
    setGaveUp(false);
    setHint(false);
    setImgLoaded(false);
    setElapsed(0);
    setStarted(true);
    setScoreSubmitted(false);
  }, [selectedContinent]);
  const handleResume = useCallback(() => {
    if (!localStorage.getItem("shapeQuizStartTime"))
      localStorage.setItem("shapeQuizStartTime", Date.now().toString());
    const s = localStorage.getItem("shapeQuizStartTime");
    if (s) setElapsed(Math.floor((Date.now() - Number(s)) / 1000));
    setStarted(true);
  }, []);
  const handleStartNew = useCallback(() => {
    localStorage.removeItem("shapeQuiz");
    localStorage.setItem("shapeQuizStartTime", Date.now().toString());
    const s = shuffleArray(getCountriesForContinent(selectedContinent));
    setQuiz({
      score: 0,
      remainingCountries: s,
      currentCountry: s[0],
      answer: "",
    });
    setCompleted(false);
    setGaveUp(false);
    setHint(false);
    setImgLoaded(false);
    setElapsed(0);
    setStarted(true);
    setScoreSubmitted(false);
  }, [selectedContinent]);

  useEffect(() => {
    localStorage.setItem("shapeQuiz", JSON.stringify(quiz));
  }, [quiz]);
  useEffect(() => {
    if (!started || completed || gaveUp) return;
    const id = setInterval(() => {
      const s = Number(
        localStorage.getItem("shapeQuizStartTime") || Date.now(),
      );
      setElapsed(Math.floor((Date.now() - s) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [started, completed, gaveUp]);
  useEffect(() => {
    if (!correct) inputRef.current?.focus();
  }, [correct]);

  const formatTime = (s) =>
    `${Math.floor(s / 60)
      .toString()
      .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
  const TOTAL = quiz.remainingCountries.length + quiz.score;
  const progress =
    TOTAL > 0 ? ((TOTAL - quiz.remainingCountries.length) / TOTAL) * 100 : 0;
  const firstLetter = quiz.currentCountry.country[0];
  const hintText = `${firstLetter}${"_ ".repeat(quiz.currentCountry.country.length - 1).trim()} (${quiz.currentCountry.country.length} letters)`;
  const btnBase =
    "py-3 px-2 rounded-xl text-[0.88rem] font-bold cursor-pointer border-none transition-all duration-150 active:scale-95 disabled:opacity-45 disabled:cursor-not-allowed tracking-wide";
  const badgeBase = "rounded-full font-bold tabular-nums tracking-wide";

  return (
    <>
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
          className={`fixed top-5 left-5 z-[101] bg-white/5 border-[1.5px] border-white/12 rounded-full px-[1.1rem] py-2 text-[0.82rem] font-bold text-white/70 cursor-pointer backdrop-blur-[10px] flex items-center gap-1.5 shadow-[0_4px_15px_rgba(0,0,0,0.2)] transition-all duration-300 hover:bg-white/12 hover:border-white/25 hover:text-white hover:-translate-y-px max-sm:top-4 max-sm:left-4 max-sm:px-[0.9rem] max-sm:py-[0.4rem] max-sm:text-[0.76rem] ${sidebarOpen ? "opacity-0 pointer-events-none scale-[0.8]" : ""}`}
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? "✕ Close" : "🎮 Games"}
        </button>

        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="relative z-[1] w-full max-w-[480px] md:max-w-[520px] bg-white/[0.04] border border-white/10 p-8 md:p-10 backdrop-blur-[20px] shadow-[0_25px_60px_rgba(0,0,0,0.5),inset_0_0_0_1px_rgba(255,255,255,0.05)] max-sm:p-5">
          {!started ? (
            <div className="text-center flex flex-col items-center gap-5">
              <div
                className="text-[clamp(3.5rem,12vw,4.5rem)] mb-2 animate-float"
                style={{
                  filter: "drop-shadow(0 0 25px rgba(99,102,241,0.45))",
                }}
              >
                🗺️
              </div>
              <h1 className="text-[clamp(1.6rem,5vw,2.2rem)] font-extrabold bg-[linear-gradient(90deg,#a78bfa,#60a5fa,#f472b6)] bg-clip-text text-transparent tracking-tight mb-1">
                Country Shape Quiz
              </h1>
              <p className="text-[0.9rem] text-white/50 leading-relaxed max-w-[380px] mb-2">
                Test your shape recognition speed, memory, and geography skills!
              </p>

              {/* Continent selector */}
              <div className="w-full">
                <p className="text-[0.72rem] font-bold text-white/40 uppercase tracking-widest mb-2 text-left">
                  Filter by Continent
                </p>
                <div className="grid grid-cols-4 gap-1.5 max-sm:grid-cols-3">
                  {ALL_CONTINENTS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedContinent(c)}
                      className={`py-[0.45rem] px-2 text-[0.72rem] font-bold border cursor-pointer transition-all duration-150 active:scale-95 ${
                        selectedContinent === c
                          ? "bg-indigo-500/30 border-indigo-500/60 text-violet-300 shadow-[0_0_12px_rgba(99,102,241,0.25)]"
                          : "bg-white/[0.03] border-white/10 text-white/45 hover:bg-white/8 hover:border-white/20 hover:text-white/80"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                <p className="text-[0.72rem] text-white/30 mt-1.5 text-right">
                  {getCountriesForContinent(selectedContinent).length} countries
                </p>
              </div>

              <div className="flex flex-col gap-3 w-full text-left mb-2">
                {[
                  {
                    icon: "⏱️",
                    title: "Race the Clock",
                    desc: "Track your elapsed time and push for your personal best.",
                  },
                  {
                    icon: "💡",
                    title: "Need Help?",
                    desc: "Use hints to reveal country length and first letters.",
                  },
                ].map((f, i) => (
                  <div
                    key={i}
                    className="flex gap-3 bg-white/[0.02] border border-white/6 p-3 px-4 items-center"
                  >
                    <span className="text-[1.3rem]">{f.icon}</span>
                    <div className="flex flex-col gap-[0.15rem]">
                      <strong className="text-[0.85rem] font-bold text-white">
                        {f.title}
                      </strong>
                      <span className="text-[0.74rem] text-white/45 leading-[1.4]">
                        {f.desc}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-3 w-full">
                {hasSavedProgress ? (
                  <>
                    <button
                      className="w-full py-[0.85rem] text-[0.9rem] font-bold border-none cursor-pointer bg-[linear-gradient(135deg,#6366f1,#8b5cf6)] text-white shadow-[0_4px_18px_rgba(99,102,241,0.35)] transition-all duration-200 hover:shadow-[0_6px_24px_rgba(99,102,241,0.5)] hover:-translate-y-px active:scale-[0.98]"
                      onClick={handleResume}
                    >
                      ▶ Resume Game ({TOTAL - quiz.score} left)
                    </button>
                    <button
                      className="w-full py-[0.85rem] text-[0.9rem] font-bold cursor-pointer bg-white/[0.04] border-[1.5px] border-white/8 text-white/60 transition-all duration-200 hover:bg-white/8 hover:border-white/15 hover:text-white active:scale-[0.98]"
                      onClick={handleStartNew}
                    >
                      🔄 Start Fresh
                    </button>
                  </>
                ) : (
                  <button
                    className="w-full py-[0.85rem] text-[0.9rem] font-bold border-none cursor-pointer bg-[linear-gradient(135deg,#6366f1,#8b5cf6)] text-white shadow-[0_4px_18px_rgba(99,102,241,0.35)] transition-all duration-200 hover:shadow-[0_6px_24px_rgba(99,102,241,0.5)] hover:-translate-y-px active:scale-[0.98]"
                    onClick={handleStartNew}
                  >
                    Start Quiz ➔
                  </button>
                )}
              </div>
            </div>
          ) : completed || gaveUp ? (
            <div className="text-center">
              <div
                className="text-[clamp(4rem,15vw,5.5rem)] mb-4 animate-float"
                style={{ filter: "drop-shadow(0 0 30px rgba(251,191,36,0.6))" }}
              >
                {completed ? "🏆" : "🏳️"}
              </div>
              <div className="text-[clamp(1.5rem,5vw,2rem)] font-extrabold text-white mb-2">
                {completed ? "Quiz Complete!" : "Quiz Given Up"}
              </div>
              <div className="text-white/50 text-[0.95rem] mb-8">
                {completed
                  ? "You identified every country shape in the world"
                  : `You gave up after identifying ${quiz.score} country shapes`}
              </div>
              <div className="text-[clamp(2.5rem,10vw,4rem)] font-extrabold bg-[linear-gradient(90deg,#fbbf24,#f97316)] bg-clip-text text-transparent mb-1">
                {completed ? TOTAL : quiz.score}
              </div>
              <div className="text-white/40 text-[0.85rem] mb-8 tracking-wide uppercase">
                Shapes Identified
              </div>
              <div className="text-white/40 text-[0.9rem] mb-6 tracking-widest">
                ⏱ {formatTime(elapsed)}
              </div>

              <button
                className="w-full py-[0.9rem] bg-[linear-gradient(135deg,#6366f1,#a78bfa)] text-white text-base font-bold border-none cursor-pointer tracking-wide shadow-[0_6px_24px_rgba(99,102,241,0.4)] transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(99,102,241,0.5)] active:scale-[0.97]"
                onClick={handleReset}
              >
                🔄 {completed ? "Play Again" : "Try Again"}
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6 w-full gap-2 flex-wrap max-sm:mb-4">
                <div className="flex items-center gap-2 text-violet-400">
                  <Globe size={20} className="text-violet-400" />
                  <span className="text-[clamp(0.95rem,2.5vw,1.25rem)] font-extrabold bg-[linear-gradient(90deg,#a78bfa,#60a5fa,#f472b6)] bg-clip-text text-transparent tracking-tight">
                    Country Shape Quiz
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="w-[34px] h-[34px] max-sm:w-7 max-sm:h-7 rounded-full inline-flex items-center justify-center bg-white/7 border-[1.5px] border-white/12 text-white/55 cursor-pointer outline-none transition-all duration-150 hover:bg-white/15 hover:border-white/25 hover:text-white hover:scale-105 active:scale-95"
                    onClick={toggleMute}
                  >
                    {isMuted ? "🔇" : "🔊"}
                  </button>
                  <div
                    className={`${badgeBase} bg-white/7 border-[1.5px] border-white/12 px-[0.9rem] py-[0.3rem] text-[0.82rem] text-white/55 max-sm:px-2 max-sm:py-[0.2rem] max-sm:text-[0.7rem]`}
                  >
                    ⏱ {formatTime(elapsed)}
                  </div>
                  <div
                    className={`${badgeBase} bg-indigo-500/20 border border-indigo-500/35 px-[0.9rem] py-[0.3rem] text-[0.85rem] text-violet-300 max-sm:px-2 max-sm:py-[0.2rem] max-sm:text-[0.7rem]`}
                  >
                    {quiz.score} / {TOTAL}
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between text-[0.72rem] text-white/40 mb-[0.4rem] font-medium tracking-wide uppercase">
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

              <div className="relative w-full aspect-[3/2] rounded-[16px] overflow-hidden mb-6 bg-white/[0.03] border border-white/8 flex items-center justify-center max-sm:mb-4">
                {!imgLoaded && <div className="fq-skeleton" />}
                <img
                  key={quiz.currentCountry.code}
                  src={`/shapes/${quiz.currentCountry.code}.svg`}
                  alt="Guess this country"
                  className={`w-full h-full object-contain p-4 max-sm:p-2 transition-opacity duration-[400ms] ${imgLoaded ? "opacity-100" : "opacity-0"}`}
                  style={{
                    filter:
                      "invert(1) brightness(1.8) drop-shadow(0 0 12px rgba(255,255,255,0.15))",
                  }}
                  onLoad={() => setImgLoaded(true)}
                />
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

              <div className="relative mb-4">
                <input
                  ref={inputRef}
                  className={`w-full bg-white/6 border-[1.5px] border-white/12 rounded-xl px-[1.1rem] py-[0.8rem] text-base text-white outline-none transition-all duration-200 placeholder:text-white/30 focus:border-indigo-500/60 focus:bg-indigo-500/8 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.15)] ${shake ? "fq-shake" : ""}`}
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

              <div className="text-[0.78rem] text-violet-300/80 tracking-wide min-h-[1.2rem] mb-5 text-center font-medium">
                {hint ? (
                  `💡 Hint: ${hintText}`
                ) : (
                  <span className="text-transparent">‎</span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-[0.6rem] max-sm:gap-[0.4rem]">
                <button
                  className={`${btnBase} bg-red-500/15 border-[1.5px] border-red-500/30 text-red-400 hover:bg-red-500/25 hover:shadow-[0_4px_20px_rgba(239,68,68,0.2)] max-sm:text-[0.76rem] max-sm:py-[0.6rem]`}
                  onClick={handleSkip}
                  disabled={correct}
                >
                  ⏭ Skip
                </button>
                <button
                  className={`${btnBase} bg-amber-500/12 border-[1.5px] border-amber-500/30 text-amber-300 hover:bg-amber-500/22 hover:shadow-[0_4px_20px_rgba(245,158,11,0.2)] max-sm:text-[0.76rem] max-sm:py-[0.6rem]`}
                  onClick={() => {
                    playLolPing();
                    setHint(true);
                  }}
                  disabled={correct || hint}
                >
                  💡 Hint
                </button>
                <button
                  className={`${btnBase} bg-[linear-gradient(135deg,#6366f1,#8b5cf6)] text-white shadow-[0_4px_18px_rgba(99,102,241,0.35)] hover:shadow-[0_6px_24px_rgba(99,102,241,0.5)] hover:-translate-y-px max-sm:text-[0.76rem] max-sm:py-[0.6rem]`}
                  onClick={handleNext}
                  disabled={correct}
                >
                  Check ➜
                </button>
              </div>

              <div className="grid grid-cols-3 gap-[0.6rem] mt-5 border-t border-white/6 pt-4">
                <button
                  className="inline-flex items-center justify-center gap-1.5 bg-white/[0.04] border border-white/8 text-white/55 py-[0.6rem] text-[0.82rem] font-bold rounded-xl cursor-pointer transition-all duration-150 hover:bg-white/10 hover:border-white/18 hover:text-white active:scale-[0.97]"
                  onClick={handleReset}
                  disabled={correct}
                >
                  🔄 Restart
                </button>
                <button
                  className="inline-flex items-center justify-center gap-1.5 bg-white/[0.04] border border-white/8 text-white/55 py-[0.6rem] text-[0.82rem] font-bold rounded-xl cursor-pointer transition-all duration-150 hover:bg-white/10 hover:border-white/18 hover:text-white active:scale-[0.97]"
                  onClick={() => setGaveUp(true)}
                  disabled={correct}
                >
                  🏳️ Give Up
                </button>
                <button
                  className="inline-flex items-center justify-center gap-1.5 bg-white/[0.04] border border-white/8 text-white/55 py-[0.6rem] text-[0.82rem] font-bold rounded-xl cursor-pointer transition-all duration-150 hover:bg-white/10 hover:border-white/18 hover:text-white active:scale-[0.97]"
                  onClick={() => setStarted(false)}
                  disabled={correct}
                >
                  🏠 Home
                </button>
              </div>
            </>
          )}
        </div>

        <footer className="mt-6 text-[0.75rem] text-white/35 text-center tracking-wide z-10">
          Shape assets credit:{" "}
          <a
            href="https://github.com/djaiss/mapsicon"
            target="_blank"
            rel="noopener noreferrer"
            className="text-violet-400 font-semibold no-underline transition-all duration-200 hover:text-pink-400 hover:underline hover:[text-shadow:0_0_8px_rgba(244,114,182,0.4)]"
          >
            mapsicon
          </a>
        </footer>
      </div>
    </>
  );
};

export default CountryShapeQuiz;
