import { useEffect, useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Sidebar } from '../components/ui/Sidebar';
import { CreateContentModal } from '../components/ui/createContentModel';
import { EmptyState } from '../components/ui/EmptyState';
import { Toast } from '../components/ui/Toast';
import { PlusIcon } from '../icons/plusicon';
import { ShareIcon } from '../icons/shareIcon';
import { YoutubeIcon } from '../icons/youtube';
import { TwitterIcon } from '../icons/twitter';
import { useContent } from '../hooks/useContent';
import axios from 'axios';
import { BACKEND_URL } from '../config';

export function Dashboard() {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);

  // Notion Focus Mode & Dark Mode State
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem("memora_theme") === "dark";
  });

  const { contents, refresh, loading } = useContent();

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    localStorage.setItem("memora_theme", nextDark ? "dark" : "light");
  };

  // Keyboard shortcut: Ctrl+\ or Cmd+\ toggles sidebar collapse (Notion shortcut)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "\\") {
        e.preventDefault();
        setSidebarCollapsed((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  async function handleDelete(contentId: string) {
    try {
      await axios.delete(`${BACKEND_URL}/api/v1/content/${contentId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      showToast("Memory deleted successfully");
      refresh();
    } catch (err) {
      console.error("Delete failed", err);
    }
  }

  async function handleShare() {
    try {
      setSharing(true);
      const response = await axios.post(
        `${BACKEND_URL}/api/v1/content/share`,
        { share: true },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      const shareUrl = `${window.location.origin}${response.data.link}`;
      await navigator.clipboard.writeText(shareUrl);
      showToast("Brain Share link copied to clipboard");
    } catch (err) {
      console.error("Share failed", err);
    } finally {
      setSharing(false);
    }
  }

  // Calculate stats
  const youtubeCount = contents.filter((c) => c.type === "youtube").length;
  const twitterCount = contents.filter((c) => c.type === "twitter").length;
  const articleCount = contents.filter((c) => c.type !== "youtube" && c.type !== "twitter").length;

  const counts = {
    all: contents.length,
    youtube: youtubeCount,
    twitter: twitterCount,
    article: articleCount,
  };

  // Filter logic
  const filteredContents = contents.filter((item) => {
    if (activeTab === "youtube" && item.type !== "youtube") return false;
    if (activeTab === "twitter" && item.type !== "twitter") return false;
    if (activeTab === "article" && (item.type === "youtube" || item.type === "twitter")) return false;

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title?.toLowerCase().includes(q);
      const matchLink = item.link?.toLowerCase().includes(q);
      return matchTitle || matchLink;
    }

    return true;
  });

  return (
    <div className={`min-h-screen flex transition-colors duration-300 font-sans ${
      isDark ? "bg-[#09090b] text-zinc-100" : "bg-[#fafafa] text-zinc-900"
    }`}>
      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        counts={counts}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        isDark={isDark}
      />

      {/* Main Dashboard Workspace */}
      <div className={`flex-1 p-6 lg:p-10 transition-all duration-300 ${
        sidebarCollapsed ? "ml-0 max-w-full" : "ml-64 max-w-[1600px]"
      }`}>

        {/* Top Header Bar */}
        <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b ${
          isDark ? "border-zinc-800" : "border-zinc-200/80"
        }`}>
          
          {/* Sidebar Expand Button + Title + Live Search */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
            
            <div className="flex items-center gap-3">
              {sidebarCollapsed && (
                <button
                  onClick={() => setSidebarCollapsed(false)}
                  className={`p-2 rounded-xl border transition-all cursor-pointer ${
                    isDark ? "bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800" : "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-100 shadow-sm"
                  }`}
                  title="Expand Sidebar (Ctrl+\)"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              )}

              <div>
                <h1 className={`text-2xl font-bold tracking-tight ${
                  isDark ? "text-zinc-100" : "text-zinc-900"
                }`}>
                  {activeTab === "all" && "All Memories"}
                  {activeTab === "youtube" && "YouTube Bookmarks"}
                  {activeTab === "twitter" && "Twitter / X Threads"}
                  {activeTab === "article" && "Articles & Web Links"}
                </h1>
                <p className={`text-xs font-medium mt-0.5 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                  Organize, search, and access your digital second brain
                </p>
              </div>
            </div>

            {/* Live Search Input */}
            <div className="relative w-full sm:max-w-xs md:max-w-sm sm:ml-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search memories..."
                className={`w-full border rounded-xl pl-9 pr-8 py-2 text-xs transition-all shadow-sm outline-none ${
                  isDark 
                    ? "bg-zinc-900 border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30" 
                    : "bg-white border-zinc-200 text-zinc-800 placeholder-zinc-400 focus:ring-1 focus:ring-purple-600 focus:border-purple-600"
                }`}
              />
              <svg className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 text-xs cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons + Theme Switcher */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={toggleTheme}
              className={`p-2 px-3 rounded-xl border text-xs font-medium flex items-center gap-2 transition-all cursor-pointer ${
                isDark 
                  ? "bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800" 
                  : "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 shadow-sm"
              }`}
              title="Toggle Dark / Light Theme"
            >
              {isDark ? (
                <>
                  <svg className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 100 2h1z"/>
                  </svg>
                  <span>Light</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5 text-zinc-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                  <span>Dark Focus</span>
                </>
              )}
            </button>

            <Button 
              onClick={handleShare}
              variant="secondary" 
              text={sharing ? "Copying..." : "Share Brain"} 
              size="md" 
              startIcon={<ShareIcon size="md"/>} 
            />
            <Button  
              variant="primary" 
              text="Add Content" 
              size="md" 
              onClick={() => setModalOpen(true)} 
              startIcon={<PlusIcon size="md"/>} 
            />
          </div>
        </div>

        {/* Quick Stats Metrics Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 my-6">
          
          <div className={`p-4 rounded-xl border flex items-center justify-between transition-colors ${
            isDark ? "bg-[#121215] border-zinc-800/80" : "bg-white border-zinc-200/80 shadow-sm"
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-lg ${isDark ? "bg-purple-500/10 text-purple-400" : "bg-purple-50 text-purple-600"}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <span className={`text-[11px] font-semibold uppercase tracking-wider block ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                  Total Memories
                </span>
                <span className={`text-xl font-bold tracking-tight ${isDark ? "text-zinc-100" : "text-zinc-900"}`}>{contents.length}</span>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-xl border flex items-center justify-between transition-colors ${
            isDark ? "bg-[#121215] border-zinc-800/80" : "bg-white border-zinc-200/80 shadow-sm"
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-lg ${isDark ? "bg-red-500/10 text-red-400" : "bg-red-50 text-red-500"}`}>
                <YoutubeIcon />
              </div>
              <div>
                <span className={`text-[11px] font-semibold uppercase tracking-wider block ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                  YouTube Videos
                </span>
                <span className={`text-xl font-bold tracking-tight ${isDark ? "text-zinc-100" : "text-zinc-900"}`}>{youtubeCount}</span>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-xl border flex items-center justify-between transition-colors ${
            isDark ? "bg-[#121215] border-zinc-800/80" : "bg-white border-zinc-200/80 shadow-sm"
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-lg ${isDark ? "bg-sky-500/10 text-sky-400" : "bg-sky-50 text-sky-500"}`}>
                <TwitterIcon />
              </div>
              <div>
                <span className={`text-[11px] font-semibold uppercase tracking-wider block ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                  Twitter / X Threads
                </span>
                <span className={`text-xl font-bold tracking-tight ${isDark ? "text-zinc-100" : "text-zinc-900"}`}>{twitterCount}</span>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-xl border flex items-center justify-between transition-colors ${
            isDark ? "bg-[#121215] border-zinc-800/80" : "bg-white border-zinc-200/80 shadow-sm"
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-lg ${isDark ? "bg-indigo-500/10 text-indigo-400" : "bg-indigo-50 text-indigo-600"}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <div>
                <span className={`text-[11px] font-semibold uppercase tracking-wider block ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                  Articles & Links
                </span>
                <span className={`text-xl font-bold tracking-tight ${isDark ? "text-zinc-100" : "text-zinc-900"}`}>{articleCount}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Window */}
        <CreateContentModal 
          open={modalOpen} 
          onClose={() => setModalOpen(false)}
          onSuccess={() => {
            showToast("Memory saved successfully");
            refresh();
          }}
        />

        {/* Content Feed Section */}
        {loading && contents.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className={`h-96 rounded-2xl ${isDark ? "bg-zinc-900" : "bg-zinc-200/70"}`} />
            ))}
          </div>
        ) : filteredContents.length === 0 ? (
          <EmptyState 
            isSearch={searchQuery.trim() !== ""}
            searchQuery={searchQuery}
            onAddClick={() => setModalOpen(true)}
            isDark={isDark}
          />
        ) : (
          <div className="flex gap-6 flex-wrap"> 
            {filteredContents.map(({ _id, type, link, title }) => (
              <Card 
                type={type} 
                link={link} 
                title={title}
                key={_id}
                _id={_id}
                onDelete={handleDelete}
                onCopyToast={showToast}
                isDark={isDark}
              />
            ))}
          </div>
        )}

      </div>

      {/* Floating Notification Toast */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
}
