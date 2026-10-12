import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import type { Content } from "../types/content";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { Card } from "../components/ui/Card";
import { Toast } from "../components/ui/Toast";

interface SharedCollectionResponse {
  username: string;
  collection: {
    _id?: string;
    title: string;
    icon: string;
    userId?: string;
  };
  content: Content[];
}

export function SharedCollectionPage() {
  const { shareHash } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<SharedCollectionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;

  // Check logged-in user identity to detect if current user is owner
  useEffect(() => {
    if (!token) {
      setCurrentUser(null);
      return;
    }
    axios
      .get(`${BACKEND_URL}/api/v1/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setCurrentUser(res.data?.user?.username || null);
      })
      .catch(() => {
        setCurrentUser(null);
      });
  }, [token]);

  const [numCols, setNumCols] = useState(1);
  useEffect(() => {
    const updateCols = () => {
      const w = window.innerWidth;
      if (w >= 1536) setNumCols(4);
      else if (w >= 1280) setNumCols(3);
      else if (w >= 640) setNumCols(2);
      else setNumCols(1);
    };
    updateCols();
    window.addEventListener("resize", updateCols);
    return () => window.removeEventListener("resize", updateCols);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    if (!shareHash) return;
    setLoading(true);
    axios
      .get(`${BACKEND_URL}/api/v1/collections/share/${shareHash}`)
      .then((result) => {
        setData(result.data?.data);
      })
      .catch((err) => {
        setError(err?.response?.data?.message || "Collection not found or sharing has been disabled.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [shareHash]);

  const copyShareUrl = async () => {
    await navigator.clipboard.writeText(window.location.href);
    showToast("Collection link copied to clipboard! 📋");
  };

  const handleSaveCollection = async () => {
    if (!isLoggedIn) {
      navigate(`/signin?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    try {
      setIsSaving(true);
      const res = await axios.post(
        `${BACKEND_URL}/api/v1/collections/save/${shareHash}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setIsSaved(true);
      showToast(res.data?.message || "Collection saved to your vault! 🎉");
    } catch (err: any) {
      if (err?.response?.status === 401) {
        navigate(`/signin?redirect=${encodeURIComponent(window.location.pathname)}`);
      } else {
        showToast(err?.response?.data?.message || "Failed to save collection");
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-zinc-400 font-sans">
        <div className="flex flex-col items-center gap-3 animate-pulse">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center text-2xl shadow-inner">
            📁
          </div>
          <span className="text-xs font-medium">Loading Shared Collection...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4 font-sans text-zinc-100">
        <div className="bg-[#18181b] border border-zinc-800 p-8 rounded-3xl text-center max-w-md shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-3xl flex items-center justify-center mx-auto mb-4">
            🔒
          </div>
          <h2 className="text-lg font-bold text-white">Private or Expired Collection</h2>
          <p className="text-xs text-zinc-400 mt-2 mb-6">
            {error || "This collection is either private or the link has expired."}
          </p>
          <Link
            to="/"
            className="inline-block px-5 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 transition-colors"
          >
            Go to Memora Home
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = Boolean(
    currentUser && data && currentUser.toLowerCase() === data.username.toLowerCase()
  );

  const contents = data.content || [];
  const youtubeCount = contents.filter((c) => c.type === "youtube" || c.type === "video").length;
  const twitterCount = contents.filter((c) => c.type === "twitter").length;
  const pdfCount = contents.filter((c) => c.type === "pdf").length;
  const articleCount = contents.filter((c) => c.type !== "youtube" && c.type !== "video" && c.type !== "twitter" && c.type !== "pdf").length;

  const filteredContents = contents.filter((item) => {
    if (activeTab === "video" && item.type !== "youtube" && item.type !== "video") return false;
    if (activeTab === "twitter" && item.type !== "twitter") return false;
    if (activeTab === "pdf" && item.type !== "pdf") return false;
    if (activeTab === "article" && (item.type === "youtube" || item.type === "video" || item.type === "twitter" || item.type === "pdf")) return false;

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      return item.title?.toLowerCase().includes(q) || item.link?.toLowerCase().includes(q);
    }
    return true;
  });

  const columns: (typeof filteredContents)[] = Array.from({ length: numCols }, () => []);
  filteredContents.forEach((item, idx) => {
    columns[idx % numCols].push(item);
  });

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans flex flex-col relative select-none">
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />

      {/* Top Banner */}
      <div className="bg-[#0f172a] border-b border-sky-500/20 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-sky-200">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>
            Shared Collection: <strong className="text-white">{data.collection.title}</strong>
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold">
          <span className="text-sky-300/80">Curated by @{data.username}</span>
          {isLoggedIn ? (
            <Link to="/dashboard" className="text-sky-400 hover:text-white underline transition-colors">
              Go to My Vault →
            </Link>
          ) : (
            <Link
              to={`/signup?redirect=${encodeURIComponent(window.location.pathname)}`}
              className="text-sky-400 hover:text-white underline transition-colors"
            >
              Create your free second brain →
            </Link>
          )}
        </div>
      </div>

      {/* Navigation Header */}
      <header className="border-b border-zinc-800/80 bg-[#121214]/80 backdrop-blur-md sticky top-0 z-20 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl p-2 rounded-2xl bg-purple-500/10 border border-purple-500/20">
            {data.collection.icon || "📁"}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {data.collection.title}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {contents.length} {contents.length === 1 ? "item" : "items"}
              </span>
              {isOwner && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  Your Collection
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Public collection curated by <span className="text-zinc-200 font-medium">@{data.username}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={copyShareUrl}
            className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white text-xs font-semibold border border-zinc-700 transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
          >
            <span>🔗</span>
            <span>Copy Link</span>
          </button>

          {isOwner ? (
            <Link
              to="/dashboard"
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-1.5"
            >
              <span>Open in My Vault</span>
              <span>→</span>
            </Link>
          ) : isSaved ? (
            <Link
              to="/dashboard"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-1.5"
            >
              <span>✓ Saved in Vault</span>
              <span className="opacity-80">(View) →</span>
            </Link>
          ) : isLoggedIn ? (
            <button
              type="button"
              onClick={handleSaveCollection}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <span>📥</span>
                  <span>Save Collection to My Vault</span>
                </>
              )}
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleSaveCollection}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer"
                title="Sign in to save this collection into your vault"
              >
                <span>📥</span>
                <span>Save Collection</span>
              </button>
              <Link
                to={`/signup?redirect=${encodeURIComponent(window.location.pathname)}`}
                className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white text-xs font-semibold border border-zinc-700 transition-all flex items-center gap-1.5"
              >
                <span>Start Free ↗</span>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 sm:p-10 flex flex-col gap-6">
        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-2 border-b border-zinc-800/50">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {[
              { id: "all", label: "All", count: contents.length },
              { id: "video", label: "Videos", count: youtubeCount },
              { id: "twitter", label: "Tweets", count: twitterCount },
              { id: "pdf", label: "PDFs", count: pdfCount },
              { id: "article", label: "Articles", count: articleCount },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                    : "bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80"
                }`}
              >
                <span>{tab.label}</span>
                <span className="text-[10px] opacity-70">({tab.count})</span>
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search in collection..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs px-3.5 py-2 pl-9 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-purple-500/80 transition-colors"
            />
            <svg
              className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Content Cards */}
        {filteredContents.length === 0 ? (
          <div className="w-full py-16 text-center text-zinc-500 text-xs">
            {searchQuery ? `No items found matching "${searchQuery}"` : "This collection is currently empty."}
          </div>
        ) : (
          <div
            className="grid gap-6 items-start transition-all duration-300"
            style={{
              gridTemplateColumns: `repeat(${numCols}, minmax(0, 1fr))`,
            }}
          >
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
  );
}
