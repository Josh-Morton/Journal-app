import { Model } from "@nozbe/watermelondb";
import { field, text, json, readonly, date } from "@nozbe/watermelondb/decorators";

interface NoteItem {
    text: string;
    checked: boolean;
}

export class Note extends Model {
    static table = "notes";

    @text("title") title!: string;
    @json("items", (raw: any) => raw || []) items!: NoteItem[];
    @text("color") color?: string;
    @json("tags", (raw: any) => raw || []) tags!: string[];
    @field("synced") synced!: boolean;
    @text("drive_file_id") driveFileId?: string;
    @readonly @date("created_at") createdAt!: Date;
    @readonly @date("updated_at") updatedAt!: Date;

    get fileName(): string {
        return `note_${this.id}.json`;
    }

    toJSON() {
        return {
            id: this.id,
            title: this.title,
            items: this.items,
            color: this.color,
            tags: this.tags,
        };
    }
}

