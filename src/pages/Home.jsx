import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Flag, MapPinned, Ellipsis } from "lucide-react";
import Sidebar from "../components/Sidebar";

const Home = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <style>{`
        /* Global CSS Reset overrides within page */
        .fq-home-root {
          min-height: 100vh;
          width: 100%;
          background: linear-gradient(135deg, #070b19 0%, #0c1224 50%, #070914 100%);
          color: #fff;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          position: relative;
          overflow-x: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          padding: 6rem 1.5rem 3rem 1.5rem;
          box-sizing: border-box;
        }


        /* Top Header Area */
        .fq-home-header {
          text-align: center;
          margin-bottom: 4rem;
          z-index: 5;
          max-width: 650px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }
        .fq-home-badge {
          background: rgba(99, 102, 241, 0.12);
          border: 1.5px solid rgba(99, 102, 241, 0.25);
          color: #a5b4fc;
          font-size: 0.78rem;
          font-weight: 700;
          padding: 0.35rem 0.95rem;
          border-radius: 999px;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .fq-home-subtitle {
          font-size: clamp(0.9rem, 2.5vw, 1.1rem);
          color: rgba(255, 255, 255, 0.55);
          line-height: 1.6;
          margin: 0;
          font-weight: 400;
        }

        /* Card Layout Grid */
        .fq-home-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 340px));
          gap: 2rem;
          width: 100%;
          max-width: 1100px;
          justify-content: center;
          z-index: 5;
          margin-bottom: 4rem;
        }

        /* Game Option Card */
        .fq-home-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 24px;
          padding: 2.25rem 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          position: relative;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: default;
          overflow: hidden;
        }
        .fq-home-card:hover {
          transform: translateY(-8px);
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.15);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.35);
        }
        /* Color themes for cards */
        .fq-card-flag:hover {
          box-shadow: 0 20px 40px rgba(99, 102, 241, 0.15);
          border-color: rgba(99, 102, 241, 0.3);
        }
        .fq-card-shape:hover {
          box-shadow: 0 20px 40px rgba(167, 139, 250, 0.15);
          border-color: rgba(167, 139, 250, 0.3);
        }
        .fq-card-soon {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .fq-card-soon:hover {
          transform: none;
          background: rgba(255, 255, 255, 0.03);
          border-color: rgba(255, 255, 255, 0.06);
          box-shadow: none;
        }

        /* Card Icon wrapper */
        .fq-card-icon-wrap {
          width: 54px;
          height: 54px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        .fq-card-flag .fq-card-icon-wrap {
          background: rgba(99, 102, 241, 0.15);
          color: #818cf8;
          border: 1px solid rgba(99, 102, 241, 0.25);
        }
        .fq-card-shape .fq-card-icon-wrap {
          background: rgba(167, 139, 250, 0.15);
          color: #a78bfa;
          border: 1px solid rgba(167, 139, 250, 0.25);
        }
        .fq-card-soon .fq-card-icon-wrap {
          background: rgba(255, 255, 255, 0.05);
          color: rgba(255, 255, 255, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        /* Details */
        .fq-card-body {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          flex-grow: 1;
        }
        .fq-card-tag {
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          margin-bottom: 0.25rem;
        }
        .fq-card-flag .fq-card-tag { color: #818cf8; }
        .fq-card-shape .fq-card-tag { color: #a78bfa; }
        .fq-card-soon .fq-card-tag { color: rgba(255, 255, 255, 0.35); }

        .fq-card-name {
          font-size: 1.4rem;
          font-weight: 800;
          margin: 0;
          color: #fff;
        }
        .fq-card-desc {
          font-size: 0.88rem;
          color: rgba(255, 255, 255, 0.45);
          line-height: 1.5;
          margin: 0;
        }

        /* Action Buttons */
        .fq-card-btn {
          width: 100%;
          padding: 0.85rem;
          border-radius: 14px;
          font-size: 0.9rem;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          box-sizing: border-box;
        }
        .fq-card-flag .fq-card-btn {
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          color: #fff;
          box-shadow: 0 4px 18px rgba(99, 102, 241, 0.2);
        }
        .fq-card-flag:hover .fq-card-btn {
          box-shadow: 0 6px 24px rgba(99, 102, 241, 0.4);
          transform: translateY(-1px);
        }
        .fq-card-shape .fq-card-btn {
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
          color: #fff;
          box-shadow: 0 4px 18px rgba(139, 92, 246, 0.2);
        }
        .fq-card-shape:hover .fq-card-btn {
          box-shadow: 0 6px 24px rgba(139, 92, 246, 0.4);
          transform: translateY(-1px);
        }
        .fq-card-soon .fq-card-btn {
          background: rgba(255, 255, 255, 0.04);
          color: rgba(255, 255, 255, 0.35);
          border: 1px solid rgba(255, 255, 255, 0.08);
          cursor: not-allowed;
        }

        /* Sidebar Toggle Button */
        .fq-home-sidebar-toggle {
          position: fixed;
          top: 1.25rem;
          left: 1.25rem;
          z-index: 101;
          background: rgba(255, 255, 255, 0.05);
          border: 1.5px solid rgba(255, 255, 255, 0.12);
          border-radius: 999px;
          padding: 0.5rem 1.1rem;
          font-size: 0.82rem;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          gap: 0.4rem;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }
        .fq-home-sidebar-toggle:hover {
          background: rgba(255, 255, 255, 0.12);
          border-color: rgba(255, 255, 255, 0.25);
          color: #fff;
          transform: translateY(-1px);
        }
        .fq-home-sidebar-toggle.active {
          opacity: 0;
          pointer-events: none;
          transform: scale(0.8);
        }

        /* Footer */
        .fq-home-footer {
          margin-top: auto;
          font-size: 0.78rem;
          color: rgba(255, 255, 255, 0.3);
          text-align: center;
          letter-spacing: 0.5px;
          display: flex;
          gap: 1.5rem;
          flex-wrap: wrap;
          justify-content: center;
        }
        .fq-home-footer-link {
          color: rgba(255, 255, 255, 0.4);
          text-decoration: none;
          transition: color 0.2s ease;
        }
        .fq-home-footer-link:hover {
          color: #a78bfa;
          text-decoration: underline;
        }

        @media (max-width: 480px) {
          .fq-home-sidebar-toggle {
            top: 1rem;
            left: 1rem;
            padding: 0.4rem 0.9rem;
            font-size: 0.76rem;
          }
          .fq-home-root {
            padding: 5rem 1rem 3rem 1rem;
          }
          .fq-home-header {
            margin-bottom: 2.5rem;
          }
          .fq-home-grid {
            grid-template-columns: 1fr;
            gap: 1.25rem;
          }
          .fq-home-card {
            padding: 1.75rem 1.25rem;
          }
        }

        /* Shooting Stars */
        .fq-shooting-star {
          position: absolute;
          left: var(--star-left);
          top: var(--star-top);
          height: 0.8px;
          background: linear-gradient(90deg, #ffffff, rgba(167, 139, 250, 0.4), transparent);
          filter: drop-shadow(0 0 1.5px rgba(255, 255, 255, 0.7));
          opacity: 0;
          transform: rotate(-40deg);
          animation: fq-star-anim 5s linear infinite;
          animation-delay: var(--star-delay);
          transform-origin: left center;
        }

        @keyframes fq-star-anim {
          0% {
            width: 0;
            transform: translate3d(0, 0, 0) rotate(-40deg);
            opacity: 0;
          }
          10% {
            width: 30px;
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            width: 0;
            transform: translate3d(-260px, 220px, 0) rotate(-40deg);
            opacity: 0;
          }
        }

        @media (max-width: 768px) {
          @keyframes fq-star-anim {
            0% {
              width: 0;
              transform: translate3d(0, 0, 0) rotate(-40deg);
              opacity: 0;
            }
            10% {
              width: 20px;
              opacity: 1;
            }
            90% {
              opacity: 1;
            }
            100% {
              width: 0;
              transform: translate3d(-130px, 110px, 0) rotate(-40deg);
              opacity: 0;
            }
          }
        }
      `}</style>

      <div className="fq-home-root">
        {/* Toggle Button */}
        <button
          className={`fq-home-sidebar-toggle ${sidebarOpen ? "active" : ""}`}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          title="Toggle Menu"
        >
          {sidebarOpen ? "✕ Close" : "🎮 Games"}
        </button>

        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />


        {/* Shooting Stars (restricted height to keep stars above card grid) */}
        <div className="absolute top-0 left-0 right-0 h-[142px] md:h-[360px] overflow-hidden pointer-events-none z-0">
          {/* Left Side Stars */}
          <div className="fq-shooting-star" style={{ "--star-left": "15%", "--star-top": "-10%", "--star-delay": "0s" }} />
          <div className="fq-shooting-star" style={{ "--star-left": "30%", "--star-top": "-5%", "--star-delay": "1.8s" }} />
          <div className="fq-shooting-star" style={{ "--star-left": "45%", "--star-top": "10%", "--star-delay": "3.5s" }} />
          <div className="fq-shooting-star" style={{ "--star-left": "20%", "--star-top": "25%", "--star-delay": "0.8s" }} />
          <div className="fq-shooting-star" style={{ "--star-left": "35%", "--star-top": "15%", "--star-delay": "2.7s" }} />
          <div className="fq-shooting-star" style={{ "--star-left": "50%", "--star-top": "-10%", "--star-delay": "4.8s" }} />

          {/* Right Side Stars */}
          <div className="fq-shooting-star" style={{ "--star-left": "65%", "--star-top": "10%", "--star-delay": "1.2s" }} />
          <div className="fq-shooting-star" style={{ "--star-left": "80%", "--star-top": "-5%", "--star-delay": "2.2s" }} />
          <div className="fq-shooting-star" style={{ "--star-left": "95%", "--star-top": "20%", "--star-delay": "0.5s" }} />
          <div className="fq-shooting-star" style={{ "--star-left": "70%", "--star-top": "25%", "--star-delay": "3.9s" }} />
          <div className="fq-shooting-star" style={{ "--star-left": "85%", "--star-top": "15%", "--star-delay": "1.6s" }} />
          <div className="fq-shooting-star" style={{ "--star-left": "90%", "--star-top": "-10%", "--star-delay": "4.1s" }} />
        </div>

        <div className="flex flex-col justify-center items-center gap-12 md:gap-20 w-full max-w-7xl mx-auto px-2">
          {/* Hero Header */}
          <div className="text-center max-w-none px-4 flex flex-col items-center w-full">
            <div className="relative w-full max-w-[1200px] h-[clamp(55px,15vw,150px)] mx-auto flex items-center justify-center select-none">
              <svg viewBox="0 0 1200 200" className="w-full h-full">
                <defs>
                  <clipPath id="title-clip">
                    <text
                      x="50%"
                      y="58%"
                      dominantBaseline="middle"
                      textAnchor="middle"
                      fontSize="200"
                      fontWeight="500"
                      className="bebas-neue tracking-wide"
                    >
                      FQz Games
                    </text>
                  </clipPath>
                </defs>
                <foreignObject x="0" y="0" width="1200" height="200" clipPath="url(#title-clip)" className="w-full h-full">
                  <div className="w-full h-full bg-[linear-gradient(135deg,#fff_30%,#c7d2fe_70%,#818cf8_100%)] relative">
                    <video
                      className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                      src="/title.webm"
                      autoPlay
                      loop
                      muted
                      playsInline
                    />
                  </div>
                </foreignObject>
              </svg>
            </div>
            <p className="text-center font-medium text-sm sm:text-base md:text-lg text-white/70 mt-4 md:mt-6 leading-relaxed max-w-xl">
              Fun & challenging games that test your visual memory and knowledge
              of flags and country shapes.
            </p>
          </div>

          {/* Card Grid */}
          <div className="fq-home-grid">
            {/* Card: Flag Quiz */}
            <div className="fq-home-card fq-card-flag">
              <div className="fq-card-icon-wrap">
                <Flag size={24} />
              </div>
              <div className="fq-card-body">
                <span className="fq-card-tag">Interactive Quiz</span>
                <h2 className="fq-card-name">Flag Quiz</h2>
                <p className="fq-card-desc">
                  Identify all 196 flags of the world. Race against the timer,
                  reveal length tips, and aim for a perfect streak.
                </p>
              </div>
              <button
                className="fq-card-btn"
                onClick={() => navigate("/flag-quiz")}
              >
                Play Flag Quiz ➔
              </button>
            </div>

            {/* Card: Country Shape Quiz */}
            <div className="fq-home-card fq-card-shape">
              <div className="fq-card-icon-wrap">
                <MapPinned size={24} />
              </div>
              <div className="fq-card-body">
                <span className="fq-card-tag">Silhouette Quiz</span>
                <h2 className="fq-card-name">Country Shape Quiz</h2>
                <p className="fq-card-desc">
                  Guess countries purely by their border outlines! A spatial
                  test using sleek vector silhouettes.
                </p>
              </div>
              <button
                className="fq-card-btn"
                onClick={() => navigate("/country-shape-quiz")}
              >
                Play Shape Quiz ➔
              </button>
            </div>

            {/* Card: Map Location Quiz (Soon) */}
            <div className="fq-home-card fq-card-soon">
              <div className="fq-card-icon-wrap">
                <Ellipsis size={24} />
              </div>
              <div className="fq-card-body">
                <span className="fq-card-tag">Coming Soon</span>
                <h2 className="fq-card-name">New Game</h2>
                <p className="fq-card-desc">
                  A new challenge is currently in development. Stay tuned for
                  the next release.
                </p>
              </div>
              <button className="fq-card-btn" disabled>
                Locked
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
