import { useEffect, useState, useRef } from "react";
import { TopBar } from "../components/ui/TopBar";
import { Sidebar, type NavItemConfig } from "../components/ui/Sidebar";
import { SidebarPreview } from "../components/ui/SidebarPreview";
import { Card } from "../components/ui/Card";
import { CreateContentModal } from "../components/ui/createContentModel";
import { EmptyState } from "../components/ui/EmptyState";
import { Toast } from "../components/ui/Toast";
import { useContent } from "../hooks/useContent";
import axios from "axios";
import { BACKEND_URL } from "../config";

export function Dashboard() {
  const [modalOpen, setModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("home");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { contents, refresh, loading } = useContent();
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keyboard shortcut: Ctrl+\ or Cmd+\ toggles sidebar (Notion shortcut)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "\\") {
        e.preventDefault();
        setSidebarOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Hover preview handlers with micro delay
  const handleHamburgerMouseEnter = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => {
      if (!sidebarOpen) setPreviewOpen(true);
    }, 150);
  };

  const handleHamburgerMouseLeave = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => {
      setPreviewOpen(false);
    }, 200);
  };

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
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      showToast("Memory deleted successfully");
      refresh();
    } catch (err) {
      console.error("Delete failed", err);
    }
  }

  async function handleShare() {
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/v1/content/share`,
        { share: true },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const shareUrl = `${window.location.origin}${response.data.link}`;
      await navigator.clipboard.writeText(shareUrl);
      showToast("Brain Share link copied to clipboard");
    } catch (err) {
      console.error("Share failed", err);
    }
  }

  // Navigation Items Config
  const NAV_ITEMS: NavItemConfig[] = [
    {
      id: "home",
      label: "Home",
      count: contents.length,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      id: "content",
      label: "My Content",
      count: contents.length,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      id: "collections",
      label: "Collections",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      ),
    },
    {
      id: "tags",
      label: "Tags",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M7 7h.01M7 3h5a1 1 0 01.707.293l7 7a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-7-7A1 1 0 013 8V4a1 1 0 011-1z" />
        </svg>
      ),
    },
    {
      id: "favorites",
      label: "Favorites",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
    },
    {
      id: "shared",
      label: "Shared",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
      ),
    },
    {
      id: "settings",
      label: "Settings",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  // Filtering content
  const filteredContents = contents.filter((item) => {
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      return item.title?.toLowerCase().includes(q) || item.link?.toLowerCase().includes(q);
    }
    return true;
  });

  // Responsive Column Distribution (Serial Order Across Independent Columns)
  const [numCols, setNumCols] = useState(1);
  useEffect(() => {
    const updateCols = () => {
      const w = window.innerWidth;
      if (w >= 1536) setNumCols(4);       // 2xl
      else if (w >= 1280) setNumCols(3);  // xl
      else if (w >= 640) setNumCols(2);   // sm
      else setNumCols(1);                 // xs
    };
    updateCols();
    window.addEventListener("resize", updateCols);
    return () => window.removeEventListener("resize", updateCols);
  }, []);

  const columns: (typeof filteredContents)[] = Array.from({ length: numCols }, () => []);
  filteredContents.forEach((item, idx) => {
    columns[idx % numCols].push(item);
  });

  return (
    <div className="h-screen w-screen bg-[#191919] text-gray-200 font-sans flex overflow-hidden relative">

      {/* ── Left Navigation Panel (Sidebar Drawer / Flex Sibling) ──── */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeTab={activeTab}
        onSelectTab={(tabId) => setActiveTab(tabId)}
        items={NAV_ITEMS}
      />

      {/* ── Hover Navigation Preview (Floats without pushing content) ── */}
      <SidebarPreview
        visible={previewOpen && !sidebarOpen}
        onMouseEnter={() => {
          if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
          setPreviewOpen(true);
        }}
        onMouseLeave={() => {
          setPreviewOpen(false);
        }}
        items={NAV_ITEMS}
        activeTab={activeTab}
        onSelectTab={(tabId) => {
          setActiveTab(tabId);
          setPreviewOpen(false);
        }}
        onLockSidebar={() => {
          setSidebarOpen(true);
          setPreviewOpen(false);
        }}
      />

      {/* ── Main Workspace Window (TopBar + Content Area) ──────────── */}
      <div className="flex-1 h-full flex flex-col min-w-0 bg-[#191919] overflow-hidden relative transition-all duration-300 ease-out">
        
        {/* Top Header Bar */}
        <TopBar
          onHamburgerClick={() => {
            setSidebarOpen((prev) => !prev);
            setPreviewOpen(false);
          }}
          onHamburgerMouseEnter={handleHamburgerMouseEnter}
          onHamburgerMouseLeave={handleHamburgerMouseLeave}
          isSidebarOpen={sidebarOpen}
          onAddMemory={() => setModalOpen(true)}
          onShareBrain={handleShare}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Viewport Canvas (#191919) */}
        <main className="flex-1 w-full h-full overflow-y-auto p-6 sm:p-10 relative">
          {loading && contents.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="flex items-center gap-2 text-xs text-gray-500 font-mono animate-pulse">
                <span className="w-2 h-2 rounded-full bg-gray-500" />
                Loading workspace...
              </div>
            </div>
          ) : filteredContents.length === 0 ? (
            /* Distraction-Free Empty State on #191919 */
            <EmptyState
              isSearch={searchQuery.trim() !== ""}
              searchQuery={searchQuery}
              onAddClick={() => setModalOpen(true)}
              isDark={true}
            />
          ) : (
            /* Independent Column Masonry Grid (Serial Top-Left Distribution & Zero Cross-Column Shift) */
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 items-start">
              {columns.map((colItems, colIdx) => (
                <div key={colIdx} className="flex flex-col gap-6">
                  {colItems.map(({ _id, type, link, title, description }) => (
                    <Card
                      key={_id}
                      _id={_id}
                      type={type}
                      link={link}
                      title={title}
                      description={description}
                      onDelete={handleDelete}
                      onCopyToast={showToast}
                      isDark={true}
                    />
                  ))}
                </div>
              ))}
            </div>
          )}
        </main>

      </div>

      {/* ── Modals & Notifications ───────────────────────────────── */}
      <CreateContentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          showToast("Memory saved successfully");
          refresh();
        }}
      />

      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
}
