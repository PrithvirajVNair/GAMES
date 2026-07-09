import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Flag, MapPinned, Globe, Compass, Ellipse, Eclipse, Ellipsis } from "lucide-react";
import Sidebar from "../components/Sidebar";

const Home = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Drift + subtle mouse influence for background orbs
  const orb1Ref = useRef(null);
  const orb2Ref = useRef(null);
  const rafRef = useRef(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const orb1Cur = useRef({ x: 20, y: 18 });
  const orb2Cur = useRef({ x: 55, y: 58 });

  useEffect(() => {
    const onMove = (e) => {
      mouseRef.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      };
    };
    window.addEventListener("mousemove", onMove);

    const orb1Anchor = { x: 20, y: 18 };
    const orb2Anchor = { x: 55, y: 58 };
    const driftAmt = 3;
    const mouseAmt = 4;
    const speed1 = 0.00018;
    const speed2 = 0.00013;
    const lerpSpeed = 0.025;

    const lerp = (a, b, t) => a + (b - a) * t;
    let startTime = null;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const t = timestamp - startTime;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      const t1x =
        orb1Anchor.x +
        Math.sin(t * speed1) * driftAmt +
        (mx - 0.5) * mouseAmt * 2;
      const t1y =
        orb1Anchor.y +
        Math.cos(t * speed1 * 0.7) * driftAmt +
        (my - 0.5) * mouseAmt * 2;
      orb1Cur.current.x = lerp(orb1Cur.current.x, t1x, lerpSpeed);
      orb1Cur.current.y = lerp(orb1Cur.current.y, t1y, lerpSpeed);

      const t2x =
        orb2Anchor.x +
        Math.sin(t * speed2 + 2) * driftAmt -
        (mx - 0.5) * mouseAmt * 2;
      const t2y =
        orb2Anchor.y +
        Math.cos(t * speed2 * 0.8 + 1) * driftAmt -
        (my - 0.5) * mouseAmt * 2;
      orb2Cur.current.x = lerp(orb2Cur.current.x, t2x, lerpSpeed);
      orb2Cur.current.y = lerp(orb2Cur.current.y, t2y, lerpSpeed);

      if (orb1Ref.current) {
        orb1Ref.current.style.left = `${orb1Cur.current.x}%`;
        orb1Ref.current.style.top = `${orb1Cur.current.y}%`;
      }
      if (orb2Ref.current) {
        orb2Ref.current.style.left = `${orb2Cur.current.x}%`;
        orb2Ref.current.style.top = `${orb2Cur.current.y}%`;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

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

        /* Ambient Glow Orbs */
        .fq-home-orb {
          position: absolute;
          width: clamp(250px, 45vw, 550px);
          height: clamp(250px, 45vw, 550px);
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.15;
          pointer-events: none;
          z-index: 1;
        }
        .fq-home-orb-1 {
          background: radial-gradient(circle, #6366f1, #8b5cf6);
        }
        .fq-home-orb-2 {
          background: radial-gradient(circle, #ec4899, #d946ef);
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
        .fq-home-title {
          font-size: clamp(2.2rem, 6vw, 3.8rem);
          font-weight: 900;
          background: linear-gradient(135deg, #fff 30%, #c7d2fe 70%, #818cf8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0;
          letter-spacing: -1.5px;
          line-height: 1.1;
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
            padding-top: 5rem;
          }
          .fq-home-header {
            margin-bottom: 2.5rem;
          }
          .fq-home-grid {
            gap: 1.5rem;
          }
          .fq-home-card {
            padding: 1.75rem 1.5rem;
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

        {/* Moving Background Orbs */}
        <div ref={orb1Ref} className="fq-home-orb fq-home-orb-1" />
        <div ref={orb2Ref} className="fq-home-orb fq-home-orb-2" />

        {/* Hero Header */}
        <div className="fq-home-header">
          <h1 className="fq-home-title">FQz Games</h1>
          <p className="fq-home-subtitle">
            Fun & challenging games that test your visual memory and knowledge
            of flags and country shapes, etc.
          </p>
        </div>

        {/* Card Grid */}
        <div className="fq-home-grid">
          {/* Card: Flag Quiz */}
          <div
            className="fq-home-card fq-card-flag"
          >
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
            <button className="fq-card-btn" onClick={() => navigate("/flag-quiz")}>Play Flag Quiz ➔</button>
          </div>

          {/* Card: Country Shape Quiz */}
          <div
            className="fq-home-card fq-card-shape"
          >
            <div className="fq-card-icon-wrap">
              <MapPinned size={24} />
            </div>
            <div className="fq-card-body">
              <span className="fq-card-tag">Silhouette Quiz</span>
              <h2 className="fq-card-name">Country Shape Quiz</h2>
              <p className="fq-card-desc">
                Guess countries purely by their border outlines! A spatial test
                using sleek vector silhouettes.
              </p>
            </div>
            <button className="fq-card-btn" onClick={() => navigate("/country-shape-quiz")}>Play Shape Quiz ➔</button>
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
                A new challenge is currently in development. Stay tuned for the
                next release.
              </p>
            </div>
            <button className="fq-card-btn" disabled>
              Locked
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
