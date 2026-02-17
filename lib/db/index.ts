import { Database } from "@nozbe/watermelondb";
import LokiJSAdapter from "@nozbe/watermelondb/adapters/lokijs";
import { schema } from "./schema";
import { Journal } from "../../models/Journal";
import { Note } from "../../models/Note";
import { Recipe } from "../../models/Recipe";

// Use LokiJS adapter for web/Expo compatibility
const adapter = new LokiJSAdapter({
    schema,
    useWebWorker: false,
    useIncrementalIndexedDB: true,
});

export const database = new Database({
    adapter,
    modelClasses: [Journal, Note, Recipe],
});

// Helper hooks for accessing collections
export function useJournals() {
    return database.get<Journal>("journals");
}

export function useNotes() {
    return database.get<Note>("notes");
}

export function useRecipes() {
    return database.get<Recipe>("recipes");
}
