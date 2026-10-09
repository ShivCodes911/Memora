import { useEffect, useState } from "react";
import { ShareIcon } from "../../icons/shareIcon";
import { Delete } from "../../icons/delete";
import { YoutubeIcon } from "../../icons/youtube";
import { TwitterIcon } from "../../icons/twitter";
import { PdfIcon } from "../../icons/pdfIcon";
import type { ContentType } from "../../types/content";
import axios from "axios";
import { BACKEND_URL } from "../../config";

declare global {
  interface Window {
    twttr?: {
      widgets?: {
        load?: (element?: HTMLElement | null) => void;
      };
    };
  }
}

interface CardProps {
    _id: string;
    title: string;
    link: string;
    type: ContentType;
    onDelete: (id: string) => void;
    onCopyToast?: (msg: string) => void;
    isDark?: boolean;
}

interface LinkMetadata {
    title: string;
    description: string;
    image: string;
    favicon: string;
    domain: string;
}

function getYouTubeEmbedUrl(link: string) {
  try {
    if (link.includes("youtu.be/")) {
      const id = link.split("youtu.be/")[1]?.split("?")[0]?.split("&")[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    if (link.includes("watch?v=")) {
      const id = link.split("watch?v=")[1]?.split("&")[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    return link.replace("watch?v=", "embed/");
  } catch {
    return link;
  }
}

function getPdfViewerUrl(link: string) {
  try {
    const rawUrl = link.startsWith("http") ? link : `https://${link}`;
    if (rawUrl.includes("drive.google.com/file/d/")) {
      const fileId = rawUrl.split("drive.google.com/file/d/")[1]?.split("/")[0];
      if (fileId) {
        return `https://drive.google.com/file/d/${fileId}/preview`;
      }
    }
    return `https://docs.google.com/gview?url=${encodeURIComponent(rawUrl)}&embedded=true`;
  } catch {
    return link;
  }
}

export const Card = ({ _id, title, link, type, onDelete, onCopyToast, isDark }: CardProps) => {
    const [metadata, setMetadata] = useState<LinkMetadata | null>(null);
    const [imgError, setImgError] = useState(false);
    const [readerOpen, setReaderOpen] = useState(false);

    // Twitter widget loader
    useEffect(() => {
        if (type === "twitter") {
            if (window.twttr?.widgets?.load) {
                window.twttr.widgets.load();
            } else {
                const script = document.querySelector('script[src="https://platform.twitter.com/widgets.js"]');
                if (script) {
                    const handleLoad = () => window.twttr?.widgets?.load?.();
                    script.addEventListener('load', handleLoad);
                    return () => script.removeEventListener('load', handleLoad);
                }
            }
        }
    }, [type, link, isDark]);

    // Fetch OG metadata for non-media cards
    useEffect(() => {
        if (type === "youtube" || type === "twitter") return;
        let cancelled = false;
        axios.get(`${BACKEND_URL}/api/v1/content/preview/metadata`, {
            params: { url: link },
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        }).then((res) => {
            if (!cancelled) setMetadata(res.data);
        }).catch(() => {});
        return () => { cancelled = true; };
    }, [link, type]);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(link);
        if (onCopyToast) {
            onCopyToast("Link copied to clipboard! 🔗");
        } else {
            alert("Url Copied !");
        }
    };

    const isPdf = type === "pdf";
    const isArticle = type !== "youtube" && type !== "twitter" && type !== "pdf";
    const hasImage = isArticle && metadata?.image && !imgError;
    const domainName = metadata?.domain || (() => { try { return new URL(link.startsWith("http") ? link : `https://${link}`).hostname; } catch { return ""; } })();

    return (
        <>
        <div className={`rounded-2xl border p-5 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col w-full h-[400px] hover:-translate-y-1 group relative overflow-hidden ${
            isDark 
                ? "bg-[#1e1d1b] border-white/10 text-gray-100 hover:border-purple-500/40 shadow-black/40" 
                : "bg-white border-gray-200/80 text-gray-800"
        }`}>
            {/* Card Header */}
            <div className={`flex items-start justify-between gap-3 shrink-0 pb-3 border-b ${
                isDark ? "border-white/10" : "border-gray-100"
            }`}>
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`p-2 rounded-xl shrink-0 ${
                        type === "youtube" ? (isDark ? "bg-red-500/15 text-red-400" : "bg-red-50 text-red-500") :
                        type === "twitter" ? (isDark ? "bg-sky-500/15 text-sky-400" : "bg-sky-50 text-sky-500") : 
                        type === "pdf" ? (isDark ? "bg-red-500/20 text-red-400" : "bg-red-50 text-red-600") :
                        (isDark ? "bg-purple-500/15 text-purple-400" : "bg-purple-50 text-purple-600")
                    }`}>
                        {type === "youtube" && <YoutubeIcon />}
                        {type === "twitter" && <TwitterIcon />}
                        {type === "pdf" && <PdfIcon className="w-5 h-5 text-red-500" />}
                        {isArticle && (
                            metadata?.favicon ? (
                                <img src={metadata.favicon} alt="" className="w-5 h-5 rounded-sm" />
                            ) : (
                                <svg className={`w-5 h-5 ${isDark ? "text-purple-400" : "text-purple-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                            )
                        )}
                    </div>
                    <div className="min-w-0">
                        <h3 className={`truncate font-bold text-base transition-colors ${
                            isDark ? "text-gray-100 group-hover:text-purple-400" : "text-gray-800 group-hover:text-purple-600"
                        }`} title={title}>
                            {title}
                        </h3>
                        <span className={`text-[11px] font-semibold capitalize ${isDark ? "text-gray-400" : "text-gray-400"}`}>
                            {domainName || type}
                        </span>
                    </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0 text-gray-400">
                    <button 
                        onClick={handleCopy}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            isDark ? "hover:bg-white/10 hover:text-white" : "hover:bg-gray-100 hover:text-gray-600"
                        }`}
                        title="Copy Link"
                    >
                        <ShareIcon size="md"/>
                    </button>
                    <button 
                        onClick={() => onDelete(_id)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            isDark ? "hover:bg-red-500/20 hover:text-red-400" : "hover:bg-red-50 hover:text-red-500"
                        }`}
                        title="Delete Memory"
                    >
                        <Delete size="md"/>
                    </button>
                </div>
            </div>

            {/* Card Content Body */}
            <div className="pt-4 flex-1 flex flex-col min-h-0 overflow-hidden">
                {type === "youtube" && (
                    <iframe 
                        className={`w-full h-full rounded-xl border bg-black ${isDark ? "border-white/10" : "border-gray-100"}`}
                        src={getYouTubeEmbedUrl(link)}
                        title={title} 
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                        referrerPolicy="strict-origin-when-cross-origin" 
                        allowFullScreen
                    />
                )}

                {type === "twitter" && (
                    <div className={`h-full overflow-y-auto rounded-xl p-3 border ${
                        isDark ? "bg-[#181715] border-white/10 text-white" : "bg-slate-50 border-gray-100 text-black"
                    }`}> 
                        <blockquote className="twitter-tweet m-0" data-theme={isDark ? "dark" : "light"}>
                            <a href={link.replace("x.com", "twitter.com")}></a>
                        </blockquote>
                    </div>
                )}

                {type === "pdf" && (
                    <div className="h-full flex flex-col rounded-xl border border-red-500/20 bg-gradient-to-b from-[#221515] via-[#1a1818] to-[#141212] overflow-hidden p-4 justify-between">
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-red-500/15 border border-red-500/20 flex items-center justify-center shrink-0">
                                    <PdfIcon className="w-7 h-7 text-red-500" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 block">PDF Document</span>
                                    <h4 className="text-sm font-bold text-white line-clamp-1 mt-0.5">{title}</h4>
                                    <span className="text-[11px] text-gray-400 block truncate">{domainName}</span>
                                </div>
                            </div>
                            
                            <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-gray-300 leading-relaxed flex items-start gap-2">
                                <span className="text-red-400 text-sm">📄</span>
                                <span className="line-clamp-2">Click below to open full distraction-free document reader or original link.</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pt-3 border-t border-white/10">
                            <button
                                type="button"
                                onClick={() => setReaderOpen(true)}
                                className="flex-1 py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                            >
                                <span>Read Document 📖</span>
                            </button>
                            <a
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-gray-200 text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
                                title="Open Original Link"
                            >
                                <span>Link ↗️</span>
                            </a>
                        </div>
                    </div>
                )}

                {isArticle && (
                    <a 
                        href={link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={`h-full flex flex-col rounded-xl border overflow-hidden transition-colors ${
                            isDark 
                                ? "bg-purple-950/20 border-purple-500/20 text-gray-200 hover:border-purple-500/40" 
                                : "bg-gradient-to-b from-purple-50/50 to-indigo-50/30 border-purple-100/50 text-gray-600 hover:border-purple-300"
                        }`}
                    >
                        {/* OG Image */}
                        {hasImage && (
                            <div className="w-full h-40 shrink-0 overflow-hidden bg-gray-100">
                                <img
                                    src={metadata!.image}
                                    alt={title}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    onError={() => setImgError(true)}
                                />
                            </div>
                        )}

                        {/* Text Content */}
                        <div className={`flex flex-col justify-between flex-1 p-4 ${hasImage ? "" : ""}`}>
                            <div className="flex flex-col gap-2">
                                {/* Domain Badge */}
                                <div className="flex items-center gap-1.5">
                                    {metadata?.favicon && (
                                        <img src={metadata.favicon} alt="" className="w-3.5 h-3.5 rounded-sm" />
                                    )}
                                    <span className={`text-[10px] font-semibold uppercase tracking-wider ${isDark ? "text-purple-400" : "text-purple-600"}`}>
                                        {metadata?.domain || "Bookmarked Link"}
                                    </span>
                                </div>

                                <p className={`text-sm font-semibold line-clamp-2 ${isDark ? "text-gray-100" : "text-gray-800"}`}>
                                    {title}
                                </p>

                                {metadata?.description && (
                                    <p className={`text-xs line-clamp-3 leading-relaxed ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                        {metadata.description}
                                    </p>
                                )}
                            </div>

                            <div className={`inline-flex items-center gap-2 text-xs font-semibold pt-3 ${
                                isDark ? "text-purple-400" : "text-purple-600"
                            }`}>
                                <span>Open Link</span>
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </div>
                        </div>
                    </a>
                )}
            </div>
        </div>

        {/* Full-Screen PDF Reader Modal Overlay */}
        {readerOpen && (
            <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col p-3 sm:p-6 animate-in fade-in duration-200">
                {/* Modal Header */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10 text-white shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 rounded-xl bg-red-500/20 text-red-400 shrink-0">
                            <PdfIcon className="w-5 h-5 text-red-400" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-bold text-base text-white truncate max-w-md sm:max-w-xl">{title}</h3>
                            <span className="text-xs text-gray-400 block truncate">{domainName || "PDF Document"}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                        <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
                        >
                            <span>Open Original</span>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </a>
                        <button
                            type="button"
                            onClick={() => setReaderOpen(false)}
                            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer text-base font-bold flex items-center justify-center w-9 h-9 border border-white/10"
                            title="Close Reader (ESC)"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Main Full-Height Viewer Container */}
                <div className="flex-1 w-full mt-3 rounded-2xl overflow-hidden border border-white/10 bg-[#121212] shadow-2xl relative">
                    <iframe
                        src={getPdfViewerUrl(link)}
                        className="w-full h-full border-0"
                        title={title}
                    />
                </div>
            </div>
        )}
        </>
    );
};
