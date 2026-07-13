import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Flag, MapPinned, Gamepad2, Grid3x3 } from "lucide-react";
import Sidebar from "../components/Sidebar";
import countries from "../utils/countries";
import logos from "../utils/logos";

const Home = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    document.title = "FQz Games - Geography & Brand Quiz Games";
    const descMeta = document.querySelector('meta[name="description"]');
    if (descMeta) {
      descMeta.setAttribute(
        "content",
        "Play interactive trivia games! Identify flags, guess countries from shape outlines, and name brands from logos."
      );
    }
  }, []);

  return (
    <>
      {/* Root */}
      <div className="min-h-screen w-full bg-[linear-gradient(135deg,#070b19_0%,#0c1224_50%,#070914_100%)] text-white relative overflow-x-hidden flex flex-col items-center justify-start pt-24 px-6 pb-12 max-sm:pt-20 max-sm:px-4">
        {/* Sidebar Toggle */}
        <button
          className={`fixed top-5 left-5 z-[101] bg-white/5 border-[1.5px] border-white/12 rounded-full px-[1.1rem] py-2 text-[0.82rem] font-bold text-white/70 cursor-pointer backdrop-blur-[10px] flex items-center gap-1.5 shadow-[0_4px_15px_rgba(0,0,0,0.2)] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-white/12 hover:border-white/25 hover:text-white hover:-translate-y-px max-sm:top-4 max-sm:left-4 max-sm:px-[0.9rem] max-sm:py-[0.4rem] max-sm:text-[0.76rem] ${
            sidebarOpen ? "opacity-0 pointer-events-none scale-[0.8]" : ""
          }`}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          title="Toggle Menu"
        >
          {sidebarOpen ? "✕ Close" : "🎮 Games"}
        </button>

        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Shooting Stars */}
        <div className="absolute top-0 left-0 right-0 h-[142px] md:h-[360px] overflow-hidden pointer-events-none z-0">
          {[
            { l: "15%", t: "-10%", d: "0s" },
            { l: "30%", t: "-5%", d: "1.8s" },
            { l: "45%", t: "10%", d: "3.5s" },
            { l: "20%", t: "25%", d: "0.8s" },
            { l: "35%", t: "15%", d: "2.7s" },
            { l: "50%", t: "-10%", d: "4.8s" },
            { l: "65%", t: "10%", d: "1.2s" },
            { l: "80%", t: "-5%", d: "2.2s" },
            { l: "95%", t: "20%", d: "0.5s" },
            { l: "70%", t: "25%", d: "3.9s" },
            { l: "85%", t: "15%", d: "1.6s" },
            { l: "90%", t: "-10%", d: "4.1s" },
          ].map((s, i) => (
            <div
              key={i}
              className="fq-shooting-star"
              style={{
                "--star-left": s.l,
                "--star-top": s.t,
                "--star-delay": s.d,
              }}
            />
          ))}
        </div>

        <div className="flex flex-col justify-center items-center gap-8 md:gap-10 w-full max-w-7xl mx-auto px-2 z-[5]">
          {/* Hero */}
          <div className="text-center px-4 flex flex-col items-center w-full">
            <div className="relative w-full max-w-[1200px] h-[clamp(55px,15vw,150px)] mx-auto flex items-center justify-center select-none">
              <svg viewBox="0 0 1200 200" className="w-full h-full">
                <defs>
                  <clipPath id="title-clip">
                    <text
                      x="50%"
                      y="58%"
                      dominantBaseline="middle"
                      textAnchor="middle"
                      fontSize="200"
                      fontWeight="500"
                      className="bebas-neue tracking-wide"
                    >
                      FQz Games
                    </text>
                  </clipPath>
                </defs>
                <foreignObject
                  x="0"
                  y="0"
                  width="1200"
                  height="200"
                  clipPath="url(#title-clip)"
                  className="w-full h-full"
                >
                  <div className="w-full h-full relative">
                    <video
                      className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                      src="/title.webm"
                      autoPlay
                      loop
                      muted
                      playsInline
                    />
                  </div>
                </foreignObject>
              </svg>
            </div>
            <p className="text-center font-medium text-sm sm:text-base md:text-lg text-white/70 mt-4 md:mt-6 leading-relaxed max-w-xl">
              Fun &amp; challenging games that test your visual memory and
              knowledge of flags and country shapes.
            </p>
          </div>

          {/* Card Grid */}
          <div
            className="grid gap-8 w-full max-w-[1100px] justify-center max-sm:grid-cols-1 max-sm:gap-5"
            style={{
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 340px))",
            }}
          >
            {/* Flag Quiz Card */}
            <div className="bg-white/[0.03] border border-white/6 p-9 flex flex-col gap-6 relative cursor-default overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-2 hover:bg-white/5 hover:border-indigo-500/30 hover:shadow-[0_20px_40px_rgba(99,102,241,0.15)] max-sm:p-7">
              <div className="w-[54px] h-[54px] flex items-center justify-center bg-indigo-500/15 text-indigo-400 border border-indigo-500/25">
                <Flag size={24} />
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <span className="text-[0.72rem] font-bold tracking-[0.5px] uppercase text-indigo-400">
                  Interactive Quiz
                </span>
                <h2 className="text-[1.4rem] font-extrabold m-0 text-white">
                  Flag Quiz
                </h2>
                <p className="text-[0.88rem] text-white/45 leading-[1.5] m-0">
                  Identify all {countries.data.length} flags of the world. Race against the timer,
                  reveal length tips, and aim for a perfect streak.
                </p>
              </div>
              <button
                className="w-full py-[0.85rem] text-[0.9rem] font-bold border-none cursor-pointer flex items-center justify-center gap-2 bg-[linear-gradient(135deg,#6366f1,#4f46e5)] text-white shadow-[0_4px_18px_rgba(99,102,241,0.2)] transition-all duration-200 hover:shadow-[0_6px_24px_rgba(99,102,241,0.4)] hover:-translate-y-px"
                onClick={() => navigate("/flag-quiz")}
              >
                Play Flag Quiz ➔
              </button>
            </div>

            {/* Country Shape Card */}
            <div className="bg-white/[0.03] border border-white/6 p-9 flex flex-col gap-6 relative cursor-default overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-2 hover:bg-white/5 hover:border-violet-400/30 hover:shadow-[0_20px_40px_rgba(167,139,250,0.15)] max-sm:p-7">
              <div className="w-[54px] h-[54px] flex items-center justify-center bg-violet-400/15 text-violet-400 border border-violet-400/25">
                <MapPinned size={24} />
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <span className="text-[0.72rem] font-bold tracking-[0.5px] uppercase text-violet-400">
                  Silhouette Quiz
                </span>
                <h2 className="text-[1.4rem] font-extrabold m-0 text-white">
                  Country Shape Quiz
                </h2>
                <p className="text-[0.88rem] text-white/45 leading-[1.5] m-0">
                  Guess countries purely by their border outlines! A spatial
                  test using sleek vector silhouettes.
                </p>
              </div>
              <button
                className="w-full py-[0.85rem] text-[0.9rem] font-bold border-none cursor-pointer flex items-center justify-center gap-2 bg-[linear-gradient(135deg,#8b5cf6,#7c3aed)] text-white shadow-[0_4px_18px_rgba(139,92,246,0.2)] transition-all duration-200 hover:shadow-[0_6px_24px_rgba(139,92,246,0.4)] hover:-translate-y-px"
                onClick={() => navigate("/country-shape-quiz")}
              >
                Play Shape Quiz ➔
              </button>
            </div>

            {/* Logo Quiz Card */}
            <div className="bg-white/[0.03] border border-white/6 p-9 flex flex-col gap-6 relative cursor-default overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-2 hover:bg-white/5 hover:border-fuchsia-500/30 hover:shadow-[0_20px_40px_rgba(192,132,252,0.15)] max-sm:p-7">
              <div className="w-[54px] h-[54px] flex items-center justify-center bg-fuchsia-500/15 text-fuchsia-400 border border-fuchsia-500/25">
                <Gamepad2 size={24} />
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <span className="text-[0.72rem] font-bold tracking-[0.5px] uppercase text-fuchsia-400">
                  Brand Quiz
                </span>
                <h2 className="text-[1.4rem] font-extrabold m-0 text-white">
                  Logo Quiz
                </h2>
                <p className="text-[0.88rem] text-white/45 leading-[1.5] m-0">
                  Identify brands by their iconic logos. Test your recognition
                  of the world's most famous company marks.
                </p>
              </div>
              <button
                className="w-full py-[0.85rem] text-[0.9rem] font-bold border-none cursor-pointer flex items-center justify-center gap-2 bg-[linear-gradient(135deg,#a855f7,#7e22ce)] text-white shadow-[0_4px_18px_rgba(168,85,247,0.2)] transition-all duration-200 hover:shadow-[0_6px_24px_rgba(168,85,247,0.4)] hover:-translate-y-px"
                onClick={() => navigate("/logo-quiz")}
              >
                Play Logo Quiz ➔
              </button>
            </div>

            {/* Sudoku Card */}
            <div className="bg-white/[0.03] border border-white/6 p-9 flex flex-col gap-6 relative cursor-default overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-2 hover:bg-white/5 hover:border-cyan-500/30 hover:shadow-[0_20px_40px_rgba(6,182,212,0.15)] max-sm:p-7">
              <div className="w-[54px] h-[54px] flex items-center justify-center bg-cyan-500/15 text-cyan-400 border border-cyan-500/25">
                <Grid3x3 size={24} />
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <span className="text-[0.72rem] font-bold tracking-[0.5px] uppercase text-cyan-400">
                  Logic Puzzle
                </span>
                <h2 className="text-[1.4rem] font-extrabold m-0 text-white">
                  Sudoku
                </h2>
                <p className="text-[0.88rem] text-white/45 leading-[1.5] m-0">
                  Challenge your brain with classic Sudoku. Play Unlimited mode or compete in the Daily Challenge!
                </p>
              </div>
              <button
                className="w-full py-[0.85rem] text-[0.9rem] font-bold border-none cursor-pointer flex items-center justify-center gap-2 bg-[linear-gradient(135deg,#06b6d4,#0891b2)] text-white shadow-[0_4px_18px_rgba(6,182,212,0.2)] transition-all duration-200 hover:shadow-[0_6px_24px_rgba(6,182,212,0.4)] hover:-translate-y-px"
                onClick={() => navigate("/sudoku")}
              >
                Play Sudoku ➔
              </button>
            </div>
          </div>

          {/* Global Leaderboard Call-to-Action */}
          <div className="w-full max-w-[1100px] flex justify-center">
            <button
              onClick={() => navigate("/leaderboard")}
              className="px-8 py-3.5 bg-white/[0.03] border border-white/10 hover:bg-white/8 hover:border-indigo-500/30 hover:shadow-[0_10px_25px_rgba(99,102,241,0.15)] text-white font-extrabold cursor-pointer transition-all duration-200 flex items-center gap-2 text-[0.9rem] hover:-translate-y-px"
            >
              🏆 View Global Leaderboards
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
