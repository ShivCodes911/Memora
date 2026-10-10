export function PdfIcon({ className = "w-5 h-5 text-red-500" }: { className?: string }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 9h1.5a1.5 1.5 0 010 3H9m0 0v3m0-3h1.5M15 9h-2v6h2a1.5 1.5 0 000-3h-2" />
        </svg>
    );
}
