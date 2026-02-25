import nlp from 'compromise';

const FILLER_WORDS = [
    'um', 'umm', 'uh', 'uhh', 'ah', 'ahh', 'er', 'err',
    'like', 'you know', 'i mean', 'basically', 'actually',
    'literally', 'right', 'okay so', 'so yeah', 'yeah',
    'sort of', 'kind of',
];

// Fallback regex for aggressive filler removal
const FILLER_PATTERNS = FILLER_WORDS.map(
    (filler) => new RegExp(`\\b${filler.replace(/\s+/g, '\\s+')}\\b[,]?\\s*`, 'gi')
);

/**
 * Clean transcript text: remove fillers, fix capitalization, format sentences using Compromise.
 * Note: Recipe extraction was moved back to Gemini, so this only handles basic NLP structuring.
 */
export function cleanTranscript(raw: string, context?: 'note' | 'journal' | 'recipe'): string {
    let text = raw;

    // 1. Regex filler wipe (fast baseline)
    for (const pattern of FILLER_PATTERNS) {
        text = text.replace(pattern, ' ');
    }
    text = text.replace(/\s{2,}/g, ' ').trim();
    if (!text) return '';

    // 2. Compromise document parsing (offline NLP)
    const doc = nlp(text);

    // Ensure proper capitalization and spacing
    doc.sentences().toTitleCase();

    let result = doc.text();

    // 3. Contextual formatting rules
    if (context === 'note') {
        // If the voice note explicitly starts with "list" or "bullet", convert into a Markdown list
        if (result.toLowerCase().startsWith('list ') || result.toLowerCase().startsWith('bullet ')) {
            result = result.replace(/^(list|bullet( points)?)\s*/i, '');
            // Split by "and" or periods if it sounds like a list
            const fragments = result.split(/(\band\b|\bnext\b|\balso\b|\.)/i)
                .map(s => s.trim())
                .filter(s => s.length > 2 && !['and', 'next', 'also', '.'].includes(s.toLowerCase()));

            if (fragments.length > 0) {
                // If using RichEditor later, this might just represent standard text that the user 
                // can highlight and hit the bullet button for, but we'll try basic HTML bullets just in case
                // or just leave it as raw text that is structured nicely.
                return fragments.map(f => `• ${f.charAt(0).toUpperCase() + f.slice(1)}`).join('\n');
            }
        }
    }

    // Ensure text ends with a period if no terminal punctuation
    if (result.length > 0 && !/[.!?]$/.test(result)) {
        result += '.';
    }

    return result;
}
