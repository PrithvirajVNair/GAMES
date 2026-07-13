import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import {
  Award,
  Trophy,
  Timer,
  Calendar,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import { getLeaderboard } from "../services/leaderboardService";
import { LEADERBOARD_MODES } from "../utils/leaderboardConstants";

const getTodaySeed = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const Leaderboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeGame, setActiveGame] = useState("flag"); // "flag", "sudoku"
  const [sudokuSubMode, setSudokuSubMode] = useState("daily"); // "daily", "unlimited"
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);

      if (activeGame === "flag") {
        // Fetch all scores and their usernames
        const { data, error: fetchError } = await supabase.from("scores").select(`
            id,
            time_ms,
            created_at,
            user_id,
            profiles:user_id (
              username
            )
          `);

        if (fetchError) throw fetchError;

        // Group by user_id to filter for the best score (minimum time_ms) of each user
        const bestScoresMap = {};
        (data || []).forEach((row) => {
          const userId = row.user_id;
          if (!userId) return;

          const existing = bestScoresMap[userId];
          if (!existing) {
            bestScoresMap[userId] = row;
          } else {
            // A lower time_ms is better
            if (row.time_ms < existing.time_ms) {
              bestScoresMap[userId] = row;
            }
          }
        });

        // Sort the grouped array by time_ms ascending (fastest first)
        const sortedLeaderboard = Object.values(bestScoresMap)
          .sort((a, b) => a.time_ms - b.time_ms)
          .slice(0, 100); // Limit to top 100 players

        setScores(sortedLeaderboard);
      } else if (activeGame === "sudoku") {
        // Sudoku
        const mode = sudokuSubMode === "daily" ? 'daily' : 'unlimited';
        const seed = sudokuSubMode === "daily" ? getTodaySeed() : null;
        const data = await getLeaderboard({ mode, seed, limit: 100 });
        
        // Map data to match flag quiz structure so the UI works perfectly!
        const mappedData = data.map(d => ({
          id: d.id,
          time_ms: d.timeMs,
          created_at: d.date,
          user_id: d.userId,
          streak: d.streak,
          profiles: { username: d.username }
        }));
        setScores(mappedData);
      }
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
      setError("Failed to load leaderboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let title = "Flag Quiz Leaderboard";
    if (activeGame === "sudoku") {
      title = sudokuSubMode === "daily" ? "Daily Sudoku Leaderboard" : "Unlimited Sudoku Leaderboard";
    }
    document.title = `${title} | FQz Games`;
    fetchLeaderboard();
  }, [activeGame, sudokuSubMode]);

  const formatTime = (s) => {
    if (!s && s !== 0) return "N/A";
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (isoString) => {
    if (!isoString) return "N/A";
    return new Date(isoString).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <>
      <style>{`
        @keyframes orb-float-gold {
          0%, 100% {
            transform: translate(0, 0) scale(1) rotate(0deg);
            opacity: 0.45;
          }
          50% {
            transform: translate(140px, 10px) scale(1.2) rotate(60deg);
            opacity: 0.85;
          }
        }
        @keyframes orb-float-silver {
          0%, 100% {
            transform: translate(0, 0) scale(1) rotate(0deg);
            opacity: 0.45;
          }
          50% {
            transform: translate(-120px, -20px) scale(1.15) rotate(-60deg);
            opacity: 0.85;
          }
        }
        @keyframes orb-float-bronze {
          0%, 100% {
            transform: translate(0, 0) scale(1) rotate(0deg);
            opacity: 0.45;
          }
          50% {
            transform: translate(30px, 30px) scale(1.25) rotate(120deg);
            opacity: 0.9;
          }
        }
        @keyframes gold-shimmer-sweep {
          0% { background-position: 150% 0; }
          35% { background-position: -150% 0; }
          100% { background-position: -150% 0; }
        }
      `}</style>
      <div className="min-h-screen bg-[linear-gradient(135deg,#0a0f1e_0%,#0f1929_50%,#0d1520_100%)] flex flex-col items-center justify-start p-4 pt-24 relative overflow-x-hidden">
        {/* Decorative Orbs */}
        <div
          className="fixed rounded-full pointer-events-none z-0 w-[60vw] h-[60vw] blur-[4px] bg-[radial-gradient(circle,rgba(99,102,241,0.07)_0%,transparent_70%)]"
          style={{ left: "10%", top: "10%" }}
        />
        <div
          className="fixed rounded-full pointer-events-none z-0 w-[50vw] h-[50vw] blur-[4px] bg-[radial-gradient(circle,rgba(236,72,153,0.06)_0%,transparent_70%)]"
          style={{ left: "60%", top: "50%" }}
        />

        {/* Sidebar Trigger */}
        <button
          className={`fixed top-5 left-5 z-[101] bg-white/5 border-[1.5px] border-white/12 rounded-full px-[1.1rem] py-2 text-[0.82rem] font-bold text-white/70 cursor-pointer backdrop-blur-[10px] flex items-center gap-1.5 shadow-[0_4px_15px_rgba(0,0,0,0.2)] transition-all duration-300 hover:bg-white/12 hover:border-white/25 hover:text-white hover:-translate-y-px max-sm:top-4 max-sm:left-4 max-sm:px-[0.9rem] max-sm:py-[0.4rem] max-sm:text-[0.76rem] ${sidebarOpen ? "opacity-0 pointer-events-none scale-[0.8]" : ""}`}
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? "✕ Close" : "🎮 Games"}
        </button>

        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Card container */}
        <div className="relative z-[1] w-full max-w-[800px] bg-white/[0.04] border border-white/10 p-6 sm:p-8 max-sm:p-3 max-sm:py-5 backdrop-blur-[20px] shadow-[0_25px_60px_rgba(0,0,0,0.5),inset_0_0_0_1px_rgba(255,255,255,0.05)]">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-2.5 min-w-0 w-full sm:w-auto">
              <button
                onClick={() => navigate(-1)}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 border border-white/12 text-white/60 cursor-pointer transition-all duration-150 hover:bg-white/12 hover:text-white active:scale-90 flex-shrink-0"
              >
                <ArrowLeft size={16} />
              </button>
              <div className="flex items-start gap-1.5 sm:gap-2 min-w-0 flex-1">
                <Trophy size={20} className="text-amber-400 flex-shrink-0 mt-0.5" />
                <h1 className="text-[1.05rem] sm:text-[1.3rem] md:text-[1.7rem] font-extrabold tracking-tight text-white leading-tight">
                  {activeGame === 'flag' && 'Flag Quiz Leaderboard'}
                  {activeGame === 'sudoku' && sudokuSubMode === 'daily' && 'Daily Challenge (Sudoku)'}
                  {activeGame === 'sudoku' && sudokuSubMode === 'unlimited' && 'Unlimited Expert (Sudoku)'}
                </h1>
              </div>
            </div>
            <button
              onClick={() => fetchLeaderboard()}
              className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 px-3 py-1.5 text-[0.82rem] font-bold transition-all duration-150 cursor-pointer active:scale-95 self-end sm:self-auto"
              disabled={loading}
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          {/* Game Selection Tabs */}
          <div className="flex bg-[#0f172a] rounded-xl p-1.5 mb-2 gap-1 border border-white/5">
            <button
              onClick={() => setActiveGame('flag')}
              className={`flex-1 py-2 px-3 text-[0.8rem] sm:text-[0.85rem] font-bold rounded-lg transition-all duration-200 ${
                activeGame === 'flag'
                  ? 'bg-[linear-gradient(135deg,#6366f1,#8b5cf6)] text-white shadow-[0_4px_12px_rgba(99,102,241,0.3)]'
                  : 'text-white/50 hover:bg-white/5 hover:text-white/80'
              }`}
            >
              🚩 Flag Quiz
            </button>
            <button
              onClick={() => setActiveGame('sudoku')}
              className={`flex-1 py-2 px-3 text-[0.8rem] sm:text-[0.85rem] font-bold rounded-lg transition-all duration-200 ${
                activeGame === 'sudoku'
                  ? 'bg-[linear-gradient(135deg,#6366f1,#8b5cf6)] text-white shadow-[0_4px_12px_rgba(99,102,241,0.3)]'
                  : 'text-white/50 hover:bg-white/5 hover:text-white/80'
              }`}
            >
              🧩 Sudoku
            </button>
          </div>

          {/* Sudoku Sub-tabs */}
          {activeGame === 'sudoku' && (
            <div className="flex bg-[#0f172a]/50 rounded-xl p-1 mb-6 gap-1 border border-white/5 max-w-[300px] mx-auto">
              <button
                onClick={() => setSudokuSubMode('daily')}
                className={`flex-1 py-1.5 px-3 text-[0.75rem] sm:text-[0.8rem] font-bold rounded-lg transition-all duration-200 ${
                  sudokuSubMode === 'daily'
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-white/40 hover:bg-white/5 hover:text-white/70'
                }`}
              >
                📅 Daily
              </button>
              <button
                onClick={() => setSudokuSubMode('unlimited')}
                className={`flex-1 py-1.5 px-3 text-[0.75rem] sm:text-[0.8rem] font-bold rounded-lg transition-all duration-200 ${
                  sudokuSubMode === 'unlimited'
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-white/40 hover:bg-white/5 hover:text-white/70'
                }`}
              >
                ♾️ Unlimited
              </button>
            </div>
          )}
          {activeGame === 'flag' && <div className="mb-6" />}

          {/* Leaderboard Table/List */}
          {loading ? (
            <div className="text-center py-20 flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-[0.85rem] text-white/55">
                Loading rankings...
              </span>
            </div>
          ) : error ? (
            <div className="text-center py-16 bg-red-500/5 border border-dashed border-red-500/20 rounded-2xl p-6">
              <span className="text-red-400 text-[0.88rem] block mb-2">
                {error}
              </span>
              <button
                onClick={() => fetchLeaderboard()}
                className="bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 px-4 py-2 rounded-xl text-[0.82rem] font-bold cursor-pointer transition-all duration-150"
              >
                Try Again
              </button>
            </div>
          ) : scores.length === 0 ? (
            <div className="text-center py-20 bg-white/[0.01] border border-dashed border-white/6 rounded-2xl text-white/35 p-8">
              <Award size={40} className="mx-auto text-white/20 mb-3" />
              <p className="text-[0.88rem] font-bold">
                No scores recorded yet!
              </p>
              <p className="text-[0.78rem] text-white/25 mt-1 max-w-[280px] mx-auto">
                Be the first to finish this quiz and submit your score to claim
                Rank #1!
              </p>
            </div>
          ) : (
            <div className="overflow-hidden">
              <table className="w-full border-collapse text-left table-fixed">
                <thead>
                  <tr className="border-b border-white/8 text-[0.68rem] sm:text-[0.74rem] font-bold text-white/40 uppercase tracking-wider">
                    <th className="pb-3 pl-1 sm:pl-2 w-[40px] sm:w-[70px]">Rank</th>
                    <th className="pb-3">Player</th>
                    <th className="pb-3 pr-1 sm:pr-2 text-right w-[75px] sm:w-[110px]">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {scores.map((score, idx) => {
                    const rank = idx + 1;
                    const isCurrentUser = user && score.user_id === user.id;
                    const username =
                      score.profiles?.username || "Anonymous Guest";
                    const seconds = Math.floor(score.time_ms / 1000);

                    // Stylized Rank formatting
                    let rankBadge = rank;
                    if (rank === 1) rankBadge = "🥇";
                    else if (rank === 2) rankBadge = "🥈";
                    else if (rank === 3) rankBadge = "🥉";

                    let rowBgClass =
                      "border-b border-white/4 hover:bg-white/[0.02]";
                    let rowStyle = {};
                    if (rank === 1) {
                      // Faint sliding shimmer glow + border styling
                      rowBgClass =
                        "border-b border-yellow-500/25 hover:brightness-105 transition-all duration-300";
                      rowStyle = {
                        background:
                          "linear-gradient(115deg, rgba(251, 191, 36, 0.15) 0%, rgba(251, 191, 36, 0.15) 46%, rgba(255, 244, 204, 0.20) 50%, rgba(251, 191, 36, 0.15) 54%, rgba(251, 191, 36, 0.15) 100%)",
                        backgroundSize: "300% 100%",
                        animation: "gold-shimmer-sweep 9s infinite linear"
                      };
                    } else if (rank === 2) {
                      rowBgClass =
                        "bg-slate-400/20 border-b border-slate-400/30 hover:bg-slate-400/25";
                    } else if (rank === 3) {
                      rowBgClass =
                        "bg-amber-700/20 border-b border-amber-700/30 hover:bg-amber-700/25";
                    } else if (isCurrentUser) {
                      rowBgClass =
                        "bg-indigo-500/10 border-b border-indigo-500/30 hover:bg-indigo-500/15";
                    }

                    return (
                      <tr
                        key={score.id}
                        className={`transition-colors duration-150 relative overflow-hidden ${rowBgClass}`}
                        style={{ clipPath: "inset(0)", ...rowStyle }}
                      >
                        {/* Rank */}
                        <td className="py-3 sm:py-4 pl-1 sm:pl-2 font-black text-[0.9rem] sm:text-[1rem]">
                          <div className="relative z-10">
                            {typeof rankBadge === "string" ? (
                              <span className="text-[1.1rem] sm:text-[1.2rem]">{rankBadge}</span>
                            ) : (
                              <span className="text-white/35 pl-1 sm:pl-1.5">
                                {rankBadge}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Player Name */}
                        <td className="py-3 sm:py-4 font-bold text-[0.82rem] sm:text-[0.92rem]">
                          {/* Animated Ambient Orb */}
                          {rank === 1 && (
                            <div
                              className="absolute pointer-events-none"
                              style={{
                                width: "240px",
                                height: "240px",
                                left: "-80px",
                                top: "-100px",
                                filter: "blur(24px)",
                                animation: "orb-float-gold 28s infinite ease-in-out"
                              }}
                            >
                              <div
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%",
                                  background: "linear-gradient(to bottom right, rgba(251, 191, 36, 0.22), rgba(253, 224, 71, 0.04))"
                                }}
                              />
                            </div>
                          )}
                          {rank === 2 && (
                            <div
                              className="absolute pointer-events-none"
                              style={{
                                width: "200px",
                                height: "110px",
                                right: "-40px",
                                top: "-35px",
                                filter: "blur(24px)",
                                animation: "orb-float-silver 28s infinite ease-in-out"
                              }}
                            >
                              <div
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  borderRadius: "16px", // Square shape with slight rounding
                                  background: "linear-gradient(to bottom right, rgba(148, 163, 184, 0.22), rgba(203, 213, 225, 0.04))"
                                }}
                              />
                            </div>
                          )}
                          {rank === 3 && (
                            <div
                              className="absolute pointer-events-none"
                              style={{
                                width: "180px",
                                height: "180px",
                                left: "20%",
                                top: "-90px",
                                filter: "blur(28px)",
                                animation: "orb-float-bronze 28s infinite ease-in-out"
                              }}
                            >
                              <div
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)", // Triangle shape
                                  background: "linear-gradient(to bottom right, rgba(180, 83, 9, 0.26), rgba(251, 146, 60, 0.06))"
                                }}
                              />
                            </div>
                          )}
                          <div className="flex items-center gap-1.5 relative z-10 w-full min-w-0">
                            <span
                              className={`truncate ${
                                isCurrentUser
                                  ? "text-indigo-300 font-extrabold"
                                  : rank === 1
                                    ? "text-yellow-200 font-bold"
                                    : rank === 2
                                      ? "text-slate-200 font-bold"
                                      : rank === 3
                                        ? "text-amber-200 font-bold"
                                        : "text-white/90"
                              }`}
                            >
                              {username}
                            </span>
                            {score.streak > 0 && activeGame === 'sudoku' && (
                              <span className="flex items-center gap-0.5 text-orange-400 text-[0.65rem] sm:text-[0.7rem] font-bold flex-shrink-0" title={`${score.streak} Day Streak`}>
                                🔥 {score.streak}
                              </span>
                            )}
                            {isCurrentUser && (
                              <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-[0.58rem] sm:text-[0.62rem] px-1.5 py-0.5 rounded font-black uppercase tracking-wider flex-shrink-0">
                                You
                              </span>
                            )}
                          </div>
                          <span className="block text-[0.68rem] sm:text-[0.72rem] text-white/30 font-medium mt-0.5 relative z-10">
                            {formatDate(score.created_at)}
                          </span>
                        </td>

                        {/* Elapsed Time */}
                        <td className="py-3 sm:py-4 pr-1 sm:pr-2 text-right text-white/60 font-medium text-[0.8rem] sm:text-[0.88rem]">
                          <span className="relative z-10">
                            ⏱ {formatTime(seconds)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Leaderboard;
