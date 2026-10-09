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
}

export function Sidebar({
  open,
  onClose,
  activeTab,
  onSelectTab,
  items,
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
        className={`fixed lg:static top-0 left-0 bottom-0 z-40 w-[260px] bg-[#202020] text-gray-200 border-r border-white/5 flex flex-col justify-between shrink-0 transition-all duration-300 ease-out ${
          open ? "translate-x-0 lg:ml-0" : "-translate-x-full lg:translate-x-0 lg:-ml-[260px]"
        }`}
      >
        {/* Header / Brand & Unlock Toggle */}
        <div className="flex items-center justify-between p-4 border-b border-white/5 shrink-0">
          <a href="/dashboard" className="flex items-center gap-3 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2d2d2d] border border-white/10 text-white">
              <Logo className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight text-white block">Memora</span>
            </div>
          </a>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Close / Unlock sidebar (Ctrl+\)"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
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
