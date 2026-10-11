const fs = require('fs');
let code = fs.readFileSync('src/components/ui/Card.tsx', 'utf8');

const startIdx = code.indexOf('{type === "pdf" && (');
if (startIdx === -1) process.exit(1);

const endStr = '                )}';
const endIdx = code.indexOf(endStr, startIdx + 100);
if (endIdx === -1) process.exit(1);

const newBlock = `{type === "pdf" && (
                    <div className="flex flex-col gap-3 h-full w-full">
                        <div className={\`h-full flex flex-col rounded-xl border overflow-hidden transition-colors \${
                            isDark 
                                ? "bg-red-950/10 border-red-500/20 text-gray-200 hover:border-red-500/40" 
                                : "bg-gradient-to-b from-red-50/50 to-orange-50/30 border-red-100/50 text-gray-600 hover:border-red-300"
                        }\`}>
                            {/* OG Image / PDF Thumbnail */}
                            <div className={\`w-full h-28 shrink-0 overflow-hidden relative flex items-center justify-center \${metadata?.image && !imgError ? 'bg-gray-100' : (isDark ? 'bg-[#18181b]' : 'bg-red-50')}\`}>
                                {metadata?.image && !imgError ? (
                                    <img
                                        src={metadata.image}
                                        alt={title}
                                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                        onError={() => setImgError(true)}
                                    />
                                ) : (
                                    <div className="flex flex-col items-center gap-2">
                                        <div className={\`p-3 rounded-2xl border \${isDark ? 'bg-red-600/20 text-red-500 border-red-500/20' : 'bg-red-100 text-red-600 border-red-200'}\`}>
                                            <PdfIcon className="w-8 h-8" />
                                        </div>
                                    </div>
                                )}
                                
                                {/* Overlay badge */}
                                <span className={\`absolute bottom-2 right-2 text-[10px] font-bold uppercase tracking-wider backdrop-blur-xs px-2 py-1 rounded-md border flex items-center gap-1 \${
                                    isDark ? "bg-black/80 text-white border-white/10" : "bg-white/90 text-red-700 border-red-200 shadow-sm"
                                }\`}>
                                    📄 PDF
                                </span>
                            </div>

                            {/* Text Content */}
                            <div className="flex flex-col justify-between flex-1 p-4">
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-1.5">
                                        <span className={\`text-[10px] font-semibold uppercase tracking-wider \${isDark ? "text-red-400" : "text-red-600"}\`}>
                                            {domainName || "Document"}
                                        </span>
                                    </div>
                                    <p className={\`text-sm font-semibold line-clamp-2 \${isDark ? "text-gray-100" : "text-gray-800"}\`}>
                                        {title}
                                    </p>
                                    <p className={\`text-xs line-clamp-2 leading-relaxed \${isDark ? "text-gray-400" : "text-gray-500"}\`}>
                                        {metadata?.description || "Click below to read this PDF document."}
                                    </p>
                                </div>
                                
                                <div className={\`flex items-center gap-2 pt-4 mt-2 border-t \${isDark ? "border-white/5" : "border-gray-200"}\`}>
                                    <button
                                        type="button"
                                        onClick={() => setReaderOpen(true)}
                                        className="flex-1 py-2 px-3 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                                    >
                                        <span>Read Document 📖</span>
                                    </button>
                                    <a
                                        href={link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={\`py-2 px-3 rounded-xl active:scale-95 text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer border \${
                                            isDark ? "bg-white/10 hover:bg-white/20 text-gray-200 border-transparent" : "bg-white hover:bg-gray-50 text-gray-700 border-gray-200 shadow-sm"
                                        }\`}
                                        title="Open Original Link"
                                    >
                                        <span>Open ↗️</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                        {renderNoteEditor()}
                    </div>
                )}`;

code = code.substring(0, startIdx) + newBlock + code.substring(endIdx + endStr.length);
fs.writeFileSync('src/components/ui/Card.tsx', code);
console.log("PDF updated successfully");
