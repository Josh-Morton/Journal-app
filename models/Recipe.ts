import { Model } from "@nozbe/watermelondb";
import { field, text, json, readonly, date } from "@nozbe/watermelondb/decorators";

export class Recipe extends Model {
    static table = "recipes";

    @text("title") title!: string;
    @json("ingredients", (raw) => raw || []) ingredients!: string[];
    @json("instructions", (raw) => raw || []) instructions!: string[];
    @json("tags", (raw) => raw || []) tags!: string[];
    @field("synced") synced!: boolean;
    @text("drive_file_id") driveFileId?: string;
    @readonly @date("created_at") createdAt!: Date;
    @readonly @date("updated_at") updatedAt!: Date;

    get fileName(): string {
        const safeName = this.title.toLowerCase().replace(/[^a-z0-9]/g, "_");
        return `recipe_${safeName}_${this.id}.json`;
    }

    toJSON() {
        return {
            id: this.id,
            title: this.title,
            ingredients: this.ingredients,
            instructions: this.instructions,
            tags: this.tags,
        };
    }
}
