import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { User, Award, Calendar, ArrowLeft, Flame } from "lucide-react";
import Sidebar from "../components/Sidebar";
import { getDailyStreak } from "../services/dailyChallengeService";

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scores, setScores] = useState([]);
  const [loadingScores, setLoadingScores] = useState(true);
  const [dailyStreak, setDailyStreak] = useState(0);

  useEffect(() => {
    if (!user) {
      navigate("/signin");
      return;
    }

    const fetchUserScores = async () => {
      try {
        setLoadingScores(true);
        const streak = await getDailyStreak(user.id);
        setDailyStreak(streak);

        const { data, error } = await supabase
          .from("scores")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          if (
            error.code === "PGRST116" ||
            error.message.includes("does not exist")
          ) {
            setScores([]);
          } else {
            console.error("Error fetching user scores:", error.message);
          }
        } else {
          setScores(data || []);
        }
      } catch (err) {
        console.error("Error in fetchUserScores:", err);
      } finally {
        setLoadingScores(false);
      }
    };

    fetchUserScores();
  }, [user, navigate]);

  if (!user) return null;

  const formatDate = (isoString) => {
    if (!isoString) return "N/A";
    return new Date(isoString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (s) => {
    if (!s) return "N/A";
    return `${Math.floor(s / 60)
      .toString()
      .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
  };

  return (
    <>
      <div className="min-h-screen bg-[linear-gradient(135deg,#0a0f1e_0%,#0f1929_50%,#0d1520_100%)] flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Decorative Orbs */}
        <div
          className="fixed rounded-full pointer-events-none z-0 w-[60vw] h-[60vw] blur-[4px] bg-[radial-gradient(circle,rgba(99,102,241,0.07)_0%,transparent_70%)]"
          style={{ left: "20%", top: "20%" }}
        />
        <div
          className="fixed rounded-full pointer-events-none z-0 w-[50vw] h-[50vw] blur-[4px] bg-[radial-gradient(circle,rgba(236,72,153,0.06)_0%,transparent_70%)]"
          style={{ left: "55%", top: "60%" }}
        />

        {/* Sidebar Trigger */}
        <button
          className={`fixed top-5 left-5 z-[101] bg-white/5 border-[1.5px] border-white/12 rounded-full px-[1.1rem] py-2 text-[0.82rem] font-bold text-white/70 cursor-pointer backdrop-blur-[10px] flex items-center gap-1.5 shadow-[0_4px_15px_rgba(0,0,0,0.2)] transition-all duration-300 hover:bg-white/12 hover:border-white/25 hover:text-white hover:-translate-y-px max-sm:top-4 max-sm:left-4 max-sm:px-[0.9rem] max-sm:py-[0.4rem] max-sm:text-[0.76rem] ${sidebarOpen ? "opacity-0 pointer-events-none scale-[0.8]" : ""}`}
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? "✕ Close" : "🎮 Games"}
        </button>

        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Profile Card */}
        <div className="relative z-[1] w-full max-w-[500px] bg-white/[0.04] border border-white/10 p-8 backdrop-blur-[20px] shadow-[0_25px_60px_rgba(0,0,0,0.5),inset_0_0_0_1px_rgba(255,255,255,0.05)] max-sm:p-5">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => navigate(-1)}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 border border-white/12 text-white/60 cursor-pointer transition-all duration-150 hover:bg-white/12 hover:text-white active:scale-90"
            >
              <ArrowLeft size={16} />
            </button>
            <div className="flex items-center gap-2">
              <User size={20} className="text-violet-400" />
              <h1 className="text-[clamp(1.3rem,4vw,1.7rem)] font-extrabold tracking-tight text-white/80">
                User Profile
              </h1>
            </div>
          </div>

          {/* User Details */}
          <div className="flex flex-col items-center gap-4 bg-white/[0.02] border border-white/6 p-6 mb-6">
            <div className="w-20 h-20 rounded-full bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400 font-bold text-3xl uppercase">
              {user.username ? user.username[0] : "?"}
            </div>
            <div className="text-center">
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                {user.username}
              </h2>
              <div className="flex items-center justify-center gap-1.5 text-white/40 text-[0.76rem] mt-1">
                <Calendar size={13} />
                <span>Joined {formatDate(user.created_at)}</span>
              </div>
              {dailyStreak > 0 && (
                <div className="mt-3 flex justify-center">
                  <div className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/30 text-orange-400 px-3 py-1 rounded-full text-xs font-bold shadow-[0_0_15px_rgba(249,115,22,0.2)]">
                    <Flame size={14} />
                    {dailyStreak} Day Streak
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* User Stats / Scores */}
          <div>
            <h3 className="text-[0.8rem] font-bold text-white/45 uppercase tracking-wider mb-3">
              Leaderboard History
            </h3>

            {loadingScores ? (
              <div className="text-center py-6 text-[0.82rem] text-white/40">
                Loading scores...
              </div>
            ) : scores.length === 0 ? (
              <div className="text-center py-8 bg-white/[0.01] border border-dashed border-white/6 text-[0.82rem] text-white/35">
                No submitted leaderboard scores yet. Play a game and submit your
                score to appear here!
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
                {scores.map((score, idx) => {
                  const seconds = Math.floor(score.time_ms / 1000);
                  return (
                    <div
                      key={score.id || idx}
                      className="flex items-center justify-between bg-white/[0.02] border border-white/6 p-3 px-4"
                    >
                      <div className="flex flex-col">
                        <span className="text-[0.82rem] font-bold text-white/90 uppercase tracking-wide">
                          Flag Quiz
                        </span>
                        <span className="text-[0.7rem] text-white/40">
                          {formatDate(score.created_at)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="block text-[0.85rem] font-extrabold text-violet-300">
                            Completed
                          </span>
                          <span className="block text-[0.7rem] text-white/35">
                            ⏱ {formatTime(seconds)}
                          </span>
                        </div>
                        <Award size={16} className="text-amber-400" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
