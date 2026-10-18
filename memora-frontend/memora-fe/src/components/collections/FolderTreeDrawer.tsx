import React, { useState, useEffect, useRef, useMemo } from "react";
import type { Collection } from "../../types/collection";
import type { Content } from "../../types/content";
import { CollectionIcon } from "./CollectionIcon";
import { TwitterIcon } from "../../icons/twitter";
import { PdfIcon } from "../../icons/pdfIcon";

interface FolderTreeDrawerProps {
  open: boolean;
  onClose: () => void;
  collections: Collection[];
  contents?: Content[];
  selectedCollection?: Collection | null;
  scopedCollection?: Collection | null;
  onSelectCollection: (col: Collection | null) => void;
  onSelectContent?: (item: Content) => void;
  isDark?: boolean;
}

// Wise project-specific icon helper for Memora files/memories
function MemoryFileIcon({ type }: { type: string }) {
  if (type === "youtube" || type === "video") {
    return (
      <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
      </svg>
    );
  }
  if (type === "twitter") {
    return <TwitterIcon className="w-3 h-3 text-sky-400 shrink-0" />;
  }
  if (type === "pdf") {
    return <PdfIcon className="w-3.5 h-3.5 text-rose-500 shrink-0" />;
  }
  // Article / Web Bookmark / Note
  return (
    <svg className="w-3.5 h-3.5 text-purple-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

export const FolderTreeDrawer: React.FC<FolderTreeDrawerProps> = ({
  open,
  onClose,
  collections,
  contents = [],
  selectedCollection,
  scopedCollection,
  onSelectCollection,
  onSelectContent,
  isDark = true,
}) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const activeItemRef = useRef<HTMLDivElement | null>(null);

  // Group memories by collectionId
  const filesByCollection = useMemo(() => {
    const map = new Map<string, Content[]>();
    contents.forEach((item) => {
      const key = item.collectionId || "root";
      const list = map.get(key) || [];
      list.push(item);
      map.set(key, list);
    });
    return map;
  }, [contents]);

  // Build recursive tree from flat parentId structure
  const tree = useMemo(() => {
    const map = new Map<string, Collection & { children: any[] }>();
    collections.forEach((c) => map.set(c._id, { ...c, children: [] }));
    const roots: any[] = [];

    collections.forEach((c) => {
      const node = map.get(c._id)!;
      if (c.parentId && map.has(c.parentId)) {
        map.get(c.parentId)!.children.push(node);
      } else if (!scopedCollection) {
        roots.push(node);
      }
    });

    // If scopedCollection is provided, only return this collection as the root of the tree
    if (scopedCollection && map.has(scopedCollection._id)) {
      return [map.get(scopedCollection._id)!];
    }

    return roots;
  }, [collections, scopedCollection]);

  // When scopedCollection opens, auto-expand it and its direct children
  useEffect(() => {
    if (scopedCollection && open) {
      setExpandedIds(new Set([scopedCollection._id]));
    }
  }, [scopedCollection, open]);

  // Auto-locate selected collection
  useEffect(() => {
    if (!selectedCollection) return;

    const ancestors = new Set<string>();
    let curr = collections.find((c) => c._id === selectedCollection._id);
    while (curr?.parentId) {
      ancestors.add(curr.parentId);
      curr = collections.find((c) => c._id === curr?.parentId);
    }

    if (ancestors.size > 0) {
      setExpandedIds((prev) => new Set([...prev, ...ancestors]));
    }

    if (open) {
      setTimeout(() => {
        activeItemRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 150);
    }
  }, [selectedCollection, collections, open]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const renderFolderNode = (node: Collection & { children: any[] }) => {
    const isExpanded = expandedIds.has(node._id);
    const isSelected = selectedCollection?._id === node._id;
    const childFolders = node.children || [];
    const childFiles = filesByCollection.get(node._id) || [];
    const hasChildren = childFolders.length > 0 || childFiles.length > 0;

    const q = searchQuery.toLowerCase().trim();
    const folderMatches = !q || node.title.toLowerCase().includes(q);
    const hasMatchingFiles = q ? childFiles.some((f) => (f.title || "").toLowerCase().includes(q)) : true;
    if (!folderMatches && !hasMatchingFiles && childFolders.length === 0) return null;

    const hasCustomIcon =
      node.icon &&
      node.icon !== "📁" &&
      !node.icon.includes("opened-folder");

    return (
      <li key={node._id} className="relative mt-1 group/item">
        {/* Folder Label */}
        <div
          ref={isSelected ? activeItemRef : null}
          onClick={() => onSelectCollection(node)}
          className={`flex items-center gap-2 px-2 h-7.5 rounded-lg text-xs cursor-pointer transition-colors duration-150 select-none ${
            isSelected
              ? isDark
                ? "bg-purple-600/20 text-purple-200 font-semibold border border-purple-500/30"
                : "bg-purple-50 text-purple-700 font-semibold border border-purple-200"
              : isDark
              ? "text-gray-300 hover:bg-white/5 hover:text-white"
              : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          }`}
        >
          {/* Expand/Collapse Chevron */}
          {hasChildren ? (
            <button
              type="button"
              onClick={(e) => toggleExpand(node._id, e)}
              className="w-4 h-4 flex items-center justify-center rounded hover:bg-white/10 text-gray-400 hover:text-white shrink-0 cursor-pointer"
            >
              <svg
                className={`w-3 h-3 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <span className="w-4 h-4 shrink-0" />
          )}

          {/* Folder Icon */}
          <div className="shrink-0 flex items-center">
            {hasCustomIcon ? (
              <CollectionIcon icon={node.icon} className="w-4 h-4" />
            ) : isExpanded ? (
              <svg
                className="w-4 h-4 text-amber-400 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 2H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
                <path d="M2 10h20" />
              </svg>
            ) : (
              <svg
                className="w-4 h-4 text-amber-500/80 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 2H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
              </svg>
            )}
          </div>

          <span className="truncate flex-1 font-medium">{node.title}</span>

          {childFiles.length > 0 && (
            <span className="text-[10px] text-gray-500 px-1.5 py-0.2 rounded-full bg-white/5">
              {childFiles.length}
            </span>
          )}

          {isSelected && (
            <span className="w-4 h-4 rounded-full bg-purple-500/30 text-purple-300 text-[10px] font-bold flex items-center justify-center shrink-0">
              ✓
            </span>
          )}
        </div>

        {/* Smooth Accordion Height with Branch Connector Lines */}
        <div
          className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
            isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          }`}
        >
          <div className="overflow-hidden">
            <ul
              className={`ml-[11px] pl-[11px] border-l ${
                isDark ? "border-white/10" : "border-gray-200"
              }`}
            >
              {/* Nested Subfolders */}
              {childFolders.map((child: any) => (
                <div
                  key={child._id}
                  className={`relative before:content-[''] before:absolute before:-left-[11px] before:top-[14px] before:w-[11px] before:h-[1px] ${
                    isDark ? "before:bg-white/10" : "before:bg-gray-200"
                  }`}
                >
                  {renderFolderNode(child)}
                </div>
              ))}

              {/* Memory Files inside this folder */}
              {childFiles.map((file) => {
                const fileMatches = !q || (file.title || "").toLowerCase().includes(q);
                if (!fileMatches) return null;
                return (
                  <li
                    key={file._id}
                    onClick={() => {
                      onSelectCollection(node);
                      if (onSelectContent) onSelectContent(file);
                    }}
                    className={`relative mt-1 flex items-center gap-2 px-2 h-7 rounded-lg text-xs cursor-pointer transition-colors select-none before:content-[''] before:absolute before:-left-[11px] before:top-[14px] before:w-[11px] before:h-[1px] ${
                      isDark
                        ? "text-gray-400 hover:bg-white/5 hover:text-gray-200 before:bg-white/10"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 before:bg-gray-200"
                    }`}
                  >
                    <span className="w-4 h-4 flex items-center justify-center shrink-0">
                      <MemoryFileIcon type={file.type} />
                    </span>
                    <span className="truncate flex-1 text-[11px]">{file.title || "Untitled Memory"}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </li>
    );
  };

  const rootUnorganizedFiles = filesByCollection.get("root") || [];

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity duration-200"
      />

      {/* Slide-in Drawer */}
      <aside
        className={`fixed top-0 right-0 bottom-0 z-50 w-80 sm:w-96 border-l shadow-2xl flex flex-col transition-transform duration-300 ease-out animate-in slide-in-from-right ${
          isDark
            ? "bg-[#18181b] border-white/10 text-gray-200"
            : "bg-white border-gray-200 text-gray-800"
        }`}
      >
        {/* Drawer Header */}
        <div className={`flex items-center justify-between p-4 border-b ${isDark ? "border-white/5" : "border-gray-100"}`}>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-500/15 text-purple-400">
              {scopedCollection ? (
                <CollectionIcon icon={scopedCollection.icon} className="w-4 h-4" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 2H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
                  <path d="M2 10h20" />
                </svg>
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold truncate max-w-[190px]">
                {scopedCollection ? scopedCollection.title : "Explorer Tree"}
              </h3>
              <p className="text-[10px] text-gray-400">
                {scopedCollection
                  ? "Only showing this collection's content"
                  : `${collections.length} folders • ${contents.length} files`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isDark ? "hover:bg-white/10 text-gray-400 hover:text-white" : "hover:bg-gray-100 text-gray-500"
            }`}
          >
            ✕
          </button>
        </div>

        {/* Filter Input */}
        <div className="p-3">
          <div className="relative flex items-center">
            <svg className="w-3.5 h-3.5 absolute left-3 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder={scopedCollection ? `Search in ${scopedCollection.title}...` : "Search folders or files..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-8.5 pr-6 py-1.5 text-xs rounded-xl border focus:outline-none transition-all ${
                isDark
                  ? "bg-white/5 border-white/10 text-gray-200 placeholder-gray-500 focus:border-purple-500/50"
                  : "bg-gray-100 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-purple-400"
              }`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 text-xs text-gray-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Tree Container */}
        <div className="flex-1 overflow-y-auto px-3 pb-6 flex flex-col gap-1 [scrollbar-width:thin]">
          {/* If NOT scoped, show Root Vault option */}
          {!scopedCollection && (
            <>
              <div
                onClick={() => onSelectCollection(null)}
                className={`flex items-center gap-2 py-2 px-2.5 rounded-xl text-xs cursor-pointer transition-all border ${
                  !selectedCollection
                    ? isDark
                      ? "bg-purple-600/20 text-purple-300 font-semibold border-purple-500/40 shadow-xs"
                      : "bg-purple-50 text-purple-700 font-semibold border-purple-300 shadow-xs"
                    : isDark
                    ? "border-transparent text-gray-400 hover:bg-white/5 hover:text-white"
                    : "border-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <svg className="w-4 h-4 text-purple-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
                <span className="truncate font-semibold flex-1">All Vault Memories</span>
                {!selectedCollection && (
                  <span className="w-4 h-4 rounded-full bg-purple-500/30 text-purple-300 text-[10px] font-bold flex items-center justify-center shrink-0">
                    ✓
                  </span>
                )}
              </div>

              <div className="my-1 border-t border-white/5" />
            </>
          )}

          {/* Hierarchical Folder & File Tree */}
          <ul className="list-none p-0 m-0">
            {tree.map((rootNode) => renderFolderNode(rootNode))}

            {/* Unorganized Root Files (only when NOT scoped to a single collection) */}
            {!scopedCollection && rootUnorganizedFiles.length > 0 && (
              <li className="relative mt-2 pt-2 border-t border-white/5">
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-500 flex items-center justify-between">
                  <span>Unorganized Files</span>
                  <span className="text-[10px]">{rootUnorganizedFiles.length}</span>
                </div>
                <ul className="ml-[11px] pl-[11px] border-l border-white/10 mt-1">
                  {rootUnorganizedFiles.map((file) => (
                    <li
                      key={file._id}
                      onClick={() => {
                        onSelectCollection(null);
                        if (onSelectContent) onSelectContent(file);
                      }}
                      className="relative mt-1 flex items-center gap-2 px-2 h-7 rounded-lg text-xs cursor-pointer transition-colors select-none text-gray-400 hover:bg-white/5 hover:text-gray-200 before:content-[''] before:absolute before:-left-[11px] before:top-[14px] before:w-[11px] before:h-[1px] before:bg-white/10"
                    >
                      <span className="w-4 h-4 flex items-center justify-center shrink-0">
                        <MemoryFileIcon type={file.type} />
                      </span>
                      <span className="truncate flex-1 text-[11px]">{file.title || "Untitled Memory"}</span>
                    </li>
                  ))}
                </ul>
              </li>
            )}
          </ul>
        </div>
      </aside>
    </>
  );
};
