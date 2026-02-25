import { Entry } from "./types";

const DRIVE_API_URL = "https://www.googleapis.com/drive/v3/files";
const DRIVE_UPLOAD_URL = "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart";

export type SyncProgressStatus = "Checking Drive..." | "Updating notes..." | "Updating journals..." | "Updating recipes..." | "Done" | "Error";

/**
 * Ensures a folder exists and returns its ID.
 */
async function getOrCreateFolder(name: string, token: string, parentId?: string): Promise<string> {
    const q = `name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false${parentId ? ` and '${parentId}' in parents` : ''}`;

    // Check if it exists
    const searchRes = await fetch(`${DRIVE_API_URL}?q=${encodeURIComponent(q)}&fields=files(id)`, {
        headers: { Authorization: `Bearer ${token}` }
    });

    if (!searchRes.ok) throw new Error("Failed to search folder");
    const searchData = await searchRes.json();

    if (searchData.files && searchData.files.length > 0) {
        return searchData.files[0].id;
    }

    // Create if not found
    const metadata = {
        name,
        mimeType: 'application/vnd.google-apps.folder',
        ...(parentId && { parents: [parentId] })
    };

    const createRes = await fetch(DRIVE_API_URL, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(metadata)
    });

    if (!createRes.ok) throw new Error(`Failed to create folder ${name}`);
    const createData = await createRes.json();
    return createData.id;
}

/**
 * Searches for an existing file by name in the given folder.
 */
async function getFileIdByName(name: string, parentId: string, token: string): Promise<string | null> {
    const q = `name='${name}' and '${parentId}' in parents and trashed=false`;
    const res = await fetch(`${DRIVE_API_URL}?q=${encodeURIComponent(q)}&fields=files(id)`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.files && data.files.length > 0) return data.files[0].id;
    return null;
}

/**
 * Uploads a text/markdown file, overwriting if it already exists in the exact folder.
 */
async function uploadFile(name: string, content: string, parentId: string, token: string): Promise<void> {
    const existingFileId = await getFileIdByName(name, parentId, token);

    const metadata = {
        name,
        parents: existingFileId ? undefined : [parentId], // Parents are only for creation
        mimeType: 'text/markdown' // Save broadly as markdown text
    };

    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const multipartRequestBody =
        delimiter +
        'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: text/markdown\r\n\r\n' +
        content +
        closeDelimiter;

    let uploadUrl = DRIVE_UPLOAD_URL;
    let method = 'POST'; // Create

    if (existingFileId) {
        // Update existing
        method = 'PATCH';
        uploadUrl = `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=multipart`;
    }

    const res = await fetch(uploadUrl, {
        method,
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body: multipartRequestBody
    });

    if (!res.ok) {
        console.error("Upload error", await res.text());
        throw new Error(`Failed to upload file ${name}`);
    }
}

/**
 * Generates the Markdown content for an entry to be saved in Drive.
 */
function generateMarkdown(entry: Entry): string {
    let md = `# ${entry.title || 'Untitled'}\n\n`;
    const dateStr = new Date(entry.createdAt).toLocaleDateString();
    md += `*Date: ${dateStr}*\n`;
    if (entry.tags.length > 0) md += `*Tags: ${entry.tags.join(', ')}*\n`;
    md += `\n---\n\n`;

    if (entry.type === 'recipe' && entry.recipeData) {
        md += `## Ingredients\n`;
        entry.recipeData.ingredients.forEach(i => md += `- ${i}\n`);
        md += `\n## Steps\n`;
        entry.recipeData.steps.forEach((s, i) => md += `${i + 1}. ${s}\n`);
    } else {
        // Remove HTML tags for standard markdown backup if Rich Editor was used
        const plainText = entry.content.replace(/<[^>]+>/g, '\n').replace(/\n\s*\n/g, '\n\n');
        md += plainText;
    }
    return md;
}

/**
 * Main Sync Function: Pushes all entries to Google Drive.
 */
export async function syncEntriesToDrive(
    entries: Entry[],
    token: string,
    onStatusChange: (status: SyncProgressStatus) => void
): Promise<string> {
    try {
        onStatusChange("Checking Drive...");

        // 1. Create root 'Journal App Backup' folder
        const rootId = await getOrCreateFolder("Journal App Backup", token);

        // 2. Create category folders
        const [notesId, journalId, recipesId] = await Promise.all([
            getOrCreateFolder("notes", token, rootId),
            getOrCreateFolder("journal", token, rootId),
            getOrCreateFolder("recipes", token, rootId)
        ]);

        // Helper to get correct folder
        const getFolderId = (type: string) => {
            if (type === 'note') return notesId;
            if (type === 'journal') return journalId;
            if (type === 'recipe') return recipesId;
            return notesId;
        };

        // 3. Upload all entries (grouped roughly for UI progress)
        for (const type of ['note', 'journal', 'recipe'] as const) {
            onStatusChange(`Updating ${type}s...` as SyncProgressStatus);
            const typedEntries = entries.filter(e => e.type === type);
            const parentId = getFolderId(type);

            for (const entry of typedEntries) {
                // Generate and upload the main document
                const safeName = (entry.title || `Untitled_${entry.id}`).replace(/[/\\?%*:|"<>]/g, '-');
                const content = generateMarkdown(entry);
                await uploadFile(`${safeName}.md`, content, parentId, token);

                // Upload original transcript if it exists
                if (entry.originalTranscript) {
                    const transcriptContent = `# Original Voice Transcript\n\n*Source: ${entry.title || 'Untitled'}*\n*Date: ${new Date(entry.createdAt).toLocaleDateString()}*\n\n---\n\n${entry.originalTranscript}`;
                    await uploadFile(`${safeName} - Original Transcript.md`, transcriptContent, parentId, token);
                }
            }
        }

        onStatusChange("Done");
        return rootId; // Return root folder ID so we can link to it later
    } catch (error) {
        console.error("Drive sync error:", error);
        onStatusChange("Error");
        throw error;
    }
}
