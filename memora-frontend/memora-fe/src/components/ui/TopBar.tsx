import { HamburgerButton } from "./HamburgerButton";

export interface TopBarProps {
  onHamburgerClick: () => void;
  onHamburgerMouseEnter: () => void;
  onHamburgerMouseLeave: () => void;
  isSidebarOpen: boolean;
  onAddMemory?: () => void;
  onShareBrain?: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  className?: string;
}

export function TopBar({
  onHamburgerClick,
  onHamburgerMouseEnter,
  onHamburgerMouseLeave,
  isSidebarOpen,
  onAddMemory,
  onShareBrain,
  searchQuery,
  onSearchChange,
  className = "",
}: TopBarProps) {
  return (
    <header
      className={`w-full h-14 bg-[#191919] border-b border-white/5 px-4 flex items-center justify-between shrink-0 select-none ${className}`}
    >
      {/* Left: Far-left Hamburger Menu Icon */}
      <div className="flex items-center gap-3">
        <HamburgerButton
          onClick={onHamburgerClick}
          onMouseEnter={onHamburgerMouseEnter}
          onMouseLeave={onHamburgerMouseLeave}
          isOpen={isSidebarOpen}
        />
        <span className="text-xs font-medium text-gray-400 opacity-60 hover:opacity-100 transition-opacity">
          Memora
        </span>
      </div>

      {/* Center / Rest of Top Bar: Empty and Distraction-Free */}
      <div className="flex-1 max-w-sm mx-auto px-4">
        {onSearchChange && (
          <div className="relative w-full">
            <input
              type="text"
              value={searchQuery || ""}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Type to search..."
              className="w-full bg-[#202020] border border-white/5 rounded-md px-8 py-1.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-white/20 transition-all"
            />
            <svg
              className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        )}
      </div>

      {/* Right: Subtle Actions */}
      <div className="flex items-center gap-2">
        {onShareBrain && (
          <button
            type="button"
            onClick={onShareBrain}
            className="px-3 py-1.5 rounded-md bg-[#202020] hover:bg-[#262626] text-gray-400 hover:text-gray-200 text-xs font-medium transition-all cursor-pointer border border-white/5"
            title="Share Brain Link"
          >
            Share
          </button>
        )}

        {onAddMemory && (
          <button
            type="button"
            onClick={onAddMemory}
            className="px-3.5 py-1.5 rounded-md bg-white/10 hover:bg-white/15 text-white text-xs font-medium transition-all cursor-pointer border border-white/10 flex items-center gap-1.5 active:scale-95"
          >
            <span>+</span>
            <span>Add</span>
          </button>
        )}
      </div>
    </header>
  );
}
