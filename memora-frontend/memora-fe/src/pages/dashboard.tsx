import { useEffect, useState, useRef, useMemo } from "react";
import type { Content } from "../types/content";
import type { Collection } from "../types/collection";
import { TopBar, type FilterCounts } from "../components/ui/TopBar";
import { Sidebar, type NavItemConfig } from "../components/ui/Sidebar";
import { SidebarPreview } from "../components/ui/SidebarPreview";
import { Card } from "../components/ui/Card";
import { CreateContentModal } from "../components/ui/createContentModel";
import { CollectionsHub } from "../components/collections/CollectionsHub";
import { CollectionModal } from "../components/collections/CollectionModal";
import { ShareCollectionModal } from "../components/collections/ShareCollectionModal";
import { EmptyState } from "../components/ui/EmptyState";
import { Toast } from "../components/ui/Toast";
import { useContent } from "../hooks/useContent";
import { useCollections } from "../hooks/useCollections";
import axios from "axios";
import { BACKEND_URL } from "../config";

export function Dashboard() {
  const [modalOpen, setModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("home");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [currentWorkspace, setCurrentWorkspace] = useState<string>("personal");
  const [sharedWorkspaceData, setSharedWorkspaceData] = useState<{ username: string; content: Content[] } | null>(null);
  const [sharedWorkspaceLoading, setSharedWorkspaceLoading] = useState(false);
  const [sharedWorkspaceError, setSharedWorkspaceError] = useState<string | null>(null);

  // Collections State
  const {
    collections,
    refreshCollections,
    createCollection,
    updateCollection,
    deleteCollection,
    shareCollection,
  } = useCollections();

  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [isShareCollectionModalOpen, setIsShareCollectionModalOpen] = useState(false);
  const [sharingCollection, setSharingCollection] = useState<Collection | null>(null);

  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved !== "light";
  });

  useEffect(() => {
    localStorage.setItem("theme", isDark ? "dark" : "light");
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  const { contents, refresh, loading } = useContent();
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (currentWorkspace !== "personal") {
      setSharedWorkspaceLoading(true);
      setSharedWorkspaceError(null);
      axios.get(`${BACKEND_URL}/api/v1/content/${currentWorkspace}`)
        .then((result) => {
          setSharedWorkspaceData(result.data);
        })
        .catch((err) => {
          setSharedWorkspaceError(err?.response?.data?.message || "Failed to load shared brain");
        })
        .finally(() => {
          setSharedWorkspaceLoading(false);
        });
    } else {
      setSharedWorkspaceData(null);
    }
  }, [currentWorkspace]);

  // Keyboard shortcut: Ctrl+\ or Cmd+\ toggles sidebar (shortcut)
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

  async function handleMoveCollection(contentId: string, collectionId: string | null) {
    try {
      await axios.put(
        `${BACKEND_URL}/api/v1/content/${contentId}`,
        { collectionId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      refresh();
      refreshCollections();
      showToast(collectionId ? "Moved to collection 📁" : "Removed from collection");
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Failed to move memory");
    }
  }

  // Navigation Items Config
  const NAV_ITEMS: NavItemConfig[] = [
    {
      id: "home",
      label: "Home",
      count: contents.filter((item) => item.type !== "shared_brain").length,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      id: "collections",
      label: "Collections",
      count: collections.length,
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

  const [typeFilter, setTypeFilter] = useState<string>("all");

  const sharedBrains = useMemo(() => {
    const raw = contents.filter((item) => item.type === "shared_brain");
    const seen = new Set<string>();
    return raw.filter((item) => {
      const hash = item.link?.split("/share/")[1] || item.title;
      if (!hash || seen.has(hash)) return false;
      seen.add(hash);
      return true;
    });
  }, [contents]);

  const sourceContents = useMemo(() => {
    const raw = currentWorkspace === "personal" 
      ? contents 
      : (sharedWorkspaceData?.content || []);
    return raw.filter((item) => item.type !== "shared_brain");
  }, [currentWorkspace, contents, sharedWorkspaceData]);

  const activeBaseContents = useMemo(() => {
    if (activeTab === "collections" && selectedCollection) {
      return sourceContents.filter((item) => item.collectionId === selectedCollection._id);
    }
    return sourceContents;
  }, [sourceContents, activeTab, selectedCollection]);

  // Compute item counts for the filter dropdown options
  const filterCounts = useMemo<FilterCounts>(() => {
    const counts: FilterCounts = {
      all: activeBaseContents.length,
      video: 0,
      twitter: 0,
      pdf: 0,
      article: 0,
      has_note: 0,
    };
    activeBaseContents.forEach((item) => {
      if (item.type === "youtube" || item.type === "video") counts.video++;
      else if (item.type === "twitter") counts.twitter++;
      else if (item.type === "pdf") counts.pdf++;
      else counts.article++;

      if (item.description && item.description.trim() !== "") counts.has_note++;
    });
    return counts;
  }, [activeBaseContents]);

  // Filtering content by search query and selected filter option
  const filteredContents = activeBaseContents.filter((item) => {
    // 1. Search Query Filter
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const matchesSearch = item.title?.toLowerCase().includes(q) || item.link?.toLowerCase().includes(q);
      if (!matchesSearch) return false;
    }

    // 2. Type / Note Filter Option
    if (typeFilter === "video") {
      return item.type === "youtube" || item.type === "video";
    }
    if (typeFilter === "twitter") {
      return item.type === "twitter";
    }
    if (typeFilter === "pdf") {
      return item.type === "pdf";
    }
    if (typeFilter === "article") {
      return item.type === "article" || (item.type !== "youtube" && item.type !== "video" && item.type !== "twitter" && item.type !== "pdf" && item.type !== "shared_brain");
    }
    if (typeFilter === "has_note") {
      return Boolean(item.description && item.description.trim() !== "");
    }
    return true;
  });

  // Responsive Column Distribution (Adds +1 column when side panel is closed to preserve card size)
  const [numCols, setNumCols] = useState(4);
  useEffect(() => {
    const updateCols = () => {
      const w = window.innerWidth;
      const isDesktop = w >= 1024;
      
      if (!isDesktop) {
        if (w >= 640) setNumCols(2);
        else setNumCols(1);
        return;
      }

      // On desktop, adjust column count based on whether the sidebar is open
      if (sidebarOpen) {
        if (w >= 2100) setNumCols(5);
        else if (w >= 1400) setNumCols(4);
        else if (w >= 1080) setNumCols(3);
        else setNumCols(2);
      } else {
        // When side panel is closed (+260px available width), add 1 more card space per row!
        if (w >= 2100) setNumCols(6);
        else if (w >= 1400) setNumCols(5);
        else if (w >= 1080) setNumCols(4);
        else setNumCols(3);
      }
    };
    updateCols();
    window.addEventListener("resize", updateCols);
    return () => window.removeEventListener("resize", updateCols);
  }, [sidebarOpen]);

  // Sort chronologically ascending (_id ascending) so any newly added item goes to the last
  const sortedContents = [...filteredContents].sort((a, b) => (a._id > b._id ? 1 : a._id < b._id ? -1 : 0));

  const columns: (typeof sortedContents)[] = Array.from({ length: numCols }, () => []);
  sortedContents.forEach((item, idx) => {
    columns[idx % numCols].push(item);
  });

  return (
    <div className={`h-screen w-screen ${isDark ? "bg-[#191919] text-gray-200" : "bg-white text-gray-900"} font-sans flex overflow-hidden relative transition-colors duration-300`}>

      {/* ── Left Navigation Panel (Sidebar Drawer / Flex Sibling) ──── */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeTab={activeTab}
        onSelectTab={(tabId) => {
          setActiveTab(tabId);
          if (tabId === "collections") {
            setSelectedCollection(null);
          }
        }}
        items={NAV_ITEMS}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        currentWorkspace={currentWorkspace}
        onWorkspaceSelect={setCurrentWorkspace}
        sharedBrains={sharedBrains}
        onDeleteBrain={(brainId) => {
          handleDelete(brainId);
          if (currentWorkspace !== "personal") {
            setCurrentWorkspace("personal");
          }
        }}
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
        isDark={isDark}
      />

      {/* ── Main Workspace Window (TopBar + Content Area) ──────────── */}
      <div className={`flex-1 h-full flex flex-col min-w-0 ${isDark ? "bg-[#191919]" : "bg-white"} overflow-hidden relative transition-all duration-300 ease-out`}>
        
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
          activeFilter={typeFilter}
          onFilterChange={setTypeFilter}
          filterCounts={filterCounts}
          isDark={isDark}
          title={currentWorkspace !== "personal" && sharedWorkspaceData ? `${sharedWorkspaceData.username}'s Brain` : undefined}
        />

        {/* Viewport Canvas */}
        <main className="flex-1 w-full h-full overflow-y-auto p-6 sm:p-10 relative">
          {sharedWorkspaceError ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-center">
              <h2 className={`text-lg font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>Unable to access brain</h2>
              <p className="text-sm text-gray-500 mb-6 max-w-sm">{sharedWorkspaceError}</p>
              <button 
                onClick={() => setCurrentWorkspace("personal")}
                className="px-4 py-2 rounded-md bg-purple-600 text-white text-xs font-semibold"
              >
                Return to Personal Brain
              </button>
            </div>
          ) : (loading && currentWorkspace === "personal" && contents.length === 0) || sharedWorkspaceLoading ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="flex items-center gap-2 text-xs text-gray-500 font-mono animate-pulse">
                <span className="w-2 h-2 rounded-full bg-gray-500" />
                {sharedWorkspaceLoading ? "Syncing external brain..." : "Loading workspace..."}
              </div>
            </div>
          ) : activeTab === "collections" && !selectedCollection && currentWorkspace === "personal" ? (
            /* Collections Hub Overview */
            <CollectionsHub
              collections={collections}
              contents={contents}
              onSelectCollection={(col) => setSelectedCollection(col)}
              onCreateCollectionClick={() => {
                setEditingCollection(null);
                setIsCollectionModalOpen(true);
              }}
              onEditCollection={(col) => {
                setEditingCollection(col);
                setIsCollectionModalOpen(true);
              }}
              onDeleteCollection={async (col) => {
                if (window.confirm(`Delete collection "${col.title}"? Any saved items will remain safely in your General Vault.`)) {
                  await deleteCollection(col._id);
                  refresh();
                  refreshCollections();
                  showToast("Collection deleted");
                }
              }}
              onShareCollection={(col) => {
                setSharingCollection(col);
                setIsShareCollectionModalOpen(true);
              }}
              isDark={isDark}
            />
          ) : (
            /* Normal Card Feed (Home or Inside Collection Folder or Shared Brain) */
            <div className="w-full flex flex-col gap-6">
              {/* External Shared Workspace Banner */}
              {currentWorkspace !== "personal" && sharedWorkspaceData && (
                <div className={`p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border ${
                  isDark ? "bg-purple-950/25 border-purple-500/20 text-white" : "bg-purple-50 border-purple-200 text-purple-950"
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0">
                      <img 
                        width="64" 
                        height="64" 
                        src="https://img.icons8.com/pastel-glyph/64/brain-3--v1.png" 
                        alt="brain-3--v1" 
                        className={`w-6 h-6 object-contain ${isDark ? "invert brightness-125" : "brightness-0 opacity-80"}`}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-bold">
                          {sharedWorkspaceData.username}'s Brain
                        </h2>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                          {filteredContents.length} {filteredContents.length === 1 ? "memory" : "memories"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Shared workspace connection curated by @{sharedWorkspaceData.username}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Collection Folder Header Breadcrumb */}
              {activeTab === "collections" && selectedCollection && (
                <div className="flex items-center justify-between pb-5 border-b border-white/5 flex-wrap gap-4 select-none">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedCollection(null)}
                      className="px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 hover:text-purple-300 border border-purple-500/20 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <span>←</span>
                      <span>All Collections</span>
                    </button>
                    <span className="text-gray-600">/</span>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl p-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
                        {selectedCollection.icon || "📁"}
                      </span>
                      <h2 className={`text-xl sm:text-2xl font-extrabold tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>
                        {selectedCollection.title}
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {filteredContents.length} items
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        setSharingCollection(selectedCollection);
                        setIsShareCollectionModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-white/10 hover:bg-white/10 transition-all flex items-center gap-1.5 cursor-pointer text-gray-300"
                    >
                      <span>🔗</span>
                      <span>{selectedCollection.shareHash ? "Shared" : "Share"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalOpen(true)}
                      className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>+</span>
                      <span>Add to Folder</span>
                    </button>
                  </div>
                </div>
              )}

              {filteredContents.length === 0 ? (
                <EmptyState
                  isSearch={searchQuery.trim() !== "" || typeFilter !== "all"}
                  searchQuery={searchQuery}
                  onAddClick={() => setModalOpen(true)}
                  isDark={isDark}
                />
              ) : (
                <div 
                  className="grid gap-6 items-start transition-all duration-300"
                  style={{
                    gridTemplateColumns: `repeat(${numCols}, minmax(0, 1fr))`
                  }}
                >
                  {columns.map((colItems, colIdx) => (
                    <div key={colIdx} className="flex flex-col gap-6">
                      {colItems.map(({ _id, type, link, title, description, collectionId }) => (
                        <Card
                          key={_id}
                          _id={_id}
                          type={type}
                          link={link}
                          title={title}
                          description={description}
                          collectionId={collectionId}
                          collections={collections}
                          onMoveCollection={handleMoveCollection}
                          onDelete={handleDelete}
                          onCopyToast={showToast}
                          isDark={isDark}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>

      </div>

      {/* ── Modals & Notifications ───────────────────────────────── */}
      <CreateContentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        collections={collections}
        defaultCollectionId={selectedCollection ? selectedCollection._id : null}
        onSuccess={() => {
          showToast("Memory saved successfully");
          refresh();
          refreshCollections();
        }}
      />

      <CollectionModal
        open={isCollectionModalOpen}
        onClose={() => {
          setIsCollectionModalOpen(false);
          setEditingCollection(null);
        }}
        initialCollection={editingCollection}
        onSave={async (title, icon) => {
          if (editingCollection) {
            await updateCollection(editingCollection._id, title, icon);
            showToast("Collection updated 📁");
          } else {
            await createCollection(title, icon);
            showToast("Collection created 🎉");
          }
        }}
        isDark={isDark}
      />

      <ShareCollectionModal
        open={isShareCollectionModalOpen}
        onClose={() => {
          setIsShareCollectionModalOpen(false);
          setSharingCollection(null);
        }}
        collection={sharingCollection}
        onToggleShare={async (id, share) => {
          const link = await shareCollection(id, share);
          if (sharingCollection) {
            setSharingCollection({
              ...sharingCollection,
              shareHash: link ? link.split("/share/c/")[1] : undefined,
            });
          }
          return link;
        }}
        onCopyToast={showToast}
        isDark={isDark}
      />

      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
}
