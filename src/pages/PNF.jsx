import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Compass, ArrowLeft } from "lucide-react";

const STARS_DATA = Array.from({ length: 60 }).map((_, i) => ({
  id: i,
  top: `${Math.random() * 100}%`,
  left: `${Math.random() * 100}%`,
  size: Math.random() * 2 + 1,
  opacity: Math.random() * 0.6 + 0.4,
  animationDelay: `${Math.random() * 3}s`,
}));

const PNF = () => {
  const navigate = useNavigate();

  const mouseRef = useRef({ x: 0, y: 0 });
  const orb1Ref = useRef(null);
  const orb2Ref = useRef(null);
  const cardRef = useRef(null);
  const starfieldRef = useRef(null);

  const orb1Pos = useRef({ x: 0, y: 0 });
  const orb2Pos = useRef({ x: 0, y: 0 });
  const cardPos = useRef({ x: 0, y: 0 });
  const starfieldPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      const { innerWidth, innerHeight } = window;
      mouseRef.current = {
        x: e.clientX / innerWidth - 0.5,
        y: e.clientY / innerHeight - 0.5,
      };
    };

    window.addEventListener("mousemove", handleMouseMove);

    let rafId;
    const updateParallax = () => {
      const targetX = mouseRef.current.x;
      const targetY = mouseRef.current.y;

      const lerp = (start, end, amt) => start + (end - start) * amt;

      // Smooth positions
      orb1Pos.current.x = lerp(orb1Pos.current.x, targetX * -60, 0.05);
      orb1Pos.current.y = lerp(orb1Pos.current.y, targetY * -60, 0.05);

      orb2Pos.current.x = lerp(orb2Pos.current.x, targetX * 80, 0.04);
      orb2Pos.current.y = lerp(orb2Pos.current.y, targetY * 80, 0.04);

      cardPos.current.x = lerp(cardPos.current.x, targetX * 25, 0.08);
      cardPos.current.y = lerp(cardPos.current.y, targetY * 25, 0.08); 

      starfieldPos.current.x = lerp(starfieldPos.current.x, targetX * 15, 0.06);
      starfieldPos.current.y = lerp(starfieldPos.current.y, targetY * 15, 0.06);

      if (orb1Ref.current) {
        orb1Ref.current.style.transform = `translate(${orb1Pos.current.x}px, ${orb1Pos.current.y}px)`;
      }
      if (orb2Ref.current) {
        orb2Ref.current.style.transform = `translate(${orb2Pos.current.x}px, ${orb2Pos.current.y}px)`;
      }
      if (starfieldRef.current) {
        starfieldRef.current.style.transform = `translate(${starfieldPos.current.x}px, ${starfieldPos.current.y}px)`;
      }
      if (cardRef.current) {
        // Tilt effect
        const rotateX = cardPos.current.y * -0.6;
        const rotateY = cardPos.current.x * 0.6;
        cardRef.current.style.transform = `translate(${cardPos.current.x}px, ${cardPos.current.y}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      }

      rafId = requestAnimationFrame(updateParallax);
    };

    rafId = requestAnimationFrame(updateParallax);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, []);



  return (
    <>
      <style>{`
        .pnf-root {
          min-height: 100vh;
          background: radial-gradient(circle at center, #0f172a 0%, #090d16 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          position: relative;
          overflow: hidden;
          perspective: 1000px;
        }

        /* Large glowing background blobs */
        .pnf-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          z-index: 0;
          will-change: transform;
          opacity: 0.6;
        }
        .pnf-orb-1 {
          width: 450px;
          height: 450px;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
          top: 15%;
          left: 10%;
        }
        .pnf-orb-2 {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(236, 72, 153, 0.1) 0%, transparent 70%);
          bottom: 10%;
          right: 15%;
        }

        /* Twinkling star field */
        .pnf-starfield {
          position: absolute;
          inset: -50px;
          pointer-events: none;
          z-index: 1;
          will-change: transform;
        }
        .pnf-star {
          position: absolute;
          background: #fff;
          border-radius: 50%;
          animation: pnf-twinkle 3s infinite ease-in-out;
        }
        @keyframes pnf-twinkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }

        /* 3D Glass Card */
        .pnf-card-wrapper {
          position: relative;
          z-index: 10;
          transform-style: preserve-3d;
          will-change: transform;
        }
        .pnf-card {
          width: 100%;
          max-width: 480px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px;
          padding: 3rem 2rem;
          backdrop-filter: blur(25px);
          -webkit-backdrop-filter: blur(25px);
          box-shadow: 
            0 30px 60px rgba(0, 0, 0, 0.6),
            0 0 100px rgba(99, 102, 241, 0.15);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 1.75rem;
        }

        /* Rotating compass */
        .pnf-compass-container {
          position: relative;
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.03);
          border: 1.5px solid rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          animation: floatCompass 4s ease-in-out infinite;
        }
        @keyframes floatCompass {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .pnf-compass {
          color: #8b5cf6;
          filter: drop-shadow(0 0 12px rgba(139, 92, 246, 0.6));
          animation: spinCompass 25s linear infinite;
        }
        @keyframes spinCompass {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Giant 404 text */
        .pnf-code {
          font-size: 6rem;
          font-weight: 900;
          line-height: 1;
          letter-spacing: -2px;
          background: linear-gradient(135deg, #a78bfa 0%, #6366f1 50%, #ec4899 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          position: relative;
          filter: drop-shadow(0 0 20px rgba(99, 102, 241, 0.3));
        }

        .pnf-title {
          font-size: 1.5rem;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.5px;
          line-height: 1.3;
        }

        .pnf-desc {
          font-size: 0.95rem;
          color: rgba(255, 255, 255, 0.5);
          line-height: 1.6;
          max-width: 340px;
        }

        /* Premium button styling */
        .pnf-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.85rem 2rem;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: #fff;
          font-size: 0.95rem;
          font-weight: 700;
          border-radius: 14px;
          border: none;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
          text-decoration: none;
        }
        .pnf-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(99, 102, 241, 0.6);
        }
        .pnf-btn:active {
          transform: scale(0.97);
        }
      `}</style>

      <div className="pnf-root">
        {/* Glow Orbs */}
        <div ref={orb1Ref} className="pnf-orb pnf-orb-1" />
        <div ref={orb2Ref} className="pnf-orb pnf-orb-2" />

        {/* Twinkling Parallax Star Field */}
        <div ref={starfieldRef} className="pnf-starfield">
          {STARS_DATA.map((star) => (
            <div
              key={star.id}
              className="pnf-star"
              style={{
                top: star.top,
                left: star.left,
                width: `${star.size}px`,
                height: `${star.size}px`,
                animationDelay: star.animationDelay,
              }}
            />
          ))}
        </div>

        {/* 3D Interactive Card */}
        <div ref={cardRef} className="pnf-card-wrapper">
          <div className="pnf-card">
            <div className="pnf-compass-container">
              <Compass size={40} className="pnf-compass" />
            </div>

            <div className="pnf-code">404</div>

            <h2 className="pnf-title">This region is still unexplored.</h2>

            <p className="pnf-desc">
              You've drifted off the map. Turn back or continue your adventure from home.
            </p>

            <button onClick={() => navigate("/")} className="pnf-btn">
              <ArrowLeft size={18} />
              Go Back Home
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PNF;