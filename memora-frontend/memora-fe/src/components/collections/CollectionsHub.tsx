import { useMemo, useState } from "react";
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

    // Compute item count per collection from contents array
    const countsMap = useMemo(() => {
        const map = new Map<string, number>();
        contents.forEach((item) => {
            if (item.collectionId) {
                map.set(item.collectionId, (map.get(item.collectionId) || 0) + 1);
            }
        });
        return map;
    }, [contents]);

    // Recursive item counter including all subfolders
    const getTotalItemsCount = (colId: string): number => {
        let count = countsMap.get(colId) || 0;
        const directChildren = collections.filter(c => c.parentId === colId);
        for (const child of directChildren) {
            count += getTotalItemsCount(child._id);
        }
        return count;
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

    return (
        <div className="w-full flex flex-col gap-8 max-w-7xl mx-auto animate-in fade-in duration-200">
            {/* Header Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>
                            Collections
                        </h1>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/15 text-purple-400 border border-purple-500/20">
                            {rootFolderCount} {rootFolderCount === 1 ? "folder" : "folders"}
                        </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-400 mt-1">
                        Organize your bookmarks, videos, and articles into topic-based collections.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {collections.length > 3 && (
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search folders..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className={`text-xs px-3.5 py-2 pl-8 rounded-xl border focus:outline-none transition-all ${isDark
                                        ? "bg-[#18181b] border-white/10 text-white placeholder-gray-500 focus:border-purple-500"
                                        : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-purple-600"
                                    }`}
                            />
                            <svg className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={onCreateCollectionClick}
                        className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer shrink-0"
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

                        return (
                            <div
                                key={col._id}
                                onClick={() => onSelectCollection(col)}
                                className={`group relative rounded-2xl border p-5 transition-all duration-200 cursor-pointer flex flex-col justify-between select-none ${isDark
                                        ? "bg-[#18181b]/80 border-white/10 hover:border-purple-500/50 hover:bg-[#1f1f23] hover:shadow-xl"
                                        : "bg-white border-gray-200 hover:border-purple-400 hover:shadow-lg"
                                    }`}
                            >
                                {/* Top Row: Icon + Menu */}
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 group-hover:scale-105 transition-transform duration-200 shrink-0 flex items-center justify-center p-2">
                                            <CollectionIcon icon={col.icon} className="w-8 h-8" />
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className={`font-bold text-sm sm:text-base truncate ${isDark ? "text-white group-hover:text-purple-300" : "text-gray-900 group-hover:text-purple-700"} transition-colors`} title={col.title}>
                                                {col.title}
                                            </h4>
                                            <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                                                {(() => {
                                                    const subCount = collections.filter(c => c.parentId === col._id).length;
                                                    const totalFiles = getTotalItemsCount(col._id);
                                                    return (
                                                        <>
                                                            {subCount > 0 && (
                                                                <span className="text-[10px] font-semibold text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded-md border border-purple-500/20">
                                                                    {subCount} {subCount === 1 ? "folder" : "folders"}
                                                                </span>
                                                            )}
                                                            <span className="text-[11px] text-gray-400">
                                                                {totalFiles} {totalFiles === 1 ? "file" : "files"}
                                                            </span>
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions Dropdown Toggle */}
                                    <div className="relative shrink-0">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveMenuId(isMenuOpen ? null : col._id);
                                            }}
                                            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
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
                                <div className="flex items-center justify-between pt-4 mt-3 border-t border-white/5 text-xs text-gray-500">
                                    {col.shareHash ? (
                                        <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                                            <span>●</span>
                                            <span>Public Shared</span>
                                        </span>
                                    ) : (
                                        <span className="text-[11px] text-gray-500">Private</span>
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
