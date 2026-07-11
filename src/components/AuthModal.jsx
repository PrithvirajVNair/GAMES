import React, { useState } from "react";
import { X, Mail, Lock, User, UserPlus, LogIn } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const AuthModal = ({ isOpen, onClose }) => {
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleResetState = () => {
    setUsername("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setLoading(false);
  };

  const handleToggleMode = () => {
    setIsSignUp(!isSignUp);
    handleResetState();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields", { theme: "dark" });
      return;
    }

    localStorage.setItem("supabase.rememberMe", rememberMe ? "true" : "false");

    if (isSignUp) {
      if (!username || !confirmPassword) {
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
          toast("Account created successfully!", { theme: "dark" });
          onClose();
        } else {
          toast("Account created successfully. Please verify your email before signing in.", {
            theme: "dark",
            autoClose: 8000,
          });
          setIsSignUp(false);
          handleResetState();
        }
      } catch (err) {
        console.error(err);
        let errorMsg = err.message || "Sign up failed. Please try again.";
        if (err.message && err.message.includes("already registered")) {
          errorMsg = "Email already registered";
        }
        toast.error(errorMsg, { theme: "dark" });
      } finally {
        setLoading(false);
      }
    } else {
      try {
        setLoading(true);
        localStorage.setItem("supabase.rememberMe", rememberMe ? "true" : "false");
        await signIn(email, password);
        toast("Welcome back!", { theme: "dark" });
        onClose();
      } catch (err) {
        console.error(err);
        let errorMsg = "Incorrect email or password";
        if (err.message && err.message.includes("Network")) {
          errorMsg = "Network error";
        } else if (err.message) {
          errorMsg = err.message;
        }
        toast.error(errorMsg, { theme: "dark" });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-[4px] transition-opacity"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-[420px] bg-[rgba(10,15,30,0.85)] border border-white/12 p-8 rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] backdrop-blur-[20px] z-10 flex flex-col gap-5 text-left transform transition-all duration-300 scale-100 max-sm:p-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-white/40 hover:text-white transition-colors cursor-pointer outline-none"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-indigo-500/15 border border-indigo-500/25 text-indigo-400">
            {isSignUp ? <UserPlus size={20} /> : <LogIn size={20} />}
          </div>
          <div>
            <h2 className="text-[1.2rem] font-extrabold text-white tracking-tight leading-tight">
              {isSignUp ? "Create an Account" : "Sign In to Save Scores"}
            </h2>
            <p className="text-[0.74rem] text-white/45 mt-0.5">
              {isSignUp ? "Join to save scores to the leaderboard" : "Access your global leaderboard statistics"}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-1">
          {isSignUp && (
            /* Username */
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.72rem] font-bold text-white/45 uppercase tracking-wider">
                Username
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-white/30 pointer-events-none">
                  <User size={15} />
                </span>
                <input
                  type="text"
                  className="w-full bg-white/6 border border-white/12 rounded-xl pl-10 pr-4 py-2.5 text-[0.85rem] text-white outline-none transition-all duration-200 placeholder:text-white/20 focus:border-indigo-500/60 focus:bg-indigo-500/8"
                  placeholder="e.g. GeoMaster"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[0.72rem] font-bold text-white/45 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-white/30 pointer-events-none">
                <Mail size={15} />
              </span>
              <input
                type="email"
                className="w-full bg-white/6 border border-white/12 rounded-xl pl-10 pr-4 py-2.5 text-[0.85rem] text-white outline-none transition-all duration-200 placeholder:text-white/20 focus:border-indigo-500/60 focus:bg-indigo-500/8"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[0.72rem] font-bold text-white/45 uppercase tracking-wider">
              Password
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-white/30 pointer-events-none">
                <Lock size={15} />
              </span>
              <input
                type="password"
                className="w-full bg-white/6 border border-white/12 rounded-xl pl-10 pr-4 py-2.5 text-[0.85rem] text-white outline-none transition-all duration-200 placeholder:text-white/20 focus:border-indigo-500/60 focus:bg-indigo-500/8"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          {isSignUp && (
            /* Confirm Password */
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.72rem] font-bold text-white/45 uppercase tracking-wider">
                Confirm Password
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-white/30 pointer-events-none">
                  <Lock size={15} />
                </span>
                <input
                  type="password"
                  className="w-full bg-white/6 border border-white/12 rounded-xl pl-10 pr-4 py-2.5 text-[0.85rem] text-white outline-none transition-all duration-200 placeholder:text-white/20 focus:border-indigo-500/60 focus:bg-indigo-500/8"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>
          )}

          {/* Remember Me */}
          <div className="flex items-center justify-between mt-1 mb-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={loading}
                className="w-4 h-4 rounded bg-white/6 border border-white/12 text-indigo-500 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-indigo-500"
              />
              <span className="text-[0.78rem] font-bold text-white/55">Remember me</span>
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 mt-2 text-[0.85rem] font-bold border-none cursor-pointer bg-[linear-gradient(135deg,#6366f1,#8b5cf6)] text-white shadow-[0_4px_18px_rgba(99,102,241,0.3)] transition-all duration-200 hover:shadow-[0_6px_24px_rgba(99,102,241,0.45)] hover:-translate-y-px active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? isSignUp
                ? "Creating Account..."
                : "Signing In..."
              : isSignUp
              ? "Create Account"
              : "Sign In"}
          </button>
        </form>

        {/* Toggle link and Guest Option */}
        <div className="flex flex-col items-center gap-3.5 mt-2 w-full text-center">
          <p className="text-[0.78rem] text-white/45">
            {isSignUp ? "Already have an account? " : "New user? "}
            <button
              type="button"
              onClick={handleToggleMode}
              className="text-violet-400 font-bold bg-transparent border-none cursor-pointer p-0 underline hover:text-violet-300 hover:no-underline outline-none"
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </p>

          <button
            onClick={onClose}
            className="text-[0.76rem] font-bold cursor-pointer bg-transparent border-none text-white/30 hover:text-white/60 transition-all duration-150 active:scale-95 outline-none"
          >
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
