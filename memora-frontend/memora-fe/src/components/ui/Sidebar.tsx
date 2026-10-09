import { NavigationItem } from "./NavigationItem";
import { ProfileMenu } from "./ProfileMenu";
import { Logo } from "../../icons/logo";

export interface NavItemConfig {
  id: string;
  label: string;
  icon: React.ReactNode;
  count?: number;
}

export interface SidebarProps {
  open: boolean;
  onClose: () => void;
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  items: NavItemConfig[];
  isDark?: boolean;
  onToggleTheme?: () => void;
}

export function Sidebar({
  open,
  onClose,
  activeTab,
  onSelectTab,
  items,
  isDark = true,
  onToggleTheme,
}: SidebarProps) {
  return (
    <>
      {/* Mobile/Tablet Backdrop Overlay */}
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity duration-200 lg:hidden"
        />
      )}

      {/* Main Locked Sidebar Panel */}
      <aside
        className={`fixed lg:static top-0 left-0 bottom-0 z-40 w-[260px] ${
          isDark ? "bg-[#202020] text-gray-200 border-white/5" : "bg-[#F9F8F7] text-[#55534E] border-gray-200"
        } border-r flex flex-col justify-between shrink-0 transition-all duration-300 ease-out ${
          open ? "translate-x-0 lg:ml-0" : "-translate-x-full lg:translate-x-0 lg:-ml-[260px]"
        }`}
      >
        {/* Header / Brand & Unlock Toggle */}
        <div className={`flex items-center justify-between p-4 border-b shrink-0 ${isDark ? "border-white/5" : "border-gray-200"}`}>
          <a href="/dashboard" className="flex items-center gap-3 group">
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${
              isDark ? "bg-[#2d2d2d] border-white/10 text-white" : "bg-white border-gray-200 text-[#55534E]"
            }`}>
              <Logo className="w-4 h-4" />
            </div>
            <div>
              <span className={`text-sm font-bold tracking-tight block ${isDark ? "text-white" : "text-[#55534E]"}`}>
                Memora
              </span>
            </div>
          </a>

          <div className="flex items-center gap-1">
            {onToggleTheme && (
              <button
                type="button"
                onClick={onToggleTheme}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  isDark ? "text-gray-400 hover:text-white hover:bg-white/10" : "text-gray-500 hover:text-gray-800 hover:bg-gray-200"
                }`}
                title="Toggle Theme"
              >
                {isDark ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                isDark ? "text-gray-400 hover:text-white hover:bg-white/10" : "text-gray-500 hover:text-gray-800 hover:bg-gray-200"
              }`}
              title="Close / Unlock sidebar (Ctrl+\)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation Items List */}
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1">
          <div className="px-3 pt-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-500">
            Workspace
          </div>

          {items.map((item) => (
            <NavigationItem
              key={item.id}
              label={item.label}
              icon={item.icon}
              count={item.count}
              active={activeTab === item.id}
              onClick={() => onSelectTab(item.id)}
              isDark={isDark}
            />
          ))}
        </div>

        {/* Footer / Profile Menu */}
        <div className="p-3 border-t border-white/5 shrink-0">
          <ProfileMenu />
        </div>
      </aside>
    </>
  );
}
