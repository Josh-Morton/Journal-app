export type EntryType = 'note' | 'journal' | 'recipe';

export interface RecipeData {
  ingredients: string[];
  steps: string[];
}

export interface Entry {
  id: string;
  type: EntryType;
  title: string;
  content: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
  recipeData?: RecipeData;
}
