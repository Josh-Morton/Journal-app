import { appSchema, tableSchema } from "@nozbe/watermelondb";

export const schema = appSchema({
    version: 1,
    tables: [
        tableSchema({
            name: "journals",
            columns: [
                { name: "title", type: "string" },
                { name: "content", type: "string" },
                { name: "date", type: "number" }, // timestamp
                { name: "location", type: "string", isOptional: true },
                { name: "tags", type: "string" }, // JSON array as string
                { name: "synced", type: "boolean" },
                { name: "drive_file_id", type: "string", isOptional: true },
                { name: "created_at", type: "number" },
                { name: "updated_at", type: "number" },
            ],
        }),
        tableSchema({
            name: "notes",
            columns: [
                { name: "title", type: "string" },
                { name: "content", type: "string" }, // free text
                { name: "items", type: "string" }, // JSON array of {text, checked}
                { name: "color", type: "string", isOptional: true },
                { name: "tags", type: "string" }, // JSON array as string
                { name: "synced", type: "boolean" },
                { name: "drive_file_id", type: "string", isOptional: true },
                { name: "created_at", type: "number" },
                { name: "updated_at", type: "number" },
            ],
        }),
        tableSchema({
            name: "recipes",
            columns: [
                { name: "title", type: "string" },
                { name: "ingredients", type: "string" }, // JSON array
                { name: "instructions", type: "string" }, // JSON array
                { name: "tags", type: "string" }, // JSON array as string
                { name: "synced", type: "boolean" },
                { name: "drive_file_id", type: "string", isOptional: true },
                { name: "created_at", type: "number" },
                { name: "updated_at", type: "number" },
            ],
        }),
    ],
});
