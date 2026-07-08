import { Ellipsis, Flag } from "lucide-react";
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      id: "flag-quiz",
      title: "Flag Quiz",
      path: "/",
      status: "playable",
      // desc: "Identify 196 world flags",
    },
    {
      id: "capitals-quiz",
      title: "Coming Soon",
      path: "/capitals-quiz",
      status: "coming-soon",
      // desc: "Match capitals of the world",
    },
    {
      id: "map-quiz",
      title: "Coming Soon",
      path: "/map-quiz",
      status: "coming-soon",
      // desc: "Locate countries on a map",
    },
  ];

  return (
    <>
      <style>{`
        /* Sidebar Drawer Styling */
        .fq-sidebar {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: 320px;
          background: rgba(10, 15, 30, 0.75);
          backdrop-filter: blur(30px);
          -webkit-backdrop-filter: blur(30px);
          border-right: 1px solid rgba(255, 255, 255, 0.08);
          z-index: 100;
          transform: translateX(-100%);
          transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          padding: 2rem 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .fq-sidebar.open {
          transform: translateX(0);
          box-shadow: 20px 0 80px rgba(0, 0, 0, 0.6);
        }
        
        .fq-sidebar-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(2px);
          -webkit-backdrop-filter: blur(2px);
          z-index: 99;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s ease;
        }
        .fq-sidebar-backdrop.visible {
          opacity: 1;
          pointer-events: auto;
        }

        .fq-sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 1rem;
        }

        .fq-sidebar-title {
          font-size: 1.3rem;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.5px;
          background: linear-gradient(90deg, #a78bfa, #60a5fa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .fq-sidebar-close-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: rgba(255, 255, 255, 0.6);
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 0.95rem;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          outline: none;
        }

        .fq-sidebar-close-btn:hover {
          background: rgba(255, 255, 255, 0.12);
          color: #fff;
          border-color: rgba(255, 255, 255, 0.25);
        }

        .fq-sidebar-close-btn:active {
          transform: scale(0.9);
        }

        .fq-sidebar-list {
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
        }

        .fq-sidebar-item {
          background: rgba(255, 255, 255, 0.03);
          border: 1.5px solid rgba(255, 255, 255, 0.08);
          border-radius: 14px;
          padding: 1rem 1.1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .fq-sidebar-item:hover:not(.disabled) {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.18);
          transform: translateY(-1px);
        }

        .fq-sidebar-item.active {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%);
          border-color: rgba(99, 102, 241, 0.4);
          box-shadow: 0 4px 15px rgba(99, 102, 241, 0.15);
        }

        .fq-sidebar-item.disabled {
          opacity: 0.45;
        }

        .fq-sidebar-item-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .fq-sidebar-item-icon {
          font-size: 1.3rem;
        }

        .fq-sidebar-item-details {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }

        .fq-sidebar-item-name {
          font-size: 0.88rem;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.85);
          transition: color 0.2s;
        }
        .fq-sidebar-item.active .fq-sidebar-item-name {
          color: #fff;
        }

        .fq-sidebar-item-desc {
          font-size: 0.72rem;
          color: rgba(255, 255, 255, 0.4);
        }

        .fq-sidebar-item-right {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.5);
        }

        @media (max-width: 480px) {
          .fq-sidebar {
            width: 280px;
            padding: 1.5rem 1.25rem;
          }
        }
      `}</style>

      <div className={`fq-sidebar ${isOpen ? "open" : ""}`}>
        <div className="fq-sidebar-header">
          <span className="fq-sidebar-title">🎮 Games Hub</span>
          <button className="fq-sidebar-close-btn" onClick={onClose} aria-label="Close Sidebar">✕</button>
        </div>
        
        <div className="fq-sidebar-list">
          {menuItems.map((item) => {
            const isPlayable = item.status === "playable";
            const isActive = location.pathname === item.path || (item.path === "/flag-quiz" && location.pathname === "/");
            
            return (
              <div
                key={item.id}
                className={`fq-sidebar-item ${isActive ? "active" : ""} ${!isPlayable ? "disabled" : ""}`}
                onClick={() => {
                  if (isPlayable) {
                    navigate(item.path);
                    onClose();
                  }
                }}
                style={{ cursor: isPlayable ? "pointer" : "not-allowed" }}
              >
                <div className="fq-sidebar-item-left">
                  <span className="fq-sidebar-item-icon text-white">
                    {item.id === "flag-quiz" ? <Flag /> : item.id === "capitals-quiz" ? <Ellipsis /> : <Ellipsis />}
                  </span>
                  <div className="fq-sidebar-item-details">
                    <span className="fq-sidebar-item-name">
                      {item.title}
                    </span>
                    {item.desc && (
                      <span className="fq-sidebar-item-desc">
                        {item.desc}
                      </span>
                    )}
                  </div>
                </div>
                <div className="fq-sidebar-item-right">
                  {isPlayable ? (
                    isActive ? "⚡" : "▶"
                  ) : (
                    "🔒"
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div
        className={`fq-sidebar-backdrop ${isOpen ? "visible" : ""}`}
        onClick={onClose}
      />
    </>
  );
};

export default Sidebar;
