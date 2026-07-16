import { useState, useEffect, useMemo } from "react";
import { X, Users, Search, ShieldBan, ShieldCheck, Trash2 } from "lucide-react";
import { getAllUsers, updateUserBadge, banUser, deleteUser } from "../services/adminService";
import { BADGE_CONFIG, UserBadgeIcon } from "../utils/badgeConfig";
import { toast } from "react-toastify";

const AdminUsersModal = ({ isOpen, onClose }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  // Track which user row has the delete confirmation expanded
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

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

  // Reset confirmation state when modal closes
  useEffect(() => {
    if (!isOpen) setConfirmDeleteId(null);
  }, [isOpen]);

  const handleBadgeChange = async (userId, newBadge) => {
    setUpdatingId(userId);
    try {
      const finalBadge = newBadge === "none" ? null : newBadge;
      await updateUserBadge(userId, finalBadge);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, badge: finalBadge } : u))
      );
      toast.success("Badge updated!", { theme: "dark" });
    } catch (err) {
      toast.error("Failed to update badge: " + err.message, { theme: "dark" });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleBan = async (userId, currentlyBanned) => {
    setUpdatingId(userId);
    try {
      await banUser(userId, !currentlyBanned);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, is_banned: !currentlyBanned } : u
        )
      );
      toast.success(
        currentlyBanned ? "User unbanned successfully." : "User banned successfully.",
        { theme: "dark" }
      );
    } catch (err) {
      toast.error("Failed to update ban: " + err.message, { theme: "dark" });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteUser = async (userId) => {
    setUpdatingId(userId);
    setConfirmDeleteId(null);
    try {
      await deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      toast.success("User permanently deleted.", { theme: "dark" });
    } catch (err) {
      toast.error("Failed to delete user: " + err.message, { theme: "dark" });
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users;
    const lowerQuery = searchQuery.toLowerCase();
    return users.filter(
      (u) =>
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
      <div className="relative w-full max-w-[760px] bg-[rgba(15,23,42,0.97)] border border-indigo-500/30 rounded-2xl shadow-[0_0_60px_rgba(99,102,241,0.15)] flex flex-col overflow-hidden max-h-[88vh]">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-white/[0.02] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
              <Users size={20} />
            </div>
            <div>
              <h2 className="text-[1.1rem] font-bold text-white tracking-wide">
                Manage Users
              </h2>
              <p className="text-[0.72rem] text-white/40">
                Assign badges · ban accounts · permanently delete users
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
          <div className="relative w-full flex-shrink-0">
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
          <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2 min-h-0">
            {loading ? (
              <div className="text-center py-10 text-white/50 text-[0.85rem]">
                Loading users...
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-10 bg-white/[0.02] border border-dashed border-white/10 rounded-xl text-white/40 text-[0.85rem]">
                No users found.
              </div>
            ) : (
              filteredUsers.map((u) => {
                const isBanned = !!u.is_banned;
                const isUpdating = updatingId === u.id;
                const isConfirmingDelete = confirmDeleteId === u.id;

                return (
                  <div
                    key={u.id}
                    className={`flex flex-col rounded-xl border transition-colors ${
                      isBanned
                        ? "bg-red-500/[0.04] border-red-500/20"
                        : "bg-white/[0.02] border-white/5 hover:bg-white/[0.04]"
                    }`}
                  >
                    {/* Main Row */}
                    <div className="flex items-center justify-between p-3 gap-3 flex-wrap">

                      {/* Avatar + Info */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className={`w-10 h-10 rounded-full border flex items-center justify-center font-bold uppercase text-[0.9rem] flex-shrink-0 ${
                          isBanned
                            ? "bg-red-500/10 border-red-500/30 text-red-400"
                            : "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
                        }`}>
                          {u.username ? u.username[0] : "?"}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[0.92rem] font-bold text-white truncate">
                              {u.username || "Unknown"}
                            </span>
                            <UserBadgeIcon badge={u.badge} size={14} />
                            {isBanned && (
                              <span className="flex items-center gap-1 bg-red-500/15 text-red-400 border border-red-500/30 text-[0.62rem] font-black uppercase tracking-wider px-1.5 py-0.5 rounded">
                                <ShieldBan size={9} />
                                Banned
                              </span>
                            )}
                          </div>
                          <span className="text-[0.7rem] text-white/50 truncate">
                            {u.email || "—"}
                          </span>
                          <span
                            className="text-[0.6rem] text-white/20 truncate"
                            title={u.id}
                          >
                            {u.id}
                          </span>
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center gap-2 flex-wrap justify-end">

                        {/* Badge selector */}
                        <select
                          value={u.badge || "none"}
                          onChange={(e) => handleBadgeChange(u.id, e.target.value)}
                          disabled={isUpdating}
                          className="bg-[#0f172a] border border-white/10 rounded-lg py-1.5 px-3 text-[0.78rem] text-white/80 focus:outline-none focus:border-indigo-500/50 cursor-pointer disabled:opacity-50"
                        >
                          <option value="none">No Badge</option>
                          {Object.keys(BADGE_CONFIG).map((key) => (
                            <option key={key} value={key}>
                              {BADGE_CONFIG[key].label}
                            </option>
                          ))}
                        </select>

                        {/* Ban / Unban button */}
                        <button
                          onClick={() => handleToggleBan(u.id, isBanned)}
                          disabled={isUpdating}
                          title={isBanned ? "Unban user" : "Ban user"}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.78rem] font-bold border cursor-pointer transition-all duration-150 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
                            isBanned
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                              : "bg-orange-500/10 border-orange-500/30 text-orange-400 hover:bg-orange-500/20"
                          }`}
                        >
                          {isBanned ? (
                            <><ShieldCheck size={13} /> Unban</>
                          ) : (
                            <><ShieldBan size={13} /> Ban</>
                          )}
                        </button>

                        {/* Delete button */}
                        <button
                          onClick={() =>
                            setConfirmDeleteId(isConfirmingDelete ? null : u.id)
                          }
                          disabled={isUpdating}
                          title="Permanently delete user"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.78rem] font-bold border cursor-pointer transition-all duration-150 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
                        >
                          <Trash2 size={13} />
                          Delete
                        </button>

                        {/* Spinner */}
                        {isUpdating && (
                          <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                        )}
                      </div>
                    </div>

                    {/* Delete Confirmation Panel — inline expand */}
                    {isConfirmingDelete && (
                      <div className="px-4 pb-4 pt-1 border-t border-red-500/15 flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex flex-col">
                          <span className="text-[0.82rem] font-bold text-red-300">
                            ⚠ Permanently delete <span className="text-white">{u.username}</span>?
                          </span>
                          <span className="text-[0.7rem] text-white/35 mt-0.5">
                            This removes their account, profile, and all scores. Cannot be undone.
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-3 py-1.5 rounded-lg text-[0.78rem] font-bold border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white cursor-pointer transition-all duration-150"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="px-3 py-1.5 rounded-lg text-[0.78rem] font-bold border border-red-500/50 bg-red-500/20 text-red-300 hover:bg-red-500/30 cursor-pointer transition-all duration-150 active:scale-95"
                          >
                            Yes, Delete Permanently
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer stats */}
        <div className="px-5 py-3 border-t border-white/5 bg-white/[0.01] flex-shrink-0 flex items-center justify-between">
          <span className="text-[0.72rem] text-white/30">
            {filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""} shown
          </span>
          <span className="text-[0.72rem] text-red-400/60">
            {users.filter((u) => u.is_banned).length} banned
          </span>
        </div>
      </div>
    </div>
  );
};

export default AdminUsersModal;
