import vm from "node:vm";

export interface DriveParsedFile {
    id: string;
    name: string;
    mimeType: string;
    link: string;
    type: "pdf" | "video" | "image" | "article";
    subfolderPath?: string | undefined;
}

export interface DriveFolderInfo {
    id: string;
    name: string;
    path: string;
    parentPath: string;
}

export interface DriveFolderResult {
    folderId: string;
    folderName: string;
    files: DriveParsedFile[];
    folders: DriveFolderInfo[];
    subfolderCount: number;
}

/**
 * Extracts Google Drive folder ID from various URL patterns:
 * - https://drive.google.com/drive/folders/:id
 * - https://drive.google.com/drive/u/:idx/folders/:id
 * - https://drive.google.com/drive/mobile/folders/:id
 * - https://drive.google.com/folderview?id=:id
 * - https://drive.google.com/open?id=:id
 * - Or raw folder ID
 */
export function extractDriveFolderId(url: string): string | null {
    if (!url) return null;
    const trimmed = url.trim();

    // Direct folder ID regex check (alphanumeric, dashes, underscores, length >= 15)
    if (/^[a-zA-Z0-9_-]{15,60}$/.test(trimmed)) {
        return trimmed;
    }

    // drive/folders/ID or drive/u/X/folders/ID or drive/mobile/folders/ID
    const folderMatch = trimmed.match(/drive(?:\.google\.com)?\/(?:u\/\d+\/)?(?:mobile\/)?folders\/([a-zA-Z0-9_-]+)/i);
    if (folderMatch && folderMatch[1]) {
        return folderMatch[1];
    }

    // folderview?id=ID or open?id=ID
    const queryMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/i);
    if (queryMatch && queryMatch[1] && trimmed.includes("drive.google.com")) {
        return queryMatch[1];
    }

    return null;
}

/**
 * Maps MIME type and file extension to Memora content type
 */
export function mapMimeToContentType(mimeType: string, fileName: string): "pdf" | "video" | "image" | "article" {
    const mime = (mimeType || "").toLowerCase();
    const name = (fileName || "").toLowerCase();

    if (mime.includes("pdf") || name.endsWith(".pdf")) {
        return "pdf";
    }

    if (
        mime.startsWith("video/") ||
        name.endsWith(".mp4") ||
        name.endsWith(".mov") ||
        name.endsWith(".mkv") ||
        name.endsWith(".webm") ||
        name.endsWith(".avi")
    ) {
        return "video";
    }

    if (
        mime.startsWith("image/") ||
        name.endsWith(".png") ||
        name.endsWith(".jpg") ||
        name.endsWith(".jpeg") ||
        name.endsWith(".webp") ||
        name.endsWith(".gif") ||
        name.endsWith(".svg")
    ) {
        return "image";
    }

    return "article";
}

/**
 * Helper to recursively search an object/array for string values matching specific criteria
 */
function findStringsInItem(item: any): string[] {
    const result: string[] = [];
    function search(node: any) {
        if (!node) return;
        if (typeof node === "string") result.push(node);
        else if (Array.isArray(node)) node.forEach(search);
    }
    search(item);
    return result;
}

/**
 * Parses files and subfolders from Google Drive public web HTML using AF_initDataCallback
 */
function parseDriveHtml(html: string): { folderName: string; rawItems: any[] } {
    let folderName = "Google Drive Folder";

    // Extract title: e.g. "<title>My Notes – Google Drive</title>"
    const titleMatch = html.match(/<title>(.*?)(?:\s*–\s*|\s*-\s*)Google Drive<\/title>/i) || html.match(/<title>(.*?)<\/title>/i);
    if (titleMatch && titleMatch[1]) {
        const cleaned = titleMatch[1].trim();
        if (cleaned && cleaned.toLowerCase() !== "google drive" && !cleaned.toLowerCase().includes("error 404") && !cleaned.toLowerCase().includes("sign in")) {
            folderName = cleaned;
        }
    }

    const rawItems: any[] = [];
    const callbacks = [...html.matchAll(/AF_initDataCallback\s*\(\s*({[\s\S]*?})\s*\);/g)];

    for (const match of callbacks) {
        const rawCallback = match[1];
        if (!rawCallback) continue;

        let parsedData: any = null;

        // Try VM evaluation first (robust against regex property ordering)
        try {
            const evaluated = vm.runInNewContext(`(${rawCallback})`, {});
            if (evaluated && evaluated.data) {
                parsedData = evaluated.data;
            }
        } catch {
            // Fallback to JSON regex extraction
            const dataMatch = rawCallback.match(/data:\s*(\[[\s\S]*?\])\s*(?:,\s*sideChannel:|\s*}\s*$)/);
            if (dataMatch && dataMatch[1]) {
                try {
                    parsedData = JSON.parse(dataMatch[1]);
                } catch {}
            }
        }

        if (!parsedData) continue;

        // Generic search for any array that contains Drive items
        function searchForItems(node: any): any[] | null {
            if (!node || !Array.isArray(node)) return null;

            const isItemList = node.length > 0 && node.every((it: any) => {
                if (!Array.isArray(it) || !Array.isArray(it[0])) return false;
                const candId = it[0][1];
                return typeof candId === "string" && /^[a-zA-Z0-9_-]{20,60}$/.test(candId);
            });

            if (isItemList) return node;

            for (const child of node) {
                if (Array.isArray(child)) {
                    const found = searchForItems(child);
                    if (found) return found;
                }
            }
            return null;
        }

        const foundList = searchForItems(parsedData);
        if (foundList && Array.isArray(foundList)) {
            rawItems.push(...foundList);
            break;
        }
    }

    return { folderName, rawItems };
}

/**
 * Extracts parsed file/subfolder details from a single raw item node
 */
function extractItemMetadata(item: any): { id: string; name: string; mime: string; isFolder: boolean } | null {
    if (!item || !Array.isArray(item)) return null;

    // File/Folder ID is primarily located at item[0][1]
    let id: string = item[0]?.[1];
    if (!id || typeof id !== "string" || !/^[a-zA-Z0-9_-]{20,60}$/.test(id)) {
        // Fallback: search strings in item
        const strings = findStringsInItem(item);
        const candId = strings.find(s => /^[a-zA-Z0-9_-]{25,50}$/.test(s) && !s.includes(".") && !s.includes("/"));
        if (candId) id = candId;
    }

    if (!id) return null;

    // MIME type is primarily at item[4]
    let mime: string = typeof item[4] === "string" ? item[4] : "";
    if (!mime || !mime.includes("/")) {
        const strings = findStringsInItem(item);
        const candMime = strings.find(s => s.includes("/") && (s.startsWith("application/") || s.startsWith("text/") || s.startsWith("image/") || s.startsWith("video/")));
        if (candMime) mime = candMime;
    }

    const isFolder = mime === "application/vnd.google-apps.folder";

    // File name is at item[35][0][0][0] or item[24][2][0][2][1][0][0][0]
    let name: string = item[35]?.[0]?.[0]?.[0] || item[24]?.[2]?.[0]?.[2]?.[1]?.[0]?.[0]?.[0];
    if (!name || typeof name !== "string") {
        const strings = findStringsInItem(item);
        // Find a string that looks like a valid filename or title
        const candName = strings.find(s => 
            s !== id && 
            s !== mime && 
            !s.startsWith("http") && 
            !s.includes("Download") && 
            !s.includes("Modified") &&
            !s.includes("Size:") &&
            s.length > 1
        );
        name = candName || (isFolder ? "Folder" : "Drive File");
    }

    return { id, name: name.trim(), mime, isFolder };
}

/**
 * Fetch Google Drive folder files using Google Drive API v3 (if API key available)
 */
async function fetchViaDriveApi(folderId: string, apiKey: string): Promise<DriveFolderResult> {
    // 1. Get folder metadata
    let folderName = "Google Drive Folder";
    try {
        const metaRes = await fetch(`https://www.googleapis.com/drive/v3/files/${folderId}?fields=name&key=${apiKey}`);
        if (metaRes.ok) {
            const metaData: any = await metaRes.json();
            if (metaData?.name) folderName = metaData.name;
        }
    } catch {
        // Fallback to default
    }

    // 2. Query folder contents
    const query = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
    const fields = encodeURIComponent("files(id,name,mimeType,webViewLink)");
    const listUrl = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=${fields}&pageSize=100&key=${apiKey}`;

    const listRes = await fetch(listUrl);
    if (!listRes.ok) {
        throw new Error(`Google Drive API error: ${listRes.status} ${listRes.statusText}`);
    }

    const listData: any = await listRes.json();
    const driveFiles: any[] = listData?.files || [];

    const files: DriveParsedFile[] = [];
    let subfolderCount = 0;

    for (const f of driveFiles) {
        if (f.mimeType === "application/vnd.google-apps.folder") {
            subfolderCount++;
            continue;
        }

        files.push({
            id: f.id,
            name: f.name || "Drive File",
            mimeType: f.mimeType || "",
            link: f.webViewLink || `https://drive.google.com/file/d/${f.id}/view?usp=sharing`,
            type: mapMimeToContentType(f.mimeType, f.name || "")
        });
    }

    return {
        folderId,
        folderName,
        files,
        folders: [],
        subfolderCount
    };
}

/**
 * Crawls a public Google Drive folder and its subfolders recursively
 */
export async function fetchDriveFolderFiles(
    folderId: string,
    apiKey?: string,
    maxDepth = 2
): Promise<DriveFolderResult> {
    // If API key is provided, prefer the official Drive API v3
    const resolvedApiKey = apiKey || process.env.GOOGLE_DRIVE_API_KEY;
    if (resolvedApiKey) {
        try {
            return await fetchViaDriveApi(folderId, resolvedApiKey);
        } catch (apiErr) {
            console.warn("Drive API v3 failed, falling back to public web scraper:", apiErr);
        }
    }

    // Web Scraper approach (Zero API key needed for public folders)
    const visitedFolders = new Set<string>();
    const allFiles: DriveParsedFile[] = [];
    const allFolders: DriveFolderInfo[] = [];
    let rootFolderName = "Google Drive Folder";
    let totalSubfolders = 0;

    async function crawlFolder(currentId: string, depth: number, pathPrefix = "", parentPath = ""): Promise<void> {
        if (depth > maxDepth || visitedFolders.has(currentId)) return;
        visitedFolders.add(currentId);

        const url = `https://drive.google.com/drive/folders/${currentId}`;
        const res = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.9"
            }
        });

        if (!res.ok) {
            if (res.status === 404) {
                throw new Error("Google Drive folder not found (404). Please verify the link.");
            }
            if (res.status === 403) {
                throw new Error("Access denied (403). Please make sure the folder is set to 'Anyone with the link can view'.");
            }
            throw new Error(`Failed to access Google Drive folder (HTTP ${res.status}).`);
        }

        const html = await res.text();
        const { folderName, rawItems } = parseDriveHtml(html);

        if (depth === 0 && folderName) {
            rootFolderName = folderName;
        }

        const subfoldersToCrawl: { id: string; name: string; path: string }[] = [];

        for (const item of rawItems) {
            const meta = extractItemMetadata(item);
            if (!meta) continue;

            if (meta.isFolder) {
                totalSubfolders++;
                const folderPath = pathPrefix ? `${pathPrefix}${meta.name}` : meta.name;
                allFolders.push({
                    id: meta.id,
                    name: meta.name,
                    path: folderPath,
                    parentPath: parentPath
                });

                if (depth < maxDepth) {
                    subfoldersToCrawl.push({ id: meta.id, name: meta.name, path: folderPath });
                }
            } else {
                allFiles.push({
                    id: meta.id,
                    name: meta.name,
                    mimeType: meta.mime,
                    link: `https://drive.google.com/file/d/${meta.id}/view?usp=sharing`,
                    type: mapMimeToContentType(meta.mime, meta.name),
                    subfolderPath: parentPath || undefined
                });
            }
        }

        // Recursively crawl subfolders up to maxDepth (limit up to 50 subfolders per folder for safety)
        for (const sub of subfoldersToCrawl.slice(0, 50)) {
            const nextPrefix = `${sub.path}/`;
            try {
                await crawlFolder(sub.id, depth + 1, nextPrefix, sub.path);
            } catch (err) {
                console.warn(`Failed to crawl subfolder ${sub.name} (${sub.id}):`, err);
            }
        }
    }

    await crawlFolder(folderId, 0);

    if (allFiles.length === 0 && totalSubfolders === 0) {
        throw new Error(
            "No files could be retrieved from this folder. Please ensure the Google Drive folder permissions are set to 'Anyone with the link can view'."
        );
    }

    return {
        folderId,
        folderName: rootFolderName,
        files: allFiles,
        folders: allFolders,
        subfolderCount: totalSubfolders
    };
}
