import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { toast } from "react-toastify";
import { UserPlus, User, Mail, Lock, ArrowLeft, CheckCircle, RefreshCw } from "lucide-react";
import Sidebar from "../components/Sidebar";

const SignUp = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  // When this is set, we show the "check your inbox" screen instead of the form
  const [pendingEmail, setPendingEmail] = useState(null);
  const [resending, setResending] = useState(false);

  const from = location.state?.from?.pathname || "/";

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (!username || !email || !password || !confirmPassword) {
      toast.error("Please fill in all fields", { theme: "dark" });
      return;
    }
    if (username.length < 3) {
      toast.error("Username must be at least 3 characters", { theme: "dark" });
      return;
    }
    if (username.length > 20) {
      toast.error("Username must not exceed 20 characters", { theme: "dark" });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address", { theme: "dark" });
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters", { theme: "dark" });
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match", { theme: "dark" });
      return;
    }

    try {
      setLoading(true);
      const data = await signUp(username, email, password);
      if (data?.session) {
        // Email confirmation is disabled — user is immediately signed in
        toast("Account created successfully!", { theme: "dark" });
        navigate(from, { replace: true });
      } else {
        // Email confirmation is enabled — show the "check inbox" screen
        setPendingEmail(email);
      }
    } catch (error) {
      console.error(error);
      let errorMsg = error.message || "Sign up failed. Please try again.";
      if (error.message && error.message.includes("already registered")) {
        errorMsg = "Email already registered. Try signing in instead.";
      }
      toast.error(errorMsg, { theme: "dark" });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!pendingEmail || resending) return;
    try {
      setResending(true);
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: pendingEmail,
      });
      if (error) throw error;
      toast("Verification email resent!", { theme: "dark" });
    } catch (err) {
      toast.error("Failed to resend: " + err.message, { theme: "dark" });
    } finally {
      setResending(false);
    }
  };

  // ─── "Check Your Inbox" Screen ───────────────────────────────────────────────
  if (pendingEmail) {
    return (
      <>
        <div className="min-h-screen bg-[linear-gradient(135deg,#0a0f1e_0%,#0f1929_50%,#0d1520_100%)] flex flex-col items-center justify-center p-4 relative overflow-hidden">
          <div className="fixed rounded-full pointer-events-none z-0 w-[60vw] h-[60vw] blur-[4px] bg-[radial-gradient(circle,rgba(99,102,241,0.07)_0%,transparent_70%)]" style={{ left: "20%", top: "20%" }} />
          <div className="fixed rounded-full pointer-events-none z-0 w-[50vw] h-[50vw] blur-[4px] bg-[radial-gradient(circle,rgba(236,72,153,0.06)_0%,transparent_70%)]" style={{ left: "55%", top: "60%" }} />

          <div className="relative z-[1] w-full max-w-[420px] bg-white/[0.04] border border-white/10 p-8 backdrop-blur-[20px] shadow-[0_25px_60px_rgba(0,0,0,0.5),inset_0_0_0_1px_rgba(255,255,255,0.05)] max-sm:p-6 text-center">
            {/* Icon */}
            <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <CheckCircle size={32} className="text-emerald-400" />
            </div>

            <h1 className="text-[1.5rem] font-extrabold text-white tracking-tight mb-2">
              Check your inbox
            </h1>
            <p className="text-[0.85rem] text-white/50 leading-relaxed mb-2">
              We sent a verification link to
            </p>
            <p className="text-[0.9rem] font-bold text-violet-300 mb-6 break-all">
              {pendingEmail}
            </p>

            <div className="bg-white/[0.03] border border-white/8 rounded-xl p-4 mb-6 text-left flex flex-col gap-2">
              {[
                "Open the email from FQz Games",
                "Click the \"Confirm your email\" link",
                "You'll be signed in automatically",
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-[0.7rem] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-[0.82rem] text-white/60">{step}</span>
                </div>
              ))}
            </div>

            <p className="text-[0.75rem] text-white/35 mb-4">
              Didn't receive it? Check your spam folder or resend below.
            </p>

            <button
              onClick={handleResend}
              disabled={resending}
              className="w-full py-2.5 mb-3 text-[0.85rem] font-bold border border-white/10 bg-white/[0.04] text-white/70 hover:bg-white/8 hover:text-white cursor-pointer transition-all duration-200 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <RefreshCw size={14} className={resending ? "animate-spin" : ""} />
              {resending ? "Resending..." : "Resend verification email"}
            </button>

            <button
              onClick={() => navigate("/signin")}
              className="w-full py-2.5 text-[0.85rem] font-bold border-none cursor-pointer bg-[linear-gradient(135deg,#6366f1,#8b5cf6)] text-white shadow-[0_4px_18px_rgba(99,102,241,0.35)] transition-all duration-200 hover:shadow-[0_6px_24px_rgba(99,102,241,0.5)] hover:-translate-y-px active:scale-[0.98]"
            >
              Go to Sign In
            </button>
          </div>
        </div>
      </>
    );
  }

  // ─── Registration Form ────────────────────────────────────────────────────────
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

        {/* Card */}
        <div className="relative z-[1] w-full max-w-[420px] bg-white/[0.04] border border-white/10 p-8 backdrop-blur-[20px] shadow-[0_25px_60px_rgba(0,0,0,0.5),inset_0_0_0_1px_rgba(255,255,255,0.05)] max-sm:p-5">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => navigate(-1)}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 border border-white/12 text-white/60 cursor-pointer transition-all duration-150 hover:bg-white/12 hover:text-white active:scale-90"
            >
              <ArrowLeft size={16} />
            </button>
            <div className="flex items-center gap-2">
              <UserPlus size={20} className="text-violet-400" />
              <h1 className="text-[clamp(1.3rem,4vw,1.7rem)] font-extrabold tracking-tight text-white/80">
                Sign Up
              </h1>
            </div>
          </div>

          <form onSubmit={handleSignUp} className="flex flex-col gap-3.5">
            {/* Username Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.72rem] font-bold text-white/45 uppercase tracking-wider">
                Username
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-white/30 pointer-events-none">
                  <User size={16} />
                </span>
                <input
                  type="text"
                  className="w-full bg-white/6 border border-white/12 rounded-xl pl-10 pr-4 py-2.5 text-[0.88rem] text-white outline-none transition-all duration-200 placeholder:text-white/20 focus:border-indigo-500/60 focus:bg-indigo-500/8 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.15)]"
                  placeholder="e.g. GeoMaster"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.72rem] font-bold text-white/45 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-white/30 pointer-events-none">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  className="w-full bg-white/6 border border-white/12 rounded-xl pl-10 pr-4 py-2.5 text-[0.88rem] text-white outline-none transition-all duration-200 placeholder:text-white/20 focus:border-indigo-500/60 focus:bg-indigo-500/8 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.15)]"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.72rem] font-bold text-white/45 uppercase tracking-wider">
                Password
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-white/30 pointer-events-none">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  className="w-full bg-white/6 border border-white/12 rounded-xl pl-10 pr-4 py-2.5 text-[0.88rem] text-white outline-none transition-all duration-200 placeholder:text-white/20 focus:border-indigo-500/60 focus:bg-indigo-500/8 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.15)]"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.72rem] font-bold text-white/45 uppercase tracking-wider">
                Confirm Password
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-white/30 pointer-events-none">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  className="w-full bg-white/6 border border-white/12 rounded-xl pl-10 pr-4 py-2.5 text-[0.88rem] text-white outline-none transition-all duration-200 placeholder:text-white/20 focus:border-indigo-500/60 focus:bg-indigo-500/8 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.15)]"
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Terms Disclaimer */}
            <p className="text-[0.7rem] text-center text-white/30 leading-relaxed mt-1">
              By creating an account, you agree to our{" "}
              <Link to="/terms" className="text-violet-400/80 hover:text-violet-300 hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="text-violet-400/80 hover:text-violet-300 hover:underline">
                Privacy Policy
              </Link>
              .
            </p>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 mt-2 text-[0.88rem] font-bold border-none cursor-pointer bg-[linear-gradient(135deg,#6366f1,#8b5cf6)] text-white shadow-[0_4px_18px_rgba(99,102,241,0.35)] transition-all duration-200 hover:shadow-[0_6px_24px_rgba(99,102,241,0.5)] hover:-translate-y-px active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          {/* Footer */}
          <p className="text-[0.8rem] text-center text-white/40 mt-5">
            Already have an account?{" "}
            <Link
              to="/signin"
              state={location.state}
              className="text-violet-400 font-bold no-underline hover:text-violet-300 hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default SignUp;
