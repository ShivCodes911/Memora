interface EmptyStateProps {
    isSearch?: boolean;
    searchQuery?: string;
    onAddClick: () => void;
    isDark?: boolean;
}

export function EmptyState({ isSearch, searchQuery, onAddClick, isDark }: EmptyStateProps) {
    if (isSearch) {
        return (
            <div className={`w-full flex flex-col items-center justify-center py-16 px-4 border rounded-2xl text-center ${
                isDark ? "bg-[#18181b]/50 border-zinc-800 text-zinc-300" : "bg-white border-zinc-200 text-zinc-700 shadow-sm"
            }`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${
                    isDark ? "bg-zinc-800 text-zinc-300" : "bg-zinc-100 text-zinc-600"
                }`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <h3 className={`text-lg font-semibold tracking-tight ${isDark ? "text-zinc-100" : "text-zinc-900"}`}>No memories found</h3>
                <p className={`text-xs max-w-sm mt-1 mb-5 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                    No results matching <span className="font-medium">{searchQuery}</span>. Try adjusting your keyword or category filter.
                </p>
            </div>
        );
    }

    return (
        <div className={`w-full flex flex-col items-center justify-center py-16 px-6 border rounded-2xl text-center ${
            isDark ? "bg-[#18181b]/40 border-zinc-800 text-zinc-300" : "bg-white border-zinc-200 text-zinc-700 shadow-sm"
        }`}>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${
                isDark ? "bg-purple-500/15 text-purple-400 border border-purple-500/20" : "bg-purple-50 text-purple-600 border border-purple-100"
            }`}>
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
            </div>

            <h3 className={`text-xl font-bold tracking-tight ${isDark ? "text-zinc-100" : "text-zinc-900"}`}>
                Your Second Brain is Ready
            </h3>
            <p className={`text-xs max-w-md mt-1.5 leading-relaxed ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                Start curating your knowledge vault. Save YouTube tutorials, Twitter threads, and web articles in one clean interface.
            </p>

            <button
                onClick={onAddClick}
                className="mt-6 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition-all active:scale-95 flex items-center gap-2 cursor-pointer shadow-md shadow-purple-600/20"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Add Memory
            </button>
        </div>
    );
}
