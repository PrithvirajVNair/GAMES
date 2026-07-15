import { useState, useEffect } from "react";
import { X, Megaphone, Gamepad2 } from "lucide-react";
import { getLatestAnnouncement } from "../services/announcementService";
import { motion, AnimatePresence } from "framer-motion";

const AnnouncementPopup = () => {
  const [announcement, setAnnouncement] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndCheckAnnouncement = async () => {
      try {
        const latest = await getLatestAnnouncement();
        if (latest) {
          const seenIds = JSON.parse(localStorage.getItem("seen_announcements") || "[]");
          if (!seenIds.includes(latest.id)) {
            setAnnouncement(latest);
            setIsOpen(true);
          }
        }
      } catch (err) {
        console.error("Error in AnnouncementPopup:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAndCheckAnnouncement();
  }, []);

  const handleDismiss = () => {
    if (announcement) {
      const seenIds = JSON.parse(localStorage.getItem("seen_announcements") || "[]");
      if (!seenIds.includes(announcement.id)) {
        seenIds.push(announcement.id);
        localStorage.setItem("seen_announcements", JSON.stringify(seenIds));
      }
    }
    setIsOpen(false);
  };

  if (loading || !announcement || !isOpen) return null;

  const isGameType = announcement.type === "game";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleDismiss}
            className="absolute inset-0 bg-black/70 backdrop-blur-[8px] transition-opacity cursor-pointer"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.9, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 30, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`relative w-full max-w-[460px] bg-[rgba(10,15,30,0.85)] border p-8 rounded-2xl backdrop-blur-[20px] z-10 flex flex-col gap-6 text-center transform transition-all duration-300 max-sm:p-6 ${
              isGameType
                ? "border-violet-500/30 shadow-[0_0_50px_rgba(139,92,246,0.2)]"
                : "border-amber-500/30 shadow-[0_0_50px_rgba(245,158,11,0.2)]"
            }`}
          >
            {/* Close Button */}
            <button
              onClick={handleDismiss}
              className="absolute top-5 right-5 text-white/40 hover:text-white transition-colors cursor-pointer outline-none"
              title="Close"
            >
              <X size={18} />
            </button>

            {/* Icon & Badge */}
            <div className="flex flex-col items-center gap-3">
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center border ${
                  isGameType
                    ? "bg-violet-500/15 border-violet-500/25 text-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.2)]"
                    : "bg-amber-500/15 border-amber-500/25 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                }`}
              >
                {isGameType ? <Gamepad2 size={28} /> : <Megaphone size={28} />}
              </div>
              <span
                className={`text-[0.72rem] font-bold tracking-[1.5px] uppercase ${
                  isGameType ? "text-violet-400" : "text-amber-400"
                }`}
              >
                {isGameType ? "New Game Released!" : "Latest Announcement"}
              </span>
            </div>

            {/* Title & Message */}
            <div className="flex flex-col gap-2.5">
              <h2 className="text-[1.4rem] font-black text-white tracking-tight leading-snug">
                {announcement.title}
              </h2>
              <div className="max-h-[220px] overflow-y-auto pr-1.5 fqz-sidebar-scroll">
                <p className="text-[0.92rem] text-white/70 leading-[1.6] whitespace-pre-line text-center">
                  {announcement.message}
                </p>
              </div>
            </div>

            {/* Action button */}
            <button
              onClick={handleDismiss}
              className={`w-full py-3.5 text-[0.9rem] font-black border-none cursor-pointer rounded-xl text-white transition-all duration-200 hover:-translate-y-px active:scale-[0.98] ${
                isGameType
                  ? "bg-[linear-gradient(135deg,#8b5cf6,#7c3aed)] shadow-[0_4px_18px_rgba(139,92,246,0.3)] hover:shadow-[0_6px_24px_rgba(139,92,246,0.45)]"
                  : "bg-[linear-gradient(135deg,#f59e0b,#d97706)] shadow-[0_4px_18px_rgba(245,158,11,0.3)] hover:shadow-[0_6px_24px_rgba(245,158,11,0.45)]"
              }`}
            >
              {isGameType ? "Let's Play! ➔" : "Awesome, Got it!"}
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AnnouncementPopup;
