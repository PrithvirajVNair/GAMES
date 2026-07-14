import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, ArrowLeft } from "lucide-react";
import Sidebar from "../components/Sidebar";

const TermsOfService = () => {
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
              <Shield size={20} className="text-violet-400" />
              <h1 className="text-[clamp(1.3rem,4vw,1.7rem)] font-extrabold tracking-tight text-white/80">
                Terms of Service
              </h1>
            </div>
          </div>

          {/* Content */}
          <div className="max-h-[60vh] overflow-y-auto pr-2 legal-scroll flex flex-col gap-6 text-[0.88rem] leading-[1.6] text-white/70">
            <p className="text-white/50 text-[0.8rem] italic">Last Updated: July 14, 2026</p>

            <section>
              <h2 className="text-base font-bold text-white mb-2">1. Agreement to Terms</h2>
              <p>
                Welcome to FQz Games. By accessing or using our website and services, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, please do not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-white mb-2">2. Description of Service</h2>
              <p>
                FQz Games provides interactive web-based puzzle and quiz games, including Flag Quiz, Country Shape Quiz, Logo Quiz, and Sudoku. Our services are provided for entertainment and educational purposes. We reserve the right to modify, suspend, or discontinue any game or feature at any time without notice.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-white mb-2">3. User Accounts & Registration</h2>
              <p>
                To access certain features, such as submitting scores to the global leaderboards, you may need to register for an account. When registering, you agree to:
              </p>
              <ul className="list-disc pl-5 mt-2 flex flex-col gap-1">
                <li>Provide accurate, current, and complete information.</li>
                <li>Maintain the security of your password and accept all risks of unauthorized access.</li>
                <li>Notify us immediately of any security breaches or unauthorized use of your account.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-white mb-2">4. User Conduct & Fair Play</h2>
              <p>
                You are responsible for your use of FQz Games. To ensure a fun and fair environment for all players, you agree not to:
              </p>
              <ul className="list-disc pl-5 mt-2 flex flex-col gap-1">
                <li>Use bots, cheats, automation software, or any unauthorized third-party software to modify or interfere with the game outcomes or leaderboards.</li>
                <li>Attempt to bypass security features, reverse-engineer game clients, or manipulate API requests.</li>
                <li>Create multiple accounts or register under false credentials.</li>
                <li>Harass, abuse, or engage in offensive behavior towards other users.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-white mb-2">5. Intellectual Property</h2>
              <p>
                All content, graphics, layouts, and logic (excluding public-domain country flags/shapes and trademarked logos used for brand identification in Logo Quiz) are the property of FQz Games. You are granted a limited, non-exclusive, non-transferable license to access the site and play the games for personal, non-commercial use.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-white mb-2">6. Limitation of Liability</h2>
              <p>
                FQz Games and its creators shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your access to or use of the website and games. The services are provided on an "AS IS" and "AS AVAILABLE" basis.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-white mb-2">7. Termination</h2>
              <p>
                We reserve the right, without notice and in our sole discretion, to terminate your account or restrict your access to FQz Games if you violate these Terms of Service or engage in fraudulent leaderboard manipulation.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-white mb-2">8. Contact Us</h2>
              <p>
                If you have any questions or feedback regarding these Terms of Service, please submit them using the Feedback option in the game menu.
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default TermsOfService;
