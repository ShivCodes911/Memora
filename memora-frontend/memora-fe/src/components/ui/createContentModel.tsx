import { useCallback, useEffect, useRef, useState } from "react";
import { CrossIcon } from "../../icons/crossIcon";
import axios from "axios";
import { BACKEND_URL } from "../../config";
import type { ContentType } from "../../types/content";
import type { Collection } from "../../types/collection";
import { YoutubeIcon } from "../../icons/youtube";
import { PdfIcon } from "../../icons/pdfIcon";

interface ContentModalProps {
    open: boolean;
    onClose: () => void;
    type?: ContentType;
    onSuccess?: (message?: string, collection?: Collection) => void;
    collections?: Collection[];
    defaultCollectionId?: string | null;
}

interface LinkMetadata {
    title: string;
    description: string;
    image: string;
    favicon: string;
    domain: string;
}

const TYPES: { label: string; value: ContentType; renderIcon: () => React.ReactNode }[] = [
    { label: "YouTube", value: "youtube", renderIcon: () => <YoutubeIcon /> },
    { label: "Twitter / X", value: "twitter", renderIcon: () => (
        <img
            width="50"
            height="50"
            src="https://img.icons8.com/ios/50/twitterx--v2.png"
            alt="twitterx--v2"
            className="w-4 h-4 object-contain invert opacity-90"
        />
    ) },
    { label: "Video File", value: "video", renderIcon: () => (
        <img
            width="24"
            height="24"
            src="https://img.icons8.com/softteal-line/24/video.png"
            alt="video"
            className="w-4 h-4 object-contain brightness-110"
        />
    ) },
    { label: "Article", value: "article", renderIcon: () => (
        <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
    ) },
    { label: "PDF Doc", value: "pdf", renderIcon: () => <PdfIcon className="w-4 h-4 text-red-500" /> },
];

function isValidUrl(str: string): boolean {
    try {
        const url = new URL(str.startsWith("http") ? str : `https://${str}`);
        return !!url.hostname.includes(".");
    } catch {
        return false;
    }
}

export function isDriveFolderUrl(urlStr: string): boolean {
    if (!urlStr) return false;
    const str = urlStr.trim();
    return (
        /drive(?:\.google\.com)?\/(?:u\/\d+\/)?(?:mobile\/)?folders\/([a-zA-Z0-9_-]+)/i.test(str) ||
        /drive(?:\.google\.com)?\/(?:folderview|open)\?.*?\bid=([a-zA-Z0-9_-]+)/i.test(str) ||
        (/[?&]id=([a-zA-Z0-9_-]{15,60})/i.test(str) && str.includes("drive.google.com"))
    );
}

export function CreateContentModal({ 
    open, 
    onClose, 
    type: initialType = "youtube", 
    onSuccess,
    collections = [],
    defaultCollectionId = null,
}: ContentModalProps) {
    const titleRef = useRef<HTMLInputElement | null>(null);
    const linkRef = useRef<HTMLInputElement | null>(null);
    const descRef = useRef<HTMLTextAreaElement | null>(null);
    const [type, setType] = useState<ContentType>(initialType);
    const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(defaultCollectionId || null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [metadata, setMetadata] = useState<LinkMetadata | null>(null);
    const [fetchingMeta, setFetchingMeta] = useState(false);
    const [titleManuallyEdited, setTitleManuallyEdited] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [titleText, setTitleText] = useState("");
    const [descText, setDescText] = useState("");
    const [detectedTypeLabel, setDetectedTypeLabel] = useState<string | null>(null);
    const [isLinkValid, setIsLinkValid] = useState<boolean | null>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Google Drive Folder specific state
    const [isDriveFolder, setIsDriveFolder] = useState(false);
    const [customDriveTitle, setCustomDriveTitle] = useState("");
    const [driveApiKey, setDriveApiKey] = useState("");
    const [showApiKeyInput, setShowApiKeyInput] = useState(false);
    const [recursiveSubfolders, setRecursiveSubfolders] = useState(true);

    // Reset state when modal opens/closes
    useEffect(() => {
        if (open) {
            setSelectedCollectionId(defaultCollectionId || null);
            setMetadata(null);
            setFetchingMeta(false);
            setTitleManuallyEdited(false);
            setTitleText("");
            setDescText("");
            setDetectedTypeLabel(null);
            setIsLinkValid(null);
            setError(null);
            setIsDropdownOpen(false);
            setIsDriveFolder(false);
            setCustomDriveTitle("");
            setDriveApiKey("");
            setShowApiKeyInput(false);
            setRecursiveSubfolders(true);
        }
    }, [open, defaultCollectionId]);

    const fetchMetadata = useCallback(async (url: string) => {
        if (!isValidUrl(url) || isDriveFolderUrl(url)) return;
        try {
            setFetchingMeta(true);
            const response = await axios.get(`${BACKEND_URL}/api/v1/content/preview/metadata`, {
                params: { url },
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });
            const data: LinkMetadata & { isPdf?: boolean; type?: string } = response.data;
            setMetadata(data);

            // Auto-detect PDF from server response
            if (
                data?.isPdf ||
                data?.type === "pdf" ||
                data?.description === "PDF Document" ||
                data?.title?.toLowerCase().endsWith(".pdf") ||
                data?.title?.toLowerCase().includes(".pdf")
            ) {
                setType("pdf");
            }

            // Auto-fill title only if user hasn't manually edited it and the title is meaningful (not just domain)
            const isMeaningfulTitle = data.title && data.domain && data.title.toLowerCase() !== data.domain.toLowerCase();
            if (!titleManuallyEdited && isMeaningfulTitle && titleRef.current) {
                const autoTitle = data.title.slice(0, 200);
                titleRef.current.value = autoTitle;
                setTitleText(autoTitle);
            }
        } catch {
            // Silently fail — metadata is optional enrichment
        } finally {
            setFetchingMeta(false);
        }
    }, [titleManuallyEdited]);

    const handleLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawVal = e.target.value.trim();
        const val = rawVal.toLowerCase();

        // Check for Google Drive folder
        const driveFolderDetected = isDriveFolderUrl(rawVal);
        setIsDriveFolder(driveFolderDetected);

        // Update URL validity
        if (!rawVal) {
            setIsLinkValid(null);
            setDetectedTypeLabel(null);
        } else {
            setIsLinkValid(isValidUrl(rawVal) || driveFolderDetected);
        }

        if (driveFolderDetected) {
            setDetectedTypeLabel("Google Drive Folder");
            if (!titleManuallyEdited && titleRef.current && !titleRef.current.value) {
                titleRef.current.value = "Google Drive Folder Import";
                setTitleText("Google Drive Folder Import");
            }
        } else if (
            val.includes(".pdf") || 
            val.includes("/pdf") || 
            val.includes("arxiv.org/pdf") ||
            val.includes("arxiv.org/abs") ||
            val.includes("drive.google.com") ||
            val.includes("docs.google.com") ||
            val.includes("openreview.net/pdf") ||
            val.includes("format=pdf") ||
            val.includes("download=pdf") ||
            val.includes("type=pdf") ||
            val.endsWith(".pdf")
        ) {
            setType("pdf");
            setDetectedTypeLabel("PDF Document");
        } else if (val.includes("youtube.com") || val.includes("youtu.be")) {
            setType("youtube");
            setDetectedTypeLabel("YouTube Video");
        } else if (val.includes(".mp4") || val.includes(".webm") || val.includes(".ogg")) {
            setType("video");
            setDetectedTypeLabel("Video File");
        } else if (val.includes("x.com") || val.includes("twitter.com")) {
            setType("twitter");
            setDetectedTypeLabel("Twitter / X");
        } else if (isValidUrl(rawVal)) {
            setType("article");
            setDetectedTypeLabel("Article / Web Page");
        }

        // Debounce metadata fetch for non-folder links
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (!driveFolderDetected) {
            debounceRef.current = setTimeout(() => {
                if (rawVal && isValidUrl(rawVal)) {
                    fetchMetadata(rawVal);
                } else {
                    setMetadata(null);
                }
            }, 500);
        } else {
            setMetadata(null);
        }
    };

    async function addContent(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        const title = (titleText || titleRef.current?.value || "").trim();
        const link = linkRef.current?.value?.trim();
        const description = (descText || descRef.current?.value || "").trim();

        if (!link) {
            setError("Please provide a valid URL.");
            return;
        }

        const isFolder = isDriveFolder || isDriveFolderUrl(link);

        // Handle Google Drive folder ingestion workflow
        if (isFolder) {
            try {
                setLoading(true);
                const response = await axios.post(
                    `${BACKEND_URL}/api/v1/content/import/drive-folder`,
                    {
                        url: link,
                        collectionTitle: customDriveTitle.trim() || undefined,
                        apiKey: driveApiKey.trim() || undefined,
                        maxDepth: recursiveSubfolders ? 2 : 0
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`
                        }
                    }
                );

                const successMsg = response.data?.message || `Imported ${response.data?.importedCount || 0} files successfully! 🎉`;
                if (onSuccess) onSuccess(successMsg, response.data?.collection);
                onClose();
            } catch (err: any) {
                const msg = err?.response?.data?.message || "Failed to import Google Drive folder. Please verify permissions.";
                setError(msg);
            } finally {
                setLoading(false);
            }
            return;
        }

        if (!title) {
            setError("Please fill in both title and link URL.");
            return;
        }

        try {
            setLoading(true);
            await axios.post(
                `${BACKEND_URL}/api/v1/content`,
                { link, type, title, description, collectionId: selectedCollectionId || null },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                }
            );

            if (onSuccess) onSuccess("Memory saved successfully! ✨");
            onClose();
        } catch (err: any) {
            if (err?.response?.status === 409) {
                setError("This link is already saved in your vault.");
            } else {
                setError(err?.response?.data?.message || "Failed to add memory. Please check URL.");
            }
        } finally {
            setLoading(false);
        }
    }

    const isPermissionError = error && (
        error.includes("Anyone with the link") ||
        error.includes("permission") ||
        error.includes("access") ||
        error.includes("No files could be retrieved") ||
        error.includes("private")
    );

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/40 dark:bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#111] rounded-3xl border border-gray-200 dark:border-white/10 shadow-2xl w-full max-w-lg overflow-hidden p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto transform transition-all">
                {/* Header */}
                <div className="flex items-center justify-between pb-5 border-b border-gray-100 dark:border-white/10">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                            {isDriveFolder ? "📁 Import Drive Folder" : "Add New Memory"}
                        </h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {isDriveFolder 
                                ? "Auto-extract and organize folder files into a collection" 
                                : "Save videos, tweets, articles, PDFs or Drive folders to your brain"}
                        </p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                    >
                        <CrossIcon />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={addContent} className="mt-6 flex flex-col gap-5">
                    {/* Permission Guidance Banner when restricted error occurs */}
                    {isPermissionError ? (
                        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-900 dark:text-amber-200 flex flex-col gap-2.5 animate-in fade-in duration-200">
                            <div className="flex items-center gap-2">
                                <span className="text-lg">🔒</span>
                                <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                                    Google Drive Sharing Required
                                </span>
                            </div>
                            <p className="text-xs text-amber-700 dark:text-amber-300/90 leading-relaxed">
                                {error}
                            </p>
                            <div className="p-2.5 rounded-xl bg-white/60 dark:bg-black/30 text-[11px] space-y-1">
                                <p className="font-semibold text-amber-900 dark:text-amber-200">How to fix in 10 seconds:</p>
                                <ol className="list-decimal list-inside space-y-0.5 text-gray-700 dark:text-gray-300">
                                    <li>In Google Drive, right-click folder ➔ click <strong>Share</strong></li>
                                    <li>Change General access from <strong>Restricted</strong> to <strong>Anyone with the link</strong></li>
                                    <li>Click <strong>Copy link</strong> and retry</li>
                                </ol>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                                className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline self-start mt-0.5 cursor-pointer"
                            >
                                {showApiKeyInput ? "Hide API Key input" : "Have a Google Drive API Key? Click here"}
                            </button>
                        </div>
                    ) : error && error.includes("already saved") ? (
                        <div className="px-4 py-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-500/30 text-xs text-purple-900 dark:text-purple-200 flex items-start gap-2.5 animate-in fade-in">
                            <span className="shrink-0 text-base leading-none">🧠</span>
                            <div>
                                <span className="font-bold block mb-0.5">Already in Your Vault</span>
                                <span className="leading-relaxed">This exact link is already saved in your second brain.</span>
                            </div>
                        </div>
                    ) : error && (
                        <div className="px-4 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-xs text-red-600 dark:text-red-400 flex items-start gap-2.5">
                            <span className="shrink-0 text-base leading-none">⚠️</span>
                            <span className="leading-relaxed">{error}</span>
                        </div>
                    )}

                    {/* Link Input (prominent at top) */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                                URL / Link / Folder
                            </label>
                            {detectedTypeLabel && !isDriveFolder && (
                                <span className="text-[11px] font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 px-2 py-0.5 rounded-full animate-in fade-in">
                                    ✨ Auto-detected as {detectedTypeLabel}
                                </span>
                            )}
                        </div>
                        <div className="relative">
                            <input
                                ref={linkRef}
                                type="text"
                                onChange={handleLinkChange}
                                placeholder="https://drive.google.com/drive/folders/..., https://arxiv.org/pdf/..., etc."
                                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-sm focus:border-purple-500 dark:focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 dark:focus:ring-purple-500/20 outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600 pr-10"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                                {fetchingMeta && (
                                    <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                                )}
                                {isLinkValid && !fetchingMeta && (
                                    <span className="text-emerald-500 text-sm font-bold" title="Valid Web Link">✓</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Google Drive Folder Banner & Controls */}
                    {isDriveFolder ? (
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-blue-500/25 dark:border-blue-400/25 shadow-sm flex flex-col gap-3.5 animate-in fade-in duration-300">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/20 dark:bg-blue-500/30 text-blue-600 dark:text-blue-300 flex items-center justify-center text-xl shrink-0 shadow-inner">
                                    📁
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                                            Google Drive Folder Detected
                                        </span>
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/20 text-blue-600 dark:text-blue-300">
                                            Batch Ingest
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
                                        Memora will scan this folder, extract all files (PDFs, docs, videos, notes) across subfolders, and automatically organize them into a dedicated Collection in your second brain.
                                    </p>
                                </div>
                            </div>

                            <div className="pt-1 border-t border-blue-500/15 dark:border-blue-400/15 flex flex-col gap-3">
                                <div>
                                    <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1">
                                        Collection Name <span className="font-normal lowercase text-gray-400">(optional - auto-detected from Drive if blank)</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={customDriveTitle}
                                        onChange={(e) => setCustomDriveTitle(e.target.value)}
                                        placeholder="e.g. Distributed Systems Notes 2026"
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 text-xs text-gray-900 dark:text-white outline-none focus:border-blue-500 transition-all placeholder:text-gray-400"
                                    />
                                </div>

                                <div className="flex items-center justify-between gap-4">
                                    <label className="flex items-center gap-2.5 cursor-pointer text-xs text-gray-700 dark:text-gray-300 select-none">
                                        <input
                                            type="checkbox"
                                            checked={recursiveSubfolders}
                                            onChange={(e) => setRecursiveSubfolders(e.target.checked)}
                                            className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer accent-blue-600"
                                        />
                                        <span className="font-medium">Recursively crawl subfolders</span>
                                    </label>

                                    <button
                                        type="button"
                                        onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                                        className="text-[11px] text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 cursor-pointer underline"
                                    >
                                        {showApiKeyInput ? "Hide API Key" : "Add API Key"}
                                    </button>
                                </div>

                                {showApiKeyInput && (
                                    <div className="pt-2 border-t border-blue-500/10">
                                        <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1">
                                            🔑 Google Drive API Key <span className="font-normal lowercase text-gray-400">(optional)</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={driveApiKey}
                                            onChange={(e) => setDriveApiKey(e.target.value)}
                                            placeholder="AIzaSy..."
                                            className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 text-xs text-gray-900 dark:text-white outline-none focus:border-blue-500 transition-all placeholder:text-gray-400"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Content Type Selector */}
                            <div>
                                <label className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-2">
                                    Select Type
                                </label>
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-sm focus:border-purple-500 dark:focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all cursor-pointer"
                                    >
                                        <div className="flex items-center gap-2">
                                            {type === "article" && metadata?.favicon ? (
                                                <img src={metadata.favicon} alt="" className="w-5 h-5 rounded-sm object-contain bg-white p-0.5" />
                                            ) : (
                                                TYPES.find(t => t.value === type)?.renderIcon()
                                            )}
                                            <span className="font-medium">{TYPES.find(t => t.value === type)?.label}</span>
                                        </div>
                                        <svg className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                    
                                    {isDropdownOpen && (
                                        <div className="absolute top-full left-0 right-0 mt-2 p-1 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                            {TYPES.map((t) => (
                                                <button
                                                    key={t.value}
                                                    type="button"
                                                    onClick={() => {
                                                        setType(t.value);
                                                        setIsDropdownOpen(false);
                                                    }}
                                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                                                        type === t.value
                                                            ? "bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400"
                                                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                                                    }`}
                                                >
                                                    {t.value === "article" && metadata?.favicon ? (
                                                        <img src={metadata.favicon} alt="" className="w-5 h-5 rounded-sm object-contain bg-white p-0.5" />
                                                    ) : (
                                                        t.renderIcon()
                                                    )}
                                                    {t.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Live Metadata Preview */}
                            {metadata && (metadata.title || metadata.image) && (
                                <div className="rounded-xl border border-purple-100 dark:border-purple-500/20 bg-gradient-to-br from-purple-50/60 to-indigo-50/40 dark:from-purple-500/10 dark:to-indigo-500/10 p-3 flex gap-3 items-start animate-in fade-in duration-300">
                                    {metadata.image && (
                                        <img
                                            src={metadata.image}
                                            alt="Preview"
                                            className="w-16 h-16 rounded-lg object-cover shrink-0 border border-gray-200 dark:border-white/10"
                                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                        />
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            {metadata.favicon && (
                                                <img src={metadata.favicon} alt="" className="w-3.5 h-3.5 rounded-sm bg-white" />
                                            )}
                                            <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                                                {metadata.domain || "Preview"}
                                            </span>
                                        </div>
                                        {metadata.title && (
                                            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 line-clamp-1">{metadata.title}</p>
                                        )}
                                        {metadata.description && (
                                            <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5">{metadata.description}</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Collection Selector */}
                            {collections && collections.length > 0 && (
                                <div>
                                    <label className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-1.5">
                                        Collection <span className="font-normal lowercase">(optional folder)</span>
                                    </label>
                                    <select
                                        value={selectedCollectionId || ""}
                                        onChange={(e) => setSelectedCollectionId(e.target.value || null)}
                                        className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-sm focus:border-purple-500 dark:focus:border-purple-500 outline-none transition-all cursor-pointer"
                                    >
                                        <option value="">📁 General Vault (No Collection)</option>
                                        {collections.map((c) => (
                                            <option key={c._id} value={c._id}>
                                                {c.icon || "📁"} {c.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Title Input */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                                        Memory Title
                                        {metadata?.title && !titleManuallyEdited && (
                                            <span className="ml-2 text-[10px] font-medium text-purple-500 dark:text-purple-400 normal-case tracking-normal">
                                                ✨ Auto-filled from link
                                            </span>
                                        )}
                                    </label>
                                    <span className={`text-[10px] tabular-nums ${titleText.length >= 190 ? 'text-amber-500 font-bold' : 'text-gray-400'}`}>
                                        {titleText.length}/200
                                    </span>
                                </div>
                                <input
                                    ref={titleRef}
                                    type="text"
                                    maxLength={200}
                                    value={titleText}
                                    onChange={(e) => {
                                        setTitleText(e.target.value);
                                        setTitleManuallyEdited(true);
                                    }}
                                    placeholder="e.g. Building Next-Gen Web Apps with React"
                                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-sm focus:border-purple-500 dark:focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 dark:focus:ring-purple-500/20 outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600"
                                />
                            </div>

                            {/* Description Input */}
                            {type !== "twitter" && (
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                                            Description <span className="font-normal lowercase">(optional)</span>
                                        </label>
                                        <span className={`text-[10px] tabular-nums ${descText.length >= 4800 ? 'text-amber-500 font-bold' : 'text-gray-400'}`}>
                                            {descText.length}/5000
                                        </span>
                                    </div>
                                    <textarea
                                        ref={descRef}
                                        rows={2}
                                        maxLength={5000}
                                        value={descText}
                                        onChange={(e) => setDescText(e.target.value)}
                                        placeholder="Add your thoughts or summary here..."
                                        className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-sm focus:border-purple-500 dark:focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 dark:focus:ring-purple-500/20 outline-none transition-all resize-none placeholder:text-gray-400 dark:placeholder:text-gray-600"
                                    />
                                </div>
                            )}
                        </>
                    )}

                    {/* Submit Button */}
                    <div className="pt-2 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-200 cursor-pointer border border-gray-200 dark:border-white/10 bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 dark:bg-white/5 dark:hover:bg-white/10 dark:text-gray-300 dark:hover:text-white active:scale-95"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-6 py-2.5 rounded-xl font-semibold text-sm shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center min-w-[140px] text-white ${
                                isDriveFolder
                                    ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-blue-500/25 min-w-[190px]"
                                    : "bg-purple-600 hover:bg-purple-700 shadow-purple-500/20"
                            }`}
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>{isDriveFolder ? "Importing Drive Files..." : "Saving..."}</span>
                                </div>
                            ) : (
                                isDriveFolder ? "⚡ Import Drive Folder" : "Save Memory"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
