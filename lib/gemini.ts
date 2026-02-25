import { RecipeData } from './types';

const getApiKey = (): string => {
    // Expo public env vars
    return (
        (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_GEMINI_API_KEY) ||
        ''
    );
};

interface GeminiResponse {
    candidates?: Array<{
        content?: {
            parts?: Array<{ text?: string }>;
        };
    }>;
}

async function callGemini(prompt: string): Promise<string> {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error('No Gemini API key configured');

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    responseMimeType: 'application/json',
                },
            }),
        }
    );

    if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
    }

    const data: GeminiResponse = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

/**
 * Process a voice transcription into structured recipe data.
 * If existing recipe data is provided, merges/updates it intelligently.
 */
export async function processRecipeTranscription(
    transcript: string,
    currentRecipe?: RecipeData
): Promise<RecipeData> {
    const existingContext = currentRecipe
        ? `\nCurrent recipe data:\nIngredients: ${currentRecipe.ingredients.filter(Boolean).join(', ')}\nSteps: ${currentRecipe.steps.filter(Boolean).join('; ')}\n\nMerge or update the existing recipe with the new information from the transcript. Keep existing items that aren't contradicted.`
        : '';

    const prompt = `You are a recipe parser. Extract or update recipe information from this voice transcription.
${existingContext}
Transcript: "${transcript}"

Return a JSON object with exactly this structure:
{
  "ingredients": ["ingredient 1", "ingredient 2", ...],
  "steps": ["step 1 description", "step 2 description", ...]
}

Rules:
- Each ingredient should include quantity if mentioned (e.g., "2 cups flour")
- Each step should be a clear, concise instruction
- If the transcript mentions modifications to existing ingredients or steps, update them
- If the transcript is unclear, make reasonable assumptions
- Always return valid JSON`;

    try {
        const result = await callGemini(prompt);
        const parsed = JSON.parse(result);
        return {
            ingredients: Array.isArray(parsed.ingredients) ? parsed.ingredients : [],
            steps: Array.isArray(parsed.steps) ? parsed.steps : [],
        };
    } catch (err) {
        console.error('Gemini recipe processing failed:', err);
        // Fallback: return existing + raw transcript as a step
        return {
            ingredients: currentRecipe?.ingredients || [],
            steps: [...(currentRecipe?.steps || []), transcript],
        };
    }
}

/**
 * Check if Gemini API is available
 */
export function isGeminiAvailable(): boolean {
    return !!getApiKey();
}
