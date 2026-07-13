import { useEffect, useState } from "react";
import { Ellipsis, Flag, MapPinned, Home, Gamepad2, Settings, LogIn, LogOut, User, UserPlus, Trophy, Grid3x3, ChevronDown, AlignJustify } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [gamesExpanded, setGamesExpanded] = useState(true);

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

  const handleToggleClick = () => {
    // Find the toggle button on the page and click it to open/toggle the sidebar
    const toggleBtn = Array.from(document.querySelectorAll("button")).find(
      (btn) =>
        btn.textContent.includes("Games") || btn.textContent.includes("Close")
    );
    if (toggleBtn) {
      toggleBtn.click();
    }
  };

  return (
    <>
      {/* Sidebar Drawer */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-[100] bg-[rgba(10,15,30,100)] backdrop-blur-[30px] border-r border-white/8 flex flex-col gap-6 p-8 max-sm:p-6 transition-all duration-[350ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isOpen
            ? "translate-x-0 w-80 shadow-[20px_0_80px_rgba(0,0,0,0.6)] sidebar-force-open"
            : "w-80 md:translate-x-0 -translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mt-4">
          {isOpen ? (
            <div className="flex items-center gap-2">
              <Gamepad2 style={{ color: "#fff" }} className="flex-shrink-0" />
              <span className="sidebar-text-label text-[1.3rem] font-extrabold tracking-tight bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent whitespace-nowrap">
                FQz Games
              </span>
            </div>
          ) : (
            <button
              onClick={handleToggleClick}
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 border border-white/12 text-white/80 cursor-pointer outline-none transition-all duration-200 hover:bg-white/12 hover:text-white hover:border-white/25 active:scale-90 mx-auto"
              aria-label="Open Sidebar"
            >
              <AlignJustify size={20} />
            </button>
          )}

          {isOpen && (
            <button
              className="sidebar-close-btn w-8 h-8 rounded-full flex items-center justify-center bg-white/5 border border-white/12 text-white/60 text-[0.95rem] cursor-pointer outline-none transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-white/12 hover:text-white hover:border-white/25 active:scale-90 flex-shrink-0"
              onClick={onClose}
              aria-label="Close Sidebar"
            >
              ✕
            </button>
          )}
        </div>

        {/* Scrollable Container (from menu items to settings and signed in user) */}
        <div className="flex-1 overflow-y-auto pr-1.5 -mr-1.5 flex flex-col gap-6 fqz-sidebar-scroll">
          {/* Menu Items */}
          <div className="flex flex-col gap-2.5">
            {mainItems.map((item) => {
              const isPlayable = item.status === "playable";
              const isActive = location.pathname === item.path;

              return (
                <div
                  key={item.id}
                  className={`sidebar-menu-item flex items-center justify-between pl-4 pr-[1.1rem] py-3 border-l-2 transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                    isActive
                      ? "border-l-indigo-500 bg-indigo-500/10 text-indigo-400"
                      : "border-l-transparent text-white/80"
                  } ${
                    !isPlayable
                      ? "opacity-45 cursor-not-allowed"
                      : "cursor-pointer hover:bg-white/[0.04] hover:text-white"
                  }`}
                  onClick={() => {
                    if (isPlayable) {
                      navigate(item.path);
                      onClose();
                    }
                  }}
                >
                  <div className="sidebar-item-inner flex items-center gap-3">
                    <span className={`text-[1.1rem] flex items-center justify-center flex-shrink-0 ${isActive ? "text-indigo-400" : "text-white/70"}`}>
                      {iconFor(item.id)}
                    </span>
                    <span
                      className={`sidebar-text-label text-[0.88rem] font-bold transition-colors duration-200 whitespace-nowrap ${isActive ? "text-white font-extrabold" : "text-white/85"}`}
                    >
                      {item.title}
                    </span>
                  </div>
                  <span className="sidebar-text-label text-[0.85rem] text-white/50">
                    {isPlayable ? (isActive ? "⚡" : "▶") : "🔒"}
                  </span>
                </div>
              );
            })}

            <button
              onClick={() => setGamesExpanded(!gamesExpanded)}
              className={`sidebar-menu-item text-[0.72rem] font-extrabold uppercase tracking-widest mt-4 mb-1 pl-3.5 flex items-center justify-between select-none bg-transparent border-none cursor-pointer w-full text-left outline-none transition-colors duration-200 ${
                gamesExpanded ? "text-indigo-400" : "text-white/30 hover:text-white/60"
              }`}
            >
              <div className="sidebar-item-inner flex items-center gap-1.5">
                <span className="sidebar-text-label flex-shrink-0">🎮</span>
                <span className="sidebar-text-label whitespace-nowrap">Games</span>
              </div>
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 flex-shrink-0 ${
                  gamesExpanded ? "rotate-0 text-indigo-400" : "-rotate-90 text-white/55"
                }`}
              />
            </button>

            <div
              className={`sidebar-dropdown-wrapper ${
                gamesExpanded ? "expanded" : "pointer-events-none"
              }`}
            >
              <div className="sidebar-dropdown-content flex flex-col gap-2.5">
                {gameItems.map((item) => {
                  const isPlayable = item.status === "playable";
                  const isActive = location.pathname === item.path;

                  return (
                    <div
                      key={item.id}
                      className={`sidebar-menu-item flex items-center justify-between pl-4 pr-[1.1rem] py-3 border-l-2 transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                        isActive
                          ? "border-l-indigo-500 bg-indigo-500/10 text-indigo-400"
                          : "border-l-transparent text-white/80"
                      } ${
                        !isPlayable
                          ? "opacity-45 cursor-not-allowed"
                          : "cursor-pointer hover:bg-white/[0.04] hover:text-white"
                      }`}
                      onClick={() => {
                        if (isPlayable) {
                          navigate(item.path);
                          onClose();
                        }
                      }}
                    >
                      <div className="sidebar-item-inner flex items-center gap-3">
                        <span className={`text-[1.1rem] flex items-center justify-center flex-shrink-0 ${isActive ? "text-indigo-400" : "text-white/70"}`}>
                          {iconFor(item.id)}
                        </span>
                        <span
                          className={`sidebar-text-label text-[0.88rem] font-bold transition-colors duration-200 whitespace-nowrap ${isActive ? "text-white font-extrabold" : "text-white/85"}`}
                        >
                          {item.title}
                        </span>
                      </div>
                      <span className="sidebar-text-label text-[0.85rem] text-white/50">
                        {isPlayable ? (isActive ? "⚡" : "▶") : "🔒"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom: Auth and Settings */}
          <div className="mt-auto flex flex-col gap-4">
            {/* Auth Section */}
            <div className="border-t border-white/8 pt-4 flex flex-col gap-3">
              {user ? (
                <>
                  {/* Logged In Info */}
                  <div className={`flex items-center rounded-xl transition-all duration-200 ${
                    isOpen 
                      ? "bg-white/[0.02] border border-white/5 justify-start gap-3 px-3 py-1.5" 
                      : "bg-transparent border-transparent justify-center gap-0 px-0 py-0"
                  }`}>
                    <div className="w-8 h-8 rounded-full bg-violet-500/10 border border-violet-500/25 flex items-center justify-center text-violet-400 font-bold uppercase text-[0.9rem] flex-shrink-0">
                      {user.username ? user.username[0] : "?"}
                    </div>
                    <div className="sidebar-text-label flex flex-col truncate">
                      <span className="text-[0.72rem] text-white/35 font-bold uppercase tracking-wider">Signed In As</span>
                      <span className="text-[0.85rem] font-extrabold text-white truncate"> {user.username}</span>
                    </div>
                  </div>

                  {/* Profile Link */}
                  <button
                    onClick={() => {
                      navigate("/profile");
                      onClose();
                    }}
                    className={`sidebar-menu-item w-full flex items-center gap-3 pl-4 pr-[1.1rem] py-3 border-l-2 transition-all duration-200 cursor-pointer ${
                      location.pathname === "/profile"
                        ? "border-l-indigo-500 bg-indigo-500/10 text-indigo-400"
                        : "border-l-transparent text-white/80 hover:bg-white/[0.04] hover:text-white"
                    }`}
                  >
                    <User size={18} className={`flex-shrink-0 ${location.pathname === "/profile" ? "text-indigo-400" : "text-white/55"}`} />
                    <span className={`sidebar-text-label text-[0.88rem] font-bold whitespace-nowrap ${location.pathname === "/profile" ? "text-white font-extrabold" : "text-white/70"}`}>
                      Profile
                    </span>
                  </button>

                  {/* Logout Link */}
                  <button
                    onClick={handleLogout}
                    className="sidebar-menu-item w-full flex items-center gap-3 pl-4 pr-[1.1rem] py-3 border-l-2 border-l-transparent text-red-400/80 hover:bg-red-500/10 hover:text-red-400 cursor-pointer transition-all duration-200"
                  >
                    <LogOut size={18} className="flex-shrink-0" />
                    <span className="sidebar-text-label text-[0.88rem] font-bold whitespace-nowrap">Logout</span>
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
                    className={`sidebar-menu-item w-full flex items-center gap-3 pl-4 pr-[1.1rem] py-3 border-l-2 transition-all duration-200 cursor-pointer ${
                      location.pathname === "/signin"
                        ? "border-l-indigo-500 bg-indigo-500/10 text-indigo-400"
                        : "border-l-transparent text-white/80 hover:bg-white/[0.04] hover:text-white"
                    }`}
                  >
                    <LogIn size={18} className={`flex-shrink-0 ${location.pathname === "/signin" ? "text-indigo-400" : "text-white/55"}`} />
                    <span className="sidebar-text-label text-[0.88rem] font-bold text-white/70 whitespace-nowrap">Sign In</span>
                  </button>
                </>
              )}
            </div>

            {/* Settings */}
            <div className="border-t border-white/8 pt-4">
              <button
                onClick={() => { navigate("/settings"); onClose(); }}
                className={`sidebar-menu-item w-full flex items-center gap-3 pl-4 pr-[1.1rem] py-3 border-l-2 transition-all duration-200 cursor-pointer ${
                  location.pathname === "/settings"
                    ? "border-l-indigo-500 bg-indigo-500/10 text-indigo-400"
                    : "border-l-transparent text-white/80 hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                <Settings size={18} className={`flex-shrink-0 ${location.pathname === "/settings" ? "text-indigo-400" : "text-white/55"}`} />
                <span className={`sidebar-text-label text-[0.88rem] font-bold whitespace-nowrap ${location.pathname === "/settings" ? "text-white font-extrabold" : "text-white/70"}`}>
                  Settings
                </span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[99] transition-opacity duration-300 md:hidden ${
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
