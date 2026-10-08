import { TwitterIcon } from "../../icons/twitter";
import { YoutubeIcon } from "../../icons/youtube";
import { SidebarItem } from "./SidebarItem";
import { Logo } from "../../icons/logo";
import { ProfileMenu } from "./ProfileMenu";

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  counts: {
    all: number;
    youtube: number;
    twitter: number;
    article: number;
  };
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  isDark?: boolean;
}

export function Sidebar({ activeTab, onSelectTab, counts, collapsed, onToggleCollapse, isDark }: SidebarProps) {
    return (
        <aside className={`h-screen w-64 fixed left-0 top-0 px-4 flex flex-col z-30 transition-all duration-300 shadow-sm ${
            collapsed ? "-translate-x-full" : "translate-x-0"
        } ${
            isDark ? "bg-[#191919] border-r border-[#262626] text-gray-200" : "bg-white border-r border-gray-200 text-gray-900"
        }`}>
            {/* Logo & Brand + Collapse Button */}
            <div className={`flex items-center justify-between pt-6 pb-5 px-2 border-b ${
                isDark ? "border-white/10" : "border-gray-100"
            }`}>
                <a href="/dashboard" className="flex items-center gap-3 group">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md group-hover:scale-105 transition-transform">
                        <Logo className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <span className={`text-lg font-bold tracking-tight block leading-none ${isDark ? "text-white" : "text-gray-900"}`}>Memora</span>
                        <span className="text-[10px] font-semibold text-purple-500 uppercase tracking-widest">Second Brain</span>
                    </div>
                </a>

                {/* Sidebar collapse button */}
                {onToggleCollapse && (
                    <button
                        onClick={onToggleCollapse}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            isDark ? "hover:bg-white/10 text-gray-400 hover:text-white" : "hover:bg-gray-100 text-gray-400 hover:text-gray-700"
                        }`}
                        title="Collapse Sidebar (Ctrl+\)"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Nav Items */}
            <div className="pt-6 flex flex-col gap-1.5 flex-1 overflow-y-auto">
                <div className={`text-[11px] font-bold uppercase tracking-wider px-3 mb-1 ${
                    isDark ? "text-gray-500" : "text-gray-400"
                }`}>
                  Collections
                </div>

                <SidebarItem 
                    text="All Memories" 
                    count={counts.all}
                    active={activeTab === "all"}
                    onClick={() => onSelectTab("all")}
                    icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    } 
                />

                <SidebarItem 
                    text="YouTube Videos" 
                    count={counts.youtube}
                    active={activeTab === "youtube"}
                    onClick={() => onSelectTab("youtube")}
                    icon={<YoutubeIcon />} 
                />

                <SidebarItem 
                    text="Twitter / X" 
                    count={counts.twitter}
                    active={activeTab === "twitter"}
                    onClick={() => onSelectTab("twitter")}
                    icon={<TwitterIcon />} 
                />

                <SidebarItem 
                    text="Articles & Links" 
                    count={counts.article}
                    active={activeTab === "article"}
                    onClick={() => onSelectTab("article")}
                    icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                        </svg>
                    } 
                />
            </div>

            {/* Bottom Profile Menu */}
            <div className={`py-4 border-t mt-auto ${isDark ? "border-white/10" : "border-gray-100"}`}>
                <ProfileMenu />
            </div>
        </aside>
    );
}
