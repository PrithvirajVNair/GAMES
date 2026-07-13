import { useEffect } from "react";
import { Ellipsis, Flag, MapPinned, Home, Gamepad2, Settings, LogIn, LogOut, User, UserPlus, Trophy, Grid3x3 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();

  const mainItems = [
    { id: "home", title: "Main Menu", path: "/", status: "playable" },
    {
      id: "leaderboard",
      title: "Leaderboard",
      path: "/leaderboard",
      status: "playable",
    },
  ];

  const gameItems = [
    {
      id: "flag-quiz",
      title: "Flag Quiz",
      path: "/flag-quiz",
      status: "playable",
    },
    {
      id: "country-shape-quiz",
      title: "Country Shape Quiz",
      path: "/country-shape-quiz",
      status: "playable",
    },
    {
      id: "logo-quiz",
      title: "Logo Quiz",
      path: "/logo-quiz",
      status: "playable",
    },
    {
      id: "sudoku",
      title: "Sudoku",
      path: "/sudoku",
      status: "playable",
    },
  ];

  const iconFor = (id) => {
    if (id === "home") return <Home />;
    if (id === "flag-quiz") return <Flag />;
    if (id === "country-shape-quiz") return <MapPinned />;
    if (id === "logo-quiz") return <Gamepad2 />;
    if (id === "leaderboard") return <Trophy />;
    if (id === "sudoku") return <Grid3x3 />;

    return <Ellipsis />;
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast("Logged out successfully", { theme: "dark" });
      onClose();
      navigate("/");
    } catch (error) {
      toast.error("Logout failed: " + error.message, { theme: "dark" });
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Sidebar Drawer */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-80 max-sm:w-[280px] bg-[rgba(10,15,30,0.75)] backdrop-blur-[30px] border-r border-white/8 z-[100] flex flex-col gap-6 p-8 max-sm:p-6 transition-transform duration-[350ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isOpen
            ? "translate-x-0 shadow-[20px_0_80px_rgba(0,0,0,0.6)]"
            : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <Gamepad2 style={{ color: "#fff" }} />
            <span className="text-[1.3rem] font-extrabold tracking-tight bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
             FQz Games
            </span>
          </div>
          <button
            className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 border border-white/12 text-white/60 text-[0.95rem] cursor-pointer outline-none transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-white/12 hover:text-white hover:border-white/25 active:scale-90"
            onClick={onClose}
            aria-label="Close Sidebar"
          >
            ✕
          </button>
        </div>

        {/* Menu Items */}
        <div className="flex flex-col gap-2.5">
          {mainItems.map((item) => {
            const isPlayable = item.status === "playable";
            const isActive = location.pathname === item.path;

            return (
              <div
                key={item.id}
                className={`flex items-center justify-between px-[1.1rem] py-3.5 border-[1.5px] transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                  isActive
                    ? "bg-[linear-gradient(135deg,rgba(99,102,241,0.15)_0%,rgba(139,92,246,0.15)_100%)] border-indigo-500/40 shadow-[0_4px_15px_rgba(99,102,241,0.15)]"
                    : "bg-white/[0.03] border-white/8"
                } ${
                  !isPlayable
                    ? "opacity-45 cursor-not-allowed"
                    : "cursor-pointer hover:bg-white/8 hover:border-white/18 hover:-translate-y-px"
                }`}
                onClick={() => {
                  if (isPlayable) {
                    navigate(item.path);
                    onClose();
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-[1.1rem] text-white flex items-center justify-center">
                    {iconFor(item.id)}
                  </span>
                  <span
                    className={`text-[0.88rem] font-bold transition-colors duration-200 ${isActive ? "text-white" : "text-white/85"}`}
                  >
                    {item.title}
                  </span>
                </div>
                <span className="text-[0.85rem] text-white/50">
                  {isPlayable ? (isActive ? "⚡" : "▶") : "🔒"}
                </span>
              </div>
            );
          })}

          <div className="text-[0.72rem] font-extrabold text-white/30 uppercase tracking-widest mt-4 mb-1 pl-3.5 flex items-center gap-1.5 select-none">
            <span>🎮</span> Games
          </div>

          {gameItems.map((item) => {
            const isPlayable = item.status === "playable";
            const isActive = location.pathname === item.path;

            return (
              <div
                key={item.id}
                className={`flex items-center justify-between px-[1.1rem] py-3.5 border-[1.5px] transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                  isActive
                    ? "bg-[linear-gradient(135deg,rgba(99,102,241,0.15)_0%,rgba(139,92,246,0.15)_100%)] border-indigo-500/40 shadow-[0_4px_15px_rgba(99,102,241,0.15)]"
                    : "bg-white/[0.03] border-white/8"
                } ${
                  !isPlayable
                    ? "opacity-45 cursor-not-allowed"
                    : "cursor-pointer hover:bg-white/8 hover:border-white/18 hover:-translate-y-px"
                }`}
                onClick={() => {
                  if (isPlayable) {
                    navigate(item.path);
                    onClose();
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-[1.1rem] text-white flex items-center justify-center">
                    {iconFor(item.id)}
                  </span>
                  <span
                    className={`text-[0.88rem] font-bold transition-colors duration-200 ${isActive ? "text-white" : "text-white/85"}`}
                  >
                    {item.title}
                  </span>
                </div>
                <span className="text-[0.85rem] text-white/50">
                  {isPlayable ? (isActive ? "⚡" : "▶") : "🔒"}
                </span>
              </div>
            );
          })}
        </div>

        {/* Bottom: Auth and Settings */}
        <div className="mt-auto flex flex-col gap-4">
          {/* Auth Section */}
          <div className="border-t border-white/8 pt-4 flex flex-col gap-3">
            {user ? (
              <>
                {/* Logged In Info */}
                <div className="flex items-center gap-3 px-3 py-1.5 bg-white/[0.02] rounded-xl border border-white/5">
                  <div className="w-8 h-8 rounded-full bg-violet-500/10 border border-violet-500/25 flex items-center justify-center text-violet-400 font-bold uppercase text-[0.9rem]">
                    {user.username ? user.username[0] : "?"}
                  </div>
                  <div className="flex flex-col truncate">
                    <span className="text-[0.72rem] text-white/35 font-bold uppercase tracking-wider">Signed In As</span>
                    <span className="text-[0.85rem] font-extrabold text-white truncate">{user.username}</span>
                  </div>
                </div>

                {/* Profile Link */}
                <button
                  onClick={() => {
                    navigate("/profile");
                    onClose();
                  }}
                  className={`w-full flex items-center gap-3 px-[1.1rem] py-3 border-[1.5px] transition-all duration-200 cursor-pointer ${
                    location.pathname === "/profile"
                      ? "bg-[linear-gradient(135deg,rgba(99,102,241,0.15)_0%,rgba(139,92,246,0.15)_100%)] border-indigo-500/40"
                      : "bg-white/[0.03] border-white/8 hover:bg-white/8 hover:border-white/18 hover:-translate-y-px"
                  }`}
                >
                  <User size={18} className={location.pathname === "/profile" ? "text-violet-400" : "text-white/55"} />
                  <span className={`text-[0.88rem] font-bold ${location.pathname === "/profile" ? "text-white" : "text-white/70"}`}>
                    Profile
                  </span>
                </button>

                {/* Logout Link */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-[1.1rem] py-3 border-[1.5px] bg-red-500/5 border-red-500/15 text-red-400/80 cursor-pointer transition-all duration-200 hover:bg-red-500/10 hover:border-red-500/25 hover:text-red-400 active:scale-[0.98]"
                >
                  <LogOut size={18} />
                  <span className="text-[0.88rem] font-bold">Logout</span>
                </button>
              </>
            ) : (
              <>
                {/* Logged Out Controls */}
                <button
                  onClick={() => {
                    navigate("/signin");
                    onClose();
                  }}
                  className={`w-full flex items-center gap-3 px-[1.1rem] py-3 border-[1.5px] transition-all duration-200 cursor-pointer ${
                    location.pathname === "/signin"
                      ? "bg-[linear-gradient(135deg,rgba(99,102,241,0.15)_0%,rgba(139,92,246,0.15)_100%)] border-indigo-500/40"
                      : "bg-white/[0.03] border-white/8 hover:bg-white/8 hover:border-white/18 hover:-translate-y-px"
                  }`}
                >
                  <LogIn size={18} className="text-white/55" />
                  <span className="text-[0.88rem] font-bold text-white/70">Sign In</span>
                </button>
              </>
            )}
          </div>

          {/* Settings */}
          <div className="border-t border-white/8 pt-4">
            <button
              onClick={() => { navigate("/settings"); onClose(); }}
              className={`w-full flex items-center gap-3 px-[1.1rem] py-3 border-[1.5px] transition-all duration-200 cursor-pointer ${
                location.pathname === "/settings"
                  ? "bg-[linear-gradient(135deg,rgba(99,102,241,0.15)_0%,rgba(139,92,246,0.15)_100%)] border-indigo-500/40"
                  : "bg-white/[0.03] border-white/8 hover:bg-white/8 hover:border-white/18 hover:-translate-y-px"
              }`}
            >
              <Settings size={18} className={location.pathname === "/settings" ? "text-violet-400" : "text-white/55"} />
              <span className={`text-[0.88rem] font-bold ${location.pathname === "/settings" ? "text-white" : "text-white/70"}`}>
                Settings
              </span>
            </button>
          </div>
        </div>
      </aside>

      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[99] transition-opacity duration-300 ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />
    </>
  );
};

export default Sidebar;
