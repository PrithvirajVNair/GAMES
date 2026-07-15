import { useState, useEffect } from "react";
import { X, Megaphone, Gamepad2, Plus, Trash2, Calendar } from "lucide-react";
import { getAnnouncements, createAnnouncement, deleteAnnouncement } from "../services/announcementService";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

const AdminAnnouncementModal = ({ isOpen, onClose }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("news");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchList = async () => {
    setLoading(true);
    try {
      const list = await getAnnouncements();
      setAnnouncements(list);
    } catch (err) {
      toast.error("Failed to load announcements: " + err.message, { theme: "dark" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        fetchList();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast.error("Please enter a title and message", { theme: "dark" });
      return;
    }

    setSubmitting(true);
    try {
      await createAnnouncement({
        title: title.trim(),
        message: message.trim(),
        type,
      });
      toast.success("Announcement published!", { theme: "dark" });
      setTitle("");
      setMessage("");
      setType("news");
      fetchList();
    } catch (err) {
      toast.error("Failed to publish: " + err.message, { theme: "dark" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this announcement? This will remove it from the home page popup for all users.")) {
      return;
    }

    try {
      await deleteAnnouncement(id);
      toast.success("Announcement deleted", { theme: "dark" });
      fetchList();
    } catch (err) {
      toast.error("Failed to delete: " + err.message, { theme: "dark" });
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/75 backdrop-blur-[6px]"
          onClick={onClose}
        />

        {/* Modal Box */}
        <motion.div
          initial={{ scale: 0.95, y: 15, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 15, opacity: 0 }}
          className="relative w-full max-w-[620px] bg-[rgba(10,15,30,0.92)] border border-white/12 p-8 rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] backdrop-blur-[20px] z-10 flex flex-col gap-6 text-left max-h-[85vh] overflow-y-auto fqz-sidebar-scroll max-sm:p-6"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-white/40 hover:text-white transition-colors cursor-pointer outline-none"
          >
            <X size={18} />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 border-b border-white/8 pb-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-indigo-500/15 border border-indigo-500/25 text-indigo-400">
              <Megaphone size={20} />
            </div>
            <div>
              <h2 className="text-[1.2rem] font-extrabold text-white tracking-tight leading-tight">
                Manage Announcements
              </h2>
              <p className="text-[0.74rem] text-white/45 mt-0.5">
                Publish popups on the home screen. Only pals234.pvr@gmail.com can access this panel.
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <h3 className="text-sm font-bold text-white/80 flex items-center gap-1.5">
              <Plus size={16} className="text-indigo-400" /> Create New Announcement
            </h3>

            <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
              {/* Title */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.72rem] font-bold text-white/45 uppercase tracking-wider">
                  Title
                </label>
                <input
                  type="text"
                  className="w-full bg-white/6 border border-white/12 rounded-xl px-4 py-2.5 text-[0.85rem] text-white outline-none transition-all duration-200 placeholder:text-white/20 focus:border-indigo-500/60 focus:bg-indigo-500/8"
                  placeholder="e.g., Hangman Game is Live!"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={submitting}
                  required
                />
              </div>

              {/* Type Selection */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.72rem] font-bold text-white/45 uppercase tracking-wider">
                  Notification Type
                </label>
                <select
                  className="w-full bg-white/6 border border-white/12 rounded-xl px-4 py-2.5 text-[0.85rem] text-white outline-none transition-all duration-200 focus:border-indigo-500/60 focus:bg-indigo-500/8"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  disabled={submitting}
                >
                  <option value="news" className="bg-[#0b0f1e] text-white">General News</option>
                  <option value="game" className="bg-[#0b0f1e] text-white">New Game Added</option>
                </select>
              </div>
            </div>

            {/* Message */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.72rem] font-bold text-white/45 uppercase tracking-wider">
                Message Content
              </label>
              <textarea
                className="w-full bg-white/6 border border-white/12 rounded-xl px-4 py-2.5 text-[0.85rem] text-white outline-none transition-all duration-200 placeholder:text-white/20 focus:border-indigo-500/60 focus:bg-indigo-500/8 min-h-[90px] resize-y"
                placeholder="Write announcement details here. You can use multiple lines..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={submitting}
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 mt-1 text-[0.85rem] font-bold border-none cursor-pointer bg-[linear-gradient(135deg,#6366f1,#8b5cf6)] text-white shadow-[0_4px_18px_rgba(99,102,241,0.3)] transition-all duration-200 hover:shadow-[0_6px_24px_rgba(99,102,241,0.45)] hover:-translate-y-px active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Publishing..." : "Publish Announcement"}
            </button>
          </form>

          {/* Past Announcements */}
          <div className="flex flex-col gap-3.5 border-t border-white/8 pt-5">
            <h3 className="text-sm font-bold text-white/80">
              Published History ({announcements.length})
            </h3>

            {loading ? (
              <p className="text-xs text-white/35 text-center py-4">Loading history...</p>
            ) : announcements.length === 0 ? (
              <p className="text-xs text-white/35 text-center py-4">No announcements published yet.</p>
            ) : (
              <div className="flex flex-col gap-3 max-h-[220px] overflow-y-auto pr-1.5 fqz-sidebar-scroll">
                {announcements.map((ann) => {
                  const isGame = ann.type === "game";
                  const dateStr = new Date(ann.created_at).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });

                  return (
                    <div
                      key={ann.id}
                      className={`flex items-start justify-between gap-4 p-4 rounded-xl border bg-white/[0.02] ${
                        isGame ? "border-violet-500/15" : "border-amber-500/15"
                      }`}
                    >
                      <div className="flex gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 ${
                            isGame ? "bg-violet-500/10 text-violet-400" : "bg-amber-500/10 text-amber-400"
                          }`}
                        >
                          {isGame ? <Gamepad2 size={15} /> : <Megaphone size={15} />}
                        </div>
                        <div className="flex flex-col gap-0.5 text-left">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white leading-tight">
                              {ann.title}
                            </span>
                            <span
                              className={`text-[0.62rem] px-1.5 py-0.5 rounded font-black tracking-wider uppercase ${
                                isGame ? "bg-violet-500/15 text-violet-400" : "bg-amber-500/15 text-amber-400"
                              }`}
                            >
                              {ann.type}
                            </span>
                          </div>
                          <span className="text-[0.68rem] text-white/30 flex items-center gap-1">
                            <Calendar size={10} /> {dateStr}
                          </span>
                          <p className="text-[0.74rem] text-white/50 leading-relaxed mt-1.5 whitespace-pre-line">
                            {ann.message}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDelete(ann.id)}
                        className="text-white/30 hover:text-red-400 p-1 cursor-pointer transition-colors outline-none flex-shrink-0"
                        title="Delete Announcement"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AdminAnnouncementModal;
