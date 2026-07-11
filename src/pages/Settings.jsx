import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Settings as SettingsIcon, Volume2, VolumeX, ArrowLeft } from "lucide-react";
import Sidebar from "../components/Sidebar";
import { Bounce, toast } from "react-toastify";

const Settings = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [muted, setMuted] = useState(
    () => localStorage.getItem("flagQuizMuted") === "true"
  );

  const toggleMute = () => {
    setMuted((prev) => {
      const next = !prev;
      localStorage.setItem("flagQuizMuted", String(next));
      return next;
    });
  };

  return (
    <>
      <div className="min-h-screen bg-[linear-gradient(135deg,#0a0f1e_0%,#0f1929_50%,#0d1520_100%)] flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Orbs */}
        <div className="fixed rounded-full pointer-events-none z-0 w-[60vw] h-[60vw] blur-[4px] bg-[radial-gradient(circle,rgba(99,102,241,0.07)_0%,transparent_70%)]" style={{ left: "20%", top: "20%" }} />
        <div className="fixed rounded-full pointer-events-none z-0 w-[50vw] h-[50vw] blur-[4px] bg-[radial-gradient(circle,rgba(236,72,153,0.06)_0%,transparent_70%)]" style={{ left: "55%", top: "60%" }} />

        {/* Sidebar toggle */}
        <button
          className={`fixed top-5 left-5 z-[101] bg-white/5 border-[1.5px] border-white/12 rounded-full px-[1.1rem] py-2 text-[0.82rem] font-bold text-white/70 cursor-pointer backdrop-blur-[10px] flex items-center gap-1.5 shadow-[0_4px_15px_rgba(0,0,0,0.2)] transition-all duration-300 hover:bg-white/12 hover:border-white/25 hover:text-white hover:-translate-y-px max-sm:top-4 max-sm:left-4 max-sm:px-[0.9rem] max-sm:py-[0.4rem] max-sm:text-[0.76rem] ${sidebarOpen ? "opacity-0 pointer-events-none scale-[0.8]" : ""}`}
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? "✕ Close" : "🎮 Games"}
        </button>

        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Card */}
        <div className="relative z-[1] w-full max-w-[480px] bg-white/[0.04] border border-white/10 p-8 md:p-10 backdrop-blur-[20px] shadow-[0_25px_60px_rgba(0,0,0,0.5),inset_0_0_0_1px_rgba(255,255,255,0.05)] max-sm:p-5 max-sm:rounded-[20px]">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <button
              onClick={() => navigate(-1)}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 border border-white/12 text-white/60 cursor-pointer transition-all duration-150 hover:bg-white/12 hover:text-white active:scale-90"
            >
              <ArrowLeft size={16} />
            </button>
            <div className="flex items-center gap-2">
              <SettingsIcon size={20} className="text-violet-400" />
              <h1 className="text-[clamp(1.3rem,4vw,1.7rem)] font-extrabold tracking-tight text-white/80">
                Settings
              </h1>
            </div>
          </div>

          {/* Settings sections */}
          <div className="flex flex-col gap-3">
            {/* Sound */}
            <div className="flex items-center justify-between bg-white/[0.03] border border-white/8 px-4 py-4">
              <div className="flex items-center gap-3">
                {muted ? (
                  <VolumeX size={18} className="text-white/40" />
                ) : (
                  <Volume2 size={18} className="text-violet-400" />
                )}
                <div>
                  <p className="text-[0.88rem] font-bold text-white/85">Sound Effects</p>
                  <p className="text-[0.72rem] text-white/40">
                    {muted ? "Muted across all quizzes" : "Enabled across all quizzes"}
                  </p>
                </div>
              </div>
              {/* Toggle switch */}
              <button
                onClick={toggleMute}
                className={`relative w-11 h-6 rounded-full border transition-all duration-200 cursor-pointer ${
                  muted
                    ? "bg-white/10 border-white/15"
                    : "bg-indigo-500/60 border-indigo-500/80"
                }`}
              >
                <span
                  className={`absolute top-[3px] w-[18px] h-[18px] rounded-full bg-white shadow transition-all duration-200 ${
                    muted ? "left-[3px]" : "left-[23px]"
                  }`}
                />
              </button>
            </div>

            {/* Clear progress */}
            <div className="flex items-center justify-between bg-white/[0.03] border border-white/8 px-4 py-4">
              <div>
                <p className="text-[0.88rem] font-bold text-white/85">Clear Saved Progress</p>
                <p className="text-[0.72rem] text-white/40">Resets all quiz progress from storage</p>
              </div>
              <button
                onClick={() => {
                  localStorage.removeItem("flagQuiz");
                  localStorage.removeItem("shapeQuiz");
                  localStorage.removeItem("logoQuiz");
                  localStorage.removeItem("quizStartTime");
                  localStorage.removeItem("shapeQuizStartTime");
                  localStorage.removeItem("logoQuizStartTime");
                  toast("All progress cleared!",{theme: "dark",transition: Bounce});
                }}
                className="py-[0.4rem] px-3 text-[0.76rem] font-bold rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 cursor-pointer transition-all duration-150 hover:bg-red-500/20 active:scale-95"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Settings;
