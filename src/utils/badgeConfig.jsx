import { BadgeCheck, Code2, Shield } from "lucide-react";

/**
 * Configuration for user badges.
 * Maps the ENUM values to UI details like icon, label, and colors.
 */
// eslint-disable-next-line react-refresh/only-export-components
export const BADGE_CONFIG = {
  verified: {
    label: "Verified",
    icon: BadgeCheck,
    colorClass: "text-blue-400",
    bgClass: "bg-blue-500/10 border-blue-500/30",
    gradientTextClass: "bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent",
  },
  developer: {
    label: "Developer",
    icon: Code2,
    colorClass: "text-purple-400",
    bgClass: "bg-purple-500/10 border-purple-500/30",
    gradientTextClass: "bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent",
  },
  moderator: {
    label: "Moderator",
    icon: Shield,
    colorClass: "text-rose-400",
    bgClass: "bg-rose-500/10 border-rose-500/30",
    gradientTextClass: "bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent",
  },
};

/**
 * Helper component to render a badge simply based on the badge key.
 */
export const UserBadgeIcon = ({ badge, size = 16, className = "" }) => {
  if (!badge || !BADGE_CONFIG[badge]) return null;
  const config = BADGE_CONFIG[badge];
  const Icon = config.icon;
  return (
    <div title={config.label} className={`flex items-center justify-center flex-shrink-0 ${className}`}>
      <Icon size={size} className={config.colorClass} />
    </div>
  );
};
