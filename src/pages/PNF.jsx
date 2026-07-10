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
      mouseRef.current = {
        x: e.clientX / window.innerWidth - 0.5,
        y: e.clientY / window.innerHeight - 0.5,
      };
    };
    window.addEventListener("mousemove", handleMouseMove);

    let rafId;
    const updateParallax = () => {
      const { x: tx, y: ty } = mouseRef.current;
      const lerp = (s, e, a) => s + (e - s) * a;

      orb1Pos.current.x = lerp(orb1Pos.current.x, tx * -60, 0.05);
      orb1Pos.current.y = lerp(orb1Pos.current.y, ty * -60, 0.05);
      orb2Pos.current.x = lerp(orb2Pos.current.x, tx * 80, 0.04);
      orb2Pos.current.y = lerp(orb2Pos.current.y, ty * 80, 0.04);
      cardPos.current.x = lerp(cardPos.current.x, tx * 25, 0.08);
      cardPos.current.y = lerp(cardPos.current.y, ty * 25, 0.08);
      starfieldPos.current.x = lerp(starfieldPos.current.x, tx * 15, 0.06);
      starfieldPos.current.y = lerp(starfieldPos.current.y, ty * 15, 0.06);

      if (orb1Ref.current)
        orb1Ref.current.style.transform = `translate(${orb1Pos.current.x}px, ${orb1Pos.current.y}px)`;
      if (orb2Ref.current)
        orb2Ref.current.style.transform = `translate(${orb2Pos.current.x}px, ${orb2Pos.current.y}px)`;
      if (starfieldRef.current)
        starfieldRef.current.style.transform = `translate(${starfieldPos.current.x}px, ${starfieldPos.current.y}px)`;
      if (cardRef.current) {
        const rx = cardPos.current.y * -0.6;
        const ry = cardPos.current.x * 0.6;
        cardRef.current.style.transform = `translate(${cardPos.current.x}px, ${cardPos.current.y}px) rotateX(${rx}deg) rotateY(${ry}deg)`;
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_center,#0f172a_0%,#090d16_100%)] flex items-center justify-center p-6 relative overflow-hidden perspective-[1000px]">
      {/* Glow Orbs */}
      <div
        ref={orb1Ref}
        className="absolute w-[450px] h-[450px] rounded-full blur-[80px] pointer-events-none z-0 opacity-60 top-[15%] left-[10%] bg-[radial-gradient(circle,rgba(99,102,241,0.15)_0%,transparent_70%)]"
        style={{ willChange: "transform" }}
      />
      <div
        ref={orb2Ref}
        className="absolute w-[500px] h-[500px] rounded-full blur-[80px] pointer-events-none z-0 opacity-60 bottom-[10%] right-[15%] bg-[radial-gradient(circle,rgba(236,72,153,0.1)_0%,transparent_70%)]"
        style={{ willChange: "transform" }}
      />

      {/* Star Field */}
      <div
        ref={starfieldRef}
        className="absolute z-[1] pointer-events-none"
        style={{ inset: "-50px", willChange: "transform" }}
      >
        {STARS_DATA.map((s) => (
          <div
            key={s.id}
            className="pnf-star"
            style={{
              top: s.top,
              left: s.left,
              width: `${s.size}px`,
              height: `${s.size}px`,
              animationDelay: s.animationDelay,
            }}
          />
        ))}
      </div>

      {/* 3D Card */}
      <div
        ref={cardRef}
        className="relative z-10"
        style={{ transformStyle: "preserve-3d", willChange: "transform" }}
      >
        <div className="w-full max-w-[480px] bg-white/[0.03] border border-white/8 rounded-[24px] p-12 px-8 backdrop-blur-[25px] shadow-[0_30px_60px_rgba(0,0,0,0.6),0_0_100px_rgba(99,102,241,0.15)] flex flex-col items-center text-center gap-7">
          {/* Compass */}
          <div className="relative w-20 h-20 flex items-center justify-center bg-white/[0.03] border-[1.5px] border-white/10 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.3)] animate-float-sm">
            <Compass
              size={40}
              className="text-violet-500 animate-spin-slow"
              style={{ filter: "drop-shadow(0 0 12px rgba(139,92,246,0.6))" }}
            />
          </div>

          {/* 404 */}
          <div
            className="text-[6rem] font-black leading-none tracking-[-2px] bg-[linear-gradient(135deg,#a78bfa_0%,#6366f1_50%,#ec4899_100%)] bg-clip-text text-transparent"
            style={{ filter: "drop-shadow(0 0 20px rgba(99,102,241,0.3))" }}
          >
            404
          </div>

          <h2 className="text-[1.5rem] font-extrabold text-white tracking-tight leading-[1.3]">
            This region is still unexplored.
          </h2>

          <p className="text-[0.95rem] text-white/50 leading-[1.6] max-w-[340px]">
            You've drifted off the map. Turn back or continue your adventure
            from home.
          </p>

          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-8 py-[0.85rem] bg-[linear-gradient(135deg,#6366f1_0%,#8b5cf6_100%)] text-white text-[0.95rem] font-bold rounded-[14px] border-none cursor-pointer shadow-[0_4px_20px_rgba(99,102,241,0.4)] transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(99,102,241,0.6)] active:scale-[0.97]"
          >
            <ArrowLeft size={18} />
            Go Back Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default PNF;
