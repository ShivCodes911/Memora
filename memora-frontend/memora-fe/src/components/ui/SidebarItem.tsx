import type { ReactElement } from "react";

interface SidebarItemProps {
    text: string;
    icon: ReactElement;
    count?: number;
    active?: boolean;
    onClick?: () => void;
}

export function SidebarItem({ text, icon, count, active, onClick }: SidebarItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group cursor-pointer ${
        active
          ? "bg-purple-600/10 text-purple-600 font-semibold border border-purple-500/20 shadow-sm"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className={`transition-transform group-hover:scale-110 ${active ? "text-purple-600" : "text-gray-400 group-hover:text-gray-600"}`}>
          {icon}
        </span>
        <span>{text}</span>
      </div>

      {typeof count === "number" && (
        <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold transition-colors ${
          active ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
        }`}>
          {count}
        </span>
      )}
    </button>
  );
}