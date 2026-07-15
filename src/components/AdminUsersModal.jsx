import { useState, useEffect, useMemo } from "react";
import { X, Users, Search } from "lucide-react";
import { getAllUsers, updateUserBadge } from "../services/adminService";
import { BADGE_CONFIG, UserBadgeIcon } from "../utils/badgeConfig";
import { toast } from "react-toastify";

const AdminUsersModal = ({ isOpen, onClose }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const list = await getAllUsers();
      setUsers(list);
    } catch (err) {
      toast.error("Failed to load users: " + err.message, { theme: "dark" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        fetchUsers();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleBadgeChange = async (userId, newBadge) => {
    setUpdatingId(userId);
    try {
      const finalBadge = newBadge === "none" ? null : newBadge;
      await updateUserBadge(userId, finalBadge);
      
      // Update local state to reflect change without refetching the whole list
      setUsers((prev) => 
        prev.map(u => u.id === userId ? { ...u, badge: finalBadge } : u)
      );
      toast.success("Badge updated successfully!", { theme: "dark" });
    } catch (err) {
      toast.error("Failed to update badge: " + err.message, { theme: "dark" });
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users;
    const lowerQuery = searchQuery.toLowerCase();
    return users.filter(u => 
      u.username?.toLowerCase().includes(lowerQuery) || 
      u.id.toLowerCase().includes(lowerQuery)
    );
  }, [users, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#070b19]/80 backdrop-blur-sm cursor-pointer"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-[700px] bg-[rgba(15,23,42,0.95)] border border-indigo-500/30 rounded-2xl shadow-[0_0_50px_rgba(99,102,241,0.15)] flex flex-col overflow-hidden max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
              <Users size={20} />
            </div>
            <div>
              <h2 className="text-[1.1rem] font-bold text-white tracking-wide">
                Manage Users
              </h2>
              <p className="text-[0.75rem] text-white/50">
                Assign special badges to users
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
          
          {/* Search Bar */}
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/40">
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder="Search by username or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/10 rounded-lg py-2.5 pl-9 pr-4 text-[0.85rem] text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.05] transition-colors"
            />
          </div>

          {/* User List */}
          <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-2 custom-scrollbar">
            {loading ? (
              <div className="text-center py-10 text-white/50 text-[0.85rem]">
                Loading users...
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-10 bg-white/[0.02] border border-dashed border-white/10 rounded-xl text-white/40 text-[0.85rem]">
                No users found.
              </div>
            ) : (
              filteredUsers.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors gap-4 max-sm:flex-col max-sm:items-start"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold uppercase text-[0.9rem] flex-shrink-0">
                      {u.username ? u.username[0] : "?"}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[0.95rem] font-bold text-white truncate">
                          {u.username || "Unknown"}
                        </span>
                        <UserBadgeIcon badge={u.badge} size={15} />
                      </div>
                      <span className="text-[0.65rem] text-white/30 truncate" title={u.id}>
                        ID: {u.id}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <select
                      value={u.badge || "none"}
                      onChange={(e) => handleBadgeChange(u.id, e.target.value)}
                      disabled={updatingId === u.id}
                      className="bg-[#0f172a] border border-white/10 rounded-lg py-1.5 px-3 text-[0.8rem] text-white/80 focus:outline-none focus:border-indigo-500/50 cursor-pointer disabled:opacity-50 flex-1 sm:w-auto"
                    >
                      <option value="none">No Badge</option>
                      {Object.keys(BADGE_CONFIG).map((key) => (
                        <option key={key} value={key}>
                          {BADGE_CONFIG[key].label}
                        </option>
                      ))}
                    </select>
                    {updatingId === u.id && (
                      <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsersModal;
