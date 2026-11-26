import { useEffect, useMemo, useState } from "react";
import type { Collection } from "../../types/collection";
import type { Content } from "../../types/content";
import { CollectionIcon, DEFAULT_COLLECTION_ICON } from "./CollectionIcon";

interface CollectionsHubProps {
    collections: Collection[];
    contents: Content[];
    onSelectCollection: (col: Collection) => void;
    onCreateCollectionClick: () => void;
    onEditCollection: (col: Collection) => void;
    onDeleteCollection: (col: Collection) => void;
    onShareCollection: (col: Collection) => void;
    isDark?: boolean;
}

export function CollectionsHub({
    collections,
    contents,
    onSelectCollection,
    onCreateCollectionClick,
    onEditCollection,
    onDeleteCollection,
    onShareCollection,
    isDark = true,
}: CollectionsHubProps) {
    const [search, setSearch] = useState("");
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

    // Close card dropdown menu when clicking outside or pressing Escape
    useEffect(() => {
        if (!activeMenuId) return;
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement | null;
            if (!target?.closest(`[data-col-menu="${activeMenuId}"]`)) {
                setActiveMenuId(null);
            }
        };
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setActiveMenuId(null);
        };
        document.addEventListener("mousedown", handleClickOutside);
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [activeMenuId]);

    // Collect all descendant collection IDs for recursive stats
    const getSubtreeIds = (colId: string): Set<string> => {
        const ids = new Set<string>([colId]);
        const queue = [colId];
        while (queue.length > 0) {
            const curr = queue.shift()!;
            collections.forEach((c) => {
                if (c.parentId === curr && !ids.has(c._id)) {
                    ids.add(c._id);
                    queue.push(c._id);
                }
            });
        }
        return ids;
    };

    const getTotalItemsCount = (colId: string): number => {
        const ids = getSubtreeIds(colId);
        return contents.filter(
            (item) => item.type !== "shared_brain" && Boolean(item.collectionId) && ids.has(item.collectionId!)
        ).length;
    };

    const filteredCollections = useMemo(() => {
        if (!search.trim()) {
            return collections.filter((c) => !c.parentId);
        }
        const q = search.toLowerCase();
        return collections.filter((c) => c.title.toLowerCase().includes(q));
    }, [collections, search]);

    const rootFolderCount = useMemo(() => {
        return collections.filter((c) => !c.parentId).length;
    }, [collections]);

    const totalOrganizedItems = useMemo(() => {
        return contents.filter((item) => item.type !== "shared_brain" && Boolean(item.collectionId)).length;
    }, [contents]);

    return (
        <div className="w-full flex flex-col gap-5 max-w-7xl mx-auto animate-in fade-in duration-200">
            {/* Compact Workspace Header */}
            <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b ${
                isDark ? "border-white/[0.06]" : "border-gray-200"
            }`}>
                <div>
                    <h1 className={`text-lg sm:text-xl font-semibold tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>
                        Collections
                    </h1>
                    <p className={`text-xs mt-0.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                        {rootFolderCount} {rootFolderCount === 1 ? "collection" : "collections"} · {totalOrganizedItems} organized {totalOrganizedItems === 1 ? "memory" : "memories"}
                    </p>
                </div>

                <div className="flex items-center gap-2.5">
                    {rootFolderCount > 4 && (
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                placeholder="Search folders..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className={`h-9 text-xs pl-8 pr-7 rounded-xl border focus:outline-none transition-all ${isDark
                                        ? "bg-[#18181b] border-white/10 text-white placeholder-gray-500 focus:border-purple-500"
                                        : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-purple-600"
                                    }`}
                            />
                            <svg className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => setSearch("")}
                                    className={`absolute right-2 top-1/2 -translate-y-1/2 text-[11px] leading-none p-0.5 rounded transition-colors cursor-pointer ${
                                        isDark ? "text-gray-400 hover:text-white" : "text-gray-400 hover:text-gray-700"
                                    }`}
                                    title="Clear search"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={onCreateCollectionClick}
                        className="h-9 px-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-95 text-white text-xs font-semibold transition-all shadow-sm shadow-purple-600/20 flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                        <span>+</span>
                        <span>New Collection</span>
                    </button>
                </div>
            </div>

            {/* Collections Grid or Empty State */}
            {filteredCollections.length === 0 ? (
                <div className="w-full py-16 flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 rounded-3xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4 shadow-inner">
                        <CollectionIcon icon={DEFAULT_COLLECTION_ICON} className="w-12 h-12" />
                    </div>
                    <h3 className={`text-lg font-bold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>
                        {search ? "No collections found" : "No collections yet"}
                    </h3>
                    <p className="text-xs text-gray-400 max-w-sm mb-6">
                        {search
                            ? `No collections matching "${search}". Try searching for another name.`
                            : "Create custom folders to organize AI research, reading lists, study notes, or videos."}
                    </p>
                    {!search && (
                        <button
                            type="button"
                            onClick={onCreateCollectionClick}
                            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-lg active:scale-95 cursor-pointer"
                        >
                            + Create First Collection
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                    {filteredCollections.map((col) => {
                        const isMenuOpen = activeMenuId === col._id;
                        const subCount = collections.filter(c => c.parentId === col._id).length;
                        const totalItems = getTotalItemsCount(col._id);
                        const parentCol = search.trim() && col.parentId
                            ? collections.find(c => c._id === col.parentId)
                            : null;

                        return (
                            <div
                                key={col._id}
                                onClick={() => onSelectCollection(col)}
                                className={`group relative rounded-2xl border p-4 transition-all duration-200 cursor-pointer flex flex-col justify-between select-none ${isDark
                                        ? "bg-[#18181b]/75 border-white/[0.08] hover:border-purple-500/45 hover:bg-[#1e1e22] hover:shadow-xl"
                                        : "bg-white border-gray-200 hover:border-purple-400 hover:shadow-lg"
                                    }`}
                            >
                                {/* Top Row: Icon + Title + Menu */}
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className={`w-10 h-10 rounded-xl border group-hover:scale-105 transition-transform duration-200 shrink-0 flex items-center justify-center p-1.5 ${
                                            isDark ? "bg-purple-500/10 border-purple-500/20" : "bg-purple-50 border-purple-200/80"
                                        }`}>
                                            <CollectionIcon icon={col.icon} className="w-6 h-6" />
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className={`font-semibold text-sm truncate ${isDark ? "text-white group-hover:text-purple-300" : "text-gray-900 group-hover:text-purple-700"} transition-colors`} title={col.title}>
                                                {col.title}
                                            </h4>
                                            <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                                                {parentCol && (
                                                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md border ${
                                                        isDark
                                                            ? "bg-white/5 text-gray-300 border-white/10"
                                                            : "bg-gray-100 text-gray-600 border-gray-200"
                                                    }`}>
                                                        in {parentCol.title}
                                                    </span>
                                                )}
                                                {subCount > 0 && (
                                                    <span className="text-[10px] font-semibold text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded-md border border-purple-500/20">
                                                        {subCount} {subCount === 1 ? "folder" : "folders"}
                                                    </span>
                                                )}
                                                <span className={`text-[11px] ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                                    {totalItems} {totalItems === 1 ? "item" : "items"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions Dropdown Toggle (shown cleanly on hover or when open) */}
                                    <div className="relative shrink-0" data-col-menu={col._id}>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveMenuId(isMenuOpen ? null : col._id);
                                            }}
                                            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                                                isMenuOpen ? "opacity-100" : "opacity-60 sm:opacity-0 group-hover:opacity-100"
                                            } ${
                                                isDark
                                                    ? "text-gray-400 hover:text-white hover:bg-white/10"
                                                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                                            }`}
                                            title="Collection options"
                                        >
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                <circle cx="12" cy="5" r="2" />
                                                <circle cx="12" cy="12" r="2" />
                                                <circle cx="12" cy="19" r="2" />
                                            </svg>
                                        </button>

                                        {/* Dropdown Menu */}
                                        {isMenuOpen && (
                                            <div
                                                onClick={(e) => e.stopPropagation()}
                                                className={`absolute right-0 top-8 z-30 w-40 rounded-xl border shadow-2xl p-1 animate-in fade-in zoom-in-95 duration-150 ${isDark ? "bg-[#222226] border-white/10 text-gray-200" : "bg-white border-gray-200 text-gray-800"
                                                    }`}
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setActiveMenuId(null);
                                                        onShareCollection(col);
                                                    }}
                                                    className="w-full px-3 py-1.5 rounded-lg text-xs font-medium text-left hover:bg-purple-600 hover:text-white transition-colors flex items-center gap-2 cursor-pointer"
                                                >
                                                    <span>🔗</span>
                                                    <span>{col.shareHash ? "Share Settings" : "Share Folder"}</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setActiveMenuId(null);
                                                        onEditCollection(col);
                                                    }}
                                                    className="w-full px-3 py-1.5 rounded-lg text-xs font-medium text-left hover:bg-purple-600 hover:text-white transition-colors flex items-center gap-2 cursor-pointer"
                                                >
                                                    <span>✏️</span>
                                                    <span>Rename</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setActiveMenuId(null);
                                                        onDeleteCollection(col);
                                                    }}
                                                    className="w-full px-3 py-1.5 rounded-lg text-xs font-medium text-left text-red-400 hover:bg-red-600 hover:text-white transition-colors flex items-center gap-2 cursor-pointer"
                                                >
                                                    <span>🗑️</span>
                                                    <span>Delete</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Bottom Row: Shared status & Enter arrow */}
                                <div className={`flex items-center justify-between pt-3 mt-3 border-t text-xs ${
                                    isDark ? "border-white/[0.06] text-gray-500" : "border-gray-100 text-gray-500"
                                }`}>
                                    {col.shareHash ? (
                                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                                            isDark
                                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                        }`}>
                                            <span>●</span>
                                            <span>Public Shared</span>
                                        </span>
                                    ) : (
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                                            isDark
                                                ? "bg-white/[0.03] text-gray-400 border-white/10"
                                                : "bg-gray-50 text-gray-600 border-gray-200"
                                        }`}>
                                            <svg className="w-3 h-3 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                            <span>Private</span>
                                        </span>
                                    )}

                                    <span className="text-purple-400 group-hover:translate-x-1 transition-transform font-bold text-xs flex items-center gap-1">
                                        <span>Open</span>
                                        <span>→</span>
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
