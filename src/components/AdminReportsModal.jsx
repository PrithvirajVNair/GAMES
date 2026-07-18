import { useState, useEffect } from "react";
import { X, Flag, Check, ShieldBan } from "lucide-react";
import { getPendingReports, resolveReport } from "../services/adminService";
import { toast } from "react-toastify";

const AdminReportsModal = ({ isOpen, onClose }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const list = await getPendingReports();
      setReports(list);
    } catch (err) {
      toast.error("Failed to load reports: " + err.message, { theme: "dark" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        fetchReports();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleResolve = async (reportId, action, shouldBan = false) => {
    setUpdatingId(reportId);
    try {
      await resolveReport(reportId, action, shouldBan);
      setReports((prev) => prev.filter((r) => r.id !== reportId));
      toast.success(shouldBan ? "User banned and report resolved." : "Report dismissed.", { theme: "dark" });
    } catch (err) {
      toast.error("Failed to resolve report: " + err.message, { theme: "dark" });
    } finally {
      setUpdatingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#070b19]/80 backdrop-blur-sm cursor-pointer"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-[760px] bg-[rgba(15,23,42,0.97)] border border-red-500/30 shadow-[0_0_60px_rgba(239,68,68,0.15)] flex flex-col overflow-hidden max-h-[88vh]">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-white/[0.02] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 flex items-center justify-center">
              <Flag size={20} />
            </div>
            <div>
              <h2 className="text-[1.1rem] font-bold text-white tracking-wide">
                User Reports
              </h2>
              <p className="text-[0.72rem] text-white/40">
                Review and act upon user-submitted reports
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 border border-white/10 text-white/50 hover:bg-white/10 hover:text-white cursor-pointer transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col gap-4 flex-1 overflow-hidden">
          {/* Report List */}
          <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3 min-h-0">
            {loading ? (
              <div className="text-center py-10 text-white/50 text-[0.85rem]">
                Loading reports...
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-10 bg-white/[0.02] border border-dashed border-white/10 text-white/40 text-[0.85rem]">
                No pending reports. Great job!
              </div>
            ) : (
              reports.map((r) => {
                const isUpdating = updatingId === r.id;

                return (
                  <div
                    key={r.id}
                    className="flex flex-col border transition-colors bg-white/[0.02] border-white/5 hover:bg-white/[0.04]"
                  >
                    {/* Main Row */}
                    <div className="flex items-start justify-between p-4 gap-3 flex-wrap">
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex flex-col gap-1.5 mb-3">
                          <span className="text-[0.85rem] text-white/50">
                            <strong className="text-white">{r.reporter_username || "Unknown"}</strong> reported <strong className="text-red-400">{r.reported_username || "Unknown"}</strong>
                          </span>
                          <span className="text-[0.7rem] text-white/30">
                            {new Date(r.created_at).toLocaleString()}
                          </span>
                        </div>
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                          <span className="text-[0.82rem] font-bold text-red-300">Reason:</span>
                          <p className="text-[0.85rem] text-white/80 mt-1 mb-0">{r.reason}</p>
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center gap-2 flex-wrap justify-end">
                        <button
                          onClick={() => handleResolve(r.id, "dismissed", false)}
                          disabled={isUpdating}
                          title="Dismiss report without taking action"
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[0.78rem] font-bold border cursor-pointer transition-all duration-150 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
                        >
                          <Check size={14} /> Dismiss
                        </button>

                        <button
                          onClick={() => handleResolve(r.id, "resolved", true)}
                          disabled={isUpdating}
                          title="Ban user and resolve report"
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[0.78rem] font-bold border cursor-pointer transition-all duration-150 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed bg-red-500/20 border-red-500/40 text-red-300 hover:bg-red-500/30"
                        >
                          <ShieldBan size={14} /> Ban User
                        </button>

                        {/* Spinner */}
                        {isUpdating && (
                          <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin flex-shrink-0 ml-2" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReportsModal;
