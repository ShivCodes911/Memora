import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import type { Content } from "../types/content";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { Card } from "../components/ui/Card";
import { Toast } from "../components/ui/Toast";
import { YoutubeIcon } from "../icons/youtube";
import { TwitterIcon } from "../icons/twitter";
import { PdfIcon } from "../icons/pdfIcon";

export function SharedPage() {
    const { shareLink } = useParams();
    const [data, setData] = useState<{ username: string; content: Content[] } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [activeTab, setActiveTab] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3500);
    };

    useEffect(() => {
        axios.get(`${BACKEND_URL}/api/v1/content/${shareLink}`)
            .then((result) => {
                setData(result.data);
            })
            .catch((err) => {
                setError(err?.response?.data?.message || "Brain collection not found or link is private.");
            })
            .finally(() => {
                setLoading(false);
            });
    }, [shareLink]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-zinc-400 font-sans">
                <div className="flex flex-col items-center gap-3 animate-pulse">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                    </div>
                    <span className="text-xs font-medium">Loading Memora Brain Vault...</span>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4 font-sans text-zinc-100">
                <div className="bg-[#18181b] border border-zinc-800 p-8 rounded-2xl text-center max-w-md shadow-2xl">
                    <h2 className="text-lg font-bold text-white">Private or Expired Brain</h2>
                    <p className="text-xs text-zinc-400 mt-2 mb-6">{error || "This brain collection is not accessible."}</p>
                    <Link to="/" className="px-5 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 transition-colors">
                        Go to Memora Home
                    </Link>
                </div>
            </div>
        );
    }

    const youtubeCount = data.content.filter((c) => c.type === "youtube").length;
    const twitterCount = data.content.filter((c) => c.type === "twitter").length;
    const pdfCount = data.content.filter((c) => c.type === "pdf").length;
    const articleCount = data.content.filter((c) => c.type !== "youtube" && c.type !== "twitter" && c.type !== "pdf").length;

    const filteredContents = data.content.filter((item) => {
        if (activeTab === "youtube" && item.type !== "youtube") return false;
        if (activeTab === "twitter" && item.type !== "twitter") return false;
        if (activeTab === "pdf" && item.type !== "pdf") return false;
        if (activeTab === "article" && (item.type === "youtube" || item.type === "twitter" || item.type === "pdf")) return false;

        if (searchQuery.trim() !== "") {
            const q = searchQuery.toLowerCase();
            return item.title?.toLowerCase().includes(q) || item.link?.toLowerCase().includes(q);
        }
        return true;
    });

    const copyShareUrl = async () => {
        await navigator.clipboard.writeText(window.location.href);
        showToast("Public Brain link copied to clipboard");
    };

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
        <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans flex flex-col">
            {/* Notion-Style Top Published Banner */}
            <div className="bg-[#0f172a] border-b border-sky-500/20 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-sky-200">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>This page is live on <strong className="text-white">memora.site/share/{shareLink}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={copyShareUrl}
                        className="px-3 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-200 font-medium transition-colors cursor-pointer text-xs"
                    >
                        Copy Link
                    </button>
                    <Link
                        to="/signup"
                        className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors text-xs"
                    >
                        Create Your Brain →
                    </Link>
                </div>
            </div>

            {/* Main Centered Reading Workspace */}
            <div className="flex-1 w-full max-w-6xl mx-auto px-6 py-10">
                {/* Header Title Banner */}
                <div className="pb-8 border-b border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3.5 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white tracking-tight">{data.username}'s Brain</h1>
                                <span className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider block">Public Knowledge Collection</span>
                            </div>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-full md:max-w-xs">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search in this brain..."
                            className="w-full bg-[#18181b] border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                        />
                        <svg className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                {/* Category Pills & Stats */}
                <div className="flex items-center justify-between flex-wrap gap-4 my-8">
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        <button
                            onClick={() => setActiveTab("all")}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                                activeTab === "all" ? "bg-purple-600 text-white shadow-sm" : "bg-[#18181b] text-zinc-400 border border-zinc-800 hover:text-white"
                            }`}
                        >
                            All ({data.content.length})
                        </button>
                        <button
                            onClick={() => setActiveTab("youtube")}
                            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                                activeTab === "youtube" ? "bg-red-600 text-white shadow-sm" : "bg-[#18181b] text-zinc-400 border border-zinc-800 hover:text-white"
                            }`}
                        >
                            <YoutubeIcon />
                            <span>YouTube ({youtubeCount})</span>
                        </button>
                        <button
                            onClick={() => setActiveTab("twitter")}
                            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                                activeTab === "twitter" ? "bg-sky-600 text-white shadow-sm" : "bg-[#18181b] text-zinc-400 border border-zinc-800 hover:text-white"
                            }`}
                        >
                            <TwitterIcon />
                            <span>Twitter / X ({twitterCount})</span>
                        </button>
                        <button
                            onClick={() => setActiveTab("pdf")}
                            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                                activeTab === "pdf" ? "bg-red-600 text-white shadow-sm" : "bg-[#18181b] text-zinc-400 border border-zinc-800 hover:text-white"
                            }`}
                        >
                            <PdfIcon className="w-3.5 h-3.5 text-red-400" />
                            <span>PDFs ({pdfCount})</span>
                        </button>
                        <button
                            onClick={() => setActiveTab("article")}
                            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                                activeTab === "article" ? "bg-indigo-600 text-white shadow-sm" : "bg-[#18181b] text-zinc-400 border border-zinc-800 hover:text-white"
                            }`}
                        >
                            <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                            <span>Articles ({articleCount})</span>
                        </button>
                    </div>
                </div>

                {/* Cards Grid */}
                {filteredContents.length === 0 ? (
                    <div className="py-16 text-center bg-[#18181b] border border-zinc-800 rounded-2xl">
                        <h3 className="text-base font-semibold text-white">No memories found</h3>
                        <p className="text-xs text-zinc-400 mt-1">Try switching tabs or searching for a different keyword.</p>
                    </div>
                ) : (
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
                                        onDelete={() => {}}
                                        onCopyToast={showToast}
                                        isDark={true}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
        </div>
    );
}
