import { useEffect, useState } from "react";
import type { Collection } from "../../types/collection";
import {
  CollectionIcon,
  DEFAULT_COLLECTION_ICON,
  PRESET_COLLECTION_ICONS,
} from "./CollectionIcon";

interface CollectionModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (title: string, icon: string) => Promise<void>;
  initialCollection?: Collection | null;
  isDark?: boolean;
}

export function CollectionModal({
  open,
  onClose,
  onSave,
  initialCollection,
  isDark = true,
}: CollectionModalProps) {
  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState(DEFAULT_COLLECTION_ICON);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (initialCollection) {
        setTitle(initialCollection.title || "");
        setIcon(initialCollection.icon || DEFAULT_COLLECTION_ICON);
      } else {
        setTitle("");
        setIcon(DEFAULT_COLLECTION_ICON);
      }
      setError(null);
    }
  }, [open, initialCollection]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please enter a collection title");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onSave(title.trim(), icon);
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to save collection");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-md rounded-3xl border shadow-2xl p-6 sm:p-7 relative transition-all ${
          isDark 
            ? "bg-[#18181b] border-white/10 text-white" 
            : "bg-white border-gray-200 text-gray-900"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
              <CollectionIcon icon={icon} className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold">
                {initialCollection ? "Edit Collection" : "New Collection"}
              </h3>
              <p className="text-xs text-gray-400">
                {initialCollection ? "Update folder name and icon" : "Group related memories into a folder"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-5">
          {/* Title Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
              Collection Name
            </label>
            <input
              type="text"
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. AI Research, Design Inspiration, Study..."
              className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium focus:outline-none transition-all ${
                isDark 
                  ? "bg-black/40 border-white/10 focus:border-purple-500 text-white placeholder-gray-500" 
                  : "bg-gray-50 border-gray-200 focus:border-purple-600 text-gray-900 placeholder-gray-400"
              }`}
            />
          </div>

          {/* Icon / Sticker Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
              Choose Icon
            </label>
            <div className="grid grid-cols-6 gap-2 max-h-40 overflow-y-auto p-1 rounded-xl">
              {PRESET_COLLECTION_ICONS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setIcon(preset)}
                  className={`h-11 rounded-xl flex items-center justify-center p-1.5 transition-all cursor-pointer ${
                    icon === preset
                      ? "bg-purple-600/20 border-2 border-purple-500 ring-2 ring-purple-500/30 shadow-md scale-105"
                      : isDark
                        ? "bg-white/5 hover:bg-white/10 hover:scale-105 border border-transparent"
                        : "bg-gray-100 hover:bg-gray-200 hover:scale-105 border border-transparent"
                  }`}
                >
                  <CollectionIcon icon={preset} className="w-7 h-7" />
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                isDark 
                  ? "border-white/10 hover:bg-white/5 text-gray-300" 
                  : "border-gray-200 hover:bg-gray-50 text-gray-700"
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span>{initialCollection ? "Save Changes" : "Create Collection"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
