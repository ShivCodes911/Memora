import { useState } from "react";
import type { Collection } from "../../types/collection";
import { CollectionIcon } from "./CollectionIcon";

interface ShareCollectionModalProps {
  open: boolean;
  onClose: () => void;
  collection: Collection | null;
  onToggleShare: (id: string, share: boolean) => Promise<string | null>;
  onCopyToast?: (msg: string) => void;
  isDark?: boolean;
}

export function ShareCollectionModal({
  open,
  onClose,
  collection,
  onToggleShare,
  onCopyToast,
  isDark = true,
}: ShareCollectionModalProps) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!open || !collection) return null;

  const shareUrl = collection.shareHash
    ? `${window.location.origin}/share/c/${collection.shareHash}`
    : "";

  const handleToggle = async (enable: boolean) => {
    try {
      setLoading(true);
      await onToggleShare(collection._id, enable);
      if (enable && onCopyToast) {
        onCopyToast("Collection sharing enabled 🔗");
      } else if (!enable && onCopyToast) {
        onCopyToast("Collection sharing disabled");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    if (onCopyToast) onCopyToast("Collection share link copied! 📋");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-md rounded-3xl border shadow-2xl p-6 sm:p-7 relative transition-all ${isDark
            ? "bg-[#18181b] border-white/10 text-white"
            : "bg-white border-gray-200 text-gray-900"
          }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
              <CollectionIcon icon={collection.icon} className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Share Collection</h3>
              <p className="text-xs text-gray-400 truncate max-w-[240px]">
                {collection.title}
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

        <div className="mt-5 flex flex-col gap-4">
          {collection.shareHash ? (
            <>
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Public Sharing is Active</span>
                </div>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleToggle(false)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-red-400 hover:bg-red-500/20 transition-all cursor-pointer border border-red-500/20"
                >
                  Disable
                </button>
              </div>

              {/* Share URL input with Copy button */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  Public Link
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className={`flex-1 px-3 py-2 rounded-xl text-xs font-mono border focus:outline-none select-all ${isDark
                        ? "bg-black/50 border-white/10 text-gray-300"
                        : "bg-gray-100 border-gray-200 text-gray-800"
                      }`}
                  />
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="p-6 rounded-2xl border border-dashed text-center flex flex-col items-center gap-3">
              <span className="text-3xl">🔒</span>
              <div>
                <h4 className="text-sm font-bold">This folder is currently private</h4>
                <p className="text-xs text-gray-400 mt-1">
                  Generate a shareable link so anyone can view the contents of this collection.
                </p>
              </div>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleToggle(true)}
                className="mt-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer"
              >
                {loading ? "Generating..." : "Generate Public Share Link"}
              </button>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${isDark
                  ? "border-white/10 hover:bg-white/5 text-gray-300"
                  : "border-gray-200 hover:bg-gray-50 text-gray-700"
                }`}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
