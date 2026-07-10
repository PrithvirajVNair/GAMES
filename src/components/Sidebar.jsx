import { Ellipsis, Flag, MapPinned, Home, Gamepad2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: "home", title: "Main Menu", path: "/", status: "playable" },
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
  ];

  const iconFor = (id) => {
    if (id === "home") return <Home />;
    if (id === "flag-quiz") return <Flag />;
    if (id === "country-shape-quiz") return <MapPinned />;
    if (id === "logo-quiz") return <Gamepad2 />;
    return <Ellipsis />;
  };

  return (
    <>
      {/* Sidebar Drawer */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-80 max-sm:w-[280px] bg-[rgba(10,15,30,0.75)] backdrop-blur-[30px] border-r border-white/8 z-[100] flex flex-col gap-8 p-8 max-sm:p-6 transition-transform duration-[350ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
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
             Games Hub
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
        <div className="flex flex-col gap-3">
          {menuItems.map((item) => {
            const isPlayable = item.status === "playable";
            const isActive = location.pathname === item.path;

            return (
              <div
                key={item.id}
                className={`flex items-center justify-between px-[1.1rem] py-4 border-[1.5px] transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] ${
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
                  <span className="text-[1.3rem] text-white">
                    {iconFor(item.id)}
                  </span>
                  <div className="flex flex-col gap-[0.15rem]">
                    <span
                      className={`text-[0.88rem] font-bold transition-colors duration-200 ${isActive ? "text-white" : "text-white/85"}`}
                    >
                      {item.title}
                    </span>
                    {item.desc && (
                      <span className="text-[0.72rem] text-white/40">
                        {item.desc}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-[0.85rem] text-white/50">
                  {isPlayable ? (isActive ? "⚡" : "▶") : "🔒"}
                </span>
              </div>
            );
          })}
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
