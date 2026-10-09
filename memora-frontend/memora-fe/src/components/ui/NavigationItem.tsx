import * as React from "react";

export interface NavigationItemProps {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  count?: number;
  onClick: () => void;
  className?: string;
  isDark?: boolean;
}

export function NavigationItem({
  label,
  icon,
  active = false,
  count,
  onClick,
  className = "",
  isDark = true,
}: NavigationItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-md text-xs font-medium transition-all duration-150 cursor-pointer group ${
        active
          ? isDark 
            ? "bg-[#2d2d2d] text-white font-semibold"
            : "bg-gray-200 text-gray-900 font-semibold"
          : isDark
            ? "text-gray-400 hover:text-gray-200 hover:bg-[#262626]"
            : "text-[#55534E] hover:text-gray-900 hover:bg-gray-100"
      } ${className}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span
          className={`shrink-0 transition-colors ${
            active 
              ? (isDark ? "text-white" : "text-gray-900") 
              : (isDark ? "text-gray-400 group-hover:text-gray-200" : "text-[#55534E] group-hover:text-gray-900")
          }`}
        >
          {icon}
        </span>
        <span className="truncate">{label}</span>
      </div>

      {count !== undefined && count > 0 && (
        <span
          className={`text-[10px] px-2 py-0.5 rounded-full font-mono transition-colors ${
            active 
              ? (isDark ? "bg-white/15 text-white" : "bg-white text-gray-800 shadow-sm") 
              : (isDark ? "bg-[#2a2a2a] text-gray-400 group-hover:text-gray-300" : "bg-gray-200 text-gray-500 group-hover:text-gray-700")
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}
