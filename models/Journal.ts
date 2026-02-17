import { Model } from "@nozbe/watermelondb";
import { field, text, date, json, readonly } from "@nozbe/watermelondb/decorators";

export class Journal extends Model {
    static table = "journals";

    @text("title") title!: string;
    @text("content") content!: string;
    @date("date") date!: Date;
    @text("location") location?: string;
    @json("tags", (raw: any) => raw || []) tags!: string[];
    @field("synced") synced!: boolean;
    @text("drive_file_id") driveFileId?: string;
    @readonly @date("created_at") createdAt!: Date;
    @readonly @date("updated_at") updatedAt!: Date;

    // Helper to get file name for Drive
    get fileName(): string {
        const dateStr = this.date.toISOString().split("T")[0];
        return `journal_${dateStr}_${this.id}.json`;
    }

    // Convert to Drive-compatible object
    toJSON() {
        return {
            id: this.id,
            title: this.title,
            content: this.content,
            date: this.date.toISOString(),
            location: this.location,
            tags: this.tags,
        };
    }
}
