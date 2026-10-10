interface ToastProps {
    message: string | null;
    onClose: () => void;
}

export function Toast({ message, onClose }: ToastProps) {
    if (!message) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-900/95 text-zinc-100 shadow-xl border border-zinc-800 text-xs font-medium backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
            <span>{message}</span>
            <button
                onClick={onClose}
                className="ml-3 text-zinc-400 hover:text-white transition-colors cursor-pointer text-xs"
            >
                ✕
            </button>
        </div>
    );
}
