import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, ArrowLeft } from "lucide-react";
import Sidebar from "../components/Sidebar";

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <div className="min-h-screen bg-[linear-gradient(135deg,#0a0f1e_0%,#0f1929_50%,#0d1520_100%)] flex flex-col items-center justify-center p-4 sm:p-6 md:p-12 relative overflow-hidden">
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
        <div className="relative z-[1] w-full max-w-[760px] bg-white/[0.04] border border-white/10 p-6 sm:p-8 md:p-10 backdrop-blur-[20px] shadow-[0_25px_60px_rgba(0,0,0,0.5),inset_0_0_0_1px_rgba(255,255,255,0.05)]">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6 sm:mb-8">
            <button
              onClick={() => navigate(-1)}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 border border-white/12 text-white/60 cursor-pointer transition-all duration-150 hover:bg-white/12 hover:text-white active:scale-90"
            >
              <ArrowLeft size={16} />
            </button>
            <div className="flex items-center gap-2">
              <Eye size={20} className="text-violet-400" />
              <h1 className="text-[clamp(1.3rem,4vw,1.7rem)] font-extrabold tracking-tight text-white/80">
                Privacy Policy
              </h1>
            </div>
          </div>

          {/* Content */}
          <div className="max-h-[60vh] overflow-y-auto pr-2 legal-scroll flex flex-col gap-6 text-[0.88rem] leading-[1.6] text-white/70">
            <p className="text-white/50 text-[0.8rem] italic">Last Updated: July 14, 2026</p>

            <section>
              <h2 className="text-base font-bold text-white mb-2">1. Overview</h2>
              <p>
                At FQz Games, we respect your privacy and are committed to protecting any personal information you share with us. This Privacy Policy details the types of information we collect, how we use it, and the security measures we employ.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-white mb-2">2. Information We Collect</h2>
              <p>
                We only collect information necessary to provide and improve game services:
              </p>
              <ul className="list-disc pl-5 mt-2 flex flex-col gap-1">
                <li>
                  <strong>Account Data:</strong> If you sign up, we collect your email address, password hash, and a chosen username. This information is stored securely in our database using Supabase.
                </li>
                <li>
                  <strong>Gameplay Data:</strong> We collect and store leaderboard scores (including completion times, dates, and number of mistakes) associated with your username/user ID.
                </li>
                <li>
                  <strong>Local Storage:</strong> We use local storage to save your settings (e.g. muted sounds) and active, unfinished quiz or Sudoku games so you can resume them later.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-white mb-2">3. How We Use Your Information</h2>
              <p>
                We use the collected information for the following purposes:
              </p>
              <ul className="list-disc pl-5 mt-2 flex flex-col gap-1">
                <li>To enable user account registration and sign-in functionality.</li>
                <li>To maintain the global leaderboards for Sudoku, Flag Quiz, Logo Quiz, and Country Shape Quiz.</li>
                <li>To analyze website usage and improve game performance.</li>
                <li>To communicate account-related notices (e.g., email verification). We will never sell your contact information to third parties.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-white mb-2">4. Third-Party Services</h2>
              <p>
                We use Supabase for authentication and database management, and Vercel Analytics for tracking basic, aggregated website performance metrics. These service providers process data in accordance with their respective privacy policies.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-white mb-2">5. Cookies & Tracking Technologies</h2>
              <p>
                FQz Games does not use invasive advertising cookies. We may use essential functional cookies or local storage settings strictly to remember session auth tokens and game settings.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-white mb-2">6. Data Security</h2>
              <p>
                We employ standard industry security protocols provided by Supabase to protect your personal credentials and data. However, no internet transmission is 100% secure. You are responsible for safeguarding your account password.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-white mb-2">7. Your Rights</h2>
              <p>
                You have the right to request deletion of your account and scores. You can request changes or delete your profile information directly through the settings interface or by reaching out to us.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-white mb-2">8. Contact Information</h2>
              <p>
                For questions, concerns, or requests regarding this Privacy Policy, please submit them using the Feedback option in the game menu.
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;
