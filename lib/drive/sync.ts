import AsyncStorage from "@react-native-async-storage/async-storage";
import { driveClient, ContentType } from "./client";
import NetInfo from "@react-native-community/netinfo";

// Sync status tracking
const LAST_SYNC_KEY = "lastSync";
const PENDING_UPLOADS_KEY = "pendingUploads";

interface PendingUpload {
    id: string;
    type: ContentType;
    fileName: string;
    content: object;
    driveFileId?: string;
    createdAt: string;
}

class SyncManager {
    private isSyncing = false;

    // Check if we have internet
    async isOnline(): Promise<boolean> {
        const state = await NetInfo.fetch();
        return state.isConnected === true;
    }

    // Add an item to the pending upload queue
    async queueUpload(
        id: string,
        type: ContentType,
        fileName: string,
        content: object,
        driveFileId?: string
    ): Promise<void> {
        const pending = await this.getPendingUploads();

        // Remove existing entry for this ID to prevent duplicates
        const filtered = pending.filter((p) => p.id !== id);

        filtered.push({
            id,
            type,
            fileName,
            content,
            driveFileId,
            createdAt: new Date().toISOString(),
        });

        await AsyncStorage.setItem(PENDING_UPLOADS_KEY, JSON.stringify(filtered));

        // Attempt sync if online
        this.attemptSync();
    }

    // Get all pending uploads
    async getPendingUploads(): Promise<PendingUpload[]> {
        const raw = await AsyncStorage.getItem(PENDING_UPLOADS_KEY);
        return raw ? JSON.parse(raw) : [];
    }

    // Clear a specific pending upload
    async clearPendingUpload(id: string): Promise<void> {
        const pending = await this.getPendingUploads();
        const filtered = pending.filter((p) => p.id !== id);
        await AsyncStorage.setItem(PENDING_UPLOADS_KEY, JSON.stringify(filtered));
    }

    // Get last sync time
    async getLastSyncTime(): Promise<Date | null> {
        const raw = await AsyncStorage.getItem(LAST_SYNC_KEY);
        return raw ? new Date(raw) : null;
    }

    // Set last sync time
    async setLastSyncTime(): Promise<void> {
        await AsyncStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
    }

    // Attempt to sync pending uploads
    async attemptSync(): Promise<{ success: boolean; synced: number }> {
        if (this.isSyncing) {
            return { success: false, synced: 0 };
        }

        const isOnline = await this.isOnline();
        if (!isOnline) {
            return { success: false, synced: 0 };
        }

        this.isSyncing = true;
        let syncedCount = 0;

        try {
            const pending = await this.getPendingUploads();

            for (const item of pending) {
                try {
                    await driveClient.uploadFile(
                        item.type,
                        item.fileName,
                        item.content,
                        item.driveFileId
                    );
                    await this.clearPendingUpload(item.id);
                    syncedCount++;
                } catch (error) {
                    console.error(`Failed to sync ${item.id}:`, error);
                    // Keep in queue for retry
                }
            }

            if (syncedCount > 0) {
                await this.setLastSyncTime();
            }

            return { success: true, synced: syncedCount };
        } finally {
            this.isSyncing = false;
        }
    }

    // Get sync status summary
    async getSyncStatus(): Promise<{
        pendingCount: number;
        lastSync: Date | null;
        isOnline: boolean;
    }> {
        const [pending, lastSync, isOnline] = await Promise.all([
            this.getPendingUploads(),
            this.getLastSyncTime(),
            this.isOnline(),
        ]);

        return {
            pendingCount: pending.length,
            lastSync,
            isOnline,
        };
    }
}

export const syncManager = new SyncManager();
