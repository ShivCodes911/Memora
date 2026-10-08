import * as React from "react";

export interface NavigationItemProps {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  count?: number;
  onClick: () => void;
  className?: string;
}

export function NavigationItem({
  label,
  icon,
  active = false,
  count,
  onClick,
  className = "",
}: NavigationItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-md text-xs font-medium transition-all duration-150 cursor-pointer group ${
        active
          ? "bg-[#2d2d2d] text-white font-semibold"
          : "text-gray-400 hover:text-gray-200 hover:bg-[#262626]"
      } ${className}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span
          className={`shrink-0 transition-colors ${
            active ? "text-white" : "text-gray-400 group-hover:text-gray-200"
          }`}
        >
          {icon}
        </span>
        <span className="truncate">{label}</span>
      </div>

      {count !== undefined && count > 0 && (
        <span
          className={`text-[10px] px-2 py-0.5 rounded-full font-mono transition-colors ${
            active ? "bg-white/15 text-white" : "bg-[#2a2a2a] text-gray-400 group-hover:text-gray-300"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}
