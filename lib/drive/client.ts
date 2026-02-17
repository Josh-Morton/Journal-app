import { useAuth } from "../auth/google";

const DRIVE_API_BASE = "https://www.googleapis.com/drive/v3";
const UPLOAD_API_BASE = "https://www.googleapis.com/upload/drive/v3";

// Folder names in Drive
const APP_FOLDER_NAME = "JournalApp";
const FOLDERS = {
    journals: "Journals",
    notes: "Notes",
    recipes: "Recipes",
};

export type ContentType = "journals" | "notes" | "recipes";

interface DriveFile {
    id: string;
    name: string;
    mimeType: string;
    modifiedTime: string;
}

class DriveClient {
    private accessToken: string | null = null;
    private folderIds: Map<string, string> = new Map();

    setAccessToken(token: string | null) {
        this.accessToken = token;
    }

    private async request(
        url: string,
        options: RequestInit = {}
    ): Promise<Response> {
        if (!this.accessToken) {
            throw new Error("Not authenticated");
        }

        const response = await fetch(url, {
            ...options,
            headers: {
                Authorization: `Bearer ${this.accessToken}`,
                ...options.headers,
            },
        });

        if (!response.ok) {
            throw new Error(`Drive API error: ${response.status}`);
        }

        return response;
    }

    // Find or create the app's root folder
    async getOrCreateAppFolder(): Promise<string> {
        if (this.folderIds.has(APP_FOLDER_NAME)) {
            return this.folderIds.get(APP_FOLDER_NAME)!;
        }

        // Search for existing folder
        const searchUrl = `${DRIVE_API_BASE}/files?q=name='${APP_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false&fields=files(id,name)`;
        const searchResponse = await this.request(searchUrl);
        const searchData = await searchResponse.json();

        if (searchData.files && searchData.files.length > 0) {
            const folderId = searchData.files[0].id;
            this.folderIds.set(APP_FOLDER_NAME, folderId);
            return folderId;
        }

        // Create new folder
        const createUrl = `${DRIVE_API_BASE}/files`;
        const createResponse = await this.request(createUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: APP_FOLDER_NAME,
                mimeType: "application/vnd.google-apps.folder",
            }),
        });
        const createData = await createResponse.json();
        this.folderIds.set(APP_FOLDER_NAME, createData.id);
        return createData.id;
    }

    // Get or create a subfolder (Journals, Notes, Recipes)
    async getOrCreateSubfolder(type: ContentType): Promise<string> {
        const folderName = FOLDERS[type];
        const cacheKey = `${APP_FOLDER_NAME}/${folderName}`;

        if (this.folderIds.has(cacheKey)) {
            return this.folderIds.get(cacheKey)!;
        }

        const parentId = await this.getOrCreateAppFolder();

        // Search for existing subfolder
        const searchUrl = `${DRIVE_API_BASE}/files?q=name='${folderName}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false&fields=files(id,name)`;
        const searchResponse = await this.request(searchUrl);
        const searchData = await searchResponse.json();

        if (searchData.files && searchData.files.length > 0) {
            const folderId = searchData.files[0].id;
            this.folderIds.set(cacheKey, folderId);
            return folderId;
        }

        // Create new subfolder
        const createUrl = `${DRIVE_API_BASE}/files`;
        const createResponse = await this.request(createUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: folderName,
                mimeType: "application/vnd.google-apps.folder",
                parents: [parentId],
            }),
        });
        const createData = await createResponse.json();
        this.folderIds.set(cacheKey, createData.id);
        return createData.id;
    }

    // List files in a folder
    async listFiles(type: ContentType): Promise<DriveFile[]> {
        const folderId = await this.getOrCreateSubfolder(type);
        const url = `${DRIVE_API_BASE}/files?q='${folderId}' in parents and trashed=false&fields=files(id,name,mimeType,modifiedTime)&orderBy=modifiedTime desc`;
        const response = await this.request(url);
        const data = await response.json();
        return data.files || [];
    }

    // Upload a file (create or update)
    async uploadFile(
        type: ContentType,
        fileName: string,
        content: object,
        existingFileId?: string
    ): Promise<string> {
        const jsonContent = JSON.stringify(content, null, 2);
        const blob = new Blob([jsonContent], { type: "application/json" });

        if (existingFileId) {
            // Update existing file
            const url = `${UPLOAD_API_BASE}/files/${existingFileId}?uploadType=media`;
            const response = await this.request(url, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: blob,
            });
            const data = await response.json();
            return data.id;
        } else {
            // Create new file
            const folderId = await this.getOrCreateSubfolder(type);

            // Use multipart upload for new files
            const metadata = {
                name: fileName,
                parents: [folderId],
            };

            const form = new FormData();
            form.append(
                "metadata",
                new Blob([JSON.stringify(metadata)], { type: "application/json" })
            );
            form.append("file", blob);

            const url = `${UPLOAD_API_BASE}/files?uploadType=multipart&fields=id`;
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${this.accessToken}`,
                },
                body: form,
            });

            const data = await response.json();
            return data.id;
        }
    }

    // Download a file
    async downloadFile(fileId: string): Promise<object> {
        const url = `${DRIVE_API_BASE}/files/${fileId}?alt=media`;
        const response = await this.request(url);
        return response.json();
    }

    // Delete a file
    async deleteFile(fileId: string): Promise<void> {
        const url = `${DRIVE_API_BASE}/files/${fileId}`;
        await this.request(url, { method: "DELETE" });
    }
}

// Singleton instance
export const driveClient = new DriveClient();

// Hook for using Drive client with auth
export function useDrive() {
    const { accessToken } = useAuth();
    driveClient.setAccessToken(accessToken);
    return driveClient;
}
